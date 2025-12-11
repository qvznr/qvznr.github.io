// Insert boot overlay markup and behavior
(function(){
  const DURATION = 2000; // ms
  function createOverlay(){
    const div = document.createElement('div');
    div.id = 'boot-overlay';
    div.className = 'boot-overlay';
    div.setAttribute('role','presentation');
    // determine a friendly target label for the current page
    function pageLabel(){
      try{
        const p = (location.pathname||'').split('/').pop() || 'index.html';
        if(p === '' || p === 'index.html') return 'Opening Home';
        if(p === 'home.html') return 'Opening Home';
        if(p === 'get-started.html') return 'Opening Get Started';
        // fallback to document.title or filename
        const title = (document && document.title) ? document.title.replace(/\s*—.*$/,'') : p;
        return 'Opening ' + title;
      }catch(e){ return 'Opening site'; }
    }

    const subtitle = pageLabel();
    div.innerHTML = `
      <div class="boot-inner">
        <div class="boot-logo">Python Notes</div>
        <div class="boot-sub">${subtitle}</div>
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
    // prepare for smooth transition: start transparent then fade in
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 360ms cubic-bezier(.2,.9,.2,1)';
    overlay.style.willChange = 'opacity';
    document.body.appendChild(overlay);
    // ensure paint before starting fade-in
    requestAnimationFrame(()=>{ overlay.style.opacity = '1'; });

    const hide = ()=>{
      // fade out and remove on transitionend for smoothness
      overlay.style.opacity = '0';
      overlay.setAttribute('aria-hidden','true');
      const onEnd = (e)=>{
        if (e.target !== overlay) return;
        overlay.removeEventListener('transitionend', onEnd);
        try{ overlay.remove(); }catch(e){}
        // notify listeners that boot overlay finished
        try{ window.dispatchEvent(new CustomEvent('boot:done')); }catch(e){}
      };
      overlay.addEventListener('transitionend', onEnd, {passive:true});
    };
    // schedule hide; allow small rAF before starting timeout to avoid jank on very slow pages
    requestAnimationFrame(()=> setTimeout(hide, DURATION));
    overlay.addEventListener('click', hide, {passive:true});
  }

  // Expose init for manual call and auto-init
  if (typeof window !== 'undefined'){
    window.addEventListener('load', init);
  }

  /* Auth modal: create once and show on click of [data-auth] buttons */
  function createAuthModal(){
    if (document.getElementById('auth-modal')) return document.getElementById('auth-modal');
    const m = document.createElement('div');
    m.id = 'auth-modal';
    m.className = 'auth-modal';
    m.innerHTML = `
      <div class="dialog" role="dialog" aria-modal="true">
        <button class="close" aria-label="Close">✕</button>
        <h3 id="auth-title">Sign In</h3>
        <input id="auth-email" type="email" placeholder="Email">
        <input id="auth-pass" type="password" placeholder="Password">
        <div class="row">
          <button class="btn submit">Submit</button>
          <button class="btn cancel">Cancel</button>
        </div>
      </div>`;
    m.style.display = 'none';
    document.body.appendChild(m);
    // handlers
    m.querySelector('.close').addEventListener('click', ()=>hideAuthModal());
    m.querySelector('.cancel').addEventListener('click', ()=>hideAuthModal());
    m.addEventListener('click', (e)=>{ if (e.target===m) hideAuthModal(); });
    return m;
  }

  function showAuthModal(mode){
    const m = createAuthModal();
    const title = m.querySelector('#auth-title');
    title.textContent = (mode==='signup') ? 'Sign Up' : 'Sign In';
    m.style.display = 'flex';
    requestAnimationFrame(()=> m.style.opacity = '1');
  }

  function hideAuthModal(){
    const m = document.getElementById('auth-modal');
    if (!m) return;
    m.style.opacity = '0';
    setTimeout(()=>{ try{ m.style.display='none'; }catch(e){} }, 220);
  }

  // delegate clicks to data-auth buttons
  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('[data-auth]');
    if (!btn) return;
    const mode = btn.getAttribute('data-auth') || 'signin';
    showAuthModal(mode);
  }, {passive:true});

  // One-time magic effect for first-time visitors on home page
  function isFirstVisit(){
    try{ return !localStorage.getItem('magicShown_v1'); }catch(e){ return false; }
  }
  function markMagicShown(){ try{ localStorage.setItem('magicShown_v1','1'); }catch(e){} }

  function runMagicEffect(){
    if (!isFirstVisit()) return;
    const path = (location.pathname||'').split('/').pop() || 'index.html';
    if (!(path === '' || path === 'index.html' || path === 'home.html')) return;
    markMagicShown();
    const container = document.createElement('div');
    container.className = 'magic-overlay';
    document.body.appendChild(container);
    const colors = ['#ff6fa3','#ffb3d9','#7bd3ff','#9be7ff','#ffd88a'];
    const count = 22;
    for(let i=0;i<count;i++){
      const p = document.createElement('div');
      p.className = 'magic-particle ' + (i%3===0? 'large': (i%2===0?'small':''));
      const color = colors[i % colors.length];
      p.style.background = color;
      // random start position near center
      const x = 50 + (Math.random()*160 - 80);
      const y = 50 + (Math.random()*40 - 20);
      p.style.left = x + '%';
      p.style.top = y + '%';
      container.appendChild(p);
      // animate using WAAPI if available
      const dx = (Math.random()*360 - 180);
      const dy = -120 - Math.random()*160;
      const rot = (Math.random()*720 - 360);
      const dur = 900 + Math.random()*800;
      if (p.animate){
        p.animate([
          {transform:'translateY(0) scale(1)', opacity:1},
          {transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.3)`, opacity:0}
        ],{duration:dur, easing:'cubic-bezier(.2,.9,.2,1)', fill:'forwards'});
      } else {
        // fallback: simple CSS transition
        p.style.transition = `transform ${dur}ms cubic-bezier(.2,.9,.2,1), opacity ${dur}ms linear`;
        setTimeout(()=>{ p.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.3)`; p.style.opacity= '0'; }, 20);
      }
    }
    // cleanup after longest animation
    setTimeout(()=>{ try{ container.remove(); }catch(e){} }, 2200);
  }

  // trigger magic on boot finish
  window.addEventListener('boot:done', ()=>{
    try{ runMagicEffect(); }catch(e){}
  }, {passive:true});
})();
