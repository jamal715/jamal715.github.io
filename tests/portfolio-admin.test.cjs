const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto,createHash}=require('node:crypto');
const {File}=require('node:buffer');
const profile=JSON.parse(fs.readFileSync('profile.json'));
const code=fs.readFileSync('supabase/functions/portfolio-admin/index.ts','utf8');
const initial='11111111-1111-4111-8111-111111111111';
function server(options={}){
 let handler,row={document:structuredClone(profile),revision:initial},writes=0,uploads=[];
 const fetch=async(url,init={})=>{
  const method=init.method||'GET';let result=null;
  if(url.includes('portfolio_login_attempts'))result=method==='GET'?Array.from({length:options.limited?201:0},()=>({ip_hash:'other'})):null;
  else if(url.includes('publication_admin_config'))result=[{secret_hash_v2:createHash('sha256').update('test-only-password').digest('hex')}];
  else if(url.includes('/storage/')){uploads.push(init.body);return new Response('{}',{status:200});}
  else if(url.includes('portfolio_profile')){
   assert.equal(method,'PATCH');writes++;
   if(url.endsWith(row.revision)){row={...row,...JSON.parse(init.body)};result=[row];}else result=[];
  }else throw Error('Unexpected request '+url);
  return new Response(result===null?null:JSON.stringify(result),{status:result===null?204:200});
 };
 vm.runInNewContext(code,{Deno:{env:{get:n=>n==='SUPABASE_URL'?'https://test.supabase.co':'server-only'},serve:f=>handler=f},fetch,crypto:webcrypto,TextEncoder,TextDecoder,Response,File});
 const call=(data,origin='https://jamal715.github.io')=>handler(new Request('https://test.supabase.co/functions/v1/portfolio-admin',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)}));
 return {call,handler,get row(){return row},get writes(){return writes},uploads};
}
test('rejects unauthenticated and incorrect-password writes',async()=>{
 const s=server();for(const secret of ['', 'wrong'])assert.equal((await s.call({secret,action:'publish',document:profile,revision:initial})).status,401);assert.equal(s.writes,0);
});
test('password sign-in and full profile publish round trip; stale revision is rejected',async()=>{
 const s=server(),secret='test-only-password';assert.equal((await s.call({secret,action:'connect'})).status,200);
 const document={...profile,headline:'Updated headline',photoCrop:{zoom:1.7,x:38,y:63,fit:'cover'}};
 const r=await s.call({secret,action:'publish',document,revision:initial});assert.equal(r.status,200);const result=await r.json();assert.equal(result.document.headline,document.headline);assert.deepEqual(result.document.photoCrop,document.photoCrop);assert.notEqual(result.revision,initial);
 assert.equal((await s.call({secret,action:'publish',document:profile,revision:initial})).status,409);assert.equal(s.row.document.headline,document.headline);
});
test('blocks invalid shape, hostile origin and brute-force attempts',async()=>{
 assert.equal((await server().call({secret:'test-only-password',action:'publish',document:{name:'X'},revision:initial})).status,400);
 assert.equal((await server().call({secret:'test-only-password',action:'connect'},'https://untrusted.example')).status,403);
 assert.equal((await server({limited:true}).call({secret:'test-only-password',action:'connect'})).status,429);
});
test('uploads original CV bytes and rejects a disguised file',async()=>{
 const s=server();const bytes=fs.readFileSync('assets/Jamal-Nasir-CV.pdf');const form=new FormData();form.append('action','upload');form.append('secret','test-only-password');form.append('kind','cv');form.append('file',new File([bytes],'cv.pdf',{type:'application/pdf'}));
 const r=await s.handler(new Request('https://test.supabase.co',{method:'POST',body:form}));assert.equal(r.status,200);assert.deepEqual(Buffer.from(s.uploads[0]),bytes);assert.match((await r.json()).url,/cv-[a-f0-9]{64}\.pdf$/);
 form.set('file',new File(['not a pdf'],'fake.pdf',{type:'application/pdf'}));assert.equal((await s.handler(new Request('https://test.supabase.co',{method:'POST',body:form}))).status,400);
});
