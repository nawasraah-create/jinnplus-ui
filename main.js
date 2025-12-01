/* main.js — AE: Arabic Enhancer (client-side cosmetic only)
   ملاحظات أمان: لا يتفاعل مع سيرفر أو يغير وظائف اللعب، فقط واجهة وتصفية رسومية
*/

(function(){
  // ===== عناصر HUD =====
  const hud = document.getElementById('ae-hud');
  const overlayLayer = document.getElementById('ae-overlay-layer');
  const fpsSpan = document.getElementById('ae-fps');
  const pingSpan = document.getElementById('ae-ping');
  const overlayToggle = document.getElementById('ae-overlay-toggle');

  // ===== إضافة عنصر سكن يتبع مؤشر الفأرة (تجريبي بصري فقط) =====
  const skinOverlay = document.createElement('img');
  skinOverlay.id = 'ae-skin-overlay';
  skinOverlay.src = chromeRuntimeSafe('assets/skin1.png'); // helper below will resolve correctly when hosted
  skinOverlay.style.display = 'none';
  overlayLayer.appendChild(skinOverlay);

  // ===== تبديل السكنات والثيمات =====
  function removeSkinClasses() {
    document.documentElement.classList.remove('ae-skin-skin1','ae-skin-skin2','ae-skin-none');
  }
  function setSkin(name) {
    removeSkinClasses();
    if(name && name !== 'none') {
      document.documentElement.classList.add('ae-skin-' + name);
      // show overlay icon for visual skin demo:
      skinOverlay.src = chromeRuntimeSafe('assets/' + name + '.png');
      skinOverlay.style.display = 'block';
    } else {
      skinOverlay.style.display = 'none';
    }
  }

  // ثيمات الخريطة
  function setMapTheme(theme) {
    document.documentElement.classList.remove('ae-theme-night','ae-theme-colorful');
    if(theme === 'night') document.documentElement.classList.add('ae-theme-night');
    if(theme === 'colorful') document.documentElement.classList.add('ae-theme-colorful');
  }

  // ===== أحداث الأزرار =====
  document.querySelectorAll('#ae-controls button[data-skin]').forEach(btn => {
    btn.addEventListener('click', ()=> setSkin(btn.getAttribute('data-skin')));
  });
  document.getElementById('ae-map-theme').addEventListener('change', e => setMapTheme(e.target.value));

  document.getElementById('ae-kill').addEventListener('click', triggerKillEffect);
  document.getElementById('ae-win').addEventListener('click', triggerWinEffect);

  overlayToggle.addEventListener('change', (e)=>{
    hud.style.display = e.target.checked ? 'block' : 'none';
  });

  // ===== FPS counter =====
  let frames = 0, last = performance.now(), fps = 0;
  function fpsTick(now) {
    frames++;
    if(now - last >= 1000) {
      fps = frames;
      frames = 0;
      last = now;
      fpsSpan.textContent = fps;
    }
    requestAnimationFrame(fpsTick);
  }
  requestAnimationFrame(fpsTick);

  // ===== Ping (توضيحي) =====
  // ملاحظة: قياس الـ Ping الحقيقي لـ 3rb.io يتطلب الوصول إلى WebSocket الخاص باللعبة أو دعم من السيرفر.
  // هنا نبيّن N/A ونعطي واجهة لتوفير قياس إذا كان المستخدم أو مطور آخر يعرف كيفية قياس RTT داخل لعبة معينة.
  pingSpan.textContent = 'N/A';

  // ===== مؤثرات Kill/Win (بصرية + صوتية) =====
  function triggerKillEffect() {
    // flash overlay briefly
    overlayLayer.classList.add('ae-effect-kill');
    setTimeout(()=> overlayLayer.classList.remove('ae-effect-kill'), 800);
    // صوت إن وُجد
    playAsset('assets/win-sound.mp3', 0.5);
  }
  function triggerWinEffect() {
    document.documentElement.classList.add('ae-effect-win');
    setTimeout(()=> document.documentElement.classList.remove('ae-effect-win'), 1500);
    playAsset('assets/win-sound.mp3', 0.9);
  }

  function playAsset(src, vol=1) {
    try {
      const a = new Audio(chromeRuntimeSafe(src));
      a.volume = vol;
      a.play().catch(()=>{ /* تحاشي أخطاء التشغيل التلقائي */ });
    } catch(e){ console.warn('playAsset failed', e); }
  }

  // ===== تتبع مؤشر الفأرة لتحريك سكن الـ overlay =====
  window.addEventListener('mousemove', (ev)=>{
    skinOverlay.style.left = ev.clientX + 'px';
    skinOverlay.style.top = ev.clientY + 'px';
  });

  // ===== أدوات للمطور: واجهة لتفعيل مؤثر عند كشف حدث حقيقي من اللعبة =====
  window.AE = window.AE || {};
  window.AE.triggerKillEffect = triggerKillEffect;
  window.AE.triggerWinEffect = triggerWinEffect;
  window.AE.setSkin = setSkin;
  window.AE.setMapTheme = setMapTheme;

  // ===== مساعدة: تحويل مسار النسخة الخام (raw) إلى مسار صحيح عند التشغيل من GitHub =====
  function chromeRuntimeSafe(path) {
    // عند وضع المشروع على GitHub استخدم raw URL بشكل مباشر في السكربت الذي يحشده
    // هذا الدالة تبقي المسارات كما هي إذا تم فتح index.html مستقلاً من نفس المجلد.
    return path;
  }

  // ===== رصد وجود canvas الأساسي (تلميح لتحسينات لاحقة) =====
  const gameCanvas = document.querySelector('canvas');
  if(gameCanvas) {
    // نجعل الفلاتر CSS تعمل فوق الـ canvas عبر وضع classes على documentElement (تعريفها في style.css)
    // (لا نصلح أو نغير منطق اللعبة — مجرد تأثير بصري)
    console.debug('AE: Found canvas — cosmetic filters enabled.');
  } else {
    console.debug('AE: Canvas not found yet — filters ستطبق متى ما ظهر canvas.');
    // نراقب DOM لإيجاد canvas لاحقًا
    const obs = new MutationObserver(()=> {
      const c = document.querySelector('canvas');
      if(c) {
        console.debug('AE: canvas discovered.');
        obs.disconnect();
      }
    });
    obs.observe(document.documentElement, { childList:true, subtree:true });
  }

  // منع أي خطأ أن يقضي على الـ HUD
  window.addEventListener('error', (e)=> console.warn('AE error', e), true);
})();
