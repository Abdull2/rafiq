/* Tadaruq standalone tasbih — externalized for strict CSP. */
/* ================= storage ================= */
const store=window.TadaruqStorage||{
 async get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch{return null}},
 async set(k,v){localStorage.setItem(k,JSON.stringify(v));return v},
 async keys(p=''){return Object.keys(localStorage).filter(k=>k.startsWith(p))}
};

const escHtml=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeHttpUrl(value){
  try{const u=new URL(String(value||''),location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}
}
function normalizeCustom(items){
  if(!Array.isArray(items))return [];
  return items.slice(0,100).map((x,i)=>{
    const t=String(x?.t||'').trim().slice(0,280);if(!t)return null;
    const raw=Number(x?.n),n=Number.isFinite(raw)?Math.min(100000,Math.max(1,Math.round(raw))):33;
    return {id:String(x?.id||('import-'+i)).slice(0,80),t,n,f:String(x?.f||'').slice(0,500),src:String(x?.src||'').slice(0,300),u:safeHttpUrl(x?.u)};
  }).filter(Boolean);
}

/* ================= data ================= */
const BASE=[
 {id:'sub_hamd',t:'سُبْحَانَ اللهِ وَبِحَمْدِهِ',n:100,f:'من قالها مائة مرة في يومه حُطَّت خطاياه وإن كانت مثل زبد البحر.',src:'حديث أبي هريرة — صحيح؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/10620'},
 {id:'tahlil',t:'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',n:100,f:'ثبت في الحديث فضل قولها مائة مرة في اليوم.',src:'حديث أبي هريرة — صحيح؛ الدرر السنية',u:'https://dorar.net/h/PgrcNHyQ'},
 {id:'istighfar',t:'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ',n:100,f:'ثبت أن النبي ﷺ كان يتوب إلى الله ويستغفره في اليوم مائة مرة.',src:'صحيح الحديث؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/37239'},
 {id:'salat_nabi',t:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',n:1,f:'من صلى على النبي ﷺ صلاة صلى الله عليه بها عشرًا. لا يحدد تدارُك لهذا الذكر عددًا يوميًا مخصوصًا.',src:'صحيح مسلم (408)؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/40098'},
 {id:'hawqala',t:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',n:1,f:'ورد أنها كنز من كنوز الجنة. لا يحدد تدارُك عددًا مخصوصًا هنا.',src:'حديث صحيح؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/138399'},
 {id:'baqiyat',t:'سُبْحَانَ اللهِ، وَالحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ',n:1,f:'ثبت أن هذه الكلمات الأربع من أحب الكلام إلى الله. لا يحدد تدارُك عددًا مخصوصًا هنا.',src:'صحيح مسلم؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/21255'},
 {id:'sub_bihamdih',t:'سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ العَظِيمِ',n:1,f:'كلمتان حبيبتان إلى الرحمن، خفيفتان على اللسان، ثقيلتان في الميزان.',src:'صحيح البخاري؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/3023'},
 {id:'ya_hayy',t:'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',n:1,f:'دعاء مأثور؛ لا يحدد تدارُك له عددًا مخصوصًا في السبحة.',src:'حصن المسلم من أذكار الكتاب والسنة — سعيد بن علي القحطاني',u:'https://islamhouse.com/ar/books/2522/'}
];
const SEQ=[
 {t:'سُبْحَانَ اللهِ',n:33},{t:'الحَمْدُ لِلَّهِ',n:33},{t:'اللهُ أَكْبَرُ',n:33},
 {t:'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',n:1}
];
const SEQ_SOURCE={src:'تسبيح دبر الصلاة 33، والتحميد 33، والتكبير 33، وتمام المائة بالتهليل — صحيح مسلم؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/62319'};
const TARGETS=[33,99,100,313,1000];

/* ================= state ================= */
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const AR=n=>n.toLocaleString('ar-EG');
let cfg={sound:true,vibe:true,theme:'dark',target:100,idx:0},
    custom=[], today={}, count=0, rounds=0, seqIdx=-1, wake=null, tab='count';
const DHIKR=()=>BASE.concat(custom);
const cur=()=> seqIdx>=0 ? SEQ[seqIdx] : DHIKR()[cfg.idx];
const toast=m=>{const t=document.getElementById('toast');t.textContent=m;
  t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1300)};

/* ---- click sound ---- */
let ac;
function click(hi){ if(!cfg.sound)return;
  try{ ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    const o=ac.createOscillator(), g=ac.createGain();
    o.frequency.value=hi?880:520; o.type='sine';
    g.gain.setValueAtTime(.001,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.12,ac.currentTime+.008);
    g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+(hi?.28:.09));
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+(hi?.3:.1));
  }catch{} }

/* ================= counter ================= */
function target(){ return seqIdx>=0 ? SEQ[seqIdx].n : (cfg.target||cur().n) }
function paint(){
  const c=cur(), tg=target();
  document.getElementById('zikr').textContent=c.t;
  document.getElementById('fadl').textContent= seqIdx>=0 ? 'تسبيح ما بعد الصلاة — '+(seqIdx+1)+' من ٤' : (c.f||'');
  const sr=seqIdx>=0?SEQ_SOURCE:c,srcEl=document.getElementById('src');
  srcEl.textContent='';
  if(sr&&sr.src){
    srcEl.append('المصدر: ');const href=safeHttpUrl(sr.u);
    if(href){const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener';a.textContent=String(sr.src);srcEl.append(a)}
    else srcEl.append(String(sr.src));
  }else srcEl.textContent='هذا نص أضافه المستخدم؛ لا ينسبه تدارُك إلى السنة.';
  document.getElementById('num').textContent=AR(count);
  document.getElementById('of').textContent='من '+AR(tg);
  document.getElementById('rounds').textContent= rounds? 'أكملت '+AR(rounds)+' دورة':'';
  const C=703, p=Math.min(1,count/tg);
  document.getElementById('arc').style.strokeDashoffset=C-C*p;
  document.querySelectorAll('#targets button').forEach(b=>
    b.setAttribute('aria-pressed', seqIdx<0 && +b.dataset.n===tg));
  document.getElementById('b-seq').classList.toggle('on',seqIdx>=0);
}
async function bump(){
  count++;
  const id = seqIdx>=0 ? 'seq_'+seqIdx : cur().id;
  today[id]=(today[id]||0)+1;
  if(cfg.vibe&&navigator.vibrate) navigator.vibrate(12);
  const tg=target();
  if(count>=tg){
    click(true); if(cfg.vibe&&navigator.vibrate) navigator.vibrate([28,60,28]);
    if(seqIdx>=0){
      if(seqIdx<SEQ.length-1){ seqIdx++; count=0; toast('انتقلنا للتالي') }
      else { seqIdx=-1; count=0; toast('تمّ تسبيح ما بعد الصلاة — تقبّل الله') }
    } else { rounds++; count=0; toast('اكتملت الدورة — تقبّل الله') }
  } else click(false);
  paint(); saveDay();
}
let sT; function saveDay(){ clearTimeout(sT);
  sT=setTimeout(()=>store.set('tas:'+iso(new Date()),today),300) }

document.getElementById('tapzone').onclick=bump;
document.getElementById('ring').onclick=bump;
document.getElementById('b-undo').onclick=()=>{ if(count>0){count--;
  const id=seqIdx>=0?'seq_'+seqIdx:cur().id; today[id]=Math.max(0,(today[id]||0)-1); paint(); saveDay()} };
document.getElementById('b-reset').onclick=()=>{count=0;rounds=0;paint()};
document.getElementById('b-seq').onclick=()=>{ seqIdx = seqIdx>=0?-1:0; count=0; rounds=0; paint() };
document.getElementById('b-awake').onclick=async e=>{
  try{ if(wake){ await wake.release(); wake=null; e.target.classList.remove('on'); toast('أُلغي إبقاء الشاشة') }
    else { wake=await navigator.wakeLock.request('screen'); e.target.classList.add('on'); toast('الشاشة لن تنطفئ') }
  }catch{ toast('غير مدعوم في هذا المتصفح') } };

const tg=document.getElementById('targets');
tg.innerHTML=TARGETS.map(n=>`<button data-n="${n}">${AR(n)}</button>`).join('');
tg.onclick=async e=>{const b=e.target.closest('button'); if(!b)return;
  seqIdx=-1; cfg.target=+b.dataset.n; count=0; rounds=0; await store.set('tas:cfg',cfg); paint()};

/* ================= dhikr list ================= */
function renderList(){
  const host=document.getElementById('list');
  host.innerHTML=DHIKR().map((d,i)=>{const href=safeHttpUrl(d.u);return
    `<div class="row ${i===cfg.idx&&seqIdx<0?'sel':''}" data-i="${i}">
      <span class="t">${escHtml(d.t)}</span><span class="c">${AR(today[d.id]||0)} · هدف ${AR(d.n)}</span><div class="src">${d.src?`المصدر: ${href?`<a href="${escHtml(href)}" target="_blank" rel="noopener">${escHtml(d.src)}</a>`:escHtml(d.src)}`:'نص أضافه المستخدم — لا ينسبه تدارُك إلى السنة.'}</div></div>`}).join('');
  host.onclick=async e=>{ const r=e.target.closest('.row'); if(!r)return;
    cfg.idx=+r.dataset.i; seqIdx=-1; cfg.target=DHIKR()[cfg.idx].n; count=0; rounds=0;
    await store.set('tas:cfg',cfg); paint(); switchTab('count') };
}
document.getElementById('b-add').onclick=()=>document.getElementById('add-sheet').classList.remove('hide');
document.getElementById('close-add').onclick=()=>document.getElementById('add-sheet').classList.add('hide');
document.getElementById('save-new').onclick=async()=>{
  const t=document.getElementById('new-text').value.trim();
  const n=+document.getElementById('new-target').value||33;
  if(!t){toast('اكتب نص الذكر');return}
  custom.push({id:'c'+Date.now(),t,n,f:'',src:''}); await store.set('tas:custom',custom);
  document.getElementById('new-text').value='';
  document.getElementById('add-sheet').classList.add('hide'); renderList(); toast('أُضيف الذكر') };

/* ================= stats ================= */
async function renderStats(){
  const keys=await store.keys('tas:');
  const dayKeys=keys.filter(k=>/^tas:\d{4}-\d{2}-\d{2}$/.test(k)).sort();
  let total=0,best=0; const byDay={};
  for(const k of dayKeys){ const v=await store.get(k)||{};
    const s=Object.values(v).reduce((a,b)=>a+b,0); byDay[k.slice(4)]=s; total+=s; if(s>best)best=s }
  const tSum=Object.values(today).reduce((a,b)=>a+b,0);
  document.getElementById('s-today').textContent=AR(tSum);
  document.getElementById('s-total').textContent=AR(total);
  document.getElementById('s-best').textContent=AR(best);

  let streak=0;
  for(let i=0;;i++){ const d=new Date(); d.setDate(d.getDate()-i);
    const s=byDay[iso(d)]||0;
    if(s>0) streak++; else if(i>0) break; else if(i===0) break }
  document.getElementById('s-streak').textContent=AR(streak);

  const week=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);week.push(d)}
  const max=Math.max(1,...week.map(d=>byDay[iso(d)]||0));
  document.getElementById('week').innerHTML=week.map(d=>{
    const v=byDay[iso(d)]||0;
    return `<div><i><b style="height:${Math.round(v/max*100)}%"></b></i>
      ${new Intl.DateTimeFormat('ar-EG',{weekday:'narrow'}).format(d)}</div>`}).join('');

  const entries=Object.entries(today).filter(([,v])=>v>0)
    .sort((a,b)=>b[1]-a[1]).slice(0,8);
  const mx=Math.max(1,...entries.map(e=>e[1]));
  const label=id=>{ if(id.startsWith('seq_')) return SEQ[+id.slice(4)].t.slice(0,18);
    const d=DHIKR().find(x=>x.id===id); return d? d.t.slice(0,18):id };
  document.getElementById('bars').innerHTML= entries.length? entries.map(([id,v])=>
    `<div class="bar"><span>${escHtml(label(id))}</span><i style="width:${v/mx*100}%"></i><em>${AR(v)}</em></div>`).join('')
    : '<div class="bar"><span style="color:var(--soft)">لم تسبّح اليوم بعد</span><i style="width:0"></i><em></em></div>';
}

/* ================= backup ================= */
document.getElementById('b-export').onclick=async()=>{
  const keys=await store.keys('tas:'); const out={};
  for(const k of keys) out[k]=await store.get(k);
  const b=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(b);
  a.download='tasbih-backup-'+iso(new Date())+'.json'; a.click(); toast('تم التصدير') };
document.getElementById('b-import').onclick=()=>document.getElementById('file-in').click();
document.getElementById('file-in').onchange=async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{
    if(f.size>2*1024*1024)throw new Error('backup-too-large');
    const j=JSON.parse(await f.text());if(!j||typeof j!=='object'||Array.isArray(j))throw new Error('backup-shape');
    const entries=Object.entries(j).filter(([k])=>/^tas:(?:cfg|custom|\d{4}-\d{2}-\d{2})$/.test(k));
    if(!entries.length)throw new Error('backup-empty');
    for(const [k,v] of entries)await store.set(k,v);
    await boot(); toast('تم الاستيراد')
  }catch{ toast('الملف غير صالح') }
  finally{e.target.value=''}
};

/* ================= tabs & toggles ================= */
const T={count:'السبحة',list:'الأذكار',stats:'إحصائياتك'};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>switchTab(b.dataset.t));
function switchTab(t){ tab=t;
  ['count','list','stats'].forEach(v=>document.getElementById('v-'+v).classList.toggle('hide',v!==t));
  document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.t===t));
  document.getElementById('title').textContent=T[t];
  if(t==='list') renderList();
  if(t==='stats') renderStats();
  scrollTo({top:0,behavior:'smooth'}) }

document.getElementById('b-sound').onclick=async e=>{ cfg.sound=!cfg.sound;
  e.target.style.color=cfg.sound?'var(--gold)':''; await store.set('tas:cfg',cfg);
  toast(cfg.sound?'الصوت مفعّل':'الصوت متوقف') };
document.getElementById('b-vibe').onclick=async e=>{ cfg.vibe=!cfg.vibe;
  e.target.style.color=cfg.vibe?'var(--gold)':''; await store.set('tas:cfg',cfg);
  toast(cfg.vibe?'الاهتزاز مفعّل':'الاهتزاز متوقف') };
function applyTasAppearance(value){
  const name=['mishkat','sage','night'].includes(value)?value:'mishkat';
  cfg.appearance=name;cfg.theme=name==='night'?'dark':'light';
  document.documentElement.setAttribute('data-theme',cfg.theme);
  document.documentElement.setAttribute('data-palette',name==='sage'?'sage':'mishkat');
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=name==='night'?'#0D1A18':name==='sage'?'#4A6940':'#173B39';
}
document.getElementById('b-theme').onclick=async()=>{
  const appSettings=(await store.get('settings'))||{};
  const current=cfg.appearance||'mishkat';
  const next=current==='night'?(appSettings.lastLightAppearance||'mishkat'):'night';
  applyTasAppearance(next);
  if(next!=='night')appSettings.lastLightAppearance=next;appSettings.appearance=next;appSettings.theme=cfg.theme;
  await store.set('settings',appSettings);await store.set('tas:cfg',cfg);
};

/* keyboard: space / enter to count */
addEventListener('keydown',e=>{ if(tab==='count'&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();bump()} });

/* ================= boot ================= */
async function boot(){
  cfg=Object.assign({sound:true,vibe:true,theme:'light',appearance:'mishkat',target:100,idx:0},await store.get('tas:cfg')||{});
  custom=normalizeCustom(await store.get('tas:custom'));
  const rawToday=await store.get('tas:'+iso(new Date()));today=rawToday&&typeof rawToday==='object'&&!Array.isArray(rawToday)?rawToday:{};
  const appSettings=(await store.get('settings'))||{};
  applyTasAppearance(appSettings.appearance||(appSettings.theme==='dark'?'night':cfg.appearance||'mishkat'));
  document.getElementById('b-sound').style.color=cfg.sound?'var(--gold)':'';
  document.getElementById('b-vibe').style.color=cfg.vibe?'var(--gold)':'';
  cfg.idx=Number.isInteger(+cfg.idx)?Math.max(0,Math.min(DHIKR().length-1,+cfg.idx)):0;
  cfg.target=Number.isFinite(+cfg.target)?Math.min(100000,Math.max(1,Math.round(+cfg.target))):100;
  count=0; rounds=0; seqIdx=-1; paint();
}
boot();
