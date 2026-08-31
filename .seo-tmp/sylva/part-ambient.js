  function buildAmbient() {
    var geo = new THREE.PlaneGeometry(1, 1, 1, 1);

    shadowMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: radialTexture(256, [[0, 'rgba(12,16,10,0.62)'], [0.45, 'rgba(12,16,10,0.26)'], [1, 'rgba(12,16,10,0)']]),
      transparent: true, depthWrite: false, depthTest: false
    }));
    shadowMesh.renderOrder = 1;
    shadowMesh.position.z = -70;
    scene.add(shadowMesh);

    glowMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: radialTexture(256, [[0, 'rgba(226,236,212,0.30)'], [0.42, 'rgba(214,226,200,0.10)'], [1, 'rgba(214,226,200,0)']]),
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending
    }));
    glowMesh.renderOrder = -1;
    glowMesh.position.z = -320;
    scene.add(glowMesh);

    /* ---- drifting pollen --------------------------------------------
       Enough of it to read as air rather than as a handful of sprites, which
       means the drift has to leave the CPU: every mote is animated from
       uTime in the vertex shader, so the per-frame cost is one uniform write
       no matter how many there are. Sizes follow a power law — a few big
       soft ones near the lens, a great many specks behind them — and they
       depth-test against the moss so the ones behind the root are hidden. */
    var COUNT = (NARROW.matches || (window.innerWidth * window.innerHeight) < 620000) ? 1500 : 4200;
    var pos = new Float32Array(COUNT * 3);
    var seed = new Float32Array(COUNT * 4);
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 3400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1500;
      pos[i * 3 + 2] = -380 + Math.random() * 1000;
      seed[i * 4]     = Math.random() * 6.283;                     /* phase   */
      seed[i * 4 + 1] = 0.25 + Math.random() * 0.9;                /* speed   */
      seed[i * 4 + 2] = 0.4 + Math.random() * 1.4;                 /* sway    */
      seed[i * 4 + 3] = 0.70 + 1.05 * Math.pow(Math.random(), 2.2); /* size    */
    }
    var pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pg.setAttribute('seed', new THREE.BufferAttribute(seed, 4));

    poleTex = radialTexture(64, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(236,244,224,0.5)'], [1, 'rgba(236,244,224,0)']]);
    motes = new THREE.Points(pg, new THREE.ShaderMaterial({
      uniforms: {
        uTime: uTime,
        uMap: { value: poleTex },
        uSize: { value: 9 },
        uScale: { value: 440 }
      },
      transparent: true, depthWrite: false, depthTest: true,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        'attribute vec4 seed;',
        'uniform float uTime, uSize, uScale;',
        'varying float vFade;',
        'void main(){',
        '  float ph = seed.x, sp = seed.y, am = seed.z;',
        '  vec3 p = position;',
        '  p.x += sin(uTime * sp * 0.35 + ph) * 34.0 * am;',
        /* one long rise, wrapped — the band fade hides the wrap */
        '  float climb = mod(uTime * 11.0 * sp + ph * 60.0, 1500.0) - 750.0;',
        '  p.y += climb;',
        '  p.z += cos(uTime * sp * 0.28 + ph) * 24.0 * am;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
        '  gl_PointSize = uSize * seed.w * (uScale / max(-mv.z, 1.0));',
        '  float edge = 1.0 - abs(climb) / 750.0;',
        '  float twinkle = 0.55 + 0.45 * sin(uTime * (0.7 + sp * 1.6) + ph * 3.1);',
        '  vFade = clamp(edge * 3.0, 0.0, 1.0) * twinkle;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D uMap;',
        'varying float vFade;',
        'void main(){',
        '  vec4 t = texture2D(uMap, gl_PointCoord);',
        '  gl_FragColor = vec4(t.rgb, t.a * vFade * 0.52);',
        '}'
      ].join('\n')
    }));
    motes.frustumCulled = false;
    motes.renderOrder = 6;
    scene.add(motes);

    buildCursorSpray();
  }
