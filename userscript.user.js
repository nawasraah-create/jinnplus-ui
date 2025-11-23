// ==UserScript==
// @name         3rb.io External UI Loader
// @namespace    http://example.local
// @version      1.1
// @description  Load external UI & controls from GitHub for 3rb.io
// @match        *://3rb.io/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  // --- ضع رابط Raw لملف inject/script.js من GitHub هنا ---
  // مثال: https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO/main/inject/script.js
  const GITHUB_RAW_SCRIPT = 'https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO/main/inject/script.js';

  // --- اختياري: رابط raw لملف CSS خارجي ---
  const GITHUB_RAW_CSS = 'https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO/main/inject/style.css';

  function loadText(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload(res) {
          if (res.status >= 200 && res.status < 300) resolve(res.responseText);
          else reject(new Error('Status ' + res.status));
        },
        onerror(e) { reject(e); }
      });
    });
  }

  async function init() {
    try {
      const scriptText = await loadText(GITHUB_RAW_SCRIPT);
      if (GITHUB_RAW_CSS) {
        try {
          const cssText = await loadText(GITHUB_RAW_CSS);
          GM_addStyle(cssText);
        } catch(e){ console.warn('[3rb-addon] failed to load external CSS', e); }
      }
      const s = document.createElement('script');
      s.textContent = scriptText + '\n//# sourceURL=github-inject-script.js';
      (document.head || document.documentElement).appendChild(s);
      console.log('[3rb-addon] injected script from GitHub');
    } catch (err) {
      console.error('[3rb-addon] failed to load script', err);
    }
  }

  init();
})();
