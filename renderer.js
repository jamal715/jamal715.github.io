/* Shared renderer. All personal content lives in profile.json. */
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safeURL(v){const s=String(v||'');return /^(https?:\/\/|mailto:|tel:|assets\/|#)/i.test(s)?esc(s):'#';}
function photoStyle(d){
 const c=d.photoCrop||{zoom:2.05,x:53,y:43,fit:'cover'};
 const n=(v,lo,hi,fallback)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Number(v))):fallback;
 return `--photo-zoom:${n(c.zoom,1,3,1)};--photo-x:${n(c.x,0,100,50)}%;--photo-y:${n(c.y,0,100,50)}%;--photo-fit:${c.fit==='contain'?'contain':'cover'}`;
}
const DEFAULT_OFFER=[
 {audience:'Founders',detail:'Pricing, risk and forecasting models. Turning raw data into a tool your team can use. A careful second look at the numbers before you commit.'},
 {audience:'Researchers and professors',detail:'Modelling, simulation and data work in finance, energy, development and machine learning.'},
 {audience:'Institutions',detail:'Credit assessment, guarantee design, and expected credit loss and valuation models.'}
];
function renderProfile(d){
 const a=(url,label,cls='')=>`<a class="${cls}" href="${safeURL(url)}">${esc(label)}</a>`;
 const youtube=d.youtube||((d.elsewhere||[]).find(x=>/youtube\.com|youtu\.be/i.test(x.url||''))||{}).url||'';
 const contact=(()=>{const raw=String(d.phone||(String(d.contact||'').match(/\+?\d[\d\s()-]{8,}\d/)||[''])[0]);const digits=raw.replace(/\D/g,'');const message=String(d.contact||'').replace(raw&&!d.phone?raw:'\u0000','').replace(/\s+([.,])/g,'$1').trim();const display=digits.startsWith('92')&&digits.length===12?`+92 ${digits.slice(2,5)} ${digits.slice(5)}`:(raw.trim().startsWith('+')?'+':'')+digits;return {digits:digits.length>=9?digits:'',display,message};})();
 const heading=(n,title,desc='')=>`<div class="section-label"><span>${n}</span><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div>`;
 return `<section class="identity" aria-labelledby="name"><div class="identity-copy"><div class="kicker">Research · Models · Practice</div><h1 id="name">${esc(d.name)}</h1><p class="headline">${esc(d.headline)}</p><p class="intro">${esc(d.intro)}</p><p class="current">${esc(d.current)}</p><div class="linkline">${a(d.cv,'Download CV','download')}${a(d.research,'Research')}${a(d.github,'GitHub')}${a(d.linkedin,'LinkedIn')}${youtube?a(youtube,'YouTube'):''}</div></div><figure class="portrait" style="${photoStyle(d)}"><img src="${safeURL(d.photo)}" alt="Portrait" width="174" height="205"></figure></section>
 <div class="evidence">${d.highlights.map(x=>{const m=String(x).match(/^((?:[A-Z]{2,4}\s)?[€$£]?\d[\d.,]*\s?(?:million|billion|bn|mn|m|k)?\+?)\s+(.+)$/i);return m?`<div><b>${esc(m[1])}</b><span>${esc(m[2])}</span></div>`:`<div><span>${esc(x)}</span></div>`;}).join('')}</div>
 <section class="section" id="work">${heading('01','Selected work','Models, solutions, due diligence and products.')}<div class="section-body projects">${d.projects.map(x=>`<article class="project"><div class="kicker">${esc(x.category)}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><div class="project-bottom"><span>${esc(x.methods)}</span><span class="status">${esc(x.status)}</span></div>${x.links.length?`<div class="linkline">${x.links.map(l=>a(l.url,l.label)).join('')}</div>`:''}</article>`).join('')}</div></section>
 <section class="section" id="experience">${heading('02','Experience')}<div class="section-body">${d.experience.map(x=>`<article class="role"><div class="role-top"><h3>${esc(x.role)}</h3><span class="date">${esc(x.dates)}</span></div><p class="organization">${esc(x.organization)}</p><p class="fields">${esc(x.fields)}</p><ul>${x.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></article>`).join('')}</div></section>
 <section class="section" id="background">${heading('03','Foundation')}<div class="section-body foundation"><div>${d.education.map(x=>`<article class="degree"><h3>${esc(x.degree)}</h3><p>${esc(x.institution)} · ${esc(x.year)}</p></article>`).join('')}</div><dl>${d.skills.map(x=>`<dt>${esc(x.area)}</dt><dd>${esc(x.detail)}</dd>`).join('')}</dl></div></section>
 <section class="section" id="research">${heading('04','Elsewhere')}<div class="section-body elsewhere">${d.elsewhere.map(x=>`<a href="${safeURL(x.url)}"><div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div></a>`).join('')}</div></section>
 <section class="section" id="together">${heading('05','Working together')}<div class="section-body offer">${(Array.isArray(d.offer)&&d.offer.length?d.offer:DEFAULT_OFFER).map(x=>`<div><h3>${esc(x.audience)}</h3><p>${esc(x.detail)}</p></div>`).join('')}</div></section>
 <section class="section contact" id="contact">${heading('06','Let’s talk.')}<div class="section-body">${contact.message?`<p>${esc(contact.message)}</p>`:''}<dl class="contact-list"><dt>Email</dt><dd>${a('mailto:'+d.email,d.email,'email')}</dd>${contact.digits?`<dt>Phone</dt><dd>${a('tel:+'+contact.digits,contact.display)}<span class="sep">·</span>${a('https://wa.me/'+contact.digits,'WhatsApp')}</dd>`:''}${d.linkedin?`<dt>LinkedIn</dt><dd>${a(d.linkedin,'Message me on LinkedIn')}</dd>`:''}</dl></div></section>`;
}
if(typeof module!=='undefined')module.exports={renderProfile};
