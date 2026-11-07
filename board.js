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
  /* fond : cerveau en lignes lumineuses (hémisphère construit par le calcul, puis symétrique) */
  function hemiPath(k, amp, freq, ph, a0, a1) {
    var pts = [], n = 64, i, t, th, r, x, y;
    for (i = 0; i <= n; i++) {
      t = a0 + (a1 - a0) * i / n;
      th = (t - 0.5) * Math.PI;
      r = k * (1 + amp * Math.sin(freq * th + ph));
      x = 98 - 80 * r * Math.cos(th) * (1 - 0.08 * Math.sin(th) * Math.sin(th));
      y = 100 + 86 * r * Math.sin(th);
      pts.push(x.toFixed(1) + " " + y.toFixed(1));
    }
    return "M" + pts.join(" L");
  }
  var BR_OUT = hemiPath(1, 0.035, 11, 0.6, 0.02, 0.98);
  var BR_FIS = "M99 14 C95 40 103 62 98 88 C94 112 103 134 98 158 C96 172 99 180 99 186";
  var BR_GYR = [
    [hemiPath(0.8, 0.07, 13, 0.2, 0.08, 0.92), "1"],
    [hemiPath(0.58, 0.09, 15, 1.4, 0.14, 0.86), "2"],
    [hemiPath(0.36, 0.1, 17, 2.1, 0.22, 0.78), "3"],
    ["M26 112 C38 106 46 114 58 106 C68 100 74 106 84 100", "4"],
    ["M36 70 C46 62 52 72 62 64 C70 58 78 64 86 58", "5"],
    ["M44 138 C52 132 60 140 70 134 C78 130 84 134 90 128", "6"]
  ];
  var BR_NODES = [[72, 56], [64, 100], [58, 130], [48, 78], [80, 140], [34, 100], [84, 80]];
  function brainHemi(flip) {
    var h = '<g' + (flip ? ' transform="translate(198 0) scale(-1 1)"' : "") + ">", i;
    h += '<path class="bw" d="' + BR_OUT + '"/><path class="bl" d="' + BR_OUT + '"/>';
    for (i = 0; i < BR_GYR.length; i++) { h += '<path class="gw" d="' + BR_GYR[i][0] + '"/><path class="gl g' + BR_GYR[i][1] + '" d="' + BR_GYR[i][0] + '"/>'; }
    h += '<path class="fl" pathLength="100" style="animation-delay:' + (flip ? -3 : 0) + 's" d="' + BR_OUT + '"/>';
    for (i = 0; i < BR_NODES.length; i++) { h += '<circle class="nd" style="animation-delay:' + ((i * 0.45 + (flip ? 0.2 : 0)) % 3).toFixed(2) + 's" cx="' + BR_NODES[i][0] + '" cy="' + BR_NODES[i][1] + '" r="1.8"/>'; }
    return h + "</g>";
  }
  function brain() {
    return '<svg class="brain" viewBox="0 0 200 200" aria-hidden="true">' + brainHemi(false) + brainHemi(true) +
      '<path class="bw" d="' + BR_FIS + '"/><path class="bl" d="' + BR_FIS + '"/></svg>';
  }
  /* pion : un athlète qui court */
  function athlete(color, ini) {
    var c = String(color || "#FFBD59");
    return '<svg class="ath" viewBox="0 0 44 66" aria-hidden="true">' +
      '<g class="lg l"><path d="M17 42 L15.5 56" class="sk"/><path d="M15.5 56 L15.5 60" class="so"/><ellipse cx="14.6" cy="62" rx="4.4" ry="2.2" class="sh2"/></g>' +
      '<g class="lg r"><path d="M27 42 L28.5 56" class="sk"/><path d="M28.5 56 L28.5 60" class="so"/><ellipse cx="29.4" cy="62" rx="4.4" ry="2.2" class="sh2"/></g>' +
      '<g class="bd"><path d="M13 19 Q22 14 31 19 L30 37 Q22 40 14 37 Z" style="fill:' + c + '" stroke="#fff" stroke-width="1"/>' +
      '<rect x="13.5" y="36" width="17" height="8" rx="2" class="st"/><rect x="13.5" y="38.5" width="17" height="1.4" class="gd"/>' +
      '<text x="22" y="32" text-anchor="middle" class="nb">' + ini + '</text>' +
      '<g class="ar l"><path d="M13.5 20 L9 32" class="sk"/><circle cx="8.6" cy="33.4" r="2" class="hd"/></g>' +
      '<g class="ar r"><path d="M30.5 20 L35 32" class="sk"/><circle cx="35.4" cy="33.4" r="2" class="hd"/></g>' +
      '<circle cx="22" cy="10" r="6.2" class="hd"/><path d="M15.8 9 Q22 1.2 28.2 9 L28.2 7.6 Q22 -.4 15.8 7.6 Z" class="ha"/><rect x="15.9" y="7.3" width="12.2" height="2.2" rx="1" class="hb"/></g>' +
      '<circle class="ball" cx="37" cy="60" r="3.3"/></svg>';
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
      setTimeout(hop, 330);
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
  function animate(root, delay) {
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
    dieHtml: dieHtml, tumble: tumble, athlete: athlete
  };
})();
