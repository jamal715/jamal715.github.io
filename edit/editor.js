'use strict';
let profile, published, previewTimer, githubToken='', publishing=false, pendingFiles=0, liveCheck;
const DRAFT='jamal-profile-draft-v2', history=[], assets={}, assetURLs={};
const $=id=>document.getElementById(id);
const form=$('editor-form'), status=$('editor-status'), frame=$('preview-frame');
const titles={identity:'Introduction & links',experience:'Work experience',projects:'Projects & portfolio',education:'Education',skills:'Skills & methods',elsewhere:'Other links',highlights:'Evidence & highlights',contact:'Contact message'};
const labelNames={cv:'CV file path',photo:'Photo file path',intro:'Introduction',current:'Current role',fields:'Subjects & sectors',points:'Experience bullets',methods:'Methods & tools',status:'Project status or year',url:'Link URL'};
const templates={experience:{role:'New role',organization:'',dates:'',fields:'',points:['']},projects:{title:'New project',category:'',description:'',methods:'',status:'',links:[]},education:{degree:'',institution:'',year:''},skills:{area:'',detail:''},elsewhere:{title:'',description:'',url:'https://'},links:{label:'',url:'https://'}};
const identityKeys=['name','headline','intro','current','photo','cv','email','linkedin','github','research'];
const label=k=>labelNames[k]||k.replace(/_/g,' ').replace(/^./,s=>s.toUpperCase());
const message=text=>status.textContent=text;
form.addEventListener('submit',e=>e.preventDefault());
function get(path){return path.reduce((v,k)=>v[k],profile);}
function checkpoint(){history.push(JSON.stringify(profile));if(history.length>50)history.shift();$('undo-button').disabled=false;}
function set(path,value){let v=profile;path.slice(0,-1).forEach(k=>v=v[k]);v[path.at(-1)]=value;save();}
function save(){try{localStorage.setItem(DRAFT,JSON.stringify(profile));message('Draft saved in this browser. Select Publish to website to make it live.');}catch(e){message('Browser storage unavailable. Download your changes before leaving this page.');}if(!publishing)$('publish-status').textContent='Unpublished draft changes. Select Publish to website when ready.';updateCrop();clearTimeout(previewTimer);previewTimer=setTimeout(sendPreview,150);}
function validProfile(d){
 const strings=(o,keys)=>o&&typeof o==='object'&&keys.every(k=>typeof o[k]==='string');
 if(!strings(d,[...identityKeys,'contact']))return false;
 if(!Array.isArray(d.highlights)||!d.highlights.every(x=>typeof x==='string'))return false;
 return Object.entries(templates).filter(([k])=>k!=='links').every(([k,t])=>Array.isArray(d[k])&&d[k].every(x=>strings(x,Object.keys(t).filter(p=>!Array.isArray(t[p])))&&(k!=='experience'||Array.isArray(x.points)&&x.points.every(p=>typeof p==='string'))&&(k!=='projects'||Array.isArray(x.links)&&x.links.every(l=>strings(l,['label','url'])))));
}
function button(text,fn,cls='secondary'){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;b.onclick=fn;return b;}
function inputField(parent,key,path,value){const l=document.createElement('label');l.className='form-field';const s=document.createElement('span');s.textContent=label(key);const multiline=['intro','headline','description','detail','contact'].includes(key)||String(value).length>100||path.includes('points');const el=document.createElement(multiline?'textarea':'input');if(!multiline)el.type='text';el.value=value;el.addEventListener('focus',checkpoint);el.addEventListener('input',()=>set(path,el.value));l.append(s,el);parent.append(l);}
function fields(parent,obj,path){for(const [key,value] of Object.entries(obj)){if(Array.isArray(value))arrayFields(parent,key,[...path,key]);else if(value!==null&&typeof value==='object')fields(parent,value,[...path,key]);else inputField(parent,key,[...path,key],value);}}
function arrayFields(parent,key,path){
 const box=document.createElement('div');if(path.length>1)box.className='array-nested';const h=document.createElement('h3');h.className='group-title';h.textContent=label(key);box.append(h);
 get(path).forEach((item,i)=>{const row=document.createElement('div');row.className='array-item';const top=document.createElement('div');top.className='array-top';const name=document.createElement('strong');name.textContent=(typeof item==='object'&&(item.role||item.title||item.degree||item.area||item.label))||label(key)+' '+(i+1);
 const controls=document.createElement('div');controls.className='row-controls';
 for(const [text,delta] of [['Move up',-1],['Move down',1]]){const b=button(text,()=>{checkpoint();const list=get(path);[list[i],list[i+delta]]=[list[i+delta],list[i]];save();renderForm();});b.disabled=i+delta<0||i+delta>=get(path).length;controls.append(b);}
 controls.append(button('Remove',()=>{checkpoint();get(path).splice(i,1);save();renderForm();}));top.append(name,controls);row.append(top);if(typeof item==='object')fields(row,item,[...path,i]);else inputField(row,'Text',[...path,i],item);box.append(row);});
 box.append(button('Add '+(key==='points'?'bullet':key==='links'?'link':'item'),()=>{checkpoint();get(path).push(templates[key]?structuredClone(templates[key]):'');save();renderForm();},'secondary add-item'));parent.append(box);
}
function renderForm(){const initial=!form.children.length;const openKeys=Array.from(form.querySelectorAll('details[open]')).map(e=>e.dataset.key);form.replaceChildren();function group(key){const d=document.createElement('details');d.dataset.key=key;d.open=initial?key==='identity':openKeys.includes(key);const s=document.createElement('summary');s.textContent=titles[key]||label(key);const c=document.createElement('div');c.className='group-content';d.append(s,c);form.append(d);return c;}const first=group('identity');identityKeys.forEach(k=>inputField(first,k,[k],profile[k]));['highlights','experience','projects','education','skills','elsewhere'].forEach(k=>arrayFields(group(k),k,[k]));inputField(group('contact'),'contact',['contact'],profile.contact);updateCrop();}
function download(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function sendPreview(){if(profile)frame.contentWindow.postMessage({type:'profile-preview',profile,assets:Object.fromEntries(Object.entries(assetURLs).filter(([kind])=>profile[kind]===assets[kind]?.path))},location.origin);}
$('preview-button').onclick=()=>{$('preview-area').hidden=false;sendPreview();$('preview-area').scrollIntoView({behavior:'smooth',block:'start'});};
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='profile-ready')sendPreview();});
$('preview-width').onchange=e=>{frame.style.width=e.target.value;};
$('download-button').onclick=()=>{if(!profile)return;download(new Blob([JSON.stringify(profile,null,2)+'\n'],{type:'application/json'}),'profile.json');message('Downloaded profile.json. Upload it to the repository root and commit to main to publish. If you selected a new photo or CV, upload its replacement file to assets too.');};
$('undo-button').onclick=()=>{if(!history.length)return;profile=JSON.parse(history.pop());$('undo-button').disabled=!history.length;save();renderForm();};
async function loadPublished(){const r=await fetch('../profile.json',{cache:'no-store'});if(!r.ok)throw Error('Cannot load published profile');const d=await r.json();if(!validProfile(d))throw Error('Invalid profile format');return d;}
// Files remain local until explicitly downloaded and committed to GitHub.
let database;
function openDB(){if(database)return database;database=new Promise((resolve,reject)=>{const request=indexedDB.open('jamal-profile-assets',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});return database;}
async function assetStore(mode,kind,value){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('files',mode);const store=tx.objectStore('files');const req=value===undefined?store.get(kind):value===null?store.delete(kind):store.put(value,kind);tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
function displayAsset(kind,asset){if(assetURLs[kind])URL.revokeObjectURL(assetURLs[kind]);if(asset){assets[kind]=asset;assetURLs[kind]=URL.createObjectURL(asset.file);$(kind+'-download').disabled=false;$(kind+'-status').textContent='Selected: '+asset.file.name+' → '+asset.path.split('/').pop();}else{delete assets[kind];delete assetURLs[kind];$(kind+'-download').disabled=true;$(kind+'-status').textContent='Using the published file.';$(kind+'-file').value='';}sendPreview();}
$('reset-button').onclick=async()=>{if(!profile||!confirm('Discard this browser draft and selected files, and reload the latest published profile?'))return;try{const latest=await loadPublished();for(const kind of ['photo','cv']){if(assets[kind]){assets[kind].path=profile[kind];await assetStore('readwrite',kind,assets[kind]).catch(()=>{});}}published=latest;profile=structuredClone(latest);history.length=0;$('undo-button').disabled=true;try{localStorage.removeItem(DRAFT);}catch(e){}renderForm();sendPreview();message('Latest published profile loaded. Local draft discarded; live content was not changed.');}catch(e){message('Could not reload published content. Your draft has been kept. Try again when you are online.');}};
$('import-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>2*1024*1024)throw Error('File too large');const d=JSON.parse(await f.text());if(!validProfile(d))throw Error('Invalid profile format');checkpoint();profile=d;save();renderForm();message('Imported profile.json into your local draft. Preview it, then download and commit to publish.');}catch(error){message('This is not a valid profile.json export. Your current draft was kept.');}e.target.value='';};
for(const kind of ['photo','cv']){
 const inp=$(kind+'-file'),btn=$(kind+'-download');
 inp.onchange=async()=>{const file=inp.files[0];if(!file||!profile)return;pendingFiles++;try{if(file.size>20*1024*1024)throw Error('Choose a file smaller than 20 MB.');const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());const pdf=String.fromCharCode(...bytes.slice(0,5))==='%PDF-';const png=[137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x);const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if(kind==='cv'?!pdf:!(jpg||png))throw Error(kind==='cv'?'Choose a valid PDF file.':'Choose a valid JPG or PNG file.');const name=kind==='cv'?'Jamal-Nasir-CV.pdf':png?'profile.png':'profile.jpg';const asset={file,path:'assets/'+name};checkpoint();profile[kind]=asset.path;if(kind==='photo')profile.photoCrop={zoom:1,x:50,y:50,fit:'cover'};displayAsset(kind,asset);save();renderForm();try{await assetStore('readwrite',kind,asset);message('File saved in this browser draft. Adjust the photo if needed, then select Publish to website.');}catch(e){message('File is ready to preview, but browser file storage is unavailable. Download it before closing this page.');}}catch(e){message(e.message);inp.value='';}finally{pendingFiles--;}};
 btn.onclick=()=>{const asset=assets[kind];if(!asset)return;download(asset.file,asset.path.split('/').pop());message('Downloaded '+asset.path.split('/').pop()+'. Upload this file to assets and profile.json to the repository root, then commit to publish.');};
}
(async()=>{try{published=await loadPublished();let draft=null;try{draft=JSON.parse(localStorage.getItem(DRAFT));}catch(e){}const restored=validProfile(draft);profile=structuredClone(restored?draft:published);renderForm();for(const id of ['preview-button','download-button','reset-button','import-file','photo-file','cv-file','publish-button'])$(id).disabled=false;for(const kind of ['photo','cv']){try{const a=await assetStore('readonly',kind);if(a){if(kind==='photo'&&restored&&!profile.photoCrop)profile.photoCrop={zoom:1,x:50,y:50,fit:'cover'};displayAsset(kind,a);}}catch(e){}}updateCrop();message(restored?'Loaded your saved browser draft. It is not published yet.':'Published content loaded. Edit a field to start a draft.');}catch(e){message('Could not load the profile. Your saved draft has not been deleted. Reload the page to retry.');}})();

function updateCrop(){
 if(!profile)return;const c=profile.photoCrop||{zoom:2.05,x:53,y:43,fit:'cover'};
 const img=$('crop-image');img.src=assetURLs.photo&&assets.photo.path===profile.photo?assetURLs.photo:new URL('../'+profile.photo,location.href).href;
 img.parentElement.style.cssText=photoStyle(profile);
 for(const key of ['zoom','x','y']){$('photo-'+key).value=c[key];$('photo-'+key+'-value').textContent=Number(c[key]).toFixed(key==='zoom'?2:0)+(key==='zoom'?'×':'%');}
 $('photo-fit').value=c.fit==='contain'?'contain':'cover';
}
for(const key of ['zoom','x','y','fit']){
 const input=$('photo-'+key);input.addEventListener('focus',()=>{if(profile)checkpoint();});input.addEventListener('input',()=>{if(!profile)return;profile.photoCrop={zoom:2.05,x:53,y:43,fit:'cover',...profile.photoCrop,[key]:key==='fit'?input.value:Number(input.value)};save();});
}
$('reset-crop').onclick=()=>{if(!profile)return;checkpoint();profile.photoCrop={zoom:1,x:50,y:50,fit:'cover'};save();};
$('connect-button').onclick=async()=>{
 const token=$('github-token').value.trim();$('github-token').value='';if(!token){$('connection-status').textContent='Enter a GitHub token to connect.';return;}
 $('connect-button').disabled=true;
 try{await ProfilePublisher.client(token)('/git/ref/heads/main');githubToken=token;$('connection-status').textContent='Connected for this tab. Select Publish to website to save your changes.';$('disconnect-button').disabled=false;$('github-connect').open=false;$('publish-status').textContent='GitHub connected. Your draft is ready to publish.';}catch(e){githubToken='';$('connection-status').textContent=e.message;}finally{$('connect-button').disabled=false;}
};
$('disconnect-button').onclick=()=>{githubToken='';$('github-token').value='';$('disconnect-button').disabled=true;$('connection-status').textContent='Disconnected. The token has been cleared from this tab.';};
function checkLive(result){
 clearInterval(liveCheck);let attempts=0;
 const check=async()=>{try{const r=await fetch('../profile.json?publication='+encodeURIComponent(result.profile._publication)+'&check='+Date.now(),{cache:'no-store'});if(r.ok&&(await r.json())._publication===result.profile._publication){clearInterval(liveCheck);$('publish-status').textContent='Live — your published changes are now on the public website.';$('published-link').href='../?v='+encodeURIComponent(result.profile._publication);return;}}catch(e){}
 if(++attempts>=30){clearInterval(liveCheck);$('publish-status').textContent='Saved to GitHub. The website update is still pending. Check GitHub Pages deployment status; your draft and commit are safe.';}};
 liveCheck=setInterval(check,5000);check();
}
$('publish-button').onclick=async()=>{
 if(!profile||publishing)return;
 if(!githubToken){$('github-connect').open=true;$('publish-status').textContent='Connect GitHub above to publish. Your draft is safely saved.';$('github-token').focus();return;}
 if(pendingFiles){$('publish-status').textContent='Your selected file is still being prepared. Try publishing again in a moment.';return;}
 const snapshot=structuredClone(profile),base=structuredClone(published);publishing=true;
 const disabled=[...document.querySelectorAll('button,input,select,textarea')].map(el=>[el,el.disabled]);disabled.forEach(([el])=>el.disabled=true);
 try{
  const result=await ProfilePublisher.publish({token:githubToken,profile:snapshot,baseline:base,assets,render:renderProfile,onProgress:text=>$('publish-status').textContent=text});
  profile=result.profile;published=structuredClone(profile);
  for(const kind of ['photo','cv']){if(assets[kind]){assets[kind].path=profile[kind];await assetStore('readwrite',kind,assets[kind]).catch(()=>{});}}
  history.length=0;save();renderForm();sendPreview();
  $('publish-status').textContent='Saved to GitHub. Waiting for the public website to update…';checkLive(result);
 }catch(e){$('publish-status').textContent=e.message;}
 finally{publishing=false;disabled.forEach(([el,was])=>el.disabled=was);$('undo-button').disabled=!history.length;for(const kind of ['photo','cv'])$(kind+'-download').disabled=!assets[kind];}
};
