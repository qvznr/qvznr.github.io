// Advanced client-side downloader with mirror speed testing
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('idmForm');
  const urlIn = document.getElementById('fileUrl');
  const nameIn = document.getElementById('fileName');
  const status = document.getElementById('status');
  const openBtn = document.getElementById('openBtn');

  // Prefill from query params (used by roms links)
  try{
    const p = new URLSearchParams(location.search);
    if(p.get('url')) urlIn.value = decodeURIComponent(p.get('url'));
    if(p.get('name')) nameIn.value = decodeURIComponent(p.get('name'));
    
    // Auto-start download if URL is provided
    if(p.get('url') && form){
      setTimeout(() => {
        form.dispatchEvent(new Event('submit'));
      }, 500);
    }
  }catch(e){}

  if(openBtn){
    openBtn.addEventListener('click', ()=>{
      if(!urlIn.value) return;
      window.open(urlIn.value, '_blank');
    });
  }

  if(form){
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      const fileUrl = urlIn.value.trim();
      if(!fileUrl){ status.textContent = 'Please provide a URL.'; return; }
      
      // Only allow downloads from SourceForge (coloxy project specifically)
      const allowedDomain = 'sourceforge.net';
      try{
        const urlObj = new URL(fileUrl);
        if(!urlObj.hostname.includes('sourceforge.net') || !urlObj.pathname.includes('coloxy')){
          status.textContent = 'Error: Downloads are only allowed from https://sourceforge.net/projects/coloxy';
          status.style.color = '#ff6fa3';
          return;
        }
      }catch(err){
        status.textContent = 'Error: Invalid URL';
        status.style.color = '#ff6fa3';
        return;
      }
      
      const filename = nameIn.value.trim() || fileUrl.split('/').pop() || 'download.bin';
      
      // Test SourceForge mirrors and download from fastest
      await downloadWithMirrorTesting(fileUrl, filename, status);
    });
  }
});

// Test multiple SourceForge mirrors and download from the fastest
async function downloadWithMirrorTesting(fileUrl, filename, statusEl) {
  statusEl.textContent = 'Testing SourceForge mirrors for fastest speed...';
  statusEl.style.color = '#ff6fa3';

  try {
    // Common SourceForge mirrors (ordered by typical reliability/speed)
    const mirrors = [
      'https://phoenixnap.dl.sourceforge.net',
      'https://cfhcable.dl.sourceforge.net',
      'https://versaweb.dl.sourceforge.net',
      'https://iweb.dl.sourceforge.net',
      'https://deac-riga.dl.sourceforge.net',
      'https://managedway.dl.sourceforge.net',
      'https://downloads.sourceforge.net'
    ];

    // Extract the path after sourceforge.net
    const urlObj = new URL(fileUrl);
    const path = urlObj.pathname;

    // Test each mirror with no-cors fetch timing
    statusEl.textContent = `Testing ${mirrors.length} mirrors...`;
    const results = [];

    for (let i = 0; i < mirrors.length; i++) {
      const mirror = mirrors[i];
      const testUrl = mirror + path;
      const mirrorName = mirror.split('//')[1].split('.')[0];
      
      statusEl.textContent = `Testing mirror ${i + 1}/${mirrors.length}: ${mirrorName}...`;
      
      try {
        const startTime = performance.now();
        
        // Use fetch with no-cors mode to test connectivity
        await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        results.push({ mirror, testUrl, duration, mirrorName });
        console.log(`Mirror ${mirrorName}: ${duration.toFixed(0)}ms response time`);
      } catch (err) {
        console.warn(`Mirror ${mirrorName} failed:`, err.message);
      }
    }

    if (results.length === 0) {
      // Fallback: use phoenixnap mirror (usually fastest)
      const fallbackMirror = 'https://phoenixnap.dl.sourceforge.net';
      const fallbackUrl = fallbackMirror + path;
      statusEl.textContent = 'Using default fast mirror (PhoenixNAP)...';
      statusEl.style.color = '#ff6fa3';
      
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = fallbackUrl;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        statusEl.textContent = `Downloading from PhoenixNAP mirror`;
        statusEl.style.color = '#4ade80';
      }, 500);
      return;
    }

    // Sort by duration (fastest first)
    results.sort((a, b) => a.duration - b.duration);
    const fastest = results[0];

    statusEl.textContent = `Fastest mirror: ${fastest.mirrorName} (${fastest.duration.toFixed(0)}ms). Starting download...`;
    statusEl.style.color = '#4ade80';

    // Download from fastest mirror by opening in new tab
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = fastest.testUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      statusEl.textContent = `Downloading from ${fastest.mirrorName} (fastest - ${fastest.duration.toFixed(0)}ms)`;
      statusEl.style.color = '#4ade80';
    }, 500);

  } catch(err) {
    console.error(err);
    statusEl.textContent = 'Starting download...';
    statusEl.style.color = '#4ade80';
    
    // Use default fast mirror as ultimate fallback
    const urlObj = new URL(fileUrl);
    const path = urlObj.pathname;
    const fallbackUrl = 'https://phoenixnap.dl.sourceforge.net' + path;
    
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = fallbackUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      statusEl.textContent = 'Download started';
      statusEl.style.color = '#4ade80';
    }, 500);
  }
}

// Global helper so device pages can trigger IDM-styled downloads directly
window.startIDMDownload = function (fileUrl, suggestedName) {
  if (!fileUrl) return;

  const allowedDomain = 'sourceforge.net';
  try {
    const urlObj = new URL(fileUrl);
    if (!urlObj.hostname.includes(allowedDomain) || !urlObj.pathname.includes('coloxy')) {
      alert('Downloads are only allowed from https://sourceforge.net/projects/coloxy');
      return;
    }
  } catch (err) {
    alert('Invalid download URL');
    return;
  }

  // Prefer the provided filename, else derive from URL
  const filename = suggestedName || decodeURIComponent(fileUrl.split('/').pop() || 'download.bin');

  // Redirect to IDM page with URL and filename as query params
  window.location.href = `idm.html?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(filename)}`;
};
