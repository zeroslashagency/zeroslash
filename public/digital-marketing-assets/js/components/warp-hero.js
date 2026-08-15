/* WARP — hero recording into laptop quad */
(function(){
    // Screen-quad corners as fractions of the plate (measured off cs-hero-laptop.png).
    // Order: TL, TR, BR, BL.
    var Q = [[0.3933,0.3257],[0.5851,0.3071],[0.5955,0.6063],[0.4021,0.6352]];
    // Base box takes the SCREEN's aspect (measured quad is 458.2x307.6px on the
    // 2376x1008 plate), not the 1294x920 recording's — object-fit:cover then crops
    // ~3% off the top and bottom of the capture instead of stretching it.
    var SW = 1000, SH = 671;
    // Pull the quad in toward its centroid so the plate's black bezel shows
    // around the video — real screens never run content to the aluminum edge.
    // Insetting in screen space means the near (bottom) edge gets a thicker
    // margin than the far (top) edge, which is the correct look in perspective.
    var INSET = 0.028;
    var BOTTOM_INSET = 0.032;

    function adj(m){return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]];}
    function mm(a,b){var r=[];for(var i=0;i<3;i++)for(var j=0;j<3;j++){var s=0;for(var k=0;k<3;k++)s+=a[3*i+k]*b[3*k+j];r[3*i+j]=s;}return r;}
    function mv(m,v){return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];}
    function basis(x1,y1,x2,y2,x3,y3,x4,y4){
      var m=[x1,x2,x3,y1,y2,y3,1,1,1];
      var v=mv(adj(m),[x4,y4,1]);
      return mm(m,[v[0],0,0,0,v[1],0,0,0,v[2]]);}
    function proj(a,b){return mm(basis.apply(null,b), adj(basis.apply(null,a)));}

    function update(mock){
      var vid = mock.querySelector('.cs-hero-vid');
      if(!vid) return;
      var w = mock.clientWidth, h = mock.clientHeight;
      if(!w || !h) return; // hidden (display:none) — skip until shown
      // Per-element config via data-warp (JSON). Absent → the laptop defaults
      // above, so the hero + home tile keep working with no attribute.
      var cfg = mock.__warp || (mock.__warp = mock.dataset.warp ? JSON.parse(mock.dataset.warp) : {});
      var q = cfg.Q || Q, sw = cfg.sw || SW, sh = cfg.sh || SH;
      var inset = cfg.inset != null ? cfg.inset : INSET;
      var bottomInset = cfg.bottomInset != null ? cfg.bottomInset : BOTTOM_INSET;
      var vext = cfg.vext || 0; // push the top+bottom edges back out along the side rails
      // Mirror the plate's object-fit:cover so the quad tracks the screen even
      // when the box aspect differs from the plate (e.g. the fixed-height tile).
      var plateAR = cfg.plateAR || (2376 / 1008), boxAR = w / h, rw, rh, ox, oy;
      if(boxAR > plateAR){ rw = w; rh = w / plateAR; ox = 0; oy = (h - rh) / 2; }
      else { rh = h; rw = h * plateAR; oy = 0; ox = (w - rw) / 2; }
      // Optional scene zoom, read from CSS so media queries can drive it (--warp-zoom).
      // Sitting a scene in closer via transform:scale() on the .cs-hero-zoom wrapper costs
      // real sharpness: the compositor rasterizes that layer once and GPU-stretches it, so
      // the video texture is resampled twice. Folding the same zoom into the cover-fit rect
      // here instead lets the video be sampled straight to its final size — measured 17%
      // sharper on the watch mockup, which is the one that needs the legibility. The plate
      // is grown to match in CSS (width/left off the same variable), so the two stay locked.
      var zoom = parseFloat(getComputedStyle(mock).getPropertyValue('--warp-zoom')) || 1;
      if(zoom !== 1){
        rw *= zoom; rh *= zoom;
        ox = ox * zoom - (zoom - 1) / 2 * w;   // == scaling the cover rect about the mock centre
        oy = oy * zoom - (zoom - 1) / 2 * h;
      }
      var d = q.map(function(p){return [ox + p[0]*rw, oy + p[1]*rh];});
      var cx = (d[0][0]+d[1][0]+d[2][0]+d[3][0])/4, cy = (d[0][1]+d[1][1]+d[2][1]+d[3][1])/4;
      d = d.map(function(p){return [p[0] + (cx-p[0])*inset, p[1] + (cy-p[1])*inset];});
      // Extra lift on the bottom edge: slide BR→TR and BL→TL along the side
      // rails so the lower bezel is as thick as the sides (a laptop's bottom
      // sits at the hinge; a phone sets bottomInset:0 for a uniform bezel).
      d[2] = [d[2][0] + (d[1][0]-d[2][0])*bottomInset, d[2][1] + (d[1][1]-d[2][1])*bottomInset];
      d[3] = [d[3][0] + (d[0][0]-d[3][0])*bottomInset, d[3][1] + (d[0][1]-d[3][1])*bottomInset];
      if(vext){ // extend top edge up and bottom edge down along the side rails.
        // A uniform centroid inset over-thickens the far top/bottom bezel of a
        // tall portrait screen; this pushes those two edges back toward the glass.
        var a0=d[0],a1=d[1],a2=d[2],a3=d[3];
        d[0]=[a0[0]+(a0[0]-a3[0])*vext, a0[1]+(a0[1]-a3[1])*vext]; // TL out along BL→TL
        d[1]=[a1[0]+(a1[0]-a2[0])*vext, a1[1]+(a1[1]-a2[1])*vext]; // TR out along BR→TR
        d[2]=[a2[0]+(a2[0]-a1[0])*vext, a2[1]+(a2[1]-a1[1])*vext]; // BR out along TR→BR
        d[3]=[a3[0]+(a3[0]-a0[0])*vext, a3[1]+(a3[1]-a0[1])*vext]; // BL out along TL→BL
      }
      // Optional source offset: map a SUB-RECT of the element onto the screen quad
      // instead of the whole element. Lets a recording whose capture carries empty
      // margins be scaled + shifted so its live area fills the glass, with the empty
      // strips landing outside the quad (on the plate's black bezel) rather than being
      // cut out of the file. Absent → 0, so every other mockup is unaffected.
      var sx = cfg.sx || 0, sy = cfg.sy || 0;
      var t = proj([sx,sy, sx+sw,sy, sx+sw,sy+sh, sx,sy+sh],
                   [d[0][0],d[0][1], d[1][0],d[1][1], d[2][0],d[2][1], d[3][0],d[3][1]]);
      for(var i=0;i<9;i++) t[i] /= t[8];
      var m = [t[0],t[3],0,t[6], t[1],t[4],0,t[7], 0,0,1,0, t[2],t[5],0,t[8]];
      vid.style.transform = 'matrix3d('+m.join(',')+')';
    }

    // the route hero transition clones a mock into a fixed overlay; that clone was
    // never registered here, and its source lived in a display:none view so it may
    // carry no matrix at all. Let the transition recompute the warp on demand.
    window.csWarpUpdate = update;

    /* ONE observer + ONE listener set for all mocks — this used to register a
       ResizeObserver, a window resize listener AND a hashchange listener PER
       mock (13 of each), so every iOS toolbar show/hide fired 13 handlers doing
       style+layout reads mid-scroll. The shared window listeners are belt and
       braces for view swaps; the ResizeObserver still catches every real box
       change, so the resize fallback can skip height-only events entirely. */
    var mocks = Array.prototype.slice.call(document.querySelectorAll('[data-hero-mock]'));
    var updateAll = function(){ mocks.forEach(update); };
    var ro = new ResizeObserver(function(entries){
      entries.forEach(function(en){ update(en.target); });
    });
    mocks.forEach(function(mock){
      ro.observe(mock);
      var v = mock.querySelector('.cs-hero-vid');
      if (v) v.addEventListener('loadedmetadata', function(){ update(mock); });
      update(mock);
    });
    var lastW = window.innerWidth;
    window.addEventListener('resize', function(){
      if (window.innerWidth === lastW) return;   // height-only (mobile toolbar) → RO covers real changes
      lastW = window.innerWidth;
      updateAll();
    });
    window.addEventListener('hashchange', function(){ requestAnimationFrame(updateAll); });
  })();
