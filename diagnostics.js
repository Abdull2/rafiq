/* Tadaruq diagnostics — local, privacy-preserving runtime health checks. */
(function(root){
  'use strict';
  const errors=[];
  const push=(kind,value)=>{errors.push({kind,at:new Date().toISOString(),value:String(value||'unknown').slice(0,220)});if(errors.length>20)errors.shift()};
  root.addEventListener('error',e=>push('error',e?.message||e?.error?.name||'window-error'));
  root.addEventListener('unhandledrejection',e=>push('promise',e?.reason?.message||e?.reason||'unhandled-rejection'));

  async function cacheStatus(){
    if(!('caches' in root))return {supported:false,count:0,names:[]};
    try{const names=await caches.keys();return {supported:true,count:names.length,names}}catch(_){return {supported:true,count:0,names:[]}}
  }
  async function storageEstimate(){
    try{const e=await navigator.storage?.estimate?.();return {usage:e?.usage||0,quota:e?.quota||0}}catch(_){return {usage:0,quota:0}}
  }
  async function status(){
    const meta=root.TADARUQ_META||{};
    const storage=root.TadaruqStorage?await TadaruqStorage.diagnostics():{backend:'legacy',indexedDB:false,keyCount:0};
    const data=root.RafiqDataSafety?await RafiqDataSafety.status():null;
    const audit=root.RafiqDataSafety?await RafiqDataSafety.audit(false):null;
    const cache=await cacheStatus(),estimate=await storageEstimate();
    const sw=('serviceWorker' in navigator)?{supported:true,controlled:!!navigator.serviceWorker.controller}: {supported:false,controlled:false};
    return {
      appVersion:meta.appVersion||'unknown',release:meta.release||'',dataSchema:meta.dataSchema||null,
      online:navigator.onLine,storage,data,audit,cache,estimate,serviceWorker:sw,errorCount:errors.length,errors:[...errors]
    };
  }
  const mb=n=>n?`${(n/1024/1024).toFixed(n>10*1024*1024?0:1)} MB`:'—';
  async function render(){
    const el=document.getElementById('diagnostics-status');if(!el)return null;
    try{
      const s=await status();
      const ok=!!(s.storage&&(!s.audit||s.audit.ok)&&s.data?.deviceDataVersion===s.data?.currentDataVersion);
      el.className='data-safety-card '+(ok?'ok':'warn');
      el.innerHTML=`<b>${ok?'حالة النظام سليمة ✓':'حالة النظام تحتاج مراجعة'}</b><span>تدارُك ${s.appVersion} · تخزين ${s.storage.backend} · قاعدة البيانات ${s.data?.deviceDataVersion??'—'}/${s.data?.currentDataVersion??'—'} · Service Worker ${s.serviceWorker.controlled?'فعّال':'غير متحكم بعد'} · ${s.cache.count} مخازن مؤقتة · استخدام ${mb(s.estimate.usage)}${s.errorCount?` · أخطاء الجلسة ${s.errorCount}`:''}</span>`;
      return s;
    }catch(e){
      el.className='data-safety-card warn';el.innerHTML='<b>تعذر إكمال التشخيص</b><span>لم تتأثر بياناتك. أعد فتح التطبيق ثم حاول مرة أخرى.</span>';push('diagnostics',e?.message||e);return null;
    }
  }
  root.TadaruqDiagnostics=Object.freeze({status,render,getErrors:()=>[...errors]});
  root.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('btn-diagnostics')?.addEventListener('click',async()=>{await render()});
    render();
  });
})(window);
