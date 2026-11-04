package io.github.schumey.mydiet

/**
 * JavaScript that runs inside the Home Assistant page of the WebView.
 *
 * The HA frontend keeps its login in localStorage ("hassTokens"). With that token the script asks the Supervisor over the
 * HA WebSocket for an ingress session (needs an administrator), sets the ingress_session cookie exactly like the HA
 * frontend does, reads the add-on's ingress URL and hands it to the app (Bridge.ingress), which then opens the add-on
 * full screen without the HA sidebar. An empty string means "could not do it" (not logged in yet, no admin rights, ...).
 */
object Ingress {
    const val BRIDGE = "Bridge"
    const val PATH_PREFIX = "/api/hassio_ingress/"

    fun script(slug: String): String = """
(function () {
  if (window.__mdaBoot) return;
  window.__mdaBoot = true;
  var slug = ${jsString(slug)};
  var tries = 0;
  function done(u) { window.__mdaBoot = false; $BRIDGE.ingress(u || ""); }
  function wait() {
    var t = null;
    try { t = JSON.parse(localStorage.getItem('hassTokens') || 'null'); } catch (e) {}
    if (!t || !t.access_token) {          // still logging in: the frontend writes the token a moment after the page loads
      if (++tries > 40) return done("");
      return setTimeout(wait, 500);
    }
    attempt(t);
  }
  function attempt(t) {
    var ws, finished = false;
    var timer = setTimeout(function () { fin(""); }, 15000);
    function fin(u) {
      if (finished) return; finished = true; clearTimeout(timer);
      try { ws.close(); } catch (e) {}
      done(u);
    }
    try { ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/api/websocket'); }
    catch (e) { return fin(""); }
    ws.onerror = function () { fin(""); };
    ws.onmessage = function (ev) {
      var m = JSON.parse(ev.data);
      if (m.type === 'auth_required') {
        ws.send(JSON.stringify({ type: 'auth', access_token: t.access_token }));
      } else if (m.type === 'auth_invalid') {   // token expired: the frontend renews it, try again shortly
        finished = true; clearTimeout(timer); try { ws.close(); } catch (e) {}
        if (++tries > 40) return done("");
        setTimeout(wait, 1500);
      } else if (m.type === 'auth_ok') {
        ws.send(JSON.stringify({ id: 1, type: 'supervisor/api', endpoint: '/ingress/session', method: 'post' }));
      } else if (m.type === 'result' && m.id === 1) {
        if (!m.success) return fin("");
        document.cookie = 'ingress_session=' + m.result.session + ';path=$PATH_PREFIX;SameSite=Strict';
        ws.send(JSON.stringify({ id: 2, type: 'supervisor/api', endpoint: '/addons/' + slug + '/info', method: 'get' }));
      } else if (m.type === 'result' && m.id === 2) {
        fin(m.success && m.result ? (m.result.ingress_url || "") : "");
      }
    };
  }
  wait();
})();
"""

    private fun jsString(s: String): String =
        "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "") + "\""
}
