(async()=>{
 const root=document.getElementById('profile');
 const preview=new URLSearchParams(location.search).has('preview');
 let revision=null;
 function apply(data){root.innerHTML=renderProfile(data);document.title=data.name+' | Research, Models & Practice';}
 async function refresh(){try{const row=await ProfileStore.read();if(row.revision!==revision){apply(row.document);revision=row.revision;}}catch(e){console.warn('Using the published profile snapshot.');}}
 if(preview){
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='profile-preview'){apply(e.data.profile);const assets=e.data.assets||{};for(const kind of ['photo','cv']){const url=assets[kind];if(typeof url==='string'&&url.startsWith('blob:'+location.origin+'/')){const node=root.querySelector(kind==='photo'?'.portrait img':'.download');if(node)node[kind==='photo'?'src':'href']=url;}}}});
  parent.postMessage({type:'profile-ready'},location.origin);
 }else{
  await refresh();
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  setInterval(()=>{if(!document.hidden)refresh();},30000);
 }
})();
