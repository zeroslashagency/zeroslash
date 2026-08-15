/* ROUTER — path shim (/about <-> #about) — extracted from <head> */
/* ── path router shim ── real URLs (/about, /work/hatcha …) drive the same
       hash-token router the site shipped with: token() maps the current path back
       to its legacy '#token', go() pushes the new path and re-fires 'hashchange'
       so every existing listener (curtain, hero morph, decks, nav contrast)
       keeps working unchanged. In-page anchors (#work, #contact) stay real hashes. */
    window.route = (function () {
      var P2H = { '/about': '#about', '/playground': '#playground',
                  '/work/hatcha': '#hatcha', '/work/fireflut': '#fireflut',
                  '/work/existence': '#existence', '/work/jumpable': '#jumpable' };
      var H2P = {}; Object.keys(P2H).forEach(function (p) { H2P[P2H[p]] = p; });
      function token() {
        var p = location.pathname.replace(/\/+$/, '') || '/';
        return P2H[p] || location.hash;
      }
      function fire() { window.dispatchEvent(new HashChangeEvent('hashchange')); }
      function go(t) { history.pushState(null, '', H2P[t] || ('/' + t)); fire(); }
      window.addEventListener('popstate', fire);
      return { token: token, go: go, P2H: P2H, H2P: H2P };
    })();
    /* legacy '#hatcha'-style deep links → their real paths. The fragment never
       reaches the server, so this must run client-side — and before the router's
       parse-time route apply, hence its place in <head>. */
    (function () {
      var p = window.route.H2P[location.hash];
      if (p) history.replaceState(null, '', p);
    })();

// Asset base for offline: work pages need ../ prefix
window.ASSET_BASE = location.pathname.indexOf('/work/') !== -1 ? '../' : '';
