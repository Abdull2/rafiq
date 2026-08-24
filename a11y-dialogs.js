/* Tadaruq dialog accessibility — focus containment + focus return. */
(() => {
  const selector='[role="dialog"][aria-modal="true"]';
  const focusable='button:not([disabled]),[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const state=new WeakMap();
  let scheduled=false;

  const visible=el=>!!el && !el.closest('.hide') && !el.hidden && getComputedStyle(el).display!=='none' && getComputedStyle(el).visibility!=='hidden';
  const items=dialog=>Array.from(dialog.querySelectorAll(focusable)).filter(visible);

  function sync(){
    scheduled=false;
    document.querySelectorAll(selector).forEach(dialog=>{
      const open=visible(dialog),prev=state.get(dialog);
      if(open && !prev?.open){
        const trigger=document.activeElement instanceof HTMLElement && !dialog.contains(document.activeElement) ? document.activeElement : null;
        state.set(dialog,{open:true,trigger});
        if(!dialog.hasAttribute('tabindex'))dialog.setAttribute('tabindex','-1');
        requestAnimationFrame(()=>{
          if(!visible(dialog))return;
          const target=dialog.querySelector('[autofocus]')||items(dialog)[0]||dialog;
          try{target.focus({preventScroll:true})}catch(_){target.focus?.()}
        });
      }else if(!open && prev?.open){
        state.set(dialog,{open:false,trigger:null});
        const trigger=prev.trigger;
        if(trigger?.isConnected && visible(trigger))requestAnimationFrame(()=>{try{trigger.focus({preventScroll:true})}catch(_){trigger.focus?.()}});
      }
    });
  }
  const schedule=()=>{if(!scheduled){scheduled=true;queueMicrotask(sync)}};
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','hidden','style']});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const dialogs=Array.from(document.querySelectorAll(selector)).filter(visible);
    const dialog=dialogs.at(-1);if(!dialog)return;
    const list=items(dialog);
    if(!list.length){event.preventDefault();dialog.focus();return}
    const first=list[0],last=list.at(-1),active=document.activeElement;
    if(event.shiftKey && (active===first || !dialog.contains(active))){event.preventDefault();last.focus()}
    else if(!event.shiftKey && active===last){event.preventDefault();first.focus()}
  });
  sync();
})();
