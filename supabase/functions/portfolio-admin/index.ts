// This function uses the existing research editor password as custom authentication.
// Privileged keys and password hashes stay exclusively on the server.
const base = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const site = 'https://jamal715.github.io';
const cors = {'Access-Control-Allow-Origin':site,'Access-Control-Allow-Headers':'content-type,apikey','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
const headers = {apikey:key,Authorization:`Bearer ${key}`};
const reply = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const hex = bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const digest = async value=>hex(await crypto.subtle.digest('SHA-256',typeof value==='string'?new TextEncoder().encode(value):value));
async function db(path,options={}) {
 const response=await fetch(`${base}/rest/v1/${path}`,{...options,headers:{...headers,'Content-Type':'application/json',...options.headers}});
 if(!response.ok)throw Error('Storage unavailable. Your draft is safe; please retry.');
 const text=await response.text();return text?JSON.parse(text):null;
}
function validProfile(d) {
 const strings=(o,keys)=>o&&typeof o==='object'&&keys.every(k=>typeof o[k]==='string'&&o[k].length<=20000);
 if(!strings(d,['name','headline','intro','current','photo','cv','email','linkedin','github','research','contact'])||!d.name.trim())return false;
 const array=(v,check)=>Array.isArray(v)&&v.length<=200&&v.every(check);
 const str=x=>typeof x==='string'&&x.length<=20000;
 return array(d.highlights,str)&&array(d.experience,x=>strings(x,['role','organization','dates','fields'])&&array(x.points,str))&&array(d.projects,x=>strings(x,['title','category','description','methods','status'])&&array(x.links,l=>strings(l,['label','url'])))&&array(d.education,x=>strings(x,['degree','institution','year']))&&array(d.skills,x=>strings(x,['area','detail']))&&array(d.elsewhere,x=>strings(x,['title','description','url']))&&(!d.photoCrop||(Number.isFinite(d.photoCrop.zoom)&&d.photoCrop.zoom>=1&&d.photoCrop.zoom<=3&&['x','y'].every(k=>Number.isFinite(d.photoCrop[k])&&d.photoCrop[k]>=0&&d.photoCrop[k]<=100)&&['cover','contain'].includes(d.photoCrop.fit)));
}
Deno.serve(async request=>{
 if(request.headers.get('origin')&&request.headers.get('origin')!==site)return reply({error:'Origin not allowed.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
 try {
  if(Number(request.headers.get('content-length'))>22*1024*1024)return reply({error:'File is too large.'},413);
  const multipart=request.headers.get('content-type')?.includes('multipart/form-data');
  const body=multipart?await request.formData():await request.json();
  const value=k=>multipart?body.get(k):body[k];
  const secret=value('secret');
  if(typeof secret!=='string'||!secret||secret.length>1024)return reply({error:'Enter your research editor password.'},401);
  const ip=await digest((request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim());
  const since=new Date(Date.now()-15*60*1000).toISOString();
  await db(`portfolio_login_attempts?created_at=lt.${since}`,{method:'DELETE'});
  const attempts=await db(`portfolio_login_attempts?select=ip_hash&limit=201`);
  if(attempts.length>=200||attempts.filter(a=>a.ip_hash===ip).length>=20)return reply({error:'Too many attempts. Try again in 15 minutes.'},429);
  await db('portfolio_login_attempts',{method:'POST',body:JSON.stringify({ip_hash:ip})});
  const config=await db('publication_admin_config?id=eq.1&select=secret_hash_v2');
  const expected=config[0]?.secret_hash_v2||'';
  const supplied=await digest(secret);
  let different=expected.length^supplied.length;
  for(let i=0;i<supplied.length;i++)different|=supplied.charCodeAt(i)^(expected.charCodeAt(i)||0);
  if(different)return reply({error:'Incorrect password. Use your research editor password.'},401);
  await db(`portfolio_login_attempts?ip_hash=eq.${ip}`,{method:'DELETE'});
  const action=value('action');
  if(action==='connect')return reply({ok:true});
  if(action==='upload'){
   const file=value('file'),kind=value('kind');
   if(!(file instanceof File)||!['photo','cv'].includes(kind))return reply({error:'Choose a photo or PDF.'},400);
   if(file.size>20*1024*1024||!file.size)return reply({error:'Choose a file under 20 MB.'},400);
   const bytes=new Uint8Array(await file.arrayBuffer());
   const pdf=new TextDecoder().decode(bytes.slice(0,5))==='%PDF-';
   const png=[137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x);
   const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
   if(kind==='cv'?!pdf:!png&&!jpg)return reply({error:'Choose a valid JPG, PNG or PDF.'},400);
   const extension=kind==='cv'?'pdf':png?'png':'jpg';
   const path=`${kind}-${await digest(bytes)}.${extension}`;
   const response=await fetch(`${base}/storage/v1/object/portfolio-assets/${path}`,{method:'POST',headers:{...headers,'Content-Type':kind==='cv'?'application/pdf':png?'image/png':'image/jpeg','x-upsert':'true','Cache-Control':'max-age=31536000'},body:bytes});
   if(!response.ok)throw Error('File upload failed. Your draft is safe; please retry.');
   return reply({url:`${base}/storage/v1/object/public/portfolio-assets/${path}`});
  }
  if(action==='publish'){
   const document=value('document'),revision=value('revision');
   if(!validProfile(document)||JSON.stringify(document).length>1000000)return reply({error:'Check your profile fields before publishing.'},400);
   if(typeof revision!=='string'||!/^[0-9a-f-]{36}$/.test(revision))return reply({error:'Reload the published version before publishing.'},409);
   const next=crypto.randomUUID();document._publication=next;
   const rows=await db(`portfolio_profile?id=eq.1&revision=eq.${revision}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({document,revision:next,updated_at:new Date().toISOString()})});
   if(!rows.length)return reply({error:'The website changed in another tab. Export your draft, then reload the published version before merging your changes.'},409);
   return reply(rows[0]);
  }
  return reply({error:'Unknown action.'},400);
 }catch(error){return reply({error:error instanceof SyntaxError?'Invalid request.':error.message||'Could not save. Please retry.'},500);}
});
