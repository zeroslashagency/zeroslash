/* MOBILE GATE — cs-static gate */
/* mobile gate: ≤820px at load renders case studies as a plain vertical
       scroll — the cover-slide deck IIFEs bail on html.cs-static, same
       pattern as their prefers-reduced-motion bail. Decided once at load so
       the class-scoped mobile CSS and the JS can never disagree mid-session
       (a phone rotating past 820px keeps the static layout it booted with). */
    (function () {
      /* innerWidth can read 0 in embedded/prerender contexts before the first
         layout — fall back to clientWidth, then the physical screen, so a
         desktop never boots into the static layout by accident. */
      var w = window.innerWidth || document.documentElement.clientWidth || screen.width;
      if (w && w <= 820) document.documentElement.classList.add('cs-static');
    })();
