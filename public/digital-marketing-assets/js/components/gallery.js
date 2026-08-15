/* GALLERY — design-system seamless loop */
/* design-system gallery: seamless, non-interactive auto-scroll loop */
  (function(){
    var g = document.querySelector('#hatcha-view .cs-gallery');
    if(!g) return;
    /* mobile: the gallery stacks into a plain vertical run, so neither the
       duplicate tile set nor the rAF scrollLeft loop has anything to do —
       and the loop would fight the page's own scrolling. */
    if(document.documentElement.classList.contains('cs-static')) return;

    /* duplicate the tile set once so the loop wraps invisibly */
    var originals = Array.prototype.slice.call(g.children);
    var half = 0;
    originals.forEach(function(node){
      var c = node.cloneNode(true);
      c.setAttribute('data-clone','');
      c.setAttribute('aria-hidden','true');
      g.appendChild(c);
      c.querySelectorAll('video').forEach(function(v){
        v.muted = true; var p = v.play && v.play(); if(p && p.catch) p.catch(function(){});
      });
    });
    /* ── measuring the wrap distance is the whole ballgame ──
       #hatcha-view starts hidden on every load that doesn't open straight into the
       case study, and inside a display:none subtree every offsetLeft is 0 — so the
       original one-shot measure() left half at 0, the loop's half>0 test never
       passed, and the marquee sat dead unless something happened to fire a resize.
       Measuring once on first paint isn't enough either: the tiles are sized by
       images and videos that haven't decoded yet, so an early read returns a couple
       of px and locks THAT in. So: re-measure until the value repeats for half a
       second, and re-arm on anything that can change tile widths. */
    var settled = 0;
    function measure(){
      var first = g.children[0], mid = g.children[originals.length];
      if(!mid || !g.offsetParent) return;
      var h = mid.offsetLeft - first.offsetLeft;
      if(h <= 0) return;
      settled = (h === half) ? settled + 1 : 0;
      half = h;
    }
    function remeasure(){ settled = 0; measure(); }
    measure();
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    window.addEventListener('hashchange', function(){ requestAnimationFrame(remeasure); });
    g.querySelectorAll('img').forEach(function(im){ im.addEventListener('load', remeasure); });
    g.querySelectorAll('video').forEach(function(v){ v.addEventListener('loadedmetadata', remeasure); });

    function norm(){
      if(half > 0){
        while(g.scrollLeft >= half) g.scrollLeft -= half;
        while(g.scrollLeft < 0)     g.scrollLeft += half;
      }
    }

    var speed = 1.4;                 /* px per frame (~84px/s) — clearly, gently auto-scrolling */
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* the loop runs ONLY while #hatcha-view is actually shown (and the tab is
       visible) — the old unconditional rAF ran forever on every route, and its
       per-frame g.offsetParent guard was itself a layout read. Visibility is
       tracked via the view's `hidden` attribute instead of read per frame. */
    var view = document.getElementById('hatcha-view');
    var running = false;
    function tick(){
      if(!running) return;           // view hidden → loop parks until re-shown
      if(!reduce){
        if(settled < 30) measure();  // ~0.5s of agreement, then stop forcing layout each frame
        if(half > 0){
          g.scrollLeft += speed;
          norm();
        }
      }
      requestAnimationFrame(tick);
    }
    function syncRunning(){
      var on = !view.hidden && !document.hidden;
      if(on === running) return;
      running = on;
      if(on){ settled = 0; requestAnimationFrame(tick); }
    }
    new MutationObserver(syncRunning).observe(view, { attributes:true, attributeFilter:['hidden'] });
    document.addEventListener('visibilitychange', syncRunning);
    syncRunning();
  })();
