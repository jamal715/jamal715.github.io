(async()=>{
 const root=document.getElementById('profile');
 function apply(data){root.innerHTML=renderProfile(data);document.title=data.name+' | Research, Models & Practice';}
 try{const response=await fetch('profile.json',{cache:'no-store'});if(!response.ok)throw Error('Profile unavailable');apply(await response.json());}catch(e){console.warn('Using the published profile snapshot.');}
 if(new URLSearchParams(location.search).has('preview')){
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='profile-preview')apply(e.data.profile);});
  parent.postMessage({type:'profile-ready'},location.origin);
 }
})();
