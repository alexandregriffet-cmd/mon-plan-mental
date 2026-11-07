/* Mon Plan Mental : jeu solo. Plateau en infini, une question du coach à chaque étape. ES5. */
var KEY = "a4p_plan_mental_v3";
var TM = null, BT = null;
var COL = "#FFBD59";

function fresh() {
  var sc = {}, sn = {}, k;
  for (k = 0; k < DIMS.length; k++) { sc[DIMS[k].id] = 50; sn[DIMS[k].id] = false; }
  return { screen: "intro", name: "", sport: "", sc: sc, cmp: -1, pro: -1, emo: -1, xp: 0, pos: 0, boost: 0, turns: 0, rolled: 0, die: 1, ans: [], box: [], seen: sn, cur: null, msg: "", done: false };
}
var S = fresh();
try { var raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); } } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function esc(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function dimOf(id) { for (var i = 0; i < DIMS.length; i++) { if (DIMS[i].id === id) { return DIMS[i]; } } return null; }
function cardOf(id) { for (var i = 0; i < CARDS.length; i++) { if (CARDS[i].id === id) { return CARDS[i]; } } return null; }
function owned(id) { return S.box.indexOf(id) >= 0; }
function rank() {
  if (S.xp >= 300) { return "Architecte mental"; }
  if (S.xp >= 170) { return "Confirmé"; }
  if (S.xp >= 70) { return "Apprenti"; }
  return "Recrue";
}
function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function stopTimers() {
  if (TM) { clearInterval(TM); TM = null; }
  if (BT) { clearInterval(BT); BT = null; }
}
function go(s) { stopTimers(); S.screen = s; save(); render(); window.scrollTo(0, 0); }
function weakDims() {
  return DIMS.slice().sort(function (x, y) { return S.sc[x.id] - S.sc[y.id]; });
}
function bump(d, n) { if (d && S.sc[d] !== undefined) { S.sc[d] = Math.min(100, S.sc[d] + n); } }

/* ---------- mise en route ---------- */
function begin() {
  var n = document.getElementById("nm").value;
  S.name = n ? n : "Champion";
  S.sport = document.getElementById("sp").value;
  go("pmp");
}
function setP(id, v) {
  S.sc[id] = parseInt(v, 10);
  document.getElementById("v_" + id).innerHTML = v;
  save();
}
function setCmp(i) { S.cmp = i; go("pro"); }
function setPro(i) { S.pro = i; go("emo"); }
function setEmo(i) { S.emo = i; S.msg = "Ton plateau est prêt. Lance le dé pour commencer l'ascension."; go("board"); }

/* ---------- tour de jeu ---------- */
var TUMBLE = false;
function roll() {
  if (S.cur) { return; }
  var d = 1 + Math.floor(Math.random() * Board.DIE);
  var bonus = S.boost;
  S.boost = 0;
  S.die = d;
  TUMBLE = true;
  Board.shown.me = S.pos;
  var np = Board.clampMove(S.pos, d + bonus);
  S.rolled = np - S.pos;
  S.pos = np;
  S.turns = S.turns + 1;
  S.msg = "";
  S.cur = { stage: "landed", bonus: bonus };
  save(); render();
}
function ordinal(pos) {
  var m = Board.modOf(pos), c = 0;
  for (var p = 1; p < pos; p++) { if (Board.modOf(p) === m) { c++; } }
  return c;
}
function openCard() {
  var pos = S.pos;
  if (pos >= Board.TRACK) { S.xp += 50; S.done = true; go("program"); return; }
  var cur = { pos: pos, stage: "question", kind: "", mod: Board.modOf(pos), qi: 0, picked: -1, tool: "", dim: "" };
  if (pos === Board.PIVOT) {
    cur.kind = "pivot";
  } else {
    cur.kind = Board.kindOf(pos);
    cur.qi = ordinal(pos);
    if (cur.kind) { cur.stage = "twist"; }
    if (cur.kind === "defi") { cur.i = (pos + S.turns) % DEFIS.length; }
    if (cur.kind === "phrase") { cur.i = (pos + S.turns) % PHRASES.length; }
    if (cur.kind === "scn") { cur.dim = weakDims()[pos % 3].id; }
  }
  if (cur.mod >= 0) { cur.qj = pickQ(cur.mod, cur.qi); }
  S.cur = cur;
  go("card");
}
function twistDone(xp) {
  S.xp += xp;
  S.cur.stage = "question";
  go("card");
}
function chanceTake() {
  S.boost = 2;
  twistDone(10);
}
function scnAnswer(k) {
  if (S.cur.picked >= 0) { return; }
  var o = SCN[S.cur.dim].o[k];
  S.cur.picked = k;
  bump(S.cur.dim, o[1]);
  S.xp += o[2];
  S.seen[S.cur.dim] = true;
  save(); render();
}
function pickQ(mod, qi) {
  var free = [], i, k, asked;
  for (i = 0; i < MODS[mod].qs.length; i++) {
    asked = false;
    for (k = 0; k < S.ans.length; k++) { if (S.ans[k].q === MODS[mod].qs[i][0]) { asked = true; } }
    if (!asked) { free.push(i); }
  }
  if (free.length === 0) { return qi % MODS[mod].qs.length; }
  return free[qi % free.length];
}
function qOf() {
  var c = S.cur;
  if (c.kind === "pivot") {
    return ["Depuis le départ, qu'est-ce qui a changé en toi ?", "Tu es à mi-parcours. Regarde le chemin parcouru : chaque réponse écrite est déjà un pas. La deuxième boucle t'emmène vers l'engagement et l'autonomie."];
  }
  var m = MODS[c.mod];
  return m.qs[c.qj !== undefined ? c.qj : c.qi % m.qs.length];
}
function validate(voice) {
  var c = S.cur;
  var el = document.getElementById("ans");
  var t = el ? el.value.replace(/^\s+|\s+$/g, "") : "";
  if (!voice && !t) { document.getElementById("er").innerHTML = "Écris au moins quelques mots, ou choisis « Répondu à voix haute »."; return; }
  var q = qOf();
  S.ans.push({ pos: c.pos, mod: c.mod, q: q[0], a: voice ? "" : t, v: !!voice, tip: q[1] });
  S.xp += voice ? 10 : 15;
  if (c.mod >= 0) { bump(MODS[c.mod].d, 4); }
  c.stage = "debrief";
  c.tool = drawTool();
  go("card");
}
function pool(src, key) {
  var r = [];
  for (var i = 0; i < CARDS.length; i++) { if (CARDS[i].src === src && CARDS[i].key === key && !owned(CARDS[i].id)) { r.push(CARDS[i]); } }
  return r;
}
function drawTool() {
  var order = [], i, l;
  var r = S.turns % 3;
  var w = weakDims();
  var a = pool("dim", w[S.turns % w.length].id), b = S.pro >= 0 ? pool("pro", S.pro) : [], e = S.emo >= 0 ? pool("emo", S.emo) : [];
  if (r === 0) { order = [a, b, e]; } else if (r === 1) { order = [b, e, a]; } else { order = [e, a, b]; }
  for (i = 0; i < order.length; i++) {
    if (order[i].length > 0) { l = shuffle(order[i].slice()); return l[0].id; }
  }
  return "";
}
function keepTool() {
  var id = S.cur.tool;
  if (id && !owned(id)) { S.box.push(id); S.xp += 5; }
  save(); render();
}
function backBoard() { S.cur = null; S.msg = ""; go("board"); }
function reset() {
  if (confirm("Tout recommencer ?")) { S = fresh(); save(); render(); }
}
function replay() {
  if (confirm("Rejouer une partie ? Ton plan actuel sera effacé, tes résultats restent.")) {
    var keep = { name: S.name, sport: S.sport, sc: S.sc, cmp: S.cmp, pro: S.pro, emo: S.emo };
    S = fresh();
    S.name = keep.name; S.sport = keep.sport; S.sc = keep.sc; S.cmp = keep.cmp; S.pro = keep.pro; S.emo = keep.emo;
    S.screen = "board";
    save(); render();
  }
}

/* ---------- minuteur et souffle ---------- */
function startTimer(sec) {
  stopTimers();
  var left = sec;
  var el = document.getElementById("tm");
  el.innerHTML = left;
  TM = setInterval(function () {
    left = left - 1;
    var e2 = document.getElementById("tm");
    if (!e2) { stopTimers(); return; }
    if (left <= 0) { e2.innerHTML = "Terminé"; stopTimers(); } else { e2.innerHTML = left; }
  }, 1000);
}
function startBreath() {
  stopTimers();
  var t = 0;
  function tick() {
    var el = document.getElementById("br");
    if (!el) { stopTimers(); return; }
    if (t >= 30) { el.className = "breath"; el.innerHTML = "Bravo"; stopTimers(); return; }
    var c = t % 10;
    if (c < 4) { el.className = "breath in"; el.innerHTML = "Inspire " + (4 - c); }
    else { el.className = "breath out"; el.innerHTML = "Expire " + (10 - c); }
    t++;
  }
  tick();
  BT = setInterval(tick, 1000);
}

/* ---------- vues ---------- */
function gauges() {
  var h = "";
  for (var i = 0; i < DIMS.length; i++) {
    var p = DIMS[i];
    h += '<div class="gauge"><div class="gl"><span>' + p.n + "</span><span>" + S.sc[p.id] + '</span></div><div class="bar"><div class="fill" style="width:' + S.sc[p.id] + "%;background:" + p.c + '"></div></div></div>';
  }
  return h;
}
function sig() { return '<div class="sig">Une architecture mentale. Pas une béquille émotionnelle.</div>'; }
function topbar() {
  var h = '<div class="top"><div><b>' + esc(S.name) + '</b><div class="muted">Étape ' + S.pos + "/" + Board.TRACK + " · " + S.xp + ' points</div></div><div class="rank">' + rank() + "</div></div>";
  return h;
}
function chips() {
  var h = '<div class="chips">';
  if (S.pro >= 0) { h += '<span class="tag">' + PROS[S.pro].n + "</span>"; }
  if (S.emo >= 0) { h += '<span class="tag">' + EMOS[S.emo].n + "</span>"; }
  if (S.cmp >= 0) { h += '<span class="tag">Niveau ' + (S.cmp + 1) + " " + CMPS[S.cmp].n + "</span>"; }
  return h + "</div>";
}
function vIntro() {
  var h = '<div class="hero"><div class="kick">Performance · Plaisir · Succès</div><h1>Mon Plan Mental</h1></div>';
  h += "<p>Une spirale montante de 50 cases : tu grimpes de la base au sommet, avec une question du coach mental à chaque étape. Tu pars de tes résultats A4P et tu construis ton programme au fil de la partie. Seul, à ton rythme.</p>";
  h += '<div class="card"><label>Ton prénom</label><input id="nm" type="text" placeholder="Prénom" value="' + esc(S.name) + '">';
  h += '<label>Ton sport</label><input id="sp" type="text" placeholder="Rugby, foot, basket..." value="' + esc(S.sport) + '">';
  h += '<button class="btn" onclick="begin()">Commencer</button></div>';
  h += '<a class="btn ghost" href="index.html">Jouer avec mon club</a>';
  return h + sig();
}
function vPmp() {
  var h = '<div class="steps">ÉTAPE 1 SUR 4 · MON PMP</div><h2>Tes scores du Profil Mental de Performance</h2>';
  h += '<p class="muted">Règle chaque curseur sur ton score (0 à 100). Pas encore passé le test ? Laisse 50, ou estime-toi honnêtement.</p><div class="card">';
  for (var i = 0; i < DIMS.length; i++) {
    var d = DIMS[i];
    h += '<div class="sl"><span>' + d.n + '</span><b id="v_' + d.id + '">' + S.sc[d.id] + "</b></div>";
    h += '<input type="range" min="0" max="100" value="' + S.sc[d.id] + '" oninput="setP(\'' + d.id + "',this.value)\">";
  }
  return h + '</div><button class="btn" onclick="go(\'cmp\')">Suivant</button>';
}
function vCmp() {
  var h = '<div class="steps">ÉTAPE 2 SUR 4 · MON CMP</div><h2>Ton niveau de compétences mentales</h2><p class="muted">Choisis le niveau de ton résultat CMP.</p>';
  for (var i = 0; i < CMPS.length; i++) {
    var c = CMPS[i];
    h += '<div class="card pc" style="border-left:3px solid ' + c.c + '" onclick="setCmp(' + i + ')"><h3>Niveau ' + (i + 1) + " · " + c.n + '</h3><p class="muted" style="margin:0">' + c.t + "</p></div>";
  }
  return h;
}
function vPro() {
  var h = '<div class="steps">ÉTAPE 3 SUR 4 · MON PROFIL</div><h2>Quel profil de personnalité est le tien ?</h2><p class="muted">Celui de ton résultat, ou celui qui te ressemble le plus profondément.</p>';
  for (var i = 0; i < PROS.length; i++) {
    h += '<div class="card pc" onclick="setPro(' + i + ')"><h3>' + PROS[i].n + '</h3><p class="muted" style="margin:0">' + PROS[i].t + "</p></div>";
  }
  return h;
}
function vEmo() {
  var h = '<div class="steps">ÉTAPE 4 SUR 4 · MON TYPE ÉMOTIONNEL</div><h2>Quel est ton type émotionnel ?</h2><p class="muted">Celui de ton diagnostic Psycho-émotionnel.</p>';
  for (var i = 0; i < EMOS.length; i++) {
    h += '<div class="card pc" onclick="setEmo(' + i + ')"><h3>' + EMOS[i].n + '</h3><p class="muted" style="margin:0">' + EMOS[i].t + "</p></div>";
  }
  return h;
}
function pawn() {
  return '<div class="sh"></div><div class="pp">' + Board.athlete(COL, esc(String(S.name).charAt(0).toUpperCase() || "?")) + "</div>";
}
function boardHtml() {
  return Board.html([{ id: "me", name: S.name, pos: S.pos }], "me", function () { return pawn(); }, Board.shown);
}
function vBoard() {
  var h = topbar();
  if (S.msg) { h += '<div class="toast">' + S.msg + "</div>"; }
  h += boardHtml();
  if (S.boost > 0) { h += '<span class="tag boost">Coup de pouce : prochain lancer +' + S.boost + "</span>"; }
  if (S.cur && S.cur.stage === "landed") {
    var lbl = S.pos >= Board.TRACK ? "Franchir l'arrivée" : (S.pos === Board.PIVOT ? "Ouvrir la carte du Pivot" : "Ouvrir ma carte du coach");
    h += '<div class="rollbar">' + Board.dieHtml(S.die || 1) + '<button class="btn" id="goCard" onclick="openCard()">' + lbl + "</button></div>";
    h += '<p class="muted" style="margin-top:10px">Tu avances de ' + S.rolled + (S.rolled > 1 ? " cases." : " case.") + "</p>";
    if (S.pos === Board.PIVOT) { h += '<p class="muted" style="margin-top:12px">Tu es à mi-parcours : le Pivot. La suite de la montée t\'attend.</p>'; }
  } else {
    h += '<div class="rollbar">' + Board.dieHtml(S.die || 1) + '<button class="btn" onclick="roll()">Lancer le dé</button></div>';
    h += '<p class="muted" style="margin-top:12px">Le dé va de 1 à ' + Board.DIE + '. À la case ' + Board.PIVOT + ', tu t\'arrêtes toujours : c\'est le Pivot, à mi-parcours.</p>';
  }
  if (S.ans.length > 0) { h += '<button class="btn ghost" onclick="go(\'program\')">Mon carnet (' + S.ans.length + ")</button>"; }
  h += '<p style="text-align:center;margin-top:18px"><a href="#" class="muted" onclick="reset();return false">Recommencer</a></p>';
  return h + sig();
}
function phaseTag(pos) {
  var ph = Board.PH[Board.phaseOf(pos)];
  return '<span class="tag" style="color:' + ph.c + ";border-color:" + ph.c + '">' + ph.n + "</span>";
}
function vTwist() {
  var c = S.cur, k = c.kind, h = topbar() + phaseTag(c.pos) + '<span class="tag">' + Board.KINDS[k].n + "</span>";
  if (k === "defi") {
    var d = DEFIS[c.i];
    h += '<h2 style="margin-top:12px">' + d.t + "</h2><div class=\"card\"><p style=\"margin:0;font-size:17px\">" + d.x + "</p></div>";
    h += '<div class="timer" id="tm">' + d.s + '</div><button class="btn ghost" onclick="startTimer(' + d.s + ')">Lancer le chrono</button>';
    h += '<button class="btn" onclick="twistDone(25)">Défi réalisé</button>';
  } else if (k === "souffle") {
    h += '<h2 style="margin-top:12px">Souffle</h2><p>Trois cycles de cohérence cardiaque : inspire 4 secondes, expire 6 secondes. Suis le cercle.</p>';
    h += '<div class="breath" id="br">Prêt</div><button class="btn ghost" onclick="startBreath()">Commencer</button>';
    h += '<button class="btn" onclick="twistDone(20)">J\'ai respiré</button>';
  } else if (k === "phrase") {
    h += '<h2 style="margin-top:12px">Phrase clé</h2><div class="qcard"><div class="k">À dire à voix haute</div><p class="q">« ' + PHRASES[c.i] + ' »</p></div>';
    h += '<p class="muted">Dis-la une fois, calmement, en te regardant droit devant.</p><button class="btn" onclick="twistDone(15)">Je l\'ai dite</button>';
  } else if (k === "chance") {
    h += '<h2 style="margin-top:12px">Coup de pouce</h2><div class="qcard"><p class="q" style="margin:0">' + CHANCES[S.turns % CHANCES.length] + '</p></div>';
    h += '<button class="btn" onclick="chanceTake()">Je prends</button>';
  } else {
    var sc = SCN[c.dim], d2 = dimOf(c.dim);
    h += '<h2 style="margin-top:12px">Mise en situation · ' + d2.n + '</h2><p style="font-size:18px">' + sc.q + "</p>";
    for (var i = 0; i < sc.o.length; i++) {
      var cls = "opt";
      if (c.picked >= 0) { cls += (sc.o[i][1] >= 8) ? " good" : (c.picked === i ? " bad" : " dim"); }
      h += '<button class="' + cls + '" onclick="scnAnswer(' + i + ')">' + sc.o[i][0] + "</button>";
    }
    if (c.picked >= 0) {
      var o = sc.o[c.picked];
      h += '<div class="banner ' + (o[1] >= 8 ? "good" : "meh") + '">' + (o[1] >= 8 ? "Lecture juste" : "À retenir") + '</div><div class="card"><p style="margin:0">' + o[3] + '</p></div>';
      h += '<button class="btn" onclick="twistDone(0)">Ma carte du coach</button>';
    }
  }
  return h;
}
function vQuestion() {
  var c = S.cur, q = qOf();
  var label = c.kind === "pivot" ? "Pivot · mi-parcours" : MODS[c.mod].n;
  var h = topbar() + phaseTag(c.pos);
  if (c.kind === "pivot") { h += '<div class="card" style="margin-top:12px">' + gauges() + "</div>"; }
  h += '<div class="qcard"><div class="k">Question du coach · ' + label + '</div><p class="q">' + q[0] + "</p></div>";
  h += '<textarea id="ans" placeholder="Ta réponse, avec tes mots"></textarea><div class="err" id="er" style="background:none;border:0;padding:4px 0;color:#ff8a7a"></div>';
  h += '<button class="btn" onclick="validate(false)">Valider ma réponse</button>';
  h += '<button class="btn ghost" onclick="validate(true)">Répondu à voix haute</button>';
  return h;
}
function srcLabel(c) {
  if (c.src === "dim") { return "Ta dimension : " + dimOf(c.key).n; }
  if (c.src === "pro") { return "Ton profil : " + PROS[c.key].n; }
  return "Ton type : " + EMOS[c.key].n;
}
function vDebrief() {
  var c = S.cur, q = qOf();
  var h = topbar() + '<div class="banner good">Carte validée</div>';
  h += '<div class="coachnote"><b>Le mot du coach</b>' + q[1] + "</div>";
  if (c.tool) {
    var t = cardOf(c.tool);
    h += '<div class="card"><span class="tag">' + MOM[t.m] + '</span><div class="muted">' + srcLabel(t) + "</div>";
    h += '<h3 style="margin-top:8px">' + t.t + "</h3><p style=\"margin:0\">" + t.h + "</p></div>";
    if (owned(c.tool)) { h += '<button class="btn ghost" disabled>Dans mon plan</button>'; }
    else { h += '<button class="btn ghost" onclick="keepTool()">Garder cet outil dans mon plan</button>'; }
  }
  return h + '<button class="btn" onclick="backBoard()">Continuer</button>';
}
function vCard() {
  var c = S.cur;
  if (!c) { return vBoard(); }
  if (c.stage === "twist") { return vTwist(); }
  if (c.stage === "debrief") { return vDebrief(); }
  return vQuestion();
}
/* Fiche de synthèse : 3 priorités (dimensions les plus basses), une action et des outils adaptés */
function synth() {
  var w = weakDims().slice(0, 3), out = [], used = {}, i, j, k;
  for (i = 0; i < w.length; i++) {
    var d = w[i].id, mine = [], others = [];
    for (j = 0; j < CARDS.length; j++) {
      if (CARDS[j].src === "dim" && CARDS[j].key === d) { (owned(CARDS[j].id) ? mine : others).push(CARDS[j]); }
    }
    var tools = mine.concat(others).slice(0, 2);
    var pe = [], pe2 = [];
    for (j = 0; j < CARDS.length; j++) {
      var c = CARDS[j];
      if (used[c.id]) { continue; }
      if ((c.src === "pro" && c.key === S.pro) || (c.src === "emo" && c.key === S.emo)) { (owned(c.id) ? pe : pe2).push(c); }
    }
    var extra = pe.concat(pe2)[0];
    if (extra) { tools.push(extra); used[extra.id] = true; }
    var quote = "";
    for (k = S.ans.length - 1; k >= 0; k--) {
      if (S.ans[k].mod >= 0 && MODS[S.ans[k].mod].d === d && !S.ans[k].v && S.ans[k].a) { quote = S.ans[k].a; break; }
    }
    out.push({ d: w[i], score: S.sc[d], action: tools[0], tools: tools, quote: quote });
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
    var p = s[i];
    t += (i + 1) + ". " + p.d.n + " (" + p.score + "/100)\n";
    if (p.action) { t += "   Action : " + p.action.t + ". " + p.action.h + " (" + MOM[p.action.m] + ")\n"; }
    if (p.quote) { t += "   Ma réponse au coach : " + p.quote + "\n"; }
    var n = [];
    for (k = 0; k < p.tools.length; k++) { n.push(p.tools[k].t); }
    t += "   Outils : " + n.join(" / ") + "\n";
  }
  return t + "\n";
}
function ficheText() {
  var p = PROS[S.pro];
  return "MON PROFIL : " + p.n + "\nMes besoins : " + p.b.join(" / ") + "\nTension : " + p.s[0] + "\nMontée : " + p.s[1] + "\nSaturation : " + p.s[2] + "\n";
}
function programText() {
  var t = "MON PLAN MENTAL · " + S.name + (S.sport ? " · " + S.sport : "") + "\n\n";
  t += synthText();
  if (S.pro >= 0) { t += ficheText() + "\n"; }
  var m, i;
  for (m = 0; m < MOM.length; m++) {
    var items = [];
    for (i = 0; i < S.box.length; i++) { var c = cardOf(S.box[i]); if (c.m === m) { items.push(c); } }
    if (items.length > 0) {
      t += MOM[m].toUpperCase() + "\n";
      for (i = 0; i < items.length; i++) { t += "- " + items[i].t + " : " + items[i].h + "\n"; }
      t += "\n";
    }
  }
  t += "MES RÉPONSES AU COACH\n";
  for (i = 0; i < S.ans.length; i++) {
    var a = S.ans[i];
    t += "- " + a.q + "\n  " + (a.v ? "(répondu à voix haute)" : a.a) + "\n";
  }
  t += "\nMon engagement : je pratique ce programme pendant 2 semaines.\nUne architecture mentale. Pas une béquille émotionnelle. A4P Mental";
  return t;
}
function vProgram() {
  var h = topbar() + "<h1>Mon plan mental</h1>";
  if (S.done) { h += '<div class="toast">Sommet atteint. Tu as gravi les 50 cases : ton plan est prêt.</div>'; }
  h += chips();
  h += synthHtml();
  if (S.pro >= 0) {
    var p = PROS[S.pro];
    h += '<div class="card"><h3>Ma fiche · ' + p.n + '</h3><p class="muted" style="margin:6px 0 4px"><b>Mes besoins</b></p><ul class="l">';
    for (var b = 0; b < p.b.length; b++) { h += "<li>" + p.b[b] + "</li>"; }
    h += '</ul><p class="muted" style="margin:10px 0 4px"><b>Mes signaux quand la pression monte</b></p><ul class="l"><li>Tension : ' + p.s[0] + "</li><li>Montée : " + p.s[1] + "</li><li>Saturation : " + p.s[2] + "</li></ul></div>";
  }
  h += '<div class="card">' + gauges() + "</div>";
  var m, i;
  for (m = 0; m < MOM.length; m++) {
    var s = "";
    for (i = 0; i < S.box.length; i++) {
      var c = cardOf(S.box[i]);
      if (c.m === m) { s += '<div class="it"><b>' + c.t + '</b><div class="muted">' + c.h + "</div></div>"; }
    }
    if (s) { h += '<div class="mom">' + MOM[m] + "</div>" + s; }
  }
  if (S.box.length === 0) { h += '<p class="muted">Aucun outil gardé pour l\'instant. Après chaque carte, tu peux en garder un.</p>'; }
  h += '<div class="mom">Mes réponses au coach</div>';
  for (i = 0; i < S.ans.length; i++) {
    var a = S.ans[i];
    h += '<div class="it"><b>' + esc(a.q) + '</b><div class="muted">' + (a.v ? "Répondu à voix haute" : esc(a.a)) + "</div></div>";
  }
  h += '<div class="card" style="margin-top:14px"><h3>Mon engagement</h3><p style="margin:0">Pendant 2 semaines, je pratique ces outils avant, pendant et après mes matchs.</p></div>';
  h += '<div class="noprint"><button class="btn" onclick="copyProg()">Copier mon plan</button><button class="btn ghost" onclick="window.print()">Imprimer</button>';
  h += S.done ? '<button class="btn ghost" onclick="replay()">Rejouer une partie</button>' : '<button class="btn ghost" onclick="go(\'board\')">Retour au plateau</button>';
  return h + "</div>" + sig();
}
function copyProg() {
  var t = programText();
  try { if (navigator.clipboard) { navigator.clipboard.writeText(t); alert("Plan copié."); return; } } catch (e) {}
  var ta = document.createElement("textarea");
  ta.value = t; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); alert("Plan copié."); } catch (e2) { alert("Copie impossible, utilise Imprimer."); }
  document.body.removeChild(ta);
}
function render() {
  var v = "";
  var s = S.screen;
  if (s === "pmp") { v = vPmp(); }
  else if (s === "cmp") { v = vCmp(); }
  else if (s === "pro") { v = vPro(); }
  else if (s === "emo") { v = vEmo(); }
  else if (s === "board") { v = vBoard(); }
  else if (s === "card") { v = vCard(); }
  else if (s === "program") { v = vProgram(); }
  else { v = vIntro(); }
  var app = document.getElementById("app");
  app.innerHTML = v;
  if (s === "board") {
    if (TUMBLE) {
      TUMBLE = false;
      Board.tumble(S.die);
      Board.animate(app, 1500);
      var gb = document.getElementById("goCard");
      if (gb) {
        gb.disabled = true;
        setTimeout(function () { var x = document.getElementById("goCard"); if (x) { x.disabled = false; } }, 1500 + S.rolled * 340 + 250);
      }
    } else { Board.animate(app); }
  }
}
render();
