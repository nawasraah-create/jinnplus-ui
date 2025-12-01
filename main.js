// main.js — AE UI logic (works in parent context)
(function(){
  // عناصر HUD
  const hud = document.getElementById('ae-hud');
  const fpsSpan = document.getElementById('ae-fps');
  const pingSpan = document.getElementById('ae-ping');
  const overlayToggle = document.getElementById('ae-overlay-toggle');
  const skinOverlay = document.getElementById('ae-skin-overlay');

  // زرار السكنات
  document.querySelectorAll('#ae-controls button[data-skin]').forEach(b => {
    b.addEventListener('click', () => {
      const skin = b.getAttribute('data-skin');
      // نخبر الـ Launcher/iframe أننا نريد تطبيق سكن (اللعبة قد تختار الاستجابة أو لا)
      window.postMessage({ aeOrigin:true, type:'AE_REQUEST_SKIN', payload:{ skin } }, '*');
      // تطبيق بصري محلي (cosmetic) على الصفحة الأم — سيؤثر على canvas إن وُجد
      document.documentElement.classList.remove('ae-skin-skin1','ae-skin-skin2');
      if(skin === 'skin1') document.documentElement.classList.add('ae-skin-skin1');
      if(skin === 'skin2') document.documentElement.classList.add('ae-skin-skin2');
      // إظهار صورة تجريبية
      if(skin !== 'none'){ skinOverlay.style.display='block'; skinOverlay.src='assets/'+skin+'.png'; } else { skinOverlay.style.display='none'; }
    });
  });

  // ثيم الخريطة
  document.getElementById('ae-map-theme').addEventListener('change', function(){
    const t = this.value;
    document.documentElement.classList.remove('ae-theme-night','ae-theme-colorful');
    if(t==='night') document.documentElement.classList.add('ae-theme-night');
    if(t==='colorful') document.documentElement.classList.add('ae-theme-colorful');
    window.postMessage({ aeOrigin:true, type:'AE_REQUEST_THEME', payload:{ theme:t } }, '*');
  });

  document.getElementById('ae-kill').addEventListener('click', ()=> {
    window.postMessage({ aeOrigin:true, type:'AE_TRIGGER_EFFECT', payload:{ effect:'kill' } }, '*');
    // effect UI local flash
    document.body.style.transition='background 0.2s'; document.body.style.background='rgba(255,0,0,0.08)';
    setTimeout(()=> document.body.style.background='', 400);
  });
  document.getElementById('ae-win').addEventListener('click', ()=> {
    window.postMessage({ aeOrigin:true, type:'AE_TRIGGER_EFFECT', payload:{ effect:'win' } }, '*');
  });

  // HUD toggle
  overlayToggle.addEventListener('change', e => {
    hud.style.display = e.target.checked ? 'block' : 'none';
    // أيضًا نعلِم اللعبة إن أردنا
    window.postMessage({ aeOrigin:true, type:'AE_UI_TOGGLE', payload:{ visible: e.target.checked } }, '*');
  });

  // FPS counter (محلي) باستخدام requestAnimationFrame
  let frames = 0, last = performance.now();
  function tick(now){
    frames++;
    if(now - last >= 1000){ fpsSpan.textContent = frames; frames = 0; last = now; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Ping سيظهر عندما يصل رد من اللعبة (اللعبة أو صاحبها يمكن أن يرسل رسالة 'AE_PING_REPLY')
  pingSpan.textContent = 'N/A';

  // استقبال رسائل من iframe/Launcher
  window.addEventListener('message', (ev) => {
    const msg = ev.data;
    if(!msg || typeof msg !== 'object' || !msg.aeOrigin) return;

    switch(msg.type){
      case 'AE_PING_REPLY':
        pingSpan.textContent = `${msg.payload.lat} ms`;
        break;
      case 'AE_EVENT':
        // أمثلة: kill, win, scoreUpdate
        handleGameEvent(msg.payload);
        break;
      default:
        console.debug('AE UI got message', msg);
    }
  });

  function handleGameEvent(p){
    if(p.event === 'kill'){
      // عرض بصري مؤقت
      document.body.animate([{background:'rgba(255,0,0,0.12)'},{background:'transparent'}], {duration:700});
    }
    if(p.event === 'win'){
      document.body.animate([{transform:'scale(1)'},{transform:'scale(1.02)'},{transform:'scale(1)'}], {duration:1200});
    }
    if(p.event === 'stats'){
      // تحديث HUD إن وُجدت بيانات
      if(p.fps) fpsSpan.textContent = p.fps;
      if(p.ping) pingSpan.textContent = p.ping;
    }
  }

  // تتبع الفأرة لتحريك الصورة التجريبية
  window.addEventListener('mousemove', (ev) => {
    skinOverlay.style.left = (ev.clientX - 24) + 'px';
    skinOverlay.style.top = (ev.clientY - 24) + 'px';
  });

  // واجهة برمجية بسيطة للتجارب عبر console
  window.AE_UI = {
    send: (type, payload) => window.postMessage({ aeOrigin:true, type, payload }, '*'),
  };
})();
