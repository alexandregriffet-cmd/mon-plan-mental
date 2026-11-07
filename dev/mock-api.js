// Faux serveur local pour tester le jeu sans Supabase (ouvrir index.html?mock=1).
// Les donnees sont partagees entre onglets via localStorage. Ne sert qu'aux tests.
(function () {
  var K = "a4p_mock_db";
  var LET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  function load() {
    try { return JSON.parse(localStorage.getItem(K)) || { games: [], players: [] }; }
    catch (e) { return { games: [], players: [] }; }
  }
  function store(d) { localStorage.setItem(K, JSON.stringify(d)); }
  function uid() { return "x" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  function P(v) { return Promise.resolve(JSON.parse(JSON.stringify(v === undefined ? null : v))); }
  function F(m) { return Promise.reject(new Error(m)); }
  function gameByCode(d, c) { for (var i = 0; i < d.games.length; i++) { if (d.games[i].code === c) { return d.games[i]; } } return null; }
  function gameById(d, id) { for (var i = 0; i < d.games.length; i++) { if (d.games[i].id === id) { return d.games[i]; } } return null; }
  function plById(d, id) { for (var i = 0; i < d.players.length; i++) { if (d.players[i].id === id) { return d.players[i]; } } return null; }
  function plByToken(d, t) { for (var i = 0; i < d.players.length; i++) { if (d.players[i].token === t) { return d.players[i]; } } return null; }
  function code4() { var s = ""; for (var i = 0; i < 4; i++) { s += LET.charAt(Math.floor(Math.random() * LET.length)); } return s; }
  window.API_MOCK = {
    configured: function () { return true; },
    join: function (code, name, avatar) {
      var d = load(); var g = gameByCode(d, String(code).toUpperCase());
      if (!g) { return F("Code inconnu"); }
      if (g.status === "finished") { return F("Cette partie est terminée"); }
      var p = { id: uid(), game_id: g.id, token: uid(), name: name.slice(0, 20), avatar: avatar, pos: 0, score: 0, bonus: 0, step: "setup", last_round: 0, state: {}, joined_at: Date.now() };
      d.players.push(p); store(d);
      return P({ token: p.token, player_id: p.id, code: g.code });
    },
    save: function (token, me) {
      var d = load(); var p = plByToken(d, token);
      if (!p) { return P(null); }
      if (p.step === "done" && me.step === "validate") { return P(null); }
      p.pos = Math.max(0, Math.min(me.pos, 20)); p.score = Math.max(0, me.score);
      p.step = me.step; p.last_round = me.last_round; p.state = me.state; store(d);
      return P(null);
    },
    pub: function (code, token) {
      var d = load(); var g = gameByCode(d, String(code).toUpperCase());
      if (!g) { return P(null); }
      var me = null; var list = [];
      for (var i = 0; i < d.players.length; i++) {
        var p = d.players[i];
        if (p.game_id !== g.id) { continue; }
        list.push({ id: p.id, name: p.name, avatar: p.avatar, pos: p.pos, total: p.score + p.bonus, step: p.step });
        if (token && p.token === token) { me = { id: p.id, name: p.name, avatar: p.avatar, pos: p.pos, score: p.score, bonus: p.bonus, step: p.step, last_round: p.last_round, state: p.state }; }
      }
      return P({ game: { id: g.id, code: g.code, title: g.title, status: g.status, round: g.round }, players: list, me: me });
    },
    login: function (email, pw) {
      if (!email || !pw) { return F("E-mail ou mot de passe incorrect."); }
      localStorage.setItem("a4p_mock_coach", email); return P({ user: { email: email } });
    },
    session: function () { var c = localStorage.getItem("a4p_mock_coach"); return P(c ? { user: { email: c } } : null); },
    logout: function () { localStorage.removeItem("a4p_mock_coach"); return P(null); },
    myGames: function () { var d = load(); return P(d.games.slice().reverse()); },
    createGame: function (title) {
      var d = load(); var c = code4();
      while (gameByCode(d, c)) { c = code4(); }
      var g = { id: uid(), code: c, title: title, status: "lobby", round: 0, created_at: Date.now() };
      d.games.push(g); store(d); return P(g);
    },
    getGame: function (id) { var d = load(); return P(gameById(d, id)); },
    players: function (gid) {
      var d = load(); var out = [];
      for (var i = 0; i < d.players.length; i++) { if (d.players[i].game_id === gid) { out.push(d.players[i]); } }
      return P(out);
    },
    setGame: function (id, patch) {
      var d = load(); var g = gameById(d, id);
      for (var k in patch) { if (patch.hasOwnProperty(k)) { g[k] = patch[k]; } }
      store(d); return P(null);
    },
    validate: function (pid, ok) {
      var d = load(); var p = plById(d, pid);
      if (p && p.step === "validate") { p.step = ok ? "done" : "challenge"; if (ok) { p.bonus += 20; } store(d); }
      return P(null);
    },
    delGame: function (id) {
      var d = load();
      d.games = d.games.filter(function (g) { return g.id !== id; });
      d.players = d.players.filter(function (p) { return p.game_id !== id; });
      store(d); return P(null);
    }
  };
})();
