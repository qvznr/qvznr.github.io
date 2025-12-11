// Insert boot overlay markup and behavior
(function(){
  const DURATION = 2000; // ms
  function createOverlay(){
    const div = document.createElement('div');
    div.id = 'boot-overlay';
    div.className = 'boot-overlay';
    div.setAttribute('role','presentation');
    div.innerHTML = `
      <div class="boot-inner">
        <div class="boot-logo">Python Notes</div>
        <div class="boot-sub">-Aditya</div>
        <div class="boot-ring" aria-hidden="true">
          <svg class="spinner" viewBox="0 0 50 50" role="img" aria-label="Loading">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="#ff4081" stroke-width="4" stroke-linecap="round"></circle>
          </svg>
        </div>
      </div>`;
    return div;
  }

  function init(){
    // wait until DOM ready
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    // avoid duplicate
    if (document.getElementById('boot-overlay')) return;
    const overlay = createOverlay();
    document.body.appendChild(overlay);
    const hide = ()=>{
      overlay.style.opacity = '0';
      overlay.setAttribute('aria-hidden','true');
      setTimeout(()=>{ try{ overlay.remove(); }catch(e){} }, 400);
    };
    setTimeout(hide, DURATION);
    overlay.addEventListener('click', hide, {passive:true});
  }

  // Expose init for manual call and auto-init
  if (typeof window !== 'undefined'){
    window.addEventListener('load', init);
  }
})();
