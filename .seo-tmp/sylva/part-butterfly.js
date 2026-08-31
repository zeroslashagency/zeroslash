  /* ── butterfly ───────────────────────────────────────────────────────
     Lifted from sakura-branch-hero: the wings are modelled to their real
     outline rather than alpha-cut from a texture, the scale pattern is baked
     once into (span, chord) rather than evaluated per fragment, and the
     flight is a cycle — cruise, approach, settle on a nominated perch with
     the wings held open, take off, round again.

     Two things are different here. The blue is a morpho's structural
     colour; this one is a swallowtail's yellow-green, so the face and edge
     hues are re-solved while the angle-dependence that makes it read as
     diffraction rather than paint is kept. And it lives inside nearGroup, so
     it is modelled in the root's own local units and rides the branch's
     placement, scale and parallax for free — including the perch, which is
     a point on the moss rather than on a blossom. */
  var bf = null;

  function wingGeometry(hind) {
    var NS = 30, NU = 10, pos = [], uv = [], idx = [], i, j;
    for (i = 0; i < NS; i++) {
      var sp = i / (NS - 1), lead, chord, span;
      if (!hind) {
        span  = 0.95;
        lead  = 0.10 + 0.32 * sp - 0.14 * sp * sp;
        chord = (0.56 + 0.46 * sp) * Math.pow(Math.max(0, 1 - Math.pow(sp, 2.6)), 0.55);
      } else {
        span  = 0.78;
        lead  = -0.06 - 0.26 * sp;
        chord = (0.54 + 0.48 * sp) * Math.pow(Math.max(0, 1 - Math.pow(sp, 2.2)), 0.55);
        chord *= 1 + 0.035 * Math.cos(sp * 22.0);
      }
      /* both pairs hinge on the thorax, so both roots have to be short or the
         wing floats beside the body instead of growing out of it */
      chord *= 0.26 + 0.74 * sstep(0, 0.32, sp);
      chord = Math.max(chord, 0.014);
      for (j = 0; j < NU; j++) {
        var u = j / (NU - 1);
        var cam = 0.030 * Math.sin(Math.PI * u) * (1 - 0.35 * sp);
        pos.push(0.018 + sp * span, cam, lead - chord * u);
        uv.push(sp, u);
      }
    }
    for (i = 0; i < NS - 1; i++) for (j = 0; j < NU - 1; j++) {
      var a = i * NU + j, b = a + NU;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }

  /* Baked once: the pattern is a pure function of (span, chord), so a dozen
     noise octaves per fragment per frame was paying over and over for a
     constant. R rows, G grain, B mottle, A shimmer. */
  function wingTexture() {
    var N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N;
    var ctx = cv.getContext('2d'), img = ctx.createImageData(N, N), d = img.data;
    function h2(x, y) {
      var a = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
      var b = Math.sin(x * 269.5 + y * 183.3) * 43758.5453123;
      return [(a - Math.floor(a)) * 2 - 1, (b - Math.floor(b)) * 2 - 1];
    }
    function gn(x, y) {
      var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      var g00 = h2(ix, iy), g10 = h2(ix + 1, iy), g01 = h2(ix, iy + 1), g11 = h2(ix + 1, iy + 1);
      var a = g00[0] * fx + g00[1] * fy, b = g10[0] * (fx - 1) + g10[1] * fy;
      var c = g01[0] * fx + g01[1] * (fy - 1), e = g11[0] * (fx - 1) + g11[1] * (fy - 1);
      var top = a + (b - a) * ux, bot = c + (e - c) * ux;
      return top + (bot - top) * uy;
    }
    function fb(x, y, oct) {
      var sum = 0, amp = 0.5;
      for (var i = 0; i < oct; i++) {
        sum += amp * gn(x, y);
        var nx = 0.8 * x + 0.6 * y, ny = -0.6 * x + 0.8 * y;
        x = nx * 2.03; y = ny * 2.03; amp *= 0.5;
      }
      return sum;
    }
    var b255 = function (v) { return Math.max(0, Math.min(255, Math.round((v * 0.5 + 0.5) * 255))); };
    for (var yi = 0; yi < N; yi++) {
      var u = yi / (N - 1);
      for (var xi = 0; xi < N; xi++) {
        var sp = xi / (N - 1), o = (yi * N + xi) * 4;
        d[o]     = b255(fb(u * 70.0, sp * 16.0, 4));
        d[o + 1] = b255(gn(u * 165.0, sp * 52.0));
        d[o + 2] = b255(fb(sp * 4.5, u * 3.0, 3));
        d[o + 3] = b255(fb(sp * 6.5 + 4.0, u * 4.5, 3));
      }
    }
    ctx.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(cv);
    t.flipY = false;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  }

  function wingMaterial(hind, bend, tex, uni) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uKeyDir: uni.uKeyDir, uKeyCol: uni.uKeyCol, uAmbCol: uni.uAmbCol,
        uBend: bend, uHind: { value: hind ? 1 : 0 }, uTex: { value: tex }
      },
      side: THREE.DoubleSide,
      extensions: { derivatives: true },
      vertexShader: [
        'uniform float uBend;',
        'varying vec2 vUv; varying vec3 vN; varying vec3 vW;',
        'void main(){',
        '  vUv = uv;',
        /* the tip lags the stroke — a rigid flapping plate reads as paper */
        '  vec3 p = position;',
        '  float s = uv.x;',
        '  p.y += uBend * s * s;',
        '  p.z += uBend * s * s * (uv.y - 0.45) * 0.35;',
        '  vN = normalize(normalMatrix * normal);',
        '  vec4 wp = modelMatrix * vec4(p, 1.0);',
        '  vW = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision highp float;',
        'uniform vec3 uKeyDir, uKeyCol, uAmbCol;',
        'uniform float uHind;',
        'uniform sampler2D uTex;',
        'varying vec2 vUv; varying vec3 vN; varying vec3 vW;',
        'void main(){',
        '  float s = vUv.x, u = vUv.y;',
        '  vec3 N = normalize(vN);',
        '  if (!gl_FrontFacing) N = -N;',
        '  vec3 V = normalize(cameraPosition - vW);',
        /* Structural colour, not pigment: the hue swings with viewing angle —
           a hot chartreuse square on, sliding to deep green at a glance.
           Albedo runs past 1 on purpose; it is HDR into ACES. */
        '  float facing = abs(dot(N, V));',
        /* Kept well under 1: on the cherry bough this ran HDR into ACES on
           purpose, but that scene was a sunset. Here the same numbers clip to
           cream and the green never arrives. */
        '  vec3 face = vec3(0.330, 0.560, 0.042);',
        '  vec3 edge = vec3(0.062, 0.190, 0.014);',
        '  vec3 wing = mix(edge, face, pow(facing, 0.65));',
        '  wing *= 0.62 + 0.72 * smoothstep(0.02, 0.46, s) * (1.0 - 0.34 * smoothstep(0.45, 1.0, u));',
        /* scales lie in overlapping rows running out from the base */
        '  vec4 tx = texture2D(uTex, vUv);',
        '  float rows = tx.r, grain = tx.g, mottle = tx.b, shim = tx.a;',
        '  wing *= 0.78 + 0.44 * mottle;',
        /* the hue swings green to yellow across the disc rather than merely
           brightening — that swing is what reads as diffraction */
        '  wing = mix(wing * vec3(0.46, 1.14, 0.30), wing * vec3(1.34, 1.06, 0.16), shim);',
        '  vec3 dark  = vec3(0.030, 0.026, 0.014);',
        '  vec3 cream = vec3(0.520, 0.500, 0.290);',
        '  vec3 amber = vec3(0.400, 0.270, 0.045);',
        /* the wide sooty border down the whole distal edge */
        '  float border = max(smoothstep(0.60, 0.74, s), smoothstep(0.78, 0.94, u));',
        '  vec3 c = mix(wing, dark, border);',
        /* veins: pale tan over the wing, lost inside the border */
        '  float vp = pow(u, 0.72) * 5.2 + s * 0.55 + (mottle - 0.5) * 0.22;',
        '  float vk = abs(fract(vp) - 0.5) * 2.0;',
        '  float aa = fwidth(vp) * 2.0 + 0.045;',
        '  float vw = 0.050 * (1.0 - 0.42 * s);',
        '  float vein = 1.0 - smoothstep(vw, vw + aa, vk);',
        '  c = mix(c, vec3(0.430, 0.400, 0.180), vein * 0.26 * (1.0 - border * 0.85));',
        /* lunules set into the border: cream on the forewing, amber behind */
        '  float lunBand = exp(-pow((border - 0.58) / 0.20, 2.0));',
        '  float edgeT = u * 0.62 + s * 0.58;',
        '  float lun = exp(-pow((fract(edgeT * 7.0) - 0.5) * 4.2, 2.0));',
        '  c = mix(c, mix(cream, amber, uHind), border * lunBand * lun * 0.90);',
        /* the big apical blazes, forewing only */
        '  float ap1 = exp(-pow((s - 0.86) / 0.085, 2.0)) * exp(-pow((u - 0.15) / 0.100, 2.0));',
        '  float ap2 = exp(-pow((s - 0.66) / 0.070, 2.0)) * exp(-pow((u - 0.07) / 0.075, 2.0));',
        '  c = mix(c, cream, (1.0 - uHind) * clamp(ap1 + ap2 * 0.75, 0.0, 1.0) * 0.42);',
        '  c *= 0.88 + 0.25 * rows;',
        '  c *= 0.935 + 0.13 * grain;',
        /* the very edge is a fringe of loose scales, paler and duller */
        '  float rim = clamp(smoothstep(0.93, 1.0, s) + smoothstep(0.955, 1.0, u), 0.0, 1.0);',
        '  c = mix(c, vec3(0.230, 0.215, 0.150), rim * 0.55);',
        '  float wrap = dot(N, uKeyDir) * 0.5 + 0.5;',
        '  vec3 lit = c * (uKeyCol * (0.34 + 1.05 * wrap) + uAmbCol * (0.5 + 0.5 * N.y) * 1.5);',
        /* light burning through the membrane from behind */
        '  float back = pow(max(dot(V, -uKeyDir), 0.0), 2.4);',
        '  lit += mix(vec3(0.86, 0.78, 0.20), vec3(0.34, 0.60, 0.12), border) * back * 0.42;',
        '  float sheen = pow(max(dot(reflect(-uKeyDir, N), V), 0.0), 26.0);',
        '  lit += vec3(0.86, 0.96, 0.52) * sheen * 0.34 * (1.0 - border);',
        '  gl_FragColor = vec4(lit, 1.0);',
        '  #include <tonemapping_fragment>',
        '  #include <encodings_fragment>',
        '}'
      ].join('\n')
    });
  }

  function buildButterfly(host, limbs, uni) {
    var group = new THREE.Group();
    var bend = { fore: { value: 0 }, hind: { value: 0 } };
    var tex = wingTexture();
    var foreG = wingGeometry(false), hindG = wingGeometry(true);
    var foreM = wingMaterial(false, bend.fore, tex, uni), hindM = wingMaterial(true, bend.hind, tex, uni);

    var wR1 = new THREE.Mesh(foreG, foreM), wL1 = new THREE.Mesh(foreG, foreM);
    var wR2 = new THREE.Mesh(hindG, hindM), wL2 = new THREE.Mesh(hindG, hindM);
    wL1.scale.x = -1; wL2.scale.x = -1;
    wR1.position.set(0.012, 0.012, 0); wL1.position.copy(wR1.position);
    wR2.position.set(0.010, 0.000, 0); wL2.position.copy(wR2.position);
    group.add(wR1, wL1, wR2, wL2);

    /* ---- body ---- */
    var bodyMat = new THREE.ShaderMaterial({
      uniforms: { uKeyDir: uni.uKeyDir, uKeyCol: uni.uKeyCol, uAmbCol: uni.uAmbCol },
      vertexShader: [
        'varying vec3 vN; varying vec3 vW; varying vec3 vP;',
        'void main(){',
        '  vN = normalize(normalMatrix * normal); vP = position;',
        '  vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: NOISE_GLSL + [
        'precision highp float;',
        'uniform vec3 uKeyDir, uKeyCol, uAmbCol;',
        'varying vec3 vN; varying vec3 vW; varying vec3 vP;',
        'void main(){',
        '  vec3 N = normalize(vN);',
        /* the thorax is furred, the abdomen banded */
        '  float band = 0.5 + 0.5 * sin(vP.z * 150.0);',
        '  float furry = smoothstep(-0.02, 0.10, vP.z);',
        '  vec3 base = mix(vec3(0.020, 0.019, 0.011), vec3(0.070, 0.064, 0.030), band * (1.0 - furry * 0.5));',
        '  float fleck = smoothstep(0.86, 0.99, sin(vP.z * 120.0) * sin(atan(vP.y, vP.x) * 7.0) * 0.5 + 0.5);',
        '  base = mix(base, vec3(0.46, 0.44, 0.24), fleck * 0.75);',
        '  float fur = gfbm(vec2(atan(vP.y, vP.x) * 9.0, vP.z * 70.0)) * 0.5 + 0.5;',
        '  base *= mix(1.0, 0.62 + 0.85 * fur, furry);',
        '  float d = max(dot(N, uKeyDir), 0.0);',
        '  vec3 col = base * (uKeyCol * (0.24 + 1.35 * d) + uAmbCol * (0.5 + 0.5 * N.y) * 1.8);',
        '  vec3 V = normalize(cameraPosition - vW);',
        '  col += uKeyCol * pow(max(dot(reflect(-uKeyDir, N), V), 0.0), 22.0) * 0.05;',
        '  gl_FragColor = vec4(col, 1.0);',
        '  #include <tonemapping_fragment>',
        '  #include <encodings_fragment>',
        '}'
      ].join('\n')
    });

    (function () {
      var N = 30, R = 9, pos = [], idx = [], i, j;
      for (i = 0; i <= N; i++) {
        var a = i / N;
        var r = 0.014 + 0.026 * Math.sin(Math.PI * Math.pow(a, 0.80));
        r += 0.020 * Math.exp(-Math.pow((a - 0.70) / 0.14, 2));
        r += 0.013 * Math.exp(-Math.pow((a - 0.97) / 0.05, 2));
        var z = -0.55 + a * 0.72;
        for (j = 0; j <= R; j++) {
          var th = (j / R) * TAU;
          pos.push(Math.cos(th) * r, Math.sin(th) * r * 0.90, z);
        }
      }
      for (i = 0; i < N; i++) for (j = 0; j < R; j++) {
        var q = i * (R + 1) + j, w = q + R + 1;
        idx.push(q, w, q + 1, w, w + 1, q + 1);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx); g.computeVertexNormals();
      group.add(new THREE.Mesh(g, bodyMat));

      /* tegulae — the scaled shoulder pads that weld wing to thorax */
      [1, -1].forEach(function (sx) {
        var teg = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 9), bodyMat);
        teg.position.set(0.030 * sx, 0.026, 0.020);
        teg.scale.set(1.15, 0.62, 1.5);
        teg.rotation.z = -0.35 * sx;
        group.add(teg);
      });

      /* antennae: thin, swept back, clubbed at the tip */
      var antMat = new THREE.MeshBasicMaterial({ color: 0x171208 });
      [1, -1].forEach(function (sx) {
        var c = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0.010 * sx, 0.020, 0.150),
          new THREE.Vector3(0.062 * sx, 0.075, 0.300),
          new THREE.Vector3(0.105 * sx, 0.110, 0.430));
        group.add(new THREE.Mesh(new THREE.TubeGeometry(c, 12, 0.0042, 5, false), antMat));
        var club = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), antMat);
        club.position.copy(c.getPointAt(1)); club.scale.z = 1.9;
        group.add(club);
      });
    })();

    /* a good deal smaller than it was on the cherry bough — that scene framed
       one branch, this one frames a whole root */
    group.scale.setScalar(0.205);
    group.renderOrder = 5;
    group.traverse(function (o) { o.frustumCulled = false; });
    host.add(group);

    /* ---- the perch: the top of the root's crest ---- */
    var L = limbs[0];
    var pp = new THREE.Vector3(), pn = new THREE.Vector3();
    var probeP = new THREE.Vector3(), probeN = new THREE.Vector3();
    var perchT = 0.29, bestY = -2, perchTh = 0;
    for (var i = 0; i < 64; i++) {
      var th = i / 64 * TAU;
      limbSurface(L, perchT, th, probeP, probeN);
      /* the top, but turned a little toward the lens so open wings show */
      var score = probeN.y + probeN.z * 0.42;
      if (score > bestY) { bestY = score; perchTh = th; pp.copy(probeP); pn.copy(probeN); }
    }
    var perch = pp.clone().addScaledVector(pn, 0.16);   /* clear of the moss pile */

    var st = {
      pos: perch.clone().add(new THREE.Vector3(-1.0, 1.1, 0.5)),
      vel: new THREE.Vector3(0.5, 0, 0),
      acc: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      mode: 'cruise', timer: 4.0, settle: 0, bank: 0, flap: 0
    };
    /* Local units, and the frame's left edge is at x = -4: a butterfly that
       wanders off the side or drops behind the moss may as well not be there,
       so the box is cut to the air directly above the crest. */
    var BOX = { x0: perch.x - 1.5, x1: perch.x + 2.1, y0: perch.y - 0.10, y1: perch.y + 1.35,
                z0: perch.z - 0.25, z1: perch.z + 0.95 };

    function pickTarget() {
      st.tgt.set(rand(BOX.x0 + 0.3, BOX.x1 - 0.3), rand(perch.y + 0.35, BOX.y1 - 0.2), rand(BOX.z0 + 0.2, BOX.z1 - 0.15));
    }
    pickTarget();

    /* display pose: dorsal surface square to the camera, head up — the whole
       point of the landing is that the open wings are seen */
    var landQ = new THREE.Quaternion();
    (function () {
      var camLocal = new THREE.Vector3(0, 0, DIST);
      host.worldToLocal(camLocal);
      var dorsal = camLocal.sub(perch).normalize();
      var fwd = new THREE.Vector3(0, 1, 0).addScaledVector(dorsal, -dorsal.y).normalize();
      var right = new THREE.Vector3().crossVectors(dorsal, fwd).normalize();
      landQ.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, dorsal, fwd));
      landQ.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.10));
      landQ.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.14));
    })();

    /* The pointer is already carried into this group's local space every
       frame for the moss (uMouseNear), so the butterfly can read the same
       value — no extra raycast, and it is in the units it flies in. */
    var SPOOK_R = 0.62;                 /* about one and a half wingspans */
    var spook = 0, toM = new THREE.Vector3(), away = new THREE.Vector3(0, 1, 0);
    var tmp = new THREE.Vector3(), prevVel = new THREE.Vector3();
    var vRight = new THREE.Vector3(), vUp = new THREE.Vector3(), vFwd = new THREE.Vector3();
    var basis = new THREE.Matrix4(), flightQ = new THREE.Quaternion(), qTmp = new THREE.Quaternion();
    var AX_X = new THREE.Vector3(1, 0, 0), AX_Z = new THREE.Vector3(0, 0, 1);

    function contain(out) {
      var k = 2.2, m = 0.30;
      if (st.pos.x < BOX.x0 + m) out.x += k * (BOX.x0 + m - st.pos.x);
      if (st.pos.x > BOX.x1 - m) out.x -= k * (st.pos.x - BOX.x1 + m);
      if (st.pos.y < BOX.y0 + m) out.y += k * (BOX.y0 + m - st.pos.y);
      if (st.pos.y > BOX.y1 - m) out.y -= k * (st.pos.y - BOX.y1 + m);
      if (st.pos.z < BOX.z0 + m) out.z += k * (BOX.z0 + m - st.pos.z);
      if (st.pos.z > BOX.z1 - m) out.z -= k * (st.pos.z - BOX.z1 + m);
    }

    return function update(dt, t) {
      /* ---- how close is the cursor, and from where ----
         z is weighted down because the pointer is resolved on one plane and
         the butterfly is not on it; what matters is whether the cursor is
         over the animal on screen. */
      var m = uMouseNear.value, near = 0;
      if (m.x < 999) {
        toM.set(m.x - st.pos.x, m.y - st.pos.y, (m.z - st.pos.z) * 0.30);
        near = clamp01(1 - toM.length() / SPOOK_R);
        near *= near;
      }
      /* snaps on, lets go slowly — a startled insect does not calm instantly */
      spook += (near - spook) * (1 - Math.pow(near > spook ? 1e-7 : 0.22, dt));

      st.timer -= dt;
      if (st.mode === 'cruise') { if (st.timer <= 0) { st.mode = 'approach'; st.timer = 14; } }
      else if (st.mode === 'approach') { if (st.pos.distanceTo(perch) < 0.12 || st.timer <= 0) { st.mode = 'landed'; st.timer = rand(7.0, 10.0); } }
      else if (st.mode === 'landed') {
        /* the whole point of a perched insect is that it will not stay put */
        if (st.timer <= 0 || spook > 0.30) {
          st.mode = 'takeoff'; st.timer = 2.2;
          if (spook > 0.30) {
            /* leave in the opposite direction, not back across the cursor */
            away.copy(st.pos).sub(m).setZ(0).normalize();
            st.tgt.set(
              Math.min(BOX.x1 - 0.3, Math.max(BOX.x0 + 0.3, st.pos.x + away.x * 1.5)),
              Math.min(BOX.y1 - 0.2, perch.y + 0.9),
              Math.min(BOX.z1 - 0.15, Math.max(BOX.z0 + 0.2, st.pos.z + 0.4)));
          }
        }
      }
      else if (st.mode === 'takeoff') { if (st.timer <= 0) { st.mode = 'cruise'; st.timer = rand(5.0, 8.5); pickTarget(); } }

      var landing = st.mode === 'landed';
      st.settle += ((landing ? 1 : 0) - st.settle) * Math.min(1, dt * (landing ? 3.4 : 4.5));
      st.settle = Math.min(st.settle, 1 - spook);

      /* quick asymmetric stroke in flight, a slow display at rest */
      var beat = 8.6 + Math.sin(t * 0.7) * 0.9 + (0.34 - (8.6 + Math.sin(t * 0.7) * 0.9)) * st.settle;
      beat *= 1 + spook * 1.15;
      st.flap += dt * beat * TAU;
      var raw = Math.sin(st.flap);
      var shaped = (raw < 0 ? -1 : 1) * Math.pow(Math.abs(raw), 0.72);
      /* resting wings flare open as the cursor closes — the flick a butterfly
         gives just before it goes */
      var flyPhi = 20 + 48 * shaped, restPhi = 15 + 7 * shaped + spook * 30;
      var phi = (flyPhi + (restPhi - flyPhi) * st.settle) * Math.PI / 180;
      var flapVel = Math.cos(st.flap) * beat;

      wR1.rotation.z = phi;  wL1.rotation.z = -phi;
      wR2.rotation.z = phi * 0.95 - 0.03;
      wL2.rotation.z = -(phi * 0.95 - 0.03);
      bend.fore.value = -flapVel * 0.010;
      bend.hind.value = -flapVel * 0.013;

      var goal = st.mode === 'approach' ? perch : st.tgt;
      tmp.copy(goal).sub(st.pos);
      var dist = tmp.length();
      var speed = Math.min(1.5, 0.22 + dist * 1.1);
      var desired = tmp.normalize().multiplyScalar(speed);

      /* butterflies do not fly straight lines — but fade the wander out on
         final approach or it circles the perch forever without touching it */
      var wander = st.mode === 'approach' ? Math.min(1, dist * 0.8) : 1;
      desired.x += (Math.sin(t * 3.1) + 0.6 * Math.sin(t * 7.7 + 1.1)) * 0.20 * wander;
      desired.y += (Math.sin(t * 1.9 + 1.7) + 0.55 * Math.sin(t * 4.6)) * 0.40 * wander;
      desired.z += Math.sin(t * 2.7 + 3.4) * 0.24 * wander;
      if (st.mode === 'takeoff') { desired.y += 0.7; desired.z += 0.35; }
      /* and in the air it simply keeps its distance */
      if (spook > 0.002) {
        away.copy(st.pos).sub(m); away.z *= 0.30;
        if (away.lengthSq() > 1e-6) desired.addScaledVector(away.normalize(), spook * 2.3);
      }
      contain(desired);

      prevVel.copy(st.vel);
      st.vel.lerp(desired, 1 - Math.pow(0.03, dt));
      st.acc.copy(st.vel).sub(prevVel).divideScalar(Math.max(dt, 1e-4));
      st.pos.addScaledVector(st.vel, dt);
      if (st.settle > 0.001) {
        st.pos.lerp(perch, Math.min(1, dt * 6.0 * st.settle));
        st.vel.multiplyScalar(1 - Math.min(1, dt * 6.0 * st.settle));
      }

      vFwd.copy(st.vel);
      if (vFwd.lengthSq() < 1e-6) vFwd.set(0, 0, 1);
      vFwd.normalize();
      vRight.crossVectors(vFwd, UP);
      if (vRight.lengthSq() < 1e-6) vRight.set(1, 0, 0);
      vRight.normalize();
      vUp.crossVectors(vRight, vFwd).normalize();

      var lateral = vRight.dot(st.acc);
      st.bank += (Math.max(-1.15, Math.min(1.15, -lateral * 0.40)) - st.bank) * Math.min(1, dt * 5.0);

      basis.makeBasis(vRight, vUp, vFwd);
      flightQ.setFromRotationMatrix(basis);
      qTmp.setFromAxisAngle(AX_Z, st.bank + Math.sin(t * 0.83) * 0.30 + Math.sin(st.flap) * 0.05
                                  + Math.sin(t * 21.0) * spook * 0.16);
      flightQ.multiply(qTmp);
      qTmp.setFromAxisAngle(AX_X, Math.sin(st.flap) * 0.10 - 0.06);
      flightQ.multiply(qTmp);

      group.quaternion.copy(flightQ).slerp(landQ, st.settle);
      group.position.copy(st.pos);
      group.position.y += Math.sin(st.flap - 0.9) * 0.022 * (1 - st.settle);
    };
  }
