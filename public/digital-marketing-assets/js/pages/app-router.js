/* APP ROUTER — in-page routing, view switching, case study decks */
(function () {
      // ── in-page routing: #about / #playground open their views, hide the landing ──
      const aboutView = document.getElementById('about-view');
      const playgroundView = document.getElementById('playground-view');
      const hatchaView = document.getElementById('hatcha-view');
      const fireflutView = document.getElementById('fireflut-view');
      const existenceView = document.getElementById('existence-view');
      const jumpableView = document.getElementById('jumpable-view');

      // Scroll the landing to an in-page anchor (e.g. the case-study Back button →
      // #work). #work (.featured-work) is position:sticky with a JS-set negative
      // top, so its offsetTop overshoots its real document position (that's what
      // dropped users into testimonials). getBoundingClientRect().top + scrollY IS
      // its true position and is accurate here because we run at scrollY≈0, before
      // the section enters its pinned range. Re-asserted because a View Transition
      // restores scroll when it ends, after any in-transition scroll.
      function scrollToHashTarget() {
        const target = location.hash && document.querySelector(location.hash);
        if (!target) return;
        const nav = document.getElementById('nav');
        const doScroll = () => {
          const navH = nav ? nav.getBoundingClientRect().height : 80;
          // reset to the top first so the sticky section is un-pinned and reads
          // its true position (coming from a deep case-study scroll it would
          // otherwise measure its pinned position and overshoot into testimonials).
          // behavior:'instant' is required — the page sets scroll-behavior:smooth,
          // so a plain scrollTo animates and we'd measure mid-animation.
          window.scrollTo({ top: 0, behavior: 'instant' });
          const docTop = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, docTop - navH - 8), behavior: 'instant' });
        };
        doScroll();
        [80, 260].forEach(t => setTimeout(doScroll, t));
      }

      function applyAboutRoute() {
        const isAbout = route.token() === '#about';
        const isPlayground = route.token() === '#playground';
        const isHatcha = route.token() === '#hatcha';
        const isFireflut = route.token() === '#fireflut';
        const isExistence = route.token() === '#existence';
        const isJumpable = route.token() === '#jumpable';
        document.body.classList.toggle('route-about', isAbout);
        document.body.classList.toggle('route-playground', isPlayground);
        document.body.classList.toggle('route-hatcha', isHatcha);
        document.body.classList.toggle('route-fireflut', isFireflut);
        document.body.classList.toggle('route-existence', isExistence);
        document.body.classList.toggle('route-jumpable', isJumpable);
        if (aboutView) aboutView.hidden = !isAbout;
        if (playgroundView) playgroundView.hidden = !isPlayground;
        if (hatchaView) hatchaView.hidden = !isHatcha;
        if (fireflutView) fireflutView.hidden = !isFireflut;
        if (existenceView) existenceView.hidden = !isExistence;
        if (jumpableView) jumpableView.hidden = !isJumpable;
        document.querySelectorAll('.nav-link, .menu-link').forEach(l => {
          const href = l.getAttribute('href') || '';
          l.classList.toggle('active', (isAbout && (href.endsWith('#about') || href.endsWith('/about'))) ||                                       (isPlayground && (href.endsWith('#playground') || href.endsWith('/playground'))));
        });
        // the swapped-in view is a different backdrop under the fixed nav — re-run
        // the contrast check so the nav text/pin/toggle-label recolour to match.
        // fire across the view-transition settle window (the new view paints a few
        // frames after the class swap, so a single tick can sample the old snapshot).
        [0, 90, 320, 650].forEach(t => setTimeout(() => window.updateNavContrast?.(), t));
        // scroll to top after the section swap settles (defeat scroll-anchoring)
        if (isAbout || isPlayground || isHatcha || isFireflut || isExistence || isJumpable) {
          // behavior:'instant' is REQUIRED — the page sets scroll-behavior:smooth, so a bare
          // scrollTo animates the whole way down. Coming off a case study's read-next panel
          // that's a ~1.8s crawl from y≈20900 to 0, and the incoming deck renders every
          // intermediate offset: the next case study visibly plays backwards, last panel to
          // first, before the hero lands. Same gotcha scrollToHashTarget() documents above.
          window.scrollTo({ top: 0, behavior: 'instant' });
          requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        } else {
          // Returning to home: the landing sections were display:none, so their
          // scroll-driven geometry (plane path, sticky pin, tile reveal) was never
          // rebuilt against a real layout. Re-measure once they're painted, so the
          // plane flies and all four tiles reveal correctly.
          requestAnimationFrame(() => requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'));
            // returning to the landing via an in-page anchor (e.g. the Back button
            // → #work): the target was display:none during the browser's native
            // anchor scroll, so scroll to it now it's painted. (For the View
            // Transition path the authoritative scroll happens in .finished below.)
            scrollToHashTarget();
          }));
        }
      }
      // entering/leaving the case study: morph the project tile into the hero
      // image via the View Transitions API (names set in the #hatcha-view CSS).
      // Other route changes, unsupported browsers, and reduced-motion users
      // keep the instant swap.
      // ── Curtain page transition: Home ⇄ About ⇄ Playground. Two panes close
      // to cover the outgoing page, applyAboutRoute swaps the route behind them,
      // then they open (top up / bottom down) revealing the new page while its
      // content fades in. Case studies keep their tile→hero View-Transition morph;
      // reduced-motion keeps the instant swap. ──
      const curtain = document.getElementById('route-curtain');
      const HEAVY_VIEW = { about: 'about-view', playground: 'playground-view' };

      function routeBucket(hash) {
        if (hash === '#about') return 'about';
        if (hash === '#playground') return 'playground';
        if (hash === '#hatcha') return 'hatcha';
        if (hash === '#fireflut') return 'fireflut';
        if (hash === '#existence') return 'existence';
        if (hash === '#jumpable') return 'jumpable';
        return 'home'; // '', '#work', and any in-page landing anchor
      }
      // mirror of pageLoader.showForView's decode wait, WITHOUT the Pac-Man overlay —
      // used to head-start the heavy views' imagery decode.
      function decodeReady(id) {
        const view = document.getElementById(id);
        const imgs = view ? Array.from(view.querySelectorAll('img')).slice(0, 6) : [];
        return Promise.all(imgs.map(img =>
          (img.decode ? img.decode().catch(() => {}) : Promise.resolve())));
      }
      let inTransition = false;
      let curtainHandled = false; // set per-event; tells the loader handler to stand down

      // ONE fixed timeline for EVERY route so the pace is identical regardless of how
      // heavy the destination is: close (T_CLOSE) → dwell (T_HOLD) → open (T_OPEN).
      // Driven purely by setTimeout, NOT transitionend — the panes are transform-only
      // (compositor/GPU) so they keep gliding smoothly even if the main thread stalls
      // while a heavy view (About photos) paints, and the sequence always self-completes
      // (no stuck 'is-active'). The route swap happens under full cover, so any paint
      // stall is hidden behind the panes rather than stuttering a visible frame.
      const T_CLOSE = 550, T_HOLD = 350, T_OPEN = 900;
      function runCurtain(destBucket) {
        inTransition = true;
        // 1) clear any stale state, activate, park panes at their open (off-screen)
        //    start, then close them. is-closed is added SYNCHRONOUSLY after a forced
        //    reflow (which commits the resting transform as the transition's start).
        curtain.classList.remove('is-closing', 'is-closed');
        curtain.classList.add('is-active', 'is-closing');
        void curtain.offsetWidth;                 // flush the resting transform
        curtain.classList.add('is-closed');       // slide in (T_CLOSE)

        // 2) fully covered → swap the route behind the curtain
        setTimeout(() => {
          applyAboutRoute();
          // head-start the heavy view's decode; do NOT await it (keeps pace uniform)
          const heavyId = HEAVY_VIEW[destBucket];
          if (heavyId) decodeReady(heavyId);

          // 3) after the fixed hold, open the panes (T_OPEN). The .rc-scrim fades out
          //    on the same schedule (CSS), so the new page fades 0→100% as it's revealed.
          setTimeout(() => {
            curtain.classList.remove('is-closing', 'is-closed');
            // 4) settle: retire the curtain and recolour the nav
            setTimeout(() => {
              curtain.classList.remove('is-active', 'is-closing', 'is-closed');
              window.updateNavContrast?.();
              inTransition = false;
            }, T_OPEN + 80);
          }, T_HOLD);
        }, T_CLOSE);
      }

      /* ── ROUTE HERO TRANSITION ────────────────────────────────────────────
         Opening a case study — from a home project tile, or from a read-next
         panel — expands that case study's hero out of the thing you
         clicked, takes the whole screen, then slides it DOWN into its resting
         place in the hero while the title and meta rise in above it.

         The overlay (.rt-hero) is ALWAYS exactly one viewport at 0,0 holding a
         clone of the DESTINATION hero mock, so all three states are one
         transform + clip-path off the same box (fitRect). Two consequences
         worth keeping:
          · the destination mock is already width:100% / height:100svh, so the
            settle phase is a PURE TRANSLATE — no scaling, so no warp recompute
            and no distortion on the frame that actually persists;
          · cloning the destination (not the source tile) means the landing is
            pixel-identical to the real mock underneath. The tiles carry their
            own --warp-zoom tuning, so cloning the source would pop on arrival.

         The route swaps at the END of the expand, under full cover, so the page
         you're leaving stays put and simply gets covered. ── */
      const rtHero = (function () {
        const T_EXPAND = 440, T_SETTLE = 620;
        // expand is punchy (quint) so the takeover feels decisive; the settle is a
        // gentler cubic so the drop stays legible the whole way instead of snapping
        // 90% down in the first 120ms and then creeping the rest
        const E_EXPAND = 'cubic-bezier(0.22, 1, 0.36, 1)';
        const E_SETTLE = 'cubic-bezier(0.33, 1, 0.68, 1)';
        let running = false, armed = false;

        // map the one-viewport overlay onto an arbitrary rect: uniform cover-scale
        // plus a clip so the visible window matches that rect's aspect and radius.
        function fitRect(r, radius) {
          const W = innerWidth, H = innerHeight;
          const s = Math.max(r.width / W, r.height / H) || 1;
          return {
            transform: `translate(${r.left + r.width / 2 - W * s / 2}px, ` +
                       `${r.top + r.height / 2 - H * s / 2}px) scale(${s})`,
            clipPath: `inset(${Math.max(0, (H - r.height / s) / 2)}px ` +
                      `${Math.max(0, (W - r.width / s) / 2)}px round ${(radius || 0) / s}px)`
          };
        }
        const fullRect = () => ({ left: 0, top: 0, width: innerWidth, height: innerHeight });

        function open(hash, srcEl) {
          const destView = document.getElementById(hash.slice(1) + '-view');
          const destMock = destView && destView.querySelector('.cs-hero .cs-hero-mock');
          const srcMock = srcEl && (srcEl.querySelector('.cs-hero-mock') || srcEl);
          const srcRect = srcMock && srcMock.getBoundingClientRect();
          if (running || !destMock || !srcRect || !srcRect.width || !srcRect.height ||
              matchMedia('(prefers-reduced-motion: reduce)').matches) {
            route.go(hash);
            return;
          }
          running = true;

          const overlay = document.createElement('div');
          overlay.className = 'rt-hero';
          overlay.setAttribute('aria-hidden', 'true');
          const clone = destMock.cloneNode(true);
          clone.removeAttribute('data-hero-mock');   // don't let anything else adopt it
          overlay.appendChild(clone);
          document.body.appendChild(overlay);

          // the clone came out of a display:none view, so it carries no usable warp
          // matrix — recompute now that it's laid out at the overlay's real size
          window.csWarpUpdate?.(clone);
          const cv = clone.querySelector('video'), sv = srcMock.querySelector('video');
          if (cv) {
            cv.muted = true;
            if (sv) { try { cv.currentTime = sv.currentTime; } catch (_) {} }
            cv.play?.().catch(() => {});
          }

          const radius = parseFloat(getComputedStyle(srcEl).borderRadius) || 0;
          const from = fitRect(srcRect, radius);
          const full = fitRect(fullRect(), 0);
          overlay.style.transform = from.transform;
          overlay.style.clipPath = from.clipPath;

          let gridAnim = null;
          const cleanup = () => {
            document.documentElement.classList.remove('rt-settling');
            overlay.remove();
            gridAnim?.cancel();
            running = false;
            window.updateNavContrast?.();
          };

          // PHASE A — expand out of the clicked thing and take the screen
          const expand = overlay.animate([from, full], { duration: T_EXPAND, easing: E_EXPAND, fill: 'both' });
          expand.finished.then(() => {
              // commit the end state to inline style and drop the animation, so phase B
              // isn't compositing against a still-filling phase A on the same properties
              overlay.style.transform = full.transform;
              overlay.style.clipPath = full.clipPath;
              expand.cancel();
              // swap the route under full cover: hide the real mock + hero copy first
              // so the incoming view can't flash them before the overlay hands off
              document.documentElement.classList.add('rt-settling');

              // Phase B can only be measured AFTER applyAboutRoute has un-hidden the
              // destination: hashchange is dispatched asynchronously, so measuring in a
              // plain rAF here still reads the view at display:none and every rect comes
              // back 0. Wait for the event (this listener is registered after the
              // router's, so the route is already applied when it fires), with a timeout
              // in case the hash was somehow already current and no event lands.
              let settled = false;
              const settle = () => {
                if (settled) return;
                settled = true;
                removeEventListener('hashchange', settle);
                requestAnimationFrame(() => {
                  const destRect = destMock.getBoundingClientRect();
                  if (destRect.width < 1 || destRect.height < 1) { cleanup(); return; }
                  const to = fitRect(destRect, 0);
                  // PHASE B — slide down into place (a pure translate on desktop, where
                  // the hero mock is already exactly one viewport)
                  const b = overlay.animate([full, to], { duration: T_SETTLE, easing: E_SETTLE, fill: 'both' });
                  const grid = destView.querySelector('.cs-hero .cs-hero-grid');
                  if (grid) gridAnim = grid.animate(
                    [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
                    { duration: 520, delay: 120, easing: E_SETTLE, fill: 'both' });
                  b.finished.then(cleanup, cleanup);
                });
              };
              addEventListener('hashchange', settle);
              setTimeout(settle, 200);
              armed = true;
              route.go(hash);
            }, cleanup);
        }

        // the router asks whether this hashchange is ours, exactly once
        function consume() { const was = armed; armed = false; return was; }
        return { open, consume, isRunning: () => running };
      })();
      window.rtHero = rtHero;

      // clicking a project tile, a read-next asset, or a read-next title opens the
      // case study through the hero transition instead of the plain hash swap
      document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest?.('a.project-tile[href^="/work/"], a.rn-asset[href^="/work/"], a.rn-title-link[href^="/work/"]');
        if (!a) return;
        const hash = route.P2H[a.getAttribute('href')];
        if (!hash || hash === route.token() || !document.getElementById(hash.slice(1) + '-view')) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // plain swap
        e.preventDefault();
        // the title link has no mock of its own — expand from its panel's asset
        const src = a.querySelector('.cs-hero-mock') ? a
                  : (a.closest('[data-readnext]')?.querySelector('.rn-asset') || a);
        rtHero.open(hash, src);
      });

      // any other internal path link (nav, menu, reduced-motion fallbacks) routes
      // through the SPA instead of a full document load. Registered AFTER the hero
      // delegate above, so a preventDefault there (defaultPrevented) wins here.
      document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest?.('a[href]');
        if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
        const href = a.getAttribute('href');
        if (route.P2H[href]) {                     // /about, /playground, /work/*
          e.preventDefault();
          if (route.P2H[href] !== route.token()) route.go(route.P2H[href]);
        } else if (href && href.startsWith('/#') && route.token() && !location.hash) {
          // in-page home anchor clicked from a sub-page path: without interception
          // this is a cross-document load; route home, the router scrolls to it
          e.preventDefault();
          route.go(href.slice(1));
        }
      });

      // per-route document titles — the static head carries the home title (and the
      // prerendered pages their own), this keeps the tab title honest on client-side navs
      const ROUTE_TITLES = {
        '#about': 'About ZeroSlash Agency — Product Designer, Chennai',
        '#playground': 'Playground — Design & Code Experiments | ZeroSlash Agency',
        '#hatcha': 'Hatcha — Generative UI for Google I/O | ZeroSlash Agency',
        '#fireflut': 'Fireflut — AI Telecom App for MWC | ZeroSlash Agency',
        '#existence': 'Existence — Time Intelligence App | ZeroSlash Agency',
        '#jumpable': 'Jumpable — Apple Watch Jump Lab | ZeroSlash Agency'
      };
      const HOME_TITLE = 'ZeroSlash Agency — Product Designer in Chennai, India';
      function applyRouteTitle() { document.title = ROUTE_TITLES[route.token()] || HOME_TITLE; }
      window.addEventListener('hashchange', applyRouteTitle);
      applyRouteTitle();

      /* Tile → hero morph, run with the shared view-transition-names switched ON.
         They live behind body.vt-hero (see the .project-tile rules) because a
         named element gets pulled out of the page into the view-transition top
         layer, which paints above the root snapshot and ignores the z-index that
         was covering it. Leaving the names on permanently meant the day/night
         toggle — also a view transition — hoisted the pinned home tiles over the
         sticky testimonials, so they flashed across the willows on every swap.
         Adding the class here keeps the names scoped to case-study navs only. */
      function startHeroTransition(update) {
        document.body.classList.add('vt-hero');
        void document.body.offsetHeight;   // flush styles so the OLD capture sees the names
        const vt = document.startViewTransition(update);
        const drop = () => document.body.classList.remove('vt-hero');
        vt.finished.then(drop, drop);
        return vt;
      }

      let prevHash = route.token();
      window.addEventListener('hashchange', () => {
        const from = routeBucket(prevHash);
        const to = routeBucket(route.token());
        prevHash = route.token();
        curtainHandled = false;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const involvesCaseStudy = from === 'hatcha' || to === 'hatcha' ||
                                  from === 'fireflut' || to === 'fireflut' ||
                                  from === 'existence' || to === 'existence' ||
                                  from === 'jumpable' || to === 'jumpable';

        if (rtHero.consume()) {
          // the hero transition owns this nav: it already has the screen covered and
          // drives the landing itself, so swap plainly — a View Transition here would
          // snapshot over the top of it and stall the hand-off.
          applyAboutRoute();
        } else if (involvesCaseStudy && document.startViewTransition && !reduced) {
          // the View Transition overlays a snapshot until it finishes, so the
          // deferred contrast ticks inside applyAboutRoute sample the OLD view.
          // Re-run once the transition settles so the nav reads the new backdrop.
          startHeroTransition(applyAboutRoute)
            .finished.then(() => { window.updateNavContrast?.(); scrollToHashTarget(); });
        } else if (curtain && !involvesCaseStudy && from !== to && !reduced && !inTransition) {
          curtainHandled = true; // this nav owns the cover; loader handler stands down
          runCurtain(to);
        } else {
          applyAboutRoute();
        }
      });

      // Pac-Man loader on the heavy, instant-swap views: Playground (WebGL canvas)
      // and About (~30MB of photos). Registered after the router's own hashchange
      // handler, so applyAboutRoute has already un-hidden the view (same synchronous
      // event dispatch, before paint) — the loader then covers it while its images
      // decode. Skipped when the curtain ran this nav (it owns the decode hold), and
      // left to run for reduced-motion / re-entrant instant swaps. Case studies are
      // left to their tile→hero View Transition morph rather than an overlay.
      window.addEventListener('hashchange', () => {
        if (curtainHandled) return;
        const HEAVY = { '#about': 'about-view', '#playground': 'playground-view' };
        const id = HEAVY[route.token()];
        if (id) window.pageLoader?.showForView(id);
      });

      // Hidden-view videos ship WITHOUT the autoplay attribute — Chrome starts
      // streaming an autoplay video even inside a display:none subtree, which
      // front-loaded ~16MB of case-study video on the landing page. They carry
      // data-vauto instead: play() fires when the view is actually revealed,
      // then the deck engines take over pausing/resuming per panel as usual.
      (function () {
        document.querySelectorAll('[id$="-view"]').forEach(view => {
          const playAll = () => view.querySelectorAll('video[data-vauto]').forEach(v => {
            const p = v.play(); if (p && p.catch) p.catch(() => {});
          });
          new MutationObserver(() => { if (!view.hidden) playAll(); })
            .observe(view, { attributes: true, attributeFilter: ['hidden'] });
          if (!view.hidden) playAll();
        });
      })();

      // Pre-decode the heavy views' imagery so the first Home→About /
      // Home→Playground hop doesn't pay a paint stall (which would make that
      // curtain dwell longer than the others). Decoding a hidden (display:none)
      // view's images is fine — it warms the decode cache without rendering them.
      // Fired on the first hover/focus/touch of an internal link (navigation
      // intent), NOT at idle: the idle version re-fetched the hidden views'
      // lazy-loaded images during initial load, defeating the deferral.
      function prewarmHeavyViews() {
        ['about-view', 'playground-view'].forEach(id => {
          const v = document.getElementById(id);
          if (!v) return;
          Array.from(v.querySelectorAll('img')).slice(0, 10).forEach(img => {
            if (img.decode) img.decode().catch(() => {});
          });
        });
      }
      let prewarmed = false;
      function prewarmOnIntent(e) {
        if (prewarmed) return;
        const a = e.target && e.target.closest && e.target.closest('a[href*="#"]');
        if (!a) return;
        prewarmed = true;
        ['pointerover', 'focusin', 'touchstart'].forEach(t =>
          document.removeEventListener(t, prewarmOnIntent, true));
        prewarmHeavyViews();
      }
      ['pointerover', 'focusin', 'touchstart'].forEach(t =>
        document.addEventListener(t, prewarmOnIntent, { capture: true, passive: true }));

      // ── Hatcha logo-band animation: scale the 1440×1024 stage to the viewport
      // and (re)play the zoom-out whenever the band scrolls into view ──
      const logoBand = document.querySelector('.cs-logoband');
      const animStage = logoBand && logoBand.querySelector('.cs-anim-stage');
      const animViewport = logoBand && logoBand.querySelector('.cs-anim-viewport');
      function fitAnimStage() {
        if (!animStage || !animViewport) return;
        const r = animViewport.getBoundingClientRect();
        if (!r.width || !r.height) return; // view hidden — keep the last good scale
        // Fit the FULL phone row to the viewport width so the zoom-out fills
        // edge-to-edge with every phone visible: the outer phones extend to
        // x −244…1684 = 1928px, wider than the 1440 stage. min() with the height
        // ratio keeps it contained (no vertical overflow) on tall / ultra-wide panels.
        const designW = window.innerWidth <= 720 ? 560 : 1928;
        animStage.style.setProperty('--s', Math.min(r.width / designW, r.height / 1024));
      }
      if (animStage) {
        window.addEventListener('resize', fitAnimStage);
        fitAnimStage();
        // the band starts inside a hidden view, so re-measure whenever the route
        // opens (rAF: after the section is painted) and when the band scrolls in
        // hold a reference to the observer — unreferenced observers can be GC'd
        // and silently stop firing (seen on direct #hatcha page loads)
        const bandIO = new IntersectionObserver(entries => entries.forEach(e => {
          fitAnimStage();
          logoBand.classList.toggle('play', e.isIntersecting);
        }), { threshold: 0.35 });
        bandIO.observe(logoBand);
        window.addEventListener('hashchange', () => requestAnimationFrame(() => { bandIO.takeRecords(); fitAnimStage(); }));
      }

      // ── scrolling phone mockups (section 03) — scale the 350px design stages
      // to their shells and ping-pong-scroll the card strips while in view ──
      const phonesBlock = document.querySelector('#hatcha-view .cs-phones');
      const phoneShells = phonesBlock ? phonesBlock.querySelectorAll('.cs-pshell') : [];
      function fitPhoneStages() {
        phoneShells.forEach(sh => {
          const w = sh.clientWidth;
          if (!w) return; // view hidden — keep the last good scale
          sh.querySelector('.cs-pstage').style.setProperty('--ps', w / 350);
        });
      }
      if (phoneShells.length) {
        window.addEventListener('resize', fitPhoneStages);
        fitPhoneStages();
        const phonesIO = new IntersectionObserver(entries => entries.forEach(e => {
          fitPhoneStages();
          phonesBlock.classList.toggle('play', e.isIntersecting);
        }), { threshold: 0.25 });
        phonesIO.observe(phonesBlock);
        window.addEventListener('hashchange', () => requestAnimationFrame(() => { phonesIO.takeRecords(); fitPhoneStages(); }));
      }

      // ── reveal on scroll — everything fades + rises (y-axis) as it enters view.
      // TWO treatments (both opacity/transform only, nudged on route because the view
      // starts hidden so IO can't fire until it's shown — same as bandIO/phonesIO):
      //   • text  → .reveal      (subtle 26px rise, css/site.css — matches home)
      //   • asset → .cs-areveal  (MetaLab-style 72px slide + settle-scale, clearly
      //                           visible on large media where 26px is imperceptible)
      (function () {
        const view = document.getElementById('hatcha-view');
        if (!view) return;
        // Text blocks → subtle reveal.
        const textTargets = [...view.querySelectorAll(
          '.cs-hero-h, .cs-hero-intro, .cs-meta > div, .cs-showcase-eye, .cs-showcase-h,' +
          '.cs-rail, .cs-sec-h, .cs-p, .cs-note, .cs-shift-eye, .cs-cmp, .cs-fx,' +
          '.cs-crit-eye, .cs-crit > div, .cs-quote p, .cs-step, .cs-stat,' +
          '.cs-theme-txt-h, .cs-mini, .cs-closing-h, .cs-closing-p, .rn-kicker, .rn-title, .rn-desc'
        )];
        // Assets → hard-edge clip-mask reveal. The hero image is excluded — its
        // entrance is the tile→hero view-transition zoom, which a reveal would fight.
        const assetTargets = [...view.querySelectorAll(
          '.cs-phones, .cs-palette, .cs-guardrail-img, .cs-ph'
        )];
        textTargets.forEach(el => el.classList.add('reveal'));
        // match the clip's rounded corners to each asset's own radius, and give the
        // sideways-overflowing phones assembly a side-safe (top-only) clip.
        const clip = el => {
          el.classList.add('cs-clip');
          el.style.setProperty('--clip-round', getComputedStyle(el).borderTopLeftRadius || '0px');
        };
        assetTargets.forEach(el => {
          clip(el);
          if (el.classList.contains('cs-phones')) el.classList.add('cs-clip-wide');
        });
        const targets = [...textTargets, ...assetTargets];
        if (!targets.length) return;

        // gentle per-row stagger where blocks sit side by side in a grid
        ['.cs-meta', '.cs-crit', '.cs-steps', '.cs-stats'].forEach(sel => {
          view.querySelectorAll(sel + ' > *').forEach((el, i) => {
            el.style.setProperty('--reveal-delay', (i * 0.08).toFixed(2) + 's');
          });
        });

        // The gallery is a horizontal auto-scroll loop — reveal its tiles (pronounced,
        // cascading left-to-right) when the strip enters vertical view; tiles scrolled
        // off to the right never intersect the viewport on their own.
        // NOTE: a later script (design-system gallery loop) clones this tile set for
        // the seamless wrap, so reveal the LIVE tiles in the observer below — the
        // clones don't exist yet here and would otherwise stay invisible.
        const gallery = view.querySelector('.cs-gallery');
        (gallery ? [...gallery.querySelectorAll('.cs-ds-tile')] : []).forEach((t, i) => {
          clip(t);
          t.style.setProperty('--reveal-delay', (i * 0.09).toFixed(2) + 's');
        });

        const REVEALABLE = '.reveal, .cs-clip';
        const reduce = matchMedia('(prefers-reduced-motion: reduce)');
        if (reduce.matches || !('IntersectionObserver' in window)) {
          view.querySelectorAll(REVEALABLE).forEach(el => el.classList.add('is-visible'));
          return;
        }
        const onReveal = (entries, obs) => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
          });
        };
        // Text: needs 15% in view before it fades — reads as intentional.
        const io = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
        textTargets.forEach(el => io.observe(el));
        // Assets: fire as soon as they enter (threshold ~0). A big asset (a 1090px
        // full-bleed, the 1391px phone stage) can never show 15% of itself in this
        // sticky/pinned layout without half-leaving again, so 0.15 would skip it —
        // a low threshold makes the clip-mask unveil reliable as it scrolls in.
        const assetIo = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
        assetTargets.forEach(el => assetIo.observe(el));

        if (gallery) {
          const gio = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                // live query: includes the loop clones created after this script ran
                gallery.querySelectorAll('.cs-ds-tile').forEach(t => t.classList.add('is-visible'));
                obs.disconnect();
              }
            });
          }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
          gio.observe(gallery);
        }

        // Fail-safe for a clip-mask (which defaults to HIDDEN): this page uses a
        // sticky-pinned + smooth-scrolled layout that can make IntersectionObserver
        // miss a large asset — and a missed clip asset would stay invisible forever.
        // A cheap rAF-throttled scroll pass reveals any clip asset that is
        // geometrically in view (getBoundingClientRect is robust to sticky/smooth
        // scroll), so nothing can get stranded. Text stays on the IO above.
        let clipTick = false;
        const clipScrollPass = () => {
          clipTick = false;
          // This view isn't routed in — its clips can't be on screen, and without this
          // bail all four case studies re-query and re-measure their pending clips on
          // every scroll frame of the HOME page. (Their rects read 0 while hidden, so
          // nothing was ever revealed by it either.)
          if (view.hidden) return;
          const pending = view.querySelectorAll('.cs-clip:not(.is-visible)');
          pending.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.9 && r.bottom > 0) el.classList.add('is-visible');
          });
          if (!pending.length) window.removeEventListener('scroll', onClipScroll);
        };
        const onClipScroll = () => {
          if (view.hidden) return;   // don't even schedule a frame for a routed-out view
          if (!clipTick) { clipTick = true; requestAnimationFrame(clipScrollPass); }
        };
        window.addEventListener('scroll', onClipScroll, { passive: true });

        // when the view is routed in (or on a direct #hatcha load), reveal whatever
        // is already on-screen — a pure display:none→shown change may not fire IO.
        // Vertical-only check, so it also catches gallery tiles offset horizontally.
        function revealInView() {
          view.querySelectorAll('.reveal:not(.is-visible), .cs-clip:not(.is-visible)').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.88 && r.bottom > 0) el.classList.add('is-visible');
          });
        }
        window.addEventListener('hashchange', () => {
          if (route.token() === '#hatcha') requestAnimationFrame(revealInView);
        });
        if (route.token() === '#hatcha') requestAnimationFrame(revealInView);
      })();

      // ── Fireflut case study: same two-tier reveal (text .reveal / asset .cs-clip) ──
      (function () {
        const view = document.getElementById('fireflut-view');
        if (!view) return;
        const textTargets = [...view.querySelectorAll(
          '.cs-hero-h, .cs-hero-intro, .cs-meta > div, .cs-rail, .cs-sec-h, .cs-p,' +
          '.cs-ff-role, .cs-ff-eye, .cs-cmp, .cs-ff-prin > div, .cs-ff-swatch > div,' +
          '.cs-ff-micro, .cs-ff-cap, .cs-quote p, .cs-stat,' +
          '.cs-closing-h, .cs-closing-p, .rn-kicker, .rn-title, .rn-desc'
        )];
        // placeholder blocks + the before/after shots are the assets; the hero
        // mockup carries neither class, so it is excluded and its clip never
        // fights the tile→hero view-transition.
        const assetTargets = [...view.querySelectorAll('.cs-ph, .cs-ff-shot')];
        textTargets.forEach(el => el.classList.add('reveal'));
        const clip = el => {
          el.classList.add('cs-clip');
          el.style.setProperty('--clip-round', getComputedStyle(el).borderTopLeftRadius || '0px');
        };
        assetTargets.forEach(clip);
        const targets = [...textTargets, ...assetTargets];
        if (!targets.length) return;

        ['.cs-meta', '.cs-ff-prin', '.cs-ff-swatch', '.cs-stats', '.cs-ff-shots', '.cs-ff-duo', '.cs-ff-trio', '.cs-ff-quad'].forEach(sel => {
          view.querySelectorAll(sel + ' > *').forEach((el, i) => {
            el.style.setProperty('--reveal-delay', (i * 0.08).toFixed(2) + 's');
          });
        });

        const REVEALABLE = '.reveal, .cs-clip';
        const reduce = matchMedia('(prefers-reduced-motion: reduce)');
        if (reduce.matches || !('IntersectionObserver' in window)) {
          view.querySelectorAll(REVEALABLE).forEach(el => el.classList.add('is-visible'));
          return;
        }
        const onReveal = (entries, obs) => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
          });
        };
        const io = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
        textTargets.forEach(el => io.observe(el));
        const assetIo = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
        assetTargets.forEach(el => assetIo.observe(el));

        // fail-safe for clip assets (default HIDDEN) — reveal anything geometrically in view
        let clipTick = false;
        const clipScrollPass = () => {
          clipTick = false;
          // This view isn't routed in — its clips can't be on screen, and without this
          // bail all four case studies re-query and re-measure their pending clips on
          // every scroll frame of the HOME page. (Their rects read 0 while hidden, so
          // nothing was ever revealed by it either.)
          if (view.hidden) return;
          const pending = view.querySelectorAll('.cs-clip:not(.is-visible)');
          pending.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.9 && r.bottom > 0) el.classList.add('is-visible');
          });
          if (!pending.length) window.removeEventListener('scroll', onClipScroll);
        };
        const onClipScroll = () => {
          if (view.hidden) return;   // don't even schedule a frame for a routed-out view
          if (!clipTick) { clipTick = true; requestAnimationFrame(clipScrollPass); }
        };
        window.addEventListener('scroll', onClipScroll, { passive: true });

        // the view is display:none until routed in — reveal on-screen items on route/open
        function revealInView() {
          view.querySelectorAll('.reveal:not(.is-visible), .cs-clip:not(.is-visible)').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.88 && r.bottom > 0) el.classList.add('is-visible');
          });
        }
        window.addEventListener('hashchange', () => {
          if (route.token() === '#fireflut') requestAnimationFrame(revealInView);
        });
        if (route.token() === '#fireflut') requestAnimationFrame(revealInView);
      })();

      /* ── READ NEXT · 8s auto-advance ──────────────────────────────────────
         One driver for all four panels. It keys off actual visibility rather
         than deck internals, so the same code covers the desktop cover-slide
         deck, the html.cs-static mobile scroll and the reduced-motion path
         (where the deck bails and the page is a plain document).

         In the deck each section is inset:0 and translated on X, so its
         intersection ratio only reaches ~1 once the panel has swept fully
         into rest — exactly the moment the countdown should start.

         The bar is stamped from a rAF loop rather than a CSS transition: it
         can be reset mid-flight, and a backgrounded tab throttles rAF so the
         countdown stalls on its own without a visibilitychange handler. */
      (function initReadNextAdvance() {
        const panels = Array.from(document.querySelectorAll('[data-readnext]'));
        if (!panels.length) return;
        const DUR = 8000;

        /* Nothing may auto-advance until the reader has moved the page at least
           once. Two reasons: deep-linking to a case study shouldn't start a
           countdown on a panel nobody has reached, and a deck that lays out while
           its view is still hidden measures 0 and momentarily leaves every section
           untransformed at inset:0 — which reads as a full-frame intersection. */
        let engaged = false;
        const engage = () => { engaged = true; };
        ['wheel', 'keydown', 'touchstart', 'pointerdown', 'scroll']
          .forEach(t => addEventListener(t, engage, { passive: true, once: true }));

        const armed = [];   // panels the observer says are on screen

        panels.forEach(el => {
          const view = el.closest('[id$="-view"]');
          const hash = view ? '#' + view.id.replace(/-view$/, '') : null;
          const fill = el.querySelector('.rn-bar-fill');
          const vids = Array.from(el.querySelectorAll('video'));
          const p = { el, fill, vids, raf: 0, t0: 0, on: false, lastCheck: 0, resting: false, sec: null };

          /* Re-checked while armed — but polled at ~15Hz, not per frame: the rect
             read + width test forces style/layout work, and running it on every
             frame of the deck's 1s snap tween was a per-frame reflow. A ≤66ms
             start/cancel delay is invisible on an 8s countdown. The panel must
             really be visible and really filling the frame: in the deck a section
             grows from scale 0.5 as it sweeps in, so the width test keeps the
             clock from starting until it has come to rest at full size. */
          p.atRest = () => {
            if (!engaged || !view || view.hidden || route.token() !== hash) return false;
            // the deck engine toggles inline visibility on the panel — read that
            // instead of getComputedStyle (no style recalc). Resolved LAZILY and
            // re-tried while null: the deck enhancer adds .cs-slide-sec AFTER this
            // IIFE runs, so a parse-time closest() finds nothing and the guard
            // silently disappears — deck panels are inset:0 (always full-frame
            // rects), and without this check the countdown runs from route entry
            // and yanks the reader to the next case study mid-scroll. No deck
            // (mobile, reduced-motion) → stays null → visible, matching before.
            if (!p.sec) p.sec = el.closest('.cs-slide-sec');
            if (p.sec && p.sec.style.visibility === 'hidden') return false;
            const b = el.getBoundingClientRect(), w = innerWidth, h = innerHeight;
            if (b.width < w * 0.9) return false;
            const vis = Math.max(0, Math.min(b.right, w) - Math.max(b.left, 0)) *
                        Math.max(0, Math.min(b.bottom, h) - Math.max(b.top, 0));
            return vis >= w * h * 0.9;
          };

          p.reset = () => {
            p.t0 = 0;
            if (p.fill && p.fill.style.transform !== 'scaleX(0)') p.fill.style.transform = 'scaleX(0)';
          };

          p.cancel = () => {
            p.on = false;
            if (p.raf) { cancelAnimationFrame(p.raf); p.raf = 0; }
            p.reset();
            const i = armed.indexOf(p); if (i > -1) armed.splice(i, 1);
          };

          p.arm = () => {
            if (p.on) return;
            p.on = true;
            if (armed.indexOf(p) === -1) armed.push(p);
            p.t0 = 0;
            p.lastCheck = 0; p.resting = false;   // force an immediate first check
            p.raf = requestAnimationFrame(function step(now) {
              p.raf = 0;
              if (!p.on) return;
              // hold at zero until the panel has actually settled (15Hz poll)
              if (now - p.lastCheck >= 66) { p.lastCheck = now; p.resting = p.atRest(); }
              if (!p.resting) { p.reset(); p.raf = requestAnimationFrame(step); return; }
              if (!p.t0) p.t0 = now;
              const k = Math.min(1, (now - p.t0) / DUR);
              if (p.fill) p.fill.style.transform = 'scaleX(' + k.toFixed(4) + ')';
              if (k < 1) { p.raf = requestAnimationFrame(step); return; }
              p.cancel();
              // hand off through the hero transition so the timer running out lands
              // exactly like a click on the asset does (it falls back to a plain
              // hash set when the transition can't run)
              if (window.rtHero) window.rtHero.open(el.dataset.next, el.querySelector('.rn-asset'));
              else route.go(el.dataset.next);
            });
          };

          new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.98) {
                p.vids.forEach(v => v.play().catch(() => {}));
                p.arm();
              } else {
                p.vids.forEach(v => { if (!v.paused) v.pause(); });
                p.cancel();
              }
            });
          }, { threshold: [0, 0.98, 1] }).observe(el);

          // a click is the reader taking over — don't race them to the same place
          el.addEventListener('click', p.cancel);
        });

        /* The IO ratio won't drop until the deck's 1000ms snap tween is well
           underway, so back-gestures cancel immediately instead of waiting. */
        const cancelAll = () => { for (let i = armed.length - 1; i >= 0; i--) armed[i].cancel(); };
        addEventListener('wheel', (e) => { if (armed.length && e.deltaY < 0) cancelAll(); }, { passive: true });
        addEventListener('keydown', (e) => {
          if (armed.length && /^(ArrowUp|PageUp|Home)$/.test(e.key)) cancelAll();
        });
        let tY = null;
        addEventListener('touchstart', (e) => { tY = e.touches[0].clientY; }, { passive: true });
        addEventListener('touchend', (e) => {
          if (armed.length && tY !== null && e.changedTouches[0].clientY - tY > 24) cancelAll();
          tY = null;
        }, { passive: true });
        addEventListener('hashchange', cancelAll);
      })();

      // ── Fireflut · section cover-slide (pinned choreography, scoped) ──
      (function () {
        const view = document.getElementById('fireflut-view');
        if (!view) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (document.documentElement.classList.contains('cs-static')) return;
        const page = view.querySelector('.cs-page');
        if (!page) return;
        const sections = [...page.children].filter(el => el.classList.contains('cs-band'));
        if (sections.length < 2) return;

        const scroller = document.createElement('div');
        scroller.className = 'cs-slide-scroller';
        const stage = document.createElement('div');
        stage.className = 'cs-slide-stage';
        scroller.appendChild(stage);
        page.insertBefore(scroller, sections[0]);

        const secs = sections.map((sec, i) => {
          const inner = document.createElement('div');
          inner.className = 'cs-slide-inner';
          while (sec.firstChild) inner.appendChild(sec.firstChild);
          sec.appendChild(inner);
          sec.classList.add('cs-slide-sec');
          if (i > 0) sec.classList.add('cv');              // hero (base) has no slide-in
          sec.style.zIndex = String(i + 1);
          stage.appendChild(sec);
          return { el: sec, inner, videos: [...sec.querySelectorAll('video')], live: true, tx: -1, ty: -1 };
        });

        // the slide + read motion replaces the per-element reveal, so show all up front
        view.querySelectorAll('.reveal, .cs-clip').forEach(el => el.classList.add('is-visible'));

        const n = secs.length;
        const ease = t => 1 - Math.pow(1 - t, 3);
        const SL_FACTOR = 0.6;                 // sweep distance in viewports (~one gesture)
        const DW_FACTOR = 0.5;                 // dwell before the next section sweeps in
        const ENTER_SCALE = 0.5;               // incoming panel grows from 50% → 100% as it comes to rest (no tilt)
        let marks = [], V = 0;
        // ── snap-deck state: one wheel/key/swipe gesture advances exactly one panel ──
        let stops = [], curStop = 0, deckAnimating = false, deckRaf = 0, deckCooldown = false, wheelIdleTimer = 0, wheelMaxTimer = 0, tStartY = null;
        // stops is NOT 1:1 with panels (a taller-than-viewport panel adds a second stop),
        // so the pager needs panel index -> stop index to land a jump on the right panel
        const stopOfSec = [];

        function layout() {
          V = window.innerHeight;
          if (!V || view.hidden) return;
          const SL = Math.round(V * SL_FACTOR);
          const DW = Math.round(V * DW_FACTOR);
          let t = 0; marks = [];
          secs.forEach((s, i) => {
            const readH = Math.max(0, s.inner.scrollHeight - V);
            const readStart = t; t += readH; const readEnd = t;
            let slideStart = null, slideEnd = null;
            if (i < n - 1) {
              t += DW;
              slideStart = t; t += SL;
              slideEnd = t;
            }
            marks.push({ readStart, readEnd, readH, slideStart, slideEnd });
          });
          scroller.style.height = (t + V) + 'px';
          // deck stops: each panel's flat rest, PLUS an extra stop after any vertical read-scroll
          // region (e.g. the hero image reveal). So the first gesture scrolls the hero vertically
          // to its end, and only the NEXT gesture slides the following panel in horizontally —
          // the two motions no longer collide in one scroll.
          stops = [];
          secs.forEach((sec, i) => {
            stopOfSec[i] = stops.length;
            stops.push(i === 0 ? 0 : marks[i - 1].slideEnd);        // section fully arrived (top of its content)
            if (marks[i].readH > 0) stops.push(marks[i].readEnd);   // extra stop after reading a taller-than-viewport section
          });
          readTarget(); renderS = targetS; render(renderS);
        }

        // ── section pager ──
        // Which panel "owns" a scroll offset, and how far through it we are. The flip
        // happens at the MIDPOINT of the sweep, so the tick changes exactly when the
        // incoming panel visually takes over — not when it starts moving or lands.
        const midOf = i => i === 0 ? 0 : (marks[i - 1].slideStart + marks[i - 1].slideEnd) / 2;
        function activeAt(s) {
          let i = 0;
          for (let k = 1; k < n; k++) { if (s >= midOf(k)) i = k; else break; }
          return i;
        }
        const pager = csPager({ view, sections, goTo: i => goToStop(stopOfSec[i] || 0) });
        // render is a hoisted declaration, so this rebinding is live for every caller —
        // it keeps the pager in step without threading a call through the render body
        const drawPanels = render;
        render = function (s) {
          drawPanels(s);
          if (marks.length) pager.sync(activeAt(s));
        };

        let targetS = 0, renderS = 0, raf = 0;
        function readTarget() { targetS = Math.max(0, -scroller.getBoundingClientRect().top); }
        function frame() {
          // scroller rect is read HERE, at rAF time — reading it in the raw scroll
          // event fired several times a frame and forced synchronous layout each time
          readTarget();
          const diff = targetS - renderS;
          if (Math.abs(diff) < 0.4) { renderS = targetS; raf = 0; render(renderS); return; }
          renderS += diff * 0.22;
          render(renderS);
          raf = requestAnimationFrame(frame);
        }

        function render(s) {
          if (!marks.length) return;
          secs.forEach((sec, i) => {
            const m = marks[i];
            const liveStart = i === 0 ? -Infinity : marks[i - 1].slideStart - V;
            const liveEnd = i === n - 1 ? Infinity : m.slideEnd + V * 0.5;
            const live = s >= liveStart && s <= liveEnd;
            if (live !== sec.live) {
              sec.live = live;
              sec.el.style.visibility = live ? 'visible' : 'hidden';
              // promote only live panels — a static will-change on every panel held
              // ~2 full-viewport GPU layers per section for the whole session
              sec.el.style.willChange = live ? 'transform' : '';
              sec.inner.style.willChange = live ? 'transform' : '';
              if (live) sec.videos.forEach(v => v.play().catch(() => {}));
            }
            if (!live) {
              sec.videos.forEach(v => { if (!v.paused) v.pause(); });
              return;
            }
            const ty = s <= m.readStart ? 0 : s >= m.readEnd ? m.readH : (s - m.readStart);
            let tx = 0;
            if (i > 0) {
              const pm = marks[i - 1];
              if (s <= pm.slideStart) tx = 100;
              else if (s >= pm.slideEnd) tx = 0;
              else tx = (1 - ease((s - pm.slideStart) / (pm.slideEnd - pm.slideStart))) * 100;
            }
            if (tx !== sec.tx) {
              const p = tx / 100;                       // 1 = entering (off right), 0 = landed
              // grow-to-rest: incoming panel scales from ENTER_SCALE (50%) up to 100% as it lands,
              // coupled to the sweep so it reaches full size exactly when it comes to rest. No tilt.
              const sc = (1 - p * (1 - ENTER_SCALE)).toFixed(4);
              sec.el.style.transform = 'translate3d(' + tx + '%,0,0) scale(' + sc + ')';
              sec.tx = tx;
            }
            if (ty !== sec.ty) { sec.inner.style.transform = 'translate3d(0,' + (-ty) + 'px,0)'; sec.ty = ty; }
          });
        }

        // view.hidden: the four case-study decks all listen on window, so without this
        // each one measured its scroller on every scroll frame of every other page.
        const onScroll = () => { if (deckAnimating || view.hidden) return; if (!raf) raf = requestAnimationFrame(frame); };
        window.addEventListener('scroll', onScroll, { passive: true });

        // ── snap deck: each gesture tweens render() to the next panel's rest offset over a fixed
        // duration (the rolodex flip plays during the tween), keeping native scroll in sync
        // (instant, to dodge the site's CSS smooth-scroll). Free scrollbar drag still works. ──
        function scrollerTop() { return scroller.getBoundingClientRect().top + window.scrollY; }
        function nearestStop(v) { let b = 0, bd = Infinity; for (let i = 0; i < stops.length; i++) { const d = Math.abs(stops[i] - v); if (d < bd) { bd = d; b = i; } } return b; }
        function goToStop(i) {
          if (!stops.length) return;
          i = Math.max(0, Math.min(stops.length - 1, i));
          curStop = i;
          const O = scrollerTop(), startY = window.scrollY, endY = O + stops[i], t0 = performance.now(), DUR = 1000;
          deckAnimating = true;
          if (raf) { cancelAnimationFrame(raf); raf = 0; }
          if (deckRaf) cancelAnimationFrame(deckRaf);
          (function step(now) {
            const k = Math.min(1, (now - t0) / DUR);
            const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // easeInOutCubic — smooth start + settle
            const y = startY + (endY - startY) * e;
            window.scrollTo({ top: y, behavior: 'instant' });
            renderS = Math.max(0, y - O); render(renderS);
            if (k < 1) deckRaf = requestAnimationFrame(step);
            else { renderS = Math.max(0, endY - O); targetS = renderS; render(renderS); deckAnimating = false; }
          })(performance.now());
          // watchdog: if rAF stalls (throttled/background tab), force-finish so the deck never locks
          setTimeout(() => { if (deckAnimating && curStop === i) { renderS = Math.max(0, endY - O); targetS = renderS; window.scrollTo({ top: endY, behavior: 'instant' }); render(renderS); deckAnimating = false; } }, DUR + 300);
        }
        const deckActive = () => !view.hidden && route.token() === '#fireflut' && stops.length > 1;
        const inModal = (el) => el && el.closest && el.closest('.contact-drawer, .contact-scrim, .pgf-lightbox');
        function deckStep(dir) { if (!deckAnimating) goToStop(nearestStop(renderS) + dir); }
        window.addEventListener('wheel', (e) => {
          if (!deckActive() || e.ctrlKey || inModal(e.target)) return;
          e.preventDefault();
          if (Math.abs(e.deltaY) < 4) return;                 // drop the tiny trackpad-inertia tail
          // Idle unlock: fast release once events stop (discrete mouse notches / distinct swipes).
          clearTimeout(wheelIdleTimer);
          wheelIdleTimer = setTimeout(() => { deckCooldown = false; clearTimeout(wheelMaxTimer); }, 160);
          if (deckCooldown || deckAnimating) return;
          deckCooldown = true;
          // Hard max unlock (set once, NOT reset by events): a trackpad's near-continuous stream
          // would keep resetting the idle timer forever and lock the deck — this guarantees release.
          clearTimeout(wheelMaxTimer);
          wheelMaxTimer = setTimeout(() => { deckCooldown = false; }, 1400);
          deckStep(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
        window.addEventListener('keydown', (e) => {
          if (!deckActive()) return;
          const tag = (document.activeElement && document.activeElement.tagName) || '';
          if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)) return;
          let d = 0;
          if (e.key === 'ArrowDown' || e.key === 'PageDown') d = 1;
          else if (e.key === 'ArrowUp' || e.key === 'PageUp') d = -1;
          else if (e.key === 'Home') { e.preventDefault(); goToStop(0); return; }
          else if (e.key === 'End') { e.preventDefault(); goToStop(stops.length - 1); return; }
          if (!d) return;
          e.preventDefault(); deckStep(d);
        });
        window.addEventListener('touchstart', (e) => { tStartY = (deckActive() && !inModal(e.target)) ? e.touches[0].clientY : null; }, { passive: true });
        window.addEventListener('touchmove', (e) => { if (deckActive() && tStartY !== null) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', (e) => {
          if (!deckActive() || tStartY === null) return;
          const dy = tStartY - e.changedTouches[0].clientY; tStartY = null;
          if (Math.abs(dy) >= 36) deckStep(dy > 0 ? 1 : -1);
        }, { passive: true });

        let rzT = 0; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(layout, 120); });
        window.addEventListener('load', layout);
        new MutationObserver(() => { if (!view.hidden) { curStop = 0; requestAnimationFrame(layout); } })
          .observe(view, { attributes: true, attributeFilter: ['hidden'] });
        view.querySelectorAll('img, video').forEach(m => {
          m.addEventListener('load', layout);
          m.addEventListener('loadedmetadata', layout);
        });
        if (route.token() === '#fireflut') requestAnimationFrame(layout);
        layout();
      })();
      csPagerStatic('fireflut-view');

      // ── Case-study section pager (shared by the four decks) ──────────────────
      // A bottom bar of ticks, one per CHAPTER, that jumps the deck to a chapter and
      // shows "Section 02 | The Problem" on hover. Chapters are derived from the DOM,
      // so no case-study markup changes: a band carrying .cs-ledger-num + .cs-ledger-eye
      // opens a new chapter and every unlabelled band after it (media, quote, device
      // shots) folds into that chapter. The hero, closing and read-next slides get
      // their own unnumbered chapters.
      //
      // Overrides, for case studies the derivation gets wrong:
      //   data-pager="Label"  force a chapter break here with this label
      //   data-pager-skip     never break here; fold into the chapter above
      //   opts.renumber       ignore the DOM numbers, number chapters 01..N in order
      //                       (Jumpable's ledger skips 03/04)
      //
      // opts: { view, sections, goTo(panelIndex), renumber? }  →  { sync(panel, frac) }
      // goTo is the deck's own jump primitive, so the pager adds no scroll code of its
      // own; the reduced-motion / no-deck path passes a scrollIntoView-based goTo.
      function csPager(opts) {
        const view = opts.view, sections = opts.sections;
        if (!view || !sections || sections.length < 2) return { sync: function () {} };
        // html.cs-static is the site's one mobile decision, taken at load with a
        // clientWidth/screen.width fallback because innerWidth can read 0 before first
        // layout — re-deriving the width here would reintroduce exactly that bug.
        if (document.documentElement.classList.contains('cs-static')) return { sync: function () {} };
        if (!matchMedia('(hover: hover)').matches) return { sync: function () {} };

        // ── derive chapters ──
        const chapters = [];
        sections.forEach(function (sec, i) {
          const forced = sec.dataset ? sec.dataset.pager : null;
          const numEl = sec.querySelector('.cs-ledger-num');
          const eyeEl = sec.querySelector('.cs-ledger-eye');
          const skip = sec.dataset && sec.dataset.pagerSkip !== undefined;
          let label = null, num = null;
          if (!skip) {
            if (forced) label = forced;
            else if (numEl && eyeEl) { num = numEl.textContent.trim(); label = eyeEl.textContent.trim(); }
            else if (sec.classList.contains('cs-hero')) label = 'Overview';
            // .cs-cta is Existence's closing slide ("Reach out to know more") — same
            // structural beat as .cs-closing elsewhere, just a different class, so it
            // gets its own chapter rather than folding into the outcome above it
            else if (sec.classList.contains('cs-closing') || sec.classList.contains('cs-cta')) label = 'Closing';
            else if (sec.hasAttribute('data-readnext')) label = 'Read next';
          }
          if (label && (chapters.length || i === 0)) chapters.push({ label: label, num: num, first: i, count: 1 });
          else if (chapters.length) chapters[chapters.length - 1].count++;
          else chapters.push({ label: 'Overview', num: null, first: i, count: 1 });   // no label on the first band
        });
        if (chapters.length < 2) return { sync: function () {} };
        if (opts.renumber) {
          let k = 0;
          chapters.forEach(function (c) { if (c.num !== null) c.num = String(++k).padStart(2, '0'); });
        }

        // panel index → chapter index, resolved once
        const chapterOf = [];
        chapters.forEach(function (c, ci) { for (let p = c.first; p < c.first + c.count; p++) chapterOf[p] = ci; });

        // ── build ──
        const bar = document.createElement('nav');
        bar.className = 'cs-pager';
        bar.setAttribute('aria-label', 'Case study sections');
        const pill = document.createElement('div');
        pill.className = 'cs-pg-pill';
        pill.setAttribute('aria-hidden', 'true');
        pill.innerHTML = '<span class="cs-pg-num"></span><span class="cs-pg-rule"></span><span class="cs-pg-lab"></span>';
        const pillNum = pill.querySelector('.cs-pg-num'), pillLab = pill.querySelector('.cs-pg-lab');
        bar.appendChild(pill);

        const total = sections.length;
        const ticks = chapters.map(function (c, ci) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'cs-pg-t';
          b.setAttribute('aria-label', (c.num ? 'Section ' + c.num + ' — ' : '') + c.label);
          b.innerHTML = '<i class="cs-pg-f"></i>';
          b.addEventListener('click', function () { opts.goTo(c.first); });
          b.addEventListener('pointerenter', function () { showPill(ci); });
          b.addEventListener('focus', function () { showPill(ci); });
          bar.appendChild(b);
          return { el: b, fill: b.querySelector('.cs-pg-f'), f: -1 };
        });
        bar.addEventListener('pointerleave', hidePill);
        bar.addEventListener('focusout', function (e) { if (!bar.contains(e.relatedTarget)) hidePill(); });
        view.appendChild(bar);

        function showPill(ci) {
          const c = chapters[ci];
          pillNum.textContent = c.num ? 'Section ' + c.num : '';
          pillLab.textContent = c.label;
          pill.classList.toggle('bare', !c.num);
          // a pill that's currently hidden is parked at the last tick it showed on, so
          // place it with transitions off — otherwise it glides in from there while
          // fading up. Once visible, the glide between ticks is the point.
          const wasOn = pill.classList.contains('on');
          if (!wasOn) pill.style.transition = 'none';
          // measure AFTER the text is in, so the width is this chapter's, not the last
          // one's. offsetLeft rather than a rect: both it and the pill's left:0 resolve
          // against the bar's padding box, so they stay in the same coordinate space.
          const t = ticks[ci].el, w = pill.offsetWidth;
          const px = t.offsetLeft + t.offsetWidth / 2 - w / 2;
          // the bar is centred and narrow, so clamp against the VIEWPORT rather than the
          // bar — end pills then overhang the row a little instead of jumping inward
          const originX = bar.getBoundingClientRect().left;
          const vw = document.documentElement.clientWidth || window.innerWidth;
          const lo = 16 - originX, hi = vw - 16 - w - originX;
          pill.style.setProperty('--px', Math.max(lo, Math.min(px, hi)).toFixed(1) + 'px');
          if (!wasOn) { void pill.offsetWidth; pill.style.transition = ''; }
          pill.classList.add('on');
        }
        function hidePill() { pill.classList.remove('on'); }

        // Is the panel behind the bar dark? Read from the panel's COMPUTED background,
        // not its .cream/.dark class: some panels (cs-logoband) carry neither, some are
        // transparent and inherit .cs-page's, and reading the computed value means night
        // mode — which repaints every band — is handled with no theme test at all.
        // A panel whose bar strip is full-bleed media rather than a flat colour can't be
        // read this way and declares itself with data-pager-nav, the same escape hatch
        // the nav's own contrast pass uses.
        function isDarkUnder(sec) {
          const forced = sec.dataset && sec.dataset.pagerNav;
          if (forced) return forced === 'dark';
          const lin = function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
          for (let el = sec; el && el !== document.documentElement; el = el.parentElement) {
            const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
            if (!m) continue;
            const q = m[1].split(',').map(parseFloat);
            if (q[3] !== undefined && q[3] < 0.5) continue;          // see-through: keep walking up
            return (0.2126 * lin(q[0]) + 0.7152 * lin(q[1]) + 0.0722 * lin(q[2])) < 0.4;
          }
          return false;
        }

        // ── active state ──
        // panel = the panel now at rest. Writes are change-guarded: sync runs on every
        // deck frame, but only touches the DOM when a value actually moved.
        let lastCh = -1, lastDark = null, lastPanel = 0;
        function sync(panel) {
          const ci = chapterOf[Math.max(0, Math.min(total - 1, panel | 0))];
          if (ci === undefined) return;
          const c = chapters[ci];
          // slides REACHED, not slides completed: on slide 3 of 3 the rectangle is full,
          // rather than sitting at 2/3 and implying there is more of the chapter to come.
          // A one-slide chapter is 1/1, so it fills solid with no special case.
          const within = (panel - c.first + 1) / c.count;
          for (let i = 0; i < ticks.length; i++) {
            const f = i < ci ? 1 : i > ci ? 0 : Math.max(0, Math.min(1, within));
            if (Math.abs(f - ticks[i].f) > 0.004) { ticks[i].fill.style.setProperty('--f', f.toFixed(3)); ticks[i].f = f; }
          }
          if (ci !== lastCh) {
            if (lastCh >= 0) ticks[lastCh].el.removeAttribute('aria-current');
            ticks[ci].el.setAttribute('aria-current', 'true');
            lastCh = ci;
          }
          lastPanel = panel;
          const dark = isDarkUnder(sections[panel]);
          if (dark !== lastDark) {
            bar.classList.toggle('on-dark', dark);
            bar.classList.toggle('on-light', !dark);
            lastDark = dark;
          }
        }
        // the theme toggle doesn't move the deck, so re-run the polarity check on it
        new MutationObserver(function () { lastDark = null; sync(lastPanel); })
          .observe(document.body, { attributes: true, attributeFilter: ['class'] });

        sync(0);
        return { sync: sync };
      }

      // Reduced-motion desktop: the deck bails, so the panels are plain document flow
      // and there'd be no pager at all. Same bar, jumping with scrollIntoView and
      // tracking the active panel with an observer instead of the deck's own offsets.
      function csPagerStatic(viewId) {
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // the deck ran; it owns the pager
        const view = document.getElementById(viewId);
        const page = view && view.querySelector('.cs-page');
        if (!page) return;
        const sections = [...page.children].filter(el => el.classList.contains('cs-band'));
        const pager = csPager({
          view, sections,
          goTo: i => sections[i].scrollIntoView({ behavior: 'auto', block: 'start' })
        });
        const io = new IntersectionObserver(es => {
          es.forEach(e => { if (e.isIntersecting) pager.sync(sections.indexOf(e.target)); });
        }, { threshold: 0.55 });
        sections.forEach(s => io.observe(s));
      }

      // ── Hatcha · section cover-slide (pinned choreography, scoped) ──
      (function () {
        const view = document.getElementById('hatcha-view');
        if (!view) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (document.documentElement.classList.contains('cs-static')) return;
        const page = view.querySelector('.cs-page');
        if (!page) return;
        const sections = [...page.children].filter(el => el.classList.contains('cs-band'));
        if (sections.length < 2) return;

        const scroller = document.createElement('div');
        scroller.className = 'cs-slide-scroller';
        const stage = document.createElement('div');
        stage.className = 'cs-slide-stage';
        scroller.appendChild(stage);
        page.insertBefore(scroller, sections[0]);

        const secs = sections.map((sec, i) => {
          const inner = document.createElement('div');
          inner.className = 'cs-slide-inner';
          while (sec.firstChild) inner.appendChild(sec.firstChild);
          sec.appendChild(inner);
          sec.classList.add('cs-slide-sec');
          if (i > 0) sec.classList.add('cv');              // hero (base) has no slide-in
          sec.style.zIndex = String(i + 1);
          stage.appendChild(sec);
          return { el: sec, inner, videos: [...sec.querySelectorAll('video')], live: true, tx: -1, ty: -1 };
        });

        // the slide + read motion replaces the per-element reveal, so show all up front
        view.querySelectorAll('.reveal, .cs-clip').forEach(el => el.classList.add('is-visible'));

        const n = secs.length;
        const ease = t => 1 - Math.pow(1 - t, 3);
        const SL_FACTOR = 0.6;                 // sweep distance in viewports (~one gesture)
        const DW_FACTOR = 0.5;                 // dwell before the next section sweeps in
        const ENTER_SCALE = 0.5;               // incoming panel grows from 50% → 100% as it comes to rest (no tilt)
        let marks = [], V = 0;
        // ── snap-deck state: one wheel/key/swipe gesture advances exactly one panel ──
        let stops = [], curStop = 0, deckAnimating = false, deckRaf = 0, deckCooldown = false, wheelIdleTimer = 0, wheelMaxTimer = 0, tStartY = null;
        // stops is NOT 1:1 with panels (a taller-than-viewport panel adds a second stop),
        // so the pager needs panel index → stop index to land a jump on the right panel
        const stopOfSec = [];

        function layout() {
          V = window.innerHeight;
          if (!V || view.hidden) return;
          const SL = Math.round(V * SL_FACTOR);
          const DW = Math.round(V * DW_FACTOR);
          let t = 0; marks = [];
          secs.forEach((s, i) => {
            const readH = Math.max(0, s.inner.scrollHeight - V);
            const readStart = t; t += readH; const readEnd = t;
            let slideStart = null, slideEnd = null;
            if (i < n - 1) {
              t += DW;
              slideStart = t; t += SL;
              slideEnd = t;
            }
            marks.push({ readStart, readEnd, readH, slideStart, slideEnd });
          });
          scroller.style.height = (t + V) + 'px';
          // deck stops: each panel's flat rest, PLUS an extra stop after any vertical read-scroll
          // region (e.g. the hero image reveal). So the first gesture scrolls the hero vertically
          // to its end, and only the NEXT gesture slides the following panel in horizontally —
          // the two motions no longer collide in one scroll.
          stops = [];
          secs.forEach((sec, i) => {
            stopOfSec[i] = stops.length;
            stops.push(i === 0 ? 0 : marks[i - 1].slideEnd);        // section fully arrived (top of its content)
            if (marks[i].readH > 0) stops.push(marks[i].readEnd);   // extra stop after reading a taller-than-viewport section
          });
          readTarget(); renderS = targetS; render(renderS);
        }

        // ── section pager ──
        // Which panel "owns" a scroll offset, and how far through it we are. The flip
        // happens at the MIDPOINT of the sweep, so the tick changes exactly when the
        // incoming panel visually takes over — not when it starts moving or lands.
        const midOf = i => i === 0 ? 0 : (marks[i - 1].slideStart + marks[i - 1].slideEnd) / 2;
        function activeAt(s) {
          let i = 0;
          for (let k = 1; k < n; k++) { if (s >= midOf(k)) i = k; else break; }
          return i;
        }
        const pager = csPager({ view, sections, goTo: i => goToStop(stopOfSec[i] || 0) });
        // render is a hoisted declaration, so this rebinding is live for every caller —
        // it keeps the pager in step without threading a call through the render body
        const drawPanels = render;
        render = function (s) {
          drawPanels(s);
          if (marks.length) pager.sync(activeAt(s));
        };

        let targetS = 0, renderS = 0, raf = 0;
        function readTarget() { targetS = Math.max(0, -scroller.getBoundingClientRect().top); }
        function frame() {
          // scroller rect is read HERE, at rAF time — reading it in the raw scroll
          // event fired several times a frame and forced synchronous layout each time
          readTarget();
          const diff = targetS - renderS;
          if (Math.abs(diff) < 0.4) { renderS = targetS; raf = 0; render(renderS); return; }
          renderS += diff * 0.22;
          render(renderS);
          raf = requestAnimationFrame(frame);
        }

        function render(s) {
          if (!marks.length) return;
          secs.forEach((sec, i) => {
            const m = marks[i];
            const liveStart = i === 0 ? -Infinity : marks[i - 1].slideStart - V;
            const liveEnd = i === n - 1 ? Infinity : m.slideEnd + V * 0.5;
            const live = s >= liveStart && s <= liveEnd;
            if (live !== sec.live) {
              sec.live = live;
              sec.el.style.visibility = live ? 'visible' : 'hidden';
              // promote only live panels — a static will-change on every panel held
              // ~2 full-viewport GPU layers per section for the whole session
              sec.el.style.willChange = live ? 'transform' : '';
              sec.inner.style.willChange = live ? 'transform' : '';
              if (live) sec.videos.forEach(v => v.play().catch(() => {}));
            }
            if (!live) {
              sec.videos.forEach(v => { if (!v.paused) v.pause(); });
              return;
            }
            const ty = s <= m.readStart ? 0 : s >= m.readEnd ? m.readH : (s - m.readStart);
            let tx = 0;
            if (i > 0) {
              const pm = marks[i - 1];
              if (s <= pm.slideStart) tx = 100;
              else if (s >= pm.slideEnd) tx = 0;
              else tx = (1 - ease((s - pm.slideStart) / (pm.slideEnd - pm.slideStart))) * 100;
            }
            if (tx !== sec.tx) {
              const p = tx / 100;                       // 1 = entering (off right), 0 = landed
              // grow-to-rest: incoming panel scales from ENTER_SCALE (50%) up to 100% as it lands,
              // coupled to the sweep so it reaches full size exactly when it comes to rest. No tilt.
              const sc = (1 - p * (1 - ENTER_SCALE)).toFixed(4);
              sec.el.style.transform = 'translate3d(' + tx + '%,0,0) scale(' + sc + ')';
              sec.tx = tx;
            }
            if (ty !== sec.ty) { sec.inner.style.transform = 'translate3d(0,' + (-ty) + 'px,0)'; sec.ty = ty; }
          });
        }

        // view.hidden: the four case-study decks all listen on window, so without this
        // each one measured its scroller on every scroll frame of every other page.
        const onScroll = () => { if (deckAnimating || view.hidden) return; if (!raf) raf = requestAnimationFrame(frame); };
        window.addEventListener('scroll', onScroll, { passive: true });

        // ── snap deck: each gesture tweens render() to the next panel's rest offset over a fixed
        // duration (the rolodex flip plays during the tween), keeping native scroll in sync
        // (instant, to dodge the site's CSS smooth-scroll). Free scrollbar drag still works. ──
        function scrollerTop() { return scroller.getBoundingClientRect().top + window.scrollY; }
        function nearestStop(v) { let b = 0, bd = Infinity; for (let i = 0; i < stops.length; i++) { const d = Math.abs(stops[i] - v); if (d < bd) { bd = d; b = i; } } return b; }
        function goToStop(i) {
          if (!stops.length) return;
          i = Math.max(0, Math.min(stops.length - 1, i));
          curStop = i;
          const O = scrollerTop(), startY = window.scrollY, endY = O + stops[i], t0 = performance.now(), DUR = 1000;
          deckAnimating = true;
          if (raf) { cancelAnimationFrame(raf); raf = 0; }
          if (deckRaf) cancelAnimationFrame(deckRaf);
          (function step(now) {
            const k = Math.min(1, (now - t0) / DUR);
            const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // easeInOutCubic — smooth start + settle
            const y = startY + (endY - startY) * e;
            window.scrollTo({ top: y, behavior: 'instant' });
            renderS = Math.max(0, y - O); render(renderS);
            if (k < 1) deckRaf = requestAnimationFrame(step);
            else { renderS = Math.max(0, endY - O); targetS = renderS; render(renderS); deckAnimating = false; }
          })(performance.now());
          // watchdog: if rAF stalls (throttled/background tab), force-finish so the deck never locks
          setTimeout(() => { if (deckAnimating && curStop === i) { renderS = Math.max(0, endY - O); targetS = renderS; window.scrollTo({ top: endY, behavior: 'instant' }); render(renderS); deckAnimating = false; } }, DUR + 300);
        }
        const deckActive = () => !view.hidden && route.token() === '#hatcha' && stops.length > 1;
        const inModal = (el) => el && el.closest && el.closest('.contact-drawer, .contact-scrim, .pgf-lightbox');
        function deckStep(dir) { if (!deckAnimating) goToStop(nearestStop(renderS) + dir); }
        window.addEventListener('wheel', (e) => {
          if (!deckActive() || e.ctrlKey || inModal(e.target)) return;
          e.preventDefault();
          if (Math.abs(e.deltaY) < 4) return;                 // drop the tiny trackpad-inertia tail
          // Idle unlock: fast release once events stop (discrete mouse notches / distinct swipes).
          clearTimeout(wheelIdleTimer);
          wheelIdleTimer = setTimeout(() => { deckCooldown = false; clearTimeout(wheelMaxTimer); }, 160);
          if (deckCooldown || deckAnimating) return;
          deckCooldown = true;
          // Hard max unlock (set once, NOT reset by events): a trackpad's near-continuous stream
          // would keep resetting the idle timer forever and lock the deck — this guarantees release.
          clearTimeout(wheelMaxTimer);
          wheelMaxTimer = setTimeout(() => { deckCooldown = false; }, 1400);
          deckStep(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
        window.addEventListener('keydown', (e) => {
          if (!deckActive()) return;
          const tag = (document.activeElement && document.activeElement.tagName) || '';
          if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)) return;
          let d = 0;
          if (e.key === 'ArrowDown' || e.key === 'PageDown') d = 1;
          else if (e.key === 'ArrowUp' || e.key === 'PageUp') d = -1;
          else if (e.key === 'Home') { e.preventDefault(); goToStop(0); return; }
          else if (e.key === 'End') { e.preventDefault(); goToStop(stops.length - 1); return; }
          if (!d) return;
          e.preventDefault(); deckStep(d);
        });
        window.addEventListener('touchstart', (e) => { tStartY = (deckActive() && !inModal(e.target)) ? e.touches[0].clientY : null; }, { passive: true });
        window.addEventListener('touchmove', (e) => { if (deckActive() && tStartY !== null) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', (e) => {
          if (!deckActive() || tStartY === null) return;
          const dy = tStartY - e.changedTouches[0].clientY; tStartY = null;
          if (Math.abs(dy) >= 36) deckStep(dy > 0 ? 1 : -1);
        }, { passive: true });

        let rzT = 0; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(layout, 120); });
        window.addEventListener('load', layout);
        new MutationObserver(() => { if (!view.hidden) { curStop = 0; requestAnimationFrame(layout); } })
          .observe(view, { attributes: true, attributeFilter: ['hidden'] });
        view.querySelectorAll('img, video').forEach(m => {
          m.addEventListener('load', layout);
          m.addEventListener('loadedmetadata', layout);
        });
        if (route.token() === '#hatcha') requestAnimationFrame(layout);
        layout();
      })();
      csPagerStatic('hatcha-view');

      // ── Existence case study: same two-tier reveal (text .reveal / asset .cs-clip) ──
      (function () {
        const view = document.getElementById('existence-view');
        if (!view) return;
        const textTargets = [...view.querySelectorAll(
          '.cs-hero-h, .cs-hero-intro, .cs-meta > div, .cs-ledger-num, .cs-ledger-eye,' +
          '.cs-ledger-h, .cs-ledger-p, .cs-ledger-label, .cs-ledger-row, .cs-ledger-note,' +
          '.cs-quote p, .cs-closing-h, .cs-closing-p, .rn-kicker, .rn-title, .rn-desc'
        )];
        // the hero mock uses .cs-ex-heroph (not .cs-ph) so its clip never fights the tile→hero morph
        const assetTargets = [...view.querySelectorAll('.cs-ph')];
        textTargets.forEach(el => el.classList.add('reveal'));
        const clip = el => {
          el.classList.add('cs-clip');
          el.style.setProperty('--clip-round', getComputedStyle(el).borderTopLeftRadius || '0px');
        };
        assetTargets.forEach(clip);
        const targets = [...textTargets, ...assetTargets];
        if (!targets.length) return;

        ['.cs-meta', '.cs-ledger-rows', '.cs-ex-shots'].forEach(sel => {
          view.querySelectorAll(sel + ' > *').forEach((el, i) => {
            el.style.setProperty('--reveal-delay', (i * 0.06).toFixed(2) + 's');
          });
        });

        const REVEALABLE = '.reveal, .cs-clip';
        const reduce = matchMedia('(prefers-reduced-motion: reduce)');
        if (reduce.matches || !('IntersectionObserver' in window)) {
          view.querySelectorAll(REVEALABLE).forEach(el => el.classList.add('is-visible'));
          return;
        }
        const onReveal = (entries, obs) => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
          });
        };
        const io = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
        textTargets.forEach(el => io.observe(el));
        const assetIo = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
        assetTargets.forEach(el => assetIo.observe(el));

        // fail-safe for clip assets (default HIDDEN) — reveal anything geometrically in view
        let clipTick = false;
        const clipScrollPass = () => {
          clipTick = false;
          // This view isn't routed in — its clips can't be on screen, and without this
          // bail all four case studies re-query and re-measure their pending clips on
          // every scroll frame of the HOME page. (Their rects read 0 while hidden, so
          // nothing was ever revealed by it either.)
          if (view.hidden) return;
          const pending = view.querySelectorAll('.cs-clip:not(.is-visible)');
          pending.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.9 && r.bottom > 0) el.classList.add('is-visible');
          });
          if (!pending.length) window.removeEventListener('scroll', onClipScroll);
        };
        const onClipScroll = () => {
          if (view.hidden) return;   // don't even schedule a frame for a routed-out view
          if (!clipTick) { clipTick = true; requestAnimationFrame(clipScrollPass); }
        };
        window.addEventListener('scroll', onClipScroll, { passive: true });

        // the view is display:none until routed in — reveal on-screen items on route/open
        function revealInView() {
          view.querySelectorAll('.reveal:not(.is-visible), .cs-clip:not(.is-visible)').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.88 && r.bottom > 0) el.classList.add('is-visible');
          });
        }
        window.addEventListener('hashchange', () => {
          if (route.token() === '#existence') requestAnimationFrame(revealInView);
        });
        if (route.token() === '#existence') requestAnimationFrame(revealInView);
      })();

      // ── Existence · section cover-slide (pinned choreography, scoped) ──
      (function () {
        const view = document.getElementById('existence-view');
        if (!view) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (document.documentElement.classList.contains('cs-static')) return;
        const page = view.querySelector('.cs-page');
        if (!page) return;
        const sections = [...page.children].filter(el => el.classList.contains('cs-band'));
        if (sections.length < 2) return;

        const scroller = document.createElement('div');
        scroller.className = 'cs-slide-scroller';
        const stage = document.createElement('div');
        stage.className = 'cs-slide-stage';
        scroller.appendChild(stage);
        page.insertBefore(scroller, sections[0]);

        const secs = sections.map((sec, i) => {
          const inner = document.createElement('div');
          inner.className = 'cs-slide-inner';
          while (sec.firstChild) inner.appendChild(sec.firstChild);
          sec.appendChild(inner);
          sec.classList.add('cs-slide-sec');
          if (i > 0) sec.classList.add('cv');              // hero (base) has no slide-in
          sec.style.zIndex = String(i + 1);
          stage.appendChild(sec);
          return { el: sec, inner, videos: [...sec.querySelectorAll('video')], live: true, tx: -1, ty: -1 };
        });

        // the slide + read motion replaces the per-element reveal, so show all up front
        view.querySelectorAll('.reveal, .cs-clip').forEach(el => el.classList.add('is-visible'));

        const n = secs.length;
        const ease = t => 1 - Math.pow(1 - t, 3);
        const SL_FACTOR = 0.6;                 // sweep distance in viewports (~one gesture)
        const DW_FACTOR = 0.5;                 // dwell before the next section sweeps in
        const ENTER_SCALE = 0.5;               // incoming panel grows from 50% → 100% as it comes to rest (no tilt)
        let marks = [], V = 0;
        // ── snap-deck state: one wheel/key/swipe gesture advances exactly one panel ──
        let stops = [], curStop = 0, deckAnimating = false, deckRaf = 0, deckCooldown = false, wheelIdleTimer = 0, wheelMaxTimer = 0, tStartY = null;
        // stops is NOT 1:1 with panels (a taller-than-viewport panel adds a second stop),
        // so the pager needs panel index -> stop index to land a jump on the right panel
        const stopOfSec = [];

        function layout() {
          V = window.innerHeight;
          if (!V || view.hidden) return;
          const SL = Math.round(V * SL_FACTOR);
          const DW = Math.round(V * DW_FACTOR);
          let t = 0; marks = [];
          secs.forEach((s, i) => {
            const readH = Math.max(0, s.inner.scrollHeight - V);
            const readStart = t; t += readH; const readEnd = t;
            let slideStart = null, slideEnd = null;
            if (i < n - 1) {
              t += DW;
              slideStart = t; t += SL;
              slideEnd = t;
            }
            marks.push({ readStart, readEnd, readH, slideStart, slideEnd });
          });
          scroller.style.height = (t + V) + 'px';
          // deck stops: each panel's flat rest, PLUS an extra stop after any vertical read-scroll
          // region (e.g. the hero image reveal). So the first gesture scrolls the hero vertically
          // to its end, and only the NEXT gesture slides the following panel in horizontally —
          // the two motions no longer collide in one scroll.
          stops = [];
          secs.forEach((sec, i) => {
            stopOfSec[i] = stops.length;
            stops.push(i === 0 ? 0 : marks[i - 1].slideEnd);        // section fully arrived (top of its content)
            if (marks[i].readH > 0) stops.push(marks[i].readEnd);   // extra stop after reading a taller-than-viewport section
          });
          readTarget(); renderS = targetS; render(renderS);
        }

        // ── section pager ──
        // Which panel "owns" a scroll offset, and how far through it we are. The flip
        // happens at the MIDPOINT of the sweep, so the tick changes exactly when the
        // incoming panel visually takes over — not when it starts moving or lands.
        const midOf = i => i === 0 ? 0 : (marks[i - 1].slideStart + marks[i - 1].slideEnd) / 2;
        function activeAt(s) {
          let i = 0;
          for (let k = 1; k < n; k++) { if (s >= midOf(k)) i = k; else break; }
          return i;
        }
        const pager = csPager({ view, sections, goTo: i => goToStop(stopOfSec[i] || 0) });
        // render is a hoisted declaration, so this rebinding is live for every caller —
        // it keeps the pager in step without threading a call through the render body
        const drawPanels = render;
        render = function (s) {
          drawPanels(s);
          if (marks.length) pager.sync(activeAt(s));
        };

        let targetS = 0, renderS = 0, raf = 0;
        function readTarget() { targetS = Math.max(0, -scroller.getBoundingClientRect().top); }
        function frame() {
          // scroller rect is read HERE, at rAF time — reading it in the raw scroll
          // event fired several times a frame and forced synchronous layout each time
          readTarget();
          const diff = targetS - renderS;
          if (Math.abs(diff) < 0.4) { renderS = targetS; raf = 0; render(renderS); return; }
          renderS += diff * 0.22;
          render(renderS);
          raf = requestAnimationFrame(frame);
        }

        function render(s) {
          if (!marks.length) return;
          secs.forEach((sec, i) => {
            const m = marks[i];
            const liveStart = i === 0 ? -Infinity : marks[i - 1].slideStart - V;
            const liveEnd = i === n - 1 ? Infinity : m.slideEnd + V * 0.5;
            const live = s >= liveStart && s <= liveEnd;
            if (live !== sec.live) {
              sec.live = live;
              sec.el.style.visibility = live ? 'visible' : 'hidden';
              // promote only live panels — a static will-change on every panel held
              // ~2 full-viewport GPU layers per section for the whole session
              sec.el.style.willChange = live ? 'transform' : '';
              sec.inner.style.willChange = live ? 'transform' : '';
              if (live) sec.videos.forEach(v => v.play().catch(() => {}));
            }
            if (!live) {
              sec.videos.forEach(v => { if (!v.paused) v.pause(); });
              return;
            }
            const ty = s <= m.readStart ? 0 : s >= m.readEnd ? m.readH : (s - m.readStart);
            let tx = 0;
            if (i > 0) {
              const pm = marks[i - 1];
              if (s <= pm.slideStart) tx = 100;
              else if (s >= pm.slideEnd) tx = 0;
              else tx = (1 - ease((s - pm.slideStart) / (pm.slideEnd - pm.slideStart))) * 100;
            }
            if (tx !== sec.tx) {
              const p = tx / 100;                       // 1 = entering (off right), 0 = landed
              // grow-to-rest: incoming panel scales from ENTER_SCALE (50%) up to 100% as it lands,
              // coupled to the sweep so it reaches full size exactly when it comes to rest. No tilt.
              const sc = (1 - p * (1 - ENTER_SCALE)).toFixed(4);
              sec.el.style.transform = 'translate3d(' + tx + '%,0,0) scale(' + sc + ')';
              sec.tx = tx;
            }
            if (ty !== sec.ty) { sec.inner.style.transform = 'translate3d(0,' + (-ty) + 'px,0)'; sec.ty = ty; }
          });
        }

        // view.hidden: the four case-study decks all listen on window, so without this
        // each one measured its scroller on every scroll frame of every other page.
        const onScroll = () => { if (deckAnimating || view.hidden) return; if (!raf) raf = requestAnimationFrame(frame); };
        window.addEventListener('scroll', onScroll, { passive: true });

        // ── snap deck: each gesture tweens render() to the next panel's rest offset over a fixed
        // duration (the rolodex flip plays during the tween), keeping native scroll in sync
        // (instant, to dodge the site's CSS smooth-scroll). Free scrollbar drag still works. ──
        function scrollerTop() { return scroller.getBoundingClientRect().top + window.scrollY; }
        function nearestStop(v) { let b = 0, bd = Infinity; for (let i = 0; i < stops.length; i++) { const d = Math.abs(stops[i] - v); if (d < bd) { bd = d; b = i; } } return b; }
        function goToStop(i) {
          if (!stops.length) return;
          i = Math.max(0, Math.min(stops.length - 1, i));
          curStop = i;
          const O = scrollerTop(), startY = window.scrollY, endY = O + stops[i], t0 = performance.now(), DUR = 1000;
          deckAnimating = true;
          if (raf) { cancelAnimationFrame(raf); raf = 0; }
          if (deckRaf) cancelAnimationFrame(deckRaf);
          (function step(now) {
            const k = Math.min(1, (now - t0) / DUR);
            const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // easeInOutCubic — smooth start + settle
            const y = startY + (endY - startY) * e;
            window.scrollTo({ top: y, behavior: 'instant' });
            renderS = Math.max(0, y - O); render(renderS);
            if (k < 1) deckRaf = requestAnimationFrame(step);
            else { renderS = Math.max(0, endY - O); targetS = renderS; render(renderS); deckAnimating = false; }
          })(performance.now());
          // watchdog: if rAF stalls (throttled/background tab), force-finish so the deck never locks
          setTimeout(() => { if (deckAnimating && curStop === i) { renderS = Math.max(0, endY - O); targetS = renderS; window.scrollTo({ top: endY, behavior: 'instant' }); render(renderS); deckAnimating = false; } }, DUR + 300);
        }
        const deckActive = () => !view.hidden && route.token() === '#existence' && stops.length > 1;
        const inModal = (el) => el && el.closest && el.closest('.contact-drawer, .contact-scrim, .pgf-lightbox');
        function deckStep(dir) { if (!deckAnimating) goToStop(nearestStop(renderS) + dir); }
        window.addEventListener('wheel', (e) => {
          if (!deckActive() || e.ctrlKey || inModal(e.target)) return;
          e.preventDefault();
          if (Math.abs(e.deltaY) < 4) return;                 // drop the tiny trackpad-inertia tail
          // Idle unlock: fast release once events stop (discrete mouse notches / distinct swipes).
          clearTimeout(wheelIdleTimer);
          wheelIdleTimer = setTimeout(() => { deckCooldown = false; clearTimeout(wheelMaxTimer); }, 160);
          if (deckCooldown || deckAnimating) return;
          deckCooldown = true;
          // Hard max unlock (set once, NOT reset by events): a trackpad's near-continuous stream
          // would keep resetting the idle timer forever and lock the deck — this guarantees release.
          clearTimeout(wheelMaxTimer);
          wheelMaxTimer = setTimeout(() => { deckCooldown = false; }, 1400);
          deckStep(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
        window.addEventListener('keydown', (e) => {
          if (!deckActive()) return;
          const tag = (document.activeElement && document.activeElement.tagName) || '';
          if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)) return;
          let d = 0;
          if (e.key === 'ArrowDown' || e.key === 'PageDown') d = 1;
          else if (e.key === 'ArrowUp' || e.key === 'PageUp') d = -1;
          else if (e.key === 'Home') { e.preventDefault(); goToStop(0); return; }
          else if (e.key === 'End') { e.preventDefault(); goToStop(stops.length - 1); return; }
          if (!d) return;
          e.preventDefault(); deckStep(d);
        });
        window.addEventListener('touchstart', (e) => { tStartY = (deckActive() && !inModal(e.target)) ? e.touches[0].clientY : null; }, { passive: true });
        window.addEventListener('touchmove', (e) => { if (deckActive() && tStartY !== null) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', (e) => {
          if (!deckActive() || tStartY === null) return;
          const dy = tStartY - e.changedTouches[0].clientY; tStartY = null;
          if (Math.abs(dy) >= 36) deckStep(dy > 0 ? 1 : -1);
        }, { passive: true });

        let rzT = 0; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(layout, 120); });
        window.addEventListener('load', layout);
        new MutationObserver(() => { if (!view.hidden) { curStop = 0; requestAnimationFrame(layout); } })
          .observe(view, { attributes: true, attributeFilter: ['hidden'] });
        view.querySelectorAll('img, video').forEach(m => {
          m.addEventListener('load', layout);
          m.addEventListener('loadedmetadata', layout);
        });
        if (route.token() === '#existence') requestAnimationFrame(layout);
        layout();
      })();
      csPagerStatic('existence-view');

      // ── Jumpable case study: same two-tier reveal (text .reveal / asset .cs-clip) ──
      (function () {
        const view = document.getElementById('jumpable-view');
        if (!view) return;
        const textTargets = [...view.querySelectorAll(
          '.cs-hero-h, .cs-hero-intro, .cs-meta > div, .cs-ledger-num, .cs-ledger-eye,' +
          '.cs-ledger-h, .cs-ledger-p, .cs-ledger-label, .cs-ledger-row, .cs-ledger-note,' +
          '.cs-quote p, .cs-closing-h, .cs-closing-p, .rn-kicker, .rn-title, .rn-desc'
        )];
        // the hero mock uses .cs-jp-heroph (not .cs-ph) so its clip never fights the tile→hero morph
        const assetTargets = [...view.querySelectorAll('.cs-ph')];
        textTargets.forEach(el => el.classList.add('reveal'));
        const clip = el => {
          el.classList.add('cs-clip');
          el.style.setProperty('--clip-round', getComputedStyle(el).borderTopLeftRadius || '0px');
        };
        assetTargets.forEach(clip);
        const targets = [...textTargets, ...assetTargets];
        if (!targets.length) return;

        ['.cs-meta', '.cs-ledger-rows', '.cs-jp-shots'].forEach(sel => {
          view.querySelectorAll(sel + ' > *').forEach((el, i) => {
            el.style.setProperty('--reveal-delay', (i * 0.06).toFixed(2) + 's');
          });
        });

        const REVEALABLE = '.reveal, .cs-clip';
        const reduce = matchMedia('(prefers-reduced-motion: reduce)');
        if (reduce.matches || !('IntersectionObserver' in window)) {
          view.querySelectorAll(REVEALABLE).forEach(el => el.classList.add('is-visible'));
          return;
        }
        const onReveal = (entries, obs) => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
          });
        };
        const io = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
        textTargets.forEach(el => io.observe(el));
        const assetIo = new IntersectionObserver(onReveal, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
        assetTargets.forEach(el => assetIo.observe(el));

        // fail-safe for clip assets (default HIDDEN) — reveal anything geometrically in view
        let clipTick = false;
        const clipScrollPass = () => {
          clipTick = false;
          // This view isn't routed in — its clips can't be on screen, and without this
          // bail all four case studies re-query and re-measure their pending clips on
          // every scroll frame of the HOME page. (Their rects read 0 while hidden, so
          // nothing was ever revealed by it either.)
          if (view.hidden) return;
          const pending = view.querySelectorAll('.cs-clip:not(.is-visible)');
          pending.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.9 && r.bottom > 0) el.classList.add('is-visible');
          });
          if (!pending.length) window.removeEventListener('scroll', onClipScroll);
        };
        const onClipScroll = () => {
          if (view.hidden) return;   // don't even schedule a frame for a routed-out view
          if (!clipTick) { clipTick = true; requestAnimationFrame(clipScrollPass); }
        };
        window.addEventListener('scroll', onClipScroll, { passive: true });

        // the view is display:none until routed in — reveal on-screen items on route/open
        function revealInView() {
          view.querySelectorAll('.reveal:not(.is-visible), .cs-clip:not(.is-visible)').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.88 && r.bottom > 0) el.classList.add('is-visible');
          });
        }
        window.addEventListener('hashchange', () => {
          if (route.token() === '#jumpable') requestAnimationFrame(revealInView);
        });
        if (route.token() === '#jumpable') requestAnimationFrame(revealInView);
      })();

      // ── Jumpable · recordings start from the top each time their slide is landed on ──
      (function () {
        const view = document.getElementById('jumpable-view');
        if (!view) return;
        // the cover-slide enhancer pauses a panel's video when it scrolls away; reset it to 0 on that
        // pause so the enhancer's next play() (on re-entry / landing) begins from the start, not mid-clip.
        view.querySelectorAll('video').forEach(v => {
          v.addEventListener('pause', () => { try { if (v.currentTime > 0) v.currentTime = 0; } catch (e) {} });
        });
      })();

      // ── Jumpable · section cover-slide (pinned choreography, scoped) ──
      (function () {
        const view = document.getElementById('jumpable-view');
        if (!view) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (document.documentElement.classList.contains('cs-static')) return;
        const page = view.querySelector('.cs-page');
        if (!page) return;
        const sections = [...page.children].filter(el => el.classList.contains('cs-band'));
        if (sections.length < 2) return;

        const scroller = document.createElement('div');
        scroller.className = 'cs-slide-scroller';
        const stage = document.createElement('div');
        stage.className = 'cs-slide-stage';
        scroller.appendChild(stage);
        page.insertBefore(scroller, sections[0]);

        const secs = sections.map((sec, i) => {
          const inner = document.createElement('div');
          inner.className = 'cs-slide-inner';
          while (sec.firstChild) inner.appendChild(sec.firstChild);
          sec.appendChild(inner);
          sec.classList.add('cs-slide-sec');
          if (i > 0) sec.classList.add('cv');              // hero (base) has no slide-in
          sec.style.zIndex = String(i + 1);
          stage.appendChild(sec);
          return { el: sec, inner, videos: [...sec.querySelectorAll('video')], live: true, tx: -1, ty: -1 };
        });

        // the slide + read motion replaces the per-element reveal, so show all up front
        view.querySelectorAll('.reveal, .cs-clip').forEach(el => el.classList.add('is-visible'));

        const n = secs.length;
        const ease = t => 1 - Math.pow(1 - t, 3);
        const SL_FACTOR = 0.6;                 // sweep distance in viewports (~one gesture)
        const DW_FACTOR = 0.5;                 // dwell before the next section sweeps in
        const ENTER_SCALE = 0.5;               // incoming panel grows from 50% → 100% as it comes to rest (no tilt)
        let marks = [], V = 0;
        // ── snap-deck state: one wheel/key/swipe gesture advances exactly one panel ──
        let stops = [], curStop = 0, deckAnimating = false, deckRaf = 0, deckCooldown = false, wheelIdleTimer = 0, wheelMaxTimer = 0, tStartY = null;
        // stops is NOT 1:1 with panels (a taller-than-viewport panel adds a second stop),
        // so the pager needs panel index -> stop index to land a jump on the right panel
        const stopOfSec = [];

        function layout() {
          V = window.innerHeight;
          if (!V || view.hidden) return;
          const SL = Math.round(V * SL_FACTOR);
          const DW = Math.round(V * DW_FACTOR);
          let t = 0; marks = [];
          secs.forEach((s, i) => {
            const readH = Math.max(0, s.inner.scrollHeight - V);
            const readStart = t; t += readH; const readEnd = t;
            let slideStart = null, slideEnd = null;
            if (i < n - 1) {
              t += DW;
              slideStart = t; t += SL;
              slideEnd = t;
            }
            marks.push({ readStart, readEnd, readH, slideStart, slideEnd });
          });
          scroller.style.height = (t + V) + 'px';
          // deck stops: each panel's flat rest, PLUS an extra stop after any vertical read-scroll
          // region (e.g. the hero image reveal). So the first gesture scrolls the hero vertically
          // to its end, and only the NEXT gesture slides the following panel in horizontally —
          // the two motions no longer collide in one scroll.
          stops = [];
          secs.forEach((sec, i) => {
            stopOfSec[i] = stops.length;
            stops.push(i === 0 ? 0 : marks[i - 1].slideEnd);        // section fully arrived (top of its content)
            if (marks[i].readH > 0) stops.push(marks[i].readEnd);   // extra stop after reading a taller-than-viewport section
          });
          readTarget(); renderS = targetS; render(renderS);
        }

        // ── section pager ──
        // Which panel "owns" a scroll offset, and how far through it we are. The flip
        // happens at the MIDPOINT of the sweep, so the tick changes exactly when the
        // incoming panel visually takes over — not when it starts moving or lands.
        const midOf = i => i === 0 ? 0 : (marks[i - 1].slideStart + marks[i - 1].slideEnd) / 2;
        function activeAt(s) {
          let i = 0;
          for (let k = 1; k < n; k++) { if (s >= midOf(k)) i = k; else break; }
          return i;
        }
        const pager = csPager({ view, sections, goTo: i => goToStop(stopOfSec[i] || 0) });
        // render is a hoisted declaration, so this rebinding is live for every caller —
        // it keeps the pager in step without threading a call through the render body
        const drawPanels = render;
        render = function (s) {
          drawPanels(s);
          if (marks.length) pager.sync(activeAt(s));
        };

        let targetS = 0, renderS = 0, raf = 0;
        function readTarget() { targetS = Math.max(0, -scroller.getBoundingClientRect().top); }
        function frame() {
          // scroller rect is read HERE, at rAF time — reading it in the raw scroll
          // event fired several times a frame and forced synchronous layout each time
          readTarget();
          const diff = targetS - renderS;
          if (Math.abs(diff) < 0.4) { renderS = targetS; raf = 0; render(renderS); return; }
          renderS += diff * 0.22;
          render(renderS);
          raf = requestAnimationFrame(frame);
        }

        function render(s) {
          if (!marks.length) return;
          secs.forEach((sec, i) => {
            const m = marks[i];
            const liveStart = i === 0 ? -Infinity : marks[i - 1].slideStart - V;
            const liveEnd = i === n - 1 ? Infinity : m.slideEnd + V * 0.5;
            const live = s >= liveStart && s <= liveEnd;
            if (live !== sec.live) {
              sec.live = live;
              sec.el.style.visibility = live ? 'visible' : 'hidden';
              // promote only live panels — a static will-change on every panel held
              // ~2 full-viewport GPU layers per section for the whole session
              sec.el.style.willChange = live ? 'transform' : '';
              sec.inner.style.willChange = live ? 'transform' : '';
              if (live) sec.videos.forEach(v => v.play().catch(() => {}));
            }
            if (!live) {
              sec.videos.forEach(v => { if (!v.paused) v.pause(); });
              return;
            }
            const ty = s <= m.readStart ? 0 : s >= m.readEnd ? m.readH : (s - m.readStart);
            let tx = 0;
            if (i > 0) {
              const pm = marks[i - 1];
              if (s <= pm.slideStart) tx = 100;
              else if (s >= pm.slideEnd) tx = 0;
              else tx = (1 - ease((s - pm.slideStart) / (pm.slideEnd - pm.slideStart))) * 100;
            }
            if (tx !== sec.tx) {
              const p = tx / 100;                       // 1 = entering (off right), 0 = landed
              // grow-to-rest: incoming panel scales from ENTER_SCALE (50%) up to 100% as it lands,
              // coupled to the sweep so it reaches full size exactly when it comes to rest. No tilt.
              const sc = (1 - p * (1 - ENTER_SCALE)).toFixed(4);
              sec.el.style.transform = 'translate3d(' + tx + '%,0,0) scale(' + sc + ')';
              sec.tx = tx;
            }
            if (ty !== sec.ty) { sec.inner.style.transform = 'translate3d(0,' + (-ty) + 'px,0)'; sec.ty = ty; }
          });
        }

        // view.hidden: the four case-study decks all listen on window, so without this
        // each one measured its scroller on every scroll frame of every other page.
        const onScroll = () => { if (deckAnimating || view.hidden) return; if (!raf) raf = requestAnimationFrame(frame); };
        window.addEventListener('scroll', onScroll, { passive: true });

        // ── snap deck: each gesture tweens render() to the next panel's rest offset over a fixed
        // duration (the rolodex flip plays during the tween), keeping native scroll in sync
        // (instant, to dodge the site's CSS smooth-scroll). Free scrollbar drag still works. ──
        function scrollerTop() { return scroller.getBoundingClientRect().top + window.scrollY; }
        function nearestStop(v) { let b = 0, bd = Infinity; for (let i = 0; i < stops.length; i++) { const d = Math.abs(stops[i] - v); if (d < bd) { bd = d; b = i; } } return b; }
        function goToStop(i) {
          if (!stops.length) return;
          i = Math.max(0, Math.min(stops.length - 1, i));
          curStop = i;
          const O = scrollerTop(), startY = window.scrollY, endY = O + stops[i], t0 = performance.now(), DUR = 1000;
          deckAnimating = true;
          if (raf) { cancelAnimationFrame(raf); raf = 0; }
          if (deckRaf) cancelAnimationFrame(deckRaf);
          (function step(now) {
            const k = Math.min(1, (now - t0) / DUR);
            const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // easeInOutCubic — smooth start + settle
            const y = startY + (endY - startY) * e;
            window.scrollTo({ top: y, behavior: 'instant' });
            renderS = Math.max(0, y - O); render(renderS);
            if (k < 1) deckRaf = requestAnimationFrame(step);
            else { renderS = Math.max(0, endY - O); targetS = renderS; render(renderS); deckAnimating = false; }
          })(performance.now());
          // watchdog: if rAF stalls (throttled/background tab), force-finish so the deck never locks
          setTimeout(() => { if (deckAnimating && curStop === i) { renderS = Math.max(0, endY - O); targetS = renderS; window.scrollTo({ top: endY, behavior: 'instant' }); render(renderS); deckAnimating = false; } }, DUR + 300);
        }
        const deckActive = () => !view.hidden && route.token() === '#jumpable' && stops.length > 1;
        const inModal = (el) => el && el.closest && el.closest('.contact-drawer, .contact-scrim, .pgf-lightbox');
        function deckStep(dir) { if (!deckAnimating) goToStop(nearestStop(renderS) + dir); }
        window.addEventListener('wheel', (e) => {
          if (!deckActive() || e.ctrlKey || inModal(e.target)) return;
          e.preventDefault();
          if (Math.abs(e.deltaY) < 4) return;                 // drop the tiny trackpad-inertia tail
          // Idle unlock: fast release once events stop (discrete mouse notches / distinct swipes).
          clearTimeout(wheelIdleTimer);
          wheelIdleTimer = setTimeout(() => { deckCooldown = false; clearTimeout(wheelMaxTimer); }, 160);
          if (deckCooldown || deckAnimating) return;
          deckCooldown = true;
          // Hard max unlock (set once, NOT reset by events): a trackpad's near-continuous stream
          // would keep resetting the idle timer forever and lock the deck — this guarantees release.
          clearTimeout(wheelMaxTimer);
          wheelMaxTimer = setTimeout(() => { deckCooldown = false; }, 1400);
          deckStep(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
        window.addEventListener('keydown', (e) => {
          if (!deckActive()) return;
          const tag = (document.activeElement && document.activeElement.tagName) || '';
          if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)) return;
          let d = 0;
          if (e.key === 'ArrowDown' || e.key === 'PageDown') d = 1;
          else if (e.key === 'ArrowUp' || e.key === 'PageUp') d = -1;
          else if (e.key === 'Home') { e.preventDefault(); goToStop(0); return; }
          else if (e.key === 'End') { e.preventDefault(); goToStop(stops.length - 1); return; }
          if (!d) return;
          e.preventDefault(); deckStep(d);
        });
        window.addEventListener('touchstart', (e) => { tStartY = (deckActive() && !inModal(e.target)) ? e.touches[0].clientY : null; }, { passive: true });
        window.addEventListener('touchmove', (e) => { if (deckActive() && tStartY !== null) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', (e) => {
          if (!deckActive() || tStartY === null) return;
          const dy = tStartY - e.changedTouches[0].clientY; tStartY = null;
          if (Math.abs(dy) >= 36) deckStep(dy > 0 ? 1 : -1);
        }, { passive: true });

        let rzT = 0; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(layout, 120); });
        window.addEventListener('load', layout);
        new MutationObserver(() => { if (!view.hidden) { curStop = 0; requestAnimationFrame(layout); } })
          .observe(view, { attributes: true, attributeFilter: ['hidden'] });
        view.querySelectorAll('img, video').forEach(m => {
          m.addEventListener('load', layout);
          m.addEventListener('loadedmetadata', layout);
        });
        if (route.token() === '#jumpable') requestAnimationFrame(layout);
        layout();
      })();
      csPagerStatic('jumpable-view');

      // ── Fireflut · themed-variants loop (node 470:2603) ──
      // The variants mockup cycles blue→amber→green→red like a gif — a hard cut,
      // no dissolve: each frame swaps in instantly and the card background flips
      // to the new brand colour on the same beat. Frames are pre-normalised to
      // an identical dead-centre box, so only the colour changes — the mockup
      // never shifts. Advances only while on-screen; static under reduced-motion.
      // Two instances share this markup (the moodboard row + the trio's mini
      // card), each gets its own independent timer/state.
      (function () {
        const figs = document.querySelectorAll('#fireflut-view [data-ff-variants]');
        if (!figs.length) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        const STEP = 850; // ms each frame is shown (hard cut, no fade)

        figs.forEach(fig => {
          const frames = [...fig.querySelectorAll('.ff-vframe')];
          if (frames.length < 2) return;
          const colors = ['--v1', '--v2', '--v3', '--v4'].map(v =>
            getComputedStyle(fig).getPropertyValue(v).trim() || null);
          let cur = 0, timer = null, onScreen = false;

          function show(n) {
            frames.forEach((f, k) => {
              f.classList.toggle('is-active', k === n);
              f.style.opacity = k === n ? '1' : '0';
            });
            if (colors[n]) fig.style.background = colors[n];
            cur = n;
          }
          show(0);

          function tick() { show((cur + 1) % frames.length); }
          function start() {
            if (timer || reduce.matches) return;
            timer = window.setInterval(tick, STEP);
          }
          function stop() { if (timer) { clearInterval(timer); timer = null; } }

          const io = new IntersectionObserver(es => es.forEach(e => {
            onScreen = e.isIntersecting;
            onScreen ? start() : stop();
          }), { threshold: 0.15 });
          io.observe(fig);
          document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : (onScreen && start());
          });
        });
      })();

      // ── Fireflut · recommendations card stage-fit (node 475:3504) ──
      // Fixed 720×626 design stage scaled to fit the trio cell (contain), same
      // technique as the gauge, so type/icon proportions never drift from Figma.
      (function () {
        const stage = document.querySelector('#fireflut-view [data-rc-stage]');
        if (!stage) return;
        const card = stage.closest('.cs-ff-recs');
        const DW = 720, DH = 626;
        const fit = () => {
          const w = card.clientWidth, h = card.clientHeight;
          if (!w || !h) return;
          stage.style.setProperty('--rc-scale', Math.min(w / DW, h / DH).toFixed(4));
        };
        fit();
        if ('ResizeObserver' in window) new ResizeObserver(fit).observe(card);
        window.addEventListener('resize', fit);
        window.addEventListener('hashchange', () => { if (route.token() === '#fireflut') requestAnimationFrame(fit); });
      })();

      // ── Fireflut · recommendations items loop (node 475:3504) ──
      // The three rows fade up one by one, hold, fade out, and cycle again —
      // a continuous cascade (CSS animation, staggered per row) that plays
      // only while the card is on-screen (battery), pausing off-screen.
      (function () {
        const card = document.querySelector('#fireflut-view .cs-ff-recs');
        if (!card) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // items stay visible via CSS
        const play = () => card.classList.add('rc-play');
        const stop = () => card.classList.remove('rc-play');
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? play() : stop()),
            { threshold: 0.3 }).observe(card);
        } else { play(); }
      })();

      // ── Fireflut · loading reply card stage-fit (node 507:2551) ──
      // Fixed 585×626 design stage (the exact Figma canvas the phone sits
      // in), CONTAIN-fit into the quad cell so the phone's size relative to
      // its black surroundings matches Figma exactly, rather than being
      // blown up to the cell's full width. querySelectorAll — the chat-
      // details marquee duplicates this card for its seamless loop.
      (function () {
        const stages = document.querySelectorAll('#fireflut-view [data-lr-stage]');
        if (!stages.length) return;
        const DW = 585, DH = 626;
        stages.forEach(stage => {
          const card = stage.closest('.cs-ff-loading');
          const fit = () => {
            const w = card.clientWidth, h = card.clientHeight;
            if (!w || !h) return;
            stage.style.setProperty('--lr-scale', Math.min(w / DW, h / DH).toFixed(4));
          };
          fit();
          if ('ResizeObserver' in window) new ResizeObserver(fit).observe(card);
          window.addEventListener('resize', fit);
          window.addEventListener('hashchange', () => { if (route.token() === '#fireflut') requestAnimationFrame(fit); });
        });
      })();

      // ── Fireflut · loading reply shimmer (node 507:2551) ──
      // The skeleton bars shimmer and the sparkle glyph pulses only while
      // the card is on-screen (battery), pausing off-screen. querySelectorAll
      // — the chat-details marquee duplicates this card for its seamless loop.
      (function () {
        const cards = document.querySelectorAll('#fireflut-view .cs-ff-loading');
        if (!cards.length) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!('IntersectionObserver' in window)) { cards.forEach(c => c.classList.add('load-play')); return; }
        const io = new IntersectionObserver(es => es.forEach(e =>
          e.target.classList.toggle('load-play', e.isIntersecting)), { threshold: 0.3 });
        cards.forEach(card => io.observe(card));
      })();

      // ── Fireflut · motion cards (looping screen recordings: gauge, location, pre-prompts) ──
      // Each plays only while on-screen (saves battery); static poster frame
      // under reduced-motion.
      (function () {
        const vids = document.querySelectorAll('#fireflut-view [data-gg-video]');
        if (!vids.length) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // poster stays
        const play = vid => { const p = vid.play(); if (p) p.catch(() => {}); };
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? play(e.target) : e.target.pause()),
            { threshold: 0.25 });
          vids.forEach(vid => io.observe(vid));
        } else { vids.forEach(play); }
      })();

      // ── Case studies · autoplay safety net ──────────────────────────────
      // Every case-study clip is decorative: muted, looping, no controls. So a
      // refused first autoplay (iOS Low Power Mode, or a document backgrounded
      // at load) leaves it frozen on its poster with no affordance to start it.
      // Retry at the moments that refusal lifts — page becomes visible, first
      // user gesture, route change — and only for clips actually in the
      // viewport, so the per-card observers keep owning off-screen pausing.
      (function () {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const VIEWS = '#hatcha-view, #fireflut-view, #existence-view, #jumpable-view';
        // both axes: deck panels sit at inset:0 and are swept aside on X, so a
        // vertical-only test would call an off-screen panel's clips visible
        const onScreen = el => {
          const r = el.getBoundingClientRect();
          return r.height > 0 && r.top < innerHeight && r.bottom > 0
                              && r.left < innerWidth && r.right > 0;
        };
        const kick = () => {
          document.querySelectorAll(VIEWS).forEach(view => {
            if (view.hidden) return;
            view.querySelectorAll('video[autoplay]').forEach(vid => {
              if (!vid.paused || !onScreen(vid)) return;
              const p = vid.play();
              if (p) p.catch(() => {});
            });
          });
        };
        document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
        ['touchstart', 'click'].forEach(evt =>
          window.addEventListener(evt, kick, { passive: true, once: true }));
        window.addEventListener('hashchange', () => setTimeout(kick, 80));
      })();

      // profile picture → top of home page, via the SAME curtain transition as the
      // nav links. The avatar is a native <a href="/#work"> (js/site.js); we hijack the
      // click so it plays the curtain and lands at the very top instead of the work
      // section. We strip the hash with replaceState (NOT a hashchange) so ONLY this
      // curtain runs — not the router's hashchange handler too — and keep prevHash in
      // sync so the next navigation still animates.
      function goHome(e) {
        if (e && e.preventDefault) e.preventDefault();
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const leavingSubpage = routeBucket(route.token()) !== 'home';
        if (route.token()) history.replaceState(null, '', '/' + location.search);
        prevHash = route.token();

        // Already on home → no route swap; just glide up to the hero at the very top.
        if (!leavingSubpage) {
          window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
          return;
        }

        // Coming from a sub-page → play the curtain and land on the hero. behavior:'instant'
        // overrides the page's CSS scroll-behavior:smooth; we re-pin to the top across the
        // whole covered+open window (a scrollTo(0) when already at 0 is a no-op) so the home
        // re-measure — which can stall ~1s — can't leave us parked below the hero.
        const toTop = () => window.scrollTo({ top: 0, behavior: 'instant' });
        if (curtain && !reduced && !inTransition) {
          runCurtain('home');            // close → swap (applyAboutRoute) → open
          [T_CLOSE, T_CLOSE + 120, T_CLOSE + 260, T_CLOSE + T_HOLD,
           T_CLOSE + T_HOLD + T_OPEN, T_CLOSE + T_HOLD + T_OPEN + 250].forEach(d => setTimeout(toTop, d));
        } else {
          applyAboutRoute();
          toTop();
        }
      }
      function wireNav() {
        // the parse-time applyAboutRoute() below already set the route; the nav
        // has only just rendered, so re-sync ONLY the nav-dependent bits instead
        // of re-running the whole route swap (which double-fired the synthetic
        // resize remeasure and a second batch of contrast timers at every load)
        const isAbout = route.token() === '#about';
        const isPlayground = route.token() === '#playground';
        document.querySelectorAll('.nav-link, .menu-link').forEach(l => {
          const href = l.getAttribute('href') || '';
          l.classList.toggle('active', (isAbout && (href.endsWith('#about') || href.endsWith('/about'))) ||                                       (isPlayground && (href.endsWith('#playground') || href.endsWith('/playground'))));
        });
        [0, 320].forEach(t => setTimeout(() => window.updateNavContrast?.(), t));
        const avatar = document.querySelector('.nav-avatar');
        if (avatar && !avatar.dataset.homeWired) {
          avatar.dataset.homeWired = '1';
          avatar.addEventListener('click', goHome);   // native <a> handles focus/Enter/role
        }
      }
      // run once the shared nav (js/site.js, deferred) has rendered
      document.addEventListener('DOMContentLoaded', wireNav);
      applyAboutRoute();

      // ── experience accordion (single-open) ──
      const items = Array.from(document.querySelectorAll('#about-view .aexp-item'));
      items.forEach(item => {
        const head = item.querySelector('.aexp-head');
        head.addEventListener('click', () => {
          const willOpen = !item.classList.contains('is-open');
          items.forEach(other => {
            const isTarget = other === item;
            other.classList.toggle('is-open', isTarget && willOpen);
            other.querySelector('.aexp-head').setAttribute('aria-expanded', String(isTarget && willOpen));
          });
        });
      });
      // mobile: start with every row collapsed (gskinner opens by default only on desktop)
      if (window.matchMedia('(max-width: 1100px)').matches) {
        items.forEach(item => {
          item.classList.remove('is-open');
          item.querySelector('.aexp-head').setAttribute('aria-expanded', 'false');
        });
      }

      // ── "the About view is now actually visible" signal ──
      // Every measurer below sizes itself against real layout, and #about-view is
      // display:none until its route opens. `hashchange` is NOT a safe cue: on the
      // curtain path the router defers applyAboutRoute() until the panes have
      // closed, so the hashchange listeners fire while the view is still hidden and
      // measure a zero-height layout. Those that also listen to `scroll` self-heal;
      // the experience pin doesn't, so it stayed unsized and left its last rows
      // stranded below the fold. Watch the `hidden` attribute instead — that flips
      // exactly when the layout becomes real — and re-measure again once webfonts
      // land, since row heights depend on how the text wraps.
      (function initAboutMeasureSignal() {
        const view = document.getElementById('about-view');
        if (!view) return;
        const ping = () => window.dispatchEvent(new Event('about:measure'));
        // two frames: one for the un-hide to lay out, one for it to settle
        const pingSettled = () => requestAnimationFrame(() => requestAnimationFrame(ping));
        new MutationObserver(() => { if (!view.hidden) pingSettled(); })
          .observe(view, { attributes: true, attributeFilter: ['hidden'] });
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => { if (!view.hidden) pingSettled(); });
        }
      })();

      // ── fit the intro hero so the land shows within the viewport height ──
      (function initIntroFit() {
        const intro = document.querySelector('#about-view .about-intro');
        if (!intro) return;
        const content = intro.querySelector('.ai-content');
        function fit() {
          // polaroid-stack scale for the ≤1100px reflow (fills the column, never >1)
          intro.style.setProperty('--pol-scale', Math.min(1, (window.innerWidth - 48) / 516).toFixed(4));
          // scale the 1440×1024 frame down to fit both viewport dimensions (never up)
          const vh = window.innerHeight;
          const s = Math.min(1, vh / 1024, window.innerWidth / 1440);
          intro.style.setProperty('--intro-scale', s.toFixed(4));
          // drop the frame so the content column is centred in the viewport height;
          // clamp so the scaled frame never leaves the section (no clipping / gap)
          const cTop = content ? content.offsetTop : 233.75;       // 233.75 within the stage
          const cH   = content ? content.offsetHeight : 0;         // unscaled layout height
          const contentCenter = (cTop + cH / 2) * s;               // visual px from the frame's top
          let offset = vh / 2 - contentCenter;
          offset = Math.max(0, Math.min(offset, vh - 1024 * s));
          intro.style.setProperty('--intro-offset', offset.toFixed(1) + 'px');
        }
        fit();
        window.addEventListener('resize', fit);
        window.addEventListener('orientationchange', fit);
        // the About view is hidden at load — re-measure when it's routed into view
        window.addEventListener('hashchange', () => requestAnimationFrame(fit));
        window.addEventListener('about:measure', fit);
      })();

      // ── hero content shrinks on scroll — mirrors the home page's .hero-content
      //    (scale 1.0 → 0.88, eased). Progress runs over the first 80% of the hero. ──
      (function initIntroScale() {
        const view  = document.getElementById('about-view');
        const hero  = document.querySelector('#about-view .about-intro');
        const scene = document.getElementById('ai-scene');
        if (!view || !hero || !scene) return;
        let raf = 0;
        let lastS = null;                                // skip identical writes (no repaint)
        function update() {
          raf = 0;
          if (view.hidden) return;
          const heroH = hero.offsetHeight || 1;
          const progress = Math.min(Math.max(window.scrollY / (heroH * 0.8), 0), 1);
          const eased = 1 - Math.pow(1 - progress, 3);   // ease-out cubic (as on home)
          const scale = (1 - eased * 0.12).toFixed(4);   // 1.0 → 0.88
          if (scale !== lastS) { scene.style.setProperty('--intro-scroll', scale); lastS = scale; }
        }
        // routed-out on the home page, but it still scheduled a frame per scroll —
        // the shared scheduler costs nothing when update() bails on view.hidden
        function onScroll() { Scroll.kick(); }
        Scroll.add(update);
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('hashchange', () => requestAnimationFrame(update));
        window.addEventListener('about:measure', update);
        update();
      })();

      // ── experience section recedes into shadow as Fun-facts scrolls over it —
      //    mirrors the home page's featured-work dim under the testimonials. ──
      (function initExpRecede() {
        const view = document.getElementById('about-view');
        const exp  = document.querySelector('#about-view .about-exp');
        const fun  = document.querySelector('#about-view .about-fun');
        if (!view || !exp || !fun) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
        let raf = 0;
        let lastF = null;                                // skip identical writes (no repaint)
        function update() {
          raf = 0;
          if (view.hidden || reduce.matches) { if (lastF !== '') { exp.style.filter = ''; lastF = ''; } return; }
          const vh = window.innerHeight;
          const top = fun.getBoundingClientRect().top;   // fun-facts top in viewport
          const p = ease((vh - top) / vh);               // 0 (just entering) → 1 (covering)
          const f = `brightness(${(1 - 0.42 * p).toFixed(3)}) saturate(${(1 - 0.25 * p).toFixed(3)})`;
          if (f !== lastF) { exp.style.filter = f; lastF = f; }
        }
        // routed-out on the home page, but it still scheduled a frame per scroll —
        // the shared scheduler costs nothing when update() bails on view.hidden
        function onScroll() { Scroll.kick(); }
        Scroll.add(update);
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('hashchange', () => requestAnimationFrame(update));
        window.addEventListener('about:measure', update);
        if (reduce.addEventListener) reduce.addEventListener('change', update);
        update();
      })();

      // ── experience section: size it to the open accordion and pin its BOTTOM to
      //    the viewport so, when the open list is taller than the screen, the section
      //    scrolls through (revealing every row) and then holds while Fun-facts slides
      //    over it — the home page's featured-work pattern. ──
      (function initExpPin() {
        const view  = document.getElementById('about-view');
        const exp   = document.querySelector('#about-view .about-exp');
        const stage = document.querySelector('#about-view .about-exp-stage');
        const list  = document.querySelector('#about-view .aexp-list');
        const label = exp.querySelector('.aexp-label');
        const intro = document.querySelector('#about-view .about-intro');
        const fun   = document.querySelector('#about-view .about-fun');
        if (!view || !exp || !stage || !list) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // bottom-anchor a section: scrolls through its content, then holds its last
        // screen while the next section (higher z-index) slides up over it
        function pinBottom(el) {
          el.style.position = 'sticky';
          el.style.top = Math.min(0, window.innerHeight - el.offsetHeight) + 'px';
        }
        function unpin(el) { el.style.position = ''; el.style.top = ''; }
        // Hold window between the two sections. Fun-facts sits directly after
        // Experience in flow, so without it Fun-facts starts sliding up the instant
        // Experience finishes scrolling through — the last rows flash past before
        // they can be read. Pushing Fun-facts down by ~a screen leaves that much
        // scroll where the bottom-pinned (viewport-filling) Experience just sits
        // still, fully revealed, before the cover-up begins.
        function setHold(vh, sectionH, holdVh) {
          if (!fun) return;
          // only safe while Experience actually fills the viewport — otherwise the
          // gap would expose the page background below it
          fun.style.marginTop = sectionH >= vh ? Math.round(vh * holdVh) + 'px' : '';
        }
        function fit() {
          if (view.hidden) return;
          // ≤1100px the sections reflow into a flow column; drop the desktop pin's
          // inline styles and bottom-pin each section instead, so the page keeps
          // the layered reveal: intro → experience → fun facts → footer
          if (window.matchMedia('(max-width: 1100px)').matches) {
            stage.style.height = '';
            if (label) label.style.top = '';
            if (reduce) {
              [intro, exp, fun].forEach(s => s && unpin(s));
              exp.style.minHeight = '';
              setHold(0, -1, 0);
              return;
            }
            const mvh = window.innerHeight;
            // the collapsed list is shorter than the screen, so the section would
            // pin without filling it — floor it at a full viewport so the hold below
            // has something to sit behind
            exp.style.minHeight = mvh + 'px';
            if (intro) pinBottom(intro);
            pinBottom(exp);
            setHold(mvh, exp.offsetHeight, 0.6);
            if (fun) pinBottom(fun);
            return;
          }
          // desktop: clear the mobile pins (CSS sticky top:0 + the logic below take over)
          if (intro) unpin(intro);
          if (fun) unpin(fun);
          exp.style.position = '';
          exp.style.minHeight = '';
          const vh = window.innerHeight;
          // tall enough to hold the open list, plus padding below the last row so
          // Fun-facts stays off-screen longer before it slides up (the pad scrolls
          // past as empty space before the overlap begins)
          const PAD_BELOW = 180;
          const needed = list.offsetTop + list.offsetHeight + PAD_BELOW;
          const H = Math.max(vh, needed);
          stage.style.height = H + 'px';
          // taller than the viewport → pin the bottom (top negative) so it scrolls
          // through; otherwise pin normally at the top
          exp.style.top = Math.min(0, vh - H) + 'px';
          setHold(vh, H, 0.9);
          // align the rotated "Professional Experience" label with the first (gskinner)
          // row. Anchor to the row's TOP (fixed) — not its centre — so the label stays
          // put when a row expands/collapses (only the panel below the header changes).
          if (label) {
            const first = list.querySelector('.aexp-item');
            const half = label.offsetWidth / 2;                 // rotated → half its height
            const rowTop = list.offsetTop + first.offsetTop;    // stable across open/close
            label.style.top = (rowTop + half) + 'px';
          }
        }
        fit();
        window.addEventListener('resize', fit);
        window.addEventListener('hashchange', () => requestAnimationFrame(fit));
        window.addEventListener('about:measure', fit);
        // re-fit after a row opens/closes (list height changes once the panel settles)
        list.addEventListener('transitionend', (e) => { if (e.propertyName === 'max-height') fit(); });
      })();

      // ── fun facts: cards start as a stacked deck in the centre, then fan out into
      //    the grid as you scroll through the pinned section (hold stacked to ~60%,
      //    then ease open across the rest of the runway) ──
      (function initFunFactsStack() {
        const view    = document.getElementById('about-view');
        const section = document.querySelector('#about-view .about-fun');
        const stage   = document.querySelector('#about-view .about-fun-stage');
        if (!view || !section || !stage) return;
        const cards  = Array.from(stage.querySelectorAll('.ff-card'));
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

        // scale the grid down (never up) so every card fits with a little breathing room.
        // Fit against the cards' real bounding box — NOT the full 1440×1088 stage, which has
        // ~200px of empty padding top/bottom — so the grid keeps its native size on laptop
        // viewports (e.g. a 13" MacBook) instead of needlessly shrinking.
        const PAD = 40;
        function fit() {
          if (view.hidden) return;
          let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
          cards.forEach(c => {
            const halfW = c.offsetWidth / 2;               // cards are translateX(-50%)
            minL = Math.min(minL, c.offsetLeft - halfW);
            maxR = Math.max(maxR, c.offsetLeft + halfW);
            minT = Math.min(minT, c.offsetTop);
            maxB = Math.max(maxB, c.offsetTop + c.offsetHeight);
          });
          const cw = (maxR - minL) || 1440;                // card bounding box (≈1058×681)
          const ch = (maxB - minT) || 1088;
          let s = Math.min(1, (window.innerWidth - PAD) / cw, (window.innerHeight - PAD) / ch);
          if (s < 0.1) s = 0.1;
          stage.style.setProperty('--ff-fit', s.toFixed(4));
        }

        // closed-state offset: pull every card's centre to the EXACT stage centre with
        // no jitter or rotation, so the cards land in one perfectly-aligned pile — only
        // the top card is visible until they spread out into the grid.
        function layout() {
          const scx = stage.offsetWidth  / 2;
          const scy = stage.offsetHeight / 2;
          cards.forEach((c) => {
            const gcx = c.offsetLeft;                    // grid centre-x (card is translateX(-50%))
            const gcy = c.offsetTop + c.offsetHeight / 2; // grid centre-y
            c.style.setProperty('--dx', (scx - gcx).toFixed(1) + 'px');
            c.style.setProperty('--dy', (scy - gcy).toFixed(1) + 'px');
            c.style.setProperty('--rot', '0deg');
          });
        }

        // smoothstep — ease-in-out from a→b
        function smooth(x, a, b) {
          let t = (x - a) / (b - a);
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          return t * t * (3 - 2 * t);
        }

        let raf = 0;
        let lastOpen = null;                            // skip identical writes (no repaint)
        let flowTop = 0;                                // doc-Y where the section pins (top:0)
        function update() {
          raf = 0;
          if (view.hidden) return;
          let open;
          if (reduce.matches) {
            open = 1;                                   // no motion → show the grid outright
          } else {
            const rect = section.getBoundingClientRect();
            if (rect.top > 0.5) flowTop = window.scrollY + rect.top;  // capture before it pins
            else if (!flowTop) flowTop = section.offsetTop;          // fallback if we start pinned
            const vh = window.innerHeight || 1;
            // Long, gentle spread runway measured in scroll distance (not the short
            // reveal window): begin when the section is ~70% risen and finish partway
            // into the pinned hold — so most of the fan-out plays over a static, pinned
            // background rather than while the whole section is still travelling up.
            const start = flowTop - vh * 0.30;
            const end   = flowTop + vh * 0.70;
            let p = (window.scrollY - start) / (end - start);
            p = p < 0 ? 0 : p > 1 ? 1 : p;
            open = smooth(p, 0, 1);                      // eased across the full runway
          }
          const o = open.toFixed(4);
          if (o !== lastOpen) { stage.style.setProperty('--ff-open', o); lastOpen = o; }
        }
        function onScroll() { Scroll.kick(); }
        Scroll.add(update);
        window.addEventListener('resize', () => { fit(); layout(); onScroll(); }, { passive: true });
        window.addEventListener('orientationchange', () => { fit(); layout(); onScroll(); });
        window.addEventListener('hashchange', () => requestAnimationFrame(() => { fit(); layout(); update(); }));
        window.addEventListener('about:measure', () => { fit(); layout(); update(); });
        if (reduce.addEventListener) reduce.addEventListener('change', update);
        fit();
        layout();
        update();
      })();

      // ── gully card: sweep the playback track 0:00 → end on hover ──
      (function initGullyPlayback() {
        const card = document.querySelector('#about-view .ff-gully');
        if (!card) return;
        const fill = card.querySelector('.ff-gully-bar span');
        const times = card.querySelectorAll('.ff-gully-time span');
        const cur = times[0], rem = times[1];
        if (!fill || !cur || !rem) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

        const TOTAL = 133;    // 2:13 track length
        const DUR   = 1500;   // ms to sweep the whole bar — brisk, ~1.5s
        const HOLD  = 550;    // ms to rest at the end before rewinding to 0:00
        const fmt = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); };

        function set(p) {
          fill.style.width = (p * 100) + '%';
          cur.textContent = fmt(p * TOTAL);
          rem.textContent = '-' + fmt(TOTAL - p * TOTAL);
        }
        const rewind = () => set(0);       // default = 0:00, empty bar

        // Once triggered the sweep always runs to completion — it is NOT tied to how long
        // the pointer stays, so a quick flick still plays the track all the way through.
        let raf = 0, startT = 0, playing = false;
        function frame(t) {
          if (!startT) startT = t;
          const p = Math.min(1, (t - startT) / DUR);
          set(p);
          if (p < 1) { raf = requestAnimationFrame(frame); }
          else { playing = false; setTimeout(rewind, HOLD); }   // hold at end, then rewind
        }
        card.addEventListener('mouseenter', () => {
          if (reduce.matches || playing) return;                // ignore re-entry mid-play
          playing = true; startT = 0; set(0);
          raf = requestAnimationFrame(frame);
        });
      })();

      // ── draggable polaroids — pick up & move each photo one by one ──
      (function initPolaroidDrag() {
        const stage = document.querySelector('#about-view .ai-photos');
        if (!stage) return;
        const cards = Array.from(stage.querySelectorAll('.ai-polaroid'));
        const resetBtn = stage.querySelector('.ai-photos-reset');
        // base z-index per card so front tile stays front until picked up
        const baseZ = new Map(cards.map(c => [c, parseInt(getComputedStyle(c).zIndex, 10) || 1]));
        let topZ = Math.max(...baseZ.values());
        const pos = new Map(cards.map(c => [c, { x: 0, y: 0 }]));

        // invisible bounding box: how far past the photo stage a tile may roam (px)
        const BOUND = { left: 130, right: 130, top: 80, bottom: 120 };
        // render a tile's translate + a scale (used for the pickup/drop bounce)
        function paint(card, x, y, scale) {
          card.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        }
        // clamp a proposed offset so the tile's box stays inside the bounding box
        function clampToBox(card, x, y) {
          const w = stage.clientWidth, h = stage.clientHeight;
          const minX = -BOUND.left - card.offsetLeft;
          const maxX = w + BOUND.right - card.offsetLeft - card.offsetWidth;
          const minY = -BOUND.top - card.offsetTop;
          const maxY = h + BOUND.bottom - card.offsetTop - card.offsetHeight;
          return {
            x: Math.min(Math.max(x, Math.min(minX, maxX)), Math.max(minX, maxX)),
            y: Math.min(Math.max(y, Math.min(minY, maxY)), Math.max(minY, maxY)),
          };
        }

        cards.forEach(card => {
          let startX = 0, startY = 0, originX = 0, originY = 0, dragging = false, pid = null;

          card.addEventListener('pointerdown', e => {
            if (e.button != null && e.button !== 0) return;
            dragging = true;
            pid = e.pointerId;
            const p = pos.get(card);
            originX = p.x; originY = p.y;
            startX = e.clientX; startY = e.clientY;
            card.classList.remove('is-settling', 'is-dropping');
            card.classList.add('is-dragging');
            card.style.zIndex = ++topZ;          // bring picked tile to the front
            paint(card, p.x, p.y, 1.04);         // subtle "lift" pop on pickup
            card.setPointerCapture(pid);
            stage.classList.add('has-moved');    // reveal the reset button
            e.preventDefault();
          });

          card.addEventListener('pointermove', e => {
            if (!dragging || e.pointerId !== pid) return;
            // the hero frame may be scaled to fit the viewport — convert the
            // screen-space cursor delta into the stage's local coordinate space
            const s = stage.getBoundingClientRect().width / (stage.offsetWidth || 1) || 1;
            const { x, y } = clampToBox(card, originX + (e.clientX - startX) / s, originY + (e.clientY - startY) / s);
            pos.set(card, { x, y });
            paint(card, x, y, 1.04);             // hold the lift while dragging
          });

          function end(e) {
            if (!dragging || (e && e.pointerId !== pid)) return;
            dragging = false;
            card.classList.remove('is-dragging');
            card.classList.add('is-dropping');   // spring the scale back → subtle bounce
            const p = pos.get(card);
            paint(card, p.x, p.y, 1);
            card.addEventListener('transitionend', function done() {
              card.classList.remove('is-dropping');
              card.removeEventListener('transitionend', done);
            }, { once: true });
            if (pid != null && card.hasPointerCapture(pid)) card.releasePointerCapture(pid);
            pid = null;
          }
          card.addEventListener('pointerup', end);
          card.addEventListener('pointercancel', end);
        });

        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            // glide every tile home — but KEEP the current stacking order the
            // user arranged, so the front photo never swaps on reset.
            cards.forEach(card => {
              card.classList.remove('is-dropping');
              card.classList.add('is-settling');
              paint(card, 0, 0, 1);              // smooth glide home
              pos.set(card, { x: 0, y: 0 });
            });
            stage.classList.remove('has-moved');
            // drop the transition class once the glide finishes (pointerdown
            // also clears it, so a lingering class can't lag a fresh drag)
            setTimeout(() => {
              cards.forEach(card => card.classList.remove('is-settling'));
            }, 760);
          });
        }
      })();
    })();
