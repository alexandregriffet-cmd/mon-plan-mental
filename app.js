/* Mon Plan Mental, mode club (joueurs et coach) */
var KEY = "a4p_club_player";
var TRACK = Board.TRACK;
var AVATARS = ["#FFBD59", "#4FC3C7", "#5B9BFF", "#FF7A6B", "#A98BFF", "#5fd18a", "#F5D76E", "#FF9F43"];
var SHORT = { act: "Activation", att: "Attention", reg: "Régulation", con: "Confiance", mot: "Motivation", cnc: "Concentration", res: "Résilience", lea: "Leadership" };
var STEP_LBL = {
  setup: "Prépare son profil", wait: "En attente", roll: "Lance le dé",
  scenario: "Mise en situation", cards: "Choisit sa carte", challenge: "Fait son défi",
  validate: "Attend ta validation", done: "Défi validé"
};
var api = window.API_MOCK || window.API;
var APP = document.getElementById("app");
var VIEW = "entry";
var SUB = "";
var G = null;
var PL = [];
var ME = null;
var TOKEN = "";
var lastSig = "";
var timer = null;
var AV = 0;
var C = { view: "login", games: [], game: null, players: [], sig: "" };

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
function dimOf(id) { for (var i = 0; i < DIMS.length; i++) { if (DIMS[i].id === id) { return DIMS[i]; } } return null; }
function cardOf(id) { for (var i = 0; i < CARDS.length; i++) { if (CARDS[i].id === id) { return CARDS[i]; } } return null; }
function initial(n) { return String(n || "?").trim().charAt(0).toUpperCase() || "?"; }
function colorOf(p) {
  var c = p && p.avatar;
  if (c && String(c).charAt(0) === "#") { return c; }
  var h = 0, s = String((p && p.name) || "");
  for (var i = 0; i < s.length; i++) { h = (h + s.charCodeAt(i)) % AVATARS.length; }
  return AVATARS[h];
}
function dot(p) {
  return '<span class="dot" style="background:' + colorOf(p) + '">' + esc(initial(p.name)) + "</span>";
}
function sig() { return '<div class="sig">Une architecture mentale. Pas une béquille émotionnelle.</div>'; }
function setErr(m) {
  var e = document.getElementById("er");
  if (e) { e.textContent = m || ""; e.style.display = m ? "block" : "none"; }
}
function stopPoll() { if (timer) { clearInterval(timer); timer = null; } }
function startPoll(fn, ms) { stopPoll(); timer = setInterval(fn, ms); }
function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

/* ---------- Etat du joueur ---------- */
function freshState() {
  var sc = {}, sn = {};
  for (var k = 0; k < DIMS.length; k++) { sc[DIMS[k].id] = 50; sn[DIMS[k].id] = false; }
  return { sub: "pmp", sc: sc, cmp: -1, pro: -1, emo: -1, box: [], seen: sn, cur: null, toast: "", redo: false };
}
function ST() { return ME.state; }
function adoptMe(m) {
  ME = m;
  if (!ME.state || !ME.state.sc) { ME.state = freshState(); }
}
function saveMe() {
  api.save(TOKEN, ME).catch(function () {});
}
function total() { return ME.score + ME.bonus; }

/* ---------- Rendu principal ---------- */
function render() {
  var v = "";
  if (VIEW === "player" && ME && G) { v = vPlayer(); lastSig = pSig(); }
  else if (VIEW === "coach") { v = vCoach(); }
  else { v = vEntry(); }
  APP.innerHTML = v;
  animatePawns();
}
function go() { render(); window.scrollTo(0, 0); }

/* ---------- Entree ---------- */
function vEntry() {
  var h = '<div class="hero"><div class="kick">Performance · Plaisir · Succès</div><h1>Mon Plan Mental</h1></div>';
  h += "<p>Construis ton programme de préparation mentale à partir de tes résultats. Progresse avec méthode, avec plaisir.</p>";
  h += '<div class="err" id="er" style="display:none"></div>';
  if (!api.configured()) {
    h += '<div class="err" style="display:block">Le mode club n\'est pas encore configuré (fichier config.js).</div>';
  }
  h += '<div class="card"><h3>Rejoindre une séance</h3>';
  h += '<label>Code de la partie (4 lettres)</label>';
  h += '<input id="jc" type="text" maxlength="4" placeholder="ABCD" autocapitalize="characters" autocomplete="off" class="codein">';
  h += '<label>Ton prénom</label><input id="jn" type="text" maxlength="20" placeholder="Prénom" autocomplete="off">';
  h += '<label>Ton sport</label><input id="js" type="text" maxlength="24" placeholder="Rugby, foot, basket, tennis..." autocomplete="off">';
  h += '<label>Ta couleur</label><div class="avs">';
  for (var i = 0; i < AVATARS.length; i++) {
    h += '<span class="av' + (i === AV ? " on" : "") + '" id="av' + i + '" onclick="pickAv(' + i + ')" style="background:' + AVATARS[i] + '"></span>';
  }
  h += '</div><button class="btn" onclick="doJoin()">Rejoindre</button></div>';
  h += '<button class="btn ghost" onclick="goCoach()">Espace coach</button>';
  h += '<a class="btn ghost" href="solo.html" style="text-decoration:none">Jouer en solo</a>';
  return h + sig();
}
function pickAv(i) {
  AV = i;
  for (var k = 0; k < AVATARS.length; k++) {
    var e = document.getElementById("av" + k);
    if (e) { e.className = "av" + (k === i ? " on" : ""); }
  }
}
function doJoin() {
  var code = document.getElementById("jc").value.trim().toUpperCase();
  var name = document.getElementById("jn").value.trim();
  var sport = document.getElementById("js").value.trim();
  if (code.length !== 4) { setErr("Le code a 4 lettres."); return; }
  if (!name) { setErr("Entre ton prénom."); return; }
  setErr("");
  api.join(code, name, AVATARS[AV]).then(function (r) {
    lsSet(KEY, JSON.stringify({ code: r.code, token: r.token, sport: sport }));
    resume();
  }).catch(function (e) { setErr(e.message); });
}
function resume() {
  var raw = lsGet(KEY);
  if (!raw) { VIEW = "entry"; render(); return; }
  var s;
  try { s = JSON.parse(raw); } catch (e) { lsDel(KEY); VIEW = "entry"; render(); return; }
  TOKEN = s.token;
  api.pub(s.code, TOKEN).then(function (d) {
    if (!d || !d.me) { lsDel(KEY); VIEW = "entry"; render(); return; }
    G = d.game; PL = d.players; adoptMe(d.me);
    if (!ST().sport && s.sport) { ST().sport = s.sport; saveMe(); }
    VIEW = "player"; SUB = "";
    afterPoll(); go();
    startPoll(pPoll, 2000);
  }).catch(function () { VIEW = "entry"; render(); setErr("Connexion impossible, réessaie."); });
}
function leave() {
  if (!confirm("Quitter la partie ?")) { return; }
  stopPoll(); lsDel(KEY); ME = null; G = null; VIEW = "entry"; go();
}

/* ---------- Boucle de synchronisation joueur ---------- */
function pSig() {
  return ME.step + "|" + G.status + "|" + G.round + "|" + ME.bonus + "|" + SUB + "|" +
    (ME.step === "setup" ? "" : JSON.stringify(PL));
}
function pPoll() {
  if (!ME || !G) { return; }
  api.pub(G.code, TOKEN).then(function (d) {
    if (!d || !d.me) { return; }
    G = d.game; PL = d.players; ME.bonus = d.me.bonus;
    if (ME.step === "validate" && d.me.step === "done") {
      ME.step = "done"; ST().toast = "Défi validé par le coach ! +20 points";
    } else if (ME.step === "validate" && d.me.step === "challenge") {
      ME.step = "challenge"; ST().redo = true;
    }
    afterPoll();
    if (pSig() !== lastSig) { render(); }
  }).catch(function () {});
}
function afterPoll() {
  if (!ME || ME.step === "setup") { return; }
  if (G.status === "playing" && G.round > ME.last_round && (ME.step === "done" || ME.step === "wait")) {
    ME.last_round = G.round; ME.step = "roll"; ST().cur = null; ST().toast = "";
    saveMe();
  }
}

/* ---------- Vues joueur ---------- */
function vPlayer() {
  if (G.status === "finished") { return vPodium(); }
  if (SUB === "program") { return vProgram(); }
  var s = ME.step;
  if (s === "setup") { return vSetup(); }
  if (s === "roll") { return vRoll(); }
  if (s === "scenario") { return vScenario(); }
  if (s === "cards") { return vCards(); }
  if (s === "challenge") { return vChallenge(); }
  if (s === "validate") { return vValidate(); }
  return vWait();
}
function topbar() {
  var h = '<div class="top"><div><b>' + dot(ME) + " " + esc(ME.name) + '</b><div class="muted">Case ' + ME.pos + "/" + TRACK + " · " + total() + ' pts</div></div>';
  var r = G.status === "playing" ? "Tour " + G.round : (G.status === "lobby" ? "Salon" : "Fin");
  return h + '<div class="rank">' + r + "</div></div>";
}
function chips() {
  var s = ST(); var h = '<div class="chips">';
  if (s.pro >= 0) { h += '<span class="tag">' + PROS[s.pro].e + " " + PROS[s.pro].n + "</span>"; }
  if (s.emo >= 0) { h += '<span class="tag">' + EMOS[s.emo].e + " " + EMOS[s.emo].n + "</span>"; }
  if (s.cmp >= 0) { h += '<span class="tag" style="background:' + CMPS[s.cmp].c + '">Niveau ' + (s.cmp + 1) + " " + CMPS[s.cmp].n + "</span>"; }
  return h + "</div>";
}
var SHOWN = Board.shown;
function pawnHtml(p) {
  return '<div class="sh"></div><div class="pp"><span class="nm">' + esc(String(p.name).slice(0, 8)) + '</span>' + Board.athlete(colorOf(p), esc(initial(p.name)), p.sport || (ME && p.id === ME.id && ST() ? ST().sport : "")) + "</div>";
}
function board3d(list, meId) { return Board.html(list, meId, pawnHtml, Board.shown); }
function boardHtml() { return board3d(plist(), ME ? ME.id : ""); }
function animatePawns() { Board.animate(APP); }
function plist() {
  var list = [];
  for (var i = 0; i < PL.length; i++) {
    var p = PL[i];
    if (ME && p.id === ME.id) { list.push({ id: p.id, name: ME.name, avatar: ME.avatar, pos: ME.pos, total: total(), sport: ST().sport || "" }); }
    else { list.push({ id: p.id, name: p.name, avatar: p.avatar, pos: p.pos, total: p.total, sport: p.sport || "" }); }
  }
  return list;
}
function ranking(list) {
  return list.slice().sort(function (a, b) {
    if (b.pos !== a.pos) { return b.pos - a.pos; }
    return b.total - a.total;
  });
}
function leaderboard() {
  var list = [];
  for (var i = 0; i < PL.length; i++) {
    var p = PL[i];
    if (ME && p.id === ME.id) { list.push({ id: p.id, name: ME.name, avatar: ME.avatar, pos: ME.pos, total: total() }); }
    else { list.push(p); }
  }
  var rk = ranking(list);
  var h = '<div class="card"><h3>Classement</h3>';
  for (var j = 0; j < rk.length; j++) {
    h += '<div class="lb' + (ME && rk[j].id === ME.id ? " me" : "") + '"><span>' + (j + 1) + ". " + dot(rk[j]) + " " + esc(rk[j].name) + "</span><span>Case " + rk[j].pos + " · " + rk[j].total + " pts</span></div>";
  }
  return h + "</div>";
}

/* Etapes de preparation du profil */
function vSetup() {
  var s = ST();
  var h = topbar();
  if (s.sub === "pmp") {
    h += '<div class="steps">ÉTAPE 1 SUR 4 · MON PMP</div><h2>Tes scores du Profil Mental de Performance</h2>';
    h += '<p class="muted">Règle chaque curseur sur ton score (0 à 100). Pas encore passé le test ? Laisse 50, ou estime-toi honnêtement.</p><div class="card">';
    for (var i = 0; i < DIMS.length; i++) {
      var d = DIMS[i];
      h += '<div class="sl"><span>' + d.e + " " + d.n + '</span><b id="v_' + d.id + '">' + s.sc[d.id] + "</b></div>";
      h += '<input type="range" min="0" max="100" value="' + s.sc[d.id] + '" oninput="setP(\'' + d.id + '\',this.value)">';
    }
    return h + '</div><button class="btn" onclick="setSub(\'cmp\')">Suivant</button>';
  }
  if (s.sub === "cmp") {
    h += '<div class="steps">ÉTAPE 2 SUR 4 · MON CMP</div><h2>Ton niveau de compétences mentales</h2><p class="muted">Choisis le niveau de ton résultat CMP.</p>';
    for (var a = 0; a < CMPS.length; a++) {
      var c = CMPS[a];
      h += '<div class="card pc" style="border-left:6px solid ' + c.c + '" onclick="setCmp(' + a + ')"><h3>Niveau ' + (a + 1) + " · " + c.n + '</h3><p class="muted" style="margin:0">' + c.t + "</p></div>";
    }
    return h;
  }
  if (s.sub === "pro") {
    h += '<div class="steps">ÉTAPE 3 SUR 4 · MON PROFIL</div><h2>Quel profil de personnalité est le tien ?</h2><p class="muted">Celui de ton résultat, ou celui qui te ressemble le plus profondément.</p>';
    for (var b = 0; b < PROS.length; b++) {
      h += '<div class="card pc" onclick="setPro(' + b + ')"><h3>' + PROS[b].e + " " + PROS[b].n + '</h3><p class="muted" style="margin:0">' + PROS[b].t + "</p></div>";
    }
    return h;
  }
  h += '<div class="steps">ÉTAPE 4 SUR 4 · MON TYPE ÉMOTIONNEL</div><h2>Quel est ton type émotionnel ?</h2><p class="muted">Celui de ton diagnostic Psycho-émotionnel.</p>';
  for (var e = 0; e < EMOS.length; e++) {
    h += '<div class="card pc" onclick="setEmo(' + e + ')"><h3>' + EMOS[e].e + " " + EMOS[e].n + '</h3><p class="muted" style="margin:0">' + EMOS[e].t + "</p></div>";
  }
  return h;
}
function setP(id, v) {
  ST().sc[id] = parseInt(v, 10);
  var e = document.getElementById("v_" + id);
  if (e) { e.innerHTML = v; }
}
function setSub(s) { ST().sub = s; saveMe(); go(); }
function setCmp(i) { ST().cmp = i; setSub("pro"); }
function setPro(i) { ST().pro = i; setSub("emo"); }
function setEmo(i) {
  ST().emo = i; ST().sub = "done"; ME.step = "wait";
  saveMe(); afterPoll(); go();
}

function vWait() {
  var h = topbar() + chips();
  if (ST().toast) { h += '<div class="toast">' + esc(ST().toast) + "</div>"; }
  if (G.status === "lobby") {
    h += "<h2>Tu es dans la partie</h2><p>Le coach va lancer le premier tour. Garde ton téléphone ouvert.</p>";
  } else {
    h += "<h2>Tour terminé</h2><p>Prends le temps de souffler. Le coach lance le tour suivant.</p>";
  }
  h += boardHtml() + leaderboard();
  if (ST().box.length > 0) { h += '<button class="btn ghost" onclick="showProg()">Mon programme (' + ST().box.length + " outils)</button>"; }
  h += '<p style="text-align:center;margin-top:18px"><a href="#" class="muted" onclick="leave();return false">Quitter la partie</a></p>';
  return h + sig();
}
function showProg() { SUB = "program"; go(); }
function hideProg() { SUB = ""; go(); }

function vRoll() {
  var cur = ST().cur;
  var h = topbar();
  if (!cur || !cur.roll) {
    h += "<h2>Tour " + G.round + "</h2><p>Lance le dé pour avancer sur le plateau.</p>" + boardHtml();
    return h + '<button class="btn" onclick="rollDice()">Lancer le dé</button>';
  }
  var d = dimOf(cur.dim);
  h += '<div class="die">' + cur.roll + "</div><h2>Tu avances de " + cur.roll + (cur.roll > 1 ? " cases" : " case") + "</h2>";
  h += '<p>Tu arrives case ' + ME.pos + ' : <b style="color:' + d.c + '">' + d.n + "</b></p>" + boardHtml();
  return h + '<button class="btn" onclick="toScenario()">Voir la mise en situation</button>';
}
function rollDice() {
  var d = 1 + Math.floor(Math.random() * Board.DIE);
  ME.pos = Board.clampMove(ME.pos, d);
  var dim = DIMS[(Math.max(ME.pos, 1) - 1) % 8].id;
  ST().cur = { roll: d, dim: dim, picked: -1, cards: [], card: "", moved: false };
  saveMe(); go();
}
function toScenario() { ME.step = "scenario"; saveMe(); go(); }

function vScenario() {
  var cur = ST().cur;
  if (cur.q) { return vQuestion(); }
  var d = dimOf(cur.dim);
  var sc = SCN[cur.dim];
  var h = topbar() + '<span class="tag" style="background:' + d.c + '">' + d.e + " " + d.n + "</span>";
  h += '<h2 style="margin-top:12px">Mise en situation</h2><p style="font-size:18px">' + sc.q + "</p>";
  for (var i = 0; i < sc.o.length; i++) {
    var cls = "opt";
    if (cur.picked >= 0) { cls += (sc.o[i][1] >= 8) ? " good" : (cur.picked === i ? " bad" : " dim"); }
    h += '<button class="' + cls + '" onclick="answer(' + i + ')">' + sc.o[i][0] + "</button>";
  }
  if (cur.picked >= 0) {
    var o = sc.o[cur.picked];
    h += '<div class="banner ' + (o[1] >= 8 ? "good" : "meh") + '">' + (o[1] >= 8 ? "Lecture juste" : "À retenir") + '</div>';
    h += '<div class="card"><p style="margin:0">' + o[3] + '</p><p class="muted" style="margin:6px 0 0">+' + o[2] + " points" + (cur.moved ? " · +1 case" : "") + "</p></div>";
    h += '<button class="btn" onclick="toQuestion()">La question du coach</button>';
  }
  return h;
}
function answer(k) {
  var cur = ST().cur;
  if (cur.picked >= 0) { return; }
  var o = SCN[cur.dim].o[k];
  cur.picked = k;
  ME.score += o[2];
  ST().sc[cur.dim] = Math.min(100, ST().sc[cur.dim] + o[1]);
  if (o[1] >= 8) { ME.pos = Board.clampMove(ME.pos, 1); cur.moved = true; }
  saveMe(); go();
}
/* Question ouverte du coach (coach.js), une par case, liée à la dimension de la case */
function modFor(dim) {
  for (var i = 0; i < MODS.length; i++) { if (MODS[i].d === dim) { return i; } }
  return 0;
}
function coachQ() {
  var cur = ST().cur, m = modFor(cur.dim), qs = MODS[m].qs, ans = ST().ans || [], i, k, asked;
  for (i = 0; i < qs.length; i++) {
    asked = false;
    for (k = 0; k < ans.length; k++) { if (ans[k].q === qs[i][0]) { asked = true; } }
    if (!asked) { return { m: m, q: qs[i] }; }
  }
  return { m: m, q: qs[(ME.pos || 0) % qs.length] };
}
function toQuestion() { ST().cur.q = true; saveMe(); go(); }
function vQuestion() {
  var c = coachQ(), d = dimOf(ST().cur.dim);
  var h = topbar() + '<span class="tag" style="background:' + d.c + '">' + d.e + " " + d.n + "</span>";
  h += '<div class="qcard"><div class="k">Question du coach · ' + MODS[c.m].n + '</div><p class="q">' + c.q[0] + "</p></div>";
  h += '<textarea id="ans" placeholder="Ta réponse, avec tes mots"></textarea><div class="err" id="er" style="background:none;border:0;padding:4px 0;color:#ff8a7a"></div>';
  h += '<button class="btn" onclick="sendAnswer(false)">Valider ma réponse</button>';
  return h + '<button class="btn ghost" onclick="sendAnswer(true)">Répondu à voix haute</button>';
}
function sendAnswer(voice) {
  var el = document.getElementById("ans");
  var t = el ? el.value.replace(/^\s+|\s+$/g, "") : "";
  if (!voice && !t) { document.getElementById("er").innerHTML = "Écris au moins quelques mots, ou choisis « Répondu à voix haute »."; return; }
  var c = coachQ();
  if (!ST().ans) { ST().ans = []; }
  ST().ans.push({ pos: ME.pos, mod: c.m, q: c.q[0], a: voice ? "" : t, v: !!voice, tip: c.q[1] });
  ME.score += voice ? 5 : 10;
  ST().sc[ST().cur.dim] = Math.min(100, ST().sc[ST().cur.dim] + 2);
  ST().cur.tip = c.q[1];
  saveMe();
  drawCards();
}
function owned(id) { return ST().box.indexOf(id) >= 0; }
function pool(src, key) {
  var r = [];
  for (var i = 0; i < CARDS.length; i++) { if (CARDS[i].src === src && CARDS[i].key === key && !owned(CARDS[i].id)) { r.push(CARDS[i]); } }
  return r;
}
function weakDims() {
  var sc = ST().sc;
  var a = DIMS.slice().sort(function (x, y) { return sc[x.id] - sc[y.id]; });
  var r = [];
  for (var i = 0; i < a.length; i++) { if (pool("dim", a[i].id).length > 0) { r.push(a[i].id); } }
  return r;
}
function pickOne(arr, chosen) {
  var l = shuffle(arr.slice());
  for (var i = 0; i < l.length; i++) { if (chosen.indexOf(l[i].id) < 0) { return l[i]; } }
  return null;
}
function drawCards() {
  var cur = ST().cur;
  var chosen = [];
  var a = pickOne(pool("dim", cur.dim), chosen); if (a) { chosen.push(a.id); }
  var b = pickOne(pool("pro", ST().pro), chosen); if (b) { chosen.push(b.id); }
  var c = pickOne(pool("emo", ST().emo), chosen); if (c) { chosen.push(c.id); }
  var w = weakDims();
  for (var i = 0; i < w.length && chosen.length < 3; i++) {
    var x = pickOne(pool("dim", w[i]), chosen);
    if (x) { chosen.push(x.id); }
  }
  if (chosen.length === 0) {
    ME.step = "wait"; ST().toast = "Tu as déjà tous les outils de ta zone. Beau travail !";
    saveMe(); go(); return;
  }
  cur.cards = chosen; ME.step = "cards"; saveMe(); go();
}
function srcLabel(c) {
  if (c.src === "dim") { return dimOf(c.key).e + " Ta dimension : " + dimOf(c.key).n; }
  if (c.src === "pro") { return PROS[c.key].e + " Ton profil : " + PROS[c.key].n; }
  return EMOS[c.key].e + " Ton type : " + EMOS[c.key].n;
}
function srcColor(c) { return c.src === "dim" ? dimOf(c.key).c : "#FFBD59"; }
function vCards() {
  var cur = ST().cur;
  var h = topbar() + (cur.tip ? '<div class="coachnote"><b>Le mot du coach</b>' + cur.tip + "</div>" : "") + '<h2>Choisis un outil</h2><p class="muted">Trois cartes tirées de tes résultats. Prends celle que tu te vois utiliser.</p>';
  for (var i = 0; i < cur.cards.length; i++) {
    var c = cardOf(cur.cards[i]);
    h += '<div class="card pick" style="border-left-color:' + srcColor(c) + '" onclick="takeCard(\'' + c.id + '\')"><h3>' + c.t + '</h3><span class="tag">' + MOM[c.m] + '</span><div class="muted">' + srcLabel(c) + '</div><p class="muted" style="margin:8px 0 0">' + c.h.substring(0, 60) + "...</p></div>";
  }
  return h;
}
function takeCard(id) {
  var cur = ST().cur;
  cur.card = id; ST().box.push(id); ST().redo = false; ME.step = "challenge";
  saveMe(); go();
}
function vChallenge() {
  var c = cardOf(ST().cur.card);
  var h = topbar();
  if (ST().redo) { h += '<div class="toast warn">Le coach te demande de refaire ce défi. Reprends-le calmement.</div>'; }
  h += '<span class="tag">' + MOM[c.m] + '</span><div class="muted">' + srcLabel(c) + "</div>";
  h += '<h2 style="margin-top:12px">' + c.t + '</h2><div class="card"><p style="font-size:17px;margin:0">' + c.h + "</p></div>";
  h += '<p class="muted">Défi : fais-le pour de vrai, maintenant, une fois. Puis montre-le au coach.</p>';
  return h + '<button class="btn" onclick="sendChallenge()">Je l\'ai fait, je le montre au coach</button>';
}
function sendChallenge() { ME.step = "validate"; ST().redo = false; saveMe(); go(); }
function vValidate() {
  var c = cardOf(ST().cur.card);
  var h = topbar() + '<h2>Montre ton défi au coach</h2>';
  h += '<div class="card"><h3>' + c.t + '</h3><p class="muted" style="margin:0">' + c.h + "</p></div>";
  h += "<p>En attente de la validation du coach. Elle te rapporte 20 points.</p>" + boardHtml();
  return h;
}

/* Fiche de synthèse : 3 dimensions les plus basses, action + outils adaptés */
function synth() {
  var s = ST(), sc = s.sc, ds = DIMS.slice().sort(function (x, y) { return sc[x.id] - sc[y.id]; }).slice(0, 3);
  var out = [], used = {}, i, j, k;
  for (i = 0; i < ds.length; i++) {
    var d = ds[i], mine = [], others = [];
    for (j = 0; j < CARDS.length; j++) {
      if (CARDS[j].src === "dim" && CARDS[j].key === d.id) { (owned(CARDS[j].id) ? mine : others).push(CARDS[j]); }
    }
    var tools = mine.concat(others).slice(0, 2), pe = [], pe2 = [];
    for (j = 0; j < CARDS.length; j++) {
      var c = CARDS[j];
      if (used[c.id]) { continue; }
      if ((c.src === "pro" && c.key === s.pro) || (c.src === "emo" && c.key === s.emo)) { (owned(c.id) ? pe : pe2).push(c); }
    }
    var extra = pe.concat(pe2)[0];
    if (extra) { tools.push(extra); used[extra.id] = true; }
    var quote = "", an = s.ans || [];
    for (k = an.length - 1; k >= 0; k--) {
      if (MODS[an[k].mod].d === d.id && !an[k].v && an[k].a) { quote = an[k].a; break; }
    }
    out.push({ d: d, score: sc[d.id], action: tools[0], tools: tools, quote: quote });
  }
  return out;
}
function synthHtml() {
  var s = synth(), h = '<div class="card syn"><div class="k">Fiche de synthèse</div><h2 style="margin:6px 0 4px">Mes 3 actions prioritaires</h2>';
  h += '<p class="muted" style="margin:0 0 6px">Les trois dimensions à travailler en premier, avec l\'action et les outils faits pour toi.</p>';
  for (var i = 0; i < s.length; i++) {
    var p = s[i];
    h += '<div class="pr"><div class="nb" style="border-color:' + p.d.c + '">' + (i + 1) + '</div><div class="bd">';
    h += '<div class="gl"><span><b>' + p.d.n + '</b></span><span>' + p.score + "/100</span></div>";
    h += '<div class="bar"><div class="fill" style="width:' + p.score + "%;background:" + p.d.c + '"></div></div>';
    if (p.action) { h += '<p class="act"><b>Mon action :</b> ' + p.action.t + ". " + p.action.h + ' <span class="muted">(' + MOM[p.action.m] + ")</span></p>"; }
    if (p.quote) { h += '<p class="qt">« ' + esc(p.quote) + " »</p>"; }
    h += '<div class="tl">';
    for (var t = 0; t < p.tools.length; t++) { h += '<span class="tag">' + p.tools[t].t + "</span>"; }
    h += "</div></div></div>";
  }
  return h + "</div>";
}
function synthText() {
  var s = synth(), t = "MES 3 ACTIONS PRIORITAIRES\n", i, k;
  for (i = 0; i < s.length; i++) {
    var p = s[i], n = [];
    t += (i + 1) + ". " + p.d.n + " (" + p.score + "/100)\n";
    if (p.action) { t += "   Action : " + p.action.t + ". " + p.action.h + " (" + MOM[p.action.m] + ")\n"; }
    if (p.quote) { t += "   Ma réponse au coach : " + p.quote + "\n"; }
    for (k = 0; k < p.tools.length; k++) { n.push(p.tools[k].t); }
    t += "   Outils : " + n.join(" / ") + "\n";
  }
  return t + "\n";
}
function programText() {
  var s = ST(); var p = PROS[s.pro];
  var t = "MON PLAN MENTAL · " + ME.name + "\n\n" + synthText() + "MON PROFIL : " + p.n + "\nMes besoins : " + p.b.join(" / ") + "\n";
  t += "Tension : " + p.s[0] + "\nMontée : " + p.s[1] + "\nSaturation : " + p.s[2] + "\n\n";
  for (var m = 0; m < MOM.length; m++) {
    var items = [];
    for (var i = 0; i < s.box.length; i++) { var c = cardOf(s.box[i]); if (c.m === m) { items.push(c); } }
    if (items.length > 0) {
      t += MOM[m].toUpperCase() + "\n";
      for (var j = 0; j < items.length; j++) { t += "- " + items[j].t + " : " + items[j].h + "\n"; }
      t += "\n";
    }
  }
  var an = s.ans || [];
  if (an.length > 0) {
    t += "MES RÉPONSES AU COACH\n";
    for (var q = 0; q < an.length; q++) { t += "- " + an[q].q + "\n  " + (an[q].v ? "(répondu à voix haute)" : an[q].a) + "\n"; }
    t += "\n";
  }
  return t + "Mon engagement : je pratique ce programme pendant 2 semaines.\nUne architecture mentale. Pas une béquille émotionnelle. A4P Mental";
}
function vProgram() {
  var s = ST(); var p = PROS[s.pro];
  var h = topbar() + "<h1>Mon programme</h1>" + chips() + synthHtml();
  h += '<div class="card"><h3>' + p.e + " Ma fiche · " + p.n + '</h3><p class="muted" style="margin:6px 0 4px"><b>Mes besoins</b></p><ul class="l">';
  for (var b = 0; b < p.b.length; b++) { h += "<li>" + p.b[b] + "</li>"; }
  h += '</ul><p class="muted" style="margin:10px 0 4px"><b>Mes signaux quand la pression monte</b></p><ul class="l"><li>Tension : ' + p.s[0] + "</li><li>Montée : " + p.s[1] + "</li><li>Saturation : " + p.s[2] + "</li></ul></div>";
  for (var m = 0; m < MOM.length; m++) {
    var sec = "";
    for (var i = 0; i < s.box.length; i++) {
      var c = cardOf(s.box[i]);
      if (c.m === m) { sec += '<div class="it" style="border-left-color:' + srcColor(c) + '"><b>' + c.t + '</b><div class="muted">' + c.h + "</div></div>"; }
    }
    if (sec) { h += '<div class="mom">' + MOM[m] + "</div>" + sec; }
  }
  var an = s.ans || [];
  if (an.length > 0) {
    h += '<div class="mom">Mes réponses au coach</div>';
    for (var q = 0; q < an.length; q++) { h += '<div class="it"><b>' + esc(an[q].q) + '</b><div class="muted">' + (an[q].v ? "Répondu à voix haute" : esc(an[q].a)) + "</div></div>"; }
  }
  h += '<div class="noprint"><button class="btn" onclick="copyProg()">Copier mon programme</button><button class="btn ghost" onclick="window.print()">Imprimer</button><button class="btn ghost" onclick="hideProg()">Retour</button></div>';
  return h + sig();
}
function copyProg() {
  var t = programText();
  try { if (navigator.clipboard) { navigator.clipboard.writeText(t); alert("Programme copié."); return; } } catch (e) {}
  var ta = document.createElement("textarea");
  ta.value = t; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); alert("Programme copié."); } catch (e2) { alert("Copie impossible, utilise Imprimer."); }
  document.body.removeChild(ta);
}

function vPodium() {
  if (SUB === "program") { return vProgram(); }
  var list = [];
  for (var i = 0; i < PL.length; i++) {
    var p = PL[i];
    if (p.id === ME.id) { list.push({ id: p.id, name: ME.name, avatar: ME.avatar, pos: ME.pos, total: total() }); }
    else { list.push(p); }
  }
  var rk = ranking(list);
  var medals = ["🥇", "🥈", "🥉"];
  var h = topbar() + '<h1>Partie terminée</h1>';
  for (var j = 0; j < rk.length; j++) {
    h += '<div class="card lb' + (rk[j].id === ME.id ? " me" : "") + '"><span>' + (j + 1) + ". " + dot(rk[j]) + " " + esc(rk[j].name) + "</span><span>Case " + rk[j].pos + " · " + rk[j].total + " pts</span></div>";
  }
  h += "<p>Bravo à tous. Garde ton programme et pratique-le pendant 2 semaines.</p>";
  if (ST().box.length > 0 && ST().pro >= 0) { h += '<button class="btn" onclick="showProg()">Voir mon programme</button>'; }
  h += '<button class="btn ghost" onclick="leave()">Quitter</button>';
  return h + sig();
}

/* ---------- Espace coach ---------- */
function goCoach() {
  if (!api.configured()) { setErr("Le mode club n'est pas encore configuré."); return; }
  VIEW = "coach"; C.view = "login";
  api.session().then(function (s) {
    if (s) { cList(); } else { go(); }
  }).catch(function () { go(); });
}
function backEntry() { stopPoll(); VIEW = "entry"; go(); }
function vCoach() {
  if (C.view === "login") { return vcLogin(); }
  if (C.view === "list") { return vcList(); }
  return vcRoom();
}
function vcLogin() {
  var h = '<h1>Espace coach</h1><p class="muted">Connecte-toi avec l\'accès créé pour toi.</p>';
  h += '<div class="err" id="er" style="display:none"></div><div class="card">';
  h += '<label>E-mail</label><input id="ce" type="text" autocomplete="username" autocapitalize="none">';
  h += '<label>Mot de passe</label><input id="cp" type="password" autocomplete="current-password" class="pw1">';
  h += '<button class="btn" onclick="cLogin()">Me connecter</button></div>';
  return h + '<button class="btn ghost" onclick="backEntry()">Retour</button>' + sig();
}
function cLogin() {
  var e = document.getElementById("ce").value.trim();
  var p = document.getElementById("cp").value;
  setErr("");
  api.login(e, p).then(function () { cList(); }).catch(function (x) { setErr(x.message); });
}
function cLogout() {
  api.logout().then(function () { stopPoll(); C.view = "login"; go(); });
}
function cList() {
  stopPoll();
  api.myGames().then(function (rows) { C.games = rows; C.view = "list"; go(); })
    .catch(function (e) { C.view = "login"; go(); setErr(e.message); });
}
function vcList() {
  var h = '<h1>Mes parties</h1><div class="err" id="er" style="display:none"></div>';
  h += '<div class="card"><label>Nom de la nouvelle partie</label><input id="gt" type="text" maxlength="40" placeholder="Ex : U16 Puteaux, séance 1">';
  h += '<button class="btn" onclick="cCreate()">Créer une partie</button></div>';
  var lbl = { lobby: "Salon ouvert", playing: "En cours", finished: "Terminée" };
  for (var i = 0; i < C.games.length; i++) {
    var g = C.games[i];
    h += '<div class="card pc" onclick="cOpen(\'' + g.id + '\')"><div class="lb"><b>' + esc(g.title || "Sans titre") + '</b><span class="codesm">' + esc(g.code) + '</span></div><div class="muted">' + lbl[g.status] + (g.status === "playing" ? " · tour " + g.round : "") + "</div></div>";
  }
  if (C.games.length === 0) { h += '<p class="muted">Aucune partie pour le moment.</p>'; }
  h += '<button class="btn ghost" onclick="cLogout()">Me déconnecter</button><button class="btn ghost" onclick="backEntry()">Retour à l\'accueil</button>';
  return h + sig();
}
function cCreate() {
  var t = document.getElementById("gt").value.trim();
  api.createGame(t).then(function (g) { cOpen(g.id); }).catch(function (e) { setErr(e.message); });
}
function cOpen(id) {
  C.view = "room"; C.game = { id: id }; C.players = []; C.sig = "";
  cPoll(true);
  startPoll(function () { cPoll(false); }, 2500);
}
function cPoll(force) {
  if (!C.game) { return; }
  var id = C.game.id;
  Promise.all([api.getGame(id), api.players(id)]).then(function (r) {
    C.game = r[0]; C.players = r[1];
    var sg = JSON.stringify([C.game, C.players]);
    if (force || sg !== C.sig) { C.sig = sg; if (VIEW === "coach" && C.view === "room") { render(); } }
  }).catch(function () {});
}
function codeBig(c) {
  var h = '<div class="code">';
  for (var i = 0; i < c.length; i++) { h += "<span>" + esc(c.charAt(i)) + "</span>"; }
  return h + "</div>";
}
function vcRoom() {
  var g = C.game;
  if (!g || !g.code) { return '<p class="muted">Chargement...</p>'; }
  var h = '<div class="top"><div><b>' + esc(g.title || "Partie") + '</b><div class="muted">' + C.players.length + ' joueur(s)</div></div>';
  h += '<div class="rank">' + (g.status === "lobby" ? "Salon" : (g.status === "playing" ? "Tour " + g.round : "Terminée")) + "</div></div>";
  if (g.status === "lobby") { h += codeBig(g.code) + '<p class="muted" style="text-align:center">Les joueurs ouvrent ' + esc(location.host || "le site") + ' et entrent ce code.</p>'; }
  h += cControls(g);
  if (g.status === "playing") { h += cValidations(); }
  if (g.status !== "lobby") { h += board3d(coachList(), ""); }
  h += cPlayers(g);
  h += cDash();
  h += '<button class="btn ghost" onclick="cList()">Retour à mes parties</button>';
  h += '<p style="text-align:center;margin-top:12px"><a href="#" class="muted" onclick="cDel();return false">Supprimer cette partie</a></p>';
  return h + sig();
}
function coachList() {
  var l = [];
  for (var i = 0; i < C.players.length; i++) { var p = C.players[i]; l.push({ id: p.id, name: p.name, avatar: p.avatar, pos: p.pos }); }
  return l;
}
function cControls(g) {
  if (g.status === "lobby") {
    var d = C.players.length === 0 ? " disabled" : "";
    return '<button class="btn"' + d + ' onclick="cStart()">Lancer la partie</button>';
  }
  if (g.status === "playing") {
    return '<button class="btn" onclick="cNext()">Lancer le tour ' + (g.round + 1) + '</button><button class="btn ghost" onclick="cEnd()">Terminer la partie</button>';
  }
  return "";
}
function cStart() { api.setGame(C.game.id, { status: "playing", round: 1 }).then(function () { cPoll(true); }); }
function cNext() {
  var busy = 0;
  for (var i = 0; i < C.players.length; i++) {
    var s = C.players[i].step;
    if (s !== "done" && s !== "wait" && s !== "setup") { busy++; }
  }
  if (busy > 0 && !confirm(busy + " joueur(s) n'ont pas fini ce tour. Lancer le suivant quand même ?")) { return; }
  api.setGame(C.game.id, { round: C.game.round + 1 }).then(function () { cPoll(true); });
}
function cEnd() {
  if (!confirm("Terminer la partie pour tout le monde ?")) { return; }
  api.setGame(C.game.id, { status: "finished" }).then(function () { cPoll(true); });
}
function cDel() {
  if (!confirm("Supprimer définitivement cette partie et ses joueurs ?")) { return; }
  api.delGame(C.game.id).then(function () { cList(); });
}
function cValidations() {
  var h = "";
  for (var i = 0; i < C.players.length; i++) {
    var p = C.players[i];
    if (p.step !== "validate" || !p.state || !p.state.cur) { continue; }
    var c = cardOf(p.state.cur.card);
    if (!c) { continue; }
    if (h === "") { h = '<h2>À valider</h2>'; }
    h += '<div class="card pick" style="border-left-color:#FFBD59"><b>' + dot(p) + " " + esc(p.name) + "</b>";
    h += '<h3 style="margin-top:6px">' + c.t + '</h3><p class="muted">' + c.h + "</p>";
    h += '<div class="two"><button class="btn" onclick="cVal(\'' + p.id + '\',true)">Valider</button><button class="btn ghost" onclick="cVal(\'' + p.id + '\',false)">À refaire</button></div></div>';
  }
  return h;
}
function cVal(pid, ok) { api.validate(pid, ok).then(function () { cPoll(true); }); }
function cPlayers(g) {
  if (C.players.length === 0) { return '<p class="muted">En attente des joueurs...</p>'; }
  var list = [];
  for (var i = 0; i < C.players.length; i++) {
    var p = C.players[i];
    list.push({ id: p.id, name: p.name, avatar: p.avatar, pos: p.pos, total: p.score + p.bonus, step: p.step, st: p.state });
  }
  var rk = g.status === "lobby" ? list : ranking(list);
  var h = '<div class="card"><h3>' + (g.status === "lobby" ? "Joueurs connectés" : "Classement") + "</h3>";
  for (var j = 0; j < rk.length; j++) {
    var r = rk[j];
    var info = "";
    if (r.st && r.st.pro >= 0 && PROS[r.st.pro]) { info += PROS[r.st.pro].e + " "; }
    if (r.st && r.st.emo >= 0 && EMOS[r.st.emo]) { info += EMOS[r.st.emo].e + " "; }
    h += '<div class="lb"><span>' + (g.status === "lobby" ? "" : (j + 1) + ". ") + dot(r) + " " + esc(r.name) + " " + info + '</span><span class="muted">' + (g.status === "lobby" ? STEP_LBL[r.step] : "Case " + r.pos + " · " + r.total + " pts · " + STEP_LBL[r.step]) + "</span></div>";
  }
  return h + "</div>";
}
function cDash() {
  var n = 0, i, k;
  var tot = {};
  for (k = 0; k < DIMS.length; k++) { tot[DIMS[k].id] = 0; }
  var pro = [0, 0, 0, 0, 0, 0], emo = [0, 0, 0, 0];
  for (i = 0; i < C.players.length; i++) {
    var s = C.players[i].state;
    if (!s || !s.sc || s.sub !== "done") { continue; }
    n++;
    for (k = 0; k < DIMS.length; k++) { tot[DIMS[k].id] += s.sc[DIMS[k].id]; }
    if (s.pro >= 0) { pro[s.pro]++; }
    if (s.emo >= 0) { emo[s.emo]++; }
  }
  if (n === 0) { return ""; }
  var h = '<div class="card"><h3>Tableau de bord de l\'équipe</h3><p class="muted">Moyenne des ' + n + " joueur(s) prêts.</p>";
  var weak = null, wv = 101;
  for (k = 0; k < DIMS.length; k++) {
    var d = DIMS[k]; var v = Math.round(tot[d.id] / n);
    if (v < wv) { wv = v; weak = d; }
    h += '<div class="gauge"><div class="gl"><span>' + d.e + " " + d.n + "</span><span>" + v + '</span></div><div class="bar"><div class="fill" style="width:' + v + "%;background:" + d.c + '"></div></div></div>';
  }
  if (weak) { h += '<p style="margin-top:10px">Zone collective à travailler : <b style="color:' + weak.c + '">' + weak.e + " " + weak.n + "</b></p>"; }
  h += '<p class="muted" style="margin:8px 0 4px"><b>Profils</b></p><div class="chips">';
  for (i = 0; i < PROS.length; i++) { if (pro[i] > 0) { h += '<span class="tag">' + PROS[i].e + " " + PROS[i].n + " × " + pro[i] + "</span>"; } }
  h += '</div><p class="muted" style="margin:4px 0 4px"><b>Types émotionnels</b></p><div class="chips">';
  for (i = 0; i < EMOS.length; i++) { if (emo[i] > 0) { h += '<span class="tag">' + EMOS[i].e + " " + EMOS[i].n + " × " + emo[i] + "</span>"; } }
  return h + "</div></div>";
}

/* ---------- Demarrage ---------- */
if (lsGet(KEY) && api.configured()) { resume(); } else { render(); }
