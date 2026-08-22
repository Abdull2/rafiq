/* ================= storage ================= */
const store = {
  async get(k){ if(window.storage){try{const r=await window.storage.get(k,false);return r?JSON.parse(r.value):null}catch{return null}}
    const v=localStorage.getItem(k); return v?JSON.parse(v):null },
  async set(k,v){ if(window.storage){try{await window.storage.set(k,JSON.stringify(v),false);return}catch{}}
    localStorage.setItem(k,JSON.stringify(v)) },
  async keys(p){ if(window.storage){try{const r=await window.storage.list(p,false);return r?r.keys:[]}catch{return[]}}
    return Object.keys(localStorage).filter(k=>k.startsWith(p)) }
};

/* ================= content ================= */
const SECTIONS=[
 {id:'daily_core',title:'خلاصة اليوم',items:[
  ['salah_time','حافظت على الصلوات المفروضة'],
  ['quran','قرأت من القرآن ولو قليلًا'],
  ['adhkar','أتيت بأذكاري'],
  ['lisan','حفظت لساني وخلقي'],
  ['walidayn','أحسنت إلى أهلي ومن حولي']
 ]}
];
const ALL_ITEMS=SECTIONS.flatMap(s=>s.items);
// ثلاث إجابات فقط لتكون المحاسبة خفيفة في آخر اليوم. نحافظ على سقف 4 للتوافق مع البيانات القديمة.
const SCALE=[['لا',1],['إلى حد ما',2.5],['نعم',4]];
const MOODS=['مطمئن','راضٍ','متعب','مهموم'];
const dailyRatingValues=day=>{
  const ratings=(day&&day.ratings)||{};
  return ALL_ITEMS.map(([id])=>ratings[id]).filter(v=>Number.isFinite(+v)).map(Number);
};
const PRAYERS=[['fajr','الفجر'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
const P_STATES=[['jamaah','جماعة'],['time','في وقتها'],['late','متأخرة'],['missed','فائتة']];
const prayerStates=()=>isFemale()?[['time','في وقتها'],['late','متأخرة'],['missed','فائتة']]:P_STATES;

const DHIKR=[
 {t:'سُبْحَانَ اللهِ وَبِحَمْدِهِ',n:100,source:{t:'حديث أبي هريرة — صحيح؛ من قالها مائة مرة في يومه — الدرر السنية',u:'https://dorar.net/hadith/sharh/10620'}},
 {t:'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',n:100,source:{t:'حديث أبي هريرة — فضل قولها مائة مرة في اليوم — الدرر السنية',u:'https://dorar.net/h/PgrcNHyQ'}},
 {t:'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ',n:100,source:{t:'ثبوت استغفار النبي ﷺ وتوبته في اليوم مائة مرة — الدرر السنية',u:'https://dorar.net/hadith/sharh/37239'}},
 {t:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',n:null,source:{t:'من صلى على النبي ﷺ صلاة صلى الله عليه بها عشرًا؛ لا يحدد تدارُك عددًا يوميًا مخصوصًا — صحيح مسلم؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/40098'}},
 {t:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',n:null,source:{t:'كنز من كنوز الجنة؛ لا يحدد تدارُك عددًا مخصوصًا — حديث صحيح؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/138399'}},
 {t:'سُبْحَانَ اللهِ، وَالحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ',n:null,source:{t:'الكلمات الأربع من أحب الكلام إلى الله؛ لا يحدد تدارُك عددًا مخصوصًا — صحيح مسلم؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/21255'}},
 {t:'سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ العَظِيمِ',n:null,source:{t:'كلمتان حبيبتان إلى الرحمن، خفيفتان على اللسان، ثقيلتان في الميزان — صحيح البخاري؛ الدرر السنية',u:'https://dorar.net/hadith/sharh/3023'}}
];

/* ================= prayer times (offline calculation) ================= */
const METHODS={ EGYPT:{fajr:19.5,isha:17.5}, MAKKAH:{fajr:18.5,isha:'90 min'},
  MWL:{fajr:18,isha:17}, KARACHI:{fajr:18,isha:18}, ISNA:{fajr:15,isha:15} };
const dtr=d=>d*Math.PI/180, rtd=r=>r*180/Math.PI;
const fixA=a=>{a=a-360*Math.floor(a/360);return a<0?a+360:a};
const fixH=a=>{a=a-24*Math.floor(a/24);return a<0?a+24:a};

function julian(y,m,d){ if(m<=2){y-=1;m+=12} const A=Math.floor(y/100), B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5 }

function sunPos(jd){ const D=jd-2451545.0;
  const g=fixA(357.529+0.98560028*D), q=fixA(280.459+0.98564736*D);
  const L=fixA(q+1.915*Math.sin(dtr(g))+0.020*Math.sin(dtr(2*g)));
  const e=23.439-0.00000036*D;
  const RA=fixH(rtd(Math.atan2(Math.cos(dtr(e))*Math.sin(dtr(L)),Math.cos(dtr(L))))/15);
  return {decl:rtd(Math.asin(Math.sin(dtr(e))*Math.sin(dtr(L)))), eqt:q/15-RA};
}

function computeTimes(date,lat,lng,method,asrF){
  const jd=julian(date.getFullYear(),date.getMonth()+1,date.getDate())-lng/(15*24);
  const tz=-date.getTimezoneOffset()/60;
  const M=METHODS[method]||METHODS.EGYPT;
  const midDay=t=>fixH(12-sunPos(jd+t/24).eqt);
  const angleTime=(ang,t,ccw)=>{ const d=sunPos(jd+t/24).decl;
    const x=(-Math.sin(dtr(ang))-Math.sin(dtr(d))*Math.sin(dtr(lat)))/(Math.cos(dtr(d))*Math.cos(dtr(lat)));
    if(x>1||x<-1) return NaN;
    const h=rtd(Math.acos(x))/15; return midDay(t)+(ccw?-h:h) };
  const asrTime=(f,t)=>{ const d=sunPos(jd+t/24).decl;
    const ang=-rtd(Math.atan(1/(f+Math.tan(Math.abs(dtr(lat)-dtr(d))))));
    return angleTime(ang,t,false) };
  let dhuhr=midDay(12), sunrise=angleTime(0.833,6,true), sunset=angleTime(0.833,18,false);
  let fajr=angleTime(M.fajr,5,true), asr=asrTime(asrF,13);
  let isha = (typeof M.isha==='string') ? sunset+parseInt(M.isha)/60 : angleTime(M.isha,18,false);
  const adj=t=>isNaN(t)?NaN:fixH(t+tz-lng/15);
  return {fajr:adj(fajr),sunrise:adj(sunrise),dhuhr:adj(dhuhr)+1/60,
          asr:adj(asr),maghrib:adj(sunset)+1/60,isha:adj(isha)};
}
const hhmm=t=>{ if(isNaN(t))return '—'; let h=Math.floor(t), m=Math.round((t-h)*60);
  if(m===60){m=0;h++} h=h%24; const am=h<12?'ص':'م'; let h12=h%12; if(h12===0)h12=12;
  return `${h12}:${String(m).padStart(2,'0')} ${am}` };

function qiblaBearing(lat,lng){ const kLat=dtr(21.4225), kLng=dtr(39.8262);
  const p=dtr(lat), l=dtr(lng);
  return fixA(rtd(Math.atan2(Math.sin(kLng-l), Math.cos(p)*Math.tan(kLat)-Math.sin(p)*Math.cos(kLng-l)))) }

/* ================= state ================= */
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fromIso=k=>new Date(k+'T12:00:00');
const blank=()=>({ratings:{},mood:'',tomorrow:'',best:'',worst:'',prayers:{},azkar:{},tasbih:{},pages:0,goal:'',target:'',goalReview:null});
let current=iso(new Date()), data=blank(), settings={}, qada={}, tab='today';
let dIdx=0, tCount=0, AZ={sets:[]}, azkarMode = new Date().getHours()<15 ? 'morning' : 'evening', azkarQuery='';
let HISN=null, hisnChapter=null, hisnLoadError='';
const HISN_DATA_URL='https://cdn.jsdelivr.net/gh/asellam/HisnElMuslim@main/hisn.json';
const HISN_DATA_FALLBACK='https://raw.githubusercontent.com/asellam/HisnElMuslim/main/hisn.json';
const HISN_CACHE_KEY='hisn-static-cache-v1-20260819';

const AR=n=>Number(n).toLocaleString('ar-EG');
const escHtml=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const toast=m=>{const t=document.getElementById('toast');t.textContent=m||'تم الحفظ';
  t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1200)};

/* ================= profile personalization ================= */
let profile={age:null,gender:null,advancedIssues:false,married:null,hasKids:null,timeBand:null,moneyBand:null,skills:[]};
const isFemale=()=>profile.gender==='female';
const genderText=(male,female)=>isFemale()?female:male;
const pText=x=>{
  if(!x)return '';
  if(typeof x==='string')return x;
  return isFemale()?(x.femaleText||x.t||x.maleText||''):(x.maleText||x.t||x.femaleText||'');
};
const profileAge=()=>Number(profile.age)||0;
const issuesEnabled=()=>profile.advancedIssues===true;
const issueTabButton=(active=false)=>`<button data-k="ishkaliat" class="${issuesEnabled()?'':'optional-track'}"${active?' aria-current="true"':''} title="مسار متقدم اختياري">إشكاليات</button>`;
const LIFE_BOOL=v=>v==='yes'?true:v==='no'?false:null;
const LIFE_SEL=v=>v===true?'yes':v===false?'no':'';
function lifeSkillsFrom(rootId){return [...document.querySelectorAll(`#${rootId} input[type="checkbox"]:checked`)].map(x=>x.value)}
function lifeSetSkills(rootId,skills=[]){document.querySelectorAll(`#${rootId} input[type="checkbox"]`).forEach(x=>x.checked=(skills||[]).includes(x.value))}
function syncKidsVisibility(prefix='profile-edit'){
  const m=document.getElementById(prefix+'-married'),wrap=document.getElementById(prefix+'-kids-wrap');if(!m||!wrap)return;
  const married=LIFE_BOOL(m.value);wrap.classList.toggle('hide',married!==true);if(married!==true){const k=document.getElementById(prefix+'-kids');if(k)k.value=''}
}
function readLifeProfile(prefix='profile-edit',skillsRoot='profile-edit-skills'){
  const married=LIFE_BOOL(document.getElementById(prefix+'-married')?.value||'');
  return {married,hasKids:married===true?LIFE_BOOL(document.getElementById(prefix+'-kids')?.value||''):null,timeBand:document.getElementById(prefix+'-time')?.value||null,moneyBand:document.getElementById(prefix+'-money')?.value||null,skills:lifeSkillsFrom(skillsRoot)};
}
function fillLifeProfile(prefix='profile-edit',skillsRoot='profile-edit-skills'){
  const m=document.getElementById(prefix+'-married'),k=document.getElementById(prefix+'-kids'),t=document.getElementById(prefix+'-time'),mo=document.getElementById(prefix+'-money');
  if(m)m.value=LIFE_SEL(profile.married);if(k)k.value=LIFE_SEL(profile.hasKids);if(t)t.value=profile.timeBand||'';if(mo)mo.value=profile.moneyBand||'';lifeSetSkills(skillsRoot,profile.skills||[]);syncKidsVisibility(prefix);
}
function audienceOk(x){
  if(!x)return true;
  if(x.audience&&x.audience!=='all'&&x.audience!==profile.gender)return false;
  const a=profileAge();
  if(x.minAge&&a&&a<+x.minAge)return false;
  if(x.maxAge&&a&&a>+x.maxAge)return false;
  return true;
}
function profileStage(){
  const a=profileAge();
  if(!a)return '';
  if(a<14)return 'مرحلة الناشئة';
  if(a<18)return 'مرحلة المراهقة';
  if(a<25)return 'مرحلة الشباب';
  if(a<40)return 'مرحلة الرشد';
  return 'مرحلة النضج';
}
function paintProfileUI(){
  const line=document.getElementById('home-profile-line');
  if(line&&profile.gender){
    const who=genderText('أهلًا بك — تدارُك يراعي عمرك وما يناسبك.','أهلًا بكِ — تدارُك يراعي عمرك وما يناسبكِ.');
    line.textContent=profileStage()?`${who} · ${profileStage()}`:who;
  }
  const et=document.getElementById('evening-title'), ec=document.getElementById('evening-copy');
  if(et&&profile.gender)et.textContent=genderText('قبل أن تنام: خلاصة اليوم','قبل أن تنامي: خلاصة اليوم');
  if(ec&&profile.gender)ec.textContent=genderText('راجع هدفك ومهامك ثم أجب عن ٥ أسئلة أساسية وأغلق يومك بهدوء.','راجعي هدفك ومهامك ثم أجيبي عن ٥ أسئلة أساسية وأغلقي يومك بهدوء.');
}

/* ================= احفظها لوقت لاحق ================= */
let laterItems=[], laterRegistry={};
const laterEsc=x=>(x||'').toString().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const laterHas=id=>laterItems.some(v=>v.id===id);
function laterRegister(id,item){
  laterRegistry[id]=item||{}; const on=laterHas(id);
  return `<button class="save-later ${on?'on':''}" data-later="${laterEsc(id)}" type="button" title="${on?'محفوظ — اضغط للإزالة':'احفظها لوقت لاحق'}" aria-label="${on?'محفوظ في محفوظاتي':'احفظها لوقت لاحق'}" aria-pressed="${on?'true':'false'}">${on?'✓':'＋'}</button>`
}
async function loadLater(){laterItems=(await store.get('saved-later-v1'))||[];updateLaterBadge()}
function updateLaterBadge(){
  const b=document.getElementById('saved-count'),head=document.getElementById('btn-saved'),n=laterItems.length;
  if(b){b.textContent='';b.classList.toggle('on',n>0);b.dataset.count=String(n)}
  if(head){const label=n?`محفوظاتي — ${AR(n)} عنصر محفوظ`:'محفوظاتي';head.setAttribute('aria-label',label);head.title=label}
}
function syncLaterButtons(id){
  const on=laterHas(id);
  document.querySelectorAll('.save-later[data-later]').forEach(b=>{
    if(b.dataset.later!==id)return;
    b.classList.toggle('on',on); b.textContent=on?'✓':'＋'; b.setAttribute('aria-pressed',on?'true':'false');
    b.setAttribute('aria-label',on?'محفوظ في محفوظاتي':'احفظها لوقت لاحق'); b.title=on?'محفوظ — اضغط للإزالة':'احفظها لوقت لاحق';
  });
}
async function toggleLater(id){
  const x=laterRegistry[id]; if(!x)return;
  const i=laterItems.findIndex(v=>v.id===id);
  if(i>=0){laterItems.splice(i,1);toast('أزيلت من محفوظاتي')}else{laterItems.unshift({...x,id,savedAt:Date.now()});toast('تم الحفظ في محفوظاتي ✓')}
  await store.set('saved-later-v1',laterItems);updateLaterBadge();syncLaterButtons(id);renderSavedPanel();
}
function savedSourceHtml(x){return x?.source?`<div class="saved-source">${laterEsc(x.source)}</div>`:''}
function renderSavedPanel(){
  const host=document.getElementById('saved-list'); if(!host)return;
  host.innerHTML=laterItems.length?laterItems.map(x=>`<div class="saved-row"><div class="saved-kind">${laterEsc(x.kind||'محفوظ')}</div><div class="saved-title">${laterEsc(x.title||'')}</div>${x.text?`<div class="saved-text">${laterEsc(x.text)}</div>`:''}${savedSourceHtml(x)}<div class="saved-actions"><button data-saved-open="${laterEsc(x.tab||'')}">افتح القسم</button><button data-saved-del="${laterEsc(x.id)}">حذف</button></div></div>`).join(''):'<div class="saved-empty">لم تحفظ شيئًا بعد. ستجد علامة ＋ بجوار المواد داخل تدارُك.</div>';
}
function openSavedPanel(){renderSavedPanel();document.getElementById('saved-panel')?.classList.remove('hide')}

function arabicDate(k){ const d=fromIso(k);
  const g=new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);
  let h=''; try{h=new Intl.DateTimeFormat('ar-SA-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'}).format(d)}catch{}
  return h? g+' — '+h : g }

/* ================= save ================= */
const saveTimers=new Map();
function save(msg){
  ['tomorrow','best','worst'].forEach(f=>{const el=document.getElementById(f); if(el) data[f]=el.value});
  const dayKey=current,snapshot=JSON.parse(JSON.stringify(data));
  if(saveTimers.has(dayKey))clearTimeout(saveTimers.get(dayKey));
  saveTimers.set(dayKey,setTimeout(async()=>{
    await store.set('day:'+dayKey,snapshot);saveTimers.delete(dayKey);
    if(dayKey===current){if(msg!==false)toast(msg);paintStrip()}
  },350));
}

/* ================= daily plan + todo ================= */
let todoItems=[], todoImportant=false;
const TODO_REVIEW_SCALE=[['لم يتم',0],['جزئي',1],['تم',2]];
async function loadTodo(){ todoItems=(await store.get('todo-items'))||[]; renderTodo(); renderTodoReview() }
const todoEsc=x=>(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function todoDatePlus(k,n){const d=fromIso(k);d.setDate(d.getDate()+n);return iso(d)}
function todoForDay(day=current){return todoItems.filter(x=>x.due===day)}
function todoAchievement(tasks){
  if(!tasks.length)return {pct:0,reviewed:0,total:0};
  const reviewed=tasks.filter(x=>Number.isInteger(x.review)&&x.review>=0&&x.review<=2);
  const sum=reviewed.reduce((n,x)=>n+x.review,0);
  return {pct:reviewed.length?Math.round(sum/(reviewed.length*2)*100):0,reviewed:reviewed.length,total:tasks.length};
}
async function saveTodo(){await store.set('todo-items',todoItems);renderTodo();renderTodoReview()}
function paintPlanProgress(){
  const due=todoForDay(),done=due.filter(x=>x.done),pct=due.length?Math.round(done.length/due.length*100):0;
  const p=document.getElementById('plan-progress');if(p)p.style.width=pct+'%';
  const m=document.getElementById('plan-progress-copy');if(m)m.textContent=due.length?`${AR(done.length)} من ${AR(due.length)} مهمة منجزة`:'ابدأ بهدف واضح ثم أضف مهامك الأساسية';
  const d=document.getElementById('plan-day-label');if(d)d.textContent=new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long'}).format(fromIso(current));
}
function renderTodo(){
  const host=document.getElementById('todo-list'); if(!host)return;
  const todayKey=iso(new Date());
  const due=todoForDay();
  const overdue=current===todayKey?todoItems.filter(x=>!x.done&&x.due<todayKey).sort((a,b)=>(b.important?1:0)-(a.important?1:0)||String(a.due).localeCompare(String(b.due))):[];
  const open=due.filter(x=>!x.done).sort((a,b)=>(b.important?1:0)-(a.important?1:0)||(a.created||0)-(b.created||0)), done=due.filter(x=>x.done).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const pct=due.length?Math.round(done.length/due.length*100):0;
  const val=document.getElementById('todo-val'); if(val)val.textContent=due.length?`${AR(done.length)}/${AR(due.length)}`:'';
  const bar=document.getElementById('todo-bar'); if(bar)bar.style.width=pct+'%';
  const row=(x,late=false)=>`<div class="todo-row ${x.done?'done':''}" data-todo="${x.id}">
    <button class="todo-check ${x.done?'on':''}" data-todo-check="${x.id}" aria-label="${x.done?'إلغاء الإنجاز':'تم'}">${x.done?'✓':''}</button>
    <div class="todo-text">${todoEsc(x.text)}${x.important?'<span class="todo-badge">مهم</span>':''}${late?'<span class="todo-badge">متأخرة</span>':''}${Number.isInteger(x.review)?`<span class="todo-badge reviewed">${TODO_REVIEW_SCALE.find(v=>v[1]===x.review)?.[0]||'مراجع'}</span>`:''}</div>
    <div class="todo-actions">${late?`<button data-todo-today="${x.id}" title="رحّل لليوم">لليوم</button>`:`<button data-todo-next="${x.id}" title="رحّل للغد">غدًا</button>`}<button data-todo-del="${x.id}" title="حذف">حذف</button></div></div>`;
  let html=`<div class="todo-summary"><span>${due.length?`أنجزت ${AR(done.length)} من ${AR(due.length)}`:'لا مهام لهذا اليوم'}</span><span>${pct?AR(pct)+'%':''}</span></div>`;
  if(overdue.length)html+=`<div class="todo-group-title">تحتاج قرارًا · ${AR(overdue.length)} متأخرة</div>${overdue.map(x=>row(x,true)).join('')}`;
  if(open.length)html+=`<div class="todo-group-title">قيد التنفيذ</div>${open.map(x=>row(x)).join('')}`;
  if(done.length)html+=`<div class="todo-group-title">تم اليوم ✓</div>${done.map(x=>row(x)).join('')}`;
  if(!overdue.length&&!due.length)html+=`<div class="todo-empty">اكتب أهم ما تريد إنجازه اليوم. القائمة الأقصر أوضح وأسهل في المراجعة آخر اليوم.</div>`;
  host.innerHTML=html;paintPlanProgress();
}
function renderTodoReview(){
  const host=document.getElementById('todo-review');if(!host)return;
  const due=todoForDay(),a=todoAchievement(due),goal=String(data.goal||'').trim(),target=String(data.target||'').trim();
  const goalButtons=TODO_REVIEW_SCALE.map(([label,val])=>`<button data-goal-review="${val}" aria-pressed="${data.goalReview===val?'true':'false'}">${label}</button>`).join('');
  const tasks=due.length?due.map(x=>`<div class="todo-review-row"><div><b>${todoEsc(x.text)}</b><span>${x.done?'معلّمة منجزة أثناء اليوم':'لم تُعلّم منجزة أثناء اليوم'}</span></div><div class="todo-review-scale">${TODO_REVIEW_SCALE.map(([label,val])=>`<button data-task-review="${x.id}" data-review="${val}" aria-pressed="${x.review===val?'true':'false'}">${label}</button>`).join('')}</div></div>`).join(''):'<div class="todo-review-empty">لا توجد مهام لهذا اليوم. يمكنك إضافة مهام من «خطة اليوم» ثم تقييمها هنا في نهاية اليوم.</div>';
  host.innerHTML=`<div class="todo-review-summary"><div><b>مراجعة خطة اليوم</b><span>${a.reviewed?`قيّمت ${AR(a.reviewed)} من ${AR(a.total)} مهمة · إنجاز تنظيمي ${AR(a.pct)}%`:'قيّم النتيجة النهائية للهدف والمهام بدون جلد للذات.'}</span></div>${a.reviewed?`<strong>${AR(a.pct)}%</strong>`:''}</div>
    ${(goal||target)?`<div class="goal-review-card"><small>هدف اليوم</small><b>${todoEsc(goal||'—')}</b>${target?`<span>التارجت: ${todoEsc(target)}</span>`:''}<div class="todo-review-scale goal">${goalButtons}</div></div>`:'<div class="todo-review-empty">لم تكتب هدفًا أو تارجت لهذا اليوم.</div>'}${tasks}`;
}
async function addTodoText(text,{due=current,important=false,source='app'}={}){
  const clean=String(text||'').trim().slice(0,180);if(!clean)return null;
  const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:clean,due,important:!!important,done:false,created:Date.now(),source};
  todoItems.push(item);await saveTodo();return item;
}
async function addTodo(){
  const inp=document.getElementById('todo-new'), text=inp.value.trim(); if(!text){inp.focus();return}
  await addTodoText(text,{due:current,important:todoImportant});
  inp.value=''; todoImportant=false; const p=document.getElementById('todo-prio');p.classList.remove('on');p.textContent='☆ مهم';
  toast('أُضيفت المهمة');
}
globalThis.RafiqPlan={addTask:async(text,opts={})=>addTodoText(text,{due:opts.due||iso(new Date()),important:!!opts.important,source:opts.source||'external'}),open:()=>{switchTab('today');setTimeout(()=>document.getElementById('day-plan')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}};
document.getElementById('todo-add').onclick=addTodo;
document.getElementById('todo-new').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addTodo()}});
document.getElementById('todo-prio').onclick=e=>{todoImportant=!todoImportant;e.currentTarget.classList.toggle('on',todoImportant);e.currentTarget.textContent=todoImportant?'★ مهمة':'☆ مهم'};
document.getElementById('todo-list').onclick=async e=>{
  const id=e.target.dataset.todoCheck||e.target.dataset.todoDel||e.target.dataset.todoNext||e.target.dataset.todoToday; if(!id)return;
  const x=todoItems.find(t=>t.id===id); if(!x)return;
  if(e.target.dataset.todoCheck){x.done=!x.done;x.doneAt=x.done?Date.now():null;x.review=null;x.reviewedAt=null}
  else if(e.target.dataset.todoDel){todoItems=todoItems.filter(t=>t.id!==id)}
  else if(e.target.dataset.todoNext){x.due=todoDatePlus(current,1);x.done=false;x.doneAt=null;x.review=null;x.reviewedAt=null}
  else if(e.target.dataset.todoToday){x.due=iso(new Date());x.done=false;x.doneAt=null;x.review=null;x.reviewedAt=null}
  await saveTodo();
};
document.getElementById('todo-review')?.addEventListener('click',async e=>{
  const gbtn=e.target.closest('[data-goal-review]');if(gbtn){data.goalReview=+gbtn.dataset.goalReview;save('تم تسجيل مراجعة الهدف');renderTodoReview();return}
  const b=e.target.closest('[data-task-review]');if(!b)return;const x=todoItems.find(t=>t.id===b.dataset.taskReview);if(!x)return;
  x.review=+b.dataset.review;x.reviewedAt=Date.now();if(x.review===2){x.done=true;x.doneAt=x.doneAt||Date.now()}else{x.done=false;x.doneAt=null}
  await saveTodo();toast('تم تسجيل تقييم المهمة');
});
['day-goal','day-target'].forEach(id=>document.getElementById(id)?.addEventListener('input',e=>{const key=id==='day-goal'?'goal':'target';data[key]=e.currentTarget.value;save(false)}));
document.getElementById('acc-todo-review')?.querySelector('.acc-head')?.addEventListener('click',e=>{const h=e.currentTarget,b=h.nextElementSibling;const closed=b.classList.toggle('hide');h.querySelector('.acc-x').textContent=closed?'＋':'－';if(!closed)renderTodoReview()});

/* ================= today ================= */
function buildSections(){
  const host=document.getElementById('sections'); host.innerHTML='';
  SECTIONS.forEach((sec,idx)=>{
    const d=document.createElement('div'); d.className='acc';
    d.innerHTML=`<button class="acc-head" data-acc="${sec.id}">
        <span class="ttl">${sec.title}</span>
        <span class="mini-bar"><i id="bar-${sec.id}" style="width:0%"></i></span>
        <span class="val" id="pct-${sec.id}"></span>
        <span class="acc-x">${idx===0?'－':'＋'}</span></button>
      <div class="acc-body ${idx===0?'':'hide'}">`+
      (sec.id==='daily_core'?`<div class="quick-note"><b>٥ أسئلة فقط.</b> لا تحتاج أن يكون يومك مثاليًا؛ اختر أقرب إجابة وانتهى.</div>`:'')+
      sec.items.map(([id,name])=>
        `<div class="r-row"><span class="nm">${name}</span><span class="dots">`+
        SCALE.map(([l,v])=>`<button class="${v<3?'weak':''}" data-item="${id}" data-val="${v}"
          aria-pressed="false" title="${l}">${l}</button>`).join('')+`</span></div>`).join('')+
      `</div>`;
    host.appendChild(d);
  });
  host.onclick=e=>{
    const h=e.target.closest('.acc-head');
    if(h){ const body=h.nextElementSibling; const open=body.classList.toggle('hide');
      h.querySelector('.acc-x').textContent=open?'＋':'－'; return }
    const b=e.target.closest('button[data-item]'); if(!b)return;
    const {item,val}=b.dataset;
    if(data.ratings[item]===+val) delete data.ratings[item]; else data.ratings[item]=+val;
    paintRatings(); save() };
}
function buildMoods(){ const m=document.getElementById('mood');
  m.innerHTML=MOODS.map(x=>`<button data-mood="${x}" aria-pressed="false">${x}</button>`).join('');
  m.onclick=e=>{const b=e.target.closest('button'); if(!b)return;
    data.mood = data.mood===b.dataset.mood ? '' : b.dataset.mood; paintMood(); save()} }
function paintRatings(){
  document.querySelectorAll('button[data-item]').forEach(b=>
    b.setAttribute('aria-pressed', data.ratings[b.dataset.item]===+b.dataset.val));
  SECTIONS.forEach(sec=>{
    const v=sec.items.map(([id])=>data.ratings[id]).filter(Boolean);
    const pct=v.length? Math.round(v.reduce((a,b)=>a+b,0)/(v.length*4)*100):0;
    const el=document.getElementById('pct-'+sec.id);
    if(el) el.textContent=v.length ? `${AR(pct)}% · ${AR(v.length)}/${AR(sec.items.length)}` : '';
    const bar=document.getElementById('bar-'+sec.id); if(bar) bar.style.width=pct+'%';
  });
  paintRing();
}
function paintMood(){ document.querySelectorAll('button[data-mood]').forEach(b=>
  b.setAttribute('aria-pressed', data.mood===b.dataset.mood)) }

/* حلقة الإنجاز */
async function paintRing(){
  const vals=dailyRatingValues(data);
  const pct=vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/(vals.length*4)*100) : 0;
  const el=document.getElementById('ring-pct'); if(!el)return;
  el.textContent=vals.length ? AR(pct)+'%' : '—';
  document.getElementById('ring-fg').style.strokeDashoffset=540-540*pct/100;
  document.getElementById('ring-streak').textContent = vals.length===ALL_ITEMS.length ? 'تمت الخلاصة ✓' : '٥ أسئلة فقط';
  const cov=document.getElementById('rating-coverage');
  if(cov){
    if(!vals.length) cov.textContent='خلاصة سريعة قبل النوم · ٥ أسئلة';
    else if(vals.length===ALL_ITEMS.length) cov.textContent='اكتملت خلاصة اليوم ✓';
    else cov.textContent=`${AR(vals.length)} من ${AR(ALL_ITEMS.length)} · أكمل ما تريد فقط`;
  }
  const d=fromIso(current);
  document.getElementById('hd-day').textContent=
    new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long'}).format(d);
  let h=''; try{ h=new Intl.DateTimeFormat('ar-SA-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'}).format(d) }catch{}
  document.getElementById('hd-hij').textContent=h;
}

function buildPrayerLog(){
  const host=document.getElementById('prayer-log');
  host.innerHTML=PRAYERS.map(([id,name])=>
    `<div class="pc" data-p="${id}"><div class="n">${name}</div>
      <div class="t" id="pl-${id}"></div><div class="s" id="ps-${id}"></div></div>`).join('');
  host.onclick=e=>{ const c=e.target.closest('.pc'); if(!c)return;
    const id=c.dataset.p;
    const order=prayerStates().map(x=>x[0]);
    const cur=data.prayers[id];
    const nxt = cur===undefined ? order[0] : (order.indexOf(cur)===order.length-1 ? undefined : order[order.indexOf(cur)+1]);
    if(nxt===undefined) delete data.prayers[id]; else data.prayers[id]=nxt;
    paintPrayerLog(); save() };
}
function paintPrayerLog(){
  const T=todayTimes();
  PRAYERS.forEach(([id])=>{
    const c=document.querySelector(`.pc[data-p="${id}"]`); if(!c)return;
    c.className='pc'+(data.prayers[id]?' '+data.prayers[id]:'');
    const state=data.prayers[id], lbl=(prayerStates().find(x=>x[0]===state)||((isFemale()&&state==='jamaah')?['time','في وقتها']:['','']))[1];
    const ps=document.getElementById('ps-'+id); if(ps) ps.textContent=lbl||'—';
    const el=document.getElementById('pl-'+id); if(el) el.textContent=T?hhmm(T[id]):'';
  });
}

function buildStrip(){
  const el=document.getElementById('strip'); el.innerHTML='';
  for(let i=3;i>=-3;i--){ const d=fromIso(current); d.setDate(d.getDate()-i); const key=iso(d);
    const b=document.createElement('button'); b.setAttribute('aria-current',key===current);
    b.innerHTML=`<span class="dot" data-day="${key}">${d.getDate()}</span>
      <span class="lbl">${new Intl.DateTimeFormat('ar-EG',{weekday:'short'}).format(d)}</span>`;
    b.onclick=()=>load(key); el.appendChild(b) }
  paintStrip();
}
async function paintStrip(){
  for(const dot of document.querySelectorAll('.dot')){
    const day=await store.get('day:'+dot.dataset.day);
    const p=day?score(day):0;
    dot.style.background = p? shade(p):'';
    dot.style.color = p>55? '#fff':'' } }

const score=day=>{const v=dailyRatingValues(day);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/(v.length*4)*100):0};
const shade=p=>p>=80?'#3F5C34':p>=60?'#6E8F5C':p>=35?'#A8C296':p>0?'#D5E2CB':'';

async function load(day){
  current=day;
  data=(await store.get('day:'+day))||blank();
  ['ratings','prayers','azkar','tasbih'].forEach(k=>data[k]=data[k]||{});
  data.pages=data.pages||0;data.goal=data.goal||'';data.target=data.target||'';if(!Number.isInteger(data.goalReview))data.goalReview=null;
  const goalEl=document.getElementById('day-goal'),targetEl=document.getElementById('day-target');if(goalEl)goalEl.value=data.goal;if(targetEl)targetEl.value=data.target;
  document.getElementById('dateline').textContent=arabicDate(day);
  document.getElementById('datepick').value=day;
  ['tomorrow','best','worst'].forEach(f=>{const el=document.getElementById(f);if(el)el.value=data[f]||''});
  paintRatings(); paintMood(); paintPrayerLog(); buildStrip(); renderAzkar(); renderQuran(); renderTodo(); renderTodoReview(); paintRing();
}

/* ================= salah tab ================= */
function todayTimes(){
  if(!settings.lat||!settings.lng) return null;
  return computeTimes(fromIso(current),+settings.lat,+settings.lng,settings.method||'EGYPT',+(settings.asr||1));
}
function renderNext(){
  paintHomePrayer();
  const T=todayTimes(); const box=document.getElementById('next-box');
  if(!T){ document.getElementById('next-name').textContent='—';
    document.getElementById('next-cd').textContent='';
    document.getElementById('next-at').textContent='حدّد موقعك من الإعدادات'; return }
  const now=new Date(), nowH=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
  const list=[['fajr','الفجر'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
  let nxt=list.find(([k])=>T[k]>nowH), diff;
  if(nxt) diff=(T[nxt[0]]-nowH); else { nxt=list[0]; diff=24-nowH+T.fajr }
  const h=Math.floor(diff), m=Math.floor((diff-h)*60), s=Math.floor(((diff-h)*60-m)*60);
  document.getElementById('next-name').textContent=nxt[1];
  document.getElementById('next-cd').textContent=
    (h?h+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  document.getElementById('next-at').textContent='الأذان '+hhmm(T[nxt[0]]);
}
/* ================= audio for azkar ================= */
function cleanForSpeech(t){return (t||'').replace(/[۞۩۝﴿﴾]/g,' ').replace(/[\u06D6-\u06ED]/g,' ').replace(/\s+/g,' ').trim()}
function speakArabicText(text){
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){toast('الاستماع غير مدعوم على هذا الجهاز');return}
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(cleanForSpeech(text)); u.lang='ar-SA'; u.rate=.82; u.pitch=1;
  const voices=window.speechSynthesis.getVoices(); const ar=voices.find(v=>/^ar([_-]|$)/i.test(v.lang)); if(ar)u.voice=ar;
  window.speechSynthesis.speak(u); toast('بدأ الاستماع');
}
function speakAzkar(setId,i){
  const set=AZ.sets.find(x=>x.id===setId), z=set&&set.items[+i]; if(!z)return;
  speakArabicText(z.t);
}
function hisnHash(input){let h=2166136261;for(const c of String(input)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function normalizeHisn(raw){
  if(!raw||typeof raw!=='object')return [];
  return Object.entries(raw).map(([title,v],chapterIndex)=>({
    id:`h-${hisnHash(title)}`,chapterIndex,title,
    items:Array.isArray(v?.Adhkar)?v.Adhkar.map((z,itemIndex)=>({
      id:`hisn:${hisnHash(title+'|'+(z?.Text||'')+'|'+(z?.Reference||''))}`,
      itemIndex,text:z?.Text||'',count:Math.max(1,Number(z?.Count)||1),reference:z?.Reference||''
    })):[]
  }));
}
async function loadHisnFull(){
  if(HISN)return HISN;
  try{
    const cached=localStorage.getItem(HISN_CACHE_KEY);
    if(cached){HISN=normalizeHisn(JSON.parse(cached));if(HISN.length)return HISN}
  }catch{}
  let lastErr='';
  for(const url of [HISN_DATA_URL,HISN_DATA_FALLBACK]){
    try{
      const r=await fetch(url,{cache:'force-cache'}); if(!r.ok)throw new Error('HTTP '+r.status);
      const raw=await r.json(); const parsed=normalizeHisn(raw); if(!parsed.length)throw new Error('empty dataset');
      HISN=parsed; hisnLoadError='';
      try{localStorage.setItem(HISN_CACHE_KEY,JSON.stringify(raw))}catch{}
      return HISN;
    }catch(e){lastErr=String(e)}
  }
  hisnLoadError=lastErr||'تعذّر تحميل بيانات الكتاب'; HISN=[]; return HISN;
}
/* ================= azkar ================= */
async function loadAzkar(){ if(AZ.sets.length)return;
  try{ AZ=await (await fetch('./azkar.json')).json() }catch{ AZ={sets:[]} } }
async function renderAzkar(){
  await loadAzkar();
  const host=document.getElementById('az-wrap'); if(!host)return;
  host.innerHTML=`<input id="az-search" class="q-search" type="search" value="${azkarQuery.replace(/"/g,'&quot;')}" placeholder="ابحث في كل الأذكار وحصن المسلم…" aria-label="بحث في الأذكار">
    <div class="search-count" id="az-result-count"></div>
    <div class="az-tabs"><button data-az="hisn" aria-current="${azkarMode==='hisn'}">حصن المسلم كاملًا</button>${AZ.sets.map(x=>`<button data-az="${x.id}" aria-current="${x.id===azkarMode}">${x.name}</button>`).join('')}</div>
    <div class="audio-note">زر «استمع» يستخدم صوت القراءة العربي المتاح في جهازك/متصفحك. إن لم يوجد صوت عربي مناسب يمكنك الاكتفاء بالقراءة.</div>
    <div id="az-results"></div>`;
  host.onclick=e=>{
    const hs=e.target.closest('button[data-hisn-speak]'); if(hs){const c=HISN?.[+hs.dataset.hisnChapter],z=c?.items?.[+hs.dataset.hisnSpeak];if(z)speakArabicText(z.text);return}
    const hb=e.target.closest('button[data-hisn-back]'); if(hb){hisnChapter=null;renderAzkarList();return}
    const hc=e.target.closest('button[data-hisn-chapter]'); if(hc){hisnChapter=+hc.dataset.hisnChapter;renderAzkarList();return}
    const sp=e.target.closest('button[data-speak]'); if(sp){const [sid,i]=sp.dataset.speak.split(':');speakAzkar(sid,+i);return}
    const t=e.target.closest('button[data-az]');
    if(t){ azkarMode=t.dataset.az; if(azkarMode!=='hisn')hisnChapter=null; renderAzkar(); return }
    const target=e.target.closest('button[data-z]'); if(!target)return;
    const sid=target.dataset.set||azkarMode, set=AZ.sets.find(x=>x.id===sid); if(!set)return;
    const i=+target.dataset.z, z=set.items[i], key=sid+i, cur=data.azkar[key]||0;
    if(cur>=z.n)return;
    data.azkar[key]=cur+1;
    if(navigator.vibrate)navigator.vibrate(10);
    if(data.azkar[key]>=z.n){toast('تم الذكر — تقبّل الله');if(navigator.vibrate)navigator.vibrate([20,35,20])}
    renderAzkarList(); save('');
  };
  document.getElementById('az-search').oninput=e=>{azkarQuery=e.target.value;renderAzkarList()};
  await renderAzkarList();
}
function hisnItemHtml(ch,z){
  const save=laterRegister(z.id,{kind:'ذكر من حصن المسلم',title:ch.title,text:z.text,source:`حصن المسلم — ${z.reference||'راجع المرجع الرسمي'}`,tab:'azkar'});
  return `<article class="hisn-entry"><div class="hisn-entry-text">${escHtml(z.text).replace(/\n/g,'<br>')}</div>
    ${z.count>1?`<div class="hisn-repeat">التكرار المذكور في الكتاب: ${AR(z.count)}</div>`:''}
    <div class="hisn-entry-ref"><span class="src-label">التخريج في حصن المسلم</span><span>${escHtml(z.reference||'راجع المصدر الجامع')}</span></div>
    <div class="hisn-entry-actions">${save}<button type="button" data-hisn-chapter="${ch.chapterIndex}" data-hisn-speak="${z.itemIndex}">🔊 استمع</button></div></article>`;
}
async function renderAzkarList(){
  const box=document.getElementById('az-results'), cnt=document.getElementById('az-result-count'); if(!box||!cnt)return;
  const q=searchNorm(azkarQuery);
  const sourceHtml=(z,set=null)=>{if(!z.source)return '';if(set?.source&&sameSourceFamily(z.source,set.source))return '';return `<div class="zk-source source-ref"><span class="src-mark">↗</span><span class="src-copy"><span class="src-label">مصدر إضافي</span>${z.source.url?`<a href="${z.source.url}" target="_blank" rel="noopener">${z.source.label}</a>`:`<span class="src-text">${z.source.label}</span>`}</span></div>`};
  const actions=(set,z,i,c)=>{const lid=`azkar:${set.id}:${i}`;const plus=laterRegister(lid,{kind:'ذكر',title:set.name||'الأذكار',text:z.t,source:z.source?.label||'',tab:'azkar'});return `<div class="bar"><span class="cnt">${AR(c)} / ${AR(z.n)}</span><span class="zk-actions">${plus}<button class="listen" data-speak="${set.id}:${i}" type="button" aria-label="استمع إلى الذكر">🔊 استمع</button><button data-z="${i}" data-set="${set.id}">${c>=z.n?'تم ✓':'قرأت'}</button></span></div>`};
  if(q){
    const hits=[]; AZ.sets.forEach(set=>set.items.forEach((z,i)=>{if(searchNorm(set.name+' '+z.t+' '+(z.note||'')).includes(q))hits.push({type:'set',set,z,i})}));
    const full=await loadHisnFull(); full.forEach(ch=>ch.items.forEach(z=>{if(searchNorm(ch.title+' '+z.text+' '+z.reference).includes(q))hits.push({type:'hisn',ch,z})}));
    const shown=hits.slice(0,100);
    cnt.textContent=`${AR(hits.length)} نتيجة${hits.length>100?' · نعرض أول '+AR(100):''}`;
    box.innerHTML=shown.length?`<section>${shown.map(hit=>{if(hit.type==='hisn')return `<div class="search-source">حصن المسلم — ${escHtml(hit.ch.title)}</div>${hisnItemHtml(hit.ch,hit.z)}`;const {set,z,i}=hit,c=data.azkar[set.id+i]||0;return `<div class="zikr ${c>=z.n?'done':''}"><div class="search-source">${set.name}</div><div class="txt">${z.t.replace(/\n/g,'<br>')}</div>${z.note?`<div class="zk-note">${z.note}</div>`:''}${sourceHtml(z)}${actions(set,z,i,c)}</div>`}).join('')}</section>`:'<div class="nafs-empty">لا توجد أذكار مطابقة لبحثك.</div>';
    return;
  }
  if(azkarMode==='hisn'){
    const full=await loadHisnFull();
    if(!full.length){
      cnt.textContent='حصن المسلم';
      box.innerHTML=`<section class="hisn-book"><div class="hisn-title">حصن المسلم من أذكار الكتاب والسنة</div><div class="hisn-author">الشيخ سعيد بن علي بن وهف القحطاني</div><div class="hisn-note">تعذّر تحميل النسخة الرقمية الآن. يمكنك فتح النسخة الرسمية كاملة من رسالة الحرمين.</div><a class="hisn-open" href="https://risala.prh.gov.sa/ar/content/51" target="_blank" rel="noopener">فتح النسخة الرسمية الكاملة ↗</a></section>`;
      return;
    }
    if(hisnChapter!==null&&full[hisnChapter]){
      const ch=full[hisnChapter]; cnt.textContent=`${AR(ch.items.length)} ذكرًا في هذا الباب`;
      box.innerHTML=`<section class="hisn-book hisn-reader"><div class="hisn-reader-top"><button type="button" data-hisn-back>← فهرس حصن المسلم</button><span>${AR(ch.chapterIndex+1)} / ${AR(full.length)}</span></div><div class="hisn-title">${escHtml(ch.title)}</div><div class="hisn-canonical-source"><span>المصدر الجامع</span><a href="https://risala.prh.gov.sa/ar/content/51" target="_blank" rel="noopener">حصن المسلم — سعيد بن علي بن وهف القحطاني — رسالة الحرمين ↗</a></div>${ch.items.map(z=>hisnItemHtml(ch,z)).join('')}</section>`;
      return;
    }
    const total=full.reduce((n,ch)=>n+ch.items.length,0); cnt.textContent=`${AR(full.length)} بابًا · ${AR(total)} ذكرًا ودعاءً`;
    box.innerHTML=`<section class="hisn-book"><div class="hisn-title">حصن المسلم كاملًا</div><div class="hisn-author">الشيخ سعيد بن علي بن وهف القحطاني</div><p>فهرس كامل لأبواب الكتاب مع متن الذكر، عدد التكرار المذكور في الكتاب، والتخريج الظاهر تحت كل نص.</p><div class="hisn-canonical-source"><span>المرجع الشرعي المعتمد</span><a href="https://risala.prh.gov.sa/ar/content/51" target="_blank" rel="noopener">النسخة المنشورة في رسالة الحرمين — رئاسة الشؤون الدينية بالحرمين ↗</a></div><div class="hisn-digital-note">النسخة الرقمية المستخدمة للفهرسة داخل تدارُك مأخوذة من مشروع HisnElMuslim المفتوح بترخيص MIT؛ يذكر صاحبه أنه نقل النص من الكتاب وقارنه بنسخة رقمية لتصحيح الأخطاء. عند التعارض يُقدَّم المرجع الرسمي أعلاه.</div><div class="hisn-index">${full.map(ch=>`<button type="button" data-hisn-chapter="${ch.chapterIndex}"><span>${AR(ch.chapterIndex+1)}</span><b>${escHtml(ch.title)}</b><small>${AR(ch.items.length)} ذكرًا</small></button>`).join('')}</div></section>`;
    return;
  }
  const set=AZ.sets.find(x=>x.id===azkarMode)||AZ.sets[0]; if(!set)return;
  const L=set.items; let done=0;
  const rows=L.map((z,i)=>{ const c=data.azkar[set.id+i]||0; if(c>=z.n)done++;
    return `<div class="zikr ${c>=z.n?'done':''}"><div class="txt">${z.t.replace(/\n/g,'<br>')}</div>${z.note?`<div class="zk-note">${z.note}</div>`:''}${sourceHtml(z,set)}${actions(set,z,i,c)}</div>`}).join('');
  cnt.textContent=`${AR(L.length)} ذكرًا · أنجزت ${AR(done)}`;
  const ss=set.source||{};
  const sectionSource=ss.label?`<div class="az-section-source"><span class="az-src-kicker">مصدر هذا القسم</span><a href="${ss.url||'#'}" target="_blank" rel="noopener">${ss.label}</a>${ss.note?`<span>${ss.note}</span>`:''}</div>`:'';
  box.innerHTML=`<section><div class="sec-head"><span>${set.name}</span><span class="pct">${AR(done)} / ${AR(L.length)}</span></div><div class="az-time">${set.time||''}</div>${sectionSource}${rows}</section>`;
}

/* ================= tasbih + quran ================= */
function renderTasbih(){
  const d=DHIKR[dIdx];
  document.getElementById('dhikr-text').textContent=d.t;
  const src=document.getElementById('dhikr-source');
  if(src)src.innerHTML=d.source?`<span class="src-mark">↗</span><span class="src-copy"><span class="src-label">المصدر</span><a href="${d.source.u}" target="_blank" rel="noopener">${d.source.t}</a></span>`:'';
  document.getElementById('count').textContent=tCount;
  document.getElementById('target-line').textContent=d.n?`العدد الوارد ${d.n} — اليوم ${data.tasbih[dIdx]||0}`:`عداد اختياري للتنظيم — اليوم ${data.tasbih[dIdx]||0}`;
  const tot=Object.values(data.tasbih).reduce((a,b)=>a+b,0);
  document.getElementById('tasbih-today').textContent='إجمالي اليوم '+tot;
}
document.getElementById('tap').onclick=()=>{
  tCount++; data.tasbih[dIdx]=(data.tasbih[dIdx]||0)+1;
  if(navigator.vibrate) navigator.vibrate(12);
  if(DHIKR[dIdx].n&&tCount===DHIKR[dIdx].n){ toast('بلغت العدد الوارد'); if(navigator.vibrate)navigator.vibrate([30,50,30]) }
  renderTasbih(); save('') };
document.getElementById('reset-count').onclick=()=>{tCount=0;renderTasbih()};
document.getElementById('prev-dhikr').onclick=()=>{dIdx=(dIdx-1+DHIKR.length)%DHIKR.length;tCount=0;renderTasbih()};
document.getElementById('next-dhikr').onclick=()=>{dIdx=(dIdx+1)%DHIKR.length;tCount=0;renderTasbih()};

function renderQuran(){
  const goal=Math.ceil(604/(+settings.khatma||30));
  document.getElementById('q-pages').textContent=data.pages||0;
  document.getElementById('q-bar').style.width=Math.min(100,(data.pages||0)/goal*100)+'%';
  document.getElementById('q-status').textContent=
    `الورد اليومي ${goal} صفحة لختمة في ${settings.khatma||30} يومًا` +
    ((data.pages||0)>=goal?' — أتممتَ وردك اليوم ✓':'');
}
document.getElementById('q-plus').onclick=()=>{data.pages=(data.pages||0)+1;renderQuran();save('')};
document.getElementById('q-minus').onclick=()=>{data.pages=Math.max(0,(data.pages||0)-1);renderQuran();save('')};

/* ================= history ================= */
function histAzkarComplete(day,setId){
  const set=(AZ.sets||[]).find(x=>x.id===setId); if(!day||!set||!set.items?.length)return false;
  return set.items.every((z,i)=>(day.azkar?.[setId+i]||0)>=(z.n||1));
}
function histMetricCard(label,value,sub,kind=''){
  return `<div class="hist-card ${kind}"><div class="hist-label">${label}</div><div class="hist-value">${value}</div><div class="hist-sub">${sub}</div></div>`;
}
async function renderTracker(){
  const days=[];
  for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i);
    days.push({k:iso(d), day:(iso(d)===current)?data:await store.get('day:'+iso(d))}) }
  let qt={}; try{ qt=JSON.parse(localStorage.getItem('qalb-track'))||{} }catch{}
  const qalbOn=k=>Object.keys(qt[k]||{}).length>0;
  const defs=[
   ['خلاصة اليوم', d=>dailyRatingValues(d).length>0],
   ['الصلوات', d=>{ if(!d)return false; const v=Object.values(d.prayers||{}); return v.length>=5&&v.every(x=>x==='jamaah'||x==='time') }],
   ['أذكار الصباح', d=>histAzkarComplete(d,'morning')],
   ['أذكار المساء', d=>histAzkarComplete(d,'evening')],
   ['ورد القرآن', d=>d&&(d.pages||0)>0],
   ['السبحة', d=>d&&Object.values(d.tasbih||{}).reduce((a,b)=>a+b,0)>0],
   ['علاج القلب', (d,k)=>qalbOn(k)]
  ];
  const wd=k=>new Intl.DateTimeFormat('ar-EG',{weekday:'narrow'}).format(fromIso(k));
  document.getElementById('tracker').innerHTML=defs.map(([name,fn])=>{
    const cells=days.map(x=>`<i class="${fn(x.day,x.k)?'on':''} ${x.k===iso(new Date())?'today':''}" title="${x.k}">${fn(x.day,x.k)?'✓':wd(x.k)}</i>`).join('');
    let st=0; for(let i=days.length-1;i>=0;i--){ if(fn(days[i].day,days[i].k)) st++; else break }
    return `<div class="tr-row"><span class="tr-name">${name}</span><span class="tr-week">${cells}</span><span class="tr-st">${st>0?AR(st)+' 🔥':''}</span></div>`}).join('');
  return {days,qalbOn};
}
function renderHistoryPlain(days,qalbOn){
  const doneReview=days.filter(x=>dailyRatingValues(x.day).length>0).length;
  const qDays=days.filter(x=>x.day&&(x.day.pages||0)>0).length;
  const qPages=days.reduce((n,x)=>n+(x.day?.pages||0),0);
  const am=days.filter(x=>histAzkarComplete(x.day,'morning')).length;
  const pm=days.filter(x=>histAzkarComplete(x.day,'evening')).length;
  const heart=days.filter(x=>qalbOn(x.k)).length;
  let pRecorded=0,pOn=0;
  days.forEach(x=>Object.values(x.day?.prayers||{}).forEach(v=>{pRecorded++;if(v==='time'||v==='jamaah')pOn++}));
  const host=document.getElementById('history-summary');
  if(host)host.innerHTML=`<div class="hist-intro"><b>ماذا سجّلت هذا الأسبوع؟</b><span>الأرقام هنا تلخص ما سجلته داخل تدارُك فقط، وليست حكمًا على يومك أو عبادتك.</span></div><div class="hist-cards">${histMetricCard('خلاصة اليوم',`${AR(doneReview)} / ٧`,'أيام سجّلت فيها الخلاصة')}${histMetricCard('الصلاة',pRecorded?`${AR(pOn)} / ${AR(pRecorded)}`:'—',pRecorded?'من الصلوات التي سجّلتها كانت في وقتها':'لم تسجّل صلوات بعد')}${histMetricCard('القرآن',`${AR(qDays)} أيام`,`${AR(qPages)} صفحة مسجّلة`)}${histMetricCard('أذكار الصباح',`${AR(am)} / ٧`,'أيام أتممت فيها الورد')}${histMetricCard('أذكار المساء',`${AR(pm)} / ٧`,'أيام أتممت فيها الورد')}${histMetricCard('تزكية',heart?`${AR(heart)} أيام`:'—',heart?'تابعت خطوة من علاج القلب':'لا متابعة مسجلة هذا الأسبوع')}</div>`;
  const metrics=[
    {id:'review',label:'خلاصة اليوم',score:doneReview/7,detail:`سجّلتها ${AR(doneReview)} من ٧ أيام`,tab:'today'},
    {id:'quran',label:'ورد القرآن',score:qDays/7,detail:`قرأت في ${AR(qDays)} من ٧ أيام`,tab:'quran'},
    {id:'morning',label:'أذكار الصباح',score:am/7,detail:`أتممتها ${AR(am)} من ٧ أيام`,tab:'azkar'},
    {id:'evening',label:'أذكار المساء',score:pm/7,detail:`أتممتها ${AR(pm)} من ٧ أيام`,tab:'azkar'},
  ];
  if(pRecorded)metrics.push({id:'prayer',label:'الصلاة في وقتها',score:pOn/pRecorded,detail:`${AR(pOn)} من ${AR(pRecorded)} صلاة مسجّلة`,tab:'today'});
  metrics.sort((a,b)=>a.score-b.score);
  const low=metrics.slice(0,2), high=metrics.slice().sort((a,b)=>b.score-a.score)[0];
  const gap=document.getElementById('history-gaps');
  if(gap)gap.innerHTML=`<div class="hist-gap-head"><b>أين يظهر النقص في تسجيلك؟</b><span>نقارن بما سجلته أنت، لا بدرجات إيمان أو صلاح.</span></div>${low.map(x=>`<div class="hist-gap"><div><b>${x.label}</b><span>${x.detail}</span></div><button data-history-open="${x.tab}">افتح القسم</button></div>`).join('')}${high?`<div class="hist-win"><span>أكثر شيء حافظت على تسجيله:</span><b>${high.label}</b></div>`:''}`;
}
let historyArchiveRows=[],historyArchiveFilter='all',historyArchiveSelected='';
const historyRatingLabel=v=>{const hit=SCALE.find(([,n])=>Math.abs(+n-(+v||0))<.01);return hit?hit[0]:'—'};
const historyGoalReviewLabel=v=>Number.isInteger(v)?(TODO_REVIEW_SCALE.find(([,n])=>n===v)?.[0]||'—'):'غير مراجع';
function historyPrayerLabel(v){
  if(v==='jamaah')return isFemale()?'في وقتها':'جماعة';
  return ({time:'في وقتها',late:'متأخرة',missed:'فائتة'})[v]||'غير مسجلة';
}
function historyDayHas(day,tasks,kind='all'){
  const ratings=dailyRatingValues(day).length,prayers=Object.keys(day?.prayers||{}).length,plan=!!String(day?.goal||'').trim()||!!String(day?.target||'').trim()||tasks.length>0;
  if(kind==='review')return ratings>0;
  if(kind==='prayer')return prayers>0;
  if(kind==='plan')return plan;
  return ratings>0||prayers>0||plan||!!day?.mood||(+day?.pages||0)>0||Object.keys(day?.azkar||{}).length>0||Object.keys(day?.tasbih||{}).length>0||!!String(day?.tomorrow||'').trim();
}
async function collectHistoryArchive(){
  const keys=await store.keys('day:'),set=new Set(keys.filter(k=>/^day:\d{4}-\d{2}-\d{2}$/.test(k)).map(k=>k.slice(4)));
  todoItems.forEach(x=>{if(/^\d{4}-\d{2}-\d{2}$/.test(String(x.due||'')))set.add(x.due)});
  const rows=[];
  for(const key of [...set].sort().reverse()){
    const day=key===current?data:((await store.get('day:'+key))||null),tasks=todoForDay(key);
    if(historyDayHas(day,tasks,'all'))rows.push({key,day,tasks});
  }
  historyArchiveRows=rows;return rows;
}
function historyDaySummary(row){
  const {day,tasks}=row,ratings=dailyRatingValues(day),pr=Object.values(day?.prayers||{}),pOn=pr.filter(v=>v==='jamaah'||v==='time').length,a=todoAchievement(tasks),done=tasks.filter(x=>x.done).length;
  const chips=[];
  if(ratings.length)chips.push(`<span class="history-chip">التقييم ${AR(score(day))}%</span>`);
  if(pr.length)chips.push(`<span class="history-chip">الصلاة ${AR(pOn)}/${AR(pr.length)}</span>`);
  if(tasks.length)chips.push(`<span class="history-chip">المهام ${AR(done)}/${AR(tasks.length)}${a.reviewed?` · مراجع ${AR(a.reviewed)}`:''}</span>`);
  if((day?.pages||0)>0)chips.push(`<span class="history-chip">القرآن ${AR(day.pages)} ص</span>`);
  return chips.join('');
}
function renderHistoryArchiveList(){
  const host=document.getElementById('history-archive'),count=document.getElementById('history-archive-count');if(!host)return;
  const rows=historyArchiveRows.filter(r=>historyDayHas(r.day,r.tasks,historyArchiveFilter));
  if(count)count.textContent=`${AR(rows.length)} يوم مسجل`;
  const shown=rows.slice(0,120);
  host.innerHTML=shown.length?`<div class="history-archive-list">${shown.map(r=>{
    const dt=new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(fromIso(r.key));
    const note=String(r.day?.goal||r.day?.target||r.day?.mood||'').trim();
    return `<button class="history-day-row" data-history-day="${r.key}" type="button"><div class="history-day-main"><b>${dt}</b><span>${note?todoEsc(note):'تسجيل يومي محفوظ'}</span></div><div class="history-day-metrics">${historyDaySummary(r)}</div><i>‹</i></button>`}).join('')}</div>${rows.length>shown.length?`<div class="history-archive-empty">يعرض السجل أحدث ${AR(shown.length)} يوم هنا. استخدم خانة التاريخ بالأعلى للوصول لأي يوم أقدم.</div>`:''}`:'<div class="history-archive-empty">لا توجد أيام مطابقة لهذا الفلتر بعد.</div>';
}
async function showHistoryDay(key){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(key||'')))return;
  historyArchiveSelected=key;const row=historyArchiveRows.find(x=>x.key===key),day=row?.day||((await store.get('day:'+key))||null),tasks=row?.tasks||todoForDay(key),host=document.getElementById('history-day-detail');if(!host)return;
  const ratings=dailyRatingValues(day),pr=day?.prayers||{},goal=String(day?.goal||'').trim(),target=String(day?.target||'').trim(),a=todoAchievement(tasks);
  const selfLines=ALL_ITEMS.map(([id,name])=>`<div class="history-detail-line"><span>${name}</span><b>${day?.ratings?.[id]!==undefined?historyRatingLabel(day.ratings[id]):'—'}</b></div>`).join('');
  const prayerPills=PRAYERS.map(([id,name])=>{const v=pr[id];return `<span class="${v?'on':''}">${name}: ${historyPrayerLabel(v)}</span>`}).join('');
  const taskLines=tasks.length?tasks.map(x=>`<div class="history-detail-line"><span>${todoEsc(x.text)}</span><b>${Number.isInteger(x.review)?historyGoalReviewLabel(x.review):(x.done?'منجزة · غير مقيّمة':'غير مقيّمة')}</b></div>`).join(''):'<span>لا مهام محفوظة لهذا اليوم.</span>';
  host.innerHTML=`<div class="history-day-detail"><div class="history-day-detail-head"><div><small>تفاصيل يوم محفوظ</small><b>${new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(fromIso(key))}</b></div><button data-history-edit-day="${key}" type="button">فتح اليوم وتعديله</button></div><div class="history-day-detail-grid">
    <div class="history-detail-card"><small>خلاصة اليوم</small><b>${ratings.length?`${AR(score(day))}%`:'لم تُسجّل'}</b><span>${day?.mood?`الحالة: ${todoEsc(day.mood)}`:'لا توجد حالة مزاجية مسجلة'}</span><div class="history-detail-list">${selfLines}</div></div>
    <div class="history-detail-card"><small>الصلوات</small><b>${Object.keys(pr).length?`${AR(Object.keys(pr).length)} صلوات مسجلة`:'لم تُسجّل'}</b><div class="history-prayer-pills">${prayerPills}</div></div>
    <div class="history-detail-card wide"><small>خطة اليوم</small><b>${goal?todoEsc(goal):'لا يوجد هدف مكتوب'}</b><span>${target?`التارجت: ${todoEsc(target)} · نتيجة الهدف: ${historyGoalReviewLabel(day?.goalReview)}`:`نتيجة الهدف: ${historyGoalReviewLabel(day?.goalReview)}`}</span>${tasks.length?`<span>تقييم المهام: ${a.reviewed?`${AR(a.pct)}% من ${AR(a.reviewed)} مهمة مقيّمة`:'لم تُقيّم المهام نهائيًا'}</span>`:''}<div class="history-detail-list">${taskLines}</div></div>
    <div class="history-detail-card"><small>القرآن</small><b>${AR(day?.pages||0)} صفحة</b><span>العدد الذي سجلته في هذا اليوم.</span></div>
    <div class="history-detail-card"><small>ملاحظة للغد</small><b>${day?.tomorrow?todoEsc(day.tomorrow):'—'}</b><span>${day?.tomorrow?'محفوظة من مراجعة هذا اليوم':'لا توجد ملاحظة'}</span></div>
  </div></div>`;
  const date=document.getElementById('history-date');if(date)date.value=key;
}
async function renderHistoryArchive(){
  const rows=await collectHistoryArchive();const filter=document.getElementById('history-filter');if(filter)filter.value=historyArchiveFilter;
  renderHistoryArchiveList();
  const preferred=historyArchiveSelected||(rows.find(r=>r.key===current)?.key)||rows[0]?.key||current;await showHistoryDay(preferred);
}

async function renderHistory(){
  await loadAzkar();
  const tr=await renderTracker(), days=tr.days;
  renderHistoryPlain(days,tr.qalbOn);
  const days28=[]; for(let i=27;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days28.push({key:iso(d),day:await store.get('day:'+iso(d))})}
  document.getElementById('grid').innerHTML=days28.map(x=>{const c=x.day?shade(score(x.day)):'';return `<i title="${x.key}" style="background:${c||'var(--wash)'}"></i>`}).join('');
  const filled=days28.filter(x=>dailyRatingValues(x.day).length);
  document.getElementById('s-avg').textContent=(filled.length?Math.round(filled.reduce((a,x)=>a+score(x.day),0)/filled.length):0)+'%';
  let streak=0; for(let i=days28.length-1;i>=0;i--){const on=dailyRatingValues(days28[i].day).length>0;if(on)streak++;else break}
  document.getElementById('s-streak').textContent=streak;
  let good=0,tot=0,pages=0; days28.forEach(x=>{if(!x.day)return;pages+=x.day.pages||0;Object.values(x.day.prayers||{}).forEach(v=>{tot++;if(v==='jamaah'||v==='time')good++})});
  document.getElementById('s-prayers').textContent=(tot?Math.round(good/tot*100):0)+'%'; document.getElementById('s-pages').textContent=pages;
  const tot2={}; ALL_ITEMS.forEach(([id,n])=>tot2[id]={n,sum:0,c:0});
  filled.forEach(x=>Object.entries(x.day.ratings||{}).forEach(([id,v])=>{if(tot2[id]){tot2[id].sum+=v;tot2[id].c++}}));
  const weak=Object.values(tot2).filter(x=>x.c).sort((a,b)=>a.sum/a.c-b.sum/b.c).slice(0,4);
  document.getElementById('weak').innerHTML=weak.length?weak.map(x=>`<div class="item"><div class="row"><span>${x.n}</span><span class="muted">${Math.round(x.sum/x.c/4*100)}%</span></div></div>`).join(''):'<div class="item"><div class="muted">سجّل خلاصة يومك ليظهر هذا التفصيل.</div></div>';
  renderFasting();
  await renderHistoryArchive();
  const hv=document.getElementById('v-history');
  hv.onclick=async e=>{
    const b=e.target.closest('[data-history-open]');if(b){switchTab(b.dataset.historyOpen);return}
    const row=e.target.closest('[data-history-day]');if(row){await showHistoryDay(row.dataset.historyDay);document.getElementById('history-day-detail')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    const edit=e.target.closest('[data-history-edit-day]');if(edit){await load(edit.dataset.historyEditDay);switchTab('today');setEvening(true);setTimeout(()=>document.getElementById('evening-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),90);return}
    if(e.target.closest('#history-open-date')){const key=document.getElementById('history-date')?.value;if(key)await showHistoryDay(key)}
  };
  const hf=document.getElementById('history-filter');if(hf)hf.onchange=()=>{historyArchiveFilter=hf.value;renderHistoryArchiveList()};
}
function renderFasting(){
  const out=[]; const d=new Date();
  for(let i=0;i<40 && out.length<5;i++){
    const x=new Date(); x.setDate(d.getDate()+i); let hd=null;
    try{hd=+new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn',{day:'numeric'}).format(x)}catch{}
    const wd=x.getDay(),labels=[]; if(hd&&[13,14,15].includes(hd))labels.push('الأيام البيض'); if(wd===1)labels.push('الاثنين'); if(wd===4)labels.push('الخميس');
    if(labels.length)out.push({x,labels});
  }
  document.getElementById('fasting').innerHTML=out.length?out.map(o=>`<div class="item"><div class="row"><span>${new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long'}).format(o.x)}</span><span class="muted">${o.labels.join(' · ')}</span></div></div>`).join(''):'<div class="item"><div class="muted">—</div></div>';
}


function renderTimes(){
  const host=document.getElementById('times'); if(!host)return;
  const T=todayTimes();
  if(!T){ host.innerHTML='<div class="item"><div class="muted">حدّد موقعك من الإعدادات ⚙ لعرض المواقيت.</div></div>';
    return }
  const rows=[['fajr','الفجر'],['sunrise','الشروق'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
  const nowH=new Date().getHours()+new Date().getMinutes()/60;
  const nx=rows.findIndex(([k])=>T[k]>nowH);
  host.innerHTML=rows.map(([k,n],i)=>
    `<div class="p-row ${i===nx?'now':''}"><span class="p-name">${n}</span>
     <span style="font-size:16px;font-variant-numeric:tabular-nums">${hhmm(T[k])}</span></div>`).join('');
  if(settings.lat&&settings.lng)
    document.getElementById('qibla-deg').textContent=Math.round(qiblaBearing(+settings.lat,+settings.lng))+'° من الشمال';
}
document.getElementById('acc-notes').onclick=e=>{
  const h=e.target.closest('.acc-head'); if(!h)return;
  const b=h.nextElementSibling; const closed=b.classList.toggle('hide');
  h.querySelector('.acc-x').textContent=closed?'＋':'－';
};
document.getElementById('acc-times').onclick=e=>{
  const h=e.target.closest('.acc-head'); if(!h)return;
  const b=h.nextElementSibling; const open=b.classList.toggle('hide');
  h.querySelector('.acc-x').textContent=open?'＋':'－';
  if(!open) renderTimes() };

/* ================= القرآن — عرض بالصفحات ================= */
let Q=null, qPage=1, qFont=+(localStorage.getItem('qFont')||23), qZoom=+(localStorage.getItem('mushafZoom')||100), qAyaPage={}, qTransientAyah=null;
const MUSHAF_SVG_REV='0198423eb867ba26051aba6ac902cd5d10aadd1b';
const MUSHAF_SVG_BASE=`https://cdn.jsdelivr.net/gh/quranpedia/quran-svg@${MUSHAF_SVG_REV}/mushafs/hafs/kfqc/svg/`;
const MUSHAF_SVG_FALLBACK=`https://raw.githubusercontent.com/quranpedia/quran-svg/${MUSHAF_SVG_REV}/mushafs/hafs/kfqc/svg/`;
const MUSHAF_OFFLINE_CACHE='tadaruq-mushaf-kfqc-r43-v1';
const MUSHAF_TOTAL_PAGES=604;
const padMushafPage=p=>String(p).padStart(3,'0');
const mushafSvgCache=new Map();
let mushafPageDirection=0, mushafFullscreen=false, mushafControlsHidden=false;
let readerChromeHidden=false,readerChromeTimer=null;
let readerHistoryActive=false,readerReturnTab='quran',readerLeaveTarget=null,readerLeaveAction='';
let tafsirHistoryActive=false,tafsirRequestToken=0,muyassarHistoryActive=false;
let mushafOfflineJob={active:false,cancelled:false,done:0,failed:0};
function setReaderChromeHidden(hidden){
  readerChromeHidden=!!hidden;
  document.body.classList.toggle('reader-chrome-hidden',tab==='read'&&readerChromeHidden&&!mushafFullscreen);
}
function scheduleReaderChromeHide(delay=2800){
  clearTimeout(readerChromeTimer);readerChromeTimer=null;
  if(tab!=='read'||mushafFullscreen)return;
  setReaderChromeHidden(false);
  readerChromeTimer=setTimeout(()=>{if(tab==='read'&&!mushafFullscreen)setReaderChromeHidden(true)},delay);
}
function syncReaderSurface(nextTab){
  const reading=nextTab==='read';
  document.body.classList.toggle('quran-reading',reading);
  if(!reading){clearTimeout(readerChromeTimer);readerChromeTimer=null;setReaderChromeHidden(false);return}
  scheduleReaderChromeHide(3200);
}

function searchNorm(x){ return (x||'').toString().toLowerCase().replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06edـ]/g,'').replace(/ٱ/g,'ا').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim() }
function deepSearchText(v){ if(v==null)return ''; if(typeof v==='string'||typeof v==='number')return String(v); if(Array.isArray(v))return v.map(deepSearchText).join(' '); if(typeof v==='object')return Object.entries(v).filter(([k])=>!['u','url','link','video'].includes(k)).map(([,x])=>deepSearchText(x)).join(' '); return '' }
const QKEY='quran-pos';
const JUZ_AR=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر',
 'الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر','السادس عشر','السابع عشر','الثامن عشر',
 'التاسع عشر','العشرون','الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون',
 'الخامس والعشرون','السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','الثلاثون'];

async function loadQuran(){ if(Q)return Q;
  try{ Q=await (await fetch('./quran.json')).json() }catch{ Q={suras:[],pages:[],juz:[]} }
  qAyaPage={}; (Q.pages||[]).forEach((runs,pi)=>(runs||[]).forEach(([sn,from,to])=>{for(let a=from;a<=to;a++)qAyaPage[sn+':'+a]=pi+1}));
  return Q }
const suraOf=n=>Q.suras[n-1];
const juzOf=p=>{ let j=1; Q.juz.forEach((sp,i)=>{ if(p>=sp) j=i+1 }); return j };

async function openQuran(){ await loadQuran(); renderAyaDay(); renderResume(); renderSurahList(); refreshMushafOfflineUI().catch(()=>{}) }
let quranToolsRequested=false;
async function openQuranReaderDefault(){
  await loadQuran();
  const saved=(await store.get(QKEY))||{};
  await openPage(saved.page||1);
}
function readerReturnDestination(t){
  if(!t||t==='read')return 'quran';
  return t;
}
function armReaderHistory(fromTab){
  if(readerHistoryActive)return;
  readerReturnTab=readerReturnDestination(fromTab);
  try{history.pushState({...(history.state||{}),tadaruqReader:true},'',location.href);readerHistoryActive=true}catch{}
}
function finishReaderLeave(target){
  const go=readerReturnDestination(target||readerReturnTab);
  readerLeaveTarget=null;
  if(go==='quran'){quranToolsRequested=true;switchTab('quran')}else switchTab(go);
  if(readerLeaveAction==='search'){readerLeaveAction='';setTimeout(()=>{const q=document.getElementById('q-search');q?.scrollIntoView({behavior:'smooth',block:'center'});q?.focus()},90)}else readerLeaveAction='';
}
function leaveQuranReader(target=null,fromPop=false){
  if(mushafFullscreen)exitMushafFullscreen();
  closeAyahMenu();
  const go=target||readerReturnTab||'quran';
  if(fromPop){readerHistoryActive=false;finishReaderLeave(go);return}
  if(readerHistoryActive){readerLeaveTarget=go;try{history.back();return}catch{}}
  readerHistoryActive=false;finishReaderLeave(go);
}
function openQuranTools(){
  if(tab==='read'){leaveQuranReader('quran');return}
  if(mushafFullscreen)exitMushafFullscreen(); quranToolsRequested=true; switchTab('quran');
}
function openQuranSearch(){
  if(tab==='read'){readerLeaveAction='search';leaveQuranReader('quran');return}
  openQuranTools();
  setTimeout(()=>{const q=document.getElementById('q-search');q?.scrollIntoView({behavior:'smooth',block:'center'});q?.focus()},90);
}
const MUYASSAR_BOOK_URL='https://qurancomplex.gov.sa/kfgqpc-books-tafseer-muyassar/';
const MUYASSAR_API_BASE='https://api.alquran.cloud/v1/ayah/';
const MUYASSAR_FULL_API_URL='https://api.alquran.cloud/v1/quran/ar.muyassar';
const MUYASSAR_API_EDITION='ar.muyassar';
const MUYASSAR_CACHE='tadaruq-tafsir-muyassar-r45-v1';
const muyassarMemory=new Map();
let muyassarCorpus=null,muyassarCorpusSource='',muyassarReaderSurah=1,muyassarReaderQuery='',tafsirCurrentTarget={s:1,a:1};
const muyassarApiUrl=(s,a)=>`${MUYASSAR_API_BASE}${encodeURIComponent(s||1)}:${encodeURIComponent(a||1)}/${MUYASSAR_API_EDITION}`;
function firstAyahOnPage(){const run=(Q?.pages?.[qPage-1]||[])[0];return run?{s:+run[0],a:+run[1]}:{s:1,a:1}}
function tafsirTarget(){return firstAyahOnPage()}
function tafsirVerseText(t){const su=Q&&suraOf(t.s);return su?.a?.[Math.max(0,(+t.a||1)-1)]||''}
function plainTafsirText(v){
  const box=document.createElement('div');box.innerHTML=String(v||'');
  return (box.textContent||box.innerText||'').replace(/\s+/g,' ').trim();
}
function validateMuyassarCorpus(payload){
  const edition=payload?.data?.edition?.identifier, surahs=payload?.data?.surahs;
  if(payload?.code!==200||!Array.isArray(surahs)||surahs.length!==114||(edition&&edition!==MUYASSAR_API_EDITION))throw new Error('muyassar-invalid-corpus');
  const normalized=surahs.map((su,si)=>({number:+su.number||si+1,name:String(su.name||''),ayahs:(su.ayahs||[]).map((a,ai)=>({number:+a.numberInSurah||ai+1,text:plainTafsirText(a.text)}))}));
  const total=normalized.reduce((n,su)=>n+su.ayahs.length,0);
  if(total!==6236||normalized.some(su=>!su.ayahs.length||su.ayahs.some(a=>!a.text)))throw new Error('muyassar-incomplete-corpus');
  return normalized;
}
async function cachedMuyassarCorpusResponse(){
  if(!('caches' in window))return null;
  try{return await (await caches.open(MUYASSAR_CACHE)).match(MUYASSAR_FULL_API_URL)}catch{return null}
}
async function loadMuyassarCorpus({allowNetwork=true,force=false}={}){
  if(muyassarCorpus&&!force)return muyassarCorpus;
  let response=force?null:await cachedMuyassarCorpusResponse(),source=response?'cache':'';
  if(!response&&allowNetwork){
    const requestUrl=force?`${MUYASSAR_FULL_API_URL}?refresh=${Date.now()}`:MUYASSAR_FULL_API_URL;
    response=await fetch(requestUrl,{cache:'no-cache',headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('muyassar-corpus-http-'+response.status);
    source='network';
    if('caches' in window){try{await (await caches.open(MUYASSAR_CACHE)).put(MUYASSAR_FULL_API_URL,response.clone())}catch{}}
  }
  if(!response)throw new Error('muyassar-corpus-not-cached');
  const payload=await response.json();
  muyassarCorpus=validateMuyassarCorpus(payload);muyassarCorpusSource=source;
  muyassarCorpus.forEach(su=>su.ayahs.forEach(a=>muyassarMemory.set(`${su.number}:${a.number}`,a.text)));
  return muyassarCorpus;
}
async function loadMuyassarAyah(s,a){
  const key=`${+s}:${+a}`;if(muyassarMemory.has(key))return muyassarMemory.get(key);
  try{await loadMuyassarCorpus({allowNetwork:false});if(muyassarMemory.has(key))return muyassarMemory.get(key)}catch{}
  const url=muyassarApiUrl(s,a);let response=null;
  if('caches' in window){try{response=await (await caches.open(MUYASSAR_CACHE)).match(url)}catch{}}
  if(!response){
    response=await fetch(url,{cache:'no-cache',headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('muyassar-http-'+response.status);
    if('caches' in window){try{await (await caches.open(MUYASSAR_CACHE)).put(url,response.clone())}catch{}}
  }
  const payload=await response.json();
  const edition=payload?.data?.edition?.identifier;
  if(payload?.code!==200||!payload?.data?.text||(edition&&edition!==MUYASSAR_API_EDITION))throw new Error('muyassar-invalid-response');
  const text=plainTafsirText(payload.data.text);if(!text)throw new Error('muyassar-empty');
  muyassarMemory.set(key,text);return text;
}
function paintMuyassarContent(text){
  const host=document.getElementById('tafsir-sheet-content');if(!host)return;host.replaceChildren();
  const wrap=document.createElement('div');wrap.className='tafsir-official-text';
  const badge=document.createElement('div');badge.className='tafsir-official-badge';badge.textContent='التفسير الميسر · مجمع الملك فهد';
  const para=document.createElement('p');para.textContent=text;
  const note=document.createElement('div');note.className='tafsir-transport-note';note.textContent='التفسير الميسر · مجمع الملك فهد. يحتفظ تدارُك بالنص المرجعي محليًا عند توفر النسخة الكاملة أو بعد تحميل الآية.';
  wrap.append(badge,para,note);host.appendChild(wrap);
}
function paintMuyassarError(){
  const host=document.getElementById('tafsir-sheet-content');if(!host)return;host.innerHTML='<div class="tafsir-inline-note"><b>تعذّر تحميل نص التفسير الآن</b><p>لم نضع شرحًا بديلًا أو مولدًا. استخدم رابط التفسير الميسر لهذه الآية أدناه، ثم أعد المحاولة عند توفر الاتصال.</p></div>';
}
function closeTafsirSheet(fromPop=false){
  const sh=document.getElementById('tafsir-sheet');if(!sh||sh.classList.contains('hide'))return;
  if(!fromPop&&tafsirHistoryActive){try{history.back();return}catch{}}
  sh.classList.add('hide');sh.setAttribute('aria-hidden','true');tafsirHistoryActive=false;tafsirRequestToken++;
}
let muyassarReturnFocus=null;
function muyassarReaderStatus(text,error=false){const el=document.getElementById('muyassar-reader-status');if(el){el.textContent=text||'';el.classList.toggle('error',!!error)}}
function bindMuyassarReaderControls(){
  const sel=document.getElementById('muyassar-surah-select'),search=document.getElementById('muyassar-search');
  sel?.addEventListener('change',()=>{muyassarReaderSurah=Math.max(1,Math.min(114,+sel.value||1));muyassarReaderQuery='';renderMuyassarReader()});
  search?.addEventListener('input',()=>{muyassarReaderQuery=search.value||'';renderMuyassarReaderList()});
  document.getElementById('muyassar-prev')?.addEventListener('click',()=>{muyassarReaderSurah=Math.max(1,muyassarReaderSurah-1);muyassarReaderQuery='';renderMuyassarReader()});
  document.getElementById('muyassar-next')?.addEventListener('click',()=>{muyassarReaderSurah=Math.min(114,muyassarReaderSurah+1);muyassarReaderQuery='';renderMuyassarReader()});
  document.getElementById('muyassar-refresh')?.addEventListener('click',async()=>{muyassarReaderStatus('جارٍ تحديث النسخة الكاملة…');try{await loadMuyassarCorpus({allowNetwork:true,force:true});renderMuyassarReader();muyassarReaderStatus('تم تحديث التفسير الكامل وحفظه للعمل بدون إنترنت.')}catch{muyassarReaderStatus('تعذّر تحديث النسخة الآن. النسخة المحفوظة — إن وجدت — لم تُحذف.',true)}});
}
function renderMuyassarReaderList(){
  const host=document.getElementById('muyassar-reader-list');if(!host||!muyassarCorpus)return;
  const su=muyassarCorpus[muyassarReaderSurah-1],qsu=Q?.suras?.[muyassarReaderSurah-1],query=searchNorm(muyassarReaderQuery);
  const items=su.ayahs.filter((a,i)=>!query||searchNorm(a.text+' '+(qsu?.a?.[i]||'')).includes(query));
  host.innerHTML=items.length?items.map(a=>{const verse=qsu?.a?.[Math.max(0,a.number-1)]||'';return `<article class="muyassar-ayah-card" data-ayah="${a.number}"><div class="muyassar-ayah-ref">${escHtml(su.name||qsu?.name||'السورة')} · الآية ${AR(a.number)}</div><div class="muyassar-ayah-quran">${escHtml(verse)}</div><div class="muyassar-ayah-tafsir">${escHtml(a.text)}</div></article>`}).join(''):'<div class="muyassar-empty">لا توجد نتائج داخل هذه السورة.</div>';
}
function renderMuyassarReader(){
  if(!muyassarCorpus)return;
  const sel=document.getElementById('muyassar-surah-select'),search=document.getElementById('muyassar-search');
  if(sel){sel.innerHTML=muyassarCorpus.map(su=>`<option value="${su.number}"${su.number===muyassarReaderSurah?' selected':''}>${AR(su.number)} · ${escHtml(su.name||Q?.suras?.[su.number-1]?.name||'')}</option>`).join('');sel.value=String(muyassarReaderSurah)}
  if(search)search.value=muyassarReaderQuery;
  const prev=document.getElementById('muyassar-prev'),next=document.getElementById('muyassar-next');if(prev)prev.disabled=muyassarReaderSurah<=1;if(next)next.disabled=muyassarReaderSurah>=114;
  renderMuyassarReaderList();
  muyassarReaderStatus(muyassarCorpusSource==='cache'?'التفسير الكامل محفوظ على الجهاز ويعمل بدون إنترنت.':'تم تحميل التفسير الكامل وحفظه على الجهاز للعمل بدون إنترنت.');
}
async function openMuyassarSheet(surahNo=null){
  const sh=document.getElementById('muyassar-sheet');if(!sh)return;
  muyassarReturnFocus=document.activeElement;
  if(surahNo)muyassarReaderSurah=Math.max(1,Math.min(114,+surahNo||1));
  const wasHidden=sh.classList.contains('hide');sh.classList.remove('hide');sh.setAttribute('aria-hidden','false');document.body.classList.add('muyassar-open');
  if(wasHidden&&!muyassarHistoryActive){try{history.pushState({...(history.state||{}),tadaruqMuyassar:true},'',location.href);muyassarHistoryActive=true}catch{}}
  await loadQuran();muyassarReaderStatus('جارٍ تجهيز التفسير الميسر الكامل…');
  try{await loadMuyassarCorpus({allowNetwork:true});renderMuyassarReader();document.getElementById('muyassar-search')?.focus({preventScroll:true})}
  catch{muyassarReaderStatus('تعذّر تحميل النسخة الكاملة الآن. افتحها مرة واحدة أثناء الاتصال بالإنترنت ليحتفظ بها تدارُك للعمل بدون إنترنت.',true)}
}
function closeMuyassarSheet(fromPop=false){
  const sh=document.getElementById('muyassar-sheet');if(!sh||sh.classList.contains('hide'))return;
  if(!fromPop&&muyassarHistoryActive){try{history.back();return}catch{}}
  sh.classList.add('hide');sh.setAttribute('aria-hidden','true');document.body.classList.remove('muyassar-open');muyassarHistoryActive=false;
  if(muyassarReturnFocus&&typeof muyassarReturnFocus.focus==='function')muyassarReturnFocus.focus();muyassarReturnFocus=null;
}
async function openTafsirSheet(t=tafsirTarget()){
  const sh=document.getElementById('tafsir-sheet');if(!sh)return window.open(muyassarAyahUrl(t.s,t.a),'_blank','noopener');
  await loadQuran();
  const target={s:Math.max(1,+t.s||1),a:Math.max(1,+t.a||1)},su=Q&&suraOf(target.s),verse=tafsirVerseText(target);tafsirCurrentTarget=target;
  document.getElementById('tafsir-sheet-ref').textContent=`${su?su.name:'السورة'} — الآية ${AR(target.a)}`;document.getElementById('tafsir-sheet-ayah').textContent=verse;
  const host=document.getElementById('tafsir-sheet-content');if(host)host.innerHTML='<div class="tafsir-loading">جارٍ تحميل نص التفسير الميسر لهذه الآية…</div>';
  const wasHidden=sh.classList.contains('hide');sh.classList.remove('hide');sh.setAttribute('aria-hidden','false');
  if(wasHidden&&!tafsirHistoryActive){try{history.pushState({...(history.state||{}),tadaruqTafsir:true},'',location.href);tafsirHistoryActive=true}catch{}}
  const token=++tafsirRequestToken;
  try{const text=await loadMuyassarAyah(target.s,target.a);if(token===tafsirRequestToken&&!sh.classList.contains('hide'))paintMuyassarContent(text)}
  catch{if(token===tafsirRequestToken&&!sh.classList.contains('hide'))paintMuyassarError()}
}
function updateTafsirPanel(){const el=document.getElementById('tafsir-current');if(!el)return;const t=tafsirTarget(),su=Q&&suraOf(t.s);el.innerHTML=`<div class="tafsir-current-copy"><span>تفسير الآية</span><b>${su?su.name:'السورة'} — الآية ${AR(t.a)}</b><small>التفسير الميسر — مجمع الملك فهد.</small></div><button type="button" class="tafsir-open-btn" data-tafsir-open>افتح التفسير</button>`;el.querySelector('[data-tafsir-open]')?.addEventListener('click',()=>openTafsirSheet(t))}
function openCurrentTafsir(){return openTafsirSheet(tafsirTarget())}

function renderSurahList(){
  const raw=(document.getElementById('q-search').value||'').trim(), q=searchNorm(raw);
  const host=document.getElementById('q-list'), cnt=document.getElementById('q-result-count');
  if(!q){
    cnt.textContent=`${AR(Q.suras.length)} سورة`;
    host.innerHTML=Q.suras.map(x=>
      `<div class="q-row" data-p="${x.page}"><span class="q-num">${AR(x.n)}</span>
        <span><span class="q-nm">${x.name}</span><div class="q-mt">${AR(x.a.length)} آية · صفحة ${AR(x.page)}</div></span>
        <span class="q-badge">﴾</span></div>`).join('');
    return;
  }
  const numeric=/^[0-9٠-٩]+$/.test(raw);
  const sHits=Q.suras.filter(x=>searchNorm(x.name).includes(q)||String(x.n)===raw||AR(x.n)===raw);
  const verses=[];
  if(!numeric&&q.length>=2){
    Q.suras.forEach(x=>x.a.forEach((t,i)=>{ if(searchNorm(t).includes(q)) verses.push({s:x,a:i+1,t,p:qAyaPage[x.n+':'+(i+1)]||x.page}) }));
  }
  const total=sHits.length+verses.length, shown=verses.slice(0,80);
  cnt.textContent=total?`${AR(total)} نتيجة${verses.length>80?' · نعرض أول '+AR(sHits.length+80):''}`:'لا توجد نتائج';
  host.innerHTML=(sHits.map(x=>
      `<div class="q-row" data-p="${x.page}"><span class="q-num">${AR(x.n)}</span>
        <span><span class="q-nm">${x.name}</span><div class="q-mt">سورة · ${AR(x.a.length)} آية</div></span><span class="q-badge">﴾</span></div>`).join('')+
    shown.map(v=>`<div class="q-row" data-p="${v.p}"><span class="q-num">${AR(v.a)}</span>
      <span><div class="search-source">المصدر: القرآن الكريم — ${v.s} — آية ${AR(v.a)}</div><div class="q-vtxt">${v.t}</div></span><span class="q-badge">←</span></div>`).join('')) ||
    '<div class="nafs-empty">لا توجد نتائج مطابقة. جرّب كلمة أخرى.</div>';
}
document.getElementById('q-search').oninput=renderSurahList;
document.getElementById('q-list').onclick=e=>{
  const r=e.target.closest('.q-row'); if(r) openPage(+r.dataset.p) };

async function renderResume(){
  const p=await store.get(QKEY); const el=document.getElementById('q-resume');
  if(!p||!p.page){ el.style.display='none'; return }
  el.style.display='block';
  el.innerHTML=`<div class="k">أكمل القراءة</div>
    <div class="v">${p.sura||''}</div>
    <div class="m">صفحة ${AR(p.page)} · الجزء ${JUZ_AR[juzOf(p.page)-1]}</div>`;
  el.onclick=()=>openPage(p.page);
}
function renderAyaDay(){
  if(!Q.suras.length)return;
  const seed=Math.floor(Date.now()/86400000);
  const s=Q.suras[seed%114], i=seed%s.a.length;
  const el=document.getElementById('aya-day');
  el.innerHTML=`${laterRegister(`quran:day:${s.n}:${i+1}`,{kind:'آية',title:`${s.name} — ${i+1}`,text:s.a[i],source:`القرآن الكريم — ${s.name} — الآية ${i+1}`,tab:'quran'})}<div class="lbl">آية اليوم</div><div class="txt">${s.a[i]}</div>
     <div class="ref">المصدر: القرآن الكريم — ${s.name} — الآية ${AR(i+1)}</div>`;
  el.onclick=()=>openPage(s.page);
}

function renderQuranTextFallback(runs,mark){
  let html='';
  runs.forEach(([sn,from,to])=>{
    const su=suraOf(sn);
    if(from===1){ html+=`<div class="sura-band"><span>سُورَةُ ${su.name}</span></div>`;
      if(sn!==1&&sn!==9) html+=`<div class="mus-bsm">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>` }
    for(let i=from;i<=to;i++) html+=`<span class="ay" data-s="${sn}" data-a="${i}">${su.a[i-1]} </span>`;
  });
  const body=document.getElementById('mus-body');
  body.classList.remove('printed'); body.classList.add('text-fallback');
  body.style.width=''; body.style.fontSize=qFont+'px'; body.innerHTML=html;
  const n=document.getElementById('mushaf-render-note');
  if(n){n.hidden=false;n.textContent='تعذر تحميل صفحة مصحف المدينة المطابقة؛ يظهر مؤقتًا النص الاحتياطي حتى يتوفر الاتصال.'}
}
function mushafPageUrl(page){return MUSHAF_SVG_BASE+padMushafPage(page)+'.svg'}
async function readCachedMushafSvg(page){
  if(!('caches' in window))return null;
  try{
    const cache=await caches.open(MUSHAF_OFFLINE_CACHE),r=await cache.match(mushafPageUrl(page));
    if(!r)return null;const text=await r.text();return text.includes('<svg')?text:null;
  }catch{return null}
}
async function cacheMushafResponse(page,response){
  if(!('caches' in window)||!response)return false;
  try{const cache=await caches.open(MUSHAF_OFFLINE_CACHE);await cache.put(mushafPageUrl(page),response);return true}catch{return false}
}
async function fetchMushafSvgRemote(page){
  const file=padMushafPage(page)+'.svg';let lastErr=null;
  for(const base of [MUSHAF_SVG_BASE,MUSHAF_SVG_FALLBACK]){
    try{
      const r=await fetch(base+file,{cache:'force-cache'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const cacheCopy=r.clone(),text=await r.text();if(!text.includes('<svg'))throw new Error('invalid svg');
      await cacheMushafResponse(page,cacheCopy);return text;
    }catch(e){lastErr=e}
  }
  throw lastErr||new Error('mushaf page unavailable');
}
async function fetchMushafSvg(page){
  if(mushafSvgCache.has(page)) return mushafSvgCache.get(page);
  const task=(async()=>{
    const cached=await readCachedMushafSvg(page);if(cached)return cached;
    return fetchMushafSvgRemote(page);
  })();
  mushafSvgCache.set(page,task);
  try{return await task}catch(e){mushafSvgCache.delete(page);throw e}
}
function safeMushafSvg(text,page){
  const doc=new DOMParser().parseFromString(text,'image/svg+xml');
  if(doc.querySelector('parsererror'))throw new Error('SVG parse error');
  doc.querySelectorAll('script,foreignObject,iframe,object,embed').forEach(x=>x.remove());
  const svg=doc.documentElement;
  for(const el of [svg,...svg.querySelectorAll('*')]){
    [...el.attributes].forEach(a=>{
      const n=a.name.toLowerCase(),v=(a.value||'').trim().toLowerCase();
      if(n.startsWith('on')||((n==='href'||n==='xlink:href')&&(v.startsWith('javascript:')||v.startsWith('data:text/html'))))el.removeAttribute(a.name);
    });
  }
  svg.removeAttribute('width');svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label',`صفحة ${page} من مصحف المدينة النبوية`);
  svg.classList.add('mushaf-page-svg');
  return document.importNode(svg,true);
}
function fitMushafSvgViewBox(svg){
  /* R43 robustness rule: the pinned KFQC SVG viewBox is authoritative geometry.
     Never crop/fit it at runtime. Scaling is handled only by CSS/zoom. */
  return svg;
}
function applyMushafAyahLikeFit(svg){
  /* R49: keep the authoritative viewBox untouched. On portrait phones we may trim only
     demonstrably blank side-space with a tiny CSS transform. All glyphs and ayah polygons
     move together because the transform is applied to the whole SVG. Fail closed at 1x. */
  if(!svg||!matchMedia('(orientation: portrait) and (max-width:760px)').matches){if(svg)svg.style.removeProperty('--mushaf-safe-scale');return 1}
  try{
    const vb=svg.viewBox?.baseVal;if(!vb||!vb.width)return 1;
    const leaves=[...svg.querySelectorAll('path,use,text,polyline,polygon')].filter(el=>!el.classList.contains('ayahPolygon')&&!el.closest('.ayahPolygon'));
    let minX=Infinity,maxX=-Infinity,seen=0;
    for(const el of leaves){let b;try{b=el.getBBox()}catch{continue}if(!b||!Number.isFinite(b.x)||b.width<=0)continue;minX=Math.min(minX,b.x);maxX=Math.max(maxX,b.x+b.width);seen++}
    if(!seen||!Number.isFinite(minX)||!Number.isFinite(maxX)||maxX<=minX)return 1;
    const blankL=Math.max(0,minX-vb.x),blankR=Math.max(0,(vb.x+vb.width)-maxX),safe=Math.min(blankL,blankR);
    /* Keep at least ~6 SVG units of verified blank space. Cap at 3.5%; unlike R47's blind 110%. */
    const usableBlank=Math.max(0,safe-6),candidate=vb.width/Math.max(1,vb.width-2*usableBlank),scale=Math.max(1,Math.min(1.035,candidate));
    svg.style.setProperty('--mushaf-safe-scale',String(scale));svg.style.transform=`scale(${scale})`;svg.dataset.safeScale=scale.toFixed(4);return scale;
  }catch{return 1}
}
function applyMushafZoom(){
  const body=document.getElementById('mus-body'); if(!body)return;
  if(body.classList.contains('printed')) body.style.width=qZoom+'%';
}
function clearMushafSelection(){
  qTransientAyah=null;
  document.querySelectorAll('.mushaf-page-svg .ayahPolygon.mark,.mus-body .ay.mark').forEach(x=>x.classList.remove('mark'));
}
function highlightMushafAyah(target=qTransientAyah){
  clearMushafSelection();
  if(!target)return;
  qTransientAyah={s:+target.s,a:+target.a};
  const body=document.getElementById('mus-body');if(!body)return;
  const p=body.querySelector(`.ayahPolygon[surah="${qTransientAyah.s}"][ayah="${qTransientAyah.a}"]`)||body.querySelector(`.ay[data-s="${qTransientAyah.s}"][data-a="${qTransientAyah.a}"]`);
  if(p)p.classList.add('mark');
}
const MUSHAF_RENDERER_ID='kfqc-svg';
const MUSHAF_RENDERERS=Object.freeze({
  'kfqc-svg':{id:'kfqc-svg',label:'KFQC fixed-page SVG',render:(page,runs,mark)=>renderPrintedMushaf(page,runs,mark)}
});
async function renderMushafPage(page,runs,mark){
  const renderer=MUSHAF_RENDERERS[MUSHAF_RENDERER_ID];
  if(!renderer)throw new Error('Mushaf renderer unavailable');
  return renderer.render(page,runs,mark);
}
async function renderPrintedMushaf(page,runs,mark){
  const body=document.getElementById('mus-body'),mushaf=document.getElementById('mushaf');
  body.classList.remove('text-fallback'); body.classList.add('printed'); body.style.fontSize='';
  mushaf?.classList.add('page-loading-soft');
  try{
    const svg=safeMushafSvg(await fetchMushafSvg(page),page);
    svg.classList.add(mushafPageDirection>0?'page-enter-next':mushafPageDirection<0?'page-enter-prev':'page-enter');
    body.replaceChildren(svg); requestAnimationFrame(()=>{fitMushafSvgViewBox(svg);applyMushafAyahLikeFit(svg)}); applyMushafZoom(); clearMushafSelection();
    requestAnimationFrame(()=>requestAnimationFrame(()=>svg.classList.add('page-enter-on')));
    const n=document.getElementById('mushaf-render-note'); if(n){n.hidden=true;n.textContent=''}
    return true;
  }catch(e){renderQuranTextFallback(runs,mark);return false}
  finally{mushaf?.classList.remove('page-loading-soft')}
}
async function openPage(p){
  await loadQuran();
  const oldPage=qPage;
  qPage=Math.min(604,Math.max(1,p));
  mushafPageDirection=qPage===oldPage?0:(qPage>oldPage?1:-1);
  const runs=Q.pages[qPage-1]||[];
  const mark=(await store.get(QKEY))||{};
  clearMushafSelection();
  const suraNames=[...new Set(runs.map(r=>suraOf(r[0])?.name).filter(Boolean))];
  const suraLabel=suraNames.length>2?`${suraNames[0]} · … · ${suraNames[suraNames.length-1]}`:suraNames.join(' · ');
  document.getElementById('mus-juz').textContent='الجزء '+JUZ_AR[juzOf(qPage)-1];
  document.getElementById('mus-sura').textContent=suraLabel;
  document.getElementById('mus-page').textContent='صفحة '+AR(qPage)+' من ٦٠٤';
  const swipeHint=document.getElementById('mushaf-swipe-hint'); if(swipeHint)swipeHint.classList.toggle('hide',qPage!==1);
  document.getElementById('rd-title').textContent=suraLabel||'المصحف';
  updateTafsirPanel();
  await renderMushafPage(qPage,runs,mark);
  await store.set(QKEY,{page:qPage,sura:suraLabel,s:(mark.s&&mark.a&&qAyaPage[mark.s+':'+mark.a]===qPage)?mark.s:null,a:(mark.s&&mark.a&&qAyaPage[mark.s+':'+mark.a]===qPage)?mark.a:null});
  if(tab!=='read'){armReaderHistory(tab);switchTab('read')}
  if(!mushafFullscreen){scrollTo({top:0,behavior:'auto'});scheduleReaderChromeHide()}
  else document.getElementById('v-read')?.scrollTo({top:0,behavior:'smooth'});
  // Warm the browser cache for the adjacent pages without touching user data.
  [qPage+1,qPage-1].filter(x=>x>=1&&x<=604).forEach(x=>fetchMushafSvg(x).catch(()=>{}));
}
let _lpTimer=null,_lpFired=false,_lpMoved=false,_lpOpened=false,_lpX=0,_lpY=0,_lpPoly=null;
(function(){ const mb=document.getElementById('mus-body');
  mb.addEventListener('touchstart',e=>{
    const poly=e.target.closest?.('.ayahPolygon'); if(!poly)return;
    _lpFired=false; _lpMoved=false; _lpOpened=false; _lpPoly=poly; _lpX=e.touches[0].clientX; _lpY=e.touches[0].clientY;
    clearTimeout(_lpTimer);
    _lpTimer=setTimeout(()=>{ _lpFired=true;
      if(navigator.vibrate)try{navigator.vibrate(12)}catch(_){}
      mb.dispatchEvent(new CustomEvent('ayah-longpress',{detail:{poly}}));
    },420);
  },{passive:true});
  const cancel=()=>{clearTimeout(_lpTimer);_lpTimer=null;_lpPoly=null};
  mb.addEventListener('touchmove',e=>{
    if(!_lpPoly)return; const t=e.touches[0];
    if(Math.abs(t.clientX-_lpX)>10||Math.abs(t.clientY-_lpY)>10){_lpMoved=true;clearTimeout(_lpTimer);_lpTimer=null}
  },{passive:true});
  mb.addEventListener('touchend',()=>{
    clearTimeout(_lpTimer);_lpTimer=null;
    const poly=_lpPoly; _lpPoly=null;
    if(!poly||_lpMoved||_lpFired)return;
    _lpOpened=true;
    openAyahMenu(+poly.getAttribute('surah'),+poly.getAttribute('ayah'));
  },{passive:true});
  mb.addEventListener('touchcancel',cancel,{passive:true});
})();
document.getElementById('mus-body').addEventListener('ayah-longpress',e=>{
  const p=e.detail.poly; if(!p)return;
  openAyahMenu(+p.getAttribute('surah'),+p.getAttribute('ayah'));
});
/* قائمة خيارات الآية — اللمسة العادية هي التفاعل الأساسي، والضغط المطوّل بديل مدعوم. */
function closeAyahMenu(){ const m=document.getElementById('ayah-menu'); if(m)m.remove(); clearMushafSelection(); }
function openAyahMenu(sn,an){
  closeAyahMenu();
  highlightMushafAyah({s:sn,a:an});
  const el=document.createElement('div');
  el.id='ayah-menu'; el.className='ayah-menu';
  el.innerHTML=`<div class="am-sheet" role="dialog" aria-label="خيارات الآية">
    <div class="am-h">الآية ${AR(an)} — ${(suraOf(sn)?.name)||('سورة '+sn)}</div>
    <button class="am-b" data-am="tafsir">تفسير الآية</button>
    <button class="am-b" data-am="save">حفظ الموضع هنا</button>
    <button class="am-b" data-am="copy">نسخ مرجع الآية</button>
    <button class="am-b am-x" data-am="close">إلغاء</button></div>`;
  document.body.appendChild(el);
  const openedAt=performance.now();
  el.addEventListener('click',async ev=>{
    // Ignore the synthetic/ghost click some mobile browsers dispatch after the touch
    // that opened this newly-created sheet. Otherwise the same tap can instantly close it.
    if(performance.now()-openedAt<320)return;
    const act=ev.target.closest('[data-am]')?.dataset.am;
    if(!act||act==='close'){ if(ev.target===el||act==='close')closeAyahMenu(); return }
    if(act==='tafsir'){ closeAyahMenu(); await openTafsirSheet({s:sn,a:an}); }
    else if(act==='save'){ const cur=(await store.get(QKEY))||{};
      await store.set(QKEY,Object.assign(cur,{page:qPage,s:sn,a:an})); closeAyahMenu(); await renderResume(); toast('حُفظ موضعك'); }
    else if(act==='copy'){ const t=`${(suraOf(sn)?.name)||('سورة '+sn)} — الآية ${an}`;
      try{await navigator.clipboard.writeText(t);toast('نُسخ المرجع')}catch{toast('تعذّر النسخ')} closeAyahMenu(); }
  });
}
document.getElementById('mus-body').onclick=e=>{
  // R50: a normal tap/click is the primary ayah action on every device.
  // Touchend may already have opened the sheet; ignore the synthetic click in that case.
  if(_lpOpened){_lpOpened=false;return}
  // A drag/swipe or completed long-press must never turn into a second accidental tap.
  if(_lpMoved||_lpFired){_lpMoved=false;_lpFired=false;return}
  const poly=e.target.closest?.('.ayahPolygon'),fallback=e.target.closest?.('.ay');
  if(!poly&&!fallback)return;
  const sn=poly?+poly.getAttribute('surah'):+fallback.dataset.s;
  const an=poly?+poly.getAttribute('ayah'):+fallback.dataset.a;
  openAyahMenu(sn,an);
};
function syncMushafViewportHeight(){
  const h=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight||0);
  if(h)document.documentElement.style.setProperty('--mushaf-vh',h+'px');
}
function ensureFsExitBtn(){
  let b=document.getElementById('fs-exit');
  if(!mushafFullscreen){ b?.remove(); return }
  if(b)return;
  b=document.createElement('button');
  b.id='fs-exit'; b.className='fs-exit'; b.type='button';
  b.setAttribute('aria-label','الخروج من ملء الشاشة'); b.textContent='✕';
  b.onclick=ev=>{ ev.stopPropagation(); exitMushafFullscreen?.() ||
    (mushafFullscreen=false,syncMushafFullscreenUI()); };
  document.body.appendChild(b);
}
function syncMushafFullscreenUI(){
  syncMushafViewportHeight();
  ensureFsExitBtn();
  document.body.classList.toggle('mushaf-fullscreen',mushafFullscreen);
  document.body.classList.toggle('mushaf-controls-hidden',mushafFullscreen&&mushafControlsHidden);
  const b=document.getElementById('rd-fullscreen');
  if(b){b.setAttribute('aria-pressed',mushafFullscreen?'true':'false');b.setAttribute('aria-label',mushafFullscreen?'الخروج من ملء الشاشة':'عرض المصحف بملء الشاشة');b.title=mushafFullscreen?'الخروج من ملء الشاشة':'ملء الشاشة'}
}
async function enterMushafFullscreen(){
  mushafFullscreen=true;mushafControlsHidden=false;syncMushafFullscreenUI();
  const target=document.documentElement;
  let nativeOk=!!document.fullscreenElement;
  try{
    if(!nativeOk&&target.requestFullscreen){await target.requestFullscreen({navigationUI:'hide'});nativeOk=!!document.fullscreenElement}
    else if(!nativeOk&&target.webkitRequestFullscreen){await target.webkitRequestFullscreen();nativeOk=true}
  }catch{}
  setTimeout(()=>{if(mushafFullscreen){mushafControlsHidden=true;syncMushafFullscreenUI()}},260);
  if(!nativeOk&&!document.fullscreenElement)toast('وضع القراءة الكامل مفعّل · قد تبقى أشرطة النظام حسب الجهاز');
}
async function exitMushafFullscreen(){
  mushafFullscreen=false;mushafControlsHidden=false;syncMushafFullscreenUI();
  try{if(document.fullscreenElement&&document.exitFullscreen)await document.exitFullscreen();else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen()}catch{}
}
async function toggleMushafFullscreen(){mushafFullscreen?await exitMushafFullscreen():await enterMushafFullscreen()}
document.addEventListener('fullscreenchange',()=>{syncMushafViewportHeight();if(!document.fullscreenElement&&mushafFullscreen){mushafFullscreen=false;mushafControlsHidden=false;syncMushafFullscreenUI()}});
document.addEventListener('webkitfullscreenchange',()=>{syncMushafViewportHeight();if(!document.webkitFullscreenElement&&!document.fullscreenElement&&mushafFullscreen){mushafFullscreen=false;mushafControlsHidden=false;syncMushafFullscreenUI()}});
window.visualViewport?.addEventListener('resize',()=>{if(mushafFullscreen)syncMushafViewportHeight()});
window.addEventListener('orientationchange',()=>setTimeout(()=>{if(mushafFullscreen)syncMushafViewportHeight()},120));
document.getElementById('rd-fullscreen').onclick=toggleMushafFullscreen;
document.getElementById('mushaf').addEventListener('click',e=>{
  if(document.getElementById('ayah-menu'))return;          // القائمة مفتوحة
  if(e.target.closest('a,button'))return;
  /* لمسة الآية العادية مملوكة لاختيار الآية. أما اللمس على بقية الصفحة فيُظهر/يخفي
     أدوات القارئ، وهو نمط مألوف في تطبيقات القراءة. */
  const touch=window.matchMedia('(hover:none)').matches;
  if(!touch&&e.target.closest('.ayahPolygon,.ay'))return;
  if(mushafFullscreen){mushafControlsHidden=!mushafControlsHidden;syncMushafFullscreenUI();return}
  if(tab!=='read')return;
  setReaderChromeHidden(!readerChromeHidden);
  if(!readerChromeHidden)scheduleReaderChromeHide(3200);
});
document.getElementById('rd-back').onclick=()=>leaveQuranReader();
document.getElementById('rd-tools')?.addEventListener('click',()=>leaveQuranReader('quran'));
document.getElementById('rd-search')?.addEventListener('click',openQuranSearch);
document.getElementById('rd-tafsir').onclick=()=>{setReaderChromeHidden(false);openCurrentTafsir()};
document.getElementById('tafsir-sheet-close')?.addEventListener('click',closeTafsirSheet);
document.getElementById('tafsir-sheet')?.addEventListener('click',e=>{if(e.target?.id==='tafsir-sheet')closeTafsirSheet()});
document.getElementById('tafsir-sheet-reader')?.addEventListener('click',()=>{const t=tafsirCurrentTarget;closeTafsirSheet(true);openMuyassarSheet(t.s)});
document.getElementById('muyassar-open')?.addEventListener('click',()=>openMuyassarSheet());
document.getElementById('muyassar-close')?.addEventListener('click',closeMuyassarSheet);
document.getElementById('muyassar-sheet')?.addEventListener('click',e=>{if(e.target?.id==='muyassar-sheet')closeMuyassarSheet()});
bindMuyassarReaderControls();
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!document.getElementById('muyassar-sheet')?.classList.contains('hide')){closeMuyassarSheet();return}if(!document.getElementById('tafsir-sheet')?.classList.contains('hide'))closeTafsirSheet()});
window.addEventListener('popstate',()=>{
  if(muyassarHistoryActive&&!document.getElementById('muyassar-sheet')?.classList.contains('hide')){closeMuyassarSheet(true);return}
  if(tafsirHistoryActive&&!document.getElementById('tafsir-sheet')?.classList.contains('hide')){closeTafsirSheet(true);return}
  if(tab==='read'&&readerHistoryActive){leaveQuranReader(readerLeaveTarget||readerReturnTab,true)}
});
const readerPrev=()=>{setReaderChromeHidden(false);openPage(qPage-1)};
const readerNext=()=>{setReaderChromeHidden(false);openPage(qPage+1)};
document.getElementById('rd-prev').onclick=readerPrev;
document.getElementById('rd-next').onclick=readerNext;
document.getElementById('rd-prev-action')?.addEventListener('click',readerPrev);
document.getElementById('rd-next-action')?.addEventListener('click',readerNext);
const setF=v=>{ qFont=Math.min(38,Math.max(15,v)); localStorage.setItem('qFont',qFont);
  const body=document.getElementById('mus-body'); if(body.classList.contains('text-fallback'))body.style.fontSize=qFont+'px' };
const setMushafZoom=v=>{qZoom=Math.min(145,Math.max(85,v));localStorage.setItem('mushafZoom',qZoom);applyMushafZoom()};
document.getElementById('rd-plus').onclick=()=>document.getElementById('mus-body').classList.contains('printed')?setMushafZoom(qZoom+10):setF(qFont+2);
document.getElementById('rd-minus').onclick=()=>document.getElementById('mus-body').classList.contains('printed')?setMushafZoom(qZoom-10):setF(qFont-2);

/* سحب لتقليب الصفحات — في القراءة العربية: من اليسار إلى اليمين = الصفحة التالية */
(function(){ const el=document.getElementById('mushaf'); let x0=null,y0=null;
  el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  el.addEventListener('touchend',e=>{ if(x0==null)return;
    const dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0;
    if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)*1.15) openPage(qPage+(dx>0?1:-1));
    x0=null },{passive:true}); })();

function mushafOfflineEls(){return {
  card:document.getElementById('mushaf-offline-card'),status:document.getElementById('mushaf-offline-status'),
  count:document.getElementById('mushaf-offline-count'),bar:document.getElementById('mushaf-offline-bar'),
  download:document.getElementById('mushaf-offline-download'),stop:document.getElementById('mushaf-offline-stop'),
  remove:document.getElementById('mushaf-offline-remove'),storage:document.getElementById('mushaf-offline-storage')};}
async function mushafCachedPageNumbers(){
  if(!('caches' in window))return [];
  try{
    const cache=await caches.open(MUSHAF_OFFLINE_CACHE),keys=await cache.keys(),out=[];
    for(const req of keys){const m=req.url.match(/\/([0-9]{3})\.svg(?:$|\?)/);if(m)out.push(+m[1])}
    return [...new Set(out.filter(n=>n>=1&&n<=MUSHAF_TOTAL_PAGES))].sort((a,b)=>a-b);
  }catch{return []}
}
async function refreshMushafOfflineUI(note=''){
  const el=mushafOfflineEls();if(!el.card)return;
  const nums=await mushafCachedPageNumbers(),done=nums.length,pct=Math.round(done/MUSHAF_TOTAL_PAGES*100);
  if(el.count)el.count.textContent=`${AR(done)} من ${AR(MUSHAF_TOTAL_PAGES)} صفحة`;
  if(el.bar)el.bar.style.width=pct+'%';
  if(el.status)el.status.textContent=note||(done===MUSHAF_TOTAL_PAGES?'المصحف كامل متاح دون اتصال.':done?`يمكن استكمال التنزيل من الصفحة المخزنة التالية.`:'لم يتم تنزيل النسخة الكاملة بعد. الصفحات التي تقرؤها تُحفظ تلقائيًا للاستخدام دون اتصال.');
  if(el.download){el.download.disabled=mushafOfflineJob.active||done===MUSHAF_TOTAL_PAGES;el.download.textContent=done===MUSHAF_TOTAL_PAGES?'تم تنزيل المصحف كاملًا':done?'استكمال تنزيل المصحف':'تنزيل المصحف كاملًا'}
  if(el.stop)el.stop.hidden=!mushafOfflineJob.active;
  if(el.remove)el.remove.hidden=done===0||mushafOfflineJob.active;
  if(el.storage&&navigator.storage?.estimate){try{const x=await navigator.storage.estimate(),persisted=await navigator.storage?.persisted?.();const used=x.usage||0,quota=x.quota||0;el.storage.textContent=quota?`تخزين تدارُك على الجهاز: ${(used/1048576).toFixed(1)} م.ب من ${(quota/1048576).toFixed(0)} م.ب متاحة.${persisted===true?' · التخزين محمي من الإخلاء التلقائي قدر الإمكان.':persisted===false?' · قد يدير المتصفح المساحة تلقائيًا عند ضغط التخزين.':''}`:''}catch{}}
  return done;
}
async function ensureMushafPageCached(page){
  if(await readCachedMushafSvg(page))return true;
  const text=await fetchMushafSvgRemote(page);return !!text;
}
async function downloadFullMushaf(){
  if(mushafOfflineJob.active)return;
  if(!('caches' in window)){toast('التخزين دون اتصال غير مدعوم في هذا المتصفح');return}
  mushafOfflineJob={active:true,cancelled:false,done:0,failed:0};
  try{await navigator.storage?.persist?.()}catch{}
  try{
  let have=new Set(await mushafCachedPageNumbers()),pending=[];
  for(let p=1;p<=MUSHAF_TOTAL_PAGES;p++)if(!have.has(p))pending.push(p);
  mushafOfflineJob.done=have.size;await refreshMushafOfflineUI('جاري تنزيل صفحات المصحف… يمكنك إيقافه واستكماله لاحقًا.');
  let cursor=0;const workers=Array.from({length:3},async()=>{
    while(!mushafOfflineJob.cancelled){
      const i=cursor++;if(i>=pending.length)return;const p=pending[i];
      try{await ensureMushafPageCached(p);mushafOfflineJob.done++}
      catch{mushafOfflineJob.failed++}
      if((mushafOfflineJob.done+mushafOfflineJob.failed)%6===0||i===pending.length-1){
        await refreshMushafOfflineUI(mushafOfflineJob.failed?`جاري التنزيل · تعذر ${AR(mushafOfflineJob.failed)} صفحة مؤقتًا وسيعاد تنزيلها عند الاستكمال.`:'جاري تنزيل صفحات المصحف…');
      }
    }
  });
  await Promise.all(workers);
  const done=await refreshMushafOfflineUI();
  if(mushafOfflineJob.cancelled)await refreshMushafOfflineUI('تم إيقاف التنزيل. يمكنك استكماله لاحقًا من حيث توقف.');
  else if(done===MUSHAF_TOTAL_PAGES){await refreshMushafOfflineUI('اكتمل تنزيل ٦٠٤ صفحة. المصحف الآن متاح كاملًا دون اتصال.');toast('اكتمل تنزيل المصحف')}
  else await refreshMushafOfflineUI('لم يكتمل التنزيل بسبب الشبكة. اضغط «استكمال» عند توفر اتصال أفضل.');
  }finally{mushafOfflineJob.active=false;await refreshMushafOfflineUI()}
}
function stopMushafDownload(){mushafOfflineJob.cancelled=true}
async function removeOfflineMushaf(){
  if(mushafOfflineJob.active)return;
  if(!confirm('حذف النسخة المحلية من صفحات المصحف؟ لن تتأثر علامة القراءة أو بياناتك.'))return;
  try{await caches.delete(MUSHAF_OFFLINE_CACHE);mushafSvgCache.clear();await refreshMushafOfflineUI('حُذفت النسخة المحلية. ستُحفظ الصفحات التي تقرؤها لاحقًا تلقائيًا.');toast('حُذفت النسخة المحلية')}catch{toast('تعذر حذف النسخة المحلية')}
}
document.getElementById('mushaf-offline-download')?.addEventListener('click',downloadFullMushaf);
document.getElementById('mushaf-offline-stop')?.addEventListener('click',stopMushafDownload);
document.getElementById('mushaf-offline-remove')?.addEventListener('click',removeOfflineMushaf);

document.getElementById('btn-history').onclick=()=>switchTab(tab==='history'?'today':'history');

/* ================= الدعاء ================= */
let DUA={cats:[]}, duaCat='quran', duaFav=[], myDuas=[];
async function loadDua(){ if(DUA.cats.length)return;
  try{ DUA=await (await fetch('./adiya.json')).json() }catch{}
  duaFav=(await store.get('dua-fav'))||[]; myDuas=(await store.get('my-duas'))||[] }
async function renderDua(){
  await loadDua();
  const totalDua=DUA.cats.reduce((n,c)=>n+(c.items||[]).length,0), summary=document.getElementById('dua-library-summary');
  if(summary){
    summary.innerHTML=`<small>مكتبة الدعاء الموثقة</small><b>${AR(totalDua)} دعاء · ${AR(DUA.cats.length)} بابًا</b><p>توسعت المكتبة مع بقاء الأدعية القديمة وترتيبها كما هو. هذه أبواب مضافة حديثًا للوصول إليها مباشرة:</p><div class="dua-new-doors"><button data-dua-jump="qalb">صلاح القلب والأخلاق</button><button data-dua-jump="istiatha">الاستعاذات النبوية</button><button data-dua-jump="deen_dunya">صلاح الدين والدنيا</button></div>`;
    summary.onclick=e=>{const b=e.target.closest('[data-dua-jump]');if(!b)return;duaCat=b.dataset.duaJump;document.getElementById('dua-search').value='';renderDua();};
  }
  document.getElementById('dua-tabs').innerHTML=
    DUA.cats.map(c=>`<button data-c="${c.id}" aria-current="${c.id===duaCat}">${c.name}</button>`).join('')+
    `<button data-c="_fav" aria-current="${duaCat==='_fav'}">★ المحفوظة</button>`+
    `<button data-c="_my" aria-current="${duaCat==='_my'}">✎ دفتر دعائي</button>`;
  const raw=(document.getElementById('dua-search').value||'').trim(), q=searchNorm(raw);
  const host=document.getElementById('dua-list'), cnt=document.getElementById('dua-result-count');

  if(duaCat==='_my'){
    const rows=myDuas.map((x,i)=>({x,i})).filter(({x})=>!q||searchNorm(x.t).includes(q)).reverse();
    cnt.textContent=`${AR(rows.length)} من ${AR(myDuas.length)} في دفتر دعائك`;
    host.innerHTML=`<div class="dua-card"><textarea id="new-dua" placeholder="اكتب دعوتك… ثم علّمها إذا استُجيبت" style="width:100%;min-height:80px;background:var(--paper);border:1px solid var(--line);border-radius:11px;padding:10px;font-size:14.5px;line-height:1.9"></textarea><div class="acts"><button id="add-dua" style="flex:1">أضف إلى دفتري</button></div></div>`+
      (rows.length?rows.map(({x,i})=>`<div class="my-dua ${x.ans?'ans':''}"><div class="x">${x.t.replace(/</g,'&lt;')}</div><div class="m"><span>${new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'long',year:'numeric'}).format(new Date(x.d))}${x.ans?' · استُجيب ✓':''}</span><span><button data-ans="${i}">${x.ans?'إلغاء':'استُجيب'}</button><button data-del="${i}">حذف</button></span></div></div>`).join(''):'<div class="dua-card" style="text-align:center;color:var(--soft);font-size:13px">لا توجد نتائج في دفتر دعائك.</div>');
    host.onclick=async e=>{
      if(e.target.id==='add-dua'){ const t=document.getElementById('new-dua').value.trim(); if(!t)return; myDuas.push({t,d:Date.now(),ans:false}); await store.set('my-duas',myDuas); renderDua(); toast('أُضيفت إلى دفترك'); return }
      const a=e.target.closest('button[data-ans]'); if(a){ myDuas[+a.dataset.ans].ans=!myDuas[+a.dataset.ans].ans; await store.set('my-duas',myDuas); renderDua(); if(myDuas[+a.dataset.ans]?.ans)toast('الحمد لله — استُجيب'); return }
      const dl=e.target.closest('button[data-del]'); if(dl){ myDuas.splice(+dl.dataset.del,1); await store.set('my-duas',myDuas); renderDua() } };
    return;
  }

  let items=[];
  if(duaCat==='_fav') DUA.cats.forEach(c=>c.items.forEach((x,i)=>{if(duaFav.includes(c.id+':'+i))items.push([c,x,i])}));
  else if(q) DUA.cats.forEach(c=>c.items.forEach((x,i)=>items.push([c,x,i])));
  else { const c=DUA.cats.find(x=>x.id===duaCat)||DUA.cats[0]; c.items.forEach((x,i)=>items.push([c,x,i])) }
  if(q) items=items.filter(([c,x])=>searchNorm(c.name+' '+x.t+' '+x.s+' '+(x.note||'')).includes(q));
  const selectedCat=DUA.cats.find(x=>x.id===duaCat);
  const scope=duaCat==='_fav'?'في المحفوظة':q?'في جميع الأدعية':`في ${selectedCat?.name||'القسم'}`;
  cnt.textContent=`${AR(items.length)} نتيجة ${scope}`;
  const catIntro=(!q&&selectedCat?.intro)?`<div class="dua-cat-note">${selectedCat.intro}</div>`:'';
  host.innerHTML=catIntro+(items.length?items.map(([c,x,i])=>{ const k=c.id+':'+i,fav=duaFav.includes(k); const ns=x.note?`<div class="learn-source">مصدر البيان: ${x.noteUrl?`<a href="${x.noteUrl}" target="_blank" rel="noopener">${x.noteSource||x.s}</a>`:(x.noteSource||x.s)}</div>`:''; const mainSrc=x.sUrl?`<a href="${x.sUrl}" target="_blank" rel="noopener">${x.s}</a>`:x.s; const plus=laterRegister(`dua:${k}`,{kind:'دعاء',title:c.name,text:x.t,source:x.s,tab:'dua'});return `<div class="dua-card">${q?`<div class="search-source">${c.name}</div>`:''}${x.who?`<div class="dua-who">${x.who}</div>`:''}<div class="t">${x.t}</div><div class="s">المصدر: ${mainSrc}</div>${x.note?`<div class="nt">${x.note}</div>${ns}`:''}<div class="acts">${plus}<button data-fav="${k}" class="${fav?'on':''}">${fav?'★ محفوظ':'☆ حفظ'}</button><button data-copy="${k}">نسخ</button></div></div>`}).join(''):'<div class="nafs-empty">لا توجد أدعية مطابقة لبحثك.</div>');

  host.onclick=async e=>{
    const f=e.target.closest('button[data-fav]'); if(f){ const k=f.dataset.fav,j=duaFav.indexOf(k); if(j<0)duaFav.push(k); else duaFav.splice(j,1); await store.set('dua-fav',duaFav); renderDua(); return }
    const cp=e.target.closest('button[data-copy]'); if(cp){ const [cid,i]=cp.dataset.copy.split(':'); const c=DUA.cats.find(x=>x.id===cid),x=c.items[+i]; navigator.clipboard?.writeText(x.t+'\n('+x.s+')'); toast('نُسخ الدعاء') } };
}
document.getElementById('dua-tabs').onclick=e=>{ const b=e.target.closest('button'); if(!b)return;
  duaCat=b.dataset.c; renderDua() };
document.getElementById('dua-search').oninput=()=>renderDua();


/* ================= السنة — رياض الصالحين + قارئ الشرح ================= */
const RIYAD_TEXT_URL='https://old.shamela.ws/index.php/book/12014';
const RIYAD_SHARH_URL='https://foundation.binothaimeen.net/ar/books/show/76e12fcc-d35a-417d-a68b-954c0bf06bc6';
const NAWAWI_SHARH_URL='https://foundation.binothaimeen.net/ar/books/show/7c9cb3e2-3b02-4ad9-97dc-5db895d9a98c';
let RS=null, rsBook=-1, rsFav=[], NAW=null, nawawiQuery='', hadithDetailHistory=false;
function riyadParts(raw=''){
  const refs=[];
  let body=String(raw).replace(/\(\(([\s\S]*?)\)\)/g,(_,x)=>{const v=x.trim();if(v)refs.push(v);return ' '});
  body=body.replace(/\(\(/g,'(').replace(/\)\)/g,')').replace(/[ \t]+/g,' ').replace(/\s+([،؛.!؟])/g,'$1').trim();
  return {body,refs:[...new Set(refs)]};
}
function cleanRiyadText(raw=''){return riyadParts(raw).body}
function riyadExplain(text,book=''){
  const t=searchNorm(text), rules=[
    [/الاعمال بالنيات|النيات|نية/,`يبين الحديث أثر النية في قيمة العمل وثوابه؛ فصلاح القصد أصل في العبادة والعمل، ولا يكفي حسن النية لتصحيح عمل مخالف للشرع.`],
    [/جلود السباع|جلود السباع ان تفترش/,`ينهى الحديث عن استعمال جلود السباع في هذا الباب، وفيه توجيه إلى اجتناب ما ثبت النهي عنه في اللباس والفرش، مع رد تفاصيل الأحكام وصورها إلى كلام أهل العلم.`],
    [/لا تغضب/,`يرشد الحديث إلى كظم آثار الغضب ومنع النفس من الكلام أو التصرف المحرم عند هيجانه، لا إلى إنكار أصل الشعور الطبيعي بالغضب.`],
    [/التوبة|تاب الله|يستغفر|استغفر/,`يفتح الحديث باب الرجوع إلى الله وعدم الإصرار على الذنب؛ فالتوبة عمل متجدد يجمع الندم وترك المعصية والعزم على عدم العودة ورد الحقوق عند تعلقها بالناس.`],
    [/الصبر|اصبر/,`يربي الحديث على الصبر المشروع: حبس النفس على الطاعة، وعن المعصية، وعلى أقدار الله المؤلمة، من غير ترك للأسباب المباحة التي ترفع الضرر.`],
    [/الصدق|صادقا|صادق/,`يدل الحديث على منزلة الصدق في القول والقصد والعمل، وأن المؤمن يتحرى الحق ويتجنب الكذب وما يقرب إليه.`],
    [/الرحم|الوالدين|والد|امك|اباك/,`يتصل الحديث بحقوق الأسرة وصلة الرحم، ويؤكد أن البر والإحسان من الدين مع حفظ الحدود الشرعية وعدم إعانة أحد على معصية.`],
    [/الجار|جاره/,`يرشد الحديث إلى تعظيم حق الجار وكف الأذى عنه وبذل المعروف بحسب الاستطاعة، وهو من الأخلاق التي يصدق بها أثر الإيمان.`],
    [/ضيف|الضيافة/,`يبين الحديث فضل إكرام الضيف وآداب الضيافة من غير تكلف يوقع في الحرج أو تضييع الحقوق.`],
    [/الغيبة|يغتاب|النميمة|نميمة/,`يحذر الحديث من آفات اللسان التي تفسد القلوب والعلاقات، ويطلب حفظ عرض المسلم وعدم نقل الكلام للإفساد.`],
    [/حسد|تحاسدوا/,`ينهى الحديث عن الحسد المذموم وتمني زوال نعمة الغير، ويربي على سلامة الصدر والدعاء بالبركة.`],
    [/الصلاة|صلات|المسجد/,`يبين الحديث فضلًا أو أدبًا متعلقًا بالصلاة؛ والأصل أن تُقدَّم الفرائض وتحفظ شروطها وأوقاتها ثم يُزاد من النوافل بحسب الاستطاعة.`],
    [/القران|القرآن/,`يربط الحديث المسلم بالقرآن قراءةً وعملًا وتدبرًا، فلا يكون المقصود مجرد التلاوة دون امتثال الهداية.`],
    [/الدعاء|يدعو|دعوت/,`يبين الحديث بابًا من أبواب الدعاء والافتقار إلى الله، مع الأخذ بأسباب الإجابة والبعد عن الاعتداء في الدعاء وأكل الحرام.`],
    [/الذكر|سبحان الله|الحمد لله|لا اله الا الله/,`يدل الحديث على فضل ذكر الله وما يورثه من حياة القلب، مع الالتزام بالألفاظ والأعداد الثابتة حين يرد فيها عدد مخصوص.`],
    [/صدقة|الزكاة|انفق|نفقة/,`يبين الحديث فضل البذل والإحسان، مع تقديم الواجبات المالية والحقوق اللازمة ثم الصدقة من الطيب وبحسب القدرة.`],
    [/العلم|عالم|تعلم/,`يرشد الحديث إلى فضل العلم النافع الذي يقود إلى العمل، وإلى سؤال أهل العلم فيما يشتبه بدل القول على الله بغير علم.`],
    [/الموت|الجنازة|القبر|الميت/,`يذكّر الحديث بالآخرة وما يتصل بالموت، ليحمل ذلك على الاستعداد بالطاعة وأداء الحقوق من غير غلو أو يأس.`],
    [/اللباس|الثوب|ثياب/,`يعرض الحديث حكمًا أو أدبًا من آداب اللباس؛ والمقصود التزام الهدي الشرعي مع النظافة والتجمل المباح وترك المنهي عنه.`],
    [/النوم|الفراش|اضطجع/,`يتعلق الحديث بآداب النوم وما يشرع عنده، وفيه تربية على أن تكون العادات اليومية موصولة بالذكر والهدي النبوي.`],
    [/السلام|يسلم|السلام عليكم/,`يبين الحديث أدب السلام وما يترتب عليه من نشر المودة والأمان بين المسلمين وفق الصيغ والآداب المشروعة.`],
    [/السفر|مسافر|الطريق/,`يتناول الحديث أدبًا أو حكمًا من أحكام السفر، مع مراعاة الرخص الشرعية وحفظ الحقوق والأذكار الثابتة.`],
    [/الحج|عرفة|المناسك/,`يتصل الحديث بمناسك الحج وفضائله؛ وتفاصيل النسك العملية تُؤخذ من الفقه المعتبر وسؤال أهل العلم، خاصة فيما يختلف باختلاف الحال.`],
    [/جهاد|القتال|قاتل/,`يتناول الحديث بابًا من أبواب الجهاد وأحكامه، وهي مسائل تضبطها الشريعة وولاية الأمر والقدرة والمصلحة، وليست تصرفات فردية خارج الضوابط.`],
    [/الاستغفار|اغفر لي/,`يؤكد الحديث دوام الاستغفار والافتقار إلى مغفرة الله مع التوبة الصادقة وعدم الإصرار على المعصية.`]
  ];
  for(const [r,x] of rules) if(r.test(t)) return x;
  const topic=(book||'هذا الباب').replace(/^كتاب\s*/,'');
  return `يعرض الحديث توجيهًا مرتبطًا بـ«${topic}». المعنى المبسط هنا يقتصر على الدلالة الظاهرة للنص، أما التفصيل العقدي أو الفقهي أو التربوي فيُراجع في الشرح المعتمد المذكور أعلاه.`;
}
async function loadRS(){ if(RS)return RS;
  try{ RS=await (await fetch('./riyad.json')).json() }catch{ RS={books:[]} }
  rsFav=(await store.get('rs-fav'))||[]; return RS }
async function loadNawawi(){if(NAW)return NAW;try{NAW=await (await fetch('./nawawi40.json')).json()}catch{NAW={meta:{},items:[]}}return NAW}
function getRiyadByKey(k){const [bi,n]=String(k).split(':');const b=RS?.books?.[+bi],h=b?.items?.find(x=>String(x.n)===String(n));return b&&h?{b,bi:+bi,h}:null}
function sourceRefCard(label,url,note=''){
  return `<div class="hadith-ref-card strong"><div class="label">مرجع الشرح المعتمد</div><a href="${url}" target="_blank" rel="noopener">${laterEsc(label)}</a>${note?`<div class="note">${laterEsc(note)}</div>`:''}</div>`
}
function openHadithDetail(kind,data){
  const shell=document.getElementById('hadith-detail'),host=document.getElementById('hadith-detail-content'),kick=document.getElementById('hadith-detail-kicker');
  if(!shell||!host)return;
  if(kind==='riyad'){
    const {b,h}=data,p=riyadParts(h.t),meaning=riyadExplain(p.body,b.name);
    kick.textContent=`رياض الصالحين · ${AR(h.n)}`;
    host.innerHTML=`<div class="hadith-reader-hero"><div class="eyebrow">${laterEsc(b.name)} · الحديث ${AR(h.n)}</div><h2 id="hadith-detail-title">رياض الصالحين</h2><div class="hadith-matn">${laterEsc(p.body)}</div></div><section class="section-source-panel compact hadith-page-sources"><div class="section-source-kicker">مصادر هذه الصفحة</div><div class="source-stack">${sourceStack([{label:'رياض الصالحين — الإمام النووي — تحقيق شعيب الأرنؤوط',url:RIYAD_TEXT_URL},{label:'شرح رياض الصالحين — الشيخ محمد بن صالح العثيمين رحمه الله',url:RIYAD_SHARH_URL},{label:`موضع الحديث ${h.n} بالترقيم`,url:`https://sunnah.com/riyadussalihin:${h.n}`}])}</div></section><div class="hadith-sharh"><div class="head"><b>الشرح المبسط</b><span class="badge">للفهم الأولي</span></div><p>${laterEsc(meaning)}</p><div class="disclaimer">صياغة تعليمية مختصرة في تدارُك، وليست نقلًا حرفيًا من الشيخ. المراجع المعتمدة مثبتة مرة واحدة في بداية الصفحة.</div></div>${p.refs.length?`<div class="hadith-takhrij"><h3>التخريج والإحالات الواردة في نص رياض الصالحين</h3>${p.refs.map(x=>`<div class="refline">${laterEsc(x)}</div>`).join('')}</div>`:''}`;
  }else{
    const h=data,meta=NAW.meta||{};
    kick.textContent=`الأربعون النووية · ${AR(h.n)}`;
    host.innerHTML=`<div class="hadith-reader-hero"><div class="eyebrow">الحديث ${AR(h.n)} من ٤٢</div><h2 id="hadith-detail-title">${laterEsc(h.title)}</h2><div class="hadith-matn">${laterEsc(h.text)}</div></div><section class="section-source-panel compact hadith-page-sources"><div class="section-source-kicker">مصادر هذه الصفحة</div><div class="source-stack">${sourceStack([{label:`الأربعون النووية — الحديث ${h.n} · ${h.takhrij||'التخريج'}`,url:h.textUrl},{label:meta.commentaryBook||'شرح الأربعين النووية — الشيخ محمد بن صالح العثيمين رحمه الله',url:h.commentaryUrl||NAWAWI_SHARH_URL}])}</div></section><div class="hadith-sharh"><div class="head"><b>الشرح المبسط</b><span class="badge">على ضوء المرجع</span></div><p>${laterEsc(h.explanation)}</p><div class="disclaimer">${laterEsc(meta.commentaryNote||'الشرح مختصر وليس نقلًا حرفيًا؛ راجع المرجع المعتمد للتفصيل.')}</div></div>`;
  }
  const wasHidden=shell.classList.contains('hide');
  shell.classList.remove('hide');shell.scrollTop=0;document.body.classList.add('hadith-open');
  if(wasHidden&&!hadithDetailHistory){try{history.pushState({rafiqHadith:true},'',location.href);hadithDetailHistory=true}catch{}}
}
function closeHadithDetail(fromPop=false){
  const shell=document.getElementById('hadith-detail');if(!shell||shell.classList.contains('hide'))return;
  shell.classList.add('hide');document.body.classList.remove('hadith-open');
  if(!fromPop&&hadithDetailHistory){hadithDetailHistory=false;try{history.back()}catch{}}
  else if(fromPop)hadithDetailHistory=false;
}
document.getElementById('hadith-detail-back').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeHadithDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('hadith-detail')?.classList.contains('hide'))closeHadithDetail()});
window.addEventListener('popstate',()=>{if(!document.getElementById('hadith-detail')?.classList.contains('hide'))closeHadithDetail(true)});


async function renderSunnah(){
  await loadRS();
  const intro=document.getElementById('riyad-intro');
  if(intro)intro.innerHTML=`<b>رياض الصالحين</b><p>كتاب للإمام يحيى بن شرف النووي رحمه الله، رتبه في أبواب تجمع الآيات والأحاديث في العبادة والآداب والأخلاق وفضائل الأعمال. اضغط على أي حديث لقراءة المتن ثم الشرح المبسط والمراجع.</p><div class="learn-ref-row"><a href="${RIYAD_TEXT_URL}" target="_blank" rel="noopener">مصدر الكتاب — رياض الصالحين، تحقيق شعيب الأرنؤوط</a><a href="${RIYAD_SHARH_URL}" target="_blank" rel="noopener">مرجع الشرح — شرح رياض الصالحين لابن عثيمين</a></div><span class="learn-note">الشرح داخل تدارُك صياغة تعليمية مختصرة، وليس نقلًا حرفيًا عن الشيخ.</span>`;
  const raw=(document.getElementById('rs-search').value||'').trim(),q=searchNorm(raw),cnt=document.getElementById('rs-result-count');
  const seed=Math.floor(Date.now()/86400000),biDay=RS.books.length?seed%RS.books.length:-1,all=biDay>=0?RS.books[biDay]:null;
  if(all){const h=all.items[seed%all.items.length],p=riyadParts(h.t),k=biDay+':'+h.n;document.getElementById('hadith-day').dataset.dayHadith=k;document.getElementById('hadith-day').innerHTML=`<div class="lbl">حديث اليوم · اضغط للشرح</div><div class="t">${laterEsc(p.body)}</div>`}
  if(q){
    document.getElementById('rs-books').innerHTML='';const hits=[];RS.books.forEach((b,bi)=>b.items.forEach(h=>{if(searchNorm(b.name+' '+h.t+' '+h.n).includes(q))hits.push([b,bi,h])}));cnt.textContent=hits.length?`${AR(hits.length)} نتيجة${hits.length>120?' · نعرض أول '+AR(120):''}`:'لا توجد نتائج';
    document.getElementById('rs-list').innerHTML=hits.length?hits.slice(0,120).map(([b,bi,h])=>{const k=bi+':'+h.n,f=rsFav.includes(k),p=riyadParts(h.t);return `<div class="hd-item" data-hadith="${k}"><div class="num">${laterEsc(b.name)} — رياض الصالحين ${AR(h.n)}</div><div class="tx">${laterEsc(p.body)}</div><div class="acts">${laterRegister(`hadith:${k}`,{kind:'حديث',title:b.name,text:p.body,source:`رياض الصالحين — الحديث ${h.n}`,tab:'sunnah'})}<button data-f="${k}" class="${f?'on':''}">${f?'★ محفوظ':'☆ حفظ'}</button><button data-c="${k}">نسخ</button></div></div>`}).join(''):'<div class="nafs-empty">لا توجد أحاديث مطابقة. جرّب كلمة أخرى أو جزءًا أقصر من العبارة.</div>';return;
  }
  if(rsBook<0){
    document.getElementById('rs-list').innerHTML='';const total=RS.books.reduce((n,b)=>n+b.items.length,0);cnt.textContent=`${AR(RS.books.length)} كتابًا · ${AR(total)} حديثًا`;
    document.getElementById('rs-books').innerHTML=`<div class="hd-card"><div class="lbl">فهرس رياض الصالحين</div><div class="t" style="font-size:17px">٢٠ كتابًا بالترتيب الأصلي</div><div class="r">اضغط على أي حديث لفتح صفحة قراءة فيها متن نظيف، شرح مبسط، ومرجع الشرح المعتمد.</div></div><div class="bk-wrap">`+RS.books.map((b,i)=>`<div class="bk-row" data-b="${i}"><div><div class="bk-name">${laterEsc(b.name)}</div><div class="bk-n">${AR(b.items.length)} حديثًا</div></div><span class="bk-n">﴾</span></div>`).join('')+'</div>';
  }else{
    const b=RS.books[rsBook];cnt.textContent=`${AR(b.items.length)} حديثًا في ${b.name}`;document.getElementById('rs-books').innerHTML=`<button class="back" id="rs-back">كل الكتب</button><div class="hd-card"><div class="lbl">الكتاب ${AR(rsBook+1)} من ٢٠</div><div class="t">${laterEsc(b.name)}</div><div class="r">${AR(b.items.length)} حديثًا · اضغط على الحديث لقراءة الشرح والمراجع.</div></div>`;
    document.getElementById('rs-list').innerHTML=b.items.map(h=>{const k=rsBook+':'+h.n,f=rsFav.includes(k),p=riyadParts(h.t);return `<div class="hd-item" data-hadith="${k}"><div class="num">رياض الصالحين ${AR(h.n)}</div><div class="tx">${laterEsc(p.body)}</div><div class="acts">${laterRegister(`hadith:${k}`,{kind:'حديث',title:b.name,text:p.body,source:`رياض الصالحين — الحديث ${h.n}`,tab:'sunnah'})}<button data-f="${k}" class="${f?'on':''}">${f?'★ محفوظ':'☆ حفظ'}</button><button data-c="${k}">نسخ</button></div></div>`}).join('');
  }
}
document.getElementById('rs-search').oninput=renderSunnah;
document.getElementById('hadith-day').onclick=e=>{if(e.target.closest('a,button'))return;const x=getRiyadByKey(e.currentTarget.dataset.dayHadith);if(x)openHadithDetail('riyad',x)};
document.getElementById('rs-books').onclick=e=>{if(e.target.closest('#rs-back')){rsBook=-1;renderSunnah();return}const r=e.target.closest('.bk-row');if(r){rsBook=+r.dataset.b;renderSunnah()}};
document.getElementById('rs-list').onclick=async e=>{
  const f=e.target.closest('button[data-f]');if(f){const k=f.dataset.f,i=rsFav.indexOf(k);if(i<0)rsFav.push(k);else rsFav.splice(i,1);await store.set('rs-fav',rsFav);renderSunnah();return}
  const c=e.target.closest('button[data-c]');if(c){const x=getRiyadByKey(c.dataset.c);if(x){try{navigator.clipboard?.writeText(cleanRiyadText(x.h.t))}catch{}toast('نُسخ الحديث')}return}
  if(e.target.closest('button,a'))return;const row=e.target.closest('[data-hadith]');if(row){const x=getRiyadByKey(row.dataset.hadith);if(x)openHadithDetail('riyad',x)}
};

async function renderNawawi(){
  await loadNawawi();const host=document.getElementById('learn-nawawi'),q=searchNorm(nawawiQuery),items=(NAW.items||[]).filter(h=>!q||searchNorm(h.title+' '+h.text+' '+h.n).includes(q)),m=NAW.meta||{};
  host.innerHTML=`<div class="nw-intro"><b>الأربعون النووية</b><p>٤٢ حديثًا جمعها الإمام النووي. اضغط على أي حديث لعرض المتن والشرح المبسط.</p><div class="source-stack">${sourceStack([{label:m.textSourceLabel||'نص الأربعين النووية',url:m.textSourceUrl||'https://sunnah.com/nawawi40'},{label:m.commentaryBook||'شرح الأربعين النووية — الشيخ محمد بن صالح العثيمين',url:m.commentaryUrl||NAWAWI_SHARH_URL}])}</div></div><input id="nw-search" class="q-search" type="search" value="${laterEsc(nawawiQuery)}" placeholder="ابحث في الأربعين النووية…"><div class="search-count">${AR(items.length)} من ${AR((NAW.items||[]).length)} حديثًا</div><div class="nw-grid">${items.map(h=>{const ex=h.text.length>165?h.text.slice(0,165)+'…':h.text;return `<div class="nw-card" data-nawawi="${h.n}">${laterRegister(`nawawi:${h.n}`,{kind:'حديث',title:h.title,text:h.text,source:'الأربعون النووية — الحديث '+h.n,tab:'sunnah'})}<div class="top"><span class="num">${AR(h.n)}</span><div><div class="title">${laterEsc(h.title)}</div><div class="excerpt">${laterEsc(ex)}</div><div class="openhint">اضغط لقراءة الشرح والمصدر ←</div></div></div></div>`}).join('')}</div><div class="learn-disclaimer">${laterEsc(m.commentaryNote||'')}</div>`;
  host.querySelector('#nw-search').oninput=e=>{nawawiQuery=e.target.value;renderNawawi()};
  host.querySelector('.nw-grid').onclick=e=>{if(e.target.closest('button,a'))return;const c=e.target.closest('[data-nawawi]');if(!c)return;const h=NAW.items.find(x=>String(x.n)===c.dataset.nawawi);if(h)openHadithDetail('nawawi',h)};
}

/* ================= العلم: رياض الصالحين + الأربعون النووية + السيرة + الصحابة + الأساسيات + الفقه ================= */
let LEARN=null, SEERAH=null, COMPANIONS=null, BUSOLA=null, AGREED=null, USUL_TAFSIR=null,USUL_FIQH=null,FUQAHA=null,HISTORY=null,AQEEDAH=null,FIQH_LIFE=null,TAJWEED=null,HADITH_SCI=null,AKHLAQ=null,ADAB=null,DIGITAL=null,QAWAID=null,busolaMode='maqasid', busolaOpen=null, busolaProgress={}, learnMode='home', learnCategory='', learnQuery='', learnGroup='all';
async function loadLearn(){if(LEARN)return LEARN;try{LEARN=await (await fetch('./knowledge.json')).json()}catch{LEARN={meta:{},essentials:[],fiqh:[]}}return LEARN}
async function loadSeerah(){if(SEERAH)return SEERAH;try{SEERAH=await (await fetch('./seerah.json')).json()}catch{SEERAH={meta:{},items:[]}}return SEERAH}
async function loadCompanions(){if(COMPANIONS)return COMPANIONS;try{COMPANIONS=await (await fetch('./companions.json')).json()}catch{COMPANIONS={meta:{},items:[]}}return COMPANIONS}
async function loadBusola(){if(BUSOLA)return BUSOLA;try{BUSOLA=await (await fetch('./fiqh-busola.json')).json()}catch{BUSOLA={meta:{},sources:{},tracks:[],labs:[]}}busolaProgress=(await store.get('fiqh-busola-progress-v1'))||{};return BUSOLA}
async function loadAgreed(){if(AGREED)return AGREED;try{AGREED=await (await fetch('./agreed-hadith.json')).json()}catch{AGREED={meta:{},items:[]}}return AGREED}
async function loadUsulTafsir(){if(USUL_TAFSIR)return USUL_TAFSIR;try{USUL_TAFSIR=await (await fetch('./usul-tafsir.json')).json()}catch{USUL_TAFSIR={meta:{},items:[]}}return USUL_TAFSIR}
async function loadUsulFiqh(){if(USUL_FIQH)return USUL_FIQH;try{USUL_FIQH=await (await fetch('./usul-fiqh.json')).json()}catch{USUL_FIQH={meta:{},items:[]}}return USUL_FIQH}
async function loadFuqaha(){if(FUQAHA)return FUQAHA;try{FUQAHA=await (await fetch('./fuqaha.json')).json()}catch{FUQAHA={meta:{},items:[]}}return FUQAHA}
async function loadHistory(){if(HISTORY)return HISTORY;try{HISTORY=await (await fetch('./islamic-history.json')).json()}catch{HISTORY={meta:{},items:[]}}return HISTORY}
async function loadAqeedah(){if(AQEEDAH)return AQEEDAH;try{AQEEDAH=await (await fetch('./aqeedah.json')).json()}catch{AQEEDAH={meta:{},items:[]}}return AQEEDAH}
async function loadFiqhLife(){if(FIQH_LIFE)return FIQH_LIFE;try{FIQH_LIFE=await (await fetch('./fiqh-life.json')).json()}catch{FIQH_LIFE={meta:{},items:[]}}return FIQH_LIFE}
async function loadTajweed(){if(TAJWEED)return TAJWEED;try{TAJWEED=await (await fetch('./tajweed.json')).json()}catch{TAJWEED={meta:{},items:[]}}return TAJWEED}
async function loadHadithSciences(){if(HADITH_SCI)return HADITH_SCI;try{HADITH_SCI=await (await fetch('./hadith-sciences.json')).json()}catch{HADITH_SCI={meta:{},items:[]}}return HADITH_SCI}
async function loadAkhlaq(){if(AKHLAQ)return AKHLAQ;try{AKHLAQ=await (await fetch('./akhlaq.json')).json()}catch{AKHLAQ={meta:{},items:[]}}return AKHLAQ}
async function loadAdab(){if(ADAB)return ADAB;try{ADAB=await (await fetch('./adab.json')).json()}catch{ADAB={meta:{},items:[]}}return ADAB}
async function loadDigitalLife(){if(DIGITAL)return DIGITAL;try{DIGITAL=await (await fetch('./digital-life.json')).json()}catch{DIGITAL={meta:{},items:[]}}return DIGITAL}
async function loadQawaid(){if(QAWAID)return QAWAID;try{QAWAID=await (await fetch('./qawaid-fiqh.json')).json()}catch{QAWAID={meta:{},items:[]}}return QAWAID}
const KNOWLEDGE_CATS={aqeedah:{title:'العقيدة والإيمان',items:[['aqeedah','شرح العقيدة والإيمان للعامة']]},fiqh:{title:'الفقه وأحكام الحياة',items:[['fiqh','الفقه الميسر — ابدأ من هنا'],['fiqhlife','فقه حياتي — حسب حالتك']]},quran:{title:'القرآن وعلومه',items:[['muyassar','التفسير الميسر'],['tajweed','التجويد الميسر'],['usultafsir','أصول التفسير']]},sunnah:{title:'السنة والسيرة',items:[['agreed','اللؤلؤ والمرجان'],['nawawi','الأربعون النووية'],['riyad','رياض الصالحين'],['hadithsciences','علوم الحديث'],['seerah','السيرة النبوية']]},akhlaq:{title:'الأخلاق والآداب',items:[['akhlaq','الأخلاق والسلوك'],['adab','الآداب الشرعية'],['digital','الحياة الرقمية']]},advanced:{title:'التفقه والتعمق',items:[['usulfiqh','أصول الفقه'],['qawaid','القواعد الفقهية'],['busola','المقاصد والبوصلة'],['fuqaha','فقهاء عبر العصور'],['companions','الصحابة'],['history','التاريخ الإسلامي']]}};
const KNOWLEDGE_SUBDESC={aqeedah:'شرح تأسيسي موسع بلغة عامة، مع ثمرة عملية وتنبيهات على الفهم الخاطئ.',fiqh:'الكتاب التعليمي الأساسي للعامة، مرتب على أبواب الفقه.',fiqhlife:'وصول سريع للمسألة اليومية مع بيان الاتفاق والجمهور والخلاف والحاجة لفتوى.',muyassar:'التفسير الميسر كاملًا داخل تدارُك مع القراءة والبحث.',tajweed:'مدخل واضح لأحكام التلاوة مع التنبيه إلى أهمية التلقي.',usultafsir:'كيف يُفهم التفسير ومصادره وقواعده الأساسية.',agreed:'الكتاب الكامل فيما اتفق عليه البخاري ومسلم، مع مختارات مشروحة.',nawawi:'الأحاديث الجامعة التي تدور عليها أصول الدين والسلوك.',riyad:'أبواب السنة في العبادة والأخلاق والحياة اليومية.',hadithsciences:'كيف تفهم الصحيح والحسن والضعيف والتخريج قبل النشر.',seerah:'محطات السيرة مع خلاصة وتفصيل وتربويات.',akhlaq:'فهرس الأخلاق المحمودة والمذمومة من موسوعة الدرر السنية.',adab:'آداب المسلم مع الله والناس والعبادات والمعاملات.',digital:'تطبيق الأصول الشرعية والأخلاقية على الهاتف والإنترنت.',usulfiqh:'المقدمات التي تضبط فهم دلالات النصوص وبناء الحكم.',qawaid:'القواعد الكلية التي تعين على فهم الفقه ولا تستقل بالفتوى.',busola:'المقاصد والأولويات وطريقة تصور المسألة قبل الحكم.',fuqaha:'تعريف بأعلام الفقه دون تعصب لمذهب.',companions:'تراجم مختصرة موثقة للصحابة والصحابيات.',history:'خريطة زمنية مختصرة للتاريخ الإسلامي.'};
function sourceUrl(src){return typeof src==='string'?src:(src?.url||'')}
function sourceFamily(src){
  const raw=sourceUrl(src); if(!raw)return searchNorm(typeof src==='string'?src:(src?.label||''));
  try{
    const u=new URL(raw,location.href),host=u.hostname.replace(/^www\./,'').toLowerCase(),seg=u.pathname.split('/').filter(Boolean);
    if(host==='dorar.net')return host+'/'+(seg[0]||'');
    if(host==='shamela.ws'&&seg[0]==='book')return host+'/book/'+(seg[1]||'');
    if(host.endsWith('islamweb.net')&&seg[0]==='ar'&&seg[1]==='library'&&seg[2]==='content')return host+'/library/'+(seg[3]||'');
    if(host==='foundation.binothaimeen.net'&&seg[0]==='ar'&&seg[1]==='books'&&seg[2]==='show')return host+'/books/show/'+(seg[3]||'');
    if(host==='quran.com'||host==='www.quran.com')return 'quran.com';
    if(host==='islamhouse.com'&&seg[0]==='ar'&&seg[1]==='books')return host+'/ar/books/'+(seg[2]||'');
    if(host==='risala.prh.gov.sa'&&seg[0]==='ar'&&(seg[1]==='contents'||seg[1]==='content'))return host+'/'+seg.slice(0,3).join('/');
    return host+u.pathname.replace(/\/+$/,'');
  }catch{return searchNorm(raw)}
}
function sameSourceFamily(a,b){const A=sourceFamily(a),B=sourceFamily(b);return !!A&&!!B&&A===B}
function metaSourceList(m={}){
  const out=[...(m.sources||[])];
  [['book','url'],['source','url'],['primaryBook','primaryUrl'],['verificationBook','verificationUrl'],['detailBook','detailUrl'],['expansionTitle','expansionUrl']].forEach(([l,u])=>{if(m[u])out.push({label:m[l]||'المرجع',url:m[u]})});
  (m.pedagogySources||[]).forEach(x=>out.push(x));
  return out.filter(x=>x&&sourceUrl(x));
}
function uniqueSources(sources=[]){const out=[];for(const x of sources){if(!x)continue;if(out.some(y=>sameSourceFamily(x,y)&&sourceUrl(x)===sourceUrl(y)))continue;out.push(x)}return out}
function extraItemSources(data,x){const primary=metaSourceList(data?.meta||{});return uniqueSources(x?.sources||[]).filter(src=>!primary.some(p=>sameSourceFamily(src,p)))}
function moduleExtraSources(m,x){return extraItemSources({meta:m},x)}
function sourceModules(data,kind='علم'){const m=data?.meta||{},items=data?.items||[];const top=uniqueSources(metaSourceList(m));return `<div class="learn-intro"><b>${laterEsc(m.title||'')}</b><br>${laterEsc(m.subtitle||'')}<div class="source-stack">${sourceStack(top)}</div><span class="learn-note">${laterEsc(m.note||'')}</span></div>`+items.map((x,i)=>{const extra=moduleExtraSources(m,x);return `<article class="learn-module-card">${x.date||x.dates?`<div class="date">${laterEsc(x.date||x.dates)}</div>`:''}<h3>${laterEsc(x.title||x.name)}</h3><div class="lead">${laterEsc(x.lead||'')}</div>${x.points?.length?`<ul>${x.points.map(p=>`<li>${laterEsc(p)}</li>`).join('')}</ul>`:''}${extra.length?`<div class="source-stack module-extra-sources"><div class="source-scope-note">مرجع مختلف خاص بهذه البطاقة</div>${sourceStack(extra)}</div>`:''}${laterRegister(`${kind}:${x.id}`,{kind,title:x.title||x.name,text:x.lead||'',source:x.sources?.[0]?.label||m.book||'',tab:'sunnah'})}</article>`}).join('')}
async function renderSimpleKnowledge(mode){const host=document.getElementById('learn-'+mode);if(!host)return;if(mode==='usultafsir'){await loadUsulTafsir();host.innerHTML=sourceModules(USUL_TAFSIR,'أصول تفسير')}else if(mode==='usulfiqh'){await loadUsulFiqh();host.innerHTML=sourceModules(USUL_FIQH,'أصول فقه')}else if(mode==='fuqaha'){await loadFuqaha();host.innerHTML=sourceModules(FUQAHA,'فقيه')}else if(mode==='history'){await loadHistory();host.innerHTML=sourceModules(HISTORY,'تاريخ')}else if(mode==='muyassar'){host.innerHTML=`<section class="learn-source-first"><small>المصدر والمنهج قبل المحتوى</small><h3>التفسير الميسر — كامل داخل تدارُك</h3><p>اقرأ السور والآيات والتفسير داخل التطبيق نفسه. عند فتح القارئ أول مرة أثناء الاتصال، يحتفظ تدارُك بالنسخة الكاملة للعمل بدون إنترنت بعد ذلك.</p><div class="source-stack">${sourceStack([{label:'التفسير الميسر — الإصدار الرسمي',url:'https://qurancomplex.gov.sa/kfgqpc-books-tafseer-muyassar/'},{label:'منصة مطوري القرآن — مجمع الملك فهد',url:'https://qurancomplex.gov.sa/en/techquran/dev/'}])}</div><button type="button" data-open-muyassar>فتح التفسير الميسر</button></section>`;host.querySelector('[data-open-muyassar]')?.addEventListener('click',()=>openMuyassarSheet())}}
function structuredStatusTone(status=''){const x=searchNorm(status);if(x.includes('جمهور')||x.includes('اتفاق')||x.includes('اجماع'))return 'majority';if(x.includes('خلاف')||x.includes('تفصيل'))return 'difference';if(x.includes('فتوى')||x.includes('معين')||x.includes('شخص'))return 'fatwa';return 'base'}
function structuredSourceIntro(data){const m=data?.meta||{},sources=uniqueSources(metaSourceList(m));return `<section class="learn-source-first"><small>المصدر والمنهج قبل المحتوى</small><h3>${laterEsc(m.title||'')}</h3><p>${laterEsc(m.subtitle||'')}</p><div class="source-stack">${sourceStack(sources)}</div>${m.method?`<div class="learn-method-panel"><b>منهج العرض:</b> ${laterEsc(m.method)}</div>`:''}${m.note?`<p>${laterEsc(m.note)}</p>`:''}</section>`}
function fiqhLifeQuickBar(){const items=[['الصلاة','الصلاة الآن'],['فقه المرأة','فقه المرأة'],['الصيام ورمضان','رمضان والصيام'],['الزكاة','الزكاة'],['الحج والعمرة','الحج والعمرة'],['الأسرة والزواج','الزواج والأسرة'],['المال والمعاملات','المال والمعاملات'],['الجنائز','توفي شخص — ماذا أفعل؟'],['المريض والمسافر','مريض أو مسافر']];return `<section class="fiqh-quick"><small>وصول سريع حسب حالتك</small><div>${items.map(([g,l])=>`<button type="button" data-fiqh-group="${laterEsc(g)}">${laterEsc(l)}</button>`).join('')}</div></section>`}
function zakatCashEstimator(){return `<section class="zakat-estimator"><small>أداة حسابية محدودة — ليست فتوى</small><h3>تقدير ٢٫٥٪ للنقود والمدخرات فقط</h3><p>استخدمها فقط بعد أن تتحقق بنفسك أن المال من النوع الذي يزكى بهذه النسبة وأن شروط النصاب والحول متحققة. لا تستعملها للزروع أو الأنعام أو المسائل الاستثمارية والديون المركبة.</p><label>المبلغ الذي قررت أنه داخل في وعاء الزكاة<input id="zakat-cash-input" inputmode="decimal" type="number" min="0" step="0.01" placeholder="مثال: 100000"></label><button type="button" id="zakat-cash-calc">احسب ٢٫٥٪</button><output id="zakat-cash-output" aria-live="polite"></output><div class="zakat-source-note">المراجع الفقهية المعتمدة لهذا الحساب مذكورة مرة واحدة في بداية «فقه حياتي».</div></section>`}
function structuredDetailBlocks(x){return `${x.explanation?`<section class="learn-explanation"><h4>الشرح المبسط</h4><p>${laterEsc(x.explanation)}</p></section>`:''}${x.points?.length?`<section class="learn-detail-list"><h4>ما الذي ينبغي فهمه؟</h4><ul>${x.points.map(p=>`<li>${laterEsc(p)}</li>`).join('')}</ul></section>`:''}${x.fruits?.length?`<section class="learn-detail-list learn-fruits"><h4>ثمرة هذا الأصل في حياتك</h4><ul>${x.fruits.map(p=>`<li>${laterEsc(p)}</li>`).join('')}</ul></section>`:''}${x.cautions?.length?`<section class="learn-detail-list learn-cautions"><h4>انتبه من هذا الفهم</h4><ul>${x.cautions.map(p=>`<li>${laterEsc(p)}</li>`).join('')}</ul></section>`:''}`}
function structuredKnowledgeCards(items,kind='علم',data=null){if(!items.length)return '<div class="structured-empty">لا توجد نتائج مطابقة. جرّب كلمة أقصر أو اختر «كل الأبواب».</div>';return items.map((x,i)=>{const st=x.status||'',tone=structuredStatusTone(st),extra=data?extraItemSources(data,x):uniqueSources(x.sources||[]),savedSource=data?.meta?.book||data?.meta?.source||x.sources?.[0]?.label||'';return `<details class="learn-card learn-structured-card"><summary><span class="ln">${AR(i+1)}</span><span class="learn-summary-copy"><span class="lt">${laterEsc(x.title||x.name)}</span><span class="learn-summary-hint">${laterEsc(x.lead||'افتح للشرح والتفصيل')}</span></span>${st?`<span class="learn-status" data-tone="${tone}">${laterEsc(st)}</span>`:''}${laterRegister(`${kind}:${x.id}`,{kind,title:x.title||x.name,text:x.lead||'',source:savedSource,tab:'sunnah'})}</summary><div class="learn-body">${x.lead?`<p class="learn-lead">${laterEsc(x.lead)}</p>`:''}${structuredDetailBlocks(x)}${extra.length?`<div class="source-stack module-extra-sources"><div class="source-scope-note">مرجع مختلف خاص بهذا الموضوع</div>${sourceStack(extra)}</div>`:''}</div></details>`}).join('')}
async function renderStructuredKnowledge(mode){const cfg={aqeedah:[loadAqeedah,'عقيدة'],fiqhlife:[loadFiqhLife,'فقه حياتي'],tajweed:[loadTajweed,'تجويد'],hadithsciences:[loadHadithSciences,'علوم حديث'],akhlaq:[loadAkhlaq,'أخلاق'],adab:[loadAdab,'أدب شرعي'],digital:[loadDigitalLife,'حياة رقمية'],qawaid:[loadQawaid,'قاعدة فقهية']}[mode];if(!cfg)return;const data=await cfg[0](),items=data?.items||[],host=document.getElementById('learn-'+mode);if(!host)return;const F=filteredLearn(items),quick=mode==='fiqhlife'?fiqhLifeQuickBar():'',zakat=mode==='fiqhlife'&&learnGroup==='الزكاة'?zakatCashEstimator():'';host.innerHTML=structuredSourceIntro(data)+quick+learnFilters(items)+zakat+`<div class="curriculum-count">${AR(F.length)} من ${AR(items.length)} موضوعًا</div>`+structuredKnowledgeCards(F,cfg[1],data);host.querySelector('#learn-search').oninput=e=>{learnQuery=e.target.value;renderStructuredKnowledge(mode)};host.querySelector('.learn-groups').onclick=e=>{const b=e.target.closest('button[data-lg]');if(!b)return;learnGroup=b.dataset.lg;renderStructuredKnowledge(mode)};host.querySelector('.fiqh-quick')?.addEventListener('click',e=>{const b=e.target.closest('[data-fiqh-group]');if(!b)return;learnGroup=b.dataset.fiqhGroup;renderStructuredKnowledge(mode);requestAnimationFrame(()=>host.querySelector('.learn-tools')?.scrollIntoView({behavior:'smooth',block:'start'}))});const calc=host.querySelector('#zakat-cash-calc');if(calc)calc.onclick=()=>{const input=host.querySelector('#zakat-cash-input'),out=host.querySelector('#zakat-cash-output'),n=Number(input?.value);if(!Number.isFinite(n)||n<0){out.textContent='أدخل مبلغًا صحيحًا غير سالب.';return}out.textContent=`٢٫٥٪ = ${new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2}).format(n*.025)}`}}
function knowledgeSubsectionsHtml(cat){const c=KNOWLEDGE_CATS[cat];return `<div class="knowledge-subsections" role="list">${c.items.map(([id,label],i)=>`<button type="button" data-learn="${id}" role="listitem"><span class="knowledge-sub-no">${AR(i+1)}</span><span class="knowledge-sub-copy"><b>${laterEsc(label)}</b><small>${laterEsc(KNOWLEDGE_SUBDESC[id]||'افتح هذا الباب')}</small></span><span class="knowledge-sub-arrow" aria-hidden="true">←</span></button>`).join('')}</div>`}
function openKnowledgeCategory(cat){const c=KNOWLEDGE_CATS[cat];if(!c)return;learnCategory=cat;learnMode='category';learnQuery='';learnGroup='all';document.getElementById('knowledge-home')?.classList.add('hide');document.querySelectorAll('#v-sunnah>[id^="learn-"]').forEach(el=>{if(!['learn-category-head','learn-seg'].includes(el.id))el.classList.add('hide')});const head=document.getElementById('learn-category-head');head?.classList.remove('hide');document.getElementById('learn-category-title').textContent=c.title;document.getElementById('learn-category-kicker').textContent='أبواب هذا القسم';document.getElementById('learn-category-back').textContent='→ خريطة العلم';const seg=document.getElementById('learn-seg');seg.classList.remove('hide');seg.innerHTML=knowledgeSubsectionsHtml(cat);scrollTo({top:0,behavior:'smooth'})}
function openKnowledgeHome(){learnCategory='';learnMode='home';document.getElementById('knowledge-home')?.classList.remove('hide');document.getElementById('learn-category-head')?.classList.add('hide');document.getElementById('learn-seg')?.classList.add('hide');document.querySelectorAll('#v-sunnah>[id^="learn-"]').forEach(el=>{if(!['learn-category-head','learn-seg'].includes(el.id))el.classList.add('hide')})}
function busolaSources(ids=[]){return `<div class="busola-src">${[...new Set(ids)].map(id=>BUSOLA?.sources?.[id]).filter(Boolean).map(s=>`<a href="${laterEsc(s.url)}" target="_blank" rel="noopener">${laterEsc(s.label)} ↗</a>`).join('')}</div>`}
function busolaCollectSourceIds(root){const ids=[];const add=v=>{if(!v)return;if(Array.isArray(v)){v.forEach(add);return}if(typeof v!=='object')return;if(Array.isArray(v.sourceIds))ids.push(...v.sourceIds);Object.values(v).forEach(add)};add(root);return [...new Set(ids)]}
function busolaSourcePanel(root,title='مصادر هذا المسار'){const ids=Array.isArray(root)&&root.every(x=>typeof x==='string')?[...new Set(root)]:busolaCollectSourceIds(root);if(!ids.length)return '';return `<section class="section-source-panel compact busola-source-panel"><div class="section-source-kicker">${laterEsc(title)}</div><p>المراجع مجمعة هنا مرة واحدة؛ المراحل التالية تعرض المادة بلا تكرار بصري لنفس المصدر.</p><div class="source-stack">${sourceStack(ids.map(id=>BUSOLA?.sources?.[id]).filter(Boolean))}</div></section>`}
function busolaKey(track,lesson){return `${track}:${lesson}`}
function busolaState(track,lesson){const k=busolaKey(track,lesson),x=busolaProgress[k]||{};return {...x,done:Array.isArray(x.done)?x.done:[]}}
async function busolaMark(track,lesson,n){const k=busolaKey(track,lesson),x=busolaState(track,lesson);if(!x.done.includes(n))x.done.push(n);x.open=Math.min(4,n+1);x.lastAt=Date.now();busolaProgress[k]=x;await store.set('fiqh-busola-progress-v1',busolaProgress);renderBusola()}
function busolaLessonCard(track,l,i){const st=busolaState(track.id,l.id),pct=Math.round(st.done.length/4*100);return `<article class="busola-card" data-busola-lesson="${laterEsc(track.id)}:${laterEsc(l.id)}"><div class="k">${laterEsc(track.title)} · باب ${AR(i+1)}</div><h3>${laterEsc(l.title)}</h3><p>${laterEsc(l.lead)}</p><div class="busola-meter"><span>${AR(st.done.length)}/٤ مستويات</span><i><em style="width:${pct}%"></em></i></div></article>`}
function busolaLessonDetail(track,l){const st=busolaState(track.id,l.id);return `<button class="busola-back" data-busola-back>→ رجوع إلى ${laterEsc(track.title)}</button><div class="busola-hero"><small>${laterEsc(track.title)}</small><h2>${laterEsc(l.title)}</h2><p>${laterEsc(l.lead)}</p><div class="busola-note">إتمام المراحل يعني دراسة المادة فقط، وليس رتبة علمية أو أهلية للفتوى.</div></div>${busolaSourcePanel(l,'مصادر هذا الباب')}<div class="busola-detail">${(l.stages||[]).map((s,i)=>{const can=i===0||st.done.includes((l.stages||[])[i-1].n),done=st.done.includes(s.n);return `<section class="busola-stage${can?'':' lock'}"><div class="busola-stage-head"><b>${laterEsc(s.title)}</b><span>المستوى ${AR(i+1)} من ٤</span></div><div class="busola-stage-body">${can?`<p>${laterEsc(s.text)}</p>${s.points?.length?`<ul>${s.points.map(p=>`<li>${laterEsc(p)}</li>`).join('')}</ul>`:''}${done?`<div class="busola-stage-ok">✓ درست هذا المستوى ويمكنك مراجعته متى شئت.</div>`:`<button class="busola-stage-done" data-busola-done="${laterEsc(track.id)}:${laterEsc(l.id)}:${s.n}">فهمت هذا المستوى${i<3?' — افتح التالي':''}</button>`}`:`<p>أكمل المستوى السابق أولًا حتى يكون التدرج مترابطًا.</p>`}</div></section>`}).join('')}</div>`}
async function renderBusola(){await loadBusola();const host=document.getElementById('learn-busola');if(!host)return;const m=BUSOLA.meta||{};if(busolaOpen){const [tid,lid]=busolaOpen.split(':'),tr=(BUSOLA.tracks||[]).find(x=>x.id===tid),l=tr?.lessons?.find(x=>x.id===lid);if(tr&&l){host.innerHTML=busolaLessonDetail(tr,l);host.onclick=busolaClick;return}busolaOpen=null}
 const tabs=[...(BUSOLA.tracks||[]).map(t=>`<button data-busola-mode="${t.id}" class="${busolaMode===t.id?'on':''}">${laterEsc(t.title)}</button>`),`<button data-busola-mode="lab" class="${busolaMode==='lab'?'on':''}">مختبر البوصلة</button>`].join('');
 const hero=`<div class="busola-hero"><small>مسار تعليمي جديد</small><h2>${laterEsc(m.title||'فقه البوصلة')}</h2><p>${laterEsc(m.subtitle||'')}</p><div class="busola-note">${laterEsc(m.note||'')}</div></div><div class="busola-tabs">${tabs}</div>`;
 if(busolaMode==='lab'){host.innerHTML=hero+`<div class="busola-note">المختبر لا يعطيك «الجواب النهائي». هدفه أن تتعلم ما المعلومات والأسئلة التي تسبق الحكم، ثم ترجع إلى أهل العلم عند الحاجة.</div>`+(BUSOLA.labs||[]).map(x=>`<article class="busola-lab"><h3>${laterEsc(x.title)}</h3>${busolaSourcePanel(x.sourceIds||[],'مصادر هذه الحالة')}<div class="sit">${laterEsc(x.situation)}</div><h4>اسأل قبل أن تحكم</h4><ul>${(x.questions||[]).map(q=>`<li>${laterEsc(q)}</li>`).join('')}</ul><h4>البوصلة</h4><ul>${(x.principles||[]).map(q=>`<li>${laterEsc(q)}</li>`).join('')}</ul></article>`).join('');host.onclick=busolaClick;return}
 const tr=(BUSOLA.tracks||[]).find(x=>x.id===busolaMode)||BUSOLA.tracks?.[0];host.innerHTML=hero+busolaSourcePanel(tr,'مصادر هذا المسار')+`<div class="busola-note"><b>لا تكرار مع «ارتقِ»:</b> هنا تتعلم القواعد. أما ترتيب خطتك الشخصية اليومية فيبقى داخل «ارتقِ» و«خطة اليوم».</div><div class="busola-grid">${(tr?.lessons||[]).map((l,i)=>busolaLessonCard(tr,l,i)).join('')}</div>`;host.onclick=busolaClick}
async function busolaClick(e){const mode=e.target.closest('[data-busola-mode]');if(mode){busolaMode=mode.dataset.busolaMode;busolaOpen=null;renderBusola();return}const card=e.target.closest('[data-busola-lesson]');if(card){busolaOpen=card.dataset.busolaLesson;renderBusola();scrollTo({top:0,behavior:'smooth'});return}if(e.target.closest('[data-busola-back]')){busolaOpen=null;renderBusola();return}const done=e.target.closest('[data-busola-done]');if(done){const [t,l,n]=done.dataset.busolaDone.split(':');await busolaMark(t,l,+n);toast('سُجل تقدم الدراسة ✓');return}}
function sourceStack(sources=[],fallbackLabel='',fallbackUrl=''){
  const ss=sources.length?sources:(fallbackLabel?[{label:fallbackLabel,url:fallbackUrl}]:[]);
  return ss.map((s,i)=>`<div class="learn-source source-ref"><span class="src-mark">↗</span><span><span class="src-label">${i?'مرجع إضافي':'المصدر'}</span> ${s.url?`<a href="${laterEsc(s.url)}" target="_blank" rel="noopener">${laterEsc(s.label)}</a>`:laterEsc(s.label)}</span></div>`).join('');
}
function mediumSections(sections=[]){return sections.length?`<div class="learn-depth"><div class="learn-depth-head">التفصيل المتوسط</div>${sections.map(s=>`<section><h4>${laterEsc(s.title)}</h4><p>${laterEsc(s.text)}</p>${s.bullets?.length?`<ul>${s.bullets.map(b=>`<li>${laterEsc(b)}</li>`).join('')}</ul>`:''}</section>`).join('')}</div>`:''}
function seerahReflections(x){const rr=x.reflections||[];return rr.length?`<div class="seerah-reflections"><div class="learn-depth-head">تربويات وإرشادات واستنباطات</div><div class="seerah-reflection-grid">${rr.map(r=>`<div class="seerah-reflection"><span>${laterEsc(r.type||'فائدة')}</span><p>${laterEsc(r.text||'')}</p></div>`).join('')}</div></div>`:''}
function seerahCards(items,m={}){return items.map((x,i)=>{const plus=laterRegister(`seerah:${x.id}`,{kind:'سيرة',title:x.title,text:x.lead,source:m.book||x.sourceLabel||'',tab:'sunnah'}),extra=uniqueSources(x.sources||[]).filter(src=>!metaSourceList(m).some(p=>sameSourceFamily(src,p)));return `<details class="learn-card seerah-card"><summary><span class="ln">${AR(i+1)}</span><span class="learn-summary-copy"><span class="lt">${laterEsc(x.title)}</span><span class="learn-summary-hint">خلاصة · تفاصيل · تربويات</span></span>${plus}</summary><div class="learn-body"><div class="learn-depth-head soft">الخلاصة السريعة</div><p class="learn-lead">${laterEsc(x.lead)}</p>${x.bullets?.length?`<ul>${x.bullets.map(b=>`<li>${laterEsc(b)}</li>`).join('')}</ul>`:''}${mediumSections(x.detailSections||[])}${seerahReflections(x)}${extra.length?`<div class="source-stack module-extra-sources"><div class="source-scope-note">مرجع مختلف خاص بهذه المحطة</div>${sourceStack(extra)}</div>`:''}</div></details>`}).join('')}
async function renderSeerah(){await loadSeerah();const host=document.getElementById('learn-seerah'),items=SEERAH.items||[],q=searchNorm(learnQuery),groups=['all',...new Set(items.map(x=>x.group).filter(Boolean))],F=items.filter(x=>(learnGroup==='all'||x.group===learnGroup)&&(!q||searchNorm(deepSearchText(x)).includes(q))),m=SEERAH.meta||{};host.innerHTML=`<div class="learn-intro seerah-intro"><b>${laterEsc(m.title||'السيرة النبوية')}</b><br>ابدأ بالخلاصة، ثم افتح أي محطة للتفصيل وطبقة «التربويات والإرشادات والاستنباطات».<div class="learn-ref-row"><a href="${laterEsc(m.url)}" target="_blank" rel="noopener">${laterEsc(m.book||'رسول الإسلام محمد ﷺ')}</a>${m.detailUrl?`<a href="${laterEsc(m.detailUrl)}" target="_blank" rel="noopener">${laterEsc(m.detailBook||'مرجع السيرة المفصل')}</a>`:''}</div><span class="learn-note">${laterEsc(m.note||'')}</span>${m.pedagogyNote?`<div class="seerah-pedagogy-note"><b>${laterEsc(m.pedagogyTitle||'التربويات')}</b><br>${laterEsc(m.pedagogyNote)}</div>`:''}${m.pedagogySources?.length?`<div class="learn-ref-row">${m.pedagogySources.map(x=>`<a href="${laterEsc(x.url)}" target="_blank" rel="noopener">${laterEsc(x.label)}</a>`).join('')}</div>`:''}</div><div class="learn-tools"><input id="seerah-search" class="q-search" type="search" value="${laterEsc(learnQuery)}" placeholder="ابحث في السيرة: بدر، الهجرة، مكة…"><div class="learn-groups">${groups.map(x=>`<button data-sg="${laterEsc(x)}" class="${learnGroup===x?'on':''}">${x==='all'?'كل المحطات':laterEsc(x)}</button>`).join('')}</div></div><div class="search-count">${AR(F.length)} من ${AR(items.length)} محطة</div>${seerahCards(F,m)}<div class="learn-intro" style="margin-top:12px"><b>كتاب متوسط للتوسع</b><br><a href="${laterEsc(m.expansionUrl)}" target="_blank" rel="noopener">${laterEsc(m.expansionTitle||'فتح مرجع التوسع')}</a><br><span class="learn-note">الكتاب المرجعي أوسع من بطاقات تدارُك؛ والبطاقات هنا تلخيص تعليمي وليست نقلًا حرفيًا.</span></div>`;host.querySelector('#seerah-search').oninput=e=>{learnQuery=e.target.value;renderSeerah()};host.querySelector('.learn-groups').onclick=e=>{const b=e.target.closest('button[data-sg]');if(!b)return;learnGroup=b.dataset.sg;renderSeerah()}}
const AGREED_PAGE_SIZE=24;
let agreedMode='full', agreedSection='', agreedPage=0, agreedSectionQuery='', agreedFullResults=null, agreedFocusNumber=0;
const AGREED_REMOTE={status:'idle',base:'',bookPath:'',book:null,sections:[],sectionCache:new Map(),all:null,error:'',loaded:0};
function parseToonLine(line){const out=[];let cur='',quoted=false,i=0;for(;i<line.length;){const ch=line[i];if(quoted){if(ch==='"'){if(line[i+1]==='"'){cur+='"';i+=2}else{quoted=false;i++}}else{cur+=ch;i++}}else if(ch==='"'){quoted=true;i++}else if(ch===','){out.push(cur);cur='';i++}else{if(ch!=='\r')cur+=ch;i++}}out.push(cur);return out}
function toonQuoteOpen(s){let q=false;for(let i=0;i<s.length;i++){if(s[i]!== '"')continue;if(q&&s[i+1]==='"'){i++;continue}q=!q}return q}
function parseToonTable(text,name=''){const safe=String(name||'').replace(/[^A-Za-z0-9_-]/g,'');const re=safe?new RegExp(`(?:^|\\n)\\s*${safe}\\[(?:count|\\d+)\\]\\{([^}]*)\\}\\s*:\\s*`,'m'):/(?:^|\n)\s*([A-Za-z_][\w-]*)\[(?:count|\d+)\]\{([^}]*)\}\s*:\s*/m;const m=re.exec(text);if(!m)return[];const cols=(safe?m[1]:m[2]).split(',').map(x=>x.trim()),tail=text.slice(m.index+m[0].length),lines=tail.split(/\r?\n/),rows=[];let buf='';for(const raw of lines){const t=raw.trim();if(!buf&&/^[A-Za-z_][\w-]*\[(?:count|\d+)\]\{/.test(t))break;if(!buf&&(!t||t.startsWith('#')||t==='metadata:'))continue;buf+=(buf?'\n':'')+raw;if(toonQuoteOpen(buf))continue;const row=parseToonLine(buf.trim());buf='';if(!row.some(v=>String(v).trim()))continue;const obj={};cols.forEach((c,i)=>obj[c]=row[i]??'');rows.push(obj)}return rows}
function parseToonMeta(text){const out={};let on=false;for(const raw of String(text).split(/\r?\n/)){const t=raw.trim();if(t==='metadata:'){on=true;continue}if(!on)continue;if(/^[A-Za-z_][\w-]*\[(?:count|\d+)\]\{/.test(t))break;const m=t.match(/^([\w-]+):\s*(.*)$/);if(m)out[m[1]]=m[2].replace(/^"|"$/g,'')}return out}
async function agreedFetchUrl(url,ms=12000){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),ms);try{const r=await fetch(url,{signal:ctrl.signal,cache:'default'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.text()}finally{clearTimeout(timer)}}
async function agreedFetchPath(path){const cfg=AGREED?.meta?.corpus||{},bases=[AGREED_REMOTE.base,...(cfg.bases||[])].filter((x,i,a)=>x&&a.indexOf(x)===i),clean=String(path||'').replace(/^\/+/,''),errs=[];for(const b of bases){try{const text=await agreedFetchUrl(`${b.replace(/\/$/,'')}/${clean}`);if(!AGREED_REMOTE.base)AGREED_REMOTE.base=b;return text}catch(e){errs.push(`${b}: ${e?.message||e}`)}}throw new Error(errs.join(' | ')||'تعذر تحميل المصدر الرقمي')}
async function ensureAgreedCatalog(){if(AGREED_REMOTE.status==='ready')return AGREED_REMOTE;if(AGREED_REMOTE.status==='loading')return AGREED_REMOTE.promise;AGREED_REMOTE.status='loading';AGREED_REMOTE.promise=(async()=>{try{const cfg=AGREED.meta?.corpus||{},expected=Number(cfg.expectedCount||AGREED.meta?.expectedCount||1906),idx=await agreedFetchPath(cfg.indexPath||'info.toon'),books=parseToonTable(idx),book=books.find(x=>Number(String(x.total_hadiths||'').replace(/,/g,''))===expected&&/lulu|lu.?lu|marjan/i.test(`${x.id||''} ${x.name||''} ${x.path||''}`));if(!book)throw new Error(`لم تُعرّف مجموعة اللؤلؤ والمرجان ذات ${expected} حديثًا في الفهرس الرقمي`);const path=String(book.path||`editions/${book.id}`).replace(/^\/+|\/$/g,''),info=await agreedFetchPath(`${path}/info.toon`),sections=parseToonTable(info,'sections').filter(x=>x.id&&Number(x.hadith_last||x.arabic_last||0)>=Number(x.hadith_first||x.arabic_first||0));if(!sections.length)throw new Error('تعذر قراءة فهرس أبواب اللؤلؤ والمرجان');AGREED_REMOTE.book={...book,...parseToonMeta(info)};AGREED_REMOTE.bookPath=path;AGREED_REMOTE.sections=sections;AGREED_REMOTE.status='ready';if(!agreedSection)agreedSection=String(sections[0].id);return AGREED_REMOTE}catch(e){AGREED_REMOTE.status='error';AGREED_REMOTE.error=e?.message||String(e);throw e}})();return AGREED_REMOTE.promise}
function agreedSectionName(s){return String(s?.name_ar||s?.name||`الباب ${s?.id||''}`).trim()}
function dorarSearchUrl(text){const q=String(text||'').replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,' ').trim().slice(0,150);return `https://dorar.net/hadith/search?q=${encodeURIComponent(q)}`}
function normalizeCorpusHadith(row,section,chapterIndex=1){const n=Number(row.hadithnumber||row.international_number||0),text=String(row.arabic||'').trim(),sectionId=String(section?.id||'');return{id:`lulu-${n||sectionId+'-'+chapterIndex}`,n,text,reference:String(row.reference||'').trim(),chain:String(row.narrator_chain||'').trim(),chapter:String(row.chapter_intro||agreedSectionName(section)).trim(),chapterIndex:Number(chapterIndex||1),sectionId,section:agreedSectionName(section),sourceUrl:dorarSearchUrl(text),catalogUrl:`https://hadithunlocked.com/lulu-marjan/${encodeURIComponent(sectionId)}/${Number(chapterIndex||1)}`}}
async function loadAgreedSection(id){await ensureAgreedCatalog();const key=String(id||agreedSection||AGREED_REMOTE.sections[0]?.id||'');if(AGREED_REMOTE.sectionCache.has(key))return AGREED_REMOTE.sectionCache.get(key);const sec=AGREED_REMOTE.sections.find(x=>String(x.id)===key);if(!sec)throw new Error('الباب المطلوب غير موجود');const text=await agreedFetchPath(`${AGREED_REMOTE.bookPath}/sections/${key}.toon`),rows=parseToonTable(text,'hadiths');let chapterIndex=0,lastChapter='';const items=rows.map(r=>{const chapter=String(r.chapter_intro||'').trim();if(chapter!==lastChapter){chapterIndex++;lastChapter=chapter}return normalizeCorpusHadith(r,sec,Math.max(1,chapterIndex))}).filter(x=>x.n&&x.text);AGREED_REMOTE.sectionCache.set(key,items);return items}
async function loadAllAgreed(onProgress=()=>{}){await ensureAgreedCatalog();if(AGREED_REMOTE.all)return AGREED_REMOTE.all;const all=[];for(let i=0;i<AGREED_REMOTE.sections.length;i+=4){const batch=AGREED_REMOTE.sections.slice(i,i+4);const chunks=await Promise.all(batch.map(s=>loadAgreedSection(s.id).catch(()=>[])));chunks.forEach(x=>all.push(...x));AGREED_REMOTE.loaded=Math.min(i+batch.length,AGREED_REMOTE.sections.length);onProgress(AGREED_REMOTE.loaded,AGREED_REMOTE.sections.length)}const by=new Map;all.forEach(x=>{if(!by.has(x.n))by.set(x.n,x)});const sorted=[...by.values()].sort((a,b)=>a.n-b.n),expected=Number(AGREED.meta?.expectedCount||1906);if(sorted.length!==expected)throw new Error(`فحص سلامة corpus: المتوقع ${expected} حديثًا، والمقروء ${sorted.length}. أوقف تدارُك اعتبار النسخة كاملة.`);AGREED_REMOTE.all=sorted;return sorted}
function agreedIntroHtml(){const m=AGREED.meta||{},cfg=m.corpus||{};return `<div class="learn-intro agreed-intro"><b>${laterEsc(m.title||'اللؤلؤ والمرجان')}</b><br>${laterEsc(m.subtitle||'')}<div class="learn-ref-row"><a href="${laterEsc(m.url||'https://islamhouse.com/ar/books/409667/')}" target="_blank" rel="noopener">المرجع الأصلي — ${laterEsc(m.source||'اللؤلؤ والمرجان')} ↗</a>${m.catalogUrl?`<a href="${laterEsc(m.catalogUrl)}" target="_blank" rel="noopener">فهرس رقمي مستقل للكتاب ↗</a>`:''}${cfg.repository?`<a href="${laterEsc(cfg.repository)}" target="_blank" rel="noopener">طبقة البيانات الرقمية ↗</a>`:''}</div><span class="learn-note">${laterEsc(m.note||'')}</span></div>`}
function agreedCards(items){return items.map((x,i)=>`${laterRegister(`agreed:${x.id}`,{kind:'حديث متفق عليه',title:x.title,text:x.text,source:'صحيح البخاري وصحيح مسلم',tab:'sunnah'})}<article class="agreed-card agreed-reviewed"><div class="agreed-top"><span>مختار مشروح ${AR(i+1)}</span><span>البخاري ${laterEsc(x.bukhari)} · مسلم ${laterEsc(x.muslim)}</span></div><h3>${laterEsc(x.title)}</h3><div class="agreed-text">«${laterEsc(x.text)}»</div><div class="agreed-narrator">${laterEsc(x.narrator||'')}</div><div class="agreed-explain"><b>شرح مبسط مراجع</b><p>${laterEsc(x.meaning||'')}</p></div><div class="agreed-practice"><b>تطبيق</b><p>${laterEsc(x.practice||'')}</p></div><a class="agreed-source" href="${laterEsc(x.sourceUrl||'')}" target="_blank" rel="noopener">الحديث وشرحه في الدرر السنية ↗</a></article>`).join('')}
function corpusCards(items){return items.map(x=>`${laterRegister(`agreed:lulu-${x.n}`,{kind:'حديث متفق عليه',title:`اللؤلؤ والمرجان ${x.n}`,text:x.text,source:'اللؤلؤ والمرجان فيما اتفق عليه الشيخان',tab:'sunnah'})}<article class="agreed-card corpus-card" data-agreed-n="${x.n}"><div class="agreed-top"><span>اللؤلؤ والمرجان ${AR(x.n)}</span><span>${laterEsc(x.section)}</span></div><div class="agreed-text">${laterEsc(x.text)}</div>${x.reference?`<div class="agreed-narrator">المرجع الرقمي: ${laterEsc(x.reference)}</div>`:''}<div class="agreed-explain"><b>الشرح</b><p>لا يضع تدارُك شرحًا آليًا غير مُراجع لهذا الحديث. افتح الشرح والتخريج الموثق، أو انتقل إلى «مختارات مشروحة» للأحاديث التي راجعنا شرحها داخل التطبيق.</p></div><div class="learn-ref-row"><a class="agreed-source" href="${laterEsc(x.catalogUrl)}" target="_blank" rel="noopener">موضع الحديث في فهرس اللؤلؤ والمرجان ↗</a><a class="agreed-source" href="${laterEsc(x.sourceUrl)}" target="_blank" rel="noopener">البحث عن الحديث وشرحه في الدرر السنية ↗</a></div></article>`).join('')}
function agreedModeBar(){return `<div class="agreed-mode-tabs" role="tablist" aria-label="طريقة قراءة الأحاديث"><button data-agreed-mode="full" aria-current="${agreedMode==='full'}">الكتاب كاملًا · ${AR(Number(AGREED.meta?.expectedCount||1906))}</button><button data-agreed-mode="curated" aria-current="${agreedMode==='curated'}">مختارات مشروحة · ${AR((AGREED.items||[]).length)}</button></div>`}
async function renderAgreed(){await loadAgreed();const host=document.getElementById('learn-agreed');if(!host)return;const head=agreedIntroHtml()+agreedModeBar();if(agreedMode==='curated'){const items=AGREED.items||[],q=searchNorm(learnQuery),F=items.filter(x=>!q||searchNorm(deepSearchText(x)).includes(q));host.innerHTML=head+`<input id="agreed-search" class="q-search" type="search" value="${laterEsc(learnQuery)}" placeholder="ابحث في المختارات المشروحة…"><div class="search-count">${AR(F.length)} من ${AR(items.length)} مختارًا مشروحًا</div><div class="agreed-grid">${agreedCards(F)}</div>`;host.querySelector('#agreed-search').oninput=e=>{learnQuery=e.target.value;renderAgreed()};bindAgreedCommon(host);return}
  host.innerHTML=head+`<div class="agreed-corpus-status"><span class="spin-dot"></span> جارٍ فتح فهرس الكتاب الكامل…</div>`;bindAgreedCommon(host);try{await ensureAgreedCatalog()}catch(e){host.insertAdjacentHTML('beforeend',`<div class="nafs-empty agreed-error"><b>تعذر تحميل الكتاب الكامل الآن.</b><br>${laterEsc(AGREED_REMOTE.error||e?.message||'')}<br><span>المختارات المشروحة المحلية ما زالت متاحة، ويمكن الرجوع إلى المرجع الأصلي من الروابط أعلاه.</span><button id="agreed-retry" class="back" type="button">إعادة المحاولة</button></div>`);host.querySelector('#agreed-retry').onclick=()=>{AGREED_REMOTE.status='idle';AGREED_REMOTE.base='';AGREED_REMOTE.error='';renderAgreed()};return}
  const secs=AGREED_REMOTE.sections,sec=secs.find(s=>String(s.id)===String(agreedSection))||secs[0];agreedSection=String(sec.id);let items=[];try{items=await loadAgreedSection(agreedSection)}catch(e){host.innerHTML=head+`<div class="nafs-empty">تعذر تحميل هذا الباب: ${laterEsc(e?.message||e)}</div>`;bindAgreedCommon(host);return}const q=searchNorm(agreedSectionQuery),shown=agreedFullResults||(q?items.filter(x=>searchNorm(`${x.text} ${x.reference} ${x.chapter}`).includes(q)):items),pages=Math.max(1,Math.ceil(shown.length/AGREED_PAGE_SIZE));agreedPage=Math.min(agreedPage,pages-1);const pageItems=shown.slice(agreedPage*AGREED_PAGE_SIZE,(agreedPage+1)*AGREED_PAGE_SIZE),countLabel=agreedFullResults?`${AR(shown.length)} نتيجة في الكتاب كاملًا`:`${AR(items.length)} حديثًا في ${laterEsc(agreedSectionName(sec))}`;host.innerHTML=head+`<div class="agreed-corpus-tools"><label><span>الكتاب / الباب</span><select id="agreed-section">${secs.map(s=>`<option value="${laterEsc(s.id)}" ${String(s.id)===agreedSection?'selected':''}>${laterEsc(agreedSectionName(s))} · ${AR(Math.max(0,Number(s.hadith_last||0)-Number(s.hadith_first||0)+1))}</option>`).join('')}</select></label><label class="agreed-jump"><span>اذهب إلى رقم</span><input id="agreed-jump" type="number" min="1" max="${Number(AGREED.meta?.expectedCount||1906)}" inputmode="numeric" placeholder="مثال: ١٩٠٦"></label><label class="agreed-search-box"><span>بحث</span><input id="agreed-search" type="search" value="${laterEsc(agreedSectionQuery)}" placeholder="ابحث في الباب الحالي…"></label><button id="agreed-search-all" type="button" ${agreedSectionQuery?'':'disabled'}>بحث في كل ${AR(Number(AGREED.meta?.expectedCount||1906))}</button><button id="agreed-offline" type="button">تحميل الكتاب كاملًا للاستخدام دون اتصال</button></div><div id="agreed-progress" class="agreed-progress hide"></div><div class="search-count">${countLabel}${agreedFullResults?' · اضغط «مسح البحث الكامل» للعودة للباب':''}</div>${agreedFullResults?`<button id="agreed-clear-all" class="back agreed-clear" type="button">مسح البحث الكامل</button>`:''}<div class="agreed-grid">${corpusCards(pageItems)}</div>${pages>1?`<div class="agreed-pager"><button data-agreed-page="prev" ${agreedPage<=0?'disabled':''}>السابق</button><span>صفحة ${AR(agreedPage+1)} من ${AR(pages)}</span><button data-agreed-page="next" ${agreedPage>=pages-1?'disabled':''}>التالي</button></div>`:''}`;bindAgreedCommon(host);bindAgreedCorpus(host,sec,items);if(agreedFocusNumber){const el=host.querySelector(`[data-agreed-n="${agreedFocusNumber}"]`);if(el){requestAnimationFrame(()=>el.scrollIntoView({behavior:'smooth',block:'center'}));agreedFocusNumber=0}}
}
function bindAgreedCommon(host){host.querySelector('.agreed-mode-tabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-agreed-mode]');if(!b)return;agreedMode=b.dataset.agreedMode;learnQuery='';agreedSectionQuery='';agreedFullResults=null;agreedPage=0;renderAgreed()})}
function bindAgreedCorpus(host,sec,items){const sel=host.querySelector('#agreed-section');if(sel)sel.onchange=e=>{agreedSection=e.target.value;agreedPage=0;agreedSectionQuery='';agreedFullResults=null;renderAgreed()};const search=host.querySelector('#agreed-search');if(search)search.oninput=e=>{agreedSectionQuery=e.target.value;agreedPage=0;agreedFullResults=null;renderAgreed()};const jump=host.querySelector('#agreed-jump');if(jump)jump.onchange=async e=>{const n=Number(e.target.value);if(!Number.isFinite(n)||n<1||n>Number(AGREED.meta?.expectedCount||1906))return;const s=AGREED_REMOTE.sections.find(x=>n>=Number(x.hadith_first||x.arabic_first||0)&&n<=Number(x.hadith_last||x.arabic_last||0));if(s){agreedSection=String(s.id);agreedSectionQuery='';agreedFullResults=null;agreedFocusNumber=n;const first=Number(s.hadith_first||s.arabic_first||n);agreedPage=Math.max(0,Math.floor((n-first)/AGREED_PAGE_SIZE));renderAgreed()}};host.querySelector('.agreed-pager')?.addEventListener('click',e=>{const b=e.target.closest('[data-agreed-page]');if(!b)return;agreedPage+=b.dataset.agreedPage==='next'?1:-1;renderAgreed();scrollTo({top:host.offsetTop-110,behavior:'smooth'})});host.querySelector('#agreed-clear-all')?.addEventListener('click',()=>{agreedFullResults=null;agreedSectionQuery='';agreedPage=0;renderAgreed()});host.querySelector('#agreed-search-all')?.addEventListener('click',async()=>{const q=searchNorm(agreedSectionQuery);if(!q)return;const prog=host.querySelector('#agreed-progress');prog?.classList.remove('hide');if(prog)prog.textContent='جارٍ تحميل أبواب الكتاب للبحث الكامل…';try{const all=await loadAllAgreed((n,t)=>{if(prog)prog.textContent=`تحميل الأبواب: ${AR(n)} من ${AR(t)}`});agreedFullResults=all.filter(x=>searchNorm(`${x.text} ${x.reference} ${x.chapter} ${x.section}`).includes(q));agreedPage=0;renderAgreed()}catch(e){if(prog)prog.textContent=`تعذر إكمال البحث: ${e?.message||e}`}});host.querySelector('#agreed-offline')?.addEventListener('click',async()=>{const prog=host.querySelector('#agreed-progress');prog?.classList.remove('hide');if(prog)prog.textContent='جارٍ تحميل الكتاب كاملًا…';try{await loadAllAgreed((n,t)=>{if(prog)prog.textContent=`تحميل الأبواب: ${AR(n)} من ${AR(t)}`});if(prog)prog.textContent=`تم التحقق من ${AR(AGREED_REMOTE.all.length)} حديثًا. سيحتفظ تدارُك بالملفات المحمّلة عبر Service Worker عند توفره.`;toast('اكتمل تحميل اللؤلؤ والمرجان')}catch(e){if(prog)prog.textContent=`لم يكتمل التحميل: ${e?.message||e}`}})}

function companionCards(items,m={}){const primary=[{label:m.primaryBook,url:m.primaryUrl},{label:m.verificationBook,url:m.verificationUrl}].filter(x=>x.url);return items.map((x,i)=>{const src=m.primaryBook||x.sources?.[0]?.label||'';const plus=laterRegister(`companion:${x.id}`,{kind:'صحابي',title:x.name,text:x.intro,source:src,tab:'sunnah'}),extra=uniqueSources(x.sources||[]).filter(y=>!primary.some(p=>sameSourceFamily(y,p)));return `<details class="learn-card companion-card"><summary><span class="ln">${AR(i+1)}</span><span class="learn-summary-copy"><span class="lt">${laterEsc(x.name)}</span><span class="companion-desc">${laterEsc(x.descriptor||'')}</span></span>${plus}</summary><div class="learn-body"><div class="companion-tags">${(x.groups||[]).map(g=>`<span>${laterEsc(g)}</span>`).join('')}</div><div class="learn-depth-head soft">تعريف سريع</div><p class="learn-lead">${laterEsc(x.intro||'')}</p>${mediumSections(x.sections||[])}${extra.length?`<div class="source-stack module-extra-sources"><div class="source-scope-note">مرجع مختلف خاص بالترجمة</div>${sourceStack(extra)}</div>`:''}</div></details>`}).join('')}
async function renderCompanions(){await loadCompanions();const host=document.getElementById('learn-companions'),items=COMPANIONS.items||[],q=searchNorm(learnQuery),groups=['all',...new Set(items.flatMap(x=>x.groups||[]))],F=items.filter(x=>(learnGroup==='all'||(x.groups||[]).includes(learnGroup))&&(!q||searchNorm(deepSearchText(x)).includes(q))),m=COMPANIONS.meta||{};host.innerHTML=`<div class="learn-intro companions-intro"><b>${laterEsc(m.title||'الصحابة رضي الله عنهم')}</b><br>${laterEsc(m.subtitle||'')}<div class="learn-ref-row"><a href="${laterEsc(m.primaryUrl||'')}" target="_blank" rel="noopener">${laterEsc(m.primaryBook||'سير أعلام النبلاء')}</a><a href="${laterEsc(m.verificationUrl||'')}" target="_blank" rel="noopener">${laterEsc(m.verificationBook||'الإصابة في تمييز الصحابة')}</a></div><span class="learn-note">${laterEsc(m.note||'')}</span></div><div class="learn-tools"><input id="companion-search" class="q-search" type="search" value="${laterEsc(learnQuery)}" placeholder="ابحث: أبو بكر، عائشة، بلال…"><div class="learn-groups">${groups.map(x=>`<button data-cg="${laterEsc(x)}" class="${learnGroup===x?'on':''}">${x==='all'?'كل الشخصيات':laterEsc(x)}</button>`).join('')}</div></div><div class="search-count">${AR(F.length)} من ${AR(items.length)} شخصية في الدفعة الأولى</div>${companionCards(F,m)}<div class="learn-disclaimer">هذه الدفعة بداية فقط. لا نضيف رواية ملونة أو فضيلة خاصة لمجرد شهرتها؛ ما يحتاج حكمًا حديثيًا خاصًا يُراجع في مصدر الحديث قبل عرضه بصيغة تقريرية.</div>`;host.querySelector('#companion-search').oninput=e=>{learnQuery=e.target.value;renderCompanions()};host.querySelector('.learn-groups').onclick=e=>{const b=e.target.closest('button[data-cg]');if(!b)return;learnGroup=b.dataset.cg;renderCompanions()}}
function learnSources(item,fiqh=false){
  const primary=fiqh?LEARN.meta.fiqhUrl:LEARN.meta.essentialsUrl;
  const extras=(item.sources||[]).filter(x=>!sameSourceFamily(x,{url:primary}));
  const evidence=(item.refs||[]).filter(x=>{const n=searchNorm(x);return !(fiqh&&n.includes('الفقه الميسر'))&&!( !fiqh&&n.includes('ما لا يسع المسلم جهله'))});
  return `${extras.length?`<div class="source-stack module-extra-sources"><div class="source-scope-note">مرجع مختلف خاص بهذا الباب</div>${sourceStack(extras)}</div>`:''}${evidence.length?`<div class="learn-evidence"><b>أدلة أو إحالات خاصة بهذا الباب</b>${evidence.map(x=>`<span>${laterEsc(x)}</span>`).join('')}</div>`:''}`;
}
function learnCards(items,fiqh=false){return items.map((x,i)=>{const src=(x.sources||[])[0]?.label||(fiqh?LEARN.meta.fiqhBook:'');const plus=laterRegister(`learn:${fiqh?'fiqh':'ess'}:${x.id}`,{kind:fiqh?'فقه':'أساسيات',title:x.title,text:x.lead,source:src,tab:'sunnah'});return `<details class="learn-card"><summary><span class="ln">${AR(i+1)}</span><span class="lt">${x.title}</span>${plus}</summary><div class="learn-body"><p class="learn-lead">${x.lead}</p>${x.bullets?.length?`<ul>${x.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`:''}${learnSources(x,fiqh)}</div></details>`}).join('')}
function learnFilters(items){const groups=['all',...new Set(items.map(x=>x.group).filter(Boolean))];return `<div class="learn-tools"><input id="learn-search" class="q-search" type="search" value="${laterEsc(learnQuery)}" placeholder="ابحث داخل هذا القسم…"><div class="learn-groups">${groups.map(x=>`<button data-lg="${laterEsc(x)}" class="${learnGroup===x?'on':''}">${x==='all'?'كل الأبواب':x}</button>`).join('')}</div></div>`}
function filteredLearn(items){const q=searchNorm(learnQuery);return items.filter(x=>(learnGroup==='all'||x.group===learnGroup)&&(!q||searchNorm(deepSearchText(x)).includes(q)))}
async function renderKnowledge(){
  await loadLearn();const modes=['agreed','riyad','nawawi','seerah','companions','essentials','fiqh','busola','muyassar','usultafsir','usulfiqh','fuqaha','history','aqeedah','fiqhlife','tajweed','hadithsciences','akhlaq','adab','digital','qawaid'];modes.forEach(x=>document.getElementById('learn-'+x)?.classList.toggle('hide',x!==learnMode));
  if(learnMode==='home'){openKnowledgeHome();return}
  if(learnMode==='category'){openKnowledgeCategory(learnCategory);return}
  document.getElementById('knowledge-home')?.classList.add('hide');
  const found=Object.entries(KNOWLEDGE_CATS).find(([,c])=>c.items.some(([id])=>id===learnMode));
  if(found){learnCategory=found[0];const c=found[1],head=document.getElementById('learn-category-head');head?.classList.remove('hide');document.getElementById('learn-category-title').textContent=c.items.find(([id])=>id===learnMode)?.[1]||c.title;document.getElementById('learn-category-kicker').textContent=c.title;document.getElementById('learn-category-back').textContent=`→ ${c.title}`;document.getElementById('learn-seg')?.classList.add('hide')}
  if(['muyassar','usultafsir','usulfiqh','fuqaha','history'].includes(learnMode)){renderSimpleKnowledge(learnMode);return}
  if(['aqeedah','fiqhlife','tajweed','hadithsciences','akhlaq','adab','digital','qawaid'].includes(learnMode)){renderStructuredKnowledge(learnMode);return}
  if(learnMode==='agreed'){renderAgreed();return}if(learnMode==='riyad'){renderSunnah();return}if(learnMode==='nawawi'){renderNawawi();return}if(learnMode==='seerah'){renderSeerah();return}if(learnMode==='companions'){renderCompanions();return}if(learnMode==='busola'){renderBusola();return}
  const items=learnMode==='essentials'?LEARN.essentials:LEARN.fiqh,fiqh=learnMode==='fiqh',F=filteredLearn(items);const intro=fiqh?`<section class="learn-source-first"><small>المصدر والمنهج قبل المحتوى</small><h3>الفقه الميسر — ابدأ من هنا</h3><p>${laterEsc(LEARN.meta.fiqhBook)}</p><div class="source-stack">${sourceStack([{label:LEARN.meta.fiqhBook,url:LEARN.meta.fiqhUrl}])}</div><div class="learn-method-panel">هذا هو المدخل الأساسي للعامة. بعده استخدم «فقه حياتي» للوصول السريع للمسألة بحسب حالك.</div></section>`:`<section class="learn-source-first"><small>المصدر والمنهج قبل المحتوى</small><h3>ما لا يسع المسلم جهله</h3><p>${laterEsc(LEARN.meta.essentialsBook)}</p><div class="source-stack">${sourceStack([{label:LEARN.meta.essentialsBook,url:LEARN.meta.essentialsUrl}])}</div>${LEARN.meta.essentialsNote?`<div class="learn-method-panel">${laterEsc(LEARN.meta.essentialsNote)}</div>`:''}</section>`;const host=document.getElementById('learn-'+learnMode);host.innerHTML=`${intro}${learnFilters(items)}<div class="search-count">${AR(F.length)} من ${AR(items.length)} بابًا</div>${learnCards(F,fiqh)}<div class="learn-disclaimer">${LEARN.meta.note}</div>`;host.querySelector('#learn-search').oninput=e=>{learnQuery=e.target.value;renderKnowledge()};host.querySelector('.learn-groups').onclick=e=>{const b=e.target.closest('button[data-lg]');if(!b)return;learnGroup=b.dataset.lg;renderKnowledge()};
}
document.getElementById('learn-seg').onclick=e=>{const b=e.target.closest('button[data-learn]');if(!b)return;closeHadithDetail();learnMode=b.dataset.learn;learnQuery='';learnGroup='all';nawawiQuery='';renderKnowledge();scrollTo({top:0,behavior:'smooth'})};
document.getElementById('knowledge-home')?.addEventListener('click',e=>{const c=e.target.closest('[data-kcat]');if(c){openKnowledgeCategory(c.dataset.kcat);return}const b=e.target.closest('[data-learn]');if(b){learnMode=b.dataset.learn;learnCategory='basics';document.getElementById('knowledge-home')?.classList.add('hide');document.getElementById('learn-category-head')?.classList.remove('hide');document.getElementById('learn-category-title').textContent='ما لا يسع المسلم جهله';document.getElementById('learn-category-kicker').textContent='ابدأ من هنا';document.getElementById('learn-category-back').textContent='→ خريطة العلم';document.getElementById('learn-seg')?.classList.add('hide');renderKnowledge()}});
document.getElementById('learn-category-back')?.addEventListener('click',()=>{if(learnMode==='category'||learnCategory==='basics'||!learnCategory)openKnowledgeHome();else openKnowledgeCategory(learnCategory)});

/* ================= القلب (مدمج) ================= */
let HD=null, BENEFIT=null, MANAZIL=null, hKind='problems', hCur=null, hTrack={}, hJournal={}, hQuery='', hPaths=[], hPathCur=null, nafsCur=null, mujWeights={}, benefitChoice={};
const hToday=()=>iso(new Date());
const hDone=(k,i,d)=>!!(hTrack[d]&&hTrack[d][k+':'+i]);
function hStreak(k,i){ let s=0;
  for(let j=0;;j++){ const d=new Date(); d.setDate(d.getDate()-j);
    if(hDone(k,i,iso(d))) s++; else break } return s }
const hSteps=p=>p.cure||p.means||[];
const hList=p=>p.causes||p.fruits||[];

/* ===== مستويات العمق (تزكية) — تدرّج في الدراسة لا حكم على مقام الشخص ===== */
let hLevels={};
async function hLevelsLoad(){
  try{
    hLevels=await store.get('qalb-levels-v1')||{};
    /* R33 compatibility: users who had completed the old 4/4 curriculum keep every completion; only move the resume pointer to the newly added fifth stage. */
    let changed=false;
    const topics=[...(HD?.works||[]),...(HD?.problems||[])];
    for(const cat of (HD?.obstacles||[]))topics.push(...(cat.items||[]));
    for(const p of topics){
      const id=hDepthKey(p), L=hLevelsOf(p), st=hLevels[id];
      if(!id||L.length!==5||!st||!Array.isArray(st.done))continue;
      const first4=L.slice(0,4).every(l=>st.done.includes(l.n)), fifth=L[4];
      if(first4&&!st.done.includes(fifth.n)&&(+st.open||0)<=L[3].n){st.open=fifth.n;st.lastAt=Date.now();changed=true}
    }
    if(changed)await store.set('qalb-levels-v1',hLevels);
  }catch{hLevels={}}
}
const hLevelsOf=p=>(p?.levels||[]).filter(l=>!l.pending);
const hDepthKey=p=>p?.depthId||p?.id||'';
const hDepthTitle=p=>p?.name||p?.q||p?.title||p?.sub||'الموضوع';
const hLevelState=id=>{const x=hLevels[id]||{};return {...x,done:Array.isArray(x.done)?x.done:[],reviews:Array.isArray(x.reviews)?x.reviews:[]}};
const hLevelDone=(id,n)=>hLevelState(id).done.includes(n);
function hDepthFind(id){
  if(!id)return null;
  const pools=[...(HD?.problems||[]),...(HD?.works||[]),...(HD?.nafs||[])];
  for(const p of pools)if(hDepthKey(p)===id||p.id===id)return p;
  for(const cat of (HD?.obstacles||[]))for(const it of (cat.items||[]))if(hDepthKey(it)===id)return it;
  if(typeof ISH!=='undefined'&&ISH)for(const it of (ISH.items||[]))if(hDepthKey(it)===id)return it;
  return null;
}
function hDepthMeta(p){
  const id=hDepthKey(p), L=hLevelsOf(p), st=hLevelState(id), done=L.filter(l=>st.done.includes(l.n)).length;
  const firstOpen=L.find(l=>!st.done.includes(l.n))||L[L.length-1]||null;
  return {id,L,st,done,total:L.length,next:firstOpen,reviews:st.reviews.length,lastAt:+st.lastAt||0};
}
async function hLevelOpen(id,n){
  const st=hLevelState(id); st.open=+n; st.lastAt=Date.now(); hLevels[id]=st;
  try{await store.set('qalb-levels-v1',hLevels)}catch{}
}
async function hLevelMark(id,n){
  const p=hDepthFind(id), L=hLevelsOf(p||{}), st=hLevelState(id);
  if(!st.done.includes(n))st.done.push(n);
  st.completedAt={...(st.completedAt||{}),[n]:Date.now()}; st.lastAt=Date.now();
  const i=L.findIndex(x=>x.n===+n); if(L[i+1])st.open=L[i+1].n; else st.open=+n;
  hLevels[id]=st; try{await store.set('qalb-levels-v1',hLevels)}catch{}
  return L[i+1]||null;
}
async function hLevelReview(id){
  const st=hLevelState(id); st.reviews.push(Date.now()); st.lastAt=Date.now(); hLevels[id]=st;
  try{await store.set('qalb-levels-v1',hLevels)}catch{}
}
function hDepthOpenCard(id){
  requestAnimationFrame(()=>{
    const card=[...document.querySelectorAll('[data-depth-card]')].find(x=>x.dataset.depthCard===id);
    if(!card)return;
    const body=card.querySelector('.h-obb'); if(body)body.classList.remove('hide');
    const x=card.querySelector('.h-obh .x'); if(x)x.textContent='⌃';
    card.scrollIntoView?.({block:'start',behavior:'smooth'});
  });
}
async function hDepthRender(id){
  const p=hDepthFind(id); if(!p)return;
  if(p.depthType==='nafs'){hNafsDetail(p.id);return}
  if(p.depthType==='obstacle'){hOpen(p.depthParent);hDepthOpenCard(id);return}
  if(p.depthType==='ish'){await hIshkaliat();hDepthOpenCard(id);return}
  hOpen(p.id);
}
function hDepthParseToken(raw=''){
  const cut=raw.lastIndexOf(':');
  if(cut<0)return [raw,0];
  return [raw.slice(0,cut),+(raw.slice(cut+1)||0)];
}
function hLevelsHtml(p,showSources=true){
  const M=hDepthMeta(p), L=M.L, id=M.id; if(L.length<2)return '';
  const done=M.st.done;
  let openN=+M.st.open||M.next?.n||L[0].n;
  let cur=L.find(l=>l.n===openN)||L[0];
  const curI=L.findIndex(x=>x.n===cur.n), unlocked=curI===0||done.includes(L[curI-1]?.n);
  if(!unlocked){cur=L.find((l,i)=>i===0||done.includes(L[i-1]?.n))||L[0];openN=cur.n}
  const chips=L.map((l,i)=>{
    const canOpen=i===0||done.includes(L[i-1]?.n);
    return `<button class="lv-chip${l.n===cur.n?' on':''}${canOpen?'':' lock'}" data-lv="${laterEsc(id)}:${l.n}"${canOpen?'':' disabled'}><span>${done.includes(l.n)?'✓':AR(i+1)}</span>${l.title}</button>`;
  }).join('');
  const items=(cur.items||[]).map(x=>{const head=(x.h&&!String(x.t||'').trim().startsWith(String(x.h).trim()))?`<div class="lv-item-head">${laterEsc(x.h)}</div>`:'';return `<li>${head}<div class="lv-item-tx">${laterEsc(x.t||'')}</div>${showSources&&x.s?hSourceHtml(x.s):''}</li>`}).join('');
  const refs=(p.studyRefs||[]).filter(Boolean);
  const refsHtml=showSources&&refs.length?`<details class="lv-refs" open><summary>مراجع هذا الباب <span>${AR(refs.length)}</span></summary><div class="lv-ref-grid">${refs.map(hSourceHtml).join('')}</div><small>النص داخل تدارُك صياغة تعليمية مختصرة مبنية على هذه المراجع وعلى المصادر الظاهرة تحت كل نقطة؛ وليس نقلًا حرفيًا عن كتاب بعينه إلا إذا نُص على ذلك.</small></details>`:'';
  const methodNote=p.depthNote?`<div class="lv-method-note">${laterEsc(p.depthNote)}</div>`:'';
  const nxt=L[curI+1];
  const finished=M.done===M.total;
  const subject=p.depthType==='nafs'?'هذا الموضوع':p.depthType==='obstacle'?'هذه المسألة':p.depthType==='ish'?'هذه المحاضرة':'هذا المعنى';
  return `<div class="h-sec lv-wrap">
    <div class="lv-head"><div><b>مراحل التعمّق</b><small>تقدّم في الدراسة والفهم، لا رتبة إيمانية</small></div><span class="lv-cnt">${AR(M.done)}/${AR(M.total)}</span></div>
    <div class="lv-progress" aria-label="تقدم دراسة الموضوع"><i style="width:${M.total?Math.round(M.done/M.total*100):0}%"></i></div>
    ${methodNote}${refsHtml}
    <div class="lv-chips">${chips}</div>
    <div class="lv-stage"><div class="lv-stage-no">المستوى ${AR(curI+1)} من ${AR(L.length)}</div><h3>${cur.title}</h3></div>
    <div class="h-bd lv-body">${cur.tx?`<p>${cur.tx}</p>`:''}${showSources&&cur.s?hSourceHtml(cur.s):''}${items?`<ul class="lv-list">${items}</ul>`:''}</div>
    ${done.includes(cur.n)?`<div class="lv-ok">✓ أنهيت دراسة هذا المستوى — يمكنك الرجوع إليه متى شئت.</div>`:`<button class="lv-next" data-lvdone="${laterEsc(id)}:${cur.n}">فهمت هذا المستوى${nxt?` — انتقل إلى «${nxt.title}»`:' — أتم المسار'}</button>`}
    ${finished?`<div class="lv-review"><div><b>أتممت مسار دراسة ${subject}</b><span>المراجعة للتثبيت فقط، وليست درجة في الإيمان أو التزكية.</span></div><button data-lvreview="${laterEsc(id)}">راجعت ${subject} مرة أخرى${M.reviews?` · ${AR(M.reviews)}`:''}</button></div>`:''}
  </div>`;
}
function hDepthTileHtml(p){
  const dm=hDepthMeta(p); if(!dm.total)return '';
  return `<div class="depth-tile"><span>عمق الدراسة</span><b>${AR(dm.done)}/${AR(dm.total)}</b><i><em style="width:${Math.round(dm.done/dm.total*100)}%"></em></i>${dm.reviews?`<small>مراجعات ${AR(dm.reviews)}</small>`:''}</div>`;
}
function hDepthContinueHtml(items,section='works'){
  const metas=(items||[]).map(p=>({p,m:hDepthMeta(p)})).filter(x=>x.m.total);
  const started=metas.filter(x=>x.m.done>0&&x.m.done<x.m.total).sort((a,b)=>b.m.lastAt-a.m.lastAt)[0];
  const untouched=metas.find(x=>x.m.done===0);
  const complete=metas.filter(x=>x.m.done===x.m.total).sort((a,b)=>a.m.lastAt-b.m.lastAt)[0];
  const pick=started||untouched||complete;if(!pick)return '';
  const {p,m}=pick, finished=m.done===m.total, next=finished?'مراجعة':(m.next?.title||'المستوى التالي');
  const label=section==='works'?'رحلة أعمال القلوب':section==='problems'?'فهم وعلاج أمراض القلوب':section==='nafs'?'رحلة فقه النفس':section==='obstacles'?'فهم العقبات':section==='ish'?'التعمّق في إشكاليات':'رحلة التزكية';
  const map=m.L.map(x=>x.title).join(' ← ');
  const noun=section==='works'?'معنى':section==='problems'?'باب':section==='nafs'?'موضوع':section==='obstacles'?'مسألة':section==='ish'?'محاضرة':'موضوع';
  return `<section class="depth-home"><div class="depth-home-copy"><small>${label}</small><b>${started?'أكمل من حيث توقفت':finished?'راجع ما سبق أن أتممته':`ابدأ ${noun}ًا جديدًا`}: ${hDepthTitle(p)}</b><span>${finished?`أتممت ${AR(m.total)} مستويات · مراجعاتك ${AR(m.reviews)}`:`أنهيت ${AR(m.done)} من ${AR(m.total)} · التالي: ${next}`}</span></div><button data-depth-open="${laterEsc(m.id)}">${finished?'راجع الآن':'أكمل الآن'} ←</button></section>
  <div class="depth-map"><div><b>${AR(m.total)} مراحل لهذا النوع من المحتوى</b><span>${map}</span></div><small>العودة مبنية على فهم أعمق ومراجعة نافعة، لا على نقاط أو «رتب» دينية.</small></div>`;
}


async function loadH(){ if(HD)return HD;
  try{ HD=await (await fetch('./qalb.json')).json() }catch{ HD={problems:[],works:[],obstacles:[]} }
  await hLevelsLoad();
  hTrack=(await store.get('qalb-track'))||{}; hJournal=(await store.get('qalb-journal'))||{};
  hPaths=(await store.get('qalb-paths-v1'))||[]; mujWeights=(await store.get('mujahada-weight-v1'))||{}; benefitChoice=(await store.get('benefit-choice-v1'))||{}; return HD }
async function loadManazil(){if(MANAZIL)return MANAZIL;try{MANAZIL=await (await fetch('./manazil-sairin.json')).json()}catch{MANAZIL={meta:{},items:[]}}return MANAZIL}
function hPct(p){
  if(p.items){ let t=0,n=0;
    p.items.forEach(it=>it.steps.forEach((st,i)=>{ if(st.track){t++; if(hDone(p.id+'/'+it.id,i,hToday()))n++ }}));
    return t?Math.round(n/t*100):0 }
  const c=hSteps(p), tr=c.filter(x=>x.track); if(!tr.length)return 0;
  let n=0; c.forEach((x,i)=>{ if(x.track&&hDone(p.id,i,hToday()))n++ });
  return Math.round(n/tr.length*100) }
const hFind=id=>(HD.problems||[]).concat(HD.works||[],HD.obstacles||[]).find(x=>x.id===id);
const hPathActive=()=>hPaths.filter(x=>x.status!=='archived');
const hPathTab=(active=false)=>`<button data-k="path"${active?' aria-current="true"':''}>مساري${hPathActive().length?` · ${AR(hPathActive().length)}`:''}</button>`;
const hBenefitTab=(active=false)=>`<button data-k="benefit"${active?' aria-current="true"':''}>العمل والنفع</button>`;
function hPathKey(type,parentId,itemId=''){return [type,parentId,itemId].filter(Boolean).join(':')}
function hPathFind(key){return hPaths.find(x=>x.key===key)}
function hPathResolve(path){
  if(!path)return null;
  if(path.type==='problem'){
    const p=(HD.problems||[]).find(x=>x.id===path.parentId); if(!p)return null;
    return {type:'problem',kind:'مرض من أمراض القلوب',title:p.name,sub:p.sub||'',summary:p.def||'',summarySource:p.defSource,steps:hSteps(p),proof:p.proof,proofSource:p.proofSource,medical:false};
  }
  if(path.type==='obstacle'){
    const cat=(HD.obstacles||[]).find(x=>x.id===path.parentId), it=cat?.items?.find(x=>x.id===path.itemId); if(!cat||!it)return null;
    const q=isFemale()?(it.qFemale||it.q):(it.qMale||it.q);
    return {type:'obstacle',kind:'عقبة حياتية',title:q,sub:cat.name,summary:it.answer||'',summarySource:it.answerSource,steps:it.steps||[],medical:(cat.id==='wellbeing'||/قلق|حزن|اكتئاب|نفس/.test(q)),flags:it.flags||[]};
  }
  if(path.type==='nafs'){
    const it=(HD.nafs||[]).find(x=>x.id===path.parentId); if(!it)return null;
    return {type:'nafs',kind:'فقه النفس',title:it.q,sub:(HD.nafsGroups||[]).find(g=>g.id===it.group)?.name||'',summary:it.summary||'',summarySource:it.summarySource,steps:it.steps||[],proof:it.iman,proofSource:it.imanSource,medical:true,flags:it.flags||[]};
  }
  return null;
}
function hPathButton(type,parentId,itemId=''){
  const key=hPathKey(type,parentId,itemId),found=hPathFind(key),on=!!found&&found.status!=='archived';
  return `<button class="path-start ${on?'on':''}" data-path-start="${laterEsc(key)}">${on?'✓ موجود في مساري':'ابدأ مسارًا لهذه المشكلة'}</button>`;
}
function hPathQuickButton(type,parentId,itemId=''){
  const key=hPathKey(type,parentId,itemId),found=hPathFind(key),on=!!found&&found.status!=='archived';
  return `<button type="button" class="path-quick ${on?'on':''}" data-path-quick="${laterEsc(key)}" aria-label="${on?'موجود في مساري':'أضف المشكلة إلى مساري'}" aria-pressed="${on?'true':'false'}">${on?'✓ في مساري':'＋ أضف لمساري'}</button>`;
}
function syncPathQuickButtons(key){
  const found=hPathFind(key),on=!!found&&found.status!=='archived';
  document.querySelectorAll('[data-path-quick]').forEach(b=>{
    if(b.dataset.pathQuick!==key)return;
    b.classList.toggle('on',on); b.textContent=on?'✓ في مساري':'＋ أضف لمساري';
    b.setAttribute('aria-label',on?'موجود في مساري':'أضف المشكلة إلى مساري'); b.setAttribute('aria-pressed',on?'true':'false');
  });
}
async function hPathQuickAdd(btn,key){
  const found=hPathFind(key);
  if(found&&found.status!=='archived'){syncPathQuickButtons(key);toast('✓ هذه المشكلة موجودة بالفعل في مسارك');return}
  if(found&&found.status==='archived'){found.status='active';found.start=Date.now();await store.set('qalb-paths-v1',hPaths);syncPathQuickButtons(key);toast('أعدنا المشكلة إلى «مساري» ✓');return}
  const [type,parentId,itemId='']=key.split(':');
  hPaths.unshift({key,type,parentId,itemId,start:Date.now(),status:'active',done:{},checkins:[]});
  await store.set('qalb-paths-v1',hPaths);syncPathQuickButtons(key);
  toast('تمت إضافتها إلى «مساري» ✓');
}
async function hPathStart(key){
  const found=hPathFind(key);
  if(found&&found.status!=='archived'){toast('هذه المشكلة موجودة في مسارك');hPathCur=key;hPathsRender();return}
  if(found&&found.status==='archived'){found.status='active';found.start=Date.now();await store.set('qalb-paths-v1',hPaths);toast('أعدنا المشكلة إلى مسارك');hPathCur=key;hPathsRender();return}
  const [type,parentId,itemId='']=key.split(':');
  hPaths.unshift({key,type,parentId,itemId,start:Date.now(),status:'active',done:{},checkins:[]});
  await store.set('qalb-paths-v1',hPaths); toast('أضفتها إلى مسارك'); hPathCur=key; hPathsRender();
}
function hPathStops(def){
  if(!def)return [];
  const stops=[{id:'understand',t:'افهم المشكلة أولًا',d:def.summary,s:def.summarySource}];
  (def.steps||[]).slice(0,4).forEach((st,i)=>stops.push({id:'step'+i,t:st.t||`خطوة ${i+1}`,d:st.d||'',s:st.s||st.source}));
  if(def.proof)stops.push({id:'anchor',t:def.type==='nafs'?'البوصلة الإيمانية':'ارجع إلى الأصل',d:def.proof,s:def.proofSource});
  return stops;
}
function hPathProgress(path,def){const stops=hPathStops(def);if(!stops.length)return 0;const n=stops.filter(x=>path.done?.[x.id]).length;return Math.round(n/stops.length*100)}
async function hPathsRender(){
  await loadH(); hPathCur=null;
  const active=hPathActive(),host=document.getElementById('v-qalb');
  host.innerHTML=`<div class="h-tabs">${hPathTab(true)}<button data-k="problems">أمراض القلوب</button><button data-k="works">أعمال القلوب</button><button data-k="obstacles">العقبات</button><button data-k="deeds">بنك الأعمال</button><button data-k="nafs">فقه النفس</button>${hBenefitTab(false)}${issueTabButton(false)}</div>
    <div class="path-hero"><div class="kicker">مساري الشخصي</div><h2>مشكلتك لها باب ومسار</h2><p>اختر المشكلة التي تشغلك الآن من العقبات أو أمراض القلوب أو فقه النفس. تدارُك يجمع لك أصل الفكرة والخطوات الموجودة في المحتوى نفسه، ويحفظ تقدمك محليًا على جهازك. يمكنك فتح أكثر من مسار.</p></div>
    ${active.length?`<div class="path-list">${active.map(p=>{const d=hPathResolve(p);if(!d)return'';const pct=hPathProgress(p,d);return `<div class="path-card"><div class="top"><div><div class="kind">${d.kind}${d.sub?' · '+d.sub:''}</div><h3>${d.title}</h3><div class="sub">بدأ ${new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'short'}).format(new Date(p.start))}</div></div><button class="path-open" data-path-open="${laterEsc(p.key)}">افتح المسار</button></div><div class="path-progress"><i style="width:${pct}%"></i></div><div class="path-meta"><span>${AR(pct)}% من المحطات</span><span>${(p.checkins||[]).length?`آخر مراجعة: ${(p.checkins||[]).slice(-1)[0].state}`:'لم تسجل مراجعة بعد'}</span></div></div>`}).join('')}</div>`:`<div class="path-empty"><b>ما الذي يشغلك هذه الأيام؟</b><p>ابدأ من إحساسك أو موقفك الحالي. سنوصلك للباب الأقرب، وأنت تختار المشكلة التي تشبه واقعك ثم تضيفها لمسارك.</p><div class="path-suggestions"><button data-path-preset="worry">هم أو قلق</button><button data-path-preset="futuur">فتور</button><button data-path-preset="sin">ذنب يتكرر</button><button data-path-preset="family">مشكلة أسرية</button><button data-path-preset="relation">علاقة أو ارتباط</button><button data-path-preset="heart">مرض قلب</button></div><div class="path-picks"><button data-path-go="obstacles">كل العقبات</button><button data-path-go="problems">أمراض القلوب</button><button data-path-go="nafs">فقه النفس</button></div></div>`}`;
  host.onclick=hClick;
}
function hPathDetail(key){
  const path=hPathFind(key),def=hPathResolve(path);if(!path||!def){hPathsRender();return}hPathCur=key;
  const stops=hPathStops(def),pct=hPathProgress(path,def),last=(path.checkins||[]).slice(-1)[0];
  const danger=def.medical?`<div class="path-danger">إن كانت الأعراض شديدة أو مستمرة أو تعطل حياتك، أو لديك تشخيص قائم، فهذا المسار مساند فقط ولا يستبدل الطبيب أو المختص أو العلاج الموصوف.</div>`:'';
  document.getElementById('v-qalb').innerHTML=`<button class="back" id="path-back">مساري</button><div class="path-detail-head"><div class="kind">${def.kind}${def.sub?' · '+def.sub:''}</div><h2>${def.title}</h2><p>هذا مسار تنظيم ومتابعة مبني على المحتوى الموثق الموجود أصلًا في تدارُك، وليس تشخيصًا أو فتوى شخصية.</p><div class="path-progress"><i style="width:${pct}%"></i></div><div class="path-meta"><span>${AR(pct)}%</span><span>${AR(stops.filter(x=>path.done?.[x.id]).length)} من ${AR(stops.length)} محطات</span></div></div>
    ${hSourcePanel(stops.map(x=>x.s),'مصادر هذا المسار')}
    <div class="h-sec" style="margin-top:12px">${stops.map(st=>`<div class="path-stop"><button data-path-stop="${st.id}" class="${path.done?.[st.id]?'on':''}">✓</button><div><div class="pt">${st.t}</div><div class="pd">${st.d||''}</div></div></div>`).join('')}<div class="path-review"><b>كيف تبدو المشكلة بعد التجربة؟</b><div class="choices"><button data-path-state="أخف" class="${last?.state==='أخف'?'on':''}">أخف</button><button data-path-state="كما هي" class="${last?.state==='كما هي'?'on':''}">كما هي</button><button data-path-state="أشد" class="${last?.state==='أشد'?'on':''}">أشد</button></div>${danger}</div></div>
    <div class="path-actions"><button data-path-archive="${laterEsc(key)}">إنهاء وإخفاء المسار</button><button class="danger" data-path-reset="${laterEsc(key)}">تصفير التقدم</button></div>`;
  document.getElementById('v-qalb').onclick=hClick;scrollTo({top:0,behavior:'smooth'});
}

async function hHome(){
  await loadH(); hCur=null; const host=document.getElementById('v-qalb'); if(!host)return;
  host.innerHTML=`<section class="knowledge-home tazkiyah-home"><div class="knowledge-hero"><small>خريطة التزكية</small><h2>اختر الباب الأقرب لما تريد إصلاحه</h2><p>بداية واضحة ثم دخول إلى الباب، مع بقاء المسارات والتقدم الحالي كما هي دون أي حكم على رتبة الإيمان.</p></div><button class="knowledge-essential" data-taz-go="path"><span>أكمل من هنا</span><b>مساري</b><small>ارجع إلى المسارات التي بدأت بها أو ابدأ مسار متابعة من المحتوى الموجود.</small></button><div class="knowledge-categories"><button data-taz-go="manazil"><b>منازل السائرين</b><span>يقظة · فكرة · بصيرة · عزم · محاسبة · توبة · توكل · صبر، بقراءة تربوية من مدارج السالكين.</span></button><button data-taz-go="works"><b>أعمال القلوب</b><span>محبة · إخلاص · توكل · صبر، مع الدراسة المتدرجة والتطبيق.</span></button><button data-taz-go="problems"><b>أمراض القلوب</b><span>فهم المرض القلبي وأسبابه وخطوات مجاهدته بالمصادر الموجودة.</span></button><button data-taz-go="obstacles"><b>العقبات اليومية</b><span>أسرة · دراسة · عمل · علاقات · هاتف · فتور، بخطوات عملية.</span></button><button data-taz-go="nafs"><b>فقه النفس</b><span>فهم النفس والتزكية مع الفصل الواضح بين التثقيف والتشخيص الطبي.</span></button></div></section>`;
  host.onclick=e=>{const b=e.target.closest('[data-taz-go]');if(!b)return;const k=b.dataset.tazGo;if(k==='path'){hPathsRender();return}if(k==='manazil'){hManazil();return}if(k==='benefit'){hBenefit();return}if(k==='obstacles'){hKind='obstacles';hQuery='';hObstacles();return}if(k==='nafs'){nafsQuery='';hNafs();return}hKind=k;hQuery='';hRender()};
}

async function hManazil(){
  await loadManazil();const host=document.getElementById('v-qalb');if(!host)return;const m=MANAZIL.meta||{},items=MANAZIL.items||[];
  host.innerHTML=`<button class="back" id="manazil-back">→ خريطة التزكية</button><div class="manazil-hero"><small>قراءة تربوية موثقة</small><h2>${laterEsc(m.title||'منازل السائرين')}</h2><p>${laterEsc(m.subtitle||'')}</p><div class="manazil-note">${laterEsc(m.note||'')}</div><div class="section-source-panel compact"><div class="section-source-kicker">المصدر المعتمد لهذا الباب</div><a href="${laterEsc(m.url||'')}" target="_blank" rel="noopener">${laterEsc(m.book||'فتح المرجع')} ↗</a><p>روابط المواضع التفصيلية لن تتكرر أسفل كل بطاقة ما دام الباب كله مبنيًا على المرجع نفسه.</p></div></div><div class="manazil-grid">${items.map((x,i)=>`${laterRegister(`manazil:${x.id}`,{kind:'تزكية',title:x.title,text:x.lead,source:m.book||'مدارج السالكين',tab:'qalb'})}<article class="manzil-card"><div class="manzil-num">${AR(i+1)}</div><h3>${laterEsc(x.title)}</h3><p class="manzil-lead">${laterEsc(x.lead||'')}</p>${x.points?.length?`<ul>${x.points.map(p=>`<li>${laterEsc(p)}</li>`).join('')}</ul>`:''}</article>`).join('')}</div>`;
  document.getElementById('manazil-back')?.addEventListener('click',hHome);scrollTo({top:0,behavior:'smooth'});
}
async function hRender(){
  await loadH(); hCur=null;
  document.getElementById('v-qalb').innerHTML=
   `<div class="h-tabs">${hPathTab(false)}
      <button data-k="problems" aria-current="${hKind==='problems'}">أمراض القلوب</button>
      <button data-k="works" aria-current="${hKind==='works'}">أعمال القلوب</button>
      <button data-k="obstacles">العقبات</button>
      <button data-k="deeds">بنك الأعمال</button>
      <button data-k="nafs">فقه النفس</button>${hBenefitTab(false)}${issueTabButton(false)}
    </div>
    <p class="h-src"><b>قاعدة تدارُك:</b> المصادر المعتمدة تظهر مرة واحدة في بداية كل باب؛ ولا نكرر المرجع نفسه تحت كل نقطة. وفقه النفس مستفاد من منهج مكاني مع فصل واضح بين التثقيف وبين التشخيص والعلاج الطبي.</p>
    <input id="heart-search" class="q-search" type="search" value="${hQuery.replace(/"/g,'&quot;')}" placeholder="ابحث في هذا القسم: رياء، توكل، صبر، شهوة…" aria-label="بحث في التزكية">
    <div class="search-count" id="heart-result-count"></div><div id="heart-list"></div>`;
  document.getElementById('v-qalb').onclick=hClick;
  document.getElementById('heart-search').oninput=e=>{hQuery=e.target.value;hRenderList()};
  hRenderList();
}
function hRenderList(){
  const items=(HD[hKind]||[]).filter(audienceOk), q=searchNorm(hQuery), F=items.filter(p=>!q||searchNorm(deepSearchText(p)).includes(q));
  const cnt=document.getElementById('heart-result-count'), host=document.getElementById('heart-list'); if(!cnt||!host)return;
  cnt.textContent=`${AR(F.length)} من ${AR(items.length)} بابًا`;
  const lead=!q&&['works','problems'].includes(hKind)?hDepthContinueHtml(items,hKind):'';
  host.innerHTML=F.length?lead+`<div class="h-grid">${F.map(p=>{
    const pct=hPct(p),j=(hJournal[p.id]||[]).length,pathBtn=hKind==='problems'?hPathQuickButton('problem',p.id):'';
    const depth=hDepthTileHtml(p);
    return `<div class="h-tile" data-id="${p.id}">${laterRegister(`heart:${hKind}:${p.id}`,{kind:'تزكية',title:p.name,text:p.sub||'',source:p.defSource?.t||'',tab:'qalb'})}<div class="nm">${p.name}</div><div class="ds">${p.sub||''}</div>${depth}${pathBtn?`<div class="path-quick-wrap">${pathBtn}</div>`:''}<div class="pr"><i style="width:${pct}%"></i></div><div class="st">${pct?'اليوم '+pct+'%':'ابدأ اليوم'}${j?' · ✎ '+AR(j):''}</div></div>`
  }).join('')}</div>`:'<div class="nafs-empty">لا توجد نتائج مطابقة في هذا القسم.</div>';
}

function hSourceHtml(s){
  if(!s)return '';
  const mark='<span class="src-mark">↗</span>';
  if(typeof s==='string')return `<div class="h-src-line source-ref">${mark}<span class="src-copy"><span class="src-label">المصدر</span><span class="src-text">${s}</span></span></div>`;
  const t=s.t||s.label||'مرجع';
  return `<div class="h-src-line source-ref">${mark}<span class="src-copy"><span class="src-label">المصدر</span>${s.u?`<a href="${s.u}" target="_blank" rel="noopener">${t}</a>`:`<span class="src-text">${t}</span>`}</span></div>`;
}
function hCollectSources(root){
  const out=[],seen=new Set();
  const add=v=>{if(!v)return;if(Array.isArray(v)){v.forEach(add);return}if(typeof v==='string')return;if(typeof v!=='object')return;const u=v.u||v.url,t=v.t||v.label;if((u||t)&&t){const k=(u||'')+'|'+t;if(!seen.has(k)){seen.add(k);out.push({label:t,url:u||''})}return}for(const [k,x] of Object.entries(v)){if(/(^s$|source|sources|studyRefs|refs|levels|steps|cure|means|causes|fruits|why|items|proof|note)/i.test(k))add(x)}};
  add(root);return uniqueSources(out);
}
function hSourcePanel(root,title='المصادر المعتمدة لهذا الباب'){
  const rows=hCollectSources(root);if(!rows.length)return '';const shown=rows.slice(0,2),rest=rows.slice(2);
  return `<section class="section-source-panel"><div class="section-source-kicker">${laterEsc(title)}</div><p>جُمعت المراجع هنا مرة واحدة حتى يبقى الشرح مريحًا للقراءة. لا يُكرر المصدر نفسه أسفل كل نقطة.</p><div class="source-stack">${sourceStack(shown)}</div>${rest.length?`<details><summary>باقي المراجع · ${AR(rest.length)}</summary><div class="source-stack">${sourceStack(rest)}</div></details>`:''}</section>`;
}
function hListHtml(items,showSources=true){
  return (items||[]).map(x=>{
    if(typeof x==='string') return `<li>${x}</li>`;
    return `<li>${x.t||''}${showSources?hSourceHtml(x.s||x.source):''}</li>`;
  }).join('');
}
function hStepsHtml(key,steps,showSources=true){
  return steps.map((st,i)=>{
    const on=hDone(key,i,hToday()), sk=st.track?hStreak(key,i):0;
    let wk='';
    if(st.track){ wk='<div class="h-wk">';
      for(let j=6;j>=0;j--){const d=new Date();d.setDate(d.getDate()-j);
        wk+=`<i class="${hDone(key,i,iso(d))?'on':''}"></i>`}
      wk+='</div>' }
    return `<div class="h-cure">
      <button class="h-chk ${on?'on':''} ${st.track?'':'no'}" ${st.track?`data-k="${key}" data-i="${i}"`:''}>✓</button>
      <div><div class="t">${st.t}</div><div class="d">${st.d}</div>${showSources?hSourceHtml(st.s||st.source):''}
      ${sk>1?`<div class="stk">${AR(sk)} أيام متتابعة</div>`:''}${wk}</div></div>`}).join('');
}
function hMujahadaHtml(it){
  if(!it?.weight&&!it?.medicalBoundary)return '';
  const chosen=+(mujWeights[it.id]?.value||0),opt=(it.weight?.options||[]).find(x=>+x.v===chosen);
  return `${it.weight?`<div class="muj-weight"><b>${laterEsc(it.weight.q||'ما حجم أثر هذه العقبة؟')}</b><p>${laterEsc(it.weight.note||'')}</p><div class="muj-options">${(it.weight.options||[]).map(o=>`<button data-muj-weight="${laterEsc(it.id)}:${o.v}" class="${chosen===+o.v?'on':''}">${laterEsc(o.t)}</button>`).join('')}</div>${opt?`<div class="muj-say">${laterEsc(opt.sayTo||'')}</div>`:''}</div>`:''}${it.medicalBoundary?`<div class="muj-boundary"><b>حدّ مهم:</b> ${laterEsc(it.medicalBoundary)}</div>`:''}`;
}
function hOpen(id){
  const p=hFind(id); if(!p)return; hCur=id;
  const isOb=!!p.items;
  const isWork=(HD.works||[]).some(w=>w.id===p.id), isProblem=(HD.problems||[]).some(x=>x.id===p.id), hasDepth=!isOb&&hLevelsOf(p).length>=2;
  const links=[];
  if(p.link) links.push(`<a href="${p.link}" target="_blank" rel="noopener">اقرأ المزيد ↗</a>`);
  if(p.video) links.push(`<a href="${p.video}" target="_blank" rel="noopener">شاهد الشرح ▶</a>`);
  (p.sources||[]).forEach(x=>{ if(x&&x.u) links.push(`<a href="${x.u}" target="_blank" rel="noopener">${x.t||'المصدر'} ↗</a>`) });

  let body;
  if(isOb){
    body=p.items.filter(audienceOk).map((it,k)=>{
      const key=p.id+'/'+it.id;
      const src=(it.sources||[]).filter(x=>x&&x.u).map(x=>
        `<a href="${x.u}" target="_blank" rel="noopener" class="h-lnk">${x.t||'المصدر'} ↗</a>`).join('');
      const qq=isFemale()?(it.qFemale||it.q):(it.qMale||it.q);
      const depthId=hDepthKey(it), itemDepth=hLevelsOf(it).length>=2;
      return `<div class="h-ob" data-depth-card="${laterEsc(depthId)}">${laterRegister(`obstacle:${p.id}:${it.id}`,{kind:'عقبة',title:p.name,text:qq,source:it.answerSource?.t||'',tab:'qalb'})}<button class="h-obh" data-ob="${k}">
          <span class="q">${qq}</span><span class="x">⌄</span></button><div class="path-ob-quick">${hPathQuickButton('obstacle',p.id,it.id)}${itemDepth?`<span class="ob-depth-mini">${AR(hDepthMeta(it).done)}/${AR(hDepthMeta(it).total)} تعمّق</span>`:''}</div>
        <div class="h-obb hide">
          ${p.id==='mujahada'?hMujahadaHtml(it):''}
          ${hSourcePanel(it,'مصادر هذه المسألة')}${itemDepth?hLevelsHtml(it,false):`<div class="h-obs"><div class="lb">لماذا قد تحدث؟</div><ul>${hListHtml(it.why||[],false)}</ul></div><div class="h-obs"><div class="lb">الجواب باختصار</div><div class="tx">${it.answer}</div></div>`}
          <div class="path-inline"><span>هذه هي مشكلتك الآن؟ اجمعها في «مساري» وتابع خطواتها بدل أن تضيع بين الأقسام.</span>${hPathButton('obstacle',p.id,it.id)}</div>
          ${itemDepth?`<div class="h-obs" style="padding-bottom:0"><div class="lb">تطبيق اليوم</div><div class="depth-practice-intro">المتابعة هنا لما نفذته فقط، وليست تقييمًا لشخصك أو لإيمانك.</div></div>`:`<div class="h-obs" style="padding-bottom:0"><div class="lb">خطوات التجاوز</div></div>`}
          ${hStepsHtml(key,it.steps||[],false)}
        </div></div>`}).join('');
  } else {
    body=hasDepth
      ? `<div class="h-sec depth-practice"><div class="h-sh">تطبيق اليوم</div><div class="h-bd depth-practice-intro">بعد دراسة المستويات، استخدم هذه الخطوات كمتابعة يومية اختيارية. التتبع هنا لما سجّلته من عمل فقط، وليس حكمًا على إيمانك أو شخصك.</div>${hStepsHtml(p.id,hSteps(p),false)}</div>${p.note?`<div class="h-sec"><div class="h-warn">${p.note}</div></div>`:''}`
      : `<div class="h-sec"><div class="h-sh">${p.listHead||'أسبابها'}</div><div class="h-bd"><ul>${hListHtml(hList(p),false)}</ul></div></div><div class="h-sec"><div class="h-sh">${p.cureHead||'العلاج'}</div>${hStepsHtml(p.id,hSteps(p),false)}</div>${p.proof?`<div class="h-sec"><div class="h-ay">${p.proof}</div></div>`:''}${p.note?`<div class="h-sec"><div class="h-warn">${p.note}</div></div>`:''}`;
  }
  const jr=(hJournal[p.id]||[]).slice().reverse();
  document.getElementById('v-qalb').innerHTML=
    `<button class="back" id="h-back">رجوع</button>
     <div class="h-cathero"><h2>${p.name}</h2><p>${p.sub||''}</p>${(!isOb&&(HD.problems||[]).some(x=>x.id===p.id))?`<div class="nafs-actions">${hPathButton('problem',p.id)}</div>`:''}</div>
     ${!isOb?hSourcePanel(p,'مصادر هذا الباب'):''}
     ${p.def&&!hasDepth?`<div class="h-sec"><div class="h-bd">${p.def}</div></div>`:''}
     ${hLevelsHtml(p,false)}
     ${body}
     
     <div class="h-sec"><div class="h-sh">دفتري</div>
       <div class="h-bd"><textarea id="h-jr" class="h-ta" placeholder="اكتب ما تمرّ به…"></textarea>
       <button class="h-primary" id="h-save">حفظ</button></div>
       <div id="h-entries">${jr.length? jr.map((e,i)=>
         `<div class="h-entry"><div class="dt"><span>${new Intl.DateTimeFormat('ar-EG',
           {weekday:'long',day:'numeric',month:'long'}).format(new Date(e.d))}</span>
           <button data-del="${(hJournal[p.id].length-1)-i}">حذف</button></div>
           <div class="tx">${e.x.replace(/</g,'&lt;')}</div></div>`).join('')
         : '<div class="h-empty">لا شيء بعد. اكتب أول ما يخطر لك — لن يراه أحد غيرك.</div>'}</div>
     </div>`;
  scrollTo({top:0,behavior:'smooth'});
}
async function hClick(e){
  if(e.target.closest('.save-later'))return;
  const kt=e.target.closest('.h-tabs button');
  const dopen=e.target.closest?.('[data-depth-open]');
  if(dopen){await hDepthRender(dopen.dataset.depthOpen);return}
  const lvc=e.target.closest?.('[data-lv]');
  if(lvc){ const [id,n]=hDepthParseToken(lvc.dataset.lv); await hLevelOpen(id,n); await hDepthRender(id); return }
  const lvd=e.target.closest?.('[data-lvdone]');
  if(lvd){ const [id,n]=hDepthParseToken(lvd.dataset.lvdone); const nxt=await hLevelMark(id,n);
    await hDepthRender(id); toast(nxt?'فُتح المستوى التالي ✓':'أنهيت مسار دراسة هذا الموضوع ✓'); return }
  const lvr=e.target.closest?.('[data-lvreview]');
  if(lvr){const id=lvr.dataset.lvreview;await hLevelReview(id);await hDepthRender(id);toast('سُجلت المراجعة ✓');return}
  if(kt){ const k=kt.dataset.k; dCat=null; if(k==='path'){hPathsRender();return} if(k==='benefit'){hBenefit();return} if(k==='ishkaliat'){hIshkaliat();return} if(k==='nafs'){hNafs();return} if(k==='deeds'){hDeeds();return} if(k==='obstacles'){hKind='obstacles';hObstacles();return} if(['problems','works'].includes(k)){hKind=k;hRender();return} }
  const mw=e.target.closest('button[data-muj-weight]');if(mw){const [id,v]=mw.dataset.mujWeight.split(':');mujWeights[id]={value:+v,updatedAt:Date.now()};await store.set('mujahada-weight-v1',mujWeights);const cat=(HD.obstacles||[]).find(x=>x.id==='mujahada');const it=cat?.items?.find(x=>x.id===id);if(it){const box=mw.closest('.h-obb');if(box){box.querySelectorAll('[data-muj-weight]').forEach(b=>b.classList.toggle('on',b===mw));let say=box.querySelector('.muj-say'),o=it.weight?.options?.find(x=>+x.v===+v);if(!say&&o){say=document.createElement('div');say.className='muj-say';mw.closest('.muj-weight')?.appendChild(say)}if(say)say.textContent=o?.sayTo||''}}toast('حُفظ تقدير أثر العقبة محليًا ✓');return}
  const bc=e.target.closest('button[data-benefit-choose]');if(bc){benefitChoice={routeId:bc.dataset.benefitChoose,updatedAt:Date.now()};await store.set('benefit-choice-v1',benefitChoice);hBenefit();toast('حُفظ باب النفع المختار ✓');return}
  const bt=e.target.closest('button[data-benefit-task]');if(bt){await loadBenefit();const r=BENEFIT.routes?.find(x=>x.id===bt.dataset.benefitTask);if(r){const item={id:'benefit-'+Date.now(),text:r.firstStep,due:current||todayKey,done:false,important:false,createdAt:Date.now(),source:'benefit-route'};todoItems.push(item);await saveTodo();toast('أضفنا الخطوة إلى مهام اليوم ✓')}return}
  const pgo=e.target.closest('button[data-path-go]'); if(pgo){const k=pgo.dataset.pathGo;if(k==='obstacles'){hKind='obstacles';hQuery='';hObstacles()}else if(k==='nafs'){nafsQuery='';hNafs()}else{hKind='problems';hQuery='';hRender()}return}
  const ppreset=e.target.closest('button[data-path-preset]'); if(ppreset){const k=ppreset.dataset.pathPreset;if(k==='worry'){nafsQuery='قلق';nafsGroup='all';hNafs()}else if(k==='futuur'){hQuery='فتور';hObstacles()}else if(k==='sin'){hQuery='ذنب';hObstacles()}else if(k==='family'){hQuery='أسرة';hObstacles()}else if(k==='relation'){hQuery='علاقة';hObstacles()}else{hKind='problems';hQuery='';hRender()}return}
  const pquick=e.target.closest('button[data-path-quick]'); if(pquick){e.preventDefault();e.stopPropagation();await hPathQuickAdd(pquick,pquick.dataset.pathQuick);return}
  const pstart=e.target.closest('button[data-path-start]'); if(pstart){await hPathStart(pstart.dataset.pathStart);return}
  const popen=e.target.closest('button[data-path-open]'); if(popen){hPathDetail(popen.dataset.pathOpen);return}
  if(e.target.closest('#path-back')){hPathsRender();return}
  const pstop=e.target.closest('button[data-path-stop]'); if(pstop&&hPathCur){const p=hPathFind(hPathCur);if(!p)return;p.done=p.done||{};p.done[pstop.dataset.pathStop]=!p.done[pstop.dataset.pathStop];await store.set('qalb-paths-v1',hPaths);hPathDetail(hPathCur);return}
  const pstate=e.target.closest('button[data-path-state]'); if(pstate&&hPathCur){const p=hPathFind(hPathCur);if(!p)return;(p.checkins=p.checkins||[]).push({d:Date.now(),state:pstate.dataset.pathState});await store.set('qalb-paths-v1',hPaths);toast('سُجلت مراجعتك');hPathDetail(hPathCur);return}
  const parch=e.target.closest('button[data-path-archive]'); if(parch){const p=hPathFind(parch.dataset.pathArchive);if(p){p.status='archived';await store.set('qalb-paths-v1',hPaths);toast('أُغلق المسار');hPathsRender()}return}
  const preset=e.target.closest('button[data-path-reset]'); if(preset){const p=hPathFind(preset.dataset.pathReset);if(p){p.done={};p.checkins=[];await store.set('qalb-paths-v1',hPaths);toast('تم تصفير التقدم');hPathDetail(p.key)}return}
  const nopen=e.target.closest('[data-nafs-id]'); if(nopen){hNafsDetail(nopen.dataset.nafsId);return}
  if(e.target.closest('#nafs-back')){nafsCur=null;hNafs();return}
  const ng=e.target.closest('button[data-ng]'); if(ng){ nafsGroup=ng.dataset.ng; hNafs(); return }
  const ig=e.target.closest('button[data-ig]'); if(ig){ issueGroup=ig.dataset.ig; hIshkaliat(); return }
  if(e.target.closest('#d-back')){ dCat=null; hDeeds(); return }
  const dc=e.target.closest('[data-dcat]'); if(dc){ dCat=dc.dataset.dcat; hDeeds(); return }
  const dd=e.target.closest('button[data-dd]');
  if(dd){ const d=hToday(); hTrack[d]=hTrack[d]||{};
    const kk=dd.dataset.dd+':0';
    if(hTrack[d][kk]) delete hTrack[d][kk]; else { hTrack[d][kk]=1; toast('تقبّل الله') }
    await store.set('qalb-track',hTrack); hDeeds(); return }
  if(e.target.closest('button[data-skip]')){
    const sk=((await store.get('deed-skip'))||0)+1; await store.set('deed-skip',sk); hDeeds(); return }
  if(e.target.id==='kh-go'){
    const v=(document.getElementById('kh-pin').value||'').trim();
    if(!v){ toast('أدخل رقمًا'); return }
    if(!kh.pin){ kh.pin=v; await store.set('khabia',kh); khOpen=true; toast('حُفظ الرقم') }
    else if(kh.pin===v){ khOpen=true }
    else { toast('رقم غير صحيح'); return }
    hDeeds(); return }
  if(e.target.id==='kh-close'){ khOpen=false; hDeeds(); return }
  if(e.target.id==='kh-add'){ const t=document.getElementById('kh-in').value.trim(); if(!t)return;
    (kh.items=kh.items||[]).push({d:Date.now(),t}); await store.set('khabia',kh); hDeeds(); return }
  const kd=e.target.closest('button[data-khdel]');
  if(kd){ kh.items.splice(+kd.dataset.khdel,1); await store.set('khabia',kh); hDeeds(); return }
  const back=e.target.closest('#h-back'); if(back){ hRender(); return }
  const tile=e.target.closest('.h-tile'); if(tile){ hOpen(tile.dataset.id); return }
  const oh=e.target.closest('.h-obh');
  if(oh){ const b=oh.parentElement.querySelector('.h-obb'); if(!b)return; const op=b.classList.toggle('hide');
    oh.querySelector('.x').textContent=op?'⌄':'⌃'; return }
  const chk=e.target.closest('button[data-k]');
  if(chk){ const d=hToday(); hTrack[d]=hTrack[d]||{};
    const kk=chk.dataset.k+':'+chk.dataset.i;
    const now=!hTrack[d][kk];
    if(now) hTrack[d][kk]=1; else delete hTrack[d][kk];
    await store.set('qalb-track',hTrack);
    // تحديث موضعي بلا إعادة رسم حتى لا يُغلق ما فتحه المستخدم
    chk.classList.toggle('on',now);
    const wrap=chk.closest('.h-cure');
    if(wrap){ const cells=wrap.querySelectorAll('.h-wk i');
      if(cells.length) cells[cells.length-1].classList.toggle('on',now);
      const st=hStreak(chk.dataset.k,+chk.dataset.i);
      let el=wrap.querySelector('.stk');
      if(st>1){ if(!el){ el=document.createElement('div'); el.className='stk';
          wrap.querySelector('div').insertBefore(el,wrap.querySelector('.h-wk')) }
        el.textContent=AR(st)+' أيام متتابعة' }
      else if(el) el.remove() }
    return }
  if(e.target.id==='h-save'){ const t=document.getElementById('h-jr').value.trim(); if(!t)return;
    (hJournal[hCur]=hJournal[hCur]||[]).push({d:Date.now(),x:t});
    await store.set('qalb-journal',hJournal); hOpen(hCur); toast('حُفظ في دفترك'); return }
  const del=e.target.closest('button[data-del]');
  if(del){ hJournal[hCur].splice(+del.dataset.del,1);
    await store.set('qalb-journal',hJournal); hOpen(hCur) }
}




/* ---------- العقبات اليومية ---------- */
async function hObstacles(){
  await loadH(); hKind='obstacles'; hCur=null;
  const cats=(HD.obstacles||[]).filter(audienceOk);
  document.getElementById('v-qalb').innerHTML=`<div class="h-tabs">${hPathTab(false)}<button data-k="problems">أمراض القلوب</button><button data-k="works">أعمال القلوب</button><button data-k="obstacles" aria-current="true">العقبات</button><button data-k="deeds">بنك الأعمال</button><button data-k="nafs">فقه النفس</button>${hBenefitTab(false)}${issueTabButton(false)}</div><div class="nafs-hero"><h2>${genderText('مشكلتك مختلفة… والدين ثابت.','مشكلتك مختلفة… والدين ثابت.')}</h2><p>العقبات هنا للحياة الواقعية: أسرة، دراسة، عمل، علاقات، هاتف، فتور، قلق وأسئلة. ${genderText('اختر ما يشبه موقفك','اختاري ما يشبه موقفكِ')}؛ وتجد مراجع كل مسألة مجموعة في بدايتها بدل تكرارها تحت كل خطوة.</p></div><input id="heart-search" class="q-search" type="search" value="${laterEsc(hQuery)}" placeholder="ابحث: أسرة، علاقة، دراسة، قلق، هاتف…"><div class="search-count" id="heart-result-count"></div><div id="heart-list"></div>`;
  const render=()=>{
    const qq=searchNorm(hQuery), F=cats.filter(x=>!qq||searchNorm(deepSearchText(x)).includes(qq));
    document.getElementById('heart-result-count').textContent=`${AR(F.length)} من ${AR(cats.length)} أبواب`;
    const allItems=cats.flatMap(c=>(c.items||[]).filter(audienceOk));
    const lead=!qq?hDepthContinueHtml(allItems,'obstacles'):'';
    document.getElementById('heart-list').innerHTML=F.length?lead+`<div class="h-grid">${F.map(p=>{
      const items=(p.items||[]).filter(audienceOk), metas=items.map(hDepthMeta), done=metas.reduce((a,m)=>a+m.done,0), total=metas.reduce((a,m)=>a+m.total,0);
      return `<div class="h-tile" data-id="${p.id}">${laterRegister(`obstaclecat:${p.id}`,{kind:'العقبات',title:p.name,text:p.sub||'',source:'مصادر داخل كل مسألة',tab:'qalb'})}<div class="nm">${p.name}</div><div class="ds">${p.sub||''}</div>${total?`<div class="depth-tile"><span>عمق الدراسة</span><b>${AR(done)}/${AR(total)}</b><i><em style="width:${Math.round(done/total*100)}%"></em></i></div>`:''}<div class="st">${AR(items.length)} مسائل</div></div>`
    }).join('')}</div>`:'<div class="nafs-empty">لا توجد نتيجة مطابقة.</div>';
  };
  document.getElementById('v-qalb').onclick=hClick;document.getElementById('heart-search').oninput=e=>{hQuery=e.target.value;render()};render();
}


/* ---------- فقه النفس ---------- */
let nafsGroup='all', nafsQuery='';
function nafsNorm(x){ return searchNorm(x) }
function hNafsList(){
  const N=(HD.nafs||[]).filter(audienceOk), q=nafsNorm(nafsQuery), GM=Object.fromEntries((HD.nafsGroups||[]).map(g=>[g.id,g]));
  const F=N.filter(it=>(nafsGroup==='all'||it.group===nafsGroup) && (!q||nafsNorm([it.q,it.summary,it.psych,it.iman,...(it.questions||[])].join(' ')).includes(q)));
  const host=document.getElementById('nafs-list'); if(!host)return; const cnt=document.getElementById('nafs-result-count'); if(cnt)cnt.textContent=`${AR(F.length)} من ${AR(N.length)} موضوعًا`;
  const lead=!q&&nafsGroup==='all'?hDepthContinueHtml(N,'nafs'):'';
  host.innerHTML=F.length?lead+`<div class="nafs-topic-list">${F.map(it=>{const gr=GM[it.group]||{};return `<div class="nafs-topic">${laterRegister(`nafs:${it.id}`,{kind:'فقه النفس',title:it.q,text:it.summary,source:'فقه النفس | مكاني + المصادر الظاهرة',tab:'qalb'})}<button class="nafs-open" data-nafs-id="${it.id}"><span><span class="ng">${gr.name||'فقه النفس'}</span><span class="nq">${it.q}</span><span class="ns">${it.summary||''}</span></span><span class="go">←</span></button>${hDepthTileHtml(it)}<div class="nafs-path-quick">${hPathQuickButton('nafs',it.id)}</div></div>`}).join('')}</div>`:'<div class="nafs-empty">لا توجد نتائج مطابقة. جرّب كلمة أخرى أو اختر كل المسارات.</div>';
}
function hNafsDetail(id){
  const it=(HD.nafs||[]).find(x=>x.id===id);if(!it){hNafs();return}nafsCur=id;const gr=(HD.nafsGroups||[]).find(g=>g.id===it.group)||{};
  const plus=laterRegister(`nafs:${it.id}`,{kind:'فقه النفس',title:it.q,text:it.summary,source:'فقه النفس | مكاني + المصادر الظاهرة',tab:'qalb'}), hasDepth=hLevelsOf(it).length>=2;
  document.getElementById('v-qalb').innerHTML=`<button class="back" id="nafs-back">فقه النفس</button><div class="nafs-detail-hero"><div class="crumb">${gr.name||'فقه النفس'}</div><h2>${it.q}</h2><p>${it.summary}</p><div class="nafs-actions">${hPathButton('nafs',it.id)}${plus}</div></div>
    ${hSourcePanel(it,'مصادر هذا الموضوع')}${hLevelsHtml(it,false)}
    ${hasDepth?`<div class="h-sec depth-practice"><div class="h-sh">تطبيق اليوم</div><div class="h-bd depth-practice-intro">هذه الخطوات تنظيم ذاتي من المحتوى الموثق نفسه. تسجيلها لا يعني تشخيصًا ولا يقيس قيمة الشخص أو إيمانه.</div>${hStepsHtml('nafs/'+it.id,it.steps||[],false)}</div>`:`<div class="nafs-detail-grid"><div class="nafs-detail-card"><h3>ما الذي يحدث في النفس؟</h3><div class="tx">${it.psych}</div></div><div class="nafs-detail-card"><h3>البوصلة الإيمانية</h3><div class="tx">${it.iman}</div></div></div><div class="h-sec" style="margin-top:10px"><div class="h-sh">أسئلة تساعدك على فهم نفسك</div><div class="h-bd"><div class="nafs-qcards">${(it.questions||[]).map((x,i)=>`<div class="nafs-qcard"><i>${AR(i+1)}</i><span>${x}</span></div>`).join('')}</div></div></div><div class="h-sec"><div class="h-sh">خطوات عملية</div>${hStepsHtml('nafs/'+it.id,it.steps||[],false)}</div>`}
    ${(it.flags||[]).length?`<div class="h-sec"><div class="h-sh">متى يكون المختص مهمًا؟</div><div class="h-bd"><div class="flags"><ul>${it.flags.map(f=>`<li>${f}</li>`).join('')}</ul></div></div></div>`:''}
    `;
  document.getElementById('v-qalb').onclick=hClick;scrollTo({top:0,behavior:'smooth'});
}

function hNafs(){
  const groups=HD.nafsGroups||[];
  document.getElementById('v-qalb').innerHTML=
   `<div class="h-tabs">${hPathTab(false)}
      <button data-k="problems">أمراض القلوب</button><button data-k="works">أعمال القلوب</button>
      <button data-k="obstacles">العقبات</button><button data-k="deeds">بنك الأعمال</button>
      <button data-k="nafs" aria-current="true">فقه النفس</button>${hBenefitTab(false)}${issueTabButton(false)}</div>
    <div class="nafs-hero"><h2>فقه النفس — من الفهم إلى التزكية</h2><p>${HD.meta?.nafsMethod||'صياغة تعليمية مستفادة من فقه النفس | مكاني.'}</p></div>
    <section class="section-source-panel compact nafs-section-sources"><div class="section-source-kicker">مصادر هذا القسم وحدوده</div><div class="source-stack">${sourceStack([{label:'فقه النفس | مكاني — بإشراف د. عبد الرحمن ذاكر الهاشمي',url:HD.meta?.nafsUrl||'https://makany.co/'},{label:'المرجع الطبي العام — منظمة الصحة العالمية',url:'https://www.who.int/news-room/fact-sheets/detail/depression'}])}</div></section>
    <input id="nafs-search" class="q-search" type="search" value="${nafsQuery.replace(/"/g,'&quot;')}" placeholder="ابحث: قلق، غضب، كمالية، تعلق، وسواس…" aria-label="بحث في فقه النفس">
    <div class="search-count" id="nafs-result-count"></div>
    <div class="nafs-groups"><button data-ng="all" class="${nafsGroup==='all'?'on':''}">كل المسارات</button>${groups.map(g=>`<button data-ng="${g.id}" class="${nafsGroup===g.id?'on':''}">${g.name}</button>`).join('')}</div>
    <div class="nafs-note"><b>مهم:</b> ${HD.meta?.medicalNote||'هذا القسم للتثقيف ولا يستبدل التقييم الطبي.'}</div>
    <div id="nafs-list"></div>`;
  document.getElementById('v-qalb').onclick=hClick;
  document.getElementById('nafs-search').oninput=e=>{nafsQuery=e.target.value;hNafsList()};
  hNafsList();
}


/* ---------- إشكاليات — مسار متقدم اختياري ---------- */
let ISH=null, issueGroup='all', issueQuery='';
async function loadIsh(){
  if(ISH)return ISH;
  try{ISH=await (await fetch('./ishkaliat.json')).json()}
  catch{ISH={meta:{},groups:[],items:[]}}
  return ISH;
}
function issueAt(video,sec){
  const join=video.includes('?')?'&':'?';
  return `${video}${join}t=${Math.max(0,+sec||0)}s`;
}
function issueSource(it,at,sec,label='المصدر'){
  const url=issueAt(it.video,sec);
  return `<div class="h-src-line">${label}: <a href="${url}" target="_blank" rel="noopener">${it.title} — ${at} ↗</a></div>`;
}
function issueSearchText(it){
  return [it.title,it.subtitle,it.intro,...(it.tags||[]),...(it.points||[]).flatMap(p=>[p.title,p.text])].join(' ');
}
function hIshkaliatList(){
  const host=document.getElementById('ish-list'),cnt=document.getElementById('ish-result-count'); if(!host||!cnt)return;
  const q=searchNorm(issueQuery), all=(ISH.items||[]), items=all.filter(it=>(issueGroup==='all'||it.group===issueGroup)&&(!q||searchNorm(issueSearchText(it)).includes(q)));
  cnt.textContent=`${AR(items.length)} من ${AR(all.length)} محاضرة`;
  const groupNames=Object.fromEntries((ISH.groups||[]).map(g=>[g.id,g.name]));
  const lead=!q&&issueGroup==='all'?hDepthContinueHtml(all,'ish'):'';
  host.innerHTML=items.length?lead+items.map((it,k)=>{
    const plus=laterRegister(`ish:${it.id}`,{kind:'إشكاليات',title:it.title,text:it.subtitle,source:`${ISH.meta?.speaker||'د. أحمد عبد المنعم'} — ${it.video}`,tab:'qalb'}), depthId=hDepthKey(it);
    return `<div class="h-ob ish-card" data-depth-card="${laterEsc(depthId)}">${plus}<button class="h-obh" data-ob="${k}">
      <span><span class="ish-path">${groupNames[it.group]||''}</span><span class="q">${it.title}</span><span class="ish-sub">${it.subtitle||''}</span></span><span class="x">＋</span></button>
      <div class="h-obb hide">
        ${hLevelsHtml(it)}
        <div class="h-obs ish-full"><a class="h-lnk" href="${it.video}" target="_blank" rel="noopener">شاهد المحاضرة كاملة على YouTube ↗</a></div>
      </div></div>`;
  }).join(''):'<div class="nafs-empty">لا توجد نتيجة مطابقة. جرّب كلمة أخرى أو اختر كل المحاور.</div>';
}

async function hIshkaliat(){
  await loadIsh();
  if(!issuesEnabled()){
    document.getElementById('v-qalb').innerHTML=`<button class="back" id="ish-disabled-back">تزكية</button><div class="nafs-hero ish-optin"><div class="ish-kicker">مسار متقدم اختياري</div><h2>إشكاليات</h2><p>هذا المسار يناقش قضايا الالتزام والتدين والعمل للدين من محاضرات د. أحمد عبد المنعم، مع رابط الفيديو والتوقيت تحت كل فكرة. لا يصنف تدارُك مستوى تدينك؛ أنت فقط تختار إن كنت تريد إظهاره.</p><button class="h-primary" id="ish-enable">إظهار «إشكاليات»</button></div>`;
    document.getElementById('ish-disabled-back').onclick=()=>hRender();
    document.getElementById('ish-enable').onclick=async()=>{profile={...profile,advancedIssues:true};await store.set('profile-v1',profile);toast('تم إظهار «إشكاليات» ✓');hIshkaliat()};
    return;
  }
  document.getElementById('v-qalb').innerHTML=`<div class="h-tabs">${hPathTab(false)}
      <button data-k="problems">أمراض القلوب</button><button data-k="works">أعمال القلوب</button>
      <button data-k="obstacles">العقبات</button><button data-k="deeds">بنك الأعمال</button>
      <button data-k="nafs">فقه النفس</button>${hBenefitTab(false)}${issueTabButton(true)}</div>
    <div class="nafs-hero ish-hero"><div class="ish-kicker">مسار متقدم اختياري</div><h2>${ISH.meta?.title||'إشكاليات'}</h2>
      <p>${ISH.meta?.audience||''}</p>
      <div class="ish-method">${ISH.meta?.method||''}</div>
      <div class="learn-source">المصدر العام: <a href="${ISH.meta?.playlist||'#'}" target="_blank" rel="noopener">سلسلة المحاضرات — ${ISH.meta?.speaker||'د. أحمد عبد المنعم'} / ${ISH.meta?.channel||''} ↗</a></div>
    </div>
    <input id="ish-search" class="q-search" type="search" value="${laterEsc(issueQuery)}" placeholder="ابحث: فتور، ثغر، خلاف، بناء معرفي، مثالية…" aria-label="بحث في إشكاليات">
    <div class="search-count" id="ish-result-count"></div>
    <div class="nafs-groups ish-groups"><button data-ig="all" class="${issueGroup==='all'?'on':''}">كل المحاور</button>${(ISH.groups||[]).map(g=>`<button data-ig="${g.id}" class="${issueGroup===g.id?'on':''}">${g.name}</button>`).join('')}</div>
    <div class="nafs-note"><b>طريقة القراءة:</b> اعتبر الملخص بداية فقط. النص داخل تدارُك ليس اقتباسًا حرفيًا عن المحاضر؛ تحت كل فكرة رابط الفيديو من التوقيت المرتبط بها، ومنه يمكنك الرجوع إلى السياق الكامل.</div>
    <div id="ish-list"></div>`;
  document.getElementById('v-qalb').onclick=hClick;
  document.getElementById('ish-search').oninput=e=>{issueQuery=e.target.value;hIshkaliatList()};
  hIshkaliatList();
}

/* ---------- أسماء الله الحسنى ---------- */
let ASMA=null, asmaQuery='', asmaCur=null, asmaVerseLimit=30, dorarSeq=0;
async function loadAsma(){ if(ASMA)return ASMA; try{ASMA=await (await fetch('./asma.json')).json()}catch{ASMA={names:[],sources:{},methodology:''}} return ASMA }
function asmaNorm(x){ return nafsNorm(x).replace(/ة/g,'ه').replace(/ٱ/g,'ا').replace(/[ۖۗۚۛۜ۞۩]/g,'') }
function asmaQNorm(x){ return (x||'').replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06edـ]/g,'').replace(/ٱ/g,'ا').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[٠-٩0-9]/g,'').replace(/[^ء-ي ]/g,' ').replace(/\s+/g,' ').trim() }
function asmaStripPrefix(w){ let x=w; while(x.length>3 && /^[وفبكل]/.test(x)) x=x.slice(1); return x }
function asmaVerseHit(text,name){
  const t=asmaQNorm(text), n=asmaQNorm(name);
  if(!t||!n)return false;
  if(n.includes(' ')) return t.includes(n);
  const bare=(n.startsWith('ال')&&n!=='الله')?n.slice(2):n;
  return t.split(' ').some(w=>{
    const x=asmaStripPrefix(w), y=x.endsWith('ا')?x.slice(0,-1):x;
    if(x===n||y===n)return true;
    if(bare!==n&&(x===bare||y===bare))return true;
    if((n==='الرب'||n==='الاله') && (x.startsWith(bare)||y.startsWith(bare))) return true;
    return false;
  });
}
async function asmaVerses(it){
  await loadQuran(); const out=[];
  (Q.suras||[]).forEach(s=>(s.a||[]).forEach((a,i)=>{ if(asmaVerseHit(a,it.name)) out.push({s:s.name,sn:s.n,a:i+1,t:a}) }));
  return out;
}
const ASMA_HADITH_EVIDENCE={
  'الشافي':[{t:'«اشفِ أنت الشافي، لا شفاء إلا شفاؤك…» — صحيح البخاري، وأخرجه مسلم.',u:'https://dorar.net/hadith/sharh/2287'}],
  'الرفيق':[{t:'«إن الله رفيق يحب الرفق…» — حديث صحيح.',u:'https://dorar.net/h/GAIn1HIV?osoul=1'}],
  'الجميل':[{t:'«إن الله جميل يحب الجمال» — صحيح مسلم.',u:'https://dorar.net/hadith/sharh/26749'}],
  'القابض':[{t:'«إن الله هو المسعّر القابض الباسط الرزاق…» — حديث صحيح.',u:'https://dorar.net/hadith/sharh/35389'}],
  'الباسط':[{t:'«إن الله هو المسعّر القابض الباسط الرزاق…» — حديث صحيح.',u:'https://dorar.net/hadith/sharh/35389'}],
  'المعطي':[{t:'«والله المعطي وأنا القاسم» — صحيح البخاري.',u:'https://dorar.net/h/4IufF4iK'}],
  'المقدم':[{t:'«أنت المقدّم وأنت المؤخّر…» — صحيح البخاري.',u:'https://dorar.net/hadith/sharh/134851'}],
  'المؤخر':[{t:'«أنت المقدّم وأنت المؤخّر…» — صحيح البخاري.',u:'https://dorar.net/hadith/sharh/134851'}],
  'المنان':[{t:'دعاء «…المنّان، بديع السماوات والأرض…» — صححه أهل الحديث.',u:'https://dorar.net/hadith/sharh/31141'}],
  'السيد':[{t:'«السيد الله تبارك وتعالى» — ثابت في السنة.',u:'https://dorar.net/hadith/sharh/70611'}],
  'الحيي':[{t:'«إن الله حيي ستير يحب الحياء والستر…» — حديث صحيح.',u:'https://dorar.net/hadith/sharh/61140'}],
  'الستير':[{t:'«إن الله حيي ستير يحب الحياء والستر…» — حديث صحيح.',u:'https://dorar.net/hadith/sharh/61140'}],
  'الوتر':[{t:'«فإن الله وتر يحب الوتر» — حديث ثابت.',u:'https://dorar.net/hadith/sharh/115859'}]
};
function hAsmaList(){
  const host=document.getElementById('asma-list'); if(!host||!ASMA)return;
  const q=asmaNorm(asmaQuery), F=(ASMA.names||[]).filter(x=>!q||asmaNorm(x.name+' '+x.meaning+' '+x.impact).includes(q));
  document.getElementById('asma-result-count').textContent=`${AR(F.length)} من ${AR((ASMA.names||[]).length)} اسمًا`;
  host.innerHTML=F.length?F.map(it=>{
    const src=(it.sources||[]).map(code=>ASMA.sources[code]).filter(Boolean)[0];
    return `<article class="asma-card">
      <div class="asma-card-row">
        <span class="asma-num" aria-hidden="true">${AR(it.n)}</span>
        <button class="asma-open" data-asmoid="${it.n}" aria-label="فتح تفاصيل اسم ${it.name}">
          <span class="asma-name">${it.name}</span>
          <span class="asma-meaning">${it.meaning}</span>
          <span class="asma-card-meta">ورد اللفظ في المرجع: ${AR(it.quranCount)}</span>
          <span class="asma-openhint">المعنى المختصر · ثم مرحلة التعمق ←</span>
        </button>
        ${laterRegister(`asma:${it.n}`,{kind:'اسم من أسماء الله الحسنى',title:it.name,text:it.meaning,source:src?.title||'',tab:'asma'})}
      </div>
    </article>`;
  }).join(''):'<div class="nafs-empty">لا توجد أسماء مطابقة لبحثك.</div>';
}
function cleanDorarHtml(html){
  const d=document.createElement('div'); d.innerHTML=html||'';
  d.querySelectorAll('script,style,iframe,object,embed,form,input,button').forEach(x=>x.remove());
  d.querySelectorAll('*').forEach(el=>{[...el.attributes].forEach(a=>{if(/^on/i.test(a.name))el.removeAttribute(a.name)}); if(el.tagName==='A'){const u=el.getAttribute('href')||''; if(u.startsWith('/'))el.setAttribute('href','https://dorar.net'+u); else if(!/^https?:\/\//i.test(u))el.removeAttribute('href'); el.target='_blank';el.rel='noopener'}});
  return d.innerHTML;
}
async function asmaDorarSearch(it){
  const host=document.getElementById('asma-hadith-live'); if(!host)return;
  host.innerHTML='<div class="asma-live-note">جارٍ جلب نتائج الموسوعة الحديثية…</div>';
  const cb='rafiqDataCallback';
  const url='https://dorar.net/dorar_api.json?skey='+encodeURIComponent(it.name)+'&callback='+cb;
  try{
    const r=await fetch(url,{method:'GET',credentials:'omit'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const txt=await r.text();
    const start=txt.indexOf('('), end=txt.lastIndexOf(')');
    if(start<0||end<=start) throw new Error('Unexpected API response');
    const data=JSON.parse(txt.slice(start+1,end));
    const arr=(data&&data.ahadith)||[];
    host.innerHTML=arr.length?`<div class="asma-live-note">نتائج مباشرة من API الرسمي للدرر السنية. وجود النتيجة لا يعني صحتها وحده؛ راجع حكم المحدث الظاهر في كل نتيجة.</div>${arr.map(x=>`<div class="result">${cleanDorarHtml(x.th)}</div>`).join('')}`:'<div class="asma-live-note">لم يُرجع المصدر نتائج لهذه الصيغة. استخدم رابط البحث الكامل أدناه.</div>';
  }catch(e){
    host.innerHTML='<div class="asma-live-note">تعذر تحميل نتائج الأحاديث الآن. افتح البحث الكامل في الدرر السنية.</div>';
  }
}
async function hAsmaDetail(n){
  await loadAsma(); const it=(ASMA.names||[]).find(x=>+x.n===+n); if(!it)return hAsma();
  asmaCur=it.n; asmaVerseLimit=30; const ev=ASMA_HADITH_EVIDENCE[it.name]||[]; let vv=[];
  const renderVerses=()=>{
    if(asmaCur!==it.n)return;
    const box=document.getElementById('asma-verses'); if(!box)return;
    const count=document.getElementById('asma-verse-count'); if(count)count.textContent=`${AR(vv.length)} موضعًا لفظيًا`;
    box.innerHTML=vv.length?vv.slice(0,asmaVerseLimit).map(v=>`<div class="asma-verse"><div class="ref">${v.s} — آية ${AR(v.a)}</div><div class="txt">${v.t}</div></div>`).join(''):'<div class="asma-live-note">لم يجد البحث اللفظي المباشر موضعًا في نص المصحف المحلي لهذا الاسم.</div>';
    const more=document.getElementById('asma-more'); if(more){more.style.display=asmaVerseLimit<vv.length?'block':'none';more.textContent=`عرض المزيد (${AR(Math.min(50,vv.length-asmaVerseLimit))})`}
  };
  const renderVerseFailure=()=>{
    if(asmaCur!==it.n)return;
    const count=document.getElementById('asma-verse-count'); if(count)count.textContent='تعذر التحميل الآن';
    const box=document.getElementById('asma-verses'); if(box)box.innerHTML='<div class="asma-live-note">تعذر تحميل مواضع القرآن الآن. المعنى والأثر والمصادر ما زالت متاحة، ويمكن إعادة فتح الاسم للمحاولة مرة أخرى.</div>';
    const more=document.getElementById('asma-more'); if(more)more.style.display='none';
  };
  document.getElementById('v-asma').innerHTML=`<button class="back" id="asma-back">الأسماء الحسنى</button>
    <div class="asma-detail-hero"><div class="num">الاسم رقم ${AR(it.n)}</div><h2>${it.name}</h2><p>${it.meaning}</p></div>
    <div class="asma-dsec"><div class="asma-dhead"><span>أثر الإيمان بالاسم</span></div><div class="asma-dbody"><div class="asma-tx">${it.impact}</div></div></div>
    <div class="asma-dsec"><div class="asma-dhead"><span>القرآن الكريم</span><span id="asma-verse-count">جارٍ تحميل المواضع…</span></div><div class="asma-dbody"><div class="asma-method">العدد السابق في البطاقة (${it.quranCount}) من المرجع التعليمي المستخدم في النسخة السابقة. أما القائمة هنا فتُستخرج آليًا من نص المصحف الموجود داخل التطبيق بمطابقة لفظ الاسم بعد إزالة التشكيل. لذلك قد تختلف؛ وبعض الألفاظ المشتركة قد تَرِد في سياق لا يكون فيه اللفظ اسمًا لله، فثبوت الاسم يُرجع فيه إلى الدليل والمصدر العقدي.</div><div id="asma-verses"><div class="asma-live-note">جارٍ تحميل نص القرآن والبحث في المواضع دون تعطيل صفحة الاسم…</div></div><button id="asma-more" class="asma-more" style="display:none">عرض المزيد</button></div></div>
    <div class="asma-dsec"><div class="asma-dhead"><span>السنة النبوية</span></div><div class="asma-dbody">${ev.length?ev.map(h=>`<div class="asma-hadith-seed">${h.t}<br><a href="${h.u}" target="_blank" rel="noopener">المصدر في الدرر السنية ↗</a></div>`).join(''):''}<div class="asma-method">لا ندّعي أن قائمة محلية يمكنها حصر كل طرق وروايات السنة. لذلك يعرض التطبيق أدناه نتائج بحث مباشرة من الموسوعة الحديثية للدرر السنية عند توفر الإنترنت، مع بقاء الحكم على كل رواية كما في المصدر.</div><div id="asma-hadith-live" class="asma-live"></div><a class="asma-ext" href="https://dorar.net/hadith/search?st=w&q=${encodeURIComponent(it.name)}" target="_blank" rel="noopener">فتح البحث الكامل عن «${it.name}» في الدرر السنية ↗</a></div></div>
    ${ASMA.deepStudy?`<details class="asma-deep"><summary><span><b>${laterEsc(ASMA.deepStudy.title||'المرحلة الثانية — التعمق')}</b><small>لمن يريد الانتقال من المعنى المختصر إلى منهج أعمق</small></span><span aria-hidden="true">＋</span></summary><div class="asma-deep-body"><p class="asma-deep-intro">${laterEsc(ASMA.deepStudy.intro||'')}</p><div class="asma-deep-focus"><b>تطبيق على اسم «${laterEsc(it.name)}»</b><p><strong>افهم المعنى:</strong> ${laterEsc(it.meaning)}</p><p><strong>انظر للأثر:</strong> ${laterEsc(it.impact)}</p><p><strong>في الدعاء:</strong> ادعُ الله بهذا الاسم حيث يناسب معنى حاجتك، من غير اختراع عدد مخصوص أو فضل لم يثبت.</p></div><div class="asma-rule-grid">${(ASMA.deepStudy.rules||[]).map(r=>`<article><h4>${laterEsc(r.title)}</h4><p>${laterEsc(r.text)}</p><a href="${laterEsc(r.url)}" target="_blank" rel="noopener">${laterEsc(r.source||'فتح المصدر')} ↗</a></article>`).join('')}</div>${ASMA.deepStudy.book?`<a class="asma-deep-book" href="${laterEsc(ASMA.deepStudy.book.url)}" target="_blank" rel="noopener">المرجع الرئيس للتعمق: ${laterEsc(ASMA.deepStudy.book.title)} ↗</a>`:''}</div></details>`:''}`;
  document.getElementById('v-asma').onclick=e=>{ if(e.target.closest('#asma-back')){asmaCur=null;hAsma();return} if(e.target.closest('#asma-more')){asmaVerseLimit+=50;renderVerses();return} };
  scrollTo({top:0,behavior:'smooth'});
  asmaDorarSearch(it);
  try{
    vv=await Promise.race([asmaVerses(it),new Promise((_,reject)=>setTimeout(()=>reject(new Error('asma-quran-timeout')),8000))]);
    renderVerses();
  }catch(e){renderVerseFailure()}
}
async function hAsma(){
  await loadAsma(); asmaCur=null;
  document.getElementById('v-asma').innerHTML=`<div class="asma-head"><h2>أسماء الله الحسنى</h2><p>${ASMA.methodology}</p></div><section class="learn-source-first asma-source-first"><small>المصادر المعتمدة لهذا القسم</small><h3>المصدر يظهر هنا مرة واحدة</h3><p>تفاصيل كل اسم تستعمل هذه المراجع، أما الآيات والأحاديث الخاصة بالاسم فتظهر بوصفها أدلة مباشرة وليست تكرارًا لبطاقة المصدر.</p><div class="source-stack">${sourceStack(Object.values(ASMA.sources||{}).map(x=>({label:x.title,url:x.url})))}</div></section>
    <input id="asma-search" class="q-search" type="search" value="${asmaQuery.replace(/"/g,'&quot;')}" placeholder="ابحث باسم أو معنى: الرحيم، رزق، مغفرة…" aria-label="بحث في أسماء الله الحسنى">
    <div class="search-count" id="asma-result-count"></div><div id="asma-list"></div>
    <div class="nafs-note"><b>طريقة الاستخدام:</b> اضغط على أي اسم لفتح صفحة كاملة له: المعنى، الأثر الإيماني، مواضع اللفظ في القرآن، ونتائج الأحاديث من الدرر السنية.</div>`;
  document.getElementById('v-asma').onclick=e=>{const b=e.target.closest('[data-asmoid]');if(b){hAsmaDetail(+b.dataset.asmoid);return}};
  document.getElementById('asma-search').oninput=e=>{asmaQuery=e.target.value;hAsmaList()}; hAsmaList();
}

/* ---------- العمل والنفع: اختيار باب خدمة مناسب ---------- */
async function loadBenefit(){if(BENEFIT)return BENEFIT;try{BENEFIT=await (await fetch('./benefit.json')).json()}catch{BENEFIT={meta:{},sources:{},routes:[]}}return BENEFIT}
function benefitSourceHtml(ids=[]){return `<div class="busola-src">${ids.map(id=>BENEFIT?.sources?.[id]).filter(Boolean).map(s=>`<a href="${laterEsc(s.url)}" target="_blank" rel="noopener">${laterEsc(s.label)} ↗</a>`).join('')}</div>`}
function benefitProfileSummary(){const bits=[];if(profile.married===true)bits.push('متزوج/ة');else if(profile.married===false)bits.push('غير متزوج/ة');if(profile.hasKids===true)bits.push('لديك أولاد');if(profile.timeBand)bits.push({scarce:'وقت ضيق',moderate:'وقت متوسط',free:'وقت متاح'}[profile.timeBand]);if(profile.moneyBand)bits.push({tight:'لا ترشيحات مالية',ok:'قدرة مادية محدودة',able:'سعة مادية'}[profile.moneyBand]);if((profile.skills||[]).length)bits.push(`${AR(profile.skills.length)} مهارات محددة`);return bits}
function benefitScore(r){
  const age=profileAge();if(r.minAge&&age&&age<r.minAge)return null;
  if(r.needsMarried&&profile.married!==true)return null;if(r.id==='financial'&&profile.moneyBand==='tight')return null;
  const skills=profile.skills||[];if(r.requiresAnySkills&&skills.length&&!r.skills.some(s=>skills.includes(s)))return null;
  let score=1,reasons=[];const hit=(r.skills||[]).filter(s=>skills.includes(s));if(hit.length){score+=5+hit.length;reasons.push('يتقاطع مع مهارة اخترتها')}
  if(profile.timeBand&&(r.time||[]).includes(profile.timeBand)){score+=2;reasons.push('يناسب مساحة الوقت التي وصفتها')}
  if(profile.moneyBand&&(r.money||[]).includes(profile.moneyBand)){score+=1}
  if(r.id==='family'&&profile.married===true){score+=6;reasons.push('يراعي مسؤولياتك الأسرية')}
  if(r.id==='family'&&profile.hasKids===true){score+=3;reasons.push('التربية والرعاية جزء قائم من مسؤوليتك')}
  if(r.id==='financial'&&profile.moneyBand==='able'){score+=5;reasons.push('أنت اخترت أن لديك سعة مادية')}
  if(profile.timeBand==='scarce'&&['technical','writing','professional'].includes(r.id)){score+=2;reasons.push('يمكن البدء فيه بمهمة صغيرة محددة')}
  if(!reasons.length)reasons.push('باب عام يمكن تجربته بخطوة صغيرة قبل أي التزام كبير');
  return {score,reasons};
}
async function hBenefit(){await loadH();await loadBenefit();const host=document.getElementById('v-qalb'),m=BENEFIT.meta||{},ranked=(BENEFIT.routes||[]).map(r=>({r,m:benefitScore(r)})).filter(x=>x.m).sort((a,b)=>b.m.score-a.m.score).slice(0,3),summary=benefitProfileSummary(),chosen=benefitChoice?.routeId;
  host.innerHTML=`<div class="h-tabs">${hPathTab(false)}<button data-k="problems">أمراض القلوب</button><button data-k="works">أعمال القلوب</button><button data-k="obstacles">العقبات</button><button data-k="deeds">بنك الأعمال</button><button data-k="nafs">فقه النفس</button>${hBenefitTab(true)}${issueTabButton(false)}</div><div class="benefit-hero"><small>تزكية تتحول إلى نفع</small><h2>${laterEsc(m.title||'العمل والنفع')}</h2><p>${laterEsc(m.intro||'')}</p><div class="busola-note">${laterEsc(m.rule||'')}</div></div><div class="benefit-profile">${summary.length?`بنيت الترشيح على: ${summary.join(' · ')}`:'لم تحدد سياقًا إضافيًا بعد؛ لذلك الترشيحات عامة.'}<br><button id="benefit-profile-edit">تعديل سياق الحياة والمهارات</button></div><div class="benefit-list">${ranked.map(({r,m:fit},i)=>`<article class="benefit-card ${chosen===r.id?'chosen':''}"><div class="fit">ترشيح ${AR(i+1)} · ملاءمة عملية وليست ترتيب فضل</div><h3>${laterEsc(r.title)}</h3>${r.sourceIds?.length?`<section class="section-source-panel compact benefit-source-panel"><div class="section-source-kicker">مصادر هذا الباب</div>${benefitSourceHtml(r.sourceIds||[])}</section>`:''}<p>${laterEsc(r.description)}</p><div class="benefit-why"><b>لماذا ظهر لك؟</b><br>${fit.reasons.map(x=>laterEsc(x)).join(' · ')}</div><div class="benefit-step"><b>أول خطوة ملموسة</b><span>${laterEsc(r.firstStep)}</span></div><div class="benefit-actions"><button class="primary" data-benefit-choose="${r.id}">${chosen===r.id?'✓ هذا بابي الحالي':'اختر هذا الباب'}</button><button data-benefit-task="${r.id}">أضف الخطوة لمهام اليوم</button></div></article>`).join('')}</div><div class="busola-note">${laterEsc(m.privacy||'')}</div>`;
  host.onclick=async e=>{if(e.target.id==='benefit-profile-edit'){document.getElementById('btn-profile')?.click();return}await hClick(e)};scrollTo({top:0,behavior:'smooth'});
}

/* ---------- بنك الأعمال + الخبيئة ---------- */
let dCat=null, kh={pin:'',items:[]}, khOpen=false, deedsQuery='';
const dKey=(cid,i)=>'deed:'+cid+':'+i;
function dCount(days){ // عدد الأعمال المؤدّاة في آخر N يوم
  let n=0, seen=new Set();
  for(let j=0;j<days;j++){ const dd=new Date(); dd.setDate(dd.getDate()-j);
    const t=hTrack[iso(dd)]||{};
    Object.keys(t).forEach(k=>{ if(k.startsWith('deed:')){ n++; seen.add(k.split(':')[1]) } }) }
  return {n,cats:seen.size} }
async function loadKh(){ kh=(await store.get('khabia'))||{pin:'',items:[]} }

function deedSourceHtml(it){
  const s=it?.s;if(!s)return '';
  const title=s.t||'فتح المصدر';
  return `<div class="deed-evidence"><div class="deed-evidence-label">الدليل المرتبط بالعمل</div>${s.e?`<div class="deed-evidence-text">${laterEsc(s.e)}</div>`:''}<div class="deed-evidence-ref">${s.u?`<a href="${s.u}" target="_blank" rel="noopener">${laterEsc(title)} ↗</a>`:laterEsc(title)}</div></div>`;
}

async function hDeeds(){
  await loadKh();
  const D=(HD.deeds||[]).filter(audienceOk), seed=Math.floor(Date.now()/86400000), skip=(await store.get('deed-skip'))||0;
  const flat=[]; D.forEach(c=>c.items.forEach((it,i)=>flat.push([c,it,i]))); const pick=flat.length?flat[(seed+skip)%flat.length]:null, w=dCount(7), host=document.getElementById('v-qalb');

  if(dCat){
    const c=D.find(x=>x.id===dCat); host.innerHTML=`<button class="back" id="d-back">بنك الأعمال</button><div class="h-cathero"><h2>${c.name}</h2><p>${c.sub||''}</p></div><div class="h-sec">`+c.items.map((it,i)=>{ const k=dKey(c.id,i),on=hDone(k,0,hToday()); let times=0; for(let j=0;j<30;j++){const dd=new Date();dd.setDate(dd.getDate()-j);if(hDone(k,0,iso(dd)))times++} return `<div class="h-cure">${laterRegister(`deed:${c.id}:${i}`,{kind:'بنك الأعمال',title:c.name,text:pText(it),source:it.s?.t||'',tab:'qalb'})}<button class="h-chk ${on?'on':''}" data-k="${k}" data-i="0">✓</button><div><div class="t">${pText(it)}</div>${deedSourceHtml(it)}${times?`<div class="stk">${genderText('فعلته','فعلتِه')} ${AR(times)} مرة هذا الشهر</div>`:''}</div></div>`}).join('')+`</div>`; host.onclick=hClick; return;
  }

  host.innerHTML=`${hDeedsTabs()}<input id="deeds-search" class="q-search" type="search" value="${deedsQuery.replace(/"/g,'&quot;')}" placeholder="ابحث في بنك الأعمال: صدقة، والدين، علم، خفاء…" aria-label="بحث في بنك الأعمال"><div class="search-count" id="deeds-result-count"></div><div id="deeds-results"></div>`;
  host.onclick=hClick; document.getElementById('deeds-search').oninput=e=>{deedsQuery=e.target.value;renderDeedsContent(D,pick,w)}; renderDeedsContent(D,pick,w);
}
function renderDeedsContent(D,pick,w){
  const host=document.getElementById('deeds-results'),cnt=document.getElementById('deeds-result-count'); if(!host||!cnt)return; const q=searchNorm(deedsQuery);
  if(q){ const hits=[]; D.forEach(c=>c.items.forEach((it,i)=>{if(searchNorm(c.name+' '+(c.sub||'')+' '+pText(it)).includes(q))hits.push([c,it,i])})); cnt.textContent=`${AR(hits.length)} نتيجة من ${AR(D.reduce((n,c)=>n+c.items.length,0))} عملًا`; host.innerHTML=hits.length?`<div class="h-sec">${hits.map(([c,it,i])=>{const k=dKey(c.id,i),on=hDone(k,0,hToday());return `<div class="h-cure">${laterRegister(`deed:${c.id}:${i}`,{kind:'بنك الأعمال',title:c.name,text:pText(it),source:it.s?.t||'',tab:'qalb'})}<button class="h-chk ${on?'on':''}" data-k="${k}" data-i="0">✓</button><div><div class="search-source">${c.name}</div><div class="t">${pText(it)}</div>${deedSourceHtml(it)}</div></div>`}).join('')}</div>`:'<div class="nafs-empty">لا توجد أعمال مطابقة لبحثك.</div>'; return }
  cnt.textContent=`${AR(D.reduce((n,c)=>n+c.items.length,0))} عملًا في ${AR(D.length)} أبواب`;
  host.innerHTML=`${pick?`<div class="h-p40" style="background:linear-gradient(150deg,var(--gold),#8A6A2F)"><div class="hh">عمل اليوم — ${pick[0].name}</div><div class="nn" style="font-size:19px;line-height:1.7">${pText(pick[1])}</div>${deedSourceHtml(pick[1])}<div style="display:flex;gap:8px;margin-top:12px"><button data-dd="${dKey(pick[0].id,pick[2])}" style="flex:2;margin:0">${hDone(dKey(pick[0].id,pick[2]),0,hToday())?'✓ تم بحمد الله':'تم'}</button><button data-skip="1" style="flex:1;margin:0;background:rgba(255,255,255,.14)">غيّره</button></div></div>`:''}<div class="kh-card" id="kh-card">${khHtml()}</div><div class="h-sec" style="margin-top:12px"><div class="h-sh">هذا الأسبوع</div><div class="h-bd" style="display:flex;gap:10px"><div style="flex:1;text-align:center"><div style="font-family:Amiri,serif;font-size:26px;color:var(--deep)">${AR(w.n)}</div><div style="font-size:11px;color:var(--soft)">عملًا صالحًا</div></div><div style="flex:1;text-align:center"><div style="font-family:Amiri,serif;font-size:26px;color:var(--deep)">${AR(w.cats)} / ٦</div><div style="font-size:11px;color:var(--soft)">أبوابًا لمستها</div></div></div></div><div class="h-grid">${D.map(c=>{let t=0;c.items.forEach((_,i)=>{if(hDone(dKey(c.id,i),0,hToday()))t++});return `<div class="h-tile" data-dcat="${c.id}"><div class="nm" style="font-size:18px">${c.name}</div><div class="ds">${c.sub||''}</div><div class="st">${AR(c.items.length)} عملًا${t?' · اليوم '+AR(t)+' ✓':''}</div></div>`}).join('')}</div>`;
}
function hDeedsTabs(){
  return `<div class="h-tabs">${hPathTab(false)}
    <button data-k="problems">أمراض القلوب</button>
    <button data-k="works">أعمال القلوب</button>
    <button data-k="obstacles">العقبات</button>
    <button data-k="deeds" aria-current="true">بنك الأعمال</button>
    <button data-k="nafs">فقه النفس</button>${hBenefitTab(false)}${issueTabButton(false)}</div>`;
}
function khHtml(){
  if(!khOpen) return `<div class="kh-lock">
    <div class="kh-t">الخبيئة</div>
    <div class="kh-d">مساحة لعملٍ تحب أن يبقى خفيًا عن الناس، تذكيرًا بالإخلاص لا حكمًا على النيات.</div>${hSourceHtml({t:'حديث السبعة الذين يظلهم الله — «ورجل تصدق بصدقة فأخفاها…»',u:'https://dorar.net/hadith/sharh/6995'})}
    <div style="display:flex;gap:8px;margin-top:11px">
      <input type="password" id="kh-pin" inputmode="numeric" placeholder="${kh.pin?'أدخل الرقم السري':'اختر رقمًا سريًّا'}"
        style="flex:1;background:var(--paper);border:1px solid var(--line);border-radius:11px;padding:10px;font-size:14px">
      <button id="kh-go" style="border:1px solid var(--line);background:var(--card);color:var(--deep);
        border-radius:11px;padding:10px 16px;font-size:13px;cursor:pointer">فتح</button>
    </div></div>`;
  return `<div class="kh-open">
    <div class="kh-t">الخبيئة <button id="kh-close" style="float:inline-end;border:0;background:none;
      color:var(--soft);font-size:12px;cursor:pointer">إغلاق</button></div>
    <div class="kh-d">هل لك اليوم عمل لا يعلمه إلا الله؟</div>
    <textarea id="kh-in" class="h-ta" placeholder="اكتبه هنا…" style="min-height:70px;margin-top:10px"></textarea>
    <button class="h-primary" id="kh-add">أضف</button>
    ${(kh.items||[]).slice().reverse().map((x,i)=>
      `<div class="h-entry"><div class="dt"><span>${new Intl.DateTimeFormat('ar-EG',
        {day:'numeric',month:'long'}).format(new Date(x.d))}</span>
        <button data-khdel="${kh.items.length-1-i}">حذف</button></div>
        <div class="tx">${x.t.replace(/</g,'&lt;')}</div></div>`).join('')}
  </div>`;
}

/* ================= ارتقِ ================= */
let IRT=null, irtAns={}, irtHist=[], irtPlan=[], irtDone={}, irtJourney=null, irtViewDay=null;
async function loadIrt(){ if(IRT)return IRT;
  try{ IRT=await (await fetch('./irtaqi.json')).json() }catch{ IRT={axes:[],ranks:[],framework:{}} }
  irtHist=(await store.get('irt-hist'))||[]; irtPlan=(await store.get('irt-plan'))||[];
  irtDone=(await store.get('irt-done'))||{}; irtJourney=(await store.get('irt-journey'))||null;
  // v3 rebuilds old score-only journeys into the new Sharia-priority framework.
  if(irtHist.length&&(!irtJourney||+irtJourney.version<3)){
    irtJourney=irtBuildJourney(irtHist[irtHist.length-1]); await store.set('irt-journey',irtJourney)
  }
  return IRT }
const irtRank=p=>IRT.ranks.slice().reverse().find(r=>p>=r.min)||IRT.ranks[0];
function irtQuestionText(a,i,q){
  if(a.id==='faraid'&&i===3&&isFemale())return 'أحافظ على الصلوات في وقتها وأتهيأ لها دون تسويف حتى مع تغيّر ظروف يومي';
  return typeof q==='string'?q:(isFemale()?(q.female||q.t||q.male):(q.male||q.t||q.female));
}
function irtScores(ans){
  const per={}; let tot=0,n=0;
  IRT.axes.forEach(a=>{ let s=0,c=0;
    a.q.forEach((_,i)=>{ const v=ans[a.id+':'+i]; if(v!=null){s+=v;c++} });
    per[a.id]=c?Math.round(s/(a.q.length*3)*100):0; tot+=s; n+=a.q.length*3 });
  return {per,total:n?Math.round(tot/n*100):0}
}
function irtDaysBetween(a,b){return Math.floor((fromIso(b)-fromIso(a))/86400000)}
const irtAxis=id=>IRT.axes.find(a=>a.id===id);
const irtScore=(per,id)=>Number(per?.[id]||0);
function irtSourceHtml(s,compact=false){
  if(!s)return '';
  if(typeof s==='string')return `<div class="irt-src ${compact?'compact':''}"><span class="src-mark">↗</span><span>${laterEsc(s)}</span></div>`;
  const label=s.label||s.t||'المصدر';
  return `<div class="irt-src ${compact?'compact':''}"><span class="src-mark">↗</span>${s.url||s.u?`<a href="${s.url||s.u}" target="_blank" rel="noopener">${laterEsc(label)}</a>`:`<span>${laterEsc(label)}</span>`}</div>`;
}
function irtAllSources(){
  const out=[],seen=new Set();const add=v=>{if(!v)return;if(Array.isArray(v)){v.forEach(add);return}if(typeof v!=='object')return;const u=v.url||v.u,t=v.label||v.t;if((u||t)&&t){const k=(u||'')+'|'+t;if(!seen.has(k)){seen.add(k);out.push({label:t,url:u||''})}return}Object.values(v).forEach(add)};add(IRT?.framework);add(IRT?.axes);return uniqueSources(out);
}
function irtSourcePanel(){const rows=irtAllSources();if(!rows.length)return '';const shown=rows.slice(0,3),rest=rows.slice(3);return `<section class="section-source-panel"><div class="section-source-kicker">مراجع «ارتقِ»</div><p>تظهر المراجع هنا مرة واحدة، ثم يبقى مسار الأيام نظيفًا بلا تكرار بصري للمصدر تحت كل مهمة.</p><div class="source-stack">${sourceStack(shown)}</div>${rest.length?`<details><summary>باقي المراجع · ${AR(rest.length)}</summary><div class="source-stack">${sourceStack(rest)}</div></details>`:''}</section>`}
function irtTaskText(task){
  if(!task)return '';
  if(typeof task==='string')return task;
  if(isFemale()&&task.female)return task.female;
  if(!isFemale()&&task.male)return task.male;
  return task.t||task.male||task.female||'';
}
function irtTaskAt(axis,score,dayIndex){
  const list=axis?.plan||[]; if(!list.length)return {t:'ثبّت العمل الصالح القائم عندك اليوم.'};
  const start=score<30?0:score<55?1:score<78?2:Math.min(3,list.length-1);
  const step=Math.floor(dayIndex/5); return list[Math.min(list.length-1,start+step)]||list[list.length-1];
}
function irtLowest(ids,per,exclude=[]){
  return ids.filter(id=>irtAxis(id)&&!exclude.includes(id)).sort((a,b)=>irtScore(per,a)-irtScore(per,b))[0]||ids.find(id=>irtAxis(id));
}
function irtBuildJourney(result){
  const per=result.per||{}, foundation=['faraid','rights','ilm'].filter(irtAxis), devotion=['quran','dhikr'].filter(irtAxis);
  const allNonGrowth=[...foundation,...devotion];
  const p1=(irtScore(per,'faraid')<80&&irtAxis('faraid'))?'faraid':irtLowest(foundation,per);
  const nextFoundation=irtLowest(foundation,per,[p1]);
  const p2=(nextFoundation&&irtScore(per,nextFoundation)<75)?nextFoundation:irtLowest(devotion,per);
  const p3=irtLowest(devotion,per,[p2])||irtLowest(allNonGrowth,per,[p1,p2]);
  const foundationsStable=foundation.every(id=>irtScore(per,id)>=68), devotionStable=devotion.every(id=>irtScore(per,id)>=52);
  const p4=(foundationsStable&&devotionStable&&irtAxis('nawafil'))?'nawafil':irtLowest(allNonGrowth,per,[p1,p2,p3]);
  const principles=Object.fromEntries((IRT.framework?.principles||[]).map(x=>[x.id,x]));
  const phases=[
    {axis:p1,stage:'الأصل أولًا',principle:principles['obligations-first'],reason:'نبدأ هنا لأن الخطة لا تقدّم نافلة أو زيادة على واجب ظاهر يحتاج تثبيتًا.'},
    {axis:p2||p1,stage:'تثبيت الواجب والحقوق',principle:principles['knowledge'],reason:'بعد أول باب، نثبّت بابًا لازمًا آخر أو نصل ما نقص من العلم والحقوق قبل التكثير.'},
    {axis:p3||p2||p1,stage:'زاد ثابت من الوحي',principle:principles['consistency'],reason:'بعد حماية الأصل، نضيف زادًا قليلًا قابلًا للدوام من القرآن أو الذكر بحسب نتيجتك.'},
    {axis:p4||p3||p1,stage:(p4==='nawafil'?'زيادة بعد الثبات':'إصلاح ما بقي'),principle:(p4==='nawafil'?principles['obligations-first']:principles['ease']),reason:(p4==='nawafil'?'ظهرت قاعدة مستقرة نسبيًا؛ لذلك يمكن إضافة نافلة واحدة ثابتة دون مزاحمة واجب.':'لا تزال الأولوية لباب أساسي؛ فلا نضيف تكاليف جديدة قبل أن يستقر الأصل.')}
  ];
  const days=[]; let no=1, previous=null;
  phases.forEach((ph,phaseIndex)=>{
    const axis=irtAxis(ph.axis); if(!axis)return;
    for(let j=0;j<10;j++){
      const task=irtTaskAt(axis,irtScore(per,axis.id),j);
      let support=null;
      if(previous&&previous.id!==axis.id){support=previous.maintenance||previous.plan?.[0]||null}
      else if(axis.id!=='faraid'&&irtAxis('faraid')&&irtScore(per,'faraid')<88){support=irtAxis('faraid').maintenance}
      days.push({n:no++,axis:axis.id,ax:axis.name,stage:ph.stage,phase:phaseIndex+1,reason:ph.reason,principle:ph.principle||null,task,support,supportAxis:support?(previous?.name||irtAxis('faraid')?.name||'تثبيت الأصل'):''});
    }
    previous=axis;
  });
  return {version:3,id:String(Date.now()),start:iso(new Date()),created:Date.now(),total:40,days:days.slice(0,40),phases:phases.map(p=>({axis:p.axis,stage:p.stage})),source:{per:result.per,total:result.total}};
}
function irtCurrentDay(){if(!irtJourney)return 1;return Math.max(1,Math.min(41,irtDaysBetween(irtJourney.start,iso(new Date()))+1))}
function irtDoneKey(n){return `journey:${irtJourney.id||irtJourney.start}:${n}`}
function irtDayComplete(day){const d=irtDone[irtDoneKey(day.n)]||{};return !!d.main&&(!day.support||!!d.support)}
function irtDoneCount(){return irtJourney?irtJourney.days.filter(irtDayComplete).length:0}
function irtFrameworkHtml(){
  const f=IRT.framework||{}, ps=f.principles||[];
  if(!ps.length)return '';
  return `<div class="irt-framework"><div class="irt-framework-head"><span>كيف بُنيت الخطة؟</span><small>ترتيب شرعي + تدرّج عملي</small></div><p>${f.intro||''}</p><div class="irt-principles">${ps.map(p=>`<div class="irt-principle"><b>${p.title}</b><span>${p.text}</span></div>`).join('')}</div></div>`;
}
async function irtRender(){
  await loadIrt();
  const last=irtHist[irtHist.length-1], host=document.getElementById('irt-body');
  if(!last){irtQuiz();return}
  if(!irtJourney||+irtJourney.version<3){irtJourney=irtBuildJourney(last);await store.set('irt-journey',irtJourney)}
  const {per,total}=last, rank=irtRank(total);
  const priorityOrder=['faraid','rights','ilm','quran','dhikr','nawafil'].map(irtAxis).filter(Boolean);
  const cur=irtCurrentDay(), finished=cur>40, selected=irtViewDay||Math.min(cur,40), day=irtJourney.days[selected-1], doneN=irtDoneCount();
  const pct=Math.round(doneN/40*100), phaseNo=Math.min(4,Math.ceil(selected/10));
  host.innerHTML=`<div class="irt-hero">
      <div class="sc">نتيجة آخر تقييم — قراءة تنظيمية فقط</div><div class="rank">${rank.name}</div>
      <div class="sc">${AR(total)}% · لكن ترتيب الخطة لا يعتمد على الرقم وحده</div>
      <div class="irt-weak-list">${priorityOrder.map(a=>`<span>${a.name} ${AR(per[a.id])}%</span>`).join('')}</div>
      <div class="d">نبدأ بالفرائض والحقوق والعلم اللازم، ثم نبني وردًا ثابتًا من القرآن والذكر، ولا نجعل النوافل مرحلة أساسية إلا بعد قدر معقول من ثبات الأصل.</div>
      <button data-irt="requiz">إعادة التقييم وبناء خطة جديدة</button>
    </div>
    ${irtSourcePanel()}
    ${irtFrameworkHtml()}
    <div class="irt-journey"><div class="irt-jhead"><div class="top"><b>${finished?'أتممت مدة الخطة':'رحلتك — اليوم '+AR(cur)+' من ٤٠'}</b><span>${AR(doneN)} يوم مكتمل · ${AR(pct)}%</span></div><div class="irt-jprog"><i style="width:${pct}%"></i></div><div class="irt-phase-line">المرحلة ${AR(phaseNo)} من ٤ · ${day?.stage||''}</div></div>
      <div class="irt-grid">${irtJourney.days.map(x=>{const c=irtDayComplete(x),future=x.n>cur;return `<button data-jday="${x.n}" class="${c?'done':''} ${x.n===cur?'today':''} ${x.n===selected?'sel':''} ${future?'future':''}" title="اليوم ${x.n} — ${x.ax}">${AR(x.n)}</button>`}).join('')}</div>
      ${irtDayCard(day,selected,cur)}
    </div>
    <p class="note" style="font-size:12px;color:var(--soft);line-height:1.8;margin-top:12px">الأربعون يومًا مدة تنظيمية لمتابعة التدرّج وليست عددًا تعبديًا ولا سنة مخصوصة. الخطة لا تزكي المستخدم ولا تستبدل سؤال أهل العلم في المسائل الشخصية.</p>`;
  host.onclick=irtClick;
}
function irtDayCard(day,n,cur){
  if(!day)return '';
  const state=irtDone[irtDoneKey(n)]||{}, future=n>cur, taskText=irtTaskText(day.task), supportText=irtTaskText(day.support);
  return `<div class="irt-daycard"><div class="irt-focus"><span>اليوم ${AR(n)}</span><span>${day.ax}</span><span>${day.stage}</span></div>
    <div class="irt-why"><b>لماذا هذه الخطوة الآن؟</b><p>${day.reason||''}</p></div>
    <div class="irt-task"><button data-jtask="main" data-day="${n}" class="${state.main?'on':''}" ${future?'disabled':''}>${state.main?'✓':''}</button><div><div class="tt">${taskText}</div><div class="sm">مهمة واحدة أساسية؛ المقصود الثبات لا جمع أكبر عدد من الأعمال.</div></div></div>
    ${day.support?`<div class="irt-task support"><button data-jtask="support" data-day="${n}" class="${state.support?'on':''}" ${future?'disabled':''}>${state.support?'✓':''}</button><div><div class="tt">${supportText}</div><div class="sm">تثبيت قصير لباب سابق حتى لا يكون الإصلاح على حساب ما ثبت.</div></div></div>`:''}
    <div class="irt-tip">${future?'هذه معاينة ليوم قادم. سيُفتح التتبع عند وصول يومه.':n<cur?'يمكنك تصحيح تسجيل هذا اليوم إن كنت قد أنجزته.':'إن كانت المهمة فوق طاقتك، خفّف مقدارها مع الحفاظ على أصل الواجب. لا تنفذ أيام الخطة مقدمًا.'}</div></div>`;
}
function irtQuiz(){
  const host=document.getElementById('irt-body');
  const L=[['لا','0'],['أحيانًا','1'],['غالبًا','2'],['دائمًا','3']];
  const totalQ=IRT.axes.reduce((n,a)=>n+a.q.length,0);
  host.innerHTML=`<div class="irt-hero"><div class="rank">قياس نقطة البداية</div><div class="d">أجب بصدق عن ${AR(totalQ)} سؤالًا. هذا ليس اختبار صلاح أو إيمان؛ هو فقط لمعرفة ما الذي يحتاج تثبيتًا أولًا، مع أولوية شرعية للفرائض والحقوق.</div></div>`+
    IRT.axes.map(a=>`<div class="sec-head" style="margin-top:14px;border-radius:12px">${a.name}</div>`+
      a.q.map((q,i)=>`<div class="qz"><div class="qt">${irtQuestionText(a,i,q)}</div><div class="opts">${L.map(([lb,v])=>`<button data-q="${a.id}:${i}" data-v="${v}" aria-pressed="${irtAns[a.id+':'+i]==+v}">${lb}</button>`).join('')}</div></div>`).join('')).join('')+
    `<button class="primary" id="irt-done" style="width:100%;padding:14px;border-radius:14px;border:0;background:var(--deep);color:#fff;font-size:15px;font-weight:600;margin-top:16px;cursor:pointer">احسب النتيجة وابنِ الخطة</button>`;
  host.onclick=irtClick;
}
async function irtClick(e){
  const q=e.target.closest('button[data-q]');
  if(q){irtAns[q.dataset.q]=+q.dataset.v;document.querySelectorAll(`button[data-q="${q.dataset.q}"]`).forEach(b=>b.setAttribute('aria-pressed',b===q));return}
  if(e.target.id==='irt-done'){
    const need=IRT.axes.reduce((n,a)=>n+a.q.length,0); if(Object.keys(irtAns).length<need){toast('أكمل جميع الأسئلة');return}
    const result=irtScores(irtAns); irtHist.push({d:Date.now(),per:result.per,total:result.total});
    irtJourney=irtBuildJourney(result);irtViewDay=1;
    await store.set('irt-hist',irtHist);await store.set('irt-journey',irtJourney);toast('تم التقييم — بُنيت الخطة بترتيب الأولويات');irtRender();return
  }
  if(e.target.closest('button[data-irt="requiz"]')){irtAns={};irtQuiz();return}
  const jd=e.target.closest('button[data-jday]');if(jd){irtViewDay=+jd.dataset.jday;irtRender();return}
  const jt=e.target.closest('button[data-jtask]');if(jt&&!jt.disabled){
    const n=+jt.dataset.day,key=irtDoneKey(n);irtDone[key]=irtDone[key]||{};const f=jt.dataset.jtask;irtDone[key][f]=irtDone[key][f]?0:1;
    await store.set('irt-done',irtDone);irtViewDay=n;if(irtDayComplete(irtJourney.days[n-1]))toast('اكتمل يوم الخطة ✓');irtRender();
  }
}


/* ================= home journey ================= */
const eveningPanel=document.getElementById('evening-panel');
function setEvening(open){eveningPanel?.classList.toggle('hide',!open);document.querySelectorAll('.evening-extra').forEach(el=>el.classList.toggle('hide',!open));const x=document.getElementById('evening-x');if(x)x.textContent=open?'－':'＋';if(open)setTimeout(()=>eveningPanel?.scrollIntoView({behavior:'smooth',block:'start'}),50)}
document.getElementById('evening-toggle')?.addEventListener('click',()=>setEvening(eveningPanel?.classList.contains('hide')));
document.getElementById('v-today')?.addEventListener('click',e=>{
  const b=e.target.closest('[data-home-go]');if(!b)return;
  const go=b.dataset.homeGo;
  if(go==='prayer'){
    if(!settings.lat||!settings.lng){openPrayerSetup();return}
    const body=document.querySelector('#acc-times .acc-body');body?.classList.remove('hide');const x=document.querySelector('#acc-times .acc-x');if(x)x.textContent='－';document.getElementById('acc-times')?.scrollIntoView({behavior:'smooth',block:'center'});renderTimes();return
  }
  if(go==='plan'){document.getElementById('day-plan')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(b.dataset.learnGo){if(b.dataset.learnGo==='home'){learnMode='home';learnCategory=''}else learnMode=b.dataset.learnGo}
  if(b.id==='home-resume-action'&&go==='qalb'){openTazkiyahSection();return}
  switchTab(go);
});
async function renderHomeResume(){const title=document.getElementById('home-resume-title'),copy=document.getElementById('home-resume-copy'),btn=document.getElementById('home-resume-action');if(!title||!copy||!btn)return;let choice=null;try{const q=await store.get(QKEY);if(q?.page>1)choice={t:`أكمل المصحف من صفحة ${AR(q.page)}`,c:'موضع القراءة محفوظ على جهازك.',go:'quran'};const lv=await store.get('qalb-levels-v1');if(!choice&&lv&&Object.keys(lv).length)choice={t:'أكمل رحلة التزكية',c:'لديك موضوع بدأته ويمكنك الرجوع إلى مرحلته التالية.',go:'qalb'};const bp=await store.get('fiqh-busola-progress-v1');if(!choice&&bp&&Object.keys(bp).length)choice={t:'أكمل فقه البوصلة',c:'تابع من آخر باب درسته في المقاصد أو الأولويات أو الواقع.',go:'sunnah',learn:'busola'}}catch{}if(!choice)choice={t:'ابدأ من المصحف',c:'لو لم تبدأ مسارًا بعد، اجعل أول باب اليوم قراءة القرآن.',go:'quran'};title.textContent=choice.t;copy.textContent=choice.c;btn.dataset.homeGo=choice.go;if(choice.learn)btn.dataset.learnGo=choice.learn;else delete btn.dataset.learnGo;btn.textContent='أكمل الآن ←'}

function paintHomePrayer(){
  const T=todayTimes(),title=document.getElementById('home-prayer-title'),sub=document.getElementById('home-prayer-sub'),card=document.getElementById('home-prayer-card'),action=document.getElementById('home-prayer-action');
  if(!title||!sub)return;
  const ready=!!T; card?.classList.toggle('needs-setup',!ready); if(action)action.textContent=ready?'كل المواقيت':'تفعيل المواقيت';
  if(!ready){title.textContent='فعّل مواقيت الصلاة';sub.textContent='اضغط هنا، اسمح بالموقع مرة واحدة، وسيستخدم تدارُك توقيت جهازك تلقائيًا.';return}
  const now=new Date(),h=now.getHours()+now.getMinutes()/60;const rows=[['fajr','الفجر'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];let n=rows.find(([k])=>T[k]>h);if(!n)n=rows[0];title.textContent=`الصلاة القادمة: ${n[1]}`;sub.textContent=`${hhmm(T[n[0]])} · ${deviceTimeZoneLabel()} · اضغط لعرض كل المواقيت`;
}

/* ================= tabs ================= */
const TITLES={today:'اليوم',quran:'المصحف',read:'المصحف',zikrhub:'الذكر',azkar:'الأذكار',dua:'الدعاء',tasbih:'السبحة',asma:'أسماء الله الحسنى',sunnah:'العلم',qalb:'تزكية',irtaqi:'ارتقِ',history:'السجل'};
let zikrSectionRequested=false,tazSectionRequested=false;
function openZikrSection(t){zikrSectionRequested=true;switchTab(t)}
function openTazkiyahSection(){tazSectionRequested=true;switchTab('qalb')}
function primaryDestinationForTab(t){return {read:'quran',zikrhub:'azkar',dua:'azkar',tasbih:'azkar',asma:'azkar',irtaqi:'today'}[t]||t}
function resetPrimaryDestination(dest){
  closeHadithDetail();closeAyahMenu();setAppMore(false);
  if(dest==='sunnah'){learnMode='home';learnCategory='';learnQuery='';learnGroup='all';nawawiQuery='';switchTab('sunnah');openKnowledgeHome()}
  else if(dest==='azkar'){zikrSectionRequested=false;azkarQuery='';switchTab('azkar')}
  else if(dest==='qalb'){tazSectionRequested=false;hCur=null;hQuery='';switchTab('qalb')}
  else if(dest==='today'){setEvening(false);switchTab('today')}
  else if(dest==='quran'){if(tab==='read')return;const q=document.getElementById('q-search');if(q)q.value='';quranToolsRequested=true;switchTab('quran')}
  else switchTab(dest);
  scrollTo({top:0,behavior:'smooth'});
}
const appMorePanel=document.getElementById('app-more-panel');
function setAppMore(open){appMorePanel?.classList.toggle('hide',!open);appMorePanel?.setAttribute('aria-hidden',open?'false':'true')}
document.getElementById('btn-more')?.addEventListener('click',()=>setAppMore(true));
document.getElementById('app-more-close')?.addEventListener('click',()=>setAppMore(false));
appMorePanel?.addEventListener('click',e=>{if(e.target===appMorePanel){setAppMore(false);return}const b=e.target.closest('[data-more-action]');if(!b)return;const id={history:'btn-history',theme:'btn-theme',settings:'btn-settings',feedback:'btn-feedback'}[b.dataset.moreAction];setAppMore(false);if(id)setTimeout(()=>document.getElementById(id)?.click(),0)});
document.querySelectorAll('nav button[data-tab]').forEach(b=>b.onclick=()=>{const dest=b.dataset.tab;if(primaryDestinationForTab(tab)===dest){resetPrimaryDestination(dest);return}switchTab(dest)});
function switchTab(t){
  if(t==='quran'&&!quranToolsRequested){ openQuranReaderDefault(); return }
  if(t==='azkar'&&!zikrSectionRequested)t='zikrhub';
  const showTazDetail=t==='qalb'&&tazSectionRequested;
  zikrSectionRequested=false;tazSectionRequested=false;
  const showQuranTools=t==='quran'&&quranToolsRequested; if(showQuranTools)quranToolsRequested=false;
  tab=t;
  syncReaderSurface(t);
  const views=['today','quran','read','zikrhub','azkar','dua','tasbih','asma','sunnah','qalb','irtaqi','history'];
  views.forEach(v=>{ const el=document.getElementById('v-'+v); if(el) el.classList.toggle('hide',v!==t) });
  const zikr=['azkar','dua','tasbih','asma'];
  const navFor={read:'quran',zikrhub:'azkar',dua:'azkar',tasbih:'azkar',asma:'azkar',irtaqi:'today'}[t]||t;
  document.querySelectorAll('nav button[data-tab]').forEach(b=>
    b.setAttribute('aria-current',b.dataset.tab===navFor));
  document.getElementById('zseg').classList.toggle('hide',!zikr.includes(t));
  document.getElementById('zikr-category-head')?.classList.toggle('hide',!zikr.includes(t));
  const ztitle={azkar:'الأذكار',dua:'الدعاء',tasbih:'السبحة',asma:'أسماء الله الحسنى'}[t]||'';const zt=document.getElementById('zikr-category-title');if(zt)zt.textContent=ztitle;
  document.querySelectorAll('#zseg button').forEach(b=>b.setAttribute('aria-current',b.dataset.z===t));
  document.getElementById('page-title').textContent=TITLES[t]||'';
  if(t==='history') renderHistory();
  if(t==='quran'){ openQuran(); renderQuran() }
  if(t==='tasbih') renderTasbih();
  if(t==='asma') hAsma();
  if(t==='azkar') renderAzkar();
  if(t==='dua') renderDua();
  if(t==='sunnah') renderKnowledge();
  if(t==='today') renderHomeResume();
  if(t==='qalb') showTazDetail?hRender():hHome();
  if(t==='irtaqi') irtRender();
  scrollTo({top:0,behavior:'smooth'});
}
document.getElementById('zseg').onclick=e=>{const b=e.target.closest('button'); if(b) openZikrSection(b.dataset.z)};
document.getElementById('v-zikrhub')?.addEventListener('click',e=>{const b=e.target.closest('[data-zgo]');if(!b)return;const go=b.dataset.zgo;if(go==='hisn'){azkarMode='hisn';hisnChapter=null;openZikrSection('azkar');return}openZikrSection(go)});
document.getElementById('zikr-hub-back')?.addEventListener('click',()=>switchTab('azkar'));

/* ================= date controls ================= */
document.getElementById('datepick').onchange=e=>{if(e.target.value)load(e.target.value)};
document.getElementById('prev-day').onclick=()=>shift(-1);
document.getElementById('next-dayb').onclick=()=>shift(1);
document.getElementById('go-today').onclick=()=>load(iso(new Date()));
function shift(n){const d=fromIso(current);d.setDate(d.getDate()+n);load(iso(d))}

/* ================= feedback ================= */
const FEEDBACK_VERSION='24.51.0';
const feedbackSheet=document.getElementById('feedback-sheet');
const feedbackText=document.getElementById('feedback-text');
function feedbackPayload(){
  const msg=feedbackText.value.trim();
  if(!msg){ toast('اكتب ملاحظتك أولًا'); feedbackText.focus(); return null }
  const type=document.getElementById('feedback-type').value;
  const section=TITLES[tab]||'غير محدد';
  return `تدارُك - Tadaruq — ملاحظة مستخدم\nالنوع: ${type}\nالقسم: ${section}\nالإصدار: ${FEEDBACK_VERSION}\n\n${msg}`;
}
async function copyFeedback(text){
  try{
    if(navigator.clipboard?.writeText){ await navigator.clipboard.writeText(text); return true }
    const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select(); const ok=document.execCommand('copy'); ta.remove(); return ok;
  }catch{return false}
}
document.getElementById('btn-feedback').onclick=()=>{
  document.getElementById('feedback-context').textContent='القسم الحالي: '+(TITLES[tab]||'—');
  feedbackSheet.classList.remove('hide'); setTimeout(()=>feedbackText.focus(),80);
};
document.getElementById('close-feedback').onclick=()=>feedbackSheet.classList.add('hide');
feedbackSheet.onclick=e=>{if(e.target===feedbackSheet)feedbackSheet.classList.add('hide')};
document.getElementById('feedback-copy').onclick=async()=>{
  const text=feedbackPayload(); if(!text)return;
  const ok=await copyFeedback(text); toast(ok?'تم نسخ الملاحظة':'تعذر النسخ على هذا الجهاز');
};
document.getElementById('feedback-share').onclick=async()=>{
  const text=feedbackPayload(); if(!text)return;
  if(navigator.share){
    try{ await navigator.share({title:'ملاحظة على تدارُك - Tadaruq',text}); toast('شكرًا لملاحظتك'); feedbackSheet.classList.add('hide'); return }
    catch(e){ if(e?.name==='AbortError')return }
  }
  const ok=await copyFeedback(text);
  toast(ok?'تم نسخ الملاحظة — شاركها بالطريقة المناسبة':'تعذر فتح المشاركة على هذا الجهاز');
};

/* ================= settings ================= */
const sheet=document.getElementById('settings');
const deviceTimeZoneLabel=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'توقيت الجهاز'}catch{return 'توقيت الجهاز'}};
const deviceClockLabel=()=>{try{return new Intl.DateTimeFormat('ar-EG',{hour:'numeric',minute:'2-digit'}).format(new Date())}catch{return ''}};
async function geoPermissionState(){
  if(!navigator.permissions?.query)return 'unknown';
  try{return (await navigator.permissions.query({name:'geolocation'})).state||'unknown'}catch{return 'unknown'}
}
async function paintPrayerSettingsStatus(){
  const dot=document.getElementById('geo-status-dot'),title=document.getElementById('geo-status-title'),copy=document.getElementById('geo-status-copy'),tz=document.getElementById('device-timezone'),btn=document.getElementById('btn-geo');
  if(tz)tz.textContent=`${deviceTimeZoneLabel()} · الساعة الآن ${deviceClockLabel()} · يُقرأ التوقيت من الهاتف تلقائيًا.`;
  if(!dot||!title||!copy)return;
  const has=!!(settings.lat&&settings.lng),perm=await geoPermissionState();
  dot.classList.toggle('ok',has);dot.classList.toggle('warn',!has);
  if(has){title.textContent='الموقع محفوظ على هذا الجهاز';copy.textContent=`${settings.lat}, ${settings.lng} · الحساب محلي ولا يرسل تدارُك موقعك إلى خادمه.`;if(btn)btn.textContent='تحديث موقعي الحالي'}
  else if(perm==='denied'){title.textContent='إذن الموقع مرفوض';copy.textContent='افتح إعدادات التطبيق/المتصفح واسمح بالموقع، ثم ارجع واضغط تفعيل موقعي.';if(btn)btn.textContent='محاولة تفعيل الموقع'}
  else{title.textContent='الموقع غير مفعّل';copy.textContent='اضغط تفعيل موقعي؛ سيظهر طلب إذن من Android/المتصفح مرة واحدة.';if(btn)btn.textContent='تفعيل موقعي للمواقيت والقبلة'}
}
async function openPrayerSetup(){
  fillSettings();sheet.classList.remove('hide');await paintPrayerSettingsStatus();await paintDataSafetyStatus();
  setTimeout(()=>document.getElementById('prayer-location-field')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
document.getElementById('btn-settings').onclick=async()=>{fillSettings();sheet.classList.remove('hide');await paintPrayerSettingsStatus();await paintDataSafetyStatus()};
document.getElementById('close-settings').onclick=()=>sheet.classList.add('hide');
sheet.onclick=e=>{if(e.target===sheet)sheet.classList.add('hide')};
function fillSettings(){
  document.getElementById('lat').value=settings.lat||'';
  document.getElementById('lng').value=settings.lng||'';
  document.getElementById('method').value=settings.method||'EGYPT';
  document.getElementById('asr').value=settings.asr||'1';
  document.getElementById('khatma').value=settings.khatma||30;
  paintPrayerSettingsStatus();
}
['lat','lng','method','asr','khatma'].forEach(id=>
  document.getElementById(id).addEventListener('change',async e=>{
    settings[id]=e.target.value; await store.set('settings',settings);
    renderNext(); renderTimes(); renderQuran(); paintPrayerLog(); paintPrayerSettingsStatus(); toast('حُفظت الإعدادات') }));

async function requestPrayerLocation(){
  const btn=document.getElementById('btn-geo');
  if(!navigator.geolocation){toast('هذا الجهاز لا يدعم تحديد الموقع');return}
  if(btn){btn.disabled=true;btn.textContent='جارٍ تحديد الموقع…'}
  navigator.geolocation.getCurrentPosition(async p=>{
    settings.lat=p.coords.latitude.toFixed(5);settings.lng=p.coords.longitude.toFixed(5);
    await store.set('settings',settings);fillSettings();renderNext();renderTimes();paintPrayerLog();paintHomePrayer();await paintPrayerSettingsStatus();
    if(btn)btn.disabled=false;toast('تم تفعيل المواقيت والقبلة ✓')
  },async err=>{
    if(btn)btn.disabled=false;await paintPrayerSettingsStatus();
    if(err?.code===1)toast('اسمح بالموقع من إعدادات التطبيق ثم حاول مرة أخرى');
    else if(err?.code===2)toast('فعّل خدمة الموقع GPS ثم حاول مرة أخرى');
    else if(err?.code===3)toast('استغرق تحديد الموقع وقتًا طويلًا — حاول مجددًا');
    else toast('تعذّر تحديد الموقع — يمكنك إدخال الإحداثيات يدويًا')
  },{enableHighAccuracy:true,timeout:15000,maximumAge:10*60*1000});
}
document.getElementById('btn-geo').onclick=requestPrayerLocation;

async function paintDataSafetyStatus(extra=''){
  const el=document.getElementById('data-safety-status');if(!el)return;
  if(!window.RafiqDataSafety){el.className='data-safety-card warn';el.innerHTML='<b>حماية البيانات غير متاحة</b><span>تعذر تحميل طبقة حماية البيانات في هذه الجلسة.</span>';return}
  try{
    const st=await RafiqDataSafety.status(),a=await RafiqDataSafety.audit(false);
    const ok=a.ok&&st.deviceDataVersion===st.currentDataVersion;
    el.className='data-safety-card '+(ok?'ok':'warn');
    const when=st.lastExport?new Date(st.lastExport).toLocaleDateString('ar-EG'):'لم تُنزّل نسخة بعد';
    el.innerHTML=`<b>${ok?'بياناتك جاهزة للتحديث الآمن ✓':'بياناتك تحتاج مراجعة'}</b><span>إصدار البيانات ${AR(st.deviceDataVersion)} · ${AR(a.recordCount)} سجل محلي · آخر نسخة: ${when}${extra?`<br>${extra}`:''}</span>`;
  }catch(e){el.className='data-safety-card warn';el.innerHTML='<b>تعذر فحص البيانات</b><span>بياناتك لم تُحذف. جرّب الفحص مرة أخرى قبل الاستيراد.</span>'}
}

document.getElementById('btn-export').onclick=async()=>{
  if(!window.RafiqDataSafety){toast('طبقة حماية البيانات غير متاحة');return}
  try{await RafiqDataSafety.downloadBackup();await paintDataSafetyStatus('تم تنزيل نسخة كاملة الآن');toast('تم تنزيل نسخة احتياطية كاملة ✓')}
  catch(e){toast(e?.message||'تعذر إنشاء النسخة الاحتياطية')}
};
document.getElementById('btn-import').onclick=()=>document.getElementById('file-in').click();
document.getElementById('btn-data-check')?.addEventListener('click',async()=>{
  if(!window.RafiqDataSafety){toast('طبقة حماية البيانات غير متاحة');return}
  try{const a=await RafiqDataSafety.audit(true);await paintDataSafetyStatus(a.ok?'اكتمل الفحص ولم نجد خللًا بنيويًا':'وجد الفحص بيانات تحتاج مراجعة');toast(a.ok?'فحص البيانات سليم ✓':'وجدنا بيانات تحتاج مراجعة')}
  catch{toast('تعذر فحص البيانات')}
});
document.getElementById('file-in').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    if(!window.RafiqDataSafety)throw new Error('طبقة حماية البيانات غير متاحة');
    const j=JSON.parse(await f.text()),mode=document.getElementById('import-mode')?.value||'replace';
    const r=await RafiqDataSafety.restorePortableBackup(j,mode);
    toast(r.legacy?'تمت استعادة النسخة القديمة وترقيتها بأمان ✓':'تمت استعادة البيانات بأمان ✓');
    e.target.value='';setTimeout(()=>location.reload(),650);
  }catch(err){e.target.value='';toast(err?.message||'الملف غير صالح أو تعذر استعادته')}
};

/* theme */
document.getElementById('btn-profile')?.addEventListener('click',()=>{document.getElementById('profile-panel')?.classList.remove('hide');const a=document.getElementById('profile-edit-age');if(a)a.value=profile.age||'';const gEl=document.querySelector(`input[name="profile-edit-gender"][value="${profile.gender||'male'}"]`);if(gEl)gEl.checked=true;const adv=document.getElementById('profile-edit-issues');if(adv)adv.checked=issuesEnabled();fillLifeProfile()});
document.getElementById('profile-save')?.addEventListener('click',async()=>{const age=+(document.getElementById('profile-edit-age')?.value||0),gender=document.querySelector('input[name="profile-edit-gender"]:checked')?.value,advancedIssues=!!document.getElementById('profile-edit-issues')?.checked;if(!gender||age<10||age>100){toast('أدخل بيانات صحيحة');return}profile={...profile,age,gender,advancedIssues,...readLifeProfile()};await store.set('profile-v1',profile);paintProfileUI();document.getElementById('profile-panel')?.classList.add('hide');toast(genderText('تم تحديث التخصيص','تم تحديث التخصيص'));if(tab==='qalb')hRender()});
document.getElementById('profile-edit-married')?.addEventListener('change',()=>syncKidsVisibility('profile-edit'));
document.getElementById('profile-married')?.addEventListener('change',()=>syncKidsVisibility('profile'));
document.getElementById('profile-close')?.addEventListener('click',()=>document.getElementById('profile-panel')?.classList.add('hide'));
document.getElementById('btn-saved')?.addEventListener('click',openSavedPanel);
document.getElementById('saved-close')?.addEventListener('click',()=>document.getElementById('saved-panel')?.classList.add('hide'));
document.getElementById('saved-list')?.addEventListener('click',async e=>{const d=e.target.closest('[data-saved-del]');if(d){laterItems=laterItems.filter(x=>x.id!==d.dataset.savedDel);await store.set('saved-later-v1',laterItems);updateLaterBadge();renderSavedPanel();return}const o=e.target.closest('[data-saved-open]');if(o&&o.dataset.savedOpen){document.getElementById('saved-panel')?.classList.add('hide');o.dataset.savedOpen==='azkar'?openZikrSection('azkar'):o.dataset.savedOpen==='qalb'?openTazkiyahSection():switchTab(o.dataset.savedOpen)}});
document.addEventListener('click',e=>{const b=e.target.closest('.save-later');if(!b)return;e.preventDefault();e.stopPropagation();toggleLater(b.dataset.later)});

document.getElementById('btn-theme').onclick=async()=>{
  const cur=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',cur);
  settings.theme=cur; await store.set('settings',settings) };

/* ================= first-use intro ================= */
const onboarding=document.getElementById('onboarding'); let onbStep=0;
function paintOnboarding(){document.querySelectorAll('.onb-step').forEach(x=>x.classList.toggle('on',+x.dataset.onb===onbStep));document.querySelectorAll('.onb-dots i').forEach((x,i)=>x.classList.toggle('on',i===onbStep));document.getElementById('onboarding-prev')?.classList.toggle('hide',onbStep===0);const n=document.getElementById('onboarding-next');if(n)n.textContent=onbStep===4?'ابدأ مع تدارُك':'التالي';if(onbStep===2)syncKidsVisibility('profile')}
document.getElementById('onboarding-prev')?.addEventListener('click',()=>{onbStep=Math.max(0,onbStep-1);paintOnboarding()});
document.getElementById('onboarding-next')?.addEventListener('click',async()=>{if(onbStep===1){const age=+(document.getElementById('profile-age')?.value||0),gender=document.querySelector('input[name="profile-gender"]:checked')?.value;if(!gender||age<10||age>100){toast('اختر النوع واكتب عمرًا صحيحًا');return}profile={...profile,age,gender};await store.set('profile-v1',profile);paintProfileUI()}if(onbStep===2){profile={...profile,...readLifeProfile('profile','profile-skills')};await store.set('profile-v1',profile)}if(onbStep===3){profile={...profile,advancedIssues:!!document.getElementById('profile-issues')?.checked};await store.set('profile-v1',profile)}if(onbStep<4){onbStep++;paintOnboarding();return}await store.set('onboarding-seen-v3',true);onboarding?.classList.add('hide');toast(genderText('أهلًا بك في تدارُك','أهلًا بكِ في تدارُك'));hQuery='';if(tab==='qalb')hRender()});

/* ================= boot ================= */
(async function(){
  let safetyBoot=null;
  if(window.RafiqDataSafety){try{safetyBoot=await RafiqDataSafety.init()}catch(e){safetyBoot={ok:false,message:'تعذر بدء حماية البيانات'}}}
  settings=(await store.get('settings'))||{method:'EGYPT',asr:'1',khatma:30};
  qada=(await store.get('qada'))||{};
  profile={age:null,gender:null,advancedIssues:false,married:null,hasKids:null,timeBand:null,moneyBand:null,skills:[],...((await store.get('profile-v1'))||{})};if(!Array.isArray(profile.skills))profile.skills=[];
  paintProfileUI();
  await loadLater();
  if(settings.theme) document.documentElement.setAttribute('data-theme',settings.theme);
  buildMoods(); buildSections(); buildPrayerLog();
  await loadTodo();
  await load(current);
  renderNext(); setInterval(renderNext,1000);
  if(safetyBoot&&safetyBoot.ok===false)setTimeout(()=>toast('تنبيه: أوقف تدارُك ترحيل البيانات حفاظًا على نسختك القديمة'),900);
  const onboardingSeen=await store.get('onboarding-seen-v3');
  if(!onboardingSeen){paintOnboarding();document.getElementById('onboarding')?.classList.remove('hide')}
  const h=(location.hash||'').replace('#','');
  if(h==='tafsir'){quranToolsRequested=true;switchTab('quran')}
  else if(h==='plan'){switchTab('today');setTimeout(()=>document.getElementById('day-plan')?.scrollIntoView({behavior:'smooth',block:'start'}),120)}
  else if(['today','quran','read','azkar','dua','tasbih','asma','sunnah','qalb','irtaqi','history'].includes(h)) switchTab(h);
  else switchTab('today');
})();
