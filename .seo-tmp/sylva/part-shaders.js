  var LIGHT_GLSL = [
    'uniform vec3 uKeyDir, uKeyCol, uFillDir, uFillCol, uAmbCol, uHazeCol;',
    'uniform float uHaze, uFog, uMaskOn, uHazeLift;',
    'uniform vec4 uMask;',
    'vec3 litSurface(vec3 N, vec3 albedo, float ao){',
    '  float k = max(dot(N, uKeyDir), 0.0);',
    '  float f = max(dot(N, uFillDir), 0.0);',
    '  float sky = 0.5 + 0.5 * N.y;',
    '  return albedo * (uKeyCol * (0.09 + 1.05 * k) + uFillCol * (0.04 + 0.34 * f) + uAmbCol * (0.35 + 0.65 * sky)) * ao;',
    '}',
    /* Aerial perspective: the reference reads noticeably paler and less
       saturated at the crown than down in the light pool, so lift toward the
       lit-air tone as the form climbs.
       Weighted by the surface's own luminance, because a flat mix puts a
       floor under every shadow — that one change is the difference between
       moss with 9-to-67 of tonal range and moss with 22-to-37. Distant
       geometry gets uHazeLift near 1 and does lift its darks, which is what
       air actually does at that range. */
    'vec3 aerial(vec3 c, float h){',
    '  float amt = clamp(uFog + uHaze * smoothstep(0.05, 0.95, h), 0.0, 1.0);',
    '  float gain = smoothstep(0.003, 0.075, dot(c, vec3(0.30, 0.59, 0.11)));',
    '  return mix(c, uHazeCol, amt * mix(uHazeLift, 1.0, gain));',
    '}',
    /* ── survey pulse ────────────────────────────────────────────────
       A wavefront expands from one point on the left of the frame and the
       root only exists behind it, so the branch is drawn in as the pulse
       passes over it. `lag` holds the solid a beat behind the wireframe,
       which is what makes the mesh read as a scan rather than as a wipe. The
       front is wobbled by a couple of long sines so it never reads as a
       clean circle sweeping the screen. */
    'uniform vec3 uScanO;',
    'uniform float uScanR, uScanOn;',
    'bool unscanned(vec3 w, float lag){',
    '  if (uScanOn < 0.5) return false;',
    '  float wob = sin(w.y * 0.011 + w.x * 0.007) * 36.0 + sin(w.z * 0.021 + w.y * 0.013) * 17.0;',
    '  return distance(w, uScanO) > uScanR - lag + wob;',
    '}',
    /* the far ridge has to dissolve before it reaches the cards, and into the
       floor light below it — the same two masks the artwork build carried */
    'float maskAt(vec3 lp, float boxH){',
    '  if (uMaskOn < 0.5) return 1.0;',
    '  float e = 1.0 - smoothstep(uMask.x, uMask.y, lp.x);',
    '  float l = smoothstep(uMask.z, uMask.w, lp.y / boxH + 0.5);',
    '  return clamp(e * l, 0.0, 1.0);',
    '}'
  ].join('\n');

  var NOISE_GLSL = [
    'vec2 hash22(vec2 p){',
    '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
    '  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);',
    '}',
    /* gradient noise, not value noise: value noise puts its extrema on the
       lattice, which on a tube shows up as blobs in rows */
    'float gnoise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(dot(hash22(i + vec2(0,0)), f - vec2(0,0)),',
    '                 dot(hash22(i + vec2(1,0)), f - vec2(1,0)), u.x),',
    '             mix(dot(hash22(i + vec2(0,1)), f - vec2(0,1)),',
    '                 dot(hash22(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);',
    '}',
    'const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);',
    'float gfbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * gnoise(p); p = ROT * p * 2.03; a *= 0.5; } return s; }',
    'float ridged(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * (1.0 - abs(gnoise(p) * 2.0)); p = ROT * p * 2.11; a *= 0.5; } return s; }'
  ].join('\n');

  var WIND_GLSL = [
    'uniform float uTime;',
    'uniform float uWind;',
    'vec3 windOffset(vec3 p){',
    '  float ph = p.x * 0.42 + p.y * 0.30 + p.z * 0.70;',
    '  float a = 0.030 * uWind;',
    '  return vec3((sin(uTime * 0.58 + ph) + 0.45 * sin(uTime * 1.37 + ph * 2.3)) * a,',
    '              sin(uTime * 0.79 + ph * 1.7) * a * 0.42,',
    '              sin(uTime * 0.51 + ph * 0.9) * a * 0.55);',
    '}'
  ].join('\n');

  /* ---- bark + moss cushion ---- */
  function barkMaterial(cfg) {
    return new THREE.ShaderMaterial({
      uniforms: cfg.uniforms,
      extensions: { derivatives: true },
      vertexShader: WIND_GLSL + [
        'attribute vec3 inf;',
        'varying vec3 vN; varying vec3 vW; varying vec3 vInf; varying float vH; varying vec3 vL;',
        'uniform float uBoxH;',
        'void main(){',
        '  vInf = inf;',
        '  vN = normalize(normal);',
        '  vec3 p = position + windOffset(position) * (0.35 + 0.65 * inf.z);',
        '  vL = p;',
        '  vH = clamp(p.y / uBoxH + 0.5, 0.0, 1.0);',
        '  vec4 wp = modelMatrix * vec4(p, 1.0);',
        '  vW = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: NOISE_GLSL + LIGHT_GLSL + [
        'precision highp float;',
        'uniform float uAlpha; uniform float uBoxH;',
        'varying vec3 vN; varying vec3 vW; varying vec3 vInf; varying float vH; varying vec3 vL;',

        /* Bark grain is strongly anisotropic — features run ten times longer
           along the limb than around it, so squash the domain in v first. */
        'vec2 barkDomain(vec2 uv){ return vec2(uv.x * 7.0, uv.y * 0.62); }',
        'float barkHeight(vec2 uv){',
        '  vec2 q = barkDomain(uv);',
        '  vec2 w = vec2(gfbm(q * 0.5), gfbm(q * 0.5 + 9.1));',
        '  vec2 p = q + w * 0.60;',                        /* meander the fissures */
        '  float ridge = ridged(p);',
        '  float plate = smoothstep(-0.25, 0.45, gfbm(q * 0.34));',
        '  float crack = smoothstep(0.30, 0.86, ridged(p * 1.9 + 4.0));',
        '  float fine  = gfbm(p * 5.5) * 0.5 + 0.5;',
        '  return (ridge - 0.5) * 1.85 * mix(0.35, 1.0, plate) - crack * 0.42 + fine * 0.20;',
        '}',
        /* bump-map an unparametrised surface from screen-space derivatives */
        'vec3 bumped(vec3 N, vec3 p, float h, float k){',
        '  vec3 dpx = dFdx(p), dpy = dFdy(p);',
        '  float dhx = dFdx(h) * k, dhy = dFdy(h) * k;',
        '  vec3 r1 = cross(dpy, N), r2 = cross(N, dpx);',
        '  float det = dot(dpx, r1);',
        '  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);',
        '  return normalize(abs(det) * N - grad);',
        '}',

        'void main(){',
        '  if (unscanned(vW, 520.0)) discard;',
        '  vec2 uv = vInf.xy;',
        '  float cap = vInf.z;',
        '  float m = smoothstep(0.05, 0.42, cap);',
        '  vec3 N = normalize(vN);',

        '  float h = barkHeight(uv);',
        '  N = bumped(N, vW, h, mix(0.26, 0.06, m));',

        '  vec2 q = barkDomain(uv);',
        '  float grain  = gfbm(q * 1.25) * 0.5 + 0.5;',
        '  float mottle = gfbm(q * 0.28 + 21.0) * 0.5 + 0.5;',
        '  float crack  = smoothstep(0.30, 0.86, ridged(q * 1.9 + 4.0));',

        /* Old rain-forest wood: silvered grey where the light rakes it,
           near-black in the splits, with a slow drift into damp umber. */
        '  vec3 silver = mix(vec3(0.020, 0.019, 0.018), vec3(0.290, 0.283, 0.264), grain);',
        '  vec3 umber  = mix(vec3(0.024, 0.019, 0.016), vec3(0.175, 0.140, 0.110), grain);',
        '  vec3 wood   = mix(silver, umber, mottle * 0.78);',
        '  wood *= 1.0 - 0.70 * crack;',

        /* the cushion: two greens, mottled, darkest where it packs deepest */
        '  float mo = gfbm(vec2(vW.x * 2.6, vW.z * 2.6 + vW.y * 1.9)) * 0.5 + 0.5;',
        '  vec3 moss = mix(vec3(0.0204, 0.0311, 0.0050), vec3(0.0914, 0.1392, 0.0227), mo);',
        '  moss *= 0.80 + 0.42 * cap;',

        '  vec3 col = mix(wood, moss, m);',
        /* a pale lichen crust where the wood shows and faces up */
        '  float lich = smoothstep(0.56, 0.84, gfbm(q * 0.62 + 31.0) * 0.5 + 0.5);',
        '  lich *= (1.0 - m) * smoothstep(-0.10, 0.70, N.y) * smoothstep(0.15, 0.50, h);',
        '  col = mix(col, vec3(0.162, 0.176, 0.132), lich * 0.78);',

        /* Contact shadow along the moss line. The cushion overhangs the bark
           it sits on, and without this the two materials meet on a clean
           edge that reads as a paint mask rather than as one thing growing
           on another. */
        '  float contact = smoothstep(0.0, 0.16, cap) * (1.0 - smoothstep(0.16, 0.60, cap));',
        '  col *= 1.0 - 0.48 * contact;',
        '  float ao = mix(0.30, 1.02, smoothstep(-0.40, 0.62, h)) * mix(1.0, 0.86, m);',
        '  vec3 lit = litSurface(N, col, ao);',

        '  vec3 V = normalize(cameraPosition - vW);',
        '  lit += col * uAmbCol * pow(1.0 - max(dot(N, V), 0.0), 4.0) * 0.85;',
        '  float spec = pow(max(dot(reflect(-uKeyDir, N), V), 0.0), 20.0);',
        '  lit += uKeyCol * spec * 0.045 * (1.0 - m) * ao;',

        '  float a = uAlpha * maskAt(vL, uBoxH);',
        '  if (a < 0.004) discard;',
        '  gl_FragColor = vec4(aerial(lit, vH), a);',
        '  #include <tonemapping_fragment>',
        '  #include <encodings_fragment>',
        '}'
      ].join('\n'),
      transparent: cfg.transparent === true,
      depthWrite: cfg.depthWrite !== false,
      side: THREE.DoubleSide
    });
  }

  /* ---- the fur ---- */
  function grassMaterial(cfg) {
    return new THREE.ShaderMaterial({
      uniforms: cfg.uniforms,
      side: THREE.DoubleSide,
      transparent: cfg.transparent === true,
      depthWrite: cfg.depthWrite !== false,
      vertexShader: WIND_GLSL + [
        'attribute vec3 offset;',
        'attribute vec3 nrm;',
        'attribute vec4 rnd;',
        'attribute float aux;',
        'uniform vec3 uMouse;',
        'uniform float uMouseR;',
        'uniform float uBoxH;',
        'varying float vT; varying float vShade; varying float vDark;',
        'varying float vTone; varying float vH; varying vec3 vN; varying vec3 vW; varying vec3 vL;',

        'void main(){',
        '  float t = uv.y; vT = t;',
        '  float len = rnd.y;',

        /* a local basis around the surface normal, rolled by the blade's yaw */
        '  vec3 ref = abs(nrm.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);',
        '  vec3 T0 = normalize(cross(nrm, ref));',
        '  vec3 B0 = cross(nrm, T0);',
        '  float ca = cos(rnd.x), sa = sin(rnd.x);',
        '  vec3 widthDir = T0 * ca + B0 * sa;',
        '  vec3 leanDir  = T0 * -sa + B0 * ca;',

        '  float bend = t * t;',
        '  float gust = (sin(uTime * 1.75 + offset.x * 1.6 + rnd.x) * 0.12',
        '             +  sin(uTime * 0.85 + offset.x * 0.55) * 0.07) * uWind;',

        '  vec3 world = offset + windOffset(offset)',
        '             + nrm * (t * len)',
        '             + widthDir * (position.x * len * 0.62)',
        '             + leanDir * (rnd.z * 0.42 * len) * bend',
        '             + (T0 * gust + B0 * gust * 0.6) * bend * len * 1.6;',

        /* the cursor parts the fur: push tangentially, press down along n */
        '  vec3 toB = offset - uMouse;',
        '  float infl = smoothstep(uMouseR, 0.0, length(toB * vec3(1.0, 1.0, 0.30)));',
        '  infl *= infl;',
        '  vec3 push = toB - nrm * dot(toB, nrm);',
        '  float pl = length(push);',
        '  push = pl > 0.0001 ? push / pl : T0;',
        /* Scaled by the blade's own length, not by a constant: a fixed push
           is several times the height of a moss blade and combs the pile
           into streaks instead of parting it. */
        '  world += push * infl * bend * len * 2.2;',
        '  world -= nrm * infl * bend * len * 1.0;',
        '  vDark = infl;',

        '  vShade = (0.66 + 0.34 * rnd.w) * (0.82 + 0.18 * sin(rnd.x * 2.0));',
        '  vShade *= 0.46 + 0.54 * clamp(nrm.y * 0.5 + 0.62, 0.0, 1.0);',
        '  vTone = smoothstep(0.16, 0.86, aux);',
        '  vN = normalize(mix(nrm, normalize(leanDir * rnd.z + nrm), 0.35));',
        '  vL = world;',
        '  vH = clamp(world.y / uBoxH + 0.5, 0.0, 1.0);',
        '  vec4 wp = modelMatrix * vec4(world, 1.0);',
        '  vW = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: LIGHT_GLSL + [
        'precision highp float;',
        'uniform float uAlpha; uniform float uBoxH;',
        'varying float vT; varying float vShade; varying float vDark;',
        'varying float vTone; varying float vH; varying vec3 vN; varying vec3 vW; varying vec3 vL;',
        'void main(){',
        '  if (unscanned(vW, 520.0)) discard;',
        /* Linear-space colours; the output pass handles the sRGB transfer.
           Channel ratios are solved backwards from the reference screen: its
           moss sits at hue 77°, saturation 56%, value 23%, which is a good
           deal more yellow and a good deal deeper than the green a shader
           reaches for on its own. */
        '  vec3 deep = vec3(0.0126, 0.0192, 0.0031);',
        '  vec3 mid  = vec3(0.0488, 0.0744, 0.0121);',
        '  vec3 tip  = vec3(0.1222, 0.1860, 0.0304);',
        '  vec3 tipHi = vec3(0.2600, 0.3900, 0.0640);',
        '  vec3 col = mix(deep, mid, smoothstep(0.0, 0.62, vT));',
        '  col = mix(col, tip, smoothstep(0.38, 1.0, vT) * (0.35 + 0.65 * vTone));',
        /* slow drifts of colour so the pile never reads as flat velvet */
        '  col *= 0.62 + 0.72 * vTone;',
        '  col *= vShade;',
        '  col *= 1.0 - vDark * 0.55;',
        '  vec3 N = normalize(vN);',
        /* self-shadowing inside the pile: the deeper down a blade you look,
           the less sky reaches it. Without this the fur reads as astroturf
           however good the colours are. */
        '  vec3 lit = litSurface(N, col, mix(0.40, 1.10, smoothstep(0.0, 0.88, vT)) * (0.70 + 0.52 * vTone));',
        /* The sunlit crown is added AFTER the pile shading. Fold it into the
           albedo instead and it comes back out at the same value as
           everything else — which is exactly the flat 22-to-37 range the
           render was stuck at. Only the last quarter of a blade is in the
           open, and it is the whole top decile of the reference's histogram. */
        '  lit += tipHi * smoothstep(0.68, 1.0, vT) * vTone',
        '       * (0.30 + 0.70 * max(dot(N, uKeyDir), 0.0)) * 0.95;',
        /* low sun burning through the blade */
        '  vec3 V = normalize(cameraPosition - vW);',
        '  lit += col * uKeyCol * pow(max(dot(V, -uKeyDir), 0.0), 2.2) * 0.55 * vT;',
        '  float a = uAlpha * maskAt(vL, uBoxH);',
        '  if (a < 0.004) discard;',
        '  gl_FragColor = vec4(aerial(lit, vH), a);',
        '  #include <tonemapping_fragment>',
        '  #include <encodings_fragment>',
        '}'
      ].join('\n')
    });
  }

  /* ---- ferns: the reference plants them at the ends and in the crooks ---- */
  function fernGeometry() {
    var pos = [], uv = [], idx = [];
    var PAIRS = 13, SEG = 3;
    function rachis(s, out) { out.set(0, s * (1.06 - 0.44 * s * s), 0.36 * s * s); return out; }
    var a = new THREE.Vector3(), b = new THREE.Vector3();

    for (var i = 1; i <= PAIRS; i++) {
      var s = i / (PAIRS + 0.6);
      rachis(s, a);
      var pl = 0.36 * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.62)), 0.75) * (1 - 0.18 * s);
      for (var side = -1; side <= 1; side += 2) {
        var base = pos.length / 3;
        for (var k = 0; k <= SEG; k++) {
          var f = k / SEG;
          /* pinnae sweep forward and droop as they run out */
          var w = 0.088 * pl * Math.pow(Math.sin(Math.PI * Math.min(f * 1.25, 1)), 0.7) * (1 - 0.35 * f);
          rachis(s + f * pl * 0.34, b);
          var x = side * f * pl;
          var y = b.y - 0.22 * pl * f * f;
          var z = b.z + 0.06 * pl * f;
          pos.push(x, y - w, z, x, y + w, z);
          uv.push(f, 0, f, 1);
        }
        for (var k2 = 0; k2 < SEG; k2++) {
          var q = base + k2 * 2;
          idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
        }
      }
    }
    /* the stipe */
    var st = pos.length / 3;
    for (var j = 0; j <= 8; j++) {
      var s2 = j / 8;
      rachis(s2, a);
      pos.push(-0.011 * (1 - 0.6 * s2), a.y, a.z, 0.011 * (1 - 0.6 * s2), a.y, a.z);
      uv.push(0.5, 0, 0.5, 1);
    }
    for (var j2 = 0; j2 < 8; j2++) {
      var q2 = st + j2 * 2;
      idx.push(q2, q2 + 1, q2 + 2, q2 + 1, q2 + 3, q2 + 2);
    }

    var g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    var tmp = new THREE.BufferGeometry();
    tmp.setAttribute('position', g.getAttribute('position'));
    tmp.setIndex(idx); tmp.computeVertexNormals();
    g.setAttribute('normal', tmp.getAttribute('normal'));
    return g;
  }

  function fernMaterial(cfg) {
    return new THREE.ShaderMaterial({
      uniforms: cfg.uniforms,
      side: THREE.DoubleSide,
      vertexShader: WIND_GLSL + [
        'attribute vec3 iPos;',
        'attribute vec4 iQuat;',
        'attribute vec2 iRnd;',
        'uniform float uBoxH;',
        'varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vH; varying float vTint; varying vec3 vL;',
        'vec3 qrot(vec4 q, vec3 v){ return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }',
        'void main(){',
        '  vUv = uv; vTint = iRnd.y;',
        '  vec3 local = qrot(iQuat, position * iRnd.x);',
        '  vN = normalize(qrot(iQuat, normal));',
        /* the frond bows from its stipe, so the sway has to climb with the
           vertex\'s own height up the rachis, not act on the whole instance */
        '  float sway = sin(uTime * 1.15 + iRnd.y * 6.28) * 0.055 * uWind;',
        '  local += vec3(sway, 0.0, sway * 0.45) * clamp(position.y, 0.0, 1.2) * iRnd.x;',
        '  vec3 p = iPos + windOffset(iPos) + local;',
        '  vL = p;',
        '  vH = clamp(p.y / uBoxH + 0.5, 0.0, 1.0);',
        '  vec4 wp = modelMatrix * vec4(p, 1.0);',
        '  vW = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: LIGHT_GLSL + [
        'precision highp float;',
        'uniform float uAlpha; uniform float uBoxH;',
        'varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vH; varying float vTint; varying vec3 vL;',
        'void main(){',
        '  if (unscanned(vW, 520.0)) discard;',
        '  vec3 N = normalize(vN);',
        '  if (!gl_FrontFacing) N = -N;',
        '  vec3 V = normalize(cameraPosition - vW);',
        '  vec3 base = mix(vec3(0.0270, 0.0450, 0.0099), vec3(0.0690, 0.1150, 0.0253), vTint);',
        '  base *= 0.80 + 0.30 * smoothstep(0.0, 0.8, vUv.x);',
        '  vec3 lit = litSurface(N, base, 0.9);',
        /* fronds are thin — light comes through them */
        '  lit += base * uKeyCol * pow(max(dot(V, -uKeyDir), 0.0), 2.0) * 1.05;',
        '  float a = uAlpha * maskAt(vL, uBoxH);',
        '  if (a < 0.004) discard;',
        '  gl_FragColor = vec4(aerial(lit, vH), a);',
        '  #include <tonemapping_fragment>',
        '  #include <encodings_fragment>',
        '}'
      ].join('\n')
    });
  }

  /* ---- the survey mesh ----
          Ring-and-spar lines lifted straight off the shell grid: every Nth
          cross-section, plus a handful of lines running the length of each
          limb. Drawn with depthTest off so the whole cage shows through
          itself, which is what makes it read as a scan of the branch rather
          than as an outline drawn on it. Disposed once the pulse is past. */
  var wireMeshes = [];

  function buildWire(L, out) {
    if (!L.grid) return;
    var S = L.S, R = L.R, g = L.grid, i, j, a, b;
    var ringEvery = Math.max(2, Math.round(S / 52));
    var longEvery = Math.max(2, Math.round(R / 9));
    for (i = 0; i <= S; i += ringEvery) {
      for (j = 0; j < R; j++) {
        a = (i * (R + 1) + j) * 3; b = a + 3;
        out.push(g[a], g[a + 1], g[a + 2], g[b], g[b + 1], g[b + 2]);
      }
    }
    for (j = 0; j < R; j += longEvery) {
      for (i = 0; i < S; i++) {
        a = (i * (R + 1) + j) * 3; b = ((i + 1) * (R + 1) + j) * 3;
        out.push(g[a], g[a + 1], g[a + 2], g[b], g[b + 1], g[b + 2]);
      }
    }
  }

  function wireMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: { uScanO: uScanO, uScanR: uScanR, uWire: uWire, uTime: uTime },
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        'varying vec3 vW;',
        'void main(){',
        '  vec4 wp = modelMatrix * vec4(position, 1.0);',
        '  vW = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision highp float;',
        'uniform vec3 uScanO;',
        'uniform float uScanR, uWire, uTime;',
        'varying vec3 vW;',
        'void main(){',
        '  float d = distance(vW, uScanO);',
        /* a bright ring exactly on the wavefront, over a dim cage that
           lingers behind it and then fades out with uWire */
        '  float rim   = exp(-pow((d - uScanR) / 135.0, 2.0));',
        '  float trail = smoothstep(uScanR, uScanR - 950.0, d);',
        '  float a = (rim * 1.60 + trail * 0.34) * uWire;',
        '  if (a < 0.004) discard;',
        /* survey ticks running out along the beam */
        '  a *= 0.66 + 0.34 * sin(d * 0.045 - uTime * 7.0);',
        '  vec3 col = mix(vec3(0.30, 0.72, 0.46), vec3(0.86, 1.00, 0.90), rim);',
        '  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));',
        '}'
      ].join('\n')
    });
  }

  /* ---- the tiny white flowers scattered through the moss ---- */
  var flowerTex = null;
  function makeFlowerTexture() {
    if (flowerTex) return flowerTex;
    /* A spray, not a bloom. One five-petal flower at this size renders as a
       little asterisk; the reference's whites are clusters of florets, so
       the texture carries the whole cluster and each instance is one spray. */
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d');
    var FLORETS = [
      [32, 22, 7.4], [22, 33, 6.0], [42, 33, 6.2], [27, 44, 5.0],
      [39, 45, 5.4], [32, 33, 4.4], [46, 22, 4.2], [18, 22, 4.0]
    ];
    for (var f = 0; f < FLORETS.length; f++) {
      var cx = FLORETS[f][0], cy = FLORETS[f][1], r = FLORETS[f][2];
      g.save(); g.translate(cx, cy); g.rotate(f * 1.31);
      for (var p = 0; p < 5; p++) {
        g.save(); g.rotate((p / 5) * TAU);
        g.fillStyle = 'rgba(255,255,251,' + (0.72 + 0.28 * (r / 7.4)) + ')';
        g.beginPath(); g.ellipse(0, -r * 0.55, r * 0.34, r * 0.55, 0, 0, TAU); g.fill();
        g.restore();
      }
      g.fillStyle = '#f0e7bd';
      g.beginPath(); g.arc(0, 0, r * 0.24, 0, TAU); g.fill();
      g.restore();
    }
    flowerTex = new THREE.CanvasTexture(c);
    if ('sRGBEncoding' in THREE) flowerTex.encoding = THREE.sRGBEncoding;
    flowerTex.minFilter = THREE.LinearMipmapLinearFilter;
    flowerTex.generateMipmaps = true;
    return flowerTex;
  }

  function flowerMaterial(cfg) {
    return new THREE.ShaderMaterial({
      uniforms: cfg.uniforms,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: WIND_GLSL + [
        'attribute vec3 iPos;',
        'attribute vec2 iRnd;',
        'uniform float uBoxH;',
        'varying vec2 vUv; varying float vH; varying vec3 vL; varying vec3 vW;',
        'void main(){',
        '  vUv = uv;',
        '  vec3 p = iPos + windOffset(iPos) * 1.6;',
        '  p += vec3(sin(uTime * 1.5 + iRnd.y * 6.28), 0.0, 0.0) * 0.020 * uWind;',
        '  vL = p;',
        '  vH = clamp(p.y / uBoxH + 0.5, 0.0, 1.0);',
        /* Billboard: offset the quad in VIEW space so it always faces the lens.
           The offset has to be converted out of the group\'s local scale first —
           the modelView transform has already been applied to the anchor. */
        '  vW = (modelMatrix * vec4(p, 1.0)).xyz;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
        '  float ws = length(modelMatrix[0].xyz);',
        '  mv.xy += position.xy * iRnd.x * ws;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: LIGHT_GLSL + [
        'precision highp float;',
        'uniform sampler2D uMap;',
        'uniform float uAlpha; uniform float uBoxH;',
        'varying vec2 vUv; varying float vH; varying vec3 vL; varying vec3 vW;',
        'void main(){',
        '  if (unscanned(vW, 520.0)) discard;',
        '  vec4 t = texture2D(uMap, vUv);',
        '  if (t.a < 0.14) discard;',
        '  vec3 col = t.rgb * t.rgb * (uKeyCol * 0.62 + uAmbCol * 0.9);',
        '  gl_FragColor = vec4(aerial(col, vH), t.a * uAlpha * maskAt(vL, uBoxH));',
        '  #include <tonemapping_fragment>',
        '  #include <encodings_fragment>',
        '}'
      ].join('\n')
    });
  }

  /* ================================================================== *
   * assembly
   * ================================================================== */