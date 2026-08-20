/* Rafiq Data Safety Layer v2 — local-first backup, validation and migration guard. */
(function(){
  'use strict';

  const CURRENT_DATA_VERSION=2;
  const BACKUP_FORMAT='rafiq-backup';
  const BACKUP_VERSION=1;
  const DATA_VERSION_KEY='rafiq:data-version';
  const SAFETY_SNAPSHOT_KEY='rafiq:safety-snapshot:v1';
  const LAST_EXPORT_KEY='rafiq:last-export-at';
  const LAST_AUDIT_KEY='rafiq:last-audit';
  const EXT_SAFETY_SNAPSHOT_KEY='rafiqSafetyExtensionSnapshot';

  const EXACT_KEYS=[
    'settings','qada','profile-v1','onboarding-seen-v3','saved-later-v1','todo-items','quran-pos','tafsir-pos-v1',
    'dua-fav','my-duas','rs-fav','qalb-track','qalb-journal','qalb-prog','qalb-paths-v1','qalb-levels-v1',
    'deed-skip','khabia','irt-hist','irt-plan','irt-done','irt-journey'
  ];
  const PREFIX_KEYS=['day:','tas:'];
  const RAW_LOCAL_KEYS=['qFont'];
  const EXTENSION_KEYS=['rafiqNotebook','rafiqChromePrefs','rafiqPrayerConfig','rafiqLastPrayerNotification'];

  const EXPECTED={
    'settings':'object','qada':'object','profile-v1':'object','saved-later-v1':'array','todo-items':'array',
    'quran-pos':'object','tafsir-pos-v1':'object','dua-fav':'array','my-duas':'array','rs-fav':'array','qalb-track':'object',
    'qalb-journal':'object','qalb-prog':'object','qalb-paths-v1':'array','qalb-levels-v1':'object','khabia':'object','irt-hist':'array',
    'irt-plan':'array','irt-done':'object','irt-journey':'object'
  };

  let lastStatus={ok:true,dataVersion:0,message:'لم يبدأ الفحص بعد'};

  const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const typeOk=(v,t)=>t==='array'?Array.isArray(v):t==='object'?isObject(v):true;
  const byteSize=s=>{try{return new Blob([s]).size}catch{return String(s).length}};

  async function sha256(text){
    try{
      if(!globalThis.crypto?.subtle)return null;
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch{return null}
  }

  function canonical(v){
    if(Array.isArray(v))return v.map(canonical);
    if(isObject(v))return Object.keys(v).sort().reduce((o,k)=>{o[k]=canonical(v[k]);return o},{});
    return v;
  }
  const stableStringify=v=>JSON.stringify(canonical(v));

  const adapter={
    async read(k){
      if(window.storage){
        try{
          const r=await window.storage.get(k,false);
          if(!r)return {exists:false,value:null,raw:null,error:null};
          const raw=r.value;
          try{return {exists:true,value:JSON.parse(raw),raw,error:null}}
          catch(e){return {exists:true,value:null,raw,error:String(e)}}
        }catch(e){return {exists:false,value:null,raw:null,error:String(e)}}
      }
      const raw=localStorage.getItem(k);
      if(raw===null)return {exists:false,value:null,raw:null,error:null};
      try{return {exists:true,value:JSON.parse(raw),raw,error:null}}
      catch(e){return {exists:true,value:null,raw,error:String(e)}}
    },
    async get(k){const r=await this.read(k);return r.error?null:r.value},
    async set(k,v){
      const raw=JSON.stringify(v);
      if(window.storage){try{await window.storage.set(k,raw,false);return}catch{}}
      localStorage.setItem(k,raw);
    },
    async setRaw(k,raw){
      if(window.storage){try{await window.storage.set(k,String(raw),false);return}catch{}}
      localStorage.setItem(k,String(raw));
    },
    async remove(k){
      if(window.storage){
        try{if(typeof window.storage.delete==='function'){await window.storage.delete(k,false);return}}catch{}
        try{if(typeof window.storage.remove==='function'){await window.storage.remove(k,false);return}}catch{}
        try{await window.storage.set(k,'null',false);return}catch{}
      }
      localStorage.removeItem(k);
    },
    async keys(prefix=''){
      if(window.storage){try{const r=await window.storage.list(prefix,false);return r?.keys||[]}catch{return[]}}
      return Object.keys(localStorage).filter(k=>k.startsWith(prefix));
    }
  };

  async function registeredKeys(){
    const set=new Set(EXACT_KEYS);
    for(const p of PREFIX_KEYS){for(const k of await adapter.keys(p))set.add(k)}
    return [...set];
  }

  async function collectAppData(){
    const records={},unparsed={};
    for(const k of await registeredKeys()){
      const r=await adapter.read(k);
      if(!r.exists)continue;
      if(r.error)unparsed[k]=r.raw;
      else if(r.value!==null)records[k]=r.value;
    }
    const rawLocal={};
    for(const k of RAW_LOCAL_KEYS){const v=localStorage.getItem(k);if(v!==null)rawLocal[k]=v}
    return {records,unparsed,rawLocal};
  }

  async function collectExtensionData(){
    try{
      if(!globalThis.chrome?.storage?.local)return {};
      return await chrome.storage.local.get(EXTENSION_KEYS);
    }catch{return {}}
  }

  function validateRecords(records,unparsed={}){
    const errors=[],warnings=[];
    for(const k of Object.keys(unparsed))errors.push(`${k}: قيمة غير قابلة للقراءة`);
    for(const [k,t] of Object.entries(EXPECTED)){
      if(Object.prototype.hasOwnProperty.call(records,k)&&!typeOk(records[k],t))errors.push(`${k}: بنية غير متوقعة`);
    }
    for(const [k,v] of Object.entries(records)){
      if(k.startsWith('day:')&&!isObject(v))errors.push(`${k}: سجل يوم غير صالح`);
      if(k.startsWith('tas:')&&!isObject(v)&&k!=='tas:cfg'&&k!=='tas:custom')warnings.push(`${k}: راجع بيانات السبحة`);
    }
    return {ok:errors.length===0,errors,warnings};
  }

  async function createSafetySnapshot(reason='before-migration',includeExtension=false){
    const app=await collectAppData();
    const snapshot={
      format:'rafiq-safety-snapshot',version:1,reason,createdAt:new Date().toISOString(),
      dataVersion:+(await adapter.get(DATA_VERSION_KEY)||0),records:app.records,unparsed:app.unparsed,rawLocal:app.rawLocal
    };
    const validation=validateRecords(snapshot.records,snapshot.unparsed);
    snapshot.validation=validation;
    await adapter.set(SAFETY_SNAPSHOT_KEY,snapshot);
    if(includeExtension){
      const extension=await collectExtensionData();snapshot.extension=extension;
      try{if(globalThis.chrome?.storage?.local)await chrome.storage.local.set({[EXT_SAFETY_SNAPSHOT_KEY]:extension})}catch{}
    }
    return snapshot;
  }

  async function clearAppUserData(){
    for(const k of await registeredKeys())await adapter.remove(k);
    for(const k of RAW_LOCAL_KEYS)localStorage.removeItem(k);
  }

  async function restoreSnapshot(snapshot){
    if(!snapshot||!isObject(snapshot.records))throw new Error('invalid snapshot');
    await clearAppUserData();
    for(const [k,v] of Object.entries(snapshot.records))await adapter.set(k,v);
    for(const [k,raw] of Object.entries(snapshot.unparsed||{}))await adapter.setRaw(k,raw);
    for(const [k,v] of Object.entries(snapshot.rawLocal||{}))localStorage.setItem(k,String(v));
    await adapter.set(DATA_VERSION_KEY,+snapshot.dataVersion||0);
    try{
      if(globalThis.chrome?.storage?.local){
        let ext=snapshot.extension;
        if(!ext){const x=await chrome.storage.local.get(EXT_SAFETY_SNAPSHOT_KEY);ext=x?.[EXT_SAFETY_SNAPSHOT_KEY]}
        if(isObject(ext)){await chrome.storage.local.remove(EXTENSION_KEYS);await chrome.storage.local.set(ext)}
      }
    }catch{}
  }

  const MIGRATIONS={
    1:async()=>{
      // v0 -> v1 deliberately does not rewrite legacy user data. It only registers the schema version.
      return true;
    },
    2:async()=>{
      // v1 -> v2 is additive only: day records may now include goal/target/goalReview,
      // and todo items may include final review metadata. Existing records remain valid as-is.
      return true;
    }
  };

  async function init(){
    let version=+(await adapter.get(DATA_VERSION_KEY)||0);
    if(version>CURRENT_DATA_VERSION){
      lastStatus={ok:false,dataVersion:version,message:'بيانات هذا الجهاز أُنشئت بإصدار أحدث من طبقة البيانات.'};
      return lastStatus;
    }
    if(version===CURRENT_DATA_VERSION){
      const audit=await auditData(false);
      lastStatus={ok:audit.ok,dataVersion:version,message:audit.ok?'طبقة حماية البيانات جاهزة':'توجد بيانات تحتاج مراجعة',audit};
      return lastStatus;
    }

    let snapshot=null;
    try{
      const before=await collectAppData();
      const hasUserData=Object.keys(before.records).length||Object.keys(before.unparsed).length||Object.keys(before.rawLocal).length;
      if(hasUserData)snapshot=await createSafetySnapshot('before-data-version-'+CURRENT_DATA_VERSION);
      for(let next=version+1;next<=CURRENT_DATA_VERSION;next++){
        const fn=MIGRATIONS[next];
        if(typeof fn!=='function')throw new Error('missing migration '+next);
        await fn();
        await adapter.set(DATA_VERSION_KEY,next);
        version=next;
      }
      const audit=await auditData(false);
      if(!audit.ok)throw new Error('post-migration validation failed');
      lastStatus={ok:true,dataVersion:version,message:snapshot?'تمت حماية بياناتك القديمة وربطها بنظام التحديث الآمن':'طبقة حماية البيانات جاهزة',audit};
      return lastStatus;
    }catch(e){
      try{if(snapshot)await restoreSnapshot(snapshot)}catch{}
      lastStatus={ok:false,dataVersion:version,message:'أوقف رفيق ترحيل البيانات حفاظًا على النسخة القديمة.',error:String(e)};
      return lastStatus;
    }
  }

  async function auditData(save=true){
    const app=await collectAppData();
    const validation=validateRecords(app.records,app.unparsed);
    const result={
      ok:validation.ok,errors:validation.errors,warnings:validation.warnings,
      recordCount:Object.keys(app.records).length,
      dayCount:Object.keys(app.records).filter(k=>k.startsWith('day:')).length,
      tasbihCount:Object.keys(app.records).filter(k=>k.startsWith('tas:')).length,
      savedCount:Array.isArray(app.records['saved-later-v1'])?app.records['saved-later-v1'].length:0,
      pathCount:Array.isArray(app.records['qalb-paths-v1'])?app.records['qalb-paths-v1'].length:0,
      dataVersion:+(await adapter.get(DATA_VERSION_KEY)||0),checkedAt:new Date().toISOString()
    };
    if(save){try{await adapter.set(LAST_AUDIT_KEY,result)}catch{}}
    return result;
  }

  async function createPortableBackup(){
    const app=await collectAppData();
    const validation=validateRecords(app.records,app.unparsed);
    if(!validation.ok)throw new Error('تعذّر التصدير لأن بعض البيانات غير قابلة للقراءة. استخدم فحص البيانات أولًا.');
    const extension=await collectExtensionData();
    const core={
      format:BACKUP_FORMAT,backupVersion:BACKUP_VERSION,appVersion:'24.6.0',
      dataVersion:+(await adapter.get(DATA_VERSION_KEY)||CURRENT_DATA_VERSION),createdAt:new Date().toISOString(),
      origin:location.origin,records:app.records,rawLocal:app.rawLocal,extension,
      summary:{recordCount:Object.keys(app.records).length,dayCount:Object.keys(app.records).filter(k=>k.startsWith('day:')).length}
    };
    const checksum=await sha256(stableStringify(core));
    const out={...core,integrity:{algorithm:checksum?'SHA-256':'none',checksum}};
    await adapter.set(LAST_EXPORT_KEY,out.createdAt);
    return out;
  }

  function legacyToNew(j){
    const records={};
    if(j.settings)records.settings=j.settings;
    if(j.qada)records.qada=j.qada;
    if(j.profile)records['profile-v1']=j.profile;
    if(Array.isArray(j.savedLater))records['saved-later-v1']=j.savedLater;
    if(Array.isArray(j.qalbPaths))records['qalb-paths-v1']=j.qalbPaths;
    if(j.todo)records['todo-items']=j.todo;
    if(j.irtHist)records['irt-hist']=j.irtHist;
    if(j.irtJourney)records['irt-journey']=j.irtJourney;
    if(j.irtDone)records['irt-done']=j.irtDone;
    for(const [k,v] of Object.entries(j.days||{}))if(k.startsWith('day:'))records[k]=v;
    return {format:'rafiq-legacy-backup',backupVersion:0,dataVersion:0,createdAt:null,records,rawLocal:{},extension:{},integrity:null};
  }

  function normalizeBackup(j){
    if(!isObject(j))throw new Error('ملف النسخة الاحتياطية غير صالح.');
    if(j.format===BACKUP_FORMAT&&isObject(j.records))return j;
    if(j.settings||j.days||j.savedLater||j.qalbPaths)return legacyToNew(j);
    throw new Error('هذا الملف ليس نسخة احتياطية معروفة لرفيق.');
  }

  async function verifyBackup(j){
    const b=normalizeBackup(j);
    if(b.integrity?.algorithm==='SHA-256'&&b.integrity.checksum){
      const {integrity,...core}=b;
      const now=await sha256(stableStringify(core));
      if(now&&now!==integrity.checksum)throw new Error('فشل فحص سلامة الملف؛ قد يكون تالفًا أو تم تعديله.');
    }
    const validation=validateRecords(b.records||{},{});
    if(!validation.ok)throw new Error('بنية بعض بيانات النسخة الاحتياطية غير صالحة.');
    return b;
  }

  function mergeValue(current,incoming){
    if(current===null||current===undefined)return incoming;
    if(Array.isArray(current)&&Array.isArray(incoming)){
      const seen=new Set(),out=[];
      const idOf=x=>isObject(x)&&('id'in x||'key'in x)?String(x.id??x.key):stableStringify(x);
      for(const x of [...current,...incoming]){const id=idOf(x);if(!seen.has(id)){seen.add(id);out.push(x)}}
      return out;
    }
    if(isObject(current)&&isObject(incoming)){
      const out={...incoming,...current};
      for(const k of Object.keys(out))if(k in current&&k in incoming)out[k]=mergeValue(current[k],incoming[k]);
      return out;
    }
    return current;
  }

  async function restorePortableBackup(input,mode='replace'){
    const b=await verifyBackup(input);
    const safety=await createSafetySnapshot('before-import',true);
    const effectiveMode=b.format==='rafiq-legacy-backup'?'merge':mode;
    try{
      if(effectiveMode==='replace')await clearAppUserData();
      for(const [k,incoming] of Object.entries(b.records||{})){
        if(!EXACT_KEYS.includes(k)&&!PREFIX_KEYS.some(p=>k.startsWith(p)))continue;
        if(effectiveMode==='merge'){
          const current=await adapter.get(k);
          await adapter.set(k,mergeValue(current,incoming));
        }else await adapter.set(k,incoming);
      }
      for(const [k,v] of Object.entries(b.rawLocal||{}))if(RAW_LOCAL_KEYS.includes(k)){
        if(effectiveMode==='merge'&&localStorage.getItem(k)!==null)continue;
        localStorage.setItem(k,String(v));
      }
      if(globalThis.chrome?.storage?.local&&isObject(b.extension)){
        const clean={};for(const k of EXTENSION_KEYS)if(k in b.extension)clean[k]=b.extension[k];
        if(Object.keys(clean).length){
          if(effectiveMode==='merge'){
            const cur=await chrome.storage.local.get(EXTENSION_KEYS);
            for(const [k,v] of Object.entries(clean))if(cur[k]===undefined)cur[k]=v;
            await chrome.storage.local.set(cur);
          }else{await chrome.storage.local.remove(Object.keys(clean));await chrome.storage.local.set(clean)}
        }
      }
      await adapter.set(DATA_VERSION_KEY,+b.dataVersion||0);
      const migrated=await init();
      if(!migrated.ok)throw new Error('تعذر ترحيل النسخة بعد الاستيراد.');
      const audit=await auditData(true);
      if(!audit.ok)throw new Error('فشل فحص البيانات بعد الاستيراد.');
      return {ok:true,audit,legacy:b.format==='rafiq-legacy-backup',mode:effectiveMode};
    }catch(e){
      try{await restoreSnapshot(safety)}catch{}
      throw e;
    }
  }

  async function downloadBackup(){
    const out=await createPortableBackup();
    const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    const d=new Date().toISOString().slice(0,10);
    a.download=`rafiq-backup-${d}.json`;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    return out;
  }

  async function status(){
    const version=+(await adapter.get(DATA_VERSION_KEY)||0);
    const lastExport=await adapter.get(LAST_EXPORT_KEY);
    const lastAudit=await adapter.get(LAST_AUDIT_KEY);
    const snap=await adapter.get(SAFETY_SNAPSHOT_KEY);
    return {currentDataVersion:CURRENT_DATA_VERSION,deviceDataVersion:version,lastExport,lastAudit,lastSnapshot:snap?.createdAt||null,lastStatus};
  }

  window.RafiqDataSafety={
    CURRENT_DATA_VERSION,init,audit:auditData,createPortableBackup,downloadBackup,restorePortableBackup,
    createSafetySnapshot,status,validateRecords,registry:{exact:[...EXACT_KEYS],prefixes:[...PREFIX_KEYS],rawLocal:[...RAW_LOCAL_KEYS],extension:[...EXTENSION_KEYS]},
    estimateBackupBytes:async()=>byteSize(JSON.stringify(await createPortableBackup()))
  };
})();
