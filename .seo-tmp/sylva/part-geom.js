  function makeP(aspect) {
    var bh = BOXW / aspect;
    return function (fx, fy, z) {
      return new THREE.Vector3((fx - 0.5) * BOXW, (0.5 - fy) * bh, z || 0);
    };
  }

  function transportFrames(curve, segs) {
    var pts = [], tans = [], nrms = [], i;
    for (i = 0; i <= segs; i++) {
      pts.push(curve.getPointAt(i / segs));
      tans.push(curve.getTangentAt(i / segs).normalize());
    }
    var ref = Math.abs(tans[0].y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
    nrms.push(new THREE.Vector3().crossVectors(tans[0], ref).normalize());
    for (i = 1; i <= segs; i++) {
      var axis = new THREE.Vector3().crossVectors(tans[i - 1], tans[i]);
      var n = nrms[i - 1].clone();
      if (axis.lengthSq() > 1e-12) {
        axis.normalize();
        n.applyAxisAngle(axis, Math.acos(Math.min(1, Math.max(-1, tans[i - 1].dot(tans[i])))));
      }
      nrms.push(n.normalize());
    }
    return { pts: pts, tans: tans, nrms: nrms };
  }

  /* How mossy a point on the bark is. Driven by how far the surface faces the
     light rather than by the tube's own parameters — the arch turns through
     the vertical, and any "up" defined on the cross-section goes degenerate
     there. Two noise fields ride on top: a fine one that frays the moss line
     so it never reads as a stripe, and a slow one that opens bald patches of
     bare wood. Both are sampled in world space, so neighbouring limbs share
     the same weather. */
  function mossCap(p, n, steep) {
    /* On a limb lying flat the camera-facing flank has to stay bark: the
       reference's moss line sits ~25° above horizontal and everything below
       it is pale wood. Weight n.z any harder than that and the cushion wraps
       right around the limb.
       On a limb standing UP there is no upward face at all — every
       cross-section normal is horizontal — so the criterion has to roll over
       to "faces the light", or the arch's legs come out bald. */
    var upness = n.y + n.z * (0.10 + 0.42 * steep) - n.x * (0.05 + 0.45 * steep);
    /* Two scales on the moss line. The fine one keeps it from reading as a
       painted stripe; the coarse one is what makes moss send tongues down the
       flank and lets bare wood push up through the cushion. */
    var fray = fbm2(p.x * 2.30 + 4.4, p.z * 2.30 - p.y * 1.90) - 0.5;
    var tongue = fbm2(p.x * 0.95 + 21.0, p.z * 0.95 - p.y * 0.80) - 0.5;
    var patch = fbm2(p.x * 0.52 + 9.3, p.z * 0.52 + p.y * 0.44);
    var c = sstep(0.16, 0.70, upness + fray * 0.40 + tongue * 0.52);
    /* no floor under the patch term: the cushion has to go properly bald in
       places or the bark never gets to be seen, and the bark is half of what
       makes the root read as wood rather than topiary */
    return c * sstep(0.10, 0.50, patch);
  }
  /* Lumpiness of the cushion itself. Moss is never a smooth offset — without
     this the tube reads as an extruded pipe with a green stripe painted on
     it, whatever the fur does on top. Two scales: broad cushions, and a
     finer bobble inside them. */
  function mossLump(p) {
    return 0.66 + 0.48 * fbm2(p.x * 2.4 - 2.2, p.z * 2.4 + p.y * 2.0)
                + 0.18 * fbm2(p.x * 7.3 + 5.1, p.z * 7.3 - p.y * 4.4) - 0.09;
  }

  /* A limb's thickness is read off the artwork, not invented: `rt` is the
     half-height of the moss-plus-wood band measured column by column out of
     the original PNG's alpha, in local units. Splitting it 0.52 bark / 0.88
     cushion reproduces the reference's section — moss over roughly the top
     45% of the band, bare wood under it. */
  function table(vals) {
    return function (t) {
      var x = clamp01(t) * (vals.length - 1);
      var i = Math.min(vals.length - 2, Math.floor(x));
      return vals[i] + (vals[i + 1] - vals[i]) * (x - i);
    };
  }

  function makeLimb(P, pts, opt) {
    var v3 = pts.map(function (q) { return P(q[0], q[1], q[2]); });
    var curve = new THREE.CatmullRomCurve3(v3, false, 'centripetal', 0.5);
    var rw = opt.rw, moss = opt.moss;
    if (opt.rt) {
      var rt = table(opt.rt);
      rw = function (t) { return rt(t) * 0.52 * knot(t, 0.05, 0.024); };
      moss = function (t) { return rt(t) * 0.88; };
    }
    return {
      curve: curve,
      segs: opt.segs,
      radial: opt.radial,
      rw: rw,
      moss: moss,
      blade: opt.blade || function (t) { return moss(t) * 0.055 + 0.014; },
      sink: opt.sink || 0,
      vScale: opt.vScale,
      fr: transportFrames(curve, opt.segs),
      len: curve.getLength()
    };
  }

  var _fp = new THREE.Vector3(), _ft = new THREE.Vector3(), _fn = new THREE.Vector3(), _fb = new THREE.Vector3();
  function limbFrame(L, t) {
    var f = clamp01(t) * L.segs;
    var i = Math.min(L.segs - 1, Math.floor(f)), a = f - i;
    _fp.copy(L.fr.pts[i]).lerp(L.fr.pts[i + 1], a);
    /* Control points traced off the artwork sit on the MIDLINE of the
       silhouette, but the silhouette is asymmetric — bare wood below, wood
       plus cushion above. The tube's own axis is half a cushion lower. */
    if (L.sink) _fp.y -= L.moss(t) * L.sink;
    _ft.copy(L.fr.tans[i]).lerp(L.fr.tans[i + 1], a).normalize();
    _fn.copy(L.fr.nrms[i]).lerp(L.fr.nrms[i + 1], a);
    _fn.addScaledVector(_ft, -_fn.dot(_ft)).normalize();
    _fb.crossVectors(_ft, _fn).normalize();
  }

  /* the finished surface: bark radius plus the moss cushion sitting on it */
  function limbSurface(L, t, th, outP, outN) {
    limbFrame(L, t);
    var steep = Math.min(1, Math.abs(_ft.y) * 1.15);
    var c = Math.cos(th), s = Math.sin(th);
    outN.set(_fn.x * c + _fb.x * s, _fn.y * c + _fb.y * s, _fn.z * c + _fb.z * s).normalize();
    var rw = L.rw(t);
    outP.copy(_fp).addScaledVector(outN, rw);
    var cap = mossCap(outP, outN, steep);
    var d = rw + L.moss(t) * cap * mossLump(outP);
    outP.copy(_fp).addScaledVector(outN, d);
    return cap;
  }

  /* ---- mesh: build the (segs+1) × (radial+1) grid, then take the normal
          from the grid itself so the displacement is lit, not the tube ---- */
  function tessellate(L, bag) {
    var S = L.segs, R = L.radial;
    var base = bag.pos.length / 3;
    var grid = new Float32Array((S + 1) * (R + 1) * 3);
    var gnrm = new Float32Array((S + 1) * (R + 1) * 3);
    var caps = new Float32Array((S + 1) * (R + 1));
    var p = new THREE.Vector3(), n = new THREE.Vector3();
    var i, j, k;

    for (i = 0; i <= S; i++) {
      for (j = 0; j <= R; j++) {
        var cap = limbSurface(L, i / S, (j / R) * TAU, p, n);
        k = (i * (R + 1) + j) * 3;
        grid[k] = p.x; grid[k + 1] = p.y; grid[k + 2] = p.z;
        caps[i * (R + 1) + j] = cap;
      }
    }

    var a = new THREE.Vector3(), b = new THREE.Vector3(), du = new THREE.Vector3(), dv = new THREE.Vector3();
    function get(i2, j2, out) {
      i2 = Math.min(S, Math.max(0, i2));
      j2 = (j2 + R) % R;                                  /* θ wraps — no seam in the normals */
      var q = (i2 * (R + 1) + j2) * 3;
      return out.set(grid[q], grid[q + 1], grid[q + 2]);
    }

    for (i = 0; i <= S; i++) {
      for (j = 0; j <= R; j++) {
        get(i + 1, j, a); get(i - 1, j, b); du.subVectors(a, b);
        get(i, j + 1, a); get(i, j - 1, b); dv.subVectors(a, b);
        n.crossVectors(dv, du);
        if (n.lengthSq() < 1e-12) { limbSurface(L, i / S, (j / R) * TAU, p, n); } else n.normalize();
        k = (i * (R + 1) + j) * 3;
        bag.pos.push(grid[k], grid[k + 1], grid[k + 2]);
        bag.nor.push(n.x, n.y, n.z);
        /* u is a triangle wave so the bark noise mirrors instead of seaming */
        bag.inf.push(1 - Math.abs(2 * (j / R) - 1), (i / S) * L.vScale, caps[i * (R + 1) + j]);
        gnrm[k] = n.x; gnrm[k + 1] = n.y; gnrm[k + 2] = n.z;
      }
    }
    for (i = 0; i < S; i++) for (j = 0; j < R; j++) {
      var q0 = base + i * (R + 1) + j, q1 = q0 + R + 1;
      bag.idx.push(q0, q1, q0 + 1, q1, q1 + 1, q0 + 1);
    }
    /* the fur is planted straight onto this, so hand it over */
    L.grid = grid; L.gnrm = gnrm; L.gcaps = caps; L.S = S; L.R = R;
  }

  /* ---- blades: planted straight onto the shell grid the tessellator just
          built. Rejection-sampling the surface function instead meant three
          more evaluations of two fBm fields per accepted blade, which at this
          density was 1.3 s of blocked main thread — right on top of the
          entrance animation. Sampling the grid is O(1) per blade, and it also
          guarantees the fur sits exactly on the surface that gets drawn.
          Cells are drawn in proportion to area x moss, so density follows the
          cushion rather than the tube's parameterisation. ---- */
  function plantBlades(L, count, bag) {
    var S = L.S, R = L.R, grid = L.grid, gn = L.gnrm, caps = L.gcaps;
    if (!grid) return 0;
    var cells = S * R, cdf = new Float64Array(cells), total = 0;
    var ax, ay, az, bx, by, bz, cx, cy, cz, i, j, k;

    for (i = 0; i < S; i++) for (j = 0; j < R; j++) {
      var q00 = (i * (R + 1) + j) * 3, q10 = q00 + 3, q01 = ((i + 1) * (R + 1) + j) * 3;
      ax = grid[q10] - grid[q00]; ay = grid[q10 + 1] - grid[q00 + 1]; az = grid[q10 + 2] - grid[q00 + 2];
      bx = grid[q01] - grid[q00]; by = grid[q01 + 1] - grid[q00 + 1]; bz = grid[q01 + 2] - grid[q00 + 2];
      cx = ay * bz - az * by; cy = az * bx - ax * bz; cz = ax * by - ay * bx;
      var area = Math.sqrt(cx * cx + cy * cy + cz * cz);
      var cap = 0.25 * (caps[i * (R + 1) + j] + caps[i * (R + 1) + j + 1] +
                        caps[(i + 1) * (R + 1) + j] + caps[(i + 1) * (R + 1) + j + 1]);
      total += area * cap * cap;
      cdf[i * R + j] = total;
    }
    if (total <= 0) return 0;

    var planted = 0;
    for (var b = 0; b < count; b++) {
      /* binary search the area-weighted cell distribution */
      var target = rng() * total, lo = 0, hi = cells - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (cdf[mid] < target) lo = mid + 1; else hi = mid; }
      i = (lo / R) | 0; j = lo - i * R;
      var u = rng(), v = rng();

      var i0 = i * (R + 1) + j, i1 = i0 + 1, i2 = i0 + R + 1, i3 = i2 + 1;
      var w0 = (1 - u) * (1 - v), w1 = u * (1 - v), w2 = (1 - u) * v, w3 = u * v;
      var cap2 = caps[i0] * w0 + caps[i1] * w1 + caps[i2] * w2 + caps[i3] * w3;
      if (cap2 < 0.05) continue;

      var p0 = i0 * 3, p1 = i1 * 3, p2 = i2 * 3, p3 = i3 * 3;
      var px = grid[p0] * w0 + grid[p1] * w1 + grid[p2] * w2 + grid[p3] * w3;
      var py = grid[p0 + 1] * w0 + grid[p1 + 1] * w1 + grid[p2 + 1] * w2 + grid[p3 + 1] * w3;
      var pz = grid[p0 + 2] * w0 + grid[p1 + 2] * w1 + grid[p2 + 2] * w2 + grid[p3 + 2] * w3;
      /* the grid normal is the CUSHION's normal, lumps and all — standing the
         fur on the smooth cross-section normal instead throws away every bump
         the displacement just built */
      var nx = gn[p0] * w0 + gn[p1] * w1 + gn[p2] * w2 + gn[p3] * w3;
      var ny = gn[p0 + 1] * w0 + gn[p1 + 1] * w1 + gn[p2 + 1] * w2 + gn[p3 + 1] * w3;
      var nz = gn[p0 + 2] * w0 + gn[p1 + 2] * w1 + gn[p2 + 2] * w2 + gn[p3 + 2] * w3;
      var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

      bag.off.push(px, py, pz);
      bag.nrm.push(nx / nl, ny / nl, nz / nl);
      /* One blade in sixteen is a long hair. Uniform-length fur cuts a hard
         edge against the background; the strays are what make the silhouette
         read as moss rather than a hedge trimmed with shears. */
      var stray = rng() < 0.06 ? rand(1.4, 1.9) : 1.0;
      bag.rnd.push(
        rng() * TAU,                                       /* yaw          */
        L.blade((i + v) / S) * (0.45 + 0.60 * cap2) * (0.58 + 0.50 * rng()) * stray,
        (rng() - 0.5) * 1.15,                              /* lean         */
        rng()                                              /* per-blade tone */
      );
      /* two scales of clumping: broad cushions, and the tufts inside them */
      bag.aux.push(fbm2(px * 0.85 + 17.0, pz * 0.85 - py * 0.7) * 0.62 +
                   fbm2(px * 5.60 - 3.3, pz * 5.60 + py * 2.1) * 0.38);
      planted++;
    }
    return planted;
  }

  /* ---- offshoots: a short recursive fork, two generations deep. The root
          is a root, not a tree, so these stay stubby — they exist to break
          the tube's silhouette, not to build a canopy. ---- */
  function growOffshoot(list, start, dir, len, r0, gen) {
    var side = new THREE.Vector3().crossVectors(dir, UP);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize();
    var up = new THREE.Vector3().crossVectors(side, dir).normalize();
    var bow = gen === 0 ? rand(0.10, 0.46) : rand(-0.34, 0.42);
    var kink = rand(-0.26, 0.26);

    function node(f, u2, k) {
      return start.clone()
        .addScaledVector(dir, len * f)
        .addScaledVector(up, len * u2)
        .addScaledVector(side, len * k);
    }
    var pts = [start.clone(), node(0.32, bow * 0.30, kink * 0.70), node(0.68, bow * 0.85, kink * 0.24), node(1.0, bow, kink * 0.44)];
    var curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    var r1 = r0 * 0.52;
    var L = {
      curve: curve, segs: gen === 0 ? 16 : 11, radial: gen === 0 ? 9 : 7,
      /* draw the last few percent down to a point: tubes are open-ended, and
         a twig that simply stops shows a flat hollow cap hanging in the air */
      rw: function (t) { return (r0 + (r1 - r0) * t) * (1 - 0.86 * sstep(0.90, 1.0, t)); },
      moss: function (t) { return (r0 + (r1 - r0) * t) * 0.95 * (1 - 0.55 * t); },
      blade: function (t) { return (r0 + (r1 - r0) * t) * 0.30 * (1 - 0.55 * t) + 0.035; },
      vScale: len * 7.0
    };
    L.fr = transportFrames(curve, L.segs);
    L.len = curve.getLength();
    list.push(L);

    if (gen >= 1) return;
    var kids = Math.round(rand(1, 2));
    for (var i = 0; i < kids; i++) {
      var tt = 0.34 + (i / Math.max(kids, 1)) * 0.5 + rand(-0.06, 0.06);
      var pt = curve.getPointAt(Math.min(tt, 0.98));
      var tan = curve.getTangentAt(Math.min(tt, 0.98)).normalize();
      var ax = new THREE.Vector3().crossVectors(tan, UP);
      if (ax.lengthSq() < 1e-6) ax.set(1, 0, 0);
      ax.normalize().applyAxisAngle(tan, rng() * TAU);
      var kdir = tan.clone().applyAxisAngle(ax, rand(0.45, 1.05)).addScaledVector(UP, 0.16).normalize();
      growOffshoot(list, pt, kdir, len * rand(0.50, 0.74), (r0 + (r1 - r0) * tt) * rand(0.58, 0.78), gen + 1);
    }
  }

  /* ================================================================== *
   * the two roots, traced off the artwork's alpha channel
   * ================================================================== */
  var knot = function (t, a, b) {
    return 1 + a * Math.sin(t * 23.0 + 1.3) + b * Math.sin(t * 57.0 + 0.4) + b * 0.5 * Math.sin(t * 103.0 + 2.2);
  };

  function buildNearRoot() {
    var P = makeP(ARCH.aspect);
    var limbs = [];

    /* the long snaking root: enters left low, crests at 25%, drops into the
       valley at 50%, then runs out through the right edge */
    limbs.push(makeLimb(P, [
      [-0.075, 0.845, -0.62],
      [ 0.000, 0.790, -0.38],
      [ 0.107, 0.695,  0.04],
      [ 0.196, 0.588,  0.28],
      [ 0.250, 0.566,  0.34],
      [ 0.304, 0.603,  0.22],
      [ 0.411, 0.733, -0.10],
      [ 0.500, 0.779, -0.28],
      [ 0.585, 0.742, -0.05],
      [ 0.696, 0.661,  0.20],
      [ 0.750, 0.672,  0.14],
      [ 0.850, 0.640, -0.08],
      [ 0.930, 0.626, -0.30],
      [ 1.030, 0.634, -0.55],
      [ 1.090, 0.638, -0.70]
    ], {
      segs: 300, radial: 26, vScale: 30,
      /* half-band, local units, sampled every 10% of the run */
      rt: [0.575, 0.590, 0.630, 0.680, 0.695, 0.615, 0.580, 0.480, 0.550, 0.550, 0.520], sink: 0.5
    }));

    /* the arch: lifts off the root at 55%, crowns at 73% with a deep moss
       cushion, then plants its leg through the root and off the bottom */
    /* The arch is not one bent tube. Measured column by column, the crown is
       0.88 units wide and 1.90 tall with a 0.86 × 0.94 eye punched under it —
       that is two steep legs fused at the top, not a hoop. Built as two limbs
       that interpenetrate at the peak, which is also how the reference reads:
       different bark and a different moss line on each side. */
    var legRw   = table([0.30, 0.28, 0.26, 0.25, 0.24, 0.23, 0.22]);
    var legMoss = table([0.24, 0.24, 0.23, 0.22, 0.21, 0.20, 0.19]);
    limbs.push(makeLimb(P, [
      [0.532, 0.860,  0.20],
      [0.572, 0.700,  0.28],
      [0.612, 0.540,  0.34],
      [0.652, 0.390,  0.33],
      [0.690, 0.263,  0.26],
      [0.722, 0.180,  0.15],
      [0.752, 0.163,  0.02]
    ], {
      segs: 130, radial: 20, vScale: 22,
      rw:   function (t) { return legRw(t) * knot(t, 0.05, 0.022); },
      moss: legMoss
    }));

    var legR   = table([0.23, 0.25, 0.27, 0.30, 0.33, 0.36, 0.40]);
    var legRm  = table([0.19, 0.20, 0.21, 0.22, 0.24, 0.25, 0.26]);
    limbs.push(makeLimb(P, [
      [0.706, 0.176, -0.02],
      [0.740, 0.158,  0.02],
      [0.772, 0.245, -0.08],
      [0.797, 0.400, -0.18],
      [0.816, 0.570, -0.22],
      [0.836, 0.760, -0.18],
      [0.858, 0.950, -0.08],
      [0.888, 1.180,  0.04]
    ], {
      segs: 150, radial: 20, vScale: 22,
      rw:   function (t) { return legR(t) * knot(t, 0.05, 0.022); },
      moss: legRm
    }));

    return limbs;
  }

  function buildFarRoot() {
    var P = makeP(FAR.aspect);
    return [makeLimb(P, [
      [-0.060, 0.880, -0.35],
      [ 0.100, 0.762, -0.05],
      [ 0.210, 0.698,  0.22],
      [ 0.300, 0.570,  0.30],
      [ 0.410, 0.467,  0.18],
      [ 0.500, 0.500, -0.05],
      [ 0.600, 0.622, -0.22],
      [ 0.720, 0.748, -0.26],
      [ 0.800, 0.788, -0.08],
      [ 0.900, 0.660,  0.14],
      [ 0.990, 0.454,  0.28]
    ], {
      segs: 220, radial: 20, vScale: 26,
      rt: [0.760, 0.900, 0.900, 0.960, 0.925, 0.950, 1.020, 1.020, 0.990, 1.100, 1.300], sink: 0.5
    })];
  }

  /* ================================================================== *
   * shaders
   * ================================================================== */