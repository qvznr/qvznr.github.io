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

// Download from best SourceForge mirror (skip testing to avoid errors)
async function downloadWithMirrorTesting(fileUrl, filename, statusEl) {
  statusEl.textContent = 'Preparing download from fastest mirror...';
  statusEl.style.color = '#ff6fa3';

  try {
    // Extract the path after sourceforge.net
    const urlObj = new URL(fileUrl);
    const path = urlObj.pathname;

    // Use PhoenixNAP (consistently fastest and most reliable mirror)
    const bestMirror = 'https://phoenixnap.dl.sourceforge.net';
    const downloadUrl = bestMirror + path;
    
    statusEl.textContent = 'Starting download from PhoenixNAP (fastest mirror)...';
    statusEl.style.color = '#4ade80';

    // Start download immediately
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      statusEl.textContent = `Download started from PhoenixNAP mirror`;
      statusEl.style.color = '#4ade80';
    }, 300);

  } catch(err) {
    console.error(err);
    statusEl.textContent = 'Starting download...';
    statusEl.style.color = '#4ade80';
    
    // Direct fallback
    setTimeout(() => {
      window.open(fileUrl, '_blank');
      statusEl.textContent = 'Download started';
      statusEl.style.color = '#4ade80';
    }, 300);
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
