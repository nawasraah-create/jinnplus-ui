// inject/script.js
// Injected UI for 3rb.io — overlay that tries to bind to exposed game APIs.
// Configure WS_URL below if you run a websocket server.

(function(){
  if (window.__my3rbAddonInjected) return;
  window.__my3rbAddonInjected = true;

  // ---------- CONFIG ----------
  const WS_URL = null; // e.g. 'wss://yourdomain.example/ws'  (set to null if not using)
  const UI_ID = 'my3rbAddon';
  // ----------------------------

  function waitFor(condFn, timeout = 8000, interval = 100) {
    return new Promise((resolve) => {
      const start = Date.now();
      const t = setInterval(() => {
        try {
          if (condFn()) { clearInterval(t); resolve(true); }
          else if (Date.now() - start > timeout) { clearInterval(t); resolve(false); }
        } catch (e) { clearInterval(t); resolve(false); }
      }, interval);
    });
  }

  function injectFallbackStyle() {
    if (document.getElementById(UI_ID + '-style')) return;
    const css = `
      #${UI_ID} { position: fixed; right: 12px; top: 12px; z-index: 2147483647; font-family: system-ui, Arial, sans-serif; }
      #${UI_ID} .panel { background: rgba(12,12,12,0.7); color: #fff; padding: 12px; border-radius: 12px; min-width: 220px; box-shadow: 0 8px 20px rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
      #${UI_ID} button { width: 100%; padding: 8px 10px; margin: 6px 0; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; background: rgba(255,255,255,0.04); color: #fff; }
      #${UI_ID} .small { font-size: 12px; opacity: 0.9; margin-top:6px; }
      #${UI_ID} .draggable { cursor: move; user-select: none; }
    `;
    const s = document.createElement('style');
    s.id = UI_ID + '-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildUI() {
    const existing = document.getElementById(UI_ID);
    if (existing) return existing;
    const root = document.createElement('div');
    root.id = UI_ID;
    root.innerHTML = `
      <div class="panel" id="${UI_ID}-panel">
        <div class="draggable" id="${UI_ID}-title" style="font-weight:700;margin-bottom:8px">3rb Addon</div>
        <button id="${UI_ID}-btn-play">Play / Join</button>
        <button id="${UI_ID}-btn-split">Split (attempt)</button>
        <button id="${UI_ID}-btn-ws">Send WS Msg</button>
        <button id="${UI_ID}-btn-toggle">Toggle Overlay</button>
        <div class="small" id="${UI_ID}-status">status: init</div>
      </div>
    `;
    document.body.appendChild(root);
    makeDraggable(root.querySelector('#' + UI_ID + '-panel'), root.querySelector('#' + UI_ID + '-title'));
    return root;
  }

  function makeDraggable(panel, handle) {
    let dragging = false, startX=0, startY=0, origX=0, origY=0;
    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      origX = rect.left; origY = rect.top;
      document.body.style.userSelect = 'none';
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panel.style.position = 'fixed';
      panel.style.left = (origX + (e.clientX - startX)) + 'px';
      panel.style.top = (origY + (e.clientY - startY)) + 'px';
    });
    window.addEventListener('mouseup', ()=> {
      dragging = false;
      document.body.style.userSelect = '';
    });
  }

  function discoverGameAPI() {
    const candidates = {};
    const names = ['game','app','App','client','Client','player','Player','net','socket','Main'];
    for (const n of names) {
      try { if (window[n]) candidates[n] = window[n]; } catch(e){}
    }
    for (const k in window) {
      try {
        if (k && k.toLowerCase().includes('game') && typeof window[k] === 'object') {
          candidates[k] = window[k];
        }
      } catch(e){}
    }
    return Object.keys(candidates).length ? candidates : null;
  }

  async function init() {
    injectFallbackStyle();
    const ui = buildUI();
    const statusEl = ui.querySelector('#' + UI_ID + '-status');

    statusEl.textContent = 'status: waiting for page...';
    await waitFor(() => document.readyState === 'complete' || document.body, 6000);

    statusEl.textContent = 'status: discovering game API...';
    const apisFound = discoverGameAPI();
    if (apisFound) {
      console.log('[3rb-addon] possible APIs found:', apisFound);
      statusEl.textContent = 'status: API detected (open console)';
    } else {
      statusEl.textContent = 'status: no API found — using local handlers';
    }

    let ws = null;
    if (WS_URL) {
      try {
        ws = new WebSocket(WS_URL);
        ws.addEventListener('open', () => { statusEl.textContent = 'status: ws connected'; });
        ws.addEventListener('message', (m) => {
          console.log('[3rb-addon] ws message', m.data);
          showTemp(statusEl, 'ws: ' + (typeof m.data === 'string' ? m.data.slice(0,60) : 'binary'));
        });
        ws.addEventListener('close', () => { showTemp(statusEl, 'ws closed'); });
      } catch(e) {
        console.warn('WS connect fail', e);
      }
    }

    ui.querySelector('#' + UI_ID + '-btn-play').addEventListener('click', () => {
      const apiKeys = apisFound ? Object.keys(apisFound) : [];
      if (apiKeys.length) {
        for (const key of apiKeys) {
          const obj = apisFound[key];
          if (!obj) continue;
          const tryNames = ['play','join','start','connect'];
          for (const tn of tryNames) {
            try {
              if (typeof obj[tn] === 'function') {
                obj[tn]();
                showTemp(statusEl, `called ${key}.${tn}()`);
                return;
              }
            } catch(e){}
          }
        }
        console.log('[3rb-addon] candidates', apisFound);
        alert('API objects detected — open console to inspect and customize addon.');
      } else {
        showTemp(statusEl, 'local: simulate join');
        alert('Local: Play / Join simulated (no game API detected).');
      }
    });

    ui.querySelector('#' + UI_ID + '-btn-split').addEventListener('click', () => {
      const apiKeys = apisFound ? Object.keys(apisFound) : [];
      if (apiKeys.length) {
        for (const key of apiKeys) {
          const obj = apisFound[key];
          if (!obj) continue;
          const tryNames = ['split','shoot','fire','eject'];
          for (const tn of tryNames) {
            try {
              if (typeof obj[tn] === 'function') {
                obj[tn]();
                showTemp(statusEl, `called ${key}.${tn}()`);
                return;
              }
            } catch(e){}
          }
        }
        alert('API found but no known split-like function. Inspect console.');
      } else {
        // fallback: trigger space key (careful — may not work)
        const ev = new KeyboardEvent('keydown', {key: ' ', code: 'Space', bubbles: true});
        document.dispatchEvent(ev);
        showTemp(statusEl, 'sent local space key event');
      }
    });

    ui.querySelector('#' + UI_ID + '-btn-ws').addEventListener('click', () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type:'ui-click', ts: Date.now()}));
        showTemp(statusEl, 'sent ws message');
      } else {
        showTemp(statusEl, 'no ws — set WS_URL in script.js');
      }
    });

    let overlayShown = false;
    let overlayEl = null;
    ui.querySelector('#' + UI_ID + '-btn-toggle').addEventListener('click', () => {
      overlayShown = !overlayShown;
      if (overlayShown) {
        overlayEl = document.createElement('div');
        overlayEl.textContent = 'Overlay ON';
        overlayEl.style.position='fixed'; overlayEl.style.left='50%'; overlayEl.style.top='6%';
        overlayEl.style.transform='translateX(-50%)'; overlayEl.style.padding='8px 12px';
        overlayEl.style.background='rgba(255,255,255,0.08)'; overlayEl.style.color='white';
        overlayEl.style.borderRadius='8px'; overlayEl.style.zIndex='2147483646';
        document.body.appendChild(overlayEl);
      } else {
        if (overlayEl) overlayEl.remove();
      }
    });

    statusEl.textContent = 'status: ready';
  }

  function showTemp(statusEl, text, ms = 1700) {
    const old = statusEl.textContent;
    statusEl.textContent = text;
    setTimeout(()=> { statusEl.textContent = old; }, ms);
  }

  try {
    init().catch(e => console.error('[3rb-addon] init error', e));
  } catch (e) {
    console.error('[3rb-addon] fatal', e);
  }

})();

