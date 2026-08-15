/* WARP — phone frame into plate */
(function(){
    // Measured screen quad of the photo's iPad (fractions of the plate, TL,TR,BR,BL).
    // This plate ships a chroma-GREEN screen, so it was measured off a green-vs-rest
    // mask rather than the usual dark flood fill.
    var Q = [[0.3350,0.1752],[0.6586,0.2259],[0.6617,0.8400],[0.3318,0.8065]];
    var PLATE_AR = 2400/1800;
    var FW = 703, FH = 1000;     // fill base box = the glass's own aspect (788x1121 on the plate)
    // The fill already matches the glass, so there's nothing to widen — just a hair
    // outward on all four edges so no anti-aliased green survives at the rim.
    var KV = 1.006;
    var KX = 1.006;

    function adj(m){return [m[4]*m[8]-m[5]*m[7],m[2]*m[7]-m[1]*m[8],m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8],m[0]*m[8]-m[2]*m[6],m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6],m[1]*m[6]-m[0]*m[7],m[0]*m[4]-m[1]*m[3]];}
    function mm(a,b){var r=[];for(var i=0;i<3;i++)for(var j=0;j<3;j++){var t=0;for(var k=0;k<3;k++)t+=a[3*i+k]*b[3*k+j];r[3*i+j]=t;}return r;}
    function mv(m,v){return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];}
    function basis(x1,y1,x2,y2,x3,y3,x4,y4){var m=[x1,x2,x3,y1,y2,y3,1,1,1];var v=mv(adj(m),[x4,y4,1]);return mm(m,[v[0],0,0,0,v[1],0,0,0,v[2]]);}
    function proj(a,b){return mm(basis.apply(null,b), adj(basis.apply(null,a)));}
    function scaleEdge(a,b,k){var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
      return [[mx+(a[0]-mx)*k, my+(a[1]-my)*k],[mx+(b[0]-mx)*k, my+(b[1]-my)*k]];}

    function update(block){
      var frame = block.querySelector('.cs-phone-frame');
      if(!frame) return;
      var w = block.clientWidth, h = block.clientHeight;
      if(!w || !h) return;
      var boxAR = w/h, rw, rh, ox, oy;
      if(boxAR > PLATE_AR){ rw=w; rh=w/PLATE_AR; ox=0; oy=(h-rh)/2; }
      else { rh=h; rw=h*PLATE_AR; oy=0; ox=(w-rw)/2; }
      var d = Q.map(function(p){return [ox+p[0]*rw, oy+p[1]*rh];});
      var e = scaleEdge(d[0], d[1], KX); d[0]=e[0]; d[1]=e[1];   // widen top edge
      e = scaleEdge(d[3], d[2], KX); d[3]=e[0]; d[2]=e[1];       // widen bottom edge
      e = scaleEdge(d[0], d[3], KV); d[0]=e[0]; d[3]=e[1];       // stretch left rail
      e = scaleEdge(d[1], d[2], KV); d[1]=e[0]; d[2]=e[1];       // stretch right rail
      var t = proj([0,0, FW,0, FW,FH, 0,FH],
                   [d[0][0],d[0][1], d[1][0],d[1][1], d[2][0],d[2][1], d[3][0],d[3][1]]);
      for(var i=0;i<9;i++) t[i] /= t[8];
      frame.style.transform = 'matrix3d('+[t[0],t[3],0,t[6], t[1],t[4],0,t[7], 0,0,1,0, t[2],t[5],0,t[8]].join(',')+')';
    }

    /* shared observer + width-guarded fallback, same consolidation as the
       hero-mock warp above (was one RO + two window listeners per block) */
    var blocks = Array.prototype.slice.call(document.querySelectorAll('.cs-phone-bleed'));
    var updateAll = function(){ blocks.forEach(update); };
    var ro = new ResizeObserver(function(entries){
      entries.forEach(function(en){ update(en.target); });
    });
    blocks.forEach(function(block){ ro.observe(block); update(block); });
    var lastW = window.innerWidth;
    window.addEventListener('resize', function(){
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      updateAll();
    });
    window.addEventListener('hashchange', function(){ requestAnimationFrame(updateAll); });
  })();
