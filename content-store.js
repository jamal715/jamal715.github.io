'use strict';
window.ProfileStore=(()=>{
 const url='https://bkbzrrvjpogtrhlkixll.supabase.co';
 const key='sb_publishable_HIOdjN7r7wL9WABzHjBWnQ_PMQH0HM-';
 async function read(){
  const r=await fetch(url+'/rest/v1/portfolio_profile?id=eq.1&select=document,revision,updated_at',{headers:{apikey:key},cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('Cannot reach the published profile. Please retry.');
  const rows=await r.json();if(!rows[0])throw Error('Published profile unavailable.');return rows[0];
 }
 async function request(secret,data){
  const file=data.file;
  let body;if(file){body=new FormData();Object.entries({...data,secret}).forEach(([k,v])=>body.append(k,v));}else body=JSON.stringify({...data,secret});
  const r=await fetch(url+'/functions/v1/portfolio-admin',{method:'POST',headers:{apikey:key,...(!file?{'Content-Type':'application/json'}:{})},body,signal:AbortSignal.timeout(file?120000:30000)});
  const result=await r.json().catch(()=>({error:'Could not save. Please retry.'}));if(!r.ok)throw Error(result.error||'Could not save. Please retry.');return result;
 }
 return {read,connect:secret=>request(secret,{action:'connect'}),upload:(secret,kind,file)=>request(secret,{action:'upload',kind,file}),publish:(secret,document,revision)=>request(secret,{action:'publish',document,revision})};
})();
