/* GitHub publishing: credentials are held only in this page's memory. */
(function(root){
 const REPO='jamal715/jamal715.github.io',API='https://api.github.com/repos/'+REPO;
 const decode=b64=>new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g,'')),c=>c.charCodeAt(0)));
 const encode=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
 function client(token,fetcher=fetch){return async(path,method='GET',body)=>{
  const r=await fetcher(API+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store'});
  if(!r.ok){
   let detail={};try{detail=await r.json();}catch(e){}
   const reason=String(detail.message||'').split(token).join('[redacted]').slice(0,500);
   const required=r.headers?.get('x-accepted-github-permissions');
   const rateLimited=r.status===429||r.headers?.get('x-ratelimit-remaining')==='0'||/rate limit/i.test(reason);
   let advice='Your draft has been kept.';
   if(rateLimited)advice='GitHub has rate-limited requests. Wait before trying again; changing token permissions will not help.';
   else if(r.status===401)advice='The token is invalid, expired or revoked. Reconnect with a valid token.';
   else if(r.status===403||r.status===404)advice='Check this token’s resource owner is jamal715, Repository access is Only select repositories → jamal715.github.io, and Contents is Read and write. Public repositories alone grants read-only access.';
   else if(r.status===409)advice='The repository changed during publication. Back up your draft before reloading published content.';
   else if(r.status===422)advice='GitHub could not accept this update. Check the reason above and repository rules. Your draft has been kept.';
   const error=new Error(`GitHub ${r.status} at ${method} ${path.split('?')[0]}: ${reason||r.statusText||'Request failed'}. ${required?'Required permission: '+required+'. ':''}${advice}`);
   error.status=r.status;throw error;
  }
  return r.status===204?null:r.json();
 };}
 async function verifyWriteAccess(token,fetcher=fetch){
  const api=client(token,fetcher);
  await api('/git/ref/heads/main');
  // A tiny unattached Git object verifies Contents write access. It changes no file or branch.
  await api('/git/blobs','POST',{content:'Portfolio editor write-access check\n',encoding:'utf-8'});
  return true;
 }
 async function publish({token,profile,baseline,assets,render,fetcher=fetch,onProgress=()=>{}}){
 if(!token)throw Error('Connect GitHub before publishing.');
 const api=client(token,fetcher);onProgress('Checking the latest published version…');
 const head=await api('/git/ref/heads/main'),sha=head.object.sha;
 const commit=await api('/git/commits/'+sha);
 const current=JSON.parse(decode((await api('/contents/profile.json?ref='+sha)).content));
 // Ignore editor publication metadata when comparing content.
 const clean=d=>{const x=structuredClone(d);delete x._publication;return JSON.stringify(x);};
 if(clean(current)!==clean(baseline))throw Error('The published profile has changed since this draft was loaded. Download your draft as a backup, reload published content, then import or reapply your changes. Nothing was overwritten.');
 const next=structuredClone(profile),tree=[];
 for(const [kind,asset] of Object.entries(assets)){
  if(!asset||next[kind]!==asset.path)continue;
  onProgress('Uploading '+(kind==='photo'?'photo':'CV')+'…');
  const bytes=new Uint8Array(await asset.file.arrayBuffer());
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,16);
  const ext=asset.path.split('.').pop();
  const path='assets/'+(kind==='photo'?'profile':'Jamal-Nasir-CV')+'-'+hash+'.'+ext;
  const blob=await api('/git/blobs','POST',{content:encode(bytes),encoding:'base64'});
  tree.push({path,mode:'100644',type:'blob',sha:blob.sha});next[kind]=path;
 }
 next._publication=crypto.randomUUID();
 const raw=decode((await api('/contents/index.html?ref='+sha)).content);
 if(!raw.includes('<!-- PROFILE START -->')||!raw.includes('<!-- PROFILE END -->'))throw Error('The website template changed. Your draft is safe; publishing needs a template update.');
 const html=raw.replace(/<!-- PROFILE START -->[\s\S]*?<!-- PROFILE END -->/,'<!-- PROFILE START -->'+render(next)+'<!-- PROFILE END -->');
 tree.push({path:'profile.json',mode:'100644',type:'blob',content:JSON.stringify(next,null,2)+'\n'},{path:'index.html',mode:'100644',type:'blob',content:html});
 onProgress('Saving your changes to GitHub…');
 const t=await api('/git/trees','POST',{base_tree:commit.tree.sha,tree});
 const c=await api('/git/commits','POST',{message:'Update profile from website editor',tree:t.sha,parents:[sha]});
 // A concurrent update cannot be silently overwritten.
 await api('/git/refs/heads/main','PATCH',{sha:c.sha,force:false});
 return {profile:next,commit:c.sha};
 }
 const exported={publish,client,verifyWriteAccess};if(typeof module!=='undefined')module.exports=exported;else root.ProfilePublisher=exported;
})(typeof window!=='undefined'?window:globalThis);
