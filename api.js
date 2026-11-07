window.API = (function () {
  var cfg = window.A4P_CONFIG || {};
  var sb = null;
  var LET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  function cl() {
    if (!sb) { sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }
    return sb;
  }
  function ok(r) {
    if (r.error) { throw new Error(r.error.message); }
    return r.data;
  }
  function genCode() {
    var s = "";
    for (var i = 0; i < 4; i++) { s += LET.charAt(Math.floor(Math.random() * LET.length)); }
    return s;
  }
  function tryCreate(title, n) {
    return cl().from("games").insert({ code: genCode(), title: title }).select().single().then(function (r) {
      if (r.error) {
        if (r.error.code === "23505" && n < 6) { return tryCreate(title, n + 1); }
        throw new Error(r.error.message);
      }
      return r.data;
    });
  }
  return {
    configured: function () { return !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase); },
    join: function (code, name, avatar) {
      return cl().rpc("join_game", { p_code: code, p_name: name, p_avatar: avatar }).then(ok);
    },
    save: function (token, me) {
      return cl().rpc("player_save", {
        p_token: token, p_pos: me.pos, p_score: me.score, p_step: me.step,
        p_last_round: me.last_round, p_state: me.state
      }).then(ok);
    },
    pub: function (code, token) {
      return cl().rpc("game_public", { p_code: code, p_token: token || null }).then(ok);
    },
    login: function (email, pw) {
      return cl().auth.signInWithPassword({ email: email, password: pw }).then(function (r) {
        if (r.error) {
          if (/invalid/i.test(r.error.message)) { throw new Error("E-mail ou mot de passe incorrect."); }
          throw new Error(r.error.message);
        }
        return r.data;
      });
    },
    session: function () {
      return cl().auth.getSession().then(function (r) { return r.data ? r.data.session : null; });
    },
    logout: function () { return cl().auth.signOut(); },
    myGames: function () {
      return cl().from("games").select("*").order("created_at", { ascending: false }).then(ok);
    },
    createGame: function (title) { return tryCreate(title, 0); },
    getGame: function (id) { return cl().from("games").select("*").eq("id", id).single().then(ok); },
    players: function (gid) {
      return cl().from("players")
        .select("id,name,avatar,pos,score,bonus,step,last_round,state")
        .eq("game_id", gid).order("joined_at", { ascending: true }).then(ok);
    },
    setGame: function (id, patch) { return cl().from("games").update(patch).eq("id", id).then(ok); },
    validate: function (pid, okv) {
      return cl().rpc("coach_validate", { p_player: pid, p_ok: okv }).then(ok);
    },
    delGame: function (id) { return cl().from("games").delete().eq("id", id).then(ok); }
  };
})();
