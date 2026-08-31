  function bladeGeometry() {
    var SEGS = 3, verts = [], uvs = [], idx = [], i;
    for (i = 0; i <= SEGS; i++) {
      var t = i / SEGS, w = 0.5 * (1 - t * t);
      verts.push(-w, t, 0, w, t, 0);
      uvs.push(0, t, 1, t);
    }
    verts[verts.length - 6] = 0; verts[verts.length - 3] = 0;
    for (i = 0; i < SEGS; i++) {
      var a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    var g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    return g;
  }

  /* one root: bark shell + fur + ferns + flowers, all under a single group */
  function assembleRoot(limbs, opt) {
    var group = new THREE.Group();
    var uni = lightUniforms({
      uBoxH:   { value: BOXW / opt.aspect },
      uHaze:   { value: opt.haze },
      uFog:    { value: opt.fog },
      uHazeCol:{ value: new THREE.Color().fromArray(opt.hazeCol || [0.176, 0.195, 0.145]) },
      uHazeLift:{ value: opt.hazeLift === undefined ? 0.20 : opt.hazeLift },
      uAlpha:  { value: opt.alpha },
      uMask:   { value: new THREE.Vector4(opt.mask ? opt.mask[0] : 0, opt.mask ? opt.mask[1] : 1,
                                          opt.mask ? opt.mask[2] : 0, opt.mask ? opt.mask[3] : 1) },
      uMaskOn: { value: opt.mask ? 1 : 0 },
      uMouse:  { value: opt.mouse.value },
      uMouseR: { value: opt.mouseR }
    });
    var soft = !!opt.mask || opt.alpha < 1;

    /* ---- shell ---- */
    var bag = { pos: [], nor: [], inf: [], idx: [] };
    for (var i = 0; i < limbs.length; i++) tessellate(limbs[i], bag);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(bag.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(bag.nor, 3));
    geo.setAttribute('inf', new THREE.Float32BufferAttribute(bag.inf, 3));
    geo.setIndex(bag.idx);
    var shell = new THREE.Mesh(geo, barkMaterial({
      uniforms: uni, transparent: soft, depthWrite: true
    }));
    shell.frustumCulled = false;
    shell.renderOrder = opt.order;
    group.add(shell);

    /* ---- fur ---- */
    var fur = { off: [], nrm: [], rnd: [], aux: [] };
    var total = 0;
    for (i = 0; i < limbs.length; i++) total += limbs[i].len;
    for (i = 0; i < limbs.length; i++) {
      plantBlades(limbs[i], Math.round(opt.blades * limbs[i].len / total), fur);
    }
    var bg = bladeGeometry();
    bg.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(fur.off), 3));
    bg.setAttribute('nrm',    new THREE.InstancedBufferAttribute(new Float32Array(fur.nrm), 3));
    bg.setAttribute('rnd',    new THREE.InstancedBufferAttribute(new Float32Array(fur.rnd), 4));
    bg.setAttribute('aux',    new THREE.InstancedBufferAttribute(new Float32Array(fur.aux), 1));
    bg.instanceCount = fur.off.length / 3;
    var grass = new THREE.Mesh(bg, grassMaterial({
      uniforms: uni, transparent: soft, depthWrite: true
    }));
    grass.frustumCulled = false;
    grass.renderOrder = opt.order + 0.1;
    group.add(grass);

    /* ---- ferns and flowers, seated on the same surface as the fur.
            Main limbs only: a fern on a twig that stands off the root reads
            as a frond hanging in mid-air. ---- */
    var host = limbs.slice(0, opt.mainLimbs || limbs.length);
    /* A frond keeps its outline as it fades, while the cushion behind it
       fades to a smooth gradient — so a fern planted in the ridge's dissolve
       zone reads as one hanging in mid-air. Plant nothing out there. */
    var plantMaxX = opt.mask ? opt.mask[0] + 0.25 : 1e9;
    var fP = [], fQ = [], fR = [], wP = [], wR = [];
    var p = new THREE.Vector3(), n = new THREE.Vector3();
    var q = new THREE.Quaternion(), face = new THREE.Vector3();
    var guard, k;

    for (k = 0, guard = 0; k < opt.ferns && guard < opt.ferns * 60; guard++) {
      var Lf = host[Math.floor(rng() * host.length)];
      var t = rng(), th = rng() * TAU;
      if (limbSurface(Lf, t, th, p, n) < 0.55) continue;
      if (p.x > plantMaxX) continue;
      if (n.y < 0.25) continue;
      face.copy(n).addScaledVector(UP, 0.18)
        .addScaledVector(new THREE.Vector3(rand(-0.62, 0.62), rand(-0.20, 0.05), rand(0.15, 0.75)), 1).normalize();
      q.setFromUnitVectors(UP, face);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, rng() * TAU));
      fP.push(p.x, p.y, p.z);
      fQ.push(q.x, q.y, q.z, q.w);
      fR.push(rand(opt.fernSize[0], opt.fernSize[1]), rng());
      k++;
    }

    for (k = 0, guard = 0; k < opt.flowers && guard < opt.flowers * 60; guard++) {
      var Lw = host[Math.floor(rng() * host.length)];
      /* clumps, not a sprinkle: pick a seed then jitter around it */
      var t0 = rng(), th0 = rng() * TAU;
      for (var c2 = 0; c2 < 9 && k < opt.flowers; c2++) {
        var tt = clamp01(t0 + rand(-0.008, 0.008));
        var tth = th0 + rand(-0.24, 0.24);
        if (limbSurface(Lw, tt, tth, p, n) < 0.45 || p.x > plantMaxX) continue;
        p.addScaledVector(n, rand(0.02, 0.16));
        wP.push(p.x, p.y, p.z);
        wR.push(rand(opt.flowerSize[0], opt.flowerSize[1]), rng());
        k++;
      }
    }

    if (fP.length) {
      var fg = fernGeometry();
      fg.setAttribute('iPos',  new THREE.InstancedBufferAttribute(new Float32Array(fP), 3));
      fg.setAttribute('iQuat', new THREE.InstancedBufferAttribute(new Float32Array(fQ), 4));
      fg.setAttribute('iRnd',  new THREE.InstancedBufferAttribute(new Float32Array(fR), 2));
      fg.instanceCount = fP.length / 3;
      var fern = new THREE.Mesh(fg, fernMaterial({ uniforms: uni }));
      fern.frustumCulled = false;
      fern.renderOrder = opt.order + 0.2;
      group.add(fern);
    }

    if (wP.length) {
      var wg = new THREE.InstancedBufferGeometry();
      wg.setAttribute('position', new THREE.Float32BufferAttribute([-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0], 3));
      wg.setAttribute('uv', new THREE.Float32BufferAttribute([0,0, 1,0, 1,1, 0,1], 2));
      wg.setIndex([0,1,2, 0,2,3]);
      wg.setAttribute('iPos', new THREE.InstancedBufferAttribute(new Float32Array(wP), 3));
      wg.setAttribute('iRnd', new THREE.InstancedBufferAttribute(new Float32Array(wR), 2));
      wg.instanceCount = wP.length / 3;
      var fm = flowerMaterial({ uniforms: uni });
      fm.uniforms.uMap = { value: makeFlowerTexture() };
      var blooms = new THREE.Mesh(wg, fm);
      blooms.frustumCulled = false;
      blooms.renderOrder = opt.order + 0.3;
      group.add(blooms);
    }

    if (opt.wire) {
      var wpos = [];
      for (i = 0; i < limbs.length; i++) buildWire(limbs[i], wpos);
      if (wpos.length) {
        var wgeo = new THREE.BufferGeometry();
        wgeo.setAttribute('position', new THREE.Float32BufferAttribute(wpos, 3));
        var wmesh = new THREE.LineSegments(wgeo, wireMaterial());
        wmesh.frustumCulled = false;
        wmesh.renderOrder = 8;
        group.add(wmesh);
        wireMeshes.push(wmesh);
      }
    }

    /* the shell grids were scratch for the fur — ~0.7 MB of typed array per
       root that nothing reads again */
    for (i = 0; i < limbs.length; i++) { limbs[i].grid = limbs[i].gnrm = limbs[i].gcaps = null; }

    group.userData = { uni: uni, blades: bg.instanceCount };
    return group;
  }
