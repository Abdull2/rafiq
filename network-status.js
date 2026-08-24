/* Tadaruq network status — lightweight offline/reconnect feedback. */
(() => {
  let bar=null,hideTimer=null,wasOffline=!navigator.onLine;
  function ensure(){
    if(bar?.isConnected)return bar;
    bar=document.createElement('div');bar.id='tadaruq-network-status';bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');bar.setAttribute('aria-atomic','true');
    bar.style.cssText='position:fixed;z-index:99998;top:calc(10px + env(safe-area-inset-top));left:50%;transform:translateX(-50%) translateY(-8px);max-width:calc(100vw - 28px);background:var(--card,#fff);color:var(--ink,#173B39);border:1px solid var(--line,#d8ded9);border-radius:999px;padding:8px 12px;box-shadow:0 8px 26px rgba(0,0,0,.12);font:700 13px/1.5 system-ui,sans-serif;direction:rtl;opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease';
    document.body.appendChild(bar);return bar;
  }
  function show(text,{temporary=false}={}){
    const el=ensure();clearTimeout(hideTimer);el.textContent=text;el.style.opacity='1';el.style.transform='translateX(-50%) translateY(0)';
    if(temporary)hideTimer=setTimeout(hide,2400);
  }
  function hide(){if(!bar)return;bar.style.opacity='0';bar.style.transform='translateX(-50%) translateY(-8px)'}
  function sync(initial=false){
    if(!navigator.onLine){wasOffline=true;show('أنت دون اتصال — المحتوى المحفوظ متاح.')}
    else if(wasOffline&&!initial){wasOffline=false;show('عاد الاتصال بالإنترنت ✓',{temporary:true})}
    else hide();
  }
  addEventListener('offline',()=>sync(false));addEventListener('online',()=>sync(false));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>sync(true),{once:true});else sync(true);
})();
