/* Plateau en spirale montante (50 cases), 3D CSS, qui pivote. Partagé par le solo et le club. ES5. */
(function () {
  var TRACK = 50;
  var PIVOT = 25;
  var DIE = 6;
  var PER_TURN = 20;      /* cases par tour de spirale */
  var STEP = 360 / PER_TURN;
  var ZMAX = 60;          /* hauteur du sommet, en unités (1 unité = 1% de la largeur) */
  var R0 = 39, R1 = 31;   /* rayon à la base, rayon au sommet */
  var PH = [
    { n: "Lucidité", c: "#4FC3C7" },
    { n: "Régulation", c: "#5B9BFF" },
    { n: "Engagement", c: "#FF9F43" },
    { n: "Autonomie", c: "#A98BFF" }
  ];
  var MODPH = [0, 1, 1, 0, 2, 2, 2, 3, 3, 3];
  var ORDER = [0, 3, 1, 2, 4, 5, 6, 7, 8, 9];
  var SIZES = [5, 5, 5, 5, 5, 5, 5, 5, 4, 4];
  var MODPOS = [-1], KIND = [""];
  (function () {
    var m = 0, left = SIZES[0], p;
    for (p = 1; p < TRACK; p++) {
      if (p === PIVOT) { MODPOS.push(-1); continue; }
      MODPOS.push(ORDER[m]);
      left--;
      if (left === 0 && m < ORDER.length - 1) { m++; left = SIZES[m]; }
    }
    MODPOS.push(-1);
    var cyc = ["defi", "scn", "chance", "souffle", "phrase"];
    for (p = 1; p <= TRACK; p++) { KIND.push(p % 5 === 3 && p < TRACK ? cyc[((p - 3) / 5) % 5] : ""); }
  })();
  var KINDS = {
    defi: { n: "Défi minute", s: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l3 2M9 3h6"/>' },
    scn: { n: "Mise en situation", s: '<path d="M6 3v18M6 4h12l-3 4 3 4H6"/>' },
    chance: { n: "Coup de pouce", s: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>' },
    souffle: { n: "Souffle", s: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>' },
    phrase: { n: "Phrase clé", s: '<path d="M4 5h16v11H9l-5 4z"/>' },
    peak: { n: "Sommet", s: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>' }
  };
  function icon(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + KINDS[k].s + "</svg>";
  }
  function pt(n) {
    var a = Math.PI / 2 + n * (2 * Math.PI / PER_TURN);
    var r = R0 - (R0 - R1) * n / TRACK;
    return { l: 50 + r * Math.cos(a), t: 50 + r * Math.sin(a), z: ZMAX * n / TRACK };
  }
  var P = [], i;
  for (i = 0; i <= TRACK; i++) { P.push(pt(i)); }

  function clampMove(pos, d) {
    var np = pos + d;
    if (pos < PIVOT && np > PIVOT) { np = PIVOT; }
    if (np > TRACK) { np = TRACK; }
    return np;
  }
  function modOf(pos) { return MODPOS[pos]; }
  function phaseOf(pos) {
    if (MODPOS[pos] >= 0) { return MODPH[MODPOS[pos]]; }
    if (pos <= 0) { return 0; }
    return MODPOS[pos - 1] >= 0 ? MODPH[MODPOS[pos - 1]] : 3;
  }
  function kindOf(pos) { return KIND[pos] || ""; }
  function zcss(z, extra) { return "translateZ(calc(var(--u) * " + z.toFixed(2) + (extra ? " + " + extra + "px" : "") + "))"; }
  function xy(pos) {
    var p = P[Math.max(0, Math.min(TRACK, pos))];
    return { l: p.l, t: p.t + 1.2, z: p.z };
  }
  function rotFor(pos) { return -STEP * pos; }

  /* ---- matière : ruban, supports, tuiles ---- */
  function ribbon() {
    var h = "", n;
    for (n = 0; n < TRACK; n++) {
      var a = P[n], b = P[n + 1];
      var dl = b.l - a.l, dt = b.t - a.t;
      var len = Math.sqrt(dl * dl + dt * dt) + 1.4;
      var ang = Math.atan2(dt, dl) * 180 / Math.PI;
      var zm = (a.z + b.z) / 2;
      var c = PH[phaseOf(n + 1)].c;
      h += '<div class="rb" style="left:' + ((a.l + b.l) / 2).toFixed(2) + "%;top:" + ((a.t + b.t) / 2).toFixed(2) + "%;width:" + len.toFixed(2) + "%;background:" + c + ";transform:translate(-50%,-50%) rotateZ(" + ang.toFixed(1) + "deg) " + zcss(zm - 2.4) + '"></div>';
    }
    return h;
  }
  function stems() {
    var h = "", n;
    for (n = 1; n <= TRACK; n++) {
      var p = P[n];
      h += '<div class="stem" style="left:' + p.l.toFixed(2) + "%;top:" + p.t.toFixed(2) + "%;height:calc(var(--u) * " + (p.z - 2.6).toFixed(2) + ')"></div>';
    }
    return h;
  }
  function tiles(mine) {
    var h = "", n;
    var s = P[0];
    h += '<div class="tile st' + (mine === 0 ? " here" : "") + '" style="left:' + s.l.toFixed(2) + "%;top:" + s.t.toFixed(2) + "%;transform:translate(-50%,-50%) " + zcss(s.z) + '"><span class="tn">Départ</span></div>';
    for (n = 1; n <= TRACK; n++) {
      var p = P[n], k = kindOf(n), ph = PH[phaseOf(n)];
      var cls = "tile" + (k ? " sp" : "") + (n === PIVOT ? " pv" : "") + (n === TRACK ? " pk" : "") + (n === mine ? " here" : "");
      h += '<div class="' + cls + '" style="left:' + p.l.toFixed(2) + "%;top:" + p.t.toFixed(2) + "%;border-color:" + ph.c + ";transform:translate(-50%,-50%) " + zcss(p.z) + '">';
      if (n === TRACK) { h += '<span class="ic">' + icon("peak") + "</span>"; }
      else if (k) { h += '<span class="ic">' + icon(k) + "</span>"; }
      else { h += '<span class="tn">' + n + "</span>"; }
      h += "</div>";
    }
    return h;
  }
  function beacon() {
    var p = P[TRACK];
    var pos = "left:" + p.l.toFixed(2) + "%;top:" + p.t.toFixed(2) + "%;";
    var h = '<div class="beam" style="' + pos + "transform:" + zcss(p.z + 1) + ' rotateX(90deg)"></div>';
    h += '<div class="beam b2" style="' + pos + "transform:" + zcss(p.z + 1) + ' rotateX(90deg) rotateY(90deg)"></div>';
    return h;
  }
  function burst(mine) {
    if (mine !== TRACK) { return ""; }
    var p = P[TRACK], h = '<div class="burst" style="left:' + p.l.toFixed(2) + "%;top:" + p.t.toFixed(2) + "%;transform:" + zcss(p.z + 4) + ' rotateZ(calc(var(--rot) * -1)) rotateX(calc(var(--tilt) * -1))">', k;
    for (k = 0; k < 22; k++) { h += '<i style="--a:' + Math.round(k * 360 / 22) + "deg;--d:" + (26 + (k % 4) * 9) + 'px;animation-delay:' + ((k % 5) * 0.12).toFixed(2) + 's"></i>'; }
    return h + "</div>";
  }
  function legend() {
    var h = '<div class="legend">', k, q;
    for (q = 0; q < PH.length; q++) { h += '<span><i style="background:' + PH[q].c + '"></i>' + PH[q].n + "</span>"; }
    h += '<span><i class="gold"></i>Pivot (case ' + PIVOT + ")</span></div>";
    h += '<div class="legend l2">';
    for (k in KINDS) { if (KINDS.hasOwnProperty(k) && k !== "peak") { h += '<span class="ki">' + icon(k) + KINDS[k].n + "</span>"; } }
    h += "</div>";
    return h + '<div class="hint">Fais glisser le plateau pour le tourner</div>';
  }
  /* fond : image d'un cerveau lumineux (brain.webp, ou window.BRAIN_SRC quand tout est dans une seule page) */
  function brain() {
    return '<img class="brain" alt="" draggable="false" src="' + (window.BRAIN_SRC || "brain.webp") + '">';
  }
  /* pion : un athlète qui porte le sport du joueur */
  var STEPMS = 260;
  var SPORTS = [
    ["rugby", /rugby|ovale|XV/i], ["foot", /foot|soccer|futsal/i], ["basket", /basket|nba/i], ["hand", /hand/i],
    ["volley", /volley|beach/i], ["tennis", /tennis|padel|squash|badminton|ping|raquette/i],
    ["swim", /nata|nage|nageur|water.?polo|plong|aquat/i], ["velo", /v[ée]lo|cyclis|vtt|triathl|bmx/i],
    ["combat", /judo|karat|taekwon|lutte|jiu|aikido|combat|mma|krav/i], ["boxe", /box|kick|muay|escrim/i],
    ["golf", /golf/i], ["run", /ath[lé]|cours|run|marathon|sprint|trail|saut|lancer|cross/i]
  ];
  function sportKind(s) {
    var t = String(s || ""), i;
    for (i = 0; i < SPORTS.length; i++) { if (SPORTS[i][1].test(t)) { return SPORTS[i][0]; } }
    return "def";
  }
  /* tête du pion : l'objet du sport, dessiné autour de (0,0) */
  function headFor(k) {
    var w = '#fff', d = '#0D1B3E';
    if (k === "rugby") { return '<ellipse rx="11" ry="6.8" transform="rotate(-22)" fill="#a8582a" stroke="' + d + '" stroke-width=".9"/><path transform="rotate(-22)" d="M-6.5 -5.4 Q-7.6 0 -6.5 5.4 M6.5 -5.4 Q7.6 0 6.5 5.4" stroke="' + w + '" stroke-width="1.3" fill="none"/><path transform="rotate(-22)" d="M-3 0 H3 M-2 -1.6 V1.6 M0 -1.6 V1.6 M2 -1.6 V1.6" stroke="' + w + '" stroke-width=".8"/>'; }
    if (k === "foot") { return '<circle r="9.4" fill="' + w + '" stroke="' + d + '" stroke-width=".9"/><path d="M0 -4.4 L4.2 -1.4 L2.6 3.6 L-2.6 3.6 L-4.2 -1.4 Z" fill="' + d + '"/><path d="M0 -4.4 V-9 M4.2 -1.4 L8.6 -3 M2.6 3.6 L5.4 7.6 M-2.6 3.6 L-5.4 7.6 M-4.2 -1.4 L-8.6 -3" stroke="' + d + '" stroke-width="1"/>'; }
    if (k === "basket") { return '<circle r="9.4" fill="#ee7a2a" stroke="#5a2a10" stroke-width=".9"/><path d="M-9.4 0 H9.4 M0 -9.4 V9.4 M-6.6 -6.6 Q0 0 -6.6 6.6 M6.6 -6.6 Q0 0 6.6 6.6" stroke="#5a2a10" stroke-width="1" fill="none"/>'; }
    if (k === "hand") { return '<circle r="9.2" fill="' + w + '" stroke="' + d + '" stroke-width=".9"/><path d="M-9.2 0 H9.2 M0 -9.2 V9.2" stroke="#2a62d6" stroke-width="2.4"/><circle r="9.2" fill="none" stroke="#2a62d6" stroke-width=".8"/>'; }
    if (k === "volley") { return '<circle r="9.4" fill="' + w + '" stroke="' + d + '" stroke-width=".9"/><path d="M-9 -2.4 Q0 3.6 9 -2.4 M-4 -8.6 Q4 -1 -1.6 9.2 M6.4 -7 Q-2 -.4 5 8" stroke="#e8b04b" stroke-width="2" fill="none"/><path d="M-9 -2.4 Q0 3.6 9 -2.4" stroke="#2a62d6" stroke-width=".8" fill="none"/>'; }
    if (k === "tennis") { return '<circle r="9" fill="#d7ec3c" stroke="#7f9a12" stroke-width=".9"/><path d="M-7.4 -5 Q-1.6 0 -7.4 5 M7.4 -5 Q1.6 0 7.4 5" stroke="' + w + '" stroke-width="1.5" fill="none"/>'; }
    if (k === "golf") { return '<circle r="9" fill="' + w + '" stroke="#b9c0d2" stroke-width=".9"/><circle cx="-3" cy="-3" r=".8" fill="#b9c0d2"/><circle cx="1.6" cy="-4.6" r=".8" fill="#b9c0d2"/><circle cx="4.4" cy="-.6" r=".8" fill="#b9c0d2"/><circle cx="-4.6" cy="1.8" r=".8" fill="#b9c0d2"/><circle cx="-.4" cy=".8" r=".8" fill="#b9c0d2"/><circle cx="3" cy="4.4" r=".8" fill="#b9c0d2"/><circle cx="-2" cy="5.6" r=".8" fill="#b9c0d2"/>'; }
    if (k === "swim") { return '<circle r="9.4" fill="#2a8fd6" stroke="' + w + '" stroke-width=".9"/><path d="M-9.4 -1 H9.4" stroke="' + w + '" stroke-width="1.2"/><rect x="-7.6" y="-.2" width="15.2" height="5.6" rx="2.8" fill="#12294f" stroke="#7fe3e6" stroke-width=".9"/><circle cx="-3.4" cy="2.6" r="1.6" fill="#7fe3e6"/><circle cx="3.4" cy="2.6" r="1.6" fill="#7fe3e6"/><path d="M-6 -6.4 Q0 -9.4 6 -6.4" stroke="' + w + '" stroke-width=".9" fill="none" opacity=".7"/>'; }
    if (k === "velo") { return '<circle r="8.4" fill="none" stroke="#1c2540" stroke-width="3.4"/><circle r="8.4" fill="none" stroke="' + w + '" stroke-width="1.1"/><path d="M-8 0 H8 M0 -8 V8 M-5.6 -5.6 L5.6 5.6 M5.6 -5.6 L-5.6 5.6" stroke="' + w + '" stroke-width=".7"/><circle r="1.6" fill="#FFBD59"/>'; }
    if (k === "boxe") { return '<path d="M-7 -2 Q-8.6 -9.6 0 -9.6 Q9 -9.6 8 -1.6 Q7.4 3.6 5.4 5.4 L-5 5.4 Q-7 3 -7 -2 Z" fill="#e2453c" stroke="' + w + '" stroke-width=".9"/><ellipse cx="-6.6" cy="1.2" rx="3.2" ry="4" fill="#c0302a" stroke="' + w + '" stroke-width=".7"/><rect x="-5.6" y="5" width="11" height="4.4" rx="1.4" fill="' + w + '" stroke="' + d + '" stroke-width=".6"/>'; }
    if (k === "combat") { return '<path d="M-3 4 L-9 9 L-5.6 10 L-1 6 Z M3 4 L9 9 L5.6 10 L1 6 Z" fill="#14141c" stroke="' + w + '" stroke-width=".6"/><rect x="-10" y="-5" width="20" height="8" rx="2.6" fill="#14141c" stroke="' + w + '" stroke-width=".8"/><rect x="-4" y="-6.4" width="8" height="10.4" rx="2" fill="#2a2a38" stroke="' + w + '" stroke-width=".8"/><path d="M-10 -1 H-4 M4 -1 H10" stroke="#FFBD59" stroke-width="1"/>'; }
    if (k === "run") { return '<rect x="-2" y="-12" width="4" height="3" rx=".8" fill="' + w + '"/><circle r="9" fill="' + w + '" stroke="' + d + '" stroke-width=".9"/><circle r="7" fill="' + d + '"/><path d="M0 0 V-5 M0 0 L3.6 2.2" stroke="#FFBD59" stroke-width="1.3" stroke-linecap="round"/><circle r="1" fill="' + w + '"/><path d="M0 -6.2 V-5.2 M6.2 0 H5.2 M0 6.2 V5.2 M-6.2 0 H-5.2" stroke="' + w + '" stroke-width=".7"/>'; }
    return '<circle r="9.4" fill="#FFBD59" stroke="' + w + '" stroke-width=".9"/><circle r="6.6" fill="none" stroke="#0D1B3E" stroke-width=".8" opacity=".6"/><path d="M0 -5.2 L1.5 -1.6 L5.2 -1.4 L2.4 1 L3.3 4.8 L0 2.8 L-3.3 4.8 L-2.4 1 L-5.2 -1.4 L-1.5 -1.6 Z" fill="#0D1B3E"/>';
  }
  /* le pion : une vraie pièce de jeu, couleur du joueur, couronnée de l'objet de son sport */
  function athlete(color, ini, sport) {
    var c = String(color || "#FFBD59"), k = sportKind(sport);
    var spin = (k === "foot" || k === "basket" || k === "hand" || k === "volley" || k === "tennis" || k === "golf" || k === "velo" || k === "rugby") ? " rot" : " wob";
    return '<svg class="pw k-' + k + '" viewBox="0 0 44 64" aria-hidden="true" style="--pc:' + c + '">' +
      '<ellipse cx="22" cy="57.6" rx="15" ry="4.6" fill="#000" opacity=".4"/>' +
      '<ellipse cx="22" cy="55" rx="15" ry="5" style="fill:var(--pc)"/><ellipse cx="22" cy="55" rx="15" ry="5" fill="#000" opacity=".28"/>' +
      '<ellipse cx="22" cy="52.6" rx="15" ry="5" style="fill:var(--pc)" stroke="#fff" stroke-width=".9"/><ellipse cx="19" cy="51.6" rx="8" ry="1.6" fill="#fff" opacity=".35"/>' +
      '<path d="M13 52 C15 44 17.6 38.6 18.6 33 L25.4 33 C26.4 38.6 29 44 31 52 Z" style="fill:var(--pc)" stroke="#fff" stroke-width=".9"/>' +
      '<path d="M16.6 50 C18 44 19.8 39.6 20.4 34.6" stroke="#fff" stroke-width="2.2" fill="none" opacity=".4" stroke-linecap="round"/>' +
      '<path d="M26.4 36 C27.4 41 29 45.6 30 50 L31 52 C29 44 26.4 38.6 25.4 33 Z" fill="#000" opacity=".22"/>' +
      '<text x="22" y="47.2" text-anchor="middle" class="pn">' + ini + '</text>' +
      '<ellipse cx="22" cy="33" rx="9.4" ry="3.1" style="fill:var(--pc)" stroke="#fff" stroke-width=".9"/><ellipse cx="22" cy="31.8" rx="6.2" ry="1.2" fill="#fff" opacity=".35"/>' +
      '<g transform="translate(22 20.4)"><g class="hd' + spin + '">' + headFor(k) + '</g></g></svg>';
  }
  var SHOWN = {}, ANIM = {};
  var off = 0;
  function html(list, meId, pawnHtml, shown) {
    var mine = -1, i2, base = 0;
    for (i2 = 0; i2 < list.length; i2++) { if (list[i2].id === meId) { mine = list[i2].pos; base = rotFor(shown && shown[meId] !== undefined ? shown[meId] : mine); } }
    var h = '<div class="scene"><div class="board3d"><div class="spin" data-base="' + base + '" style="--rot:' + (base + off) + 'deg"><div class="ground">' + brain() + '</div>';
    h += '<div class="pillar" style="height:calc(var(--u) * ' + ZMAX + ')"></div>';
    h += ribbon() + tiles(mine) + beacon() + burst(mine);
    var cnt = {}, ix = {};
    for (i2 = 0; i2 < list.length; i2++) {
      ix[list[i2].id] = cnt[list[i2].pos] || 0;
      cnt[list[i2].pos] = ix[list[i2].id] + 1;
    }
    for (i2 = 0; i2 < list.length; i2++) {
      var p = list[i2];
      var from = shown && shown[p.id] !== undefined ? shown[p.id] : p.pos;
      var q = xy(from);
      var idx = ix[p.id];
      var dx = idx === 0 ? 0 : (idx % 2 ? 1 : -1) * Math.ceil(idx / 2) * 14;
      h += '<div class="pawn3' + (p.id === meId ? " me" : "") + '" data-id="' + p.id + '" data-pos="' + p.pos + '" data-ix="' + idx + '" style="left:' + q.l + "%;top:" + q.t + "%;margin-left:" + dx + "px;transform:" + zcss(q.z, 6) + '">';
      h += pawnHtml(p) + "</div>";
    }
    return h + "</div></div></div>" + legend();
  }
  function place(el, pos) {
    var q = xy(pos);
    el.style.left = q.l + "%"; el.style.top = q.t + "%";
    el.style.transform = zcss(q.z, 6);
    if (el.className.indexOf("me") >= 0) {
      var sp = el.parentNode;
      off = 0;
      sp.setAttribute("data-base", rotFor(pos));
      sp.style.setProperty("--rot", rotFor(pos) + "deg");
    }
  }
  function stepPawn(el, delay) {
    var id = el.getAttribute("data-id");
    var target = parseInt(el.getAttribute("data-pos"), 10);
    var cur = SHOWN[id] === undefined ? target : SHOWN[id];
    var tk = (ANIM[id] || 0) + 1;
    ANIM[id] = tk;
    if (cur > target) { cur = target; place(el, cur); }
    SHOWN[id] = cur;
    function hop() {
      if (ANIM[id] !== tk) { return; }
      if (cur >= target) { SHOWN[id] = target; el.className = el.className.replace(" run", ""); return; }
      if (el.className.indexOf(" run") < 0) { el.className += " run"; }
      cur = cur + 1; SHOWN[id] = cur;
      place(el, cur);
      var pp = el.querySelector(".pp");
      if (pp) { pp.className = "pp"; void pp.offsetWidth; pp.className = "pp hop"; }
      setTimeout(hop, STEPMS);
    }
    setTimeout(hop, delay);
  }
  /* glisser pour tourner le plateau */
  function bind(root) {
    var sc = root.querySelector(".scene");
    if (!sc) { return; }
    var sp = sc.querySelector(".spin");
    var down = false, lx = 0;
    sc.addEventListener("pointerdown", function (e) {
      down = true; lx = e.clientX; sp.className = "spin drag";
      try { sc.setPointerCapture(e.pointerId); } catch (x) {}
    });
    sc.addEventListener("pointermove", function (e) {
      if (!down) { return; }
      off += (e.clientX - lx) * 0.55; lx = e.clientX;
      sp.style.setProperty("--rot", (parseFloat(sp.getAttribute("data-base") || "0") + off) + "deg");
    });
    function end() { down = false; sp.className = "spin"; }
    sc.addEventListener("pointerup", end);
    sc.addEventListener("pointercancel", end);
  }
  /* le pilier de lumière est mesuré en 3D puis remplacé par un calque 2D : un plan vertical au centre du plateau coupait les cases alignées avec lui */
  function flatPillar(root) {
    var pl = root.querySelector(".pillar"), sc = root.querySelector(".scene");
    if (!pl || !sc) { return; }
    var r = pl.getBoundingClientRect(), s = sc.getBoundingClientRect();
    var d = document.createElement("div");
    d.className = "pcol";
    d.style.left = (r.left - s.left + r.width / 2) + "px";
    d.style.top = (r.top - s.top) + "px";
    d.style.height = r.height + "px";
    d.innerHTML = "<i></i>";
    sc.insertBefore(d, sc.firstChild);
    pl.parentNode.removeChild(pl);
  }
  function animate(root, delay) {
    flatPillar(root);
    var els = root.querySelectorAll(".pawn3"), k2;
    for (k2 = 0; k2 < els.length; k2++) { stepPawn(els[k2], delay === undefined ? 150 : delay); }
    bind(root);
  }

  /* ---- dé 3D ---- */
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  /* orientation du cube : [rotateX, rotateZ] qui amène la face v sur le dessus */
  var ORIENT = { 1: [90, 0], 2: [0, -90], 3: [0, 0], 4: [180, 0], 5: [0, 90], 6: [-90, 0] };
  function cubeT(v, sx, sy, sz) {
    var o = ORIENT[v];
    return "rotateX(-62deg) rotateY(-24deg) rotateX(" + sx + "deg) rotateY(" + sy + "deg) rotateZ(" + sz + "deg) rotateX(" + o[0] + "deg) rotateZ(" + o[1] + "deg)";
  }
  function dieHtml(v) {
    var h = '<div class="dstage" id="dstage"><div class="cube" id="cube" data-sx="0" data-sy="0" data-sz="0" style="transform:' + cubeT(v, 0, 0, 0) + '">', f, k;
    for (f = 1; f <= 6; f++) {
      h += '<div class="face f' + f + '">';
      for (k = 0; k < 9; k++) { h += PIPS[f].indexOf(k) >= 0 ? "<b class=\"p\"></b>" : "<b></b>"; }
      h += "</div>";
    }
    return h + '</div><div class="dshadow"></div></div>';
  }
  function tumble(v) {
    var c = document.getElementById("cube"), st = document.getElementById("dstage");
    if (!c || !st) { return; }
    var sx = parseInt(c.getAttribute("data-sx"), 10) + 720, sy = parseInt(c.getAttribute("data-sy"), 10) + 1080, sz = parseInt(c.getAttribute("data-sz"), 10) + 360;
    c.setAttribute("data-sx", sx); c.setAttribute("data-sy", sy); c.setAttribute("data-sz", sz);
    c.style.transition = "none";
    c.style.transform = cubeT(1, 0, 0, 0);
    void c.offsetWidth;
    st.className = "dstage throw";
    c.style.transition = "transform 1.3s cubic-bezier(.17,.8,.25,1)";
    c.style.transform = cubeT(v, sx, sy, sz);
    setTimeout(function () { var s2 = document.getElementById("dstage"); if (s2) { s2.className = "dstage"; } }, 1450);
  }

  window.Board = {
    TRACK: TRACK, PIVOT: PIVOT, DIE: DIE, PH: PH, KINDS: KINDS, MODPH: MODPH,
    kindOf: kindOf, modOf: modOf, phaseOf: phaseOf, clampMove: clampMove,
    xy: xy, html: html, animate: animate, shown: SHOWN, icon: icon,
    dieHtml: dieHtml, tumble: tumble, athlete: athlete, sportKind: sportKind, STEPMS: STEPMS
  };
})();
