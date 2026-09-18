(function(){
  // ---- Mega-menu (click toggle, works for touch + mouse; hover still works via CSS) ----
  var servicesItem = document.getElementById('servicesNavItem');
  var servicesTrigger = document.getElementById('servicesTrigger');
  servicesTrigger.addEventListener('click', function(e){
    e.stopPropagation();
    var isOpen = servicesItem.classList.toggle('open');
    servicesTrigger.setAttribute('aria-expanded', isOpen ? 'true':'false');
  });
  document.addEventListener('click', function(e){
    if(!servicesItem.contains(e.target)){ servicesItem.classList.remove('open'); servicesTrigger.setAttribute('aria-expanded','false'); }
  });

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function(){
    var showing = navLinks.style.display === 'flex';
    navLinks.style.display = showing ? 'none' : 'flex';
    navLinks.style.cssText += showing ? '' : 'position:absolute;top:100%;left:0;right:0;background:#FFFFFF;flex-direction:column;padding:20px 40px;border-bottom:1px solid rgba(154,205,50,0.15);gap:18px;';
  });

  // ---- Selected work marquee: duplicate cards for a seamless loop ----
  var projectTrack = document.getElementById('projectTrack');
  projectTrack.innerHTML += projectTrack.innerHTML;

  // ---- Hero frame + method phase highlight ----
  var phaseSection = document.getElementById('method');
  var methodTitle = document.getElementById('methodTitle');
  var methodGhost = document.getElementById('methodGhost');
  var canvas = document.getElementById('methodCanvas');
  var ctx = canvas.getContext('2d');
  var railItems = document.querySelectorAll('#phaseRail li');
  var phaseBlocks = document.querySelectorAll('.phase-block');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sources = window.__TRION_FRAMES__ || [];
  var images = [];
  var currentIndex = -1;
  var currentPhase = -1;
  var methodTitles = ['Discover', 'Plan', 'Build', 'Test', 'Launch'];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas(){
    var rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  function drawFrame(idx){
    var img = images[idx];
    if(!img || !img.complete || img.naturalWidth === 0) return;
    var cw = canvas.width, ch = canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    var dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.clearRect(0,0,cw,ch);
    ctx.drawImage(img, dx, dy, dw, dh);
    currentIndex = idx;
  }

  function setPhase(idx){
    currentPhase = idx;
    methodTitle.textContent = methodTitles[idx];
    methodGhost.textContent = '0' + (idx + 1);
    methodTitle.classList.remove('method-title-in');
    void methodTitle.offsetWidth;
    methodTitle.classList.add('method-title-in');
    railItems.forEach(function(li,i){ li.classList.toggle('active', i===idx); });
    phaseBlocks.forEach(function(pb){ pb.classList.toggle('active', parseInt(pb.dataset.phase,10)===idx); });
  }

  function updatePhase(){
    var phaseRect = phaseSection.getBoundingClientRect();
    var phaseScrollable = phaseRect.height - window.innerHeight;
    var phaseProgress = phaseScrollable > 0 ? (-phaseRect.top) / phaseScrollable : 0;
    phaseProgress = Math.min(1, Math.max(0, phaseProgress));
    var phaseIdx = Math.min(4, Math.floor(phaseProgress * 5));
    if(phaseIdx !== currentPhase) setPhase(phaseIdx);
    updateMethodTheme(phaseProgress);
  }

  function updateMethodTheme(progress){
    var transition = Math.min(1, Math.max(0, (progress - 0.12) / 0.42));
    var blend = function(dark, light){ return Math.round(dark + (light - dark) * transition); };
    phaseSection.style.setProperty('--method-bg', blend(255, 154) + ',' + blend(255, 205) + ',' + blend(255, 50));
    phaseSection.style.setProperty('--method-text', blend(0, 255) + ',' + blend(0, 255) + ',' + blend(0, 255));
    phaseSection.style.setProperty('--method-muted', blend(0, 245) + ',' + blend(0, 245) + ',' + blend(0, 245));
    phaseSection.style.setProperty('--method-heading', blend(23, 255) + ',' + blend(32, 255) + ',' + blend(23, 255));
    phaseSection.style.setProperty('--method-accent', blend(0, 255) + ',' + blend(0, 255) + ',' + blend(0, 255));
    phaseSection.style.setProperty('--method-accent-light', blend(0, 255) + ',' + blend(0, 255) + ',' + blend(0, 255));
    phaseSection.style.setProperty('--method-border', blend(0, 255) + ',' + blend(0, 255) + ',' + blend(0, 255));
  }

  var ticking = false;
  function onScroll(){
    if(!ticking){ window.requestAnimationFrame(function(){ ticking = false; updatePhase(); }); ticking = true; }
  }

  function preload(){
    function loadFrame(i){
      var img = new Image();
      img.decoding = 'async';
      img.onload = function(){
        sizeCanvas();
        drawFrame(0);
      };
      images[i] = img;
      img.src = sources[i];
    }

    loadFrame(0);
  }

  sizeCanvas();
  preload();
  drawFrame(0);
  updateMethodTheme(0);

  if(!reduceMotion){
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', function(){ sizeCanvas(); drawFrame(0); });
  } else {
    window.addEventListener('resize', function(){ sizeCanvas(); drawFrame(0); });
    setPhase(0);
  }
})();
