/* HOME — hero content scale, parallax, plane, etc */
// ── hero content scale on scroll (page-specific; nav/footer behavior lives in js/site.js) ──
    (function () {
      const heroEl = document.querySelector('.hero');
      const heroContent = document.getElementById('hero-content');
      if (!heroEl || !heroContent) return;
      // Base fit-scale: the staggered layout is tuned for the ~1440 canvas and the
      // block (vertical label → "who") is ~911px wide. Between the mobile reflow
      // (<=640, handled by CSS flex) and laptop (>1100) we keep the SAME staggered
      // composition and just scale it to fit, so it never snaps — it shrinks
      // continuously to hold ~48px side margins down through tablet.
      // matches the CSS hero-reflow query — when the hero is a flex column we do
      // NOT fit-scale (the column handles fit); we only scale the staggered canvas.
      const reflowMQ = window.matchMedia('(max-width: 640px), (max-height: 480px) and (orientation: landscape)');
      function baseHeroScale() {
        const w = Scroll.vw();
        if (w > 1100 || reflowMQ.matches) return 1;   // laptop keeps 1:1; mobile uses the flex column
        return Math.min(1, Math.max(0.6, (w - 96) / 911));
      }
      // hero height only moves on resize — caching it keeps a layout read out of the
      // scroll frame entirely
      let heroH = 0, lastScale = null;
      function updateHeroScale() {
        if (!heroH) heroH = heroEl.offsetHeight;
        const progress = Math.min(Math.max(Scroll.y() / (heroH * 0.8), 0), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const scale = baseHeroScale() * (1 - eased * 0.12);   // fit-scale × (1.0 → 0.88)
        const t = `scale(${scale.toFixed(4)})`;
        if (t !== lastScale) { heroContent.style.transform = t; lastScale = t; }
      }
      Scroll.add(updateHeroScale);
      window.addEventListener('resize', () => { heroH = 0; Scroll.kick(); }, { passive: true });
      updateHeroScale();   // apply the fit-scale immediately (before any scroll)
    })();

    // ── scroll-triggered text reveal ──
    // Fade + rise each .reveal element once as it enters the viewport.
    (function () {
      const reveals = document.querySelectorAll('.reveal');
      if (!reveals.length) return;

      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('is-visible'));
        return;
      }

      const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

      reveals.forEach(el => revealObserver.observe(el));
    })();



    // ── About intro: line-by-line reveal on scroll ──
    (function () {
      const container = document.querySelector('.intro-copy');
      const paras = container ? Array.from(container.querySelectorAll('.intro-type')) : [];
      if (!container || !paras.length) return;

      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Split one paragraph into visual-line spans by detecting word wrap points
      // (words sharing an offsetTop are on the same rendered line).
      function splitLines(p) {
        if (p.dataset.twText === undefined) p.dataset.twText = p.textContent;
        const tokens = p.dataset.twText.split(/(\s+)/);   // keep whitespace tokens

        p.innerHTML = '';
        const spans = tokens.map(t => {
          const s = document.createElement('span');
          s.textContent = t;
          p.appendChild(s);
          return s;
        });

        const lines = [];
        let cur = null, curTop = null;
        spans.forEach(s => {
          const top = s.offsetTop;
          if (curTop === null || top !== curTop) { cur = []; lines.push(cur); curTop = top; }
          cur.push(s.textContent);
        });

        p.innerHTML = '';
        return lines.map(words => {
          const line = document.createElement('span');
          line.className = 'tw-line';
          line.textContent = words.join('').replace(/^\s+|\s+$/g, '');
          p.appendChild(line);
          return line;
        });
      }

      function build() {
        const all = [];
        paras.forEach(p => splitLines(p).forEach(l => all.push(l)));
        return all;
      }

      let lines = build();

      if (reduce) {
        lines.forEach(l => l.classList.add('is-in'));
        return;
      }

      // Progress is driven by the blurb's own travel up the viewport: 0 when its
      // top sits low on screen, 1 by the time it has risen to the upper third.
      // Because it's tied to scroll position (not a timer), the reveal can't be
      // outrun — and it scrolls seamlessly with the page (no pin).
      function apply() {
        const vh = Scroll.vh();
        const top = Scroll.rect(container).top;
        const start = vh * 0.88;   // progress 0: blurb top low on screen
        const end   = vh * 0.32;   // progress 1: blurb top in the upper third
        let progress = (start - top) / (start - end);
        progress = progress < 0 ? 0 : progress > 1 ? 1 : progress;
        // class churn invalidates style for the whole subtree — only touch the DOM
        // when the number of revealed lines actually changes
        const shown = Math.floor(progress * (lines.length + 1));
        if (shown === lastShown) return;
        lastShown = shown;

        const n = lines.length;
        lines.forEach((line, i) => {
          // evenly spaced thresholds; line 0 starts hidden (threshold > 0)
          const threshold = (i + 1) / (n + 1);
          line.classList.toggle('is-in', progress >= threshold);
        });
      }
      let lastShown = null;

      Scroll.add(apply);

      // build() makes fresh line elements (none carrying .is-in), so the dedupe
      // cache has to go with them or the rebuilt lines stay hidden
      const rebuild = () => { lines = build(); lastShown = null; apply(); };

      let rt;
      addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(rebuild, 200);
      }, { passive: true });

      apply();  // set initial state

      // wait for webfonts so wrap points are measured against the real type
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(rebuild);
      }
    })();

    // ── Work featured on: reveal the logo marquee as a group on scroll ──
    (function () {
      const wrap = document.querySelector('.logo-marquee-wrap');
      if (!wrap) return;

      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        wrap.classList.add('logos-in');
        return;
      }

      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) { wrap.classList.add('logos-in'); obs.disconnect(); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
      io.observe(wrap);
    })();

    // ── recorder ──
    const audio      = document.getElementById('audio');
    const playBtn    = document.getElementById('play-btn');
    const diskL      = document.getElementById('disk-l');
    const diskR      = document.getElementById('disk-r');
    const slider     = document.getElementById('play-slider');
    const sliderFill = document.getElementById('slider-fill');
    const sliderKnob = document.getElementById('slider-knob');
    const tCurrent   = document.getElementById('t-current');
    const tTotal     = document.getElementById('t-total');

    const KNOB = 23.45;
    let playing = false;

    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    function setPlaying(state) {
      playing = state;
      playBtn.classList.toggle('playing', state);
      playBtn.setAttribute('aria-label', state ? 'Pause' : 'Play');
      diskL.classList.toggle('spinning', state);
      diskR.classList.toggle('spinning', state);
    }

    function togglePlay() {
      if (playing) { audio.pause(); setPlaying(false); }
      else { audio.play().catch(() => {}); setPlaying(true); }
    }

    // the whole recorder is a play/pause target — clicks anywhere toggle the song,
    // except on the scrubber (which owns its own pointer interaction). The inner
    // <button> stays the accessible control; its click just bubbles up to here.
    const recorder = document.querySelector('.recorder');
    recorder.addEventListener('click', e => {
      if (e.target.closest('#play-slider')) return;
      togglePlay();
    });

    audio.addEventListener('ended', () => setPlaying(false));
    // keep the recorder UI in sync when playback is toggled elsewhere (e.g. the nav wave button)
    audio.addEventListener('play',  () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('loadedmetadata', () => { tTotal.textContent = fmt(audio.duration); });

    let scrubbing = false;

    // paint the knob + fill + current-time label at a 0..1 position
    function renderAt(pct) {
      const knobX = pct * (slider.clientWidth - KNOB);
      sliderKnob.style.left = knobX + 'px';
      sliderFill.style.width = (knobX + KNOB / 2) + 'px';
      tCurrent.textContent = fmt(pct * (audio.duration || 0));
    }

    // map a pointer x to a 0..1 position, centring the knob under the pointer
    function pctFromEvent(e) {
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left - KNOB / 2;
      return Math.min(Math.max(x / (rect.width - KNOB), 0), 1);
    }

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration || scrubbing) return;
      renderAt(audio.currentTime / audio.duration);
    });

    slider.addEventListener('pointerdown', e => {
      if (!audio.duration) return;
      scrubbing = true;
      slider.classList.add('scrubbing');
      slider.setPointerCapture(e.pointerId);
      const pct = pctFromEvent(e);
      renderAt(pct);
      audio.currentTime = pct * audio.duration;
    });

    slider.addEventListener('pointermove', e => {
      if (!scrubbing) return;
      const pct = pctFromEvent(e);
      renderAt(pct);
      audio.currentTime = pct * audio.duration;
    });

    function endScrub(e) {
      if (!scrubbing) return;
      scrubbing = false;
      slider.classList.remove('scrubbing');
      try { slider.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    slider.addEventListener('pointerup', endScrub);
    slider.addEventListener('pointercancel', endScrub);


    /* ── scroll-driven paper plane + dotted trail ── */
    (function () {
      const section = document.querySelector('.featured-work');
      const sky = document.querySelector('.sky-band');
      const blurb = document.querySelector('.intro-copy');
      const fly = document.querySelector('.plane-fly');
      const sprite = document.querySelector('.plane-sprite');
      const trail = document.getElementById('planeTrailPath');
      const maskPath = document.getElementById('planeTrailMaskPath');
      const motion = document.getElementById('planeMotionPath');
      if (!section || !sky || !blurb || !fly || !sprite || !trail || !maskPath || !motion) return;

      // The sprite's nose points ~31° (down-right) when un-rotated; subtract that
      // so the nose always aligns with the path's travel direction.
      const PLANE_OFFSET = -31;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Opening arc as a FIXED-SIZE shape (px), pinned by its end point to a spot
      // just above-left of the blurb. Rebuilt on resize so it keeps the same size
      // and the same relationship to the (centred) blurb at any viewport width —
      // it never stretches with the viewport above 1440.
      const ARC = {
        start: [210, 110],
        curves: [
          [[110, 200], [70, 325], [88, 410]],
          [[103, 488], [192, 528], [255, 555]],
        ],
        end: [255, 555],   // pinned to (blurb.left + 26, blurbTop - 33)
      };

      // Segments 2 & 3 — the real Figma trail vectors (seg 2 = node 209:2683,
      // seg 3 = node 209:2689) in the projects-frame coordinate system (each
      // vector's bbox offset folded in). Anchored to the blurb at 1:1 scale so
      // seg 2 lands on the plane beside "Work featured on" and seg 3 sweeps from
      // the header's left edge down through the tiles to the bottom plane.
      const FBLURB = { x: 220.55078, y: 309.10114, w: 998.8994 };
      const FSEGS = [
        { // segment 2 → ends at the "Work featured on" plane
          start: [1225.129, 513.643],
          curves: [
            [[1400.529, 571.048], [1408.849, 837.583], [1177.289, 928.232]],
          ],
        },
        { // segment 3 (node 209:2689, offset 87.294,943.689) → down to bottom plane
          start: [526.523, 944.189],
          curves: [
            [[343.309, 950.485], [-12.056, 1108.034], [114.406, 1503.226]],
            [[181.773, 1632.295], [428.301, 1799.056], [685.184, 1627.938]],
            [[1049.722, 1385.108], [1402.934, 1429.163], [1402.934, 1762.044]],
            [[1402.934, 2099.399], [1089.394, 2154.919], [826.844, 2073.699]],
            [[564.300, 1992.479], [279.257, 1966.169], [203.537, 2255.019]],
            [[123.170, 2561.609], [552.967, 2708.339], [800.401, 2549.679]],
            [[1047.835, 2391.019], [1393.484, 2589.339], [1253.714, 2887.779]],
          ],
        },
      ];
      const norm = (v) => {
        const m = Math.hypot(v[0], v[1]) || 1;
        return [v[0] / m, v[1] / m];
      };
      // build one drawn subpath in page px → {start, end, startTan, endTan, d}
      function makeSeg(pts) {
        const fmt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
        let d = `M ${fmt(pts.start)}`;
        for (const c of pts.curves) d += ` C ${fmt(c[0])} ${fmt(c[1])} ${fmt(c[2])}`;
        const last = pts.curves[pts.curves.length - 1];
        return {
          start: pts.start, end: last[2],
          startTan: norm([pts.curves[0][0][0] - pts.start[0], pts.curves[0][0][1] - pts.start[1]]),
          endTan: norm([last[2][0] - last[1][0], last[2][1] - last[1][1]]),
          d,
        };
      }

      // overlay pixel coordinate space (1 unit = 1px); set per build
      let curW = 1440, curH = 3021, pathTopY = 0, pathBotY = 0;
      // each drawn segment carries its motion-space [mStart,mEnd] and
      // visible-space [vStart,vEnd]; bridges fill the gaps between them
      let SEGS = [], motionLen = 0, visLen = 0;

      function setupGeometry() {
        const f = section.getBoundingClientRect();
        const sk = sky.getBoundingClientRect();
        fly.style.top = (sk.top - f.top) + 'px';     // negative → reaches up into the sky
        fly.style.height = (f.bottom - sk.top) + 'px';
      }

      function buildPath() {
        const f = section.getBoundingClientRect();
        const sk = sky.getBoundingClientRect();
        const bl = blurb.getBoundingClientRect();
        curW = fly.clientWidth;
        curH = f.bottom - sk.top;
        // pixel-matched viewBox → no horizontal/vertical distortion at any width
        trail.closest('svg').setAttribute('viewBox', `0 0 ${curW} ${curH}`);
        // segment 1: pin the fixed-px arc just above-left of the blurb
        const dx = (bl.left + 26) - ARC.end[0];
        const dy = (bl.top - sk.top - 33) - ARC.end[1];
        const A = (pt) => [pt[0] + dx, pt[1] + dy];
        // segments 2 & 3: Figma frame coords → overlay px, anchored to the blurb
        const s = bl.width / FBLURB.w;
        const F = (pt) => [
          bl.left + (pt[0] - FBLURB.x) * s,
          (bl.top - sk.top) + (pt[1] - FBLURB.y) * s,
        ];
        // assemble the drawn segments in page px (seg 1 = arc, seg 2 & 3 = Figma)
        const segs = [];
        segs.push(makeSeg({ start: A(ARC.start), curves: ARC.curves.map(c => c.map(A)) }));
        for (const fs of FSEGS) segs.push(makeSeg({ start: F(fs.start), curves: fs.curves.map(c => c.map(F)) }));

        // visible trail: each segment is its own subpath, so the M between them
        // leaves a GAP — nothing is drawn across the blurb or between segments.
        const visD = segs.map(sg => sg.d).join(' ');
        trail.setAttribute('d', visD);

        // continuous motion path = seg + invisible bridge + seg + bridge + seg …
        // The plane parks at each segment's end while crossing a bridge, then
        // restarts at the next segment — it never glides over the gaps.
        let motionD = segs[0].d;
        motion.setAttribute('d', motionD);
        let accM = motion.getTotalLength();
        segs[0].mStart = 0; segs[0].mEnd = accM;
        segs[0].vStart = 0; segs[0].vEnd = accM;
        for (let i = 1; i < segs.length; i++) {
          const prev = segs[i - 1], cur = segs[i];
          const span = Math.hypot(cur.start[0] - prev.end[0], cur.start[1] - prev.end[1]) * 0.4;
          const b1 = [prev.end[0] + prev.endTan[0] * span, prev.end[1] + prev.endTan[1] * span];
          const b2 = [cur.start[0] - cur.startTan[0] * span, cur.start[1] - cur.startTan[1] * span];
          const bridgeD = ` C ${b1[0].toFixed(1)} ${b1[1].toFixed(1)}`
                        + ` ${b2[0].toFixed(1)} ${b2[1].toFixed(1)}`
                        + ` ${cur.start[0].toFixed(1)} ${cur.start[1].toFixed(1)}`;
          motion.setAttribute('d', motionD + bridgeD);
          const afterBridge = motion.getTotalLength();
          motionD += bridgeD + cur.d.replace(/^M[^C]*/, ''); // append seg, drop its M
          motion.setAttribute('d', motionD);
          const afterSeg = motion.getTotalLength();
          cur.mStart = afterBridge; cur.mEnd = afterSeg;
          cur.vStart = prev.vEnd;   cur.vEnd = prev.vEnd + (afterSeg - afterBridge);
          accM = afterSeg;
        }
        motionLen = motion.getTotalLength();
        visLen = trail.getTotalLength();
        // mask the trail with the CONTINUOUS motion path (one subpath) so the
        // dash-reveal front tracks the plane's true distance travelled — each
        // segment is only revealed as the plane actually reaches it.
        maskPath.setAttribute('d', motionD);
        maskPath.style.strokeDasharray = motionLen;
        SEGS = segs;

        const bb = motion.getBBox();
        pathTopY = bb.y; pathBotY = bb.y + bb.height;

        // scroll position at which the plane finishes its flight (p === 1):
        // read-line (vh/2) reaches the path bottom → botVp = vh/2.
        // botVp = sky.top + pathBotY and sky.top = skyFlowTop − scrollY, so
        // scrollY = skyFlowTop + pathBotY − vh/2. Published for the pin logic
        // below, which delays the testimonials slide until the plane is done.
        const skyFlowTop = sk.top + window.scrollY;
        window.__planeEndScroll = skyFlowTop + pathBotY - window.innerHeight * 0.5;
      }

      let lastMd = null, lastAppear = null, lastFade = 1;
      function update() {
        const sk = Scroll.rect(sky);
        const vh = Scroll.vh();
        // Don't show the plane on first load: only reveal it once the user starts
        // scrolling and the sky band slides up over the hero. appear = 0 at the top,
        // then eases in gently over roughly a full viewport of scroll.
        const scrolled = Scroll.y();
        // path top/bottom in viewport space (overlay box is 1:1 px now)
        const topVp = sk.top + pathTopY;
        const botVp = sk.top + pathBotY;
        // Read-line ~half-way down the viewport: the plane completes the path as
        // that line crosses from the path's top to its bottom — so the arc is fully
        // flown by the time its end (above the blurb) reaches mid-screen.
        let p = (vh * 0.5 - topVp) / (botVp - topVp);
        p = Math.max(0, Math.min(1, p));
        if (reduce) p = 1;

        // three SEPARATE segments: the plane flies a segment, then PARKS at its
        // end while the read-line crosses the gap (the blurb, then the header),
        // then RESTARTS at the next segment — it never glides over a gap.
        const md = p * motionLen;
        const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
        // p clamps to 0 before the flight and 1 after it, so md stops changing while
        // the plane is parked — but the three getPointAtLength() samples below are the
        // most expensive JS on the page. Bail when neither the distance nor the fade
        // moved and the last write is still on screen.
        const appearNow = reduce ? 1 : ease(scrolled / (vh * 0.95));
        if (md === lastMd && appearNow === lastAppear) return;
        const mdChanged = md !== lastMd;
        lastAppear = appearNow;
        // While the plane is PARKED (md unchanged) only the fade is moving — reuse
        // the cached fade/position and skip the three getPointAtLength() samples,
        // which are the most expensive JS on the page and used to run for the
        // whole first viewport of scroll just to update this opacity.
        if (!mdChanged) { sprite.style.opacity = lastFade * appearNow; return; }
        lastMd = md;
        // fade the plane out→in while crossing a gap (bridge) between segments,
        // so the jump to the next segment is never seen, nor shown over the text
        let opacity = 1;
        for (let i = 1; i < SEGS.length; i++) {
          const pv = SEGS[i - 1], sg = SEGS[i];
          if (md > pv.mEnd && md < sg.mStart) {
            const bp = (md - pv.mEnd) / (sg.mStart - pv.mEnd);
            opacity = Math.max(1 - ease(bp / 0.4), ease((bp - 0.6) / 0.4));
            break;
          }
        }
        lastFade = opacity;
        const pt = motion.getPointAtLength(md);
        const pA = motion.getPointAtLength(Math.max(0, md - 1));
        const pB = motion.getPointAtLength(Math.min(motionLen, md + 1));
        const ang = Math.atan2(pB.y - pA.y, pB.x - pA.x) * 180 / Math.PI;

        // gate everything behind the sky↔hero overlap so nothing shows on load
        const appear = appearNow;

        // reveal the trail only as far as the plane has travelled
        maskPath.style.strokeDashoffset = motionLen - md;
        sprite.style.opacity = opacity * appear;

        // position via transform only — writing left/top here forced a layout
        // pass on every scroll frame inside the sticky featured-work section
        sprite.style.transform =
          `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px) translate(-50%, -50%) rotate(${ang + PLANE_OFFSET}deg)`;
      }
      function rebuild() {
        // Skip while the section is hidden (e.g. the #about route sets it to
        // display:none): zero-size rects would overwrite the good geometry with a
        // collapsed path. Keep the last valid build until the section is shown again.
        if (!section.offsetHeight || !fly.clientWidth) return;
        lastMd = lastAppear = null;   // geometry moved → the skip-cache is stale
        setupGeometry(); buildPath(); update();
      }
      Scroll.add(update);
      window.addEventListener('resize', rebuild);
      rebuild();
    })();

    /* ── pin featured-work's tail so testimonials scrolls up over it ──
       sticky `top` = 100vh − section height pins the section's BOTTOM to the
       viewport bottom: it scrolls normally through the tiles, then holds its last
       screen while the (higher z-index) testimonials slides up and overlaps it. */
    (function () {
      const fw = document.querySelector('.featured-work');
      const testi = document.querySelector('.testimonials');
      if (!fw || !testi) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const desktop = matchMedia('(min-width: 1101px)');   // below this it reflows static
      const PLANE_BUFFER = 160;   // extra scroll after the plane lands before the slide
      let mobilePinned = false;   // true while the mobile bottom-pin is active
      // The recede dim is an OVERLAY, not a filter on the section: writing
      // `filter: brightness()` on .featured-work every frame forced the whole
      // subtree — four playing warped tile videos included — to re-rasterize
      // into a filter layer per frame. An opacity fade on a black overlay is
      // compositor-only, so the dim costs nothing while it scrubs.
      const shade = document.createElement('div');
      shade.setAttribute('aria-hidden', 'true');
      shade.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:99;';
      fw.appendChild(shade);
      let testiH = 0;             // cached testimonials height (avoids per-frame reflow)
      let fwH = 0;                // ditto for the work section
      // keep the mobile bottom-pins glued to the LIVE viewport bottom. The iOS toolbar
      // show/hide changes innerHeight without a width change; recomputing top here (cheap,
      // no reflow — the heights are cached) stops a gap from opening under a section where
      // the pinned hero would otherwise peek through as a blue band.
      // BOTH sections need this: they are bottom-pinned by the same frozen `vh - height`
      // sum, so re-syncing only the testimonials left the work section's own bottom short
      // of the viewport during its hold window (the gap showed up between the last tile
      // and the testimonials sliding up).
      function repinMobile() {
        if (!mobilePinned) return;
        const vh = Scroll.vh();
        const top = Math.min(0, vh - testiH) + 'px';
        if (top !== lastPinTop) { testi.style.top = top; lastPinTop = top; }
        const fwTop = Math.min(0, vh - fwH) + 'px';
        if (fwTop !== lastFwTop) { fw.style.top = fwTop; lastFwTop = fwTop; }
      }
      let lastPinTop = null, lastFwTop = null;
      function setPin() {
        lastPinTop = lastFwTop = null;   // this rewrites `top` itself; don't let the dedupe skip the next sync
        if (reduce) {
          fw.style.position = 'relative';   // no pin under reduced-motion
          fw.style.top = 'auto';
          fw.style.transform = '';
          shade.style.opacity = '0';
          testi.style.marginTop = '';
          testi.style.position = '';
          testi.style.top = '';
          testi.style.bottom = '';
          mobilePinned = false;
          return;
        }
        // Hidden (e.g. the #about route) → offsetHeight is 0; bail so we don't pin
        // the section to top:0 and clobber the testimonials margin with garbage.
        if (!fw.offsetHeight) return;
        fw.style.position = 'sticky';
        const vh = window.innerHeight;
        fwH = fw.offsetHeight;   // cached so repinMobile() can re-sync without a reflow
        fw.style.top = Math.min(0, vh - fwH) + 'px';
        if (desktop.matches) {
          // Desktop: testimonials pins via its own CSS (sticky top:0). Hold the
          // pinned work section until the plane has finished, THEN let the
          // testimonials slide over it. The work section pins when its bottom hits
          // the viewport bottom; we push the testimonials down so it doesn't enter
          // until the plane's completion scroll (+ a small buffer) — the held screen
          // (tiles + the plane landing) stays put through the gap, then the green
          // slides up over it.
          testi.style.position = '';
          testi.style.top = '';
          testi.style.bottom = '';
          mobilePinned = false;
          const planeEnd = window.__planeEndScroll || 0;
          const testiNaturalTop = fw.offsetTop + fw.offsetHeight;   // flow top w/o margin
          const margin = Math.max(0, planeEnd + PLANE_BUFFER + vh - testiNaturalTop);
          testi.style.marginTop = margin + 'px';
        } else {
          // Mobile: no plane hold. Bottom-pin the testimonials the same way the
          // work section is pinned, so the footer (z:12) slides up over it —
          // the full layered reveal: work → testimonials → footer. The `top` is
          // kept in sync with the LIVE innerHeight by repinMobile() on scroll, so
          // the iOS toolbar showing/hiding can't leave the pinned bottom short of
          // the viewport bottom (which opened a gap where the blue hero peeked through
          // above the footer crest). Cache the height so the scroll handler doesn't
          // reflow every frame.
          //
          // HOLD BUFFER: without this the testimonials sit exactly at the viewport
          // bottom the instant the work section pins, so the last two tiles (which
          // land at the bottom of the held screen) get wiped by the rising green
          // before they can be read. Push the testimonials down by ~0.6vh of extra
          // flow so the pinned work screen holds — the last tiles stay on-screen —
          // for a comfortable scroll before the green slides up (the mobile analogue
          // of the desktop PLANE_BUFFER hold).
          testi.style.marginTop = Math.round(vh * 0.6) + 'px';
          testi.style.bottom = '';
          testi.style.position = 'sticky';
          testiH = testi.offsetHeight;
          testi.style.top = Math.min(0, vh - testiH) + 'px';
          mobilePinned = true;
        }
        recede();
      }
      // As the testimonials section scrolls up over the pinned work section, push
      // the work section back: dim it down as the green slides over so it visibly
      // recedes into shadow — a more dramatic, layered reveal. (Shade overlay only —
      // a full-bleed scale would expose the pinned hero at the section's edges.)
      const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
      function recede() {
        // Mobile: skip the dim entirely — the section is fully covered there anyway.
        if (reduce || !desktop.matches) { shade.style.opacity = '0'; return; }
        const vh = Scroll.vh();
        const top = Scroll.rect(testi).top;              // testimonials top in viewport
        const p = ease((vh - top) / vh);                 // 0 (just entering) → 1 (covering)
        const o = (0.45 * p).toFixed(3);                 // ≈ the old brightness(1−0.42p) dim
        if (o !== lastShade) { shade.style.opacity = o; lastShade = o; }   // skip no-op writes
      }
      let lastShade = null;
      setPin();
      Scroll.add(() => { repinMobile(); recede(); });
      // Only re-pin on a real width/orientation change. Mobile browsers fire `resize`
      // on every toolbar show/hide (height-only) while scrolling; re-pinning there
      // recomputes the sticky tops from a fluctuating innerHeight, which makes the
      // pinned sections jump mid-scroll (the choppiness) and briefly exposes the page
      // background (the "load state" flash). Ignoring height-only resizes keeps the
      // pin rock-steady so the scroll stays smooth.
      let lastW = window.innerWidth;
      window.addEventListener('resize', () => {
        // height-only (toolbar) change: don't run the full setPin (that's the jump/
        // flash the note above describes) — just glue the mobile pin's bottom back to
        // the new viewport bottom. Cheap, no reflow, no gap.
        if (window.innerWidth === lastW) { repinMobile(); return; }
        lastW = window.innerWidth;
        setPin();
      });
      window.addEventListener('load', setPin);
    })();

    /* ── testimonial deck: fan the stacked cards out left/right on scroll ──
       The cards stay stacked through the whole slide-in; only once the section has
       pinned (filled the viewport) does further scroll scrub the fan open. */
    (function () {
      const cards = document.getElementById('t-cards');
      const section = document.querySelector('.testimonials');
      if (!cards || !section) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const desktop = matchMedia('(min-width: 1101px)');
      const SCRUB = 460;   // scroll distance over which the deck fans fully open
      const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
      // The section is sticky, so once it pins its rect.top clamps to 0 and can no
      // longer reveal where the section actually sits in the flow. While it's still
      // scrolling in (rect.top > 0) that's a free read, so keep taking it — but that
      // read never happens if the page LOADS already scrolled past the pin point
      // (reload while parked here, back-navigation, a deep link). Without a flow-top
      // the deck used to sit at --spread 0 for the rest of the session, i.e. the cards
      // never fanned. So measure it directly in that case: drop the sticky for one
      // synchronous layout read and put it straight back (sticky doesn't affect
      // siblings' layout, and nothing paints in between, so this is invisible).
      // Cached — only ever re-measured on load/resize, never per scroll frame.
      let flowTop = null;
      function measureFlowTop() {
        const prevPos = section.style.position;
        const prevTop = section.style.top;
        section.style.position = 'static';
        section.style.top = 'auto';
        flowTop = section.getBoundingClientRect().top + (window.scrollY || 0);
        section.style.position = prevPos;
        section.style.top = prevTop;
      }
      function upd() {
        if (!desktop.matches) { cards.style.removeProperty('--spread'); return; }
        if (reduce) { cards.style.setProperty('--spread', '1'); return; }   // static, all visible
        const sy = Scroll.y();
        // one cached read per frame — height doubles as the visibility check, so this
        // doesn't add a second read to the frame
        const rect = Scroll.rect(section);
        // Hidden (e.g. the #about route) → rects are all 0; bail rather than cache
        // a garbage flow-top off a collapsed section.
        if (!rect.height) return;
        const rectTop = rect.top;
        if (rectTop > 0.5) flowTop = rectTop + sy;   // not pinned yet → free true flow-top
        else if (flowTop == null) measureFlowTop();  // loaded already pinned → measure it
        // past = scroll beyond the point the section fills the viewport (pins).
        // Stacked through the slide-in; scrub the fan only after it pins.
        const past = sy - flowTop;
        const p = ease(past / SCRUB);
        cards.style.setProperty('--spread', p.toFixed(4));
      }
      // The pinned-work script (earlier in this file, so it subscribes first) sets the
      // testimonials' margin-top on load/resize, which moves the flow-top. Drop the
      // cache on those events so the next frame re-derives it.
      function invalidate() { flowTop = null; Scroll.kick(); }
      Scroll.add(upd);
      window.addEventListener('resize', invalidate);
      window.addEventListener('load', invalidate);
    })();

    /* ── testimonials (mobile): infinite-loop horizontal carousel ──
       Below 1100px the deck is a swipe carousel; with only three cards it dead-ends.
       Clone a full set on each side and wrap scrollLeft by one set-width at the seams
       so swiping loops forever and seamlessly. Desktop (the fan deck) is left with its
       original three cards untouched — clones only ever exist in the mobile range. */
    (function () {
      const track = document.getElementById('t-cards');
      if (!track) return;
      const mobile = matchMedia('(max-width: 1100px)');
      const originals = Array.from(track.children);
      if (originals.length < 2) return;
      let clones = [];
      let setW = 0, lo = 0, hi = 0, looping = false;

      function clearClones() {
        clones.forEach((c) => c.remove());
        clones = [];
        looping = false;
      }
      function measure() {
        if (!clones.length) return;
        const first = originals[0];
        const trailFirst = clones[clones.length - originals.length];  // clone of originals[0], appended
        setW = trailFirst.offsetLeft - first.offsetLeft;              // exactly one set (N strides)
        const stride = setW / originals.length;
        const baseX = first.offsetLeft - (track.clientWidth - first.offsetWidth) / 2;  // centre first real card
        // Wrap band is one set wide, shifted by half a card so both edges sit in the
        // gaps BETWEEN cards — never on a snap point (avoids boundary ping-pong) and
        // always reachable (the ±half-card slack absorbs the centre-snap offset).
        lo = baseX - stride / 2;
        hi = baseX + setW - stride / 2;
        looping = setW > 10;                                          // guard against hidden/0-width routes
        if (looping) track.scrollLeft = baseX;
      }
      function build() {
        clearClones();
        if (!mobile.matches) return;
        const lead = originals.map((c) => c.cloneNode(true));
        const trail = originals.map((c) => c.cloneNode(true));
        [...lead, ...trail].forEach((c) => { c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; });
        lead.forEach((c) => track.insertBefore(c, originals[0]));
        trail.forEach((c) => track.appendChild(c));
        clones = [...lead, ...trail];
        measure();                       // offsetLeft is valid synchronously after insertion
        requestAnimationFrame(measure);  // re-measure once layout/fonts settle
      }

      // Wrap only AFTER the scroll settles on a snap point — never mid-scroll. A
      // settled position outside the middle band is always a clone resting on a card
      // centre; hopping by exactly one set-width lands on that clone's identical twin
      // (snap-point → snap-point), so the jump is invisible and can never snap onto
      // the wrong card (the mid-scroll version could land between cards and snap back
      // onto the clone, showing the same author twice).
      let idleTimer = 0;
      track.addEventListener('scroll', () => {
        if (!looping) return;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          const x = track.scrollLeft;
          if (x >= hi) track.scrollLeft = x - setW;        // settled on a trailing clone → hop to its twin
          else if (x < lo) track.scrollLeft = x + setW;    // settled on a leading clone → hop to its twin
        }, 80);
      }, { passive: true });

      mobile.addEventListener('change', build);
      let rt;
      window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          if (!mobile.matches) { clearClones(); return; }
          if (!clones.length) build(); else measure();
        }, 150);
      });
      window.addEventListener('load', () => { if (mobile.matches) measure(); });
      build();
    })();

    /* ── hero heading: split each word into per-letter spans so each letter can
       tilt + lift (and turn gold) on its own hover. (line 2 is rebuilt by the
       roll below, so skip it here) ── */
    (function () {
      document.querySelectorAll('.h-line').forEach((line) => {
        if (line.id === 'scramble') return;
        const text = line.textContent;
        line.textContent = '';
        for (const ch of text) {
          const span = document.createElement('span');
          // tag word-spaces so CSS can target them (e.g. force a mobile line break)
          span.className = ch === ' ' ? 'h-letter h-space' : 'h-letter';
          span.textContent = ch === ' ' ? ' ' : ch;   // keep word-spaces from collapsing in inline-block
          line.appendChild(span);
        }
      });
    })();

    /* ── hero line 2: vertical roll (slot) through the word cycle
       Builds → Codes → Ships → Solves → (loop), each held ~2.5s. Each letter is
       an .h-letter span so it inherits the title's hover tilt/gold. Honors
       prefers-reduced-motion (plain swap, no motion). ── */
    (function () {
      const host = document.getElementById('scramble');
      if (!host) return;

      const WORDS = ['Builds', 'Codes', 'Ships', 'Solves'];  // starts on Builds; reorder freely
      /* HOLD is the pace knob — it's the dead pause between rolls, and the only
         one worth touching. DUR is the roll itself and stays at the original 560
         so the spring overshoot below still has room to read. */
      const HOLD = 900;    // ms a word rests before it rolls
      const DUR  = 560;    // ms of the roll
      const EASE = 'cubic-bezier(0.22, 1.15, 0.36, 1)';   // slight spring overshoot
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let index = 0;

      function makeWord(text) {
        const w = document.createElement('span');
        w.className = 'roll-word';
        for (const ch of text) {
          const s = document.createElement('span');
          s.className = 'h-letter';
          s.textContent = ch;
          w.appendChild(s);
        }
        return w;
      }

      host.textContent = '';
      const track = document.createElement('span');
      track.className = 'roll';
      track.appendChild(makeWord(WORDS[0]));
      host.appendChild(track);

      function next() {
        const word = WORDS[(index + 1) % WORDS.length];
        if (reduce) {                          // no motion — plain swap
          track.replaceChild(makeWord(word), track.firstChild);
          index = (index + 1) % WORDS.length;
          setTimeout(next, HOLD);
          return;
        }
        host.style.overflowClipMargin = '0px';  // tight clip while rolling — nothing peeks past the slot edges
        track.appendChild(makeWord(word));     // stacks directly below the current word

        const h = track.firstChild.getBoundingClientRect().height;   // one word's height
        track.style.transition = `transform ${DUR}ms ${EASE}`;
        requestAnimationFrame(() => { track.style.transform = `translateY(${-h}px)`; });

        function done(e) {
          if (e.propertyName !== 'transform') return;
          track.removeEventListener('transitionend', done);
          track.style.transition = 'none';
          track.style.transform = 'none';
          track.removeChild(track.firstChild);   // drop the word that rolled out
          host.style.overflowClipMargin = '';    // restore the margin so a hover lift can show at rest
          index = (index + 1) % WORDS.length;
          setTimeout(next, HOLD);
        }
        track.addEventListener('transitionend', done);
      }

      setTimeout(next, HOLD);
    })();

    /* ── project tiles: scrub each row from half size up to full as it scrolls
       into view. The row is scaled as a unit from its centre, so the tiles grow
       toward the page centre. Progress tracks the row's viewport position. ── */
    (function () {
      const rows = Array.from(document.querySelectorAll('.tiles-row'));
      if (!rows.length) return;
      // Desktop/tablet scales each ROW as a unit (see .tiles-row CSS). On mobile the
      // rows stack into one column and the reveal is moved onto each .project-tile
      // (see the <=640 CSS), so we also scrub a per-tile --reveal from each tile's own
      // top — that makes the stacked tiles animate one by one instead of two at once.
      const tiles = Array.from(document.querySelectorAll('.project-tile'));
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        rows.forEach(r => r.style.setProperty('--reveal', '1'));
        tiles.forEach(t => t.style.setProperty('--reveal', '1'));
        return;
      }
      const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
      function upd() {
        const vh = Scroll.vh();
        const start = vh * 0.95;   // element top here → reveal begins (0)
        const end   = vh * 0.45;   // element top here → fully revealed (1)
        // Mobile stacks the tiles and bottom-pins the section, so the last tiles never
        // scroll up past 0.45vh — with the desktop threshold they'd stay half-revealed
        // (small + faded) at the pinned hold. Complete their reveal higher up the screen
        // so they're crisp while held.
        const tileEnd = (Scroll.vw() <= 640) ? vh * 0.68 : end;
        // ALL reads, THEN all writes. Reading and writing per element inside one loop
        // means each write dirties layout and the next element's read forces a full
        // synchronous relayout — six elements here was ~75% of the whole page's forced
        // reflows per frame. Two passes costs nothing and removes all of them.
        const rowTops  = rows.map(r => Scroll.rect(r).top);
        const tileTops = tiles.map(t => Scroll.rect(t).top);
        rows.forEach((row, i) => {
          row.style.setProperty('--reveal', ease((start - rowTops[i]) / (start - end)).toFixed(4));
        });
        tiles.forEach((tile, i) => {
          tile.style.setProperty('--reveal', ease((start - tileTops[i]) / (start - tileEnd)).toFixed(4));
        });
      }
      Scroll.add(upd);
    })();

    /* ── project-tile videos: deferred load + viewport-gated playback. The four
       tile videos are ~12MB combined; with autoplay in the markup the browser
       streamed all of them during initial load, competing with everything else.
       Sources ship as data-src (preload="none"), and this promotes + plays each
       video only when its tile nears the viewport, pausing it again off-screen. ── */
    (function () {
      const vids = Array.from(document.querySelectorAll('video[data-tile-vid]'));
      if (!vids.length || !('IntersectionObserver' in window)) {
        // no IO → promote immediately so the tiles still play
        vids.forEach(v => {
          v.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; });
          v.load(); const q = v.play(); if (q && q.catch) q.catch(() => {});
        });
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach(({ target: v, isIntersecting }) => {
          if (isIntersecting) {
            const pending = v.querySelectorAll('source[data-src]');
            if (pending.length) {
              pending.forEach(s => { s.src = s.dataset.src; s.removeAttribute('data-src'); });
              v.load();
            }
            const q = v.play(); if (q && q.catch) q.catch(() => {});
          } else {
            try { v.pause(); } catch (e) {}
          }
        });
      }, { rootMargin: '260px 0px' });
      vids.forEach(v => io.observe(v));
    })();

    /* ── ambient animation gate: the willow sway, logo marquee and footer garden
       run infinite animations (~23 of them) whether or not their section is on
       screen. Park them via .anim-idle (site.css) while off-screen — purely a
       play-state toggle, so nothing about the animations themselves changes.
       DOMContentLoaded so the <site-footer> custom element has rendered. ── */
    document.addEventListener('DOMContentLoaded', () => {
      if (!('IntersectionObserver' in window)) return;
      const targets = ['.logo-marquee-wrap', '.testimonials', '.footer']
        .map(sel => document.querySelector(sel)).filter(Boolean);
      if (!targets.length) return;
      const io = new IntersectionObserver(entries => entries.forEach(e =>
        e.target.classList.toggle('anim-idle', !e.isIntersecting)
      ), { rootMargin: '80px 0px' });
      targets.forEach(t => io.observe(t));
    });

    /* ── night shooting star: one meteor at a time, crossing the hero left→right
       on a loose cadence. Deliberately NOT an infinite CSS animation — it runs
       ~1.5s every 5–13s, so between passes there is nothing on the compositor at
       all. The timer parks itself whenever the hero scrolls off screen or the
       site is in day mode, so it costs nothing on the pages/themes without it. ── */
    (function () {
      var hero = document.querySelector('.hero');
      var star = document.querySelector('.hero-meteor');
      if (!hero || !star) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      var timer = 0, flying = false;
      var wasNight = document.body.classList.contains('night');

      function rnd(a, b) { return a + Math.random() * (b - a); }
      function schedule(ms) { clearTimeout(timer); timer = setTimeout(fire, ms); }

      /* .hero is position:sticky, so it never stops intersecting the viewport —
         the projects section just scrolls OVER it. An IntersectionObserver here
         reports "visible" at every scroll position and gates nothing; the real
         test is whether the page has scrolled past the hero's own height. */
      var onHero = function () {
        var y  = (window.Scroll && Scroll.y)  ? Scroll.y()  : (window.pageYOffset || 0);
        var vh = (window.Scroll && Scroll.vh) ? Scroll.vh() : window.innerHeight;
        return y < (hero.offsetHeight || vh) * 0.9;
      };
      var wasOnHero = onHero();

      function fire() {
        /* day mode or scrolled past — skip this pass and check back, rather than
           tearing the loop down and needing to rebuild it on the theme toggle */
        if (!document.body.classList.contains('night') || !onHero()) { schedule(4000); return; }
        var h = hero.offsetHeight || window.innerHeight;
        var w = hero.offsetWidth  || window.innerWidth;
        /* start high and fall shallowly: at 14°+ the streak drops ~460px over a
           desktop crossing and ploughs straight through the headline */
        star.style.setProperty('--m-top',    Math.round(rnd(0.05, 0.28) * h) + 'px');
        star.style.setProperty('--m-len',    Math.round(rnd(130, 260)) + 'px');
        star.style.setProperty('--m-angle',  rnd(7, 13).toFixed(1) + 'deg');
        /* overshoot the width so the streak fully clears the right edge */
        star.style.setProperty('--m-travel', Math.round(w * 1.15 + 260) + 'px');
        star.style.animation = 'none';
        void star.offsetWidth;               // reflow, or re-assigning the same name won't restart it
        star.style.animation = 'hero-meteor-fly ' + rnd(1.1, 1.8).toFixed(2) + 's linear';
      }

      star.addEventListener('animationstart', function () { flying = true; });
      star.addEventListener('animationend', function () {
        flying = false;
        star.style.animation = 'none';       // back to the opacity:0 base state
        schedule(rnd(5200, 13000));
      });

      /* answer the theme toggle directly instead of waiting on the day-mode poll —
         that poll only rechecks every 4s, so flipping to night could sit empty
         that long before the first pass. Guarded on `flying` so toggling mid-pass
         doesn't restart a streak that is already halfway across. */
      if ('MutationObserver' in window) {
        new MutationObserver(function () {
          var night = document.body.classList.contains('night');
          if (night && !wasNight && !flying) schedule(600);
          wasNight = night;
        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
      }

      /* scrolling back up to the hero resumes without waiting on the 4s poll.
         Cheap: Scroll.y() is the value the scheduler already captured this frame,
         so this adds a comparison and no layout read. */
      if (window.Scroll && Scroll.add) {
        Scroll.add(function () {
          var now = onHero();
          if (now && !wasOnHero && !flying) schedule(700);
          wasOnHero = now;
        });
      }

      schedule(1400);   // booting straight into night (persisted theme) shouldn't wait either
    })();

    /* ── day wind gust: the night→day counterpart to the shooting star. The
       cirrus layer drifts left→right and settles, so the switch lands as a gust
       of wind clearing the night sky rather than a straight cut. Fires only on
       the transition, never on a plain day load — the hero is otherwise still,
       and an unprompted drift on every visit reads as a glitch. ── */
    (function () {
      var sky = document.querySelector('.hero-sky');
      if (!sky || !('MutationObserver' in window)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      var wasNight = document.body.classList.contains('night');

      sky.addEventListener('animationend', function () { sky.style.animation = 'none'; });

      new MutationObserver(function () {
        var night = document.body.classList.contains('night');
        if (!night && wasNight) {
          sky.style.animation = 'none';
          void sky.offsetWidth;            // reflow, or re-assigning the same name won't restart it
          /* curve picked off a sampled filmstrip: a harder ease covered 60% of the
             drift in the first 360ms and then sat still for 2.5s, which reads as a
             snap, not a gust. This one still decelerates but stays visibly in
             motion to ~1.8s. */
          sky.style.animation = 'hero-sky-gust 3s cubic-bezier(0.2,0.7,0.3,1)';
        }
        wasNight = night;
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    })();

    /* ── playground: 3D coverflow carousel. Cards sit on a rotating ring —
       the centred card is upright and playing, neighbours recede in Z, rotate
       away and dim. Drag / wheel / ← → to rotate; click the centre card (or
       "Open full screen") to expand into a lightbox. Replaces the old infinite
       draggable warping grid. ── */
    (function () {
      var view  = document.getElementById('playground-view');
      var stage = document.getElementById('pgf-stage');
      var track = document.getElementById('pgf-track');
      if (!view || !stage || !track) return;

      var DATA = [
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-fitflow-card.mp4',      type:'video', title:'Membership Card',   tool:'Spline · 2024',  desc:'Built for a FlutterFlow vignette, showcased at the FlutterFlow Developer Conference 2024.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-burger.mp4',            type:'video', title:'Exploding Burger',   tool:'Blender · 2024', desc:'A playful deconstructed burger crafted for a circular carousel vignette in the Flutter Animate showcase.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-neon-factory.mp4',      type:'video', title:'G-Land',             tool:'Spline · 2024',  desc:'An interactive island reimagining the gskinner workspace and workflow as an explorable digital world.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-digital-innovators.mp4',type:'video', title:'Digital Innovators', tool:'Spline · 2023',  desc:'A scattering-pixel experiment dissolving form into motion and light.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-gradient-sphere.mp4',   type:'video', title:'Dispersion',         tool:'Spline · 2024', desc:'Exploring gradient blends and prismatic color through dispersion effects.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-desk-frame.mp4',        type:'video', title:'The Frame',          tool:'Blender · 2023', desc:'A custom-designed and 3D-printed frame created for a gskinner company offsite.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-light-streaks.mp4',     type:'video', title:'Light Streaks',      tool:'Blender · 2023', desc:'A thunder-inspired experiment capturing energy through streaking light and motion.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-distopia.mp4',          type:'video', title:'Dystopian City',     tool:'Blender · 2024',  desc:'A moody urban experiment envisioning a fractured, futuristic skyline.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-donut.png',             type:'img',   title:'Realistic Donut',    tool:'Blender · 2023', desc:'A study in texture, lighting, and realism — rendered down to the last sprinkle.' },
        { src:(window.ASSET_BASE||'')+'assets/playground/pg-dungeon.mp4',           type:'video', title:'Dungeons & Dragons', tool:'Blender · 2023',  desc:'An interactive build bringing a tabletop fantasy world to life in 3D.' }
      ];
      var N = DATA.length;
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var mod = function (a, b) { return ((a % b) + b) % b; };
      function pad(n) { return n < 10 ? '0' + n : '' + n; }
      function posterFor(d) { return d.type === 'img' ? d.src : d.src.replace('/playground/', '/playground/posters/').replace(/\.mp4$/, '.jpg'); }
      function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

      var active = 0;

      /* ── build cards ── */
      var cards = DATA.map(function (d, i) {
        var card = document.createElement('div');
        card.className = 'pgf-card';
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', d.title + ' — open full screen');
        card.setAttribute('tabindex', '-1');
        var poster = posterFor(d);
        var media = d.type === 'video'
          ? '<video muted loop playsinline preload="none" poster="' + esc(poster) + '"><source data-src="' + esc(d.src) + '" type="video/mp4"></video>'
          : '<img src="' + esc(d.src) + '" alt="' + esc(d.title) + '" loading="lazy">';
        card.innerHTML =
          '<div class="pgf-card-media">' + media + '</div>' +
          '<div class="pgf-card-vhs"></div>' +
          '<span class="pgf-card-expand" aria-hidden="true">⤢<i>Open</i></span>';
        track.appendChild(card);
        return card;
      });

      /* ── coverflow layout ── */
      function layout() {
        var isMobile = innerWidth < 620;
        var spread  = isMobile ? 60 : 54;   // % translateX per step
        var depth   = isMobile ? 250 : 300; // px translateZ per step
        var rot     = isMobile ? 32 : 38;   // deg rotateY per step
        var visible = isMobile ? 1 : 2;     // neighbours shown each side

        cards.forEach(function (card, i) {
          var off = i - active;
          if (off >  N / 2) off -= N;       // wrap to shortest path → continuous ring
          if (off < -N / 2) off += N;
          var abs = Math.abs(off);
          var dir = off < 0 ? -1 : (off > 0 ? 1 : 0);

          if (abs > visible) {
            card.style.opacity = '0';
            card.style.pointerEvents = 'none';
            card.style.transform =
              'translate3d(' + (dir * spread * (visible + 1)) + '%,0,' + (-depth * (visible + 1)) + 'px) rotateY(' + (-dir * rot) + 'deg) scale(.5)';
            return;
          }
          var scale = 1 - abs * (isMobile ? 0.16 : 0.14);
          var opacity = abs === 0 ? 1 : (abs === 1 ? 0.55 : 0.22);
          card.style.opacity = String(opacity);
          card.style.pointerEvents = 'auto';
          card.style.zIndex = String(100 - abs);
          card.style.transform =
            'translate3d(' + (off * spread) + '%,0,' + (-abs * depth) + 'px) rotateY(' + (-off * rot) + 'deg) scale(' + scale + ')';
          card.classList.toggle('is-active', off === 0);
          card.setAttribute('tabindex', off === 0 ? '0' : '-1');
        });
        updateActiveMedia();
        updateCaption();
      }

      /* ── only the centred clip plays ── */
      function updateActiveMedia() {
        cards.forEach(function (card, i) {
          var video = card.querySelector('video');
          if (!video) return;
          if (i === active && !document.hidden && route.token() === '#playground') {
            var src = video.querySelector('source');
            if (src && !src.src) { src.src = src.dataset.src; video.load(); }
            if (!reduce) { var q = video.play(); if (q && q.catch) q.catch(function () {}); }
          } else {
            try { video.pause(); } catch (e) {}
          }
        });
      }

      /* ── caption ── */
      var cap      = document.getElementById('pgf-caption');
      var capIndex = document.getElementById('pgf-cap-index');
      var capTags  = document.getElementById('pgf-cap-tags');
      var capTitle = document.getElementById('pgf-cap-title');
      var capDesc  = document.getElementById('pgf-cap-desc');
      function updateCaption() {
        var d = DATA[active];
        cap.classList.add('swap');
        setTimeout(function () {
          capIndex.textContent = pad(active + 1) + ' / ' + pad(N);
          capTags.textContent  = d.tool;
          capTitle.textContent = d.title;
          capDesc.textContent  = d.desc;
          cap.classList.remove('swap');
        }, 180);
      }

      /* ── navigation ── */
      function go(i) { active = mod(i, N); layout(); }
      function next() { go(active + 1); }
      function prev() { go(active - 1); }

      document.getElementById('pgf-next').addEventListener('click', next);
      document.getElementById('pgf-prev').addEventListener('click', prev);

      // card click → open (if centred) or rotate to it, unless it was a drag
      cards.forEach(function (card, i) {
        card.addEventListener('click', function () {
          if (dragMoved) return;
          if (i === active) openLightbox(i); else go(i);
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
        });
      });

      /* keyboard rotate (only on the playground route, lightbox closed) */
      window.addEventListener('keydown', function (e) {
        if (route.token() !== '#playground') return;
        if (lb.classList.contains('open')) return;
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft')  prev();
      });

      /* ── drag / swipe — axis-locked. Horizontal rotates the ring; a plain
         tap still opens the lightbox (no pointer capture). ── */
      var dragging = false, startX = 0, startY = 0, axis = null, dragMoved = false;
      stage.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.pgf-arrow')) return;   // let arrow buttons click
        dragging = true; startX = e.clientX; startY = e.clientY; axis = null; dragMoved = false;
      });
      stage.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (!axis) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        }
        if (axis === 'x' && Math.abs(dx) > 50) { dragMoved = true; if (dx < 0) next(); else prev(); startX = e.clientX; }
      });
      function endDrag() { dragging = false; axis = null; setTimeout(function () { dragMoved = false; }, 50); }
      stage.addEventListener('pointerup', endDrag);
      stage.addEventListener('pointercancel', endDrag);
      stage.addEventListener('pointerleave', endDrag);

      /* ── wheel over the stage → rotate (endless loop, page never scrolls) ── */
      var wheelLock = false;
      stage.addEventListener('wheel', function (e) {
        var dx = e.deltaX, dy = e.deltaY;
        var dir = (Math.abs(dx) > Math.abs(dy)) ? (dx < 0 ? -1 : 1) : (dy < 0 ? -1 : 1);
        if (dir === 0) return;
        e.preventDefault();
        if (wheelLock) return;
        wheelLock = true;
        if (dir > 0) next(); else prev();
        setTimeout(function () { wheelLock = false; }, 420);
      }, { passive: false });

      /* ── lightbox ── */
      var lb      = document.getElementById('pgf-lightbox');
      var lbStage = document.getElementById('pgf-lb-stage');
      var lbIndex = document.getElementById('pgf-lb-index');
      var lbTitle = document.getElementById('pgf-lb-title');
      var lbDesc  = document.getElementById('pgf-lb-desc');
      var lbTags  = document.getElementById('pgf-lb-tags');
      var lbCurrent = 0;

      function renderLightbox(i) {
        var d = DATA[i]; lbCurrent = i;
        // native controls (pause / skip / scrub) on desktop only — on phones they
        // overlay the clip, so there we play muted+looping with no chrome.
        var isMobile = matchMedia('(max-width: 620px)').matches;
        var vAttrs = isMobile ? 'muted autoplay loop playsinline' : 'controls autoplay loop playsinline';
        lbStage.innerHTML = d.type === 'video'
          ? '<video src="' + esc(d.src) + '" poster="' + esc(posterFor(d)) + '" ' + vAttrs + '></video>'
          : '<img src="' + esc(d.src) + '" alt="' + esc(d.title) + '">';
        lbIndex.textContent = pad(i + 1) + ' / ' + pad(N);
        lbTitle.textContent = d.title;
        lbDesc.textContent  = d.desc;
        lbTags.textContent  = d.tool;
      }
      function openLightbox(i) {
        go(i);
        renderLightbox(i);
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.getElementById('pgf-lb-close').focus();
      }
      function closeLightbox() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        lbStage.innerHTML = '';
        updateActiveMedia();
      }
      function lbGo(step) { var i = mod(lbCurrent + step, N); go(i); renderLightbox(i); }
      document.getElementById('pgf-lb-close').addEventListener('click', closeLightbox);
      document.getElementById('pgf-lb-next').addEventListener('click', function () { lbGo(1); });
      document.getElementById('pgf-lb-prev').addEventListener('click', function () { lbGo(-1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
      window.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowRight') lbGo(1);
        if (e.key === 'ArrowLeft')  lbGo(-1);
      });

      /* ── lifecycle — play/pause the centred clip on route + tab-visibility ── */
      function start() { active = 0; layout(); }
      function stop() {
        closeLightbox();
        cards.forEach(function (card) { var v = card.querySelector('video'); if (v) { try { v.pause(); } catch (e) {} } });
      }
      window.addEventListener('hashchange', function () { if (route.token() === '#playground') start(); else stop(); });
      window.addEventListener('resize', function () { clearTimeout(window._pgfRz); window._pgfRz = setTimeout(layout, 120); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else if (route.token() === '#playground') updateActiveMedia();
      });

      layout();
      if (route.token() === '#playground') start();
    })();
