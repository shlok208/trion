(function(){
  // ---- Floating navigation: hide while scrolling down, reveal while scrolling up ----
  var nav = document.querySelector('.nav');
  var lastScrollY = window.scrollY;
  var navTicking = false;
  function updateNav(){
    var scrollY = window.scrollY;
    if(scrollY > 24 && scrollY > lastScrollY){ nav.classList.add('nav-hidden'); }
    if(scrollY < lastScrollY || scrollY <= 24){ nav.classList.remove('nav-hidden'); }
    lastScrollY = scrollY;
    navTicking = false;
  }
  window.addEventListener('scroll', function(){
    if(!navTicking){ window.requestAnimationFrame(updateNav); navTicking = true; }
  }, { passive:true });

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
    navLinks.style.cssText += showing ? '' : 'position:absolute;top:100%;left:0;right:0;background:#08080a;flex-direction:column;padding:20px 40px;border-bottom:1px solid rgba(245,166,35,0.15);gap:18px;';
  });

  // ---- Testimonials marquee: duplicate track for seamless loop ----
  var tTrack = document.getElementById('tTrack');
  tTrack.innerHTML += tTrack.innerHTML;

  // ---- Hero animation: continuous looping frame sequence + method phase highlight ----
  var heroOverlay = document.getElementById('heroOverlay');
  var heroVisual = document.querySelector('.hero-visual');
  var phaseSection = document.getElementById('method');
  var canvas = document.getElementById('methodCanvas');
  var ctx = canvas.getContext('2d');
  var railItems = document.querySelectorAll('#phaseRail li');
  var phaseBlocks = document.querySelectorAll('.phase-block');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sources = window.__TRION_FRAMES__ || [];
  var images = [];
  var currentIndex = -1;
  var currentPhase = -1;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var playbackIndex = 0;
  var playbackDirection = 1;
  var lastFrameTime = 0;
  var frameDuration = 1000 / 24;

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
    railItems.forEach(function(li,i){ li.classList.toggle('active', i===idx); });
    phaseBlocks.forEach(function(pb){ pb.classList.toggle('active', parseInt(pb.dataset.phase,10)===idx); });
  }

  function updatePhase(){
    if(!images.length) return;
    var phaseRect = phaseSection.getBoundingClientRect();
    var phaseScrollable = phaseRect.height - window.innerHeight;
    var phaseProgress = phaseScrollable > 0 ? (-phaseRect.top) / phaseScrollable : 0;
    phaseProgress = Math.min(1, Math.max(0, phaseProgress));
    var phaseIdx = Math.min(4, Math.floor(phaseProgress * 5));
    if(phaseIdx !== currentPhase) setPhase(phaseIdx);
  }

  var ticking = false;
  function onScroll(){
    if(!ticking){ window.requestAnimationFrame(function(){ ticking = false; updatePhase(); }); ticking = true; }
  }

  function playAnimation(timestamp){
    if(timestamp - lastFrameTime >= frameDuration){
      if(images[playbackIndex] && images[playbackIndex].complete){ drawFrame(playbackIndex); }
      if(playbackIndex >= sources.length - 1){ playbackDirection = -1; }
      if(playbackIndex <= 0){ playbackDirection = 1; }
      playbackIndex += playbackDirection;
      lastFrameTime = timestamp;
    }
    window.requestAnimationFrame(playAnimation);
  }

  function preload(){
    var nextIndex = 0;
    var activeLoads = 0;
    var maxConcurrentLoads = 4;

    function loadNext(){
      while(activeLoads < maxConcurrentLoads && nextIndex < sources.length){
        loadFrame(nextIndex++);
      }
    }

    function loadFrame(i){
      var img = new Image();
      activeLoads++;
      img.decoding = 'async';
      img.onload = function(){
        activeLoads--;
        if(i===0){ sizeCanvas(); drawFrame(0); }
        loadNext();
      };
      img.onerror = function(){ activeLoads--; loadNext(); };
      images[i] = img;
      img.src = sources[i];
    }

    loadNext();
  }

  sizeCanvas();
  preload();

  if(!reduceMotion){
    window.requestAnimationFrame(playAnimation);
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', function(){ sizeCanvas(); drawFrame(currentIndex<0?0:currentIndex); });
  } else {
    window.addEventListener('resize', function(){ sizeCanvas(); drawFrame(0); });
    setPhase(0);
  }
})();
