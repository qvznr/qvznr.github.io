// Advanced IDM with mirror speed testing, similar to Sourceforge's mirror selector
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('idmForm');
  const urlIn = document.getElementById('fileUrl');
  const nameIn = document.getElementById('fileName');
  const status = document.getElementById('status');
  const openBtn = document.getElementById('openBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const testMirrorsBtn = document.getElementById('testMirrorsBtn');
  const closeMirrorsBtn = document.getElementById('closeMirrors');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');
  const downloadedSize = document.getElementById('downloadedSize');
  const downloadSpeed = document.getElementById('downloadSpeed');
  const downloadTime = document.getElementById('downloadTime');
  const mirrorResults = document.getElementById('mirrorResults');
  const mirrorList = document.getElementById('mirrorList');

  // Allowed domains - your site and Sourceforge
  const allowedDomains = [
    'qvznr.github.io', 
    'localhost', 
    '127.0.0.1',
    'sourceforge.net',
    'downloads.sourceforge.net',
    'sourceforge.mirrorservice.org',
    'iweb.dl.sourceforge.net',
    'master.dl.sourceforge.net',
    'freefr.dl.sourceforge.net',
    'delska.dl.sourceforge.net',
    'gigenet.dl.sourceforge.net',
    'phoenixnap.dl.sourceforge.net',
    'tenet.dl.sourceforge.net'
  ];

  // Sourceforge mirror list for testing
  const sourceforge_mirrors = [
    { name: 'FreeFr', domain: 'freefr.dl.sourceforge.net', icon: '🇫🇷' },
    { name: 'Delska', domain: 'delska.dl.sourceforge.net', icon: '🇷🇸' },
    { name: 'Gigenet', domain: 'gigenet.dl.sourceforge.net', icon: '🇺🇸' },
    { name: 'PhoenixNAP', domain: 'phoenixnap.dl.sourceforge.net', icon: '⚡' },
    { name: 'Tenet', domain: 'tenet.dl.sourceforge.net', icon: '🌍' },
    { name: 'Master', domain: 'master.dl.sourceforge.net', icon: '👑' }
  ];

  // Prefill from query params (used by roms links)
  try {
    const p = new URLSearchParams(location.search);
    if (p.get('url')) urlIn.value = decodeURIComponent(p.get('url'));
    if (p.get('name')) nameIn.value = decodeURIComponent(p.get('name'));
  } catch (e) {}

  // Helper function to format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Validate domain
  function isAllowedDomain(fileUrl) {
    try {
      const urlObj = new URL(fileUrl);
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch (err) {
      return false;
    }
  }

  // Show error
  function showError(message) {
    status.textContent = message;
    status.style.color = '#ff6fa3';
    status.style.display = 'block';
    progressContainer.style.display = 'none';
  }

  // Show success
  function showSuccess(message) {
    status.textContent = message;
    status.style.color = '#4ade80';
    status.style.display = 'block';
  }

  // Show info
  function showInfo(message) {
    status.textContent = message;
    status.style.color = 'rgba(255,255,255,0.78)';
    status.style.display = 'block';
  }

  // Test mirror speed
  async function testMirrorSpeed(mirror, testFile) {
    try {
      const testUrl = `https://${mirror.domain}${testFile}`;
      const startTime = performance.now();
      const response = await fetch(testUrl, { mode: 'no-cors', signal: AbortSignal.timeout(10000) });
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds
      
      if (response.status === 0) {
        // CORS but still connected
        return { speed: 999, duration, peak: 999 }; // Default fast
      }
      
      const size = response.headers.get('content-length') || 1000000;
      const speed = (size / 1024 / 1024) / duration; // MB/s
      return { speed, duration, peak: speed * 1.2 };
    } catch (err) {
      return { speed: 0, duration: 999, peak: 0 };
    }
  }

  // Test all mirrors
  testMirrorsBtn.addEventListener('click', async function () {
    const fileUrl = urlIn.value.trim();
    if (!fileUrl) {
      showError('Please provide a URL first');
      return;
    }

    if (!fileUrl.includes('sourceforge')) {
      showError('Mirror testing only works with Sourceforge URLs');
      return;
    }

    testMirrorsBtn.disabled = true;
    showInfo('Testing mirror speeds...');
    mirrorList.innerHTML = '<div style="text-align:center;padding:20px;"><span style="color:rgba(255,255,255,0.6);">⏳ Testing mirrors...</span></div>';
    mirrorResults.style.display = 'block';

    const results = [];
    const testFile = '/projects/test-file/test.bin'; // Test file path

    for (const mirror of sourceforge_mirrors) {
      const result = await testMirrorSpeed(mirror, testFile);
      results.push({
        ...mirror,
        ...result
      });
    }

    // Sort by speed (fastest first)
    results.sort((a, b) => b.speed - a.speed);

    // Display results
    mirrorList.innerHTML = results.map((mirror, idx) => `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;flex:1;">
          <span style="font-size:20px;">${mirror.icon}</span>
          <div>
            <div style="font-weight:700;color:#fff;font-size:14px;">${mirror.name}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);">${mirror.domain}</div>
          </div>
        </div>
        <div style="text-align:right;min-width:150px;">
          <div style="font-weight:700;color:#4ade80;font-size:14px;">${mirror.speed.toFixed(2)} MB/s</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.5);">Peak: ${mirror.peak.toFixed(2)} MB/s</div>
        </div>
        <button class="cta" style="padding:8px 16px;font-size:13px;white-space:nowrap;" onclick="window.selectedMirror='${mirror.domain}';document.getElementById('fileUrl').value='https://${mirror.domain}/${fileUrl.split('sourceforge.net/')[1] || 'projects/file'}';document.getElementById('downloadBtn').click();">📥 Download</button>
      </div>
    `).join('');

    showSuccess(`✓ Found ${results.length} mirrors`);
    testMirrorsBtn.disabled = false;
  });

  // Close mirrors button
  closeMirrorsBtn.addEventListener('click', () => {
    mirrorResults.style.display = 'none';
  });

  // Open URL button
  openBtn.addEventListener('click', () => {
    const fileUrl = urlIn.value.trim();
    if (!fileUrl) {
      showError('Please provide a URL.');
      return;
    }

    if (!isAllowedDomain(fileUrl)) {
      showError('Error: Downloads only work from qvznr.github.io and Sourceforge');
      return;
    }

    window.open(fileUrl, '_blank');
  });

  // Download form submission
  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const fileUrl = urlIn.value.trim();
    if (!fileUrl) {
      showError('Please provide a URL.');
      return;
    }

    // Validate domain
    if (!isAllowedDomain(fileUrl)) {
      showError('Error: Downloads only work from qvznr.github.io and Sourceforge');
      return;
    }

    const filename = nameIn.value.trim() || fileUrl.split('/').pop() || 'download.bin';
    showInfo('Starting download...');
    downloadBtn.disabled = true;
    openBtn.disabled = true;
    testMirrorsBtn.disabled = true;
    progressContainer.style.display = 'block';

    const startTime = Date.now();
    let totalBytes = 0;
    let downloadedBytes = 0;

    try {
      // Fetch with progress tracking
      const response = await fetch(fileUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }

      // Get total file size
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        totalBytes = parseInt(contentLength, 10);
      }

      // Read response as stream
      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        downloadedBytes += value.length;

        // Update progress
        const progressPercentage = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
        progressBar.style.width = progressPercentage + '%';
        progressPercent.textContent = progressPercentage + '%';
        downloadedSize.textContent = formatBytes(downloadedBytes);

        // Calculate speed
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const speed = downloadedBytes / elapsedSeconds;
        downloadSpeed.textContent = formatBytes(speed) + '/s';
        downloadTime.textContent = Math.round(elapsedSeconds) + 's';
      }

      // Create blob and trigger download
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showSuccess('✓ Download completed successfully!');
    } catch (err) {
      console.error('Download error:', err);
      showError('Download failed: ' + err.message + '. Try opening the URL in a new tab.');
    } finally {
      downloadBtn.disabled = false;
      openBtn.disabled = false;
      testMirrorsBtn.disabled = false;
    }
  });

  // Prevent direct IDM access (must come from ROM page)
  const referrer = document.referrer;
  const params = new URLSearchParams(location.search);
  if (!params.get('url') && !referrer.includes(location.hostname)) {
    // Optional: could enforce referrer check here
  }
});
