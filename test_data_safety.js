const path=require('path');
class LSCore{
  constructor(){this.m=new Map()}
  getItem(k){return this.m.has(k)?this.m.get(k):null}
  setItem(k,v){this.m.set(String(k),String(v))}
  removeItem(k){this.m.delete(String(k))}
  clear(){this.m.clear()}
}
const core=new LSCore();
const localStorage=new Proxy(core,{ownKeys:t=>[...t.m.keys()],getOwnPropertyDescriptor:(t,p)=>t.m.has(p)?{enumerable:true,configurable:true}:Object.getOwnPropertyDescriptor(t,p),get:(t,p,r)=>Reflect.get(t,p,r)});
global.window=global;global.localStorage=localStorage;global.location={origin:'https://example.test'};global.crypto=require('crypto').webcrypto;global.Blob=Blob;global.TextEncoder=TextEncoder;
require('../app/data-safety.js');
(async()=>{
  localStorage.setItem('settings',JSON.stringify({khatma:30}));
  localStorage.setItem('saved-later-v1',JSON.stringify([{id:'a',title:'x'}]));
  localStorage.setItem('day:2026-08-19',JSON.stringify({pages:3}));
  localStorage.setItem('qFont','25');
  let r=await RafiqDataSafety.init(); if(!r.ok)throw new Error('init failed '+JSON.stringify(r));
  if(JSON.parse(localStorage.getItem('rafiq:data-version'))!==1)throw new Error('version not set');
  const b=await RafiqDataSafety.createPortableBackup();
  if(!b.integrity?.checksum)throw new Error('checksum missing');
  localStorage.setItem('saved-later-v1',JSON.stringify([{id:'changed'}]));
  localStorage.setItem('day:2026-08-20',JSON.stringify({pages:9}));
  await RafiqDataSafety.restorePortableBackup(b,'replace');
  const saved=JSON.parse(localStorage.getItem('saved-later-v1'));
  if(saved.length!==1||saved[0].id!=='a')throw new Error('restore saved failed');
  if(localStorage.getItem('day:2026-08-20')!==null)throw new Error('replace did not clear extra dynamic key');
  if(localStorage.getItem('qFont')!=='25')throw new Error('raw local restore failed');
  // Legacy backups must merge rather than delete data omitted by the old format.
  localStorage.setItem('my-duas',JSON.stringify([{t:'keep'}]));
  const legacy={settings:{khatma:40},savedLater:[{id:'b'}],days:{'day:2026-08-18':{pages:1}}};
  const rr=await RafiqDataSafety.restorePortableBackup(legacy,'replace');
  if(rr.mode!=='merge'||!rr.legacy)throw new Error('legacy safety mode failed');
  if(!JSON.parse(localStorage.getItem('my-duas')).length)throw new Error('legacy import erased newer data');
  const audit=await RafiqDataSafety.audit(false);if(!audit.ok)throw new Error('audit failed '+JSON.stringify(audit));
  console.log('DATA_SAFETY_TEST_OK',JSON.stringify({version:audit.dataVersion,records:audit.recordCount,saved:audit.savedCount,days:audit.dayCount}));
})().catch(e=>{console.error(e);process.exit(1)});
