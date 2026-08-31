  /* ── the trail the pointer lifts off the moss ────────────────────────
     Emission is by DISTANCE rather than by time, and spread along the
     segment the pointer covered since the last frame: a fast sweep lays a
     trail instead of stacking a clump where the cursor happened to land,
     and a pointer that has stopped trickles instead of pumping.
     Each grain carries its own origin, velocity and birth stamp, so the CPU
     only writes when one is respawned out of the ring — the flight itself is
     integrated in the vertex shader, same as the ambient pollen. */
  var SPRAY_N = 620, SPRAY_LIFE = 1.6;
  var spray = null, sprayPos, sprayVel, sprayBirth, sprayRnd;
  var sprayHead = 0, sprayIdle = 0, sprayDirty = false;
  var sprayPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -240);
  var sprayAt = new THREE.Vector3(), sprayLast = new THREE.Vector3(9999, 0, 0);
  var sprayStep = new THREE.Vector3();

  function buildCursorSpray() {
    if (REDUCED) return;
    sprayPos = new Float32Array(SPRAY_N * 3);
    sprayVel = new Float32Array(SPRAY_N * 3);
    sprayBirth = new Float32Array(SPRAY_N);
    sprayRnd = new Float32Array(SPRAY_N * 2);
    for (var i = 0; i < SPRAY_N; i++) sprayBirth[i] = -999;

    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    g.setAttribute('aVel', new THREE.BufferAttribute(sprayVel, 3));
    g.setAttribute('aBirth', new THREE.BufferAttribute(sprayBirth, 1));
    g.setAttribute('aRnd', new THREE.BufferAttribute(sprayRnd, 2));

    spray = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: {
        uTime: uTime, uMap: { value: poleTex },
        uSize: { value: 13 }, uScale: { value: 440 }, uLife: { value: SPRAY_LIFE }
      },
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        'attribute vec3 aVel;',
        'attribute float aBirth;',
        'attribute vec2 aRnd;',
        'uniform float uTime, uSize, uScale, uLife;',
        'varying float vA;',
        'void main(){',
        '  float age = uTime - aBirth;',
        '  if (age < 0.0 || age > uLife) { vA = 0.0; gl_PointSize = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }',
        '  float u = age / uLife;',
        /* drag on the launch velocity, a slow lift, and a little wander */
        '  vec3 p = position + aVel * age * (1.0 - 0.34 * u)',
        '         + vec3(sin(aRnd.y * 6.28 + age * 2.6) * 22.0 * u, 46.0 * age, 0.0);',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
        '  gl_PointSize = uSize * aRnd.x * (uScale / max(-mv.z, 1.0)) * (0.45 + 0.55 * (1.0 - u));',
        '  vA = smoothstep(0.0, 0.09, u) * (1.0 - smoothstep(0.40, 1.0, u));',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D uMap;',
        'varying float vA;',
        'void main(){',
        '  vec4 t = texture2D(uMap, gl_PointCoord);',
        '  gl_FragColor = vec4(t.rgb, t.a * vA * 0.85);',
        '}'
      ].join('\n')
    }));
    spray.frustumCulled = false;
    spray.renderOrder = 7;
    scene.add(spray);
  }

  function spawnSpray(p, boost) {
    var k = boost || 1;
    var i = sprayHead; sprayHead = (sprayHead + 1) % SPRAY_N;
    var o = i * 3;
    sprayPos[o]     = p.x + rand(-15, 15) * k;
    sprayPos[o + 1] = p.y + rand(-15, 15) * k;
    sprayPos[o + 2] = p.z + rand(-45, 45);
    sprayVel[o]     = rand(-38, 38) * k;
    sprayVel[o + 1] = (rand(2, 64) + 22 * (k - 1)) * k;
    sprayVel[o + 2] = rand(-26, 26) * k;
    sprayBirth[i]   = uTime.value;
    sprayRnd[i * 2]     = rand(0.50, 1.15);
    sprayRnd[i * 2 + 1] = rng();
    sprayDirty = true;
  }

  function flushSpray() {
    if (!spray || !sprayDirty) return;
    var at = spray.geometry.attributes;
    at.position.needsUpdate = at.aVel.needsUpdate = at.aBirth.needsUpdate = at.aRnd.needsUpdate = true;
    sprayDirty = false;
  }

  /* a pill that has been pressed throws a handful of pollen off itself —
     the dock calls this, and it reuses the cursor emitter's pool */
  var burstNdc = { x: 0, y: 0 }, burstAtV = new THREE.Vector3();
  function burstAt(clientX, clientY) {
    if (!spray || !camera || REDUCED) return;
    var r = hero.getBoundingClientRect();
    burstNdc.x =  ((clientX - r.left) / r.width) * 2 - 1;
    burstNdc.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(burstNdc, camera);
    if (!raycaster.ray.intersectPlane(sprayPlane, burstAtV)) return;
    for (var i = 0; i < 52; i++) spawnSpray(burstAtV, 2.5);
    flushSpray();
  }

  function emitSpray(dt) {
    if (!spray) return;
    if (!mouseLive || !raycaster.ray.intersectPlane(sprayPlane, sprayAt)) {
      sprayLast.x = 9999;                       /* re-entering should not lay a streak */
      return;
    }
    if (sprayLast.x > 9000) { sprayLast.copy(sprayAt); return; }

    var d = sprayAt.distanceTo(sprayLast);
    var n = Math.min(14, Math.floor(d / 7));
    for (var k = 1; k <= n; k++) {
      sprayStep.lerpVectors(sprayLast, sprayAt, k / n);
      spawnSpray(sprayStep);
    }
    if (n > 0) { sprayLast.copy(sprayAt); sprayIdle = 0; }
    else {
      sprayIdle += dt;
      if (sprayIdle > 0.055) { spawnSpray(sprayAt); sprayIdle = 0; }
    }

    flushSpray();
  }
