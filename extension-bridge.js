/* Rafiq Chrome extension bridge v1.2: smart search, notebook, daily-plan capture, omnibox/commands and prayer badge. */
(function(){
  if(!globalThis.chrome || !chrome.runtime || !chrome.runtime.id) return;

  const NOTEBOOK_KEY='rafiqNotebook';
  const PREF_KEY='rafiqChromePrefs';
  let rxSmartData=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFKD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ـ/g,'').replace(/[^\u0621-\u063A\u0641-\u064A0-9\s]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();

  async function waitFor(selector,timeout=3000){
    const start=Date.now();
    while(Date.now()-start<timeout){const el=document.querySelector(selector);if(el)return el;await new Promise(r=>setTimeout(r,60))}
    return null;
  }

  async function applySectionSearch(target,query){
    const map={quran:{tab:'quran',selector:'#q-search'},sunnah:{tab:'sunnah',selector:'#rs-search'},asma:{tab:'asma',selector:'#asma-search'}};
    const cfg=map[target];if(!cfg)return;
    if(typeof switchTab==='function') switchTab(cfg.tab);
    const input=await waitFor(cfg.selector);
    if(input){input.value=query;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();try{scrollTo({top:0,behavior:'smooth'})}catch{}}
  }

  async function loadSmartData(){
    if(rxSmartData)return rxSmartData;
    const [q,r,a]=await Promise.all([
      fetch('./quran.json').then(x=>x.json()),fetch('./riyad.json').then(x=>x.json()),fetch('./asma.json').then(x=>x.json())
    ]);
    rxSmartData={q,r,a};return rxSmartData;
  }

  function ensureStyles(){
    if(document.getElementById('rafiq-ext-style'))return;
    const s=document.createElement('style');s.id='rafiq-ext-style';s.textContent=`
      .rx-sheet{position:fixed;inset:0;background:rgba(20,28,18,.48);z-index:90;display:grid;align-items:end}
      .rx-sheet.hide{display:none}.rx-box{background:var(--card,#fff);color:var(--ink,#222);border-radius:22px 22px 0 0;max-height:88vh;overflow:auto;max-width:680px;margin:0 auto;width:100%;padding:0 14px 24px;box-shadow:0 -8px 34px rgba(0,0,0,.15)}
      .rx-head{position:sticky;top:0;background:var(--card,#fff);z-index:2;display:flex;align-items:center;gap:10px;justify-content:space-between;padding:14px 2px 11px;border-bottom:1px solid var(--line,#ddd)}
      .rx-head h2{font-family:Amiri,serif;font-size:22px;margin:0;color:var(--deep,#3F5C34)}.rx-close{border:0;background:none;font-size:20px;color:var(--deep,#3F5C34);cursor:pointer}
      .rx-search{width:100%;margin:12px 0 4px;padding:11px 13px;border:1px solid var(--line,#ddd);border-radius:12px;background:var(--paper,#fafafa);color:inherit;font-family:inherit}
      .rx-count{font-size:11px;color:var(--soft,#777);margin:2px 1px 10px}.rx-group{margin:12px 0}.rx-gtitle{display:flex;justify-content:space-between;gap:8px;color:var(--deep,#3F5C34);font-weight:600;font-size:13px;margin-bottom:7px}
      .rx-item{display:block;width:100%;text-align:start;border:1px solid var(--line,#ddd);background:var(--card,#fff);border-radius:13px;padding:10px 11px;margin:7px 0;cursor:pointer;color:inherit}.rx-item:hover{background:var(--wash,#f3f6f0)}
      .rx-src{font-size:10.5px;color:var(--gold,#9a7a2e);margin-bottom:4px}.rx-txt{font-size:12.5px;line-height:1.8;max-height:4.9em;overflow:hidden}.rx-empty{font-size:12px;color:var(--soft,#777);padding:12px;text-align:center}
      .rx-actions{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}.rx-btn{border:1px solid var(--line,#ddd);background:var(--wash,#f3f6f0);color:var(--deep,#3F5C34);border-radius:999px;padding:7px 10px;font-family:inherit;cursor:pointer;font-size:11.5px}.rx-btn.primary{background:var(--deep,#3F5C34);color:white;border-color:var(--deep,#3F5C34)}
      .rx-note{border:1px solid var(--line,#ddd);border-radius:14px;padding:11px;margin:9px 0;background:var(--card,#fff)}.rx-note .meta{font-size:10px;color:var(--gold,#9a7a2e);margin-bottom:5px}.rx-note .text{font-size:13px;line-height:1.8;white-space:pre-wrap}.rx-note .source{font-size:10.5px;color:var(--soft,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:6px}.rx-note a{color:var(--deep,#3F5C34);text-decoration:none}
      .rx-row{display:flex;gap:8px;align-items:center;justify-content:space-between;border-top:1px solid var(--line,#ddd);padding:11px 0}.rx-row label{font-size:12.5px}.rx-row small{display:block;color:var(--soft,#777);font-size:10.5px;margin-top:2px}.rx-row input[type=checkbox]{width:18px;height:18px}
      .rx-ta{width:100%;min-height:74px;resize:vertical;border:1px solid var(--line,#ddd);border-radius:12px;padding:10px;background:var(--paper,#fafafa);color:inherit;font-family:inherit;line-height:1.7}
      #btn-rafiq-notebook svg{width:20px;height:20px;display:block}
    `;document.head.appendChild(s);
  }

  function ensureNotebookButton(){
    if(document.getElementById('btn-rafiq-notebook'))return;
    const feedback=document.getElementById('btn-feedback');if(!feedback)return;
    const b=document.createElement('button');b.className='icon';b.id='btn-rafiq-notebook';b.title='دفتر رفيق';b.setAttribute('aria-label','دفتر رفيق');
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22z"/><path d="M5 4.5V22M9 6h7M9 10h7"/></svg>';
    feedback.parentElement.insertBefore(b,feedback);b.onclick=showNotebook;
  }

  function makeSheet(id,title){
    let sh=document.getElementById(id);if(sh)return sh;
    sh=document.createElement('div');sh.id=id;sh.className='rx-sheet hide';sh.innerHTML=`<div class="rx-box"><div class="rx-head"><h2>${esc(title)}</h2><button class="rx-close" aria-label="إغلاق">✕</button></div><div class="rx-body"></div></div>`;
    sh.querySelector('.rx-close').onclick=()=>sh.classList.add('hide');sh.onclick=e=>{if(e.target===sh)sh.classList.add('hide')};document.body.appendChild(sh);return sh;
  }

  async function showNotebook(){
    ensureStyles();const sh=makeSheet('rafiq-notebook-sheet','دفتر رفيق');sh.classList.remove('hide');
    const body=sh.querySelector('.rx-body');
    const data=await chrome.storage.local.get([NOTEBOOK_KEY,PREF_KEY]);let list=Array.isArray(data[NOTEBOOK_KEY])?data[NOTEBOOK_KEY]:[];const prefs=data[PREF_KEY]||{badge:true,notifications:false};
    body.innerHTML=`
      <div class="rx-row"><div><label>الصلاة القادمة على أيقونة رفيق</label><small>يظهر الوقت المتبقي كبادج صغير على أيقونة الإضافة.</small></div><input id="rx-badge" type="checkbox" ${prefs.badge!==false?'checked':''}></div>
      <div class="rx-row"><div><label>تنبيه هادئ عند دخول وقت الصلاة</label><small>اختياري، ولا يعمل إلا بعد موافقتك على إذن الإشعارات.</small></div><input id="rx-notify" type="checkbox" ${prefs.notifications?'checked':''}></div>
      <textarea class="rx-ta" id="rx-manual" maxlength="1200" placeholder="أضف ملاحظة شخصية إلى دفتر رفيق…"></textarea><div class="rx-actions"><button class="rx-btn primary" id="rx-add-note">حفظ الملاحظة</button></div>
      <input class="rx-search" id="rx-note-search" type="search" placeholder="ابحث في دفتر رفيق…"><div class="rx-count" id="rx-note-count"></div><div id="rx-note-list"></div>`;

    const savePrefs=async()=>{
      let notifications=body.querySelector('#rx-notify').checked;
      if(notifications){
        const has=await chrome.permissions.contains({permissions:['notifications']});
        if(!has){const granted=await chrome.permissions.request({permissions:['notifications']});if(!granted){notifications=false;body.querySelector('#rx-notify').checked=false}}
      }
      const p={badge:body.querySelector('#rx-badge').checked,notifications};await chrome.storage.local.set({[PREF_KEY]:p});chrome.runtime.sendMessage({type:'RAFIQ_PREFS_CHANGED',payload:p});
    };
    body.querySelector('#rx-badge').onchange=savePrefs;body.querySelector('#rx-notify').onchange=savePrefs;

    const render=()=>{
      const q=norm(body.querySelector('#rx-note-search').value),shown=q?list.filter(x=>norm(`${x.text} ${x.note||''} ${x.title||''}`).includes(q)):list;
      body.querySelector('#rx-note-count').textContent=`${shown.length.toLocaleString('ar-EG')} عنصر محفوظ`;
      body.querySelector('#rx-note-list').innerHTML=shown.length?shown.map(x=>`<div class="rx-note" data-id="${esc(x.id)}"><div class="meta">${new Intl.DateTimeFormat('ar-EG',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x.createdAt||Date.now()))}</div><div class="text">${esc(x.text)}</div>${x.url?`<div class="source"><a href="${esc(x.url)}" target="_blank" rel="noreferrer">${esc(x.title||x.url)}</a></div>`:''}<div class="rx-actions"><button class="rx-btn" data-copy="${esc(x.id)}">نسخ</button><button class="rx-btn" data-search="${esc(x.id)}">ابحث عنه</button><button class="rx-btn" data-del="${esc(x.id)}">حذف</button></div></div>`).join(''):'<div class="rx-empty">دفترك فارغ. ظلّل أي نص في أي صفحة ثم كليك يمين ← «احفظ النص في دفتر رفيق».</div>';
    };
    body.querySelector('#rx-note-search').oninput=render;
    body.querySelector('#rx-add-note').onclick=async()=>{const ta=body.querySelector('#rx-manual'),text=ta.value.trim();if(!text)return;list.unshift({id:String(Date.now()),text,title:'ملاحظة شخصية',url:'',note:'',createdAt:Date.now()});await chrome.storage.local.set({[NOTEBOOK_KEY]:list});ta.value='';render();if(typeof toast==='function')toast('حُفظت في دفتر رفيق')};
    body.querySelector('#rx-note-list').onclick=async e=>{
      const del=e.target.closest('[data-del]'),cp=e.target.closest('[data-copy]'),sr=e.target.closest('[data-search]');
      if(del){list=list.filter(x=>x.id!==del.dataset.del);await chrome.storage.local.set({[NOTEBOOK_KEY]:list});render();return}
      const id=(cp&&cp.dataset.copy)||(sr&&sr.dataset.search),item=list.find(x=>x.id===id);if(!item)return;
      if(cp){await navigator.clipboard.writeText(item.text);if(typeof toast==='function')toast('نُسخ النص')}
      if(sr){sh.classList.add('hide');showSmartSearch(item.text)}
    };
    render();
  }

  async function showSmartSearch(query=''){
    ensureStyles();const sh=makeSheet('rafiq-smart-sheet','بحث رفيق');sh.classList.remove('hide');const body=sh.querySelector('.rx-body');
    body.innerHTML=`<input class="rx-search" id="rx-smart-input" type="search" placeholder="ابحث في القرآن والحديث والأسماء…" value="${esc(query)}"><div class="rx-count" id="rx-smart-count">اكتب كلمة أو عبارة</div><div id="rx-smart-results"></div>`;
    const input=body.querySelector('#rx-smart-input'),out=body.querySelector('#rx-smart-results'),count=body.querySelector('#rx-smart-count');
    const data=await loadSmartData();
    const run=()=>{
      const raw=input.value.trim(),q=norm(raw);if(!q){out.innerHTML='';count.textContent='اكتب كلمة أو عبارة';return}
      const qr=[];let qCount=0;for(const s of data.q.suras||[]){for(let i=0;i<s.a.length;i++){if(norm(s.a[i]).includes(q)){qCount++;if(qr.length<5)qr.push({source:`${s.name} — آية ${i+1}`,text:s.a[i]})}}}
      const hr=[];let hCount=0;for(const b of data.r.books||[]){for(const h of b.items||[]){if(norm(`${b.name} ${h.n} ${h.t}`).includes(q)){hCount++;if(hr.length<5)hr.push({source:`${b.name} — حديث ${h.n}`,text:h.t})}}}
      const ar=[];let aCount=0;for(const n of data.a.names||[]){if(norm(`${n.name} ${n.meaning} ${n.impact}`).includes(q)){aCount++;if(ar.length<8)ar.push(n)}}
      count.textContent=`${(qCount+hCount+aCount).toLocaleString('ar-EG')} نتيجة في رفيق`;
      const group=(title,n,target,items,renderer)=>`<div class="rx-group"><div class="rx-gtitle"><span>${title}</span><span>${n.toLocaleString('ar-EG')}</span></div>${items.length?items.map(renderer).join(''):'<div class="rx-empty">لا توجد نتائج هنا.</div>'}${n?`<button class="rx-btn" data-open-target="${target}">عرض كل النتائج</button>`:''}</div>`;
      out.innerHTML=group('القرآن',qCount,'quran',qr,x=>`<button class="rx-item" data-open-target="quran"><div class="rx-src">${esc(x.source)}</div><div class="rx-txt">${esc(x.text)}</div></button>`)+group('رياض الصالحين',hCount,'sunnah',hr,x=>`<button class="rx-item" data-open-target="sunnah"><div class="rx-src">${esc(x.source)}</div><div class="rx-txt">${esc(x.text)}</div></button>`)+group('أسماء الله الحسنى',aCount,'asma',ar,x=>`<button class="rx-item" data-asma-id="${x.n}"><div class="rx-src">الاسم ${x.n}</div><div class="rx-txt"><b>${esc(x.name)}</b> — ${esc(x.meaning)}</div></button>`);
      out.onclick=e=>{const as=e.target.closest('[data-asma-id]'),op=e.target.closest('[data-open-target]');sh.classList.add('hide');if(as&&typeof hAsmaDetail==='function'){if(typeof switchTab==='function')switchTab('asma');hAsmaDetail(+as.dataset.asmaId);return}if(op)applySectionSearch(op.dataset.openTarget,raw)};
    };
    input.oninput=run;run();setTimeout(()=>input.focus(),80);
  }


  async function openDailyPlan(){
    try{
      if(globalThis.RafiqPlan?.open){globalThis.RafiqPlan.open();return}
      if(typeof switchTab==='function')switchTab('today');
      setTimeout(()=>document.getElementById('day-plan')?.scrollIntoView({behavior:'smooth',block:'start'}),100);
    }catch(e){}
  }

  async function addBrowserTodo(text){
    const clean=String(text||'').trim().slice(0,180);if(!clean)return;
    try{
      if(globalThis.RafiqPlan?.addTask){
        await globalThis.RafiqPlan.addTask(clean,{source:'chrome-selection'});
      }else if(typeof store!=='undefined'){
        const list=(await store.get('todo-items'))||[],d=new Date(),due=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        list.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:clean,due,important:false,done:false,created:Date.now(),source:'chrome-selection'});
        await store.set('todo-items',list);
        if(typeof loadTodo==='function')await loadTodo();
      }
      await openDailyPlan();
      if(typeof toast==='function')toast('أُضيف النص إلى مهام اليوم');
    }catch(e){}
  }

  async function applySearch(payload){
    if(!payload||!payload.query)return;
    if(payload.target==='smart'){await showSmartSearch(payload.query);return}
    await applySectionSearch(payload.target,payload.query);
  }

  async function publishPrayerConfig(){
    try{
      if(typeof settings==='undefined'||!settings)return;
      const payload={lat:settings.lat||'',lng:settings.lng||'',method:settings.method||'EGYPT',asr:settings.asr||'1'};
      chrome.runtime.sendMessage({type:'RAFIQ_PRAYER_CONFIG',payload});
    }catch(e){}
  }

  chrome.runtime.onMessage.addListener(msg=>{
    if(msg&&msg.type==='RAFIQ_SEARCH')applySearch(msg.payload);
    if(msg&&msg.type==='RAFIQ_OPEN_NOTEBOOK')showNotebook();
    if(msg&&msg.type==='RAFIQ_FOCUS_SEARCH')showSmartSearch('');
    if(msg&&msg.type==='RAFIQ_OPEN_PLAN')openDailyPlan();
    if(msg&&msg.type==='RAFIQ_ADD_TODO')addBrowserTodo(msg.payload?.text||msg.payload||'');
  });

  Promise.all([chrome.storage.session.get('pendingSearch'),chrome.storage.session.get('openNotebook'),chrome.storage.session.get('focusRafiqSearch'),chrome.storage.session.get('pendingTodo'),chrome.storage.session.get('openDailyPlan')]).then(async([a,b,c,d,e])=>{
    if(a.pendingSearch){await applySearch(a.pendingSearch);await chrome.storage.session.remove('pendingSearch')}
    if(b.openNotebook){await showNotebook();await chrome.storage.session.remove('openNotebook')}
    if(c.focusRafiqSearch){await showSmartSearch('');await chrome.storage.session.remove('focusRafiqSearch')}
    if(d.pendingTodo){setTimeout(()=>addBrowserTodo(d.pendingTodo.text||d.pendingTodo),700);await chrome.storage.session.remove('pendingTodo')}
    if(e.openDailyPlan){setTimeout(openDailyPlan,500);await chrome.storage.session.remove('openDailyPlan')}
  }).catch(()=>{});

  ensureStyles();ensureNotebookButton();
  let lastCfg='';setInterval(()=>{try{const cur=typeof settings==='undefined'?'':JSON.stringify([settings.lat,settings.lng,settings.method,settings.asr]);if(cur&&cur!==lastCfg){lastCfg=cur;publishPrayerConfig()}}catch{}},5000);
  setTimeout(publishPrayerConfig,1200);
})();
