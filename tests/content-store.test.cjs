const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const code=fs.readFileSync('content-store.js','utf8');
function client(fetch){const context={window:{},fetch,AbortSignal,FormData};vm.runInNewContext(code,context);return context.window.ProfileStore;}
test('public reads use public key and bypass cache',async()=>{
 const s=client(async(url,init)=>{assert.match(url,/portfolio_profile/);assert.equal(init.cache,'no-store');assert.match(init.headers.apikey,/^sb_publishable_/);assert.equal(init.headers.Authorization,undefined);return new Response(JSON.stringify([{document:{name:'Jamal'},revision:'current'}]));});assert.equal((await s.read()).document.name,'Jamal');
});
test('publish sends baseline revision and reports server rejection',async()=>{
 const s=client(async(url,init)=>{const body=JSON.parse(init.body);assert.equal(body.revision,'old');assert.equal(body.action,'publish');return new Response(JSON.stringify({error:'Conflict'}),{status:409});});await assert.rejects(s.publish('test-only',{},'old'),/Conflict/);
});
