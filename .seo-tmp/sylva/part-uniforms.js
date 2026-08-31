  var uTime  = { value: 0 };
  var uWind  = { value: REDUCED ? 0.0 : 1.0 };
  var uMouseNear = { value: new THREE.Vector3(9999, 9999, 9999) };
  var uMouseFar  = { value: new THREE.Vector3(9999, 9999, 9999) };
  /* the survey pulse — shared by every material so one write moves them all */
  var uScanO  = { value: new THREE.Vector3(-900, -260, 240) };
  var uScanR  = { value: 0 };
  var uScanOn = { value: 0 };
  var uWire   = { value: 0 };

  var KEY  = new THREE.Vector3(-0.30, 0.92, 0.28).normalize();
  var FILL = new THREE.Vector3( 0.12, -0.86, 0.50).normalize();

  function lightUniforms(extra) {
    var u = {
      uTime: uTime, uWind: uWind,
      uKeyDir:  { value: KEY.clone() },
      uKeyCol:  { value: new THREE.Color(1.14, 1.06, 0.88) },
      uFillDir: { value: FILL.clone() },
      /* the pale pool on the floor of the hero, bouncing back up */
      uFillCol: { value: new THREE.Color(0.78, 0.78, 0.62) },
      uAmbCol:  { value: new THREE.Color(0.086, 0.090, 0.080) },
      /* Aerial perspective goes toward LIT air, not toward the background:
         the far ridge in the reference is paler than the page behind it, and
         so are the near crowns. Keep the amount small on the near root or the
         moss greys out (its saturation is the first thing to go). */
      uHazeCol: { value: new THREE.Color(0.176, 0.195, 0.145) },
      uHaze:    { value: 0.14 },
      uHazeLift:{ value: 0.20 },
      uFog:     { value: 0.0 },
      uAlpha:   { value: 1.0 },
      uBoxH:    { value: BOXW / ARCH.aspect },
      uMask:    { value: new THREE.Vector4(0, 1, 0, 1) },
      uMaskOn:  { value: 0 },
      uScanO:   uScanO,
      uScanR:   uScanR,
      uScanOn:  uScanOn,
      uMouse:   { value: uMouseNear.value },
      uMouseR:  { value: 1.5 }
    };
    for (var k in extra) if (extra.hasOwnProperty(k)) u[k] = extra[k];
    return u;
  }

  /* the blade: four rungs pinched to a point, instanced a hundred thousand times */