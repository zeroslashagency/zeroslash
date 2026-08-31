  var rng = (function () {
    var a = 0x3f9a1c7b;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  function rand(lo, hi) { return lo + (hi - lo) * rng(); }
  function sstep(a, b, x) { var t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); }
  function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }

  /* integer hash, not sin(): the lattice is only ever queried at whole
     coordinates, and Math.sin here cost more than everything else the
     builder does put together */
  function hash2(x, y) {
    var n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
    var t = a + (b - a) * ux;
    return t + ((c + (d - c) * ux) - t) * uy;
  }
  /* rotate each octave as well as scaling it, so the lattice never resolves */
  function fbm2(x, y) {
    var s = 0, amp = 0.5, nx, ny;
    for (var i = 0; i < 4; i++) {
      s += amp * vnoise(x, y);
      nx = 0.80 * x + 0.60 * y; ny = -0.60 * x + 0.80 * y;
      x = nx * 2.07 + 3.1; y = ny * 2.07 - 1.7; amp *= 0.5;
    }
    return s / 0.9375;                                   /* ~[0,1] */
  }

  /* ================================================================== *
   * limbs — a tube swept along a measured centreline, its upper flank
   * pushed out by however deep the moss lies there
   * ================================================================== */