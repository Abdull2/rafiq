/* Tadaruq boot splash reveal — externalized for strict CSP. */
(function(){
  let done=false;
  function reveal(){
    if(done) return; done=true;
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      document.body.classList.add('app-boot-ready');
      setTimeout(function(){const s=document.getElementById('app-boot-splash');if(s)s.remove();},240);
    });});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',reveal,{once:true}); else reveal();
  window.addEventListener('pageshow',reveal,{once:true});
  setTimeout(reveal,850);
})();
