const customerStyles=document.createElement('link');
customerStyles.rel='stylesheet';
customerStyles.href='customer.css';
document.head.appendChild(customerStyles);

const SUPABASE_URL='https://bkbzrrvjpogtrhlkixll.supabase.co';
const SUPABASE_KEY='sb_publishable_HIOdjN7r7wL9WABzHjBWnQ_PMQH0HM-';
const CONTACT_EMAIL='j.nasir25260@gmail.com';
const apiHeaders={'apikey':SUPABASE_KEY,'Content-Type':'application/json'};

const year=document.getElementById('year');
if(year) year.textContent=new Date().getFullYear();

const menuBtn=document.getElementById('menuBtn');
const nav=document.querySelector('.nav');
menuBtn?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting)e.target.classList.add('visible');
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const stars=[...document.querySelectorAll('#stars button')];
const rating=document.getElementById('rating');
function paint(v){
  stars.forEach(s=>s.classList.toggle('active',Number(s.dataset.value)<=v));
  if(rating) rating.value=v;
}
paint(5);
stars.forEach(s=>s.addEventListener('click',()=>paint(Number(s.dataset.value))));

const avatarOptions=[...document.querySelectorAll('.avatar-option')];
avatarOptions.forEach(o=>o.addEventListener('click',()=>{
  avatarOptions.forEach(x=>x.classList.remove('selected'));
  o.classList.add('selected');
}));

function esc(s=''){
  return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function setFormStatus(form,msg,ok=true){
  let el=form.querySelector('.form-status');
  if(!el){
    el=document.createElement('div');
    el.className='form-status';
    form.appendChild(el);
  }
  el.textContent=msg;
  el.classList.toggle('error',!ok);
  el.classList.toggle('success',ok);
}

async function notifyByEmail(fields,subject){
  const body={...fields,_subject:subject,_template:'table',_captcha:'false'};
  const r=await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`,{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(body)
  });
  if(!r.ok) throw new Error('Email notification failed');
  const result=await r.json().catch(()=>({success:true}));
  if(result.success===false) throw new Error(result.message||'Email notification failed');
  return result;
}

async function loadReviews(){
  const box=document.querySelector('.review-placeholder');
  if(!box)return;
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/quantora_reviews?select=name,organization,rating,avatar,review,created_at&approved=eq.true&order=approved_at.desc.nullslast,created_at.desc&limit=6`,{headers:apiHeaders});
    if(!r.ok) throw new Error('Could not load reviews');
    const reviews=await r.json();
    if(!reviews.length)return;
    box.innerHTML=`<div class="approved-reviews">${reviews.map(x=>`<article class="approved-review"><div class="review-head"><span class="avatar ${esc(x.avatar)}"><i></i></span><div><strong>${esc(x.name)}</strong>${x.organization?`<small>${esc(x.organization)}</small>`:''}</div></div><div class="review-stars">${'★'.repeat(x.rating)}${'☆'.repeat(5-x.rating)}</div><p>${esc(x.review)}</p></article>`).join('')}</div>`;
  }catch(e){
    console.warn(e);
  }
}
loadReviews();

document.getElementById('reviewForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const button=form.querySelector('button[type="submit"]');
  const payload={
    name:document.getElementById('reviewName').value.trim(),
    organization:document.getElementById('reviewOrg').value.trim()||null,
    rating:Number(document.getElementById('rating').value),
    avatar:document.querySelector('input[name="avatar"]:checked')?.value||'ocean',
    review:document.getElementById('reviewText').value.trim(),
    consent:document.getElementById('reviewConsent').checked,
    approved:false
  };

  button.disabled=true;
  button.textContent='Submitting…';
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/quantora_reviews`,{
      method:'POST',
      headers:{...apiHeaders,'Prefer':'return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!r.ok)throw new Error(await r.text());

    notifyByEmail({
      Name:payload.name,
      Organization:payload.organization||'—',
      Rating:`${payload.rating}/5`,
      Review:payload.review
    },`New QuantOra review — ${payload.name}`).catch(err=>console.warn(err));

    form.reset();
    paint(5);
    avatarOptions.forEach((x,i)=>x.classList.toggle('selected',i===0));
    setFormStatus(form,'Thank you — your review is waiting for approval.');
  }catch(err){
    console.error(err);
    setFormStatus(form,'Could not submit the review. Please try again.',false);
  }finally{
    button.disabled=false;
    button.textContent='Submit review';
  }
});

document.getElementById('requestForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const button=form.querySelector('button[type="submit"]');
  const payload={
    name:document.getElementById('name').value.trim(),
    email:document.getElementById('email').value.trim(),
    need:document.getElementById('need').value,
    problem:document.getElementById('problem').value.trim(),
    budget:null,
    timeline:document.getElementById('timeline').value.trim()||null,
    status:'new'
  };

  button.disabled=true;
  button.textContent='Sending…';
  let saved=false;
  let emailed=false;

  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/quantora_requests`,{
      method:'POST',
      headers:{...apiHeaders,'Prefer':'return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!r.ok) throw new Error(await r.text());
    saved=true;
  }catch(err){
    console.error('Database save failed',err);
  }

  try{
    await notifyByEmail({
      Name:payload.name,
      Email:payload.email,
      Request:payload.need,
      Problem:payload.problem,
      Timeline:payload.timeline||'Not specified'
    },`New QuantOra request — ${payload.need}`);
    emailed=true;
  }catch(err){
    console.error('Email notification failed',err);
  }

  if(saved||emailed){
    form.reset();
    setFormStatus(form,'Thanks — your request has been sent. We’ll get back to you soon.');
  }else{
    setFormStatus(form,'Could not send the request. Please use one of the contact buttons.',false);
  }

  button.disabled=false;
  button.innerHTML='Send Request <span>↗</span>';
});

const canvas=document.getElementById('network');
const ctx=canvas?.getContext('2d');
let pts=[];
function resize(){
  if(!canvas)return;
  canvas.width=innerWidth*devicePixelRatio;
  canvas.height=820*devicePixelRatio;
  canvas.style.height='820px';
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  pts=Array.from({length:Math.min(70,Math.floor(innerWidth/18))},()=>({
    x:Math.random()*innerWidth,
    y:Math.random()*760,
    vx:(Math.random()-.5)*.18,
    vy:(Math.random()-.5)*.18
  }));
}
function draw(){
  if(!ctx)return;
  ctx.clearRect(0,0,innerWidth,820);
  for(const p of pts){
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>innerWidth)p.vx*=-1;
    if(p.y<0||p.y>800)p.vy*=-1;
    ctx.beginPath();ctx.arc(p.x,p.y,1.4,0,Math.PI*2);
    ctx.fillStyle='rgba(0,77,115,.32)';ctx.fill();
  }
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
    const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<125){
      ctx.strokeStyle=`rgba(0,77,115,${.09*(1-d/125)})`;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
  }
  requestAnimationFrame(draw);
}
window.addEventListener('resize',resize);
resize();
draw();