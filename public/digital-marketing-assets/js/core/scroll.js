/* SCROLL SCHEDULER — single rAF + cache */
/* ── one scroll scheduler + a per-frame layout-read cache ──────────────────
       Every scroll-driven module used to own a scroll listener and its own rAF
       gate: 18 listeners, ~14 rAF callbacks and ~18 layout reads per frame. Each
       module read rects and then wrote styles — and a write dirties layout, so the
       NEXT module's read forced a full synchronous relayout. That was ~8 forced
       reflows a frame on a 3000-element document, which is what made scrolling
       feel heavy (the visuals — card blur, section filters, the willow sway —
       measured as free by comparison).

       Now there is ONE listener and ONE rAF. Every layout read goes through
       Scroll.rect() / .y() / .vh(), which serve values captured once at the top of
       the frame, before any subscriber runs. The frame prefetches whatever rects
       the previous frame asked for (that set is stable while scrolling), so reads
       are cache hits and a subscriber's write can no longer force anything.

       Subscribe with Scroll.add(fn). Inside fn, never touch live layout
       (getBoundingClientRect / offsetTop / innerHeight) — use the helpers, or the
       whole point is lost. Scroll.kick() re-runs a frame after a layout change. */
    (function () {
      var subs = [], reads = [], queued = false;
      var cache = new Map(), want = new Set(), prev = new Set();
      var _y = 0, _vh = 0, _vw = 0;

      function frame() {
        queued = false;
        /* ── READ PHASE — no subscriber has run yet, so nothing is dirty ── */
        _y = window.scrollY || window.pageYOffset || 0;
        _vh = window.innerHeight;
        _vw = window.innerWidth;
        cache.clear();
        prev.forEach(function (el) {
          if (el.isConnected) cache.set(el, el.getBoundingClientRect());
        });
        want = new Set();
        /* read-phase subscribers: layout queries that MUST run against a clean
           tree (hit-tests etc.) go here, before any write can dirty it */
        for (var i = 0; i < reads.length; i++) {
          try { reads[i](); } catch (e) { /* one broken module must not stall the rest */ }
        }
        /* ── WRITE PHASE ── */
        for (var i = 0; i < subs.length; i++) {
          try { subs[i](); } catch (e) { /* one broken module must not stall the rest */ }
        }
        prev = want;   // prefetch list for the next frame
      }
      function schedule() { if (!queued) { queued = true; requestAnimationFrame(frame); } }

      window.Scroll = {
        add: function (fn) { subs.push(fn); schedule(); return fn; },
        addRead: function (fn) { reads.push(fn); schedule(); return fn; },
        /* Cached rect. A miss — first frame, or an element this module hasn't read
           before — falls back to a live read and joins the prefetch list, so it's a
           hit from the next frame on. */
        rect: function (el) {
          var r = cache.get(el);
          if (!r) { r = el.getBoundingClientRect(); cache.set(el, r); }
          want.add(el);
          return r;
        },
        y:  function () { return _y; },
        vh: function () { return _vh || window.innerHeight; },
        vw: function () { return _vw || window.innerWidth; },
        kick: schedule,
      };
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', schedule, { passive: true });
      addEventListener('load', schedule);
    })();
