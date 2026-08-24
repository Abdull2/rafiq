/* Tadaruq PWA registration — safe opt-in updates + staged offline warming. */
(() => {
  const isLocalhost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const canRegister=location.protocol==='https:'||(location.protocol==='http:'&&isLocalhost)||window.isSecureContext;
  if(!canRegister||!('serviceWorker' in navigator))return;
  let refreshForUpdate=false,shownFor=null,warmScheduled=false;

  function showUpdate(registration){
    const worker=registration.waiting;if(!worker||shownFor===worker)return;shownFor=worker;
    let bar=document.getElementById('tadaruq-update-bar');
    if(!bar){
      bar=document.createElement('div');bar.id='tadaruq-update-bar';bar.setAttribute('role','status');
      bar.style.cssText='position:fixed;z-index:99999;inset:auto 12px calc(14px + env(safe-area-inset-bottom)) 12px;max-width:560px;margin:auto;background:var(--card,#fff);color:var(--ink,#173B39);border:1px solid var(--line,#ddd);border-radius:14px;padding:10px 12px;box-shadow:0 12px 35px rgba(0,0,0,.16);display:flex;align-items:center;gap:10px;font:600 13px/1.6 system-ui,sans-serif;direction:rtl';
      bar.innerHTML='<span style="flex:1">تحديث جديد لتدارُك جاهز.</span><button type="button" style="border:0;border-radius:10px;background:var(--deep,#173B39);color:#fff;padding:8px 11px;font:inherit;cursor:pointer">تحديث الآن</button><button type="button" aria-label="لاحقًا" style="border:0;background:transparent;color:inherit;font-size:18px;cursor:pointer">×</button>';
      document.body.appendChild(bar);
      const buttons=bar.querySelectorAll('button');
      buttons[0].addEventListener('click',()=>{refreshForUpdate=true;registration.waiting?.postMessage({type:'SKIP_WAITING'});buttons[0].disabled=true});
      buttons[1].addEventListener('click',()=>bar.remove());
    }
  }

  function shouldWarmOfflineContent(){
    const standalone=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
    if(!standalone)return false;
    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(connection?.saveData)return false;
    return !['slow-2g','2g'].includes(connection?.effectiveType);
  }
  function scheduleOfflineWarm(registration){
    if(warmScheduled||!shouldWarmOfflineContent())return;warmScheduled=true;
    const send=()=>{
      const worker=registration.active||navigator.serviceWorker.controller;
      if(worker)worker.postMessage({type:'WARM_OFFLINE_CONTENT'});
    };
    if('requestIdleCallback' in window)window.requestIdleCallback(send,{timeout:12000});
    else setTimeout(send,5000);
  }

  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshForUpdate)location.reload()});
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
      if(registration.waiting&&navigator.serviceWorker.controller)showUpdate(registration);
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(registration)});
      });
      navigator.serviceWorker.ready.then(scheduleOfflineWarm).catch(()=>{});
      registration.update().catch(()=>{});
    }catch(error){console.warn('Tadaruq service worker registration failed:',error)}
  });
})();
