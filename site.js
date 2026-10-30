// ===== Business info: change things here, not in the page =====
var BIZ = {
  owner: "Michael Papa",
  phone: "416-569-0776",
  years: 24,
  base: "North York",
  licenceNo: "T85-3954149",   // City of Toronto business licence, from his BBB profile. Check it's current.
  logo: "",                   // put his logo file in this folder, then e.g. "logo.png"
  services: ["Exterior waterproofing", "Interior waterproofing", "Foundation cracks", "Sump pumps", "Underpinning", "Renovations", "Landscaping"]
};
// ===============================================================

// City of Toronto Basement Flooding Protection Subsidy, for work finished on or after Nov 12, 2025.
// The City pays 80% of each paid invoice, up to the max. Source: toronto.ca, checked Oct 30, 2026.
var REBATES = [
  { name: "Sump pump, with alarm", max: 2250 },
  { name: "Battery backup for the sump pump", max: 300 },
  { name: "Backwater valve, with alarm", max: 1600 },
  { name: "Second backwater valve", max: 1600 },
  { name: "Cutting and capping the foundation drain", max: 400 },
  { name: "Home plumbing assessment by a licensed plumber", max: 500 }
];

document.documentElement.classList.add("js");

(function () {
  var digits = BIZ.phone.replace(/\D/g, "");
  var e164 = "+" + (digits.length === 10 ? "1" + digits : digits);
  document.querySelectorAll("[data-biz]").forEach(function (el) { var v = BIZ[el.dataset.biz]; if (v != null) el.textContent = v; });
  document.querySelectorAll("[data-tel]").forEach(function (a) { a.href = "tel:" + e164; });
  document.querySelectorAll("[data-sms]").forEach(function (a) { a.href = "sms:" + e164; });
  document.getElementById("yr").textContent = new Date().getFullYear();
  if (BIZ.logo) { var mark = document.getElementById("logo-mark"); mark.innerHTML = ""; var img = new Image(); img.src = BIZ.logo; img.alt = ""; mark.appendChild(img); }

  // ticker: the list twice, so it loops without a gap
  var track = document.getElementById("ticker");
  BIZ.services.concat(BIZ.services).forEach(function (s) { var el = document.createElement("span"); el.textContent = s; track.appendChild(el); });

  // ===== cross-section: yellow callouts are sized to their text =====
  var fig = document.getElementById("fig");
  var NS = "http://www.w3.org/2000/svg";
  function sizeTags(svg) {
    (svg || fig).querySelectorAll(".tag").forEach(function (g) {
      var t = g.querySelector("text"), r = g.querySelector("rect");
      if (!r) { r = document.createElementNS(NS, "rect"); r.setAttribute("rx", 4); g.insertBefore(r, t); }
      var w = t.getComputedTextLength() + 20, y = +g.dataset.y;
      var x = g.dataset.end ? +g.dataset.end - w : +g.dataset.x;
      r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("width", w); r.setAttribute("height", 26);
      t.setAttribute("x", x + 10); t.setAttribute("y", y + 18.5);
    });
  }
  sizeTags();
  if (document.fonts) document.fonts.ready.then(function () { sizeTags(); });

  // ===== cross-section: which step is showing =====
  var steps = [].slice.call(document.querySelectorAll(".step"));
  var parts = [].slice.call(fig.querySelectorAll("[data-s]"));
  var figN = document.getElementById("fig-n"), figT = document.getElementById("fig-t"), bar = document.getElementById("fig-bar");
  function inStage(spec, n) {
    return spec.split(",").some(function (p) { var ab = p.split("-").map(Number); return n >= ab[0] && n <= (ab.length > 1 ? ab[1] : ab[0]); });
  }
  // fixes.js uses these for the "how it gets fixed" slideshows
  window.WZ = { sizeTags: sizeTags, inStage: inStage, phone: e164 };
  var current = -1;
  function show(n) {
    if (n === current) return;
    current = n;
    parts.forEach(function (el) { el.classList.toggle("off", !inStage(el.dataset.s, n)); });
    steps.forEach(function (s, i) { s.classList.toggle("on", i === n); });
    figN.textContent = "0" + (n + 1);
    figT.textContent = steps[n].querySelector("h3").textContent;
    bar.style.transform = "scaleX(" + (n + 1) / steps.length + ")";
  }
  // A step is current once its top passes a line on the screen: the middle on wide screens,
  // lower down on phones, where the drawing sits at the top.
  var wide = matchMedia("(min-width: 901px)"), ticking = false;
  function pick() {
    ticking = false;
    var line = innerHeight * (wide.matches ? 0.55 : 0.78), n = 0;
    steps.forEach(function (s, i) { if (s.getBoundingClientRect().top < line) n = i; });
    show(n);
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }, { passive: true });
  addEventListener("resize", pick);
  pick();

  // ===== City rebate calculator =====
  var list = document.getElementById("items");
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-CA"); };
  REBATES.forEach(function (r, i) {
    var row = document.createElement("div");
    row.className = "item";
    row.innerHTML =
      '<input type="checkbox" id="rb' + i + '">' +
      '<label for="rb' + i + '"></label>' +
      '<span class="max">max ' + money(r.max) + '</span>' +
      '<span class="quote" hidden><label for="rq' + i + '">Your quote $</label><input id="rq' + i + '" type="number" min="0" step="50" inputmode="numeric" placeholder="optional"><output></output></span>';
    row.querySelector("label").textContent = r.name;
    list.appendChild(row);
  });
  // The City pays for a second valve only alongside a first one
  var valve1 = document.getElementById("rb2"), valve2 = document.getElementById("rb3");
  valve1.addEventListener("change", function () { if (!valve1.checked) valve2.checked = false; });
  valve2.addEventListener("change", function () { if (valve2.checked) valve1.checked = true; });
  function update() {
    var total = 0, picked = 0, allQuoted = true;
    REBATES.forEach(function (r, i) {
      var on = document.getElementById("rb" + i).checked;
      var q = document.getElementById("rq" + i), box = q.parentNode, out = box.querySelector("output");
      box.hidden = !on;
      if (!on) return;
      picked++;
      var cost = parseFloat(q.value);
      var back = cost > 0 ? Math.min(cost * 0.8, r.max) : r.max;
      if (!(cost > 0)) allQuoted = false;
      out.textContent = cost > 0 ? money(back) + " back" : "";
      total += back;
    });
    document.getElementById("total").textContent = money(total);
    document.getElementById("total-note").textContent = !picked ? "Tick an item to start."
      : allQuoted ? "That's 80% of your quotes, within the City's limits."
      : "That's the most the City pays for what you ticked. Add your quotes for a closer number.";
  }
  document.getElementById("calc").addEventListener("input", update);
  update();
})();
