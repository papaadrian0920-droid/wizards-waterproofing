// ===== Business info: change things here, not in the pages =====
var BIZ = {
  owner: "Michael Papa",
  phone: "416-569-0776",
  years: 24,
  base: "North York",
  licenceNo: "T85-3954149",   // City of Toronto business licence, from his BBB profile. Check it's current.
  instagram: "michaelwpapa",
  logo: ""                    // put his logo file in /assets, then e.g. "assets/logo.png"
};

// Real job photos for the Projects page. Leave it empty until Michael sends real ones. Never use stock photos.
// Example: { src: "assets/jobs/crack-yonge.jpg", title: "Leaking crack sealed", area: "North York" }
var PROJECTS = [];

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
// ===============================================================

document.documentElement.classList.add("js");

(function () {
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var digits = BIZ.phone.replace(/\D/g, "");
  var e164 = "+" + (digits.length === 10 ? "1" + digits : digits);

  $$("[data-biz]").forEach(function (el) { var v = BIZ[el.dataset.biz]; if (v != null) el.textContent = v; });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + e164; });
  $$("[data-sms]").forEach(function (a) { a.href = "sms:" + e164; });
  $$("[data-ig]").forEach(function (a) { a.href = "https://www.instagram.com/" + BIZ.instagram + "/"; });
  $$(".yr").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (BIZ.logo) $$(".logo-mark").forEach(function (m) { m.innerHTML = '<img src="' + BIZ.logo + '" alt="">'; });

  // ===== phone menu =====
  var menuBtn = $(".menu-btn");
  if (menuBtn) menuBtn.addEventListener("click", function () {
    var open = document.body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu-open")) menuBtn.click(); });

  // ===== things slide in as you scroll to them =====
  if ("IntersectionObserver" in window && !still) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else $$(".rv").forEach(function (el) { el.classList.add("in"); });

  // ===== drawings: yellow callouts sized to their text, parts that show per step =====
  var NS = "http://www.w3.org/2000/svg";
  function sizeTags(svg) {
    if (!svg) return;
    svg.querySelectorAll(".tag").forEach(function (g) {
      var t = g.querySelector("text"), r = g.querySelector("rect");
      if (!t) return;
      if (!r) { r = document.createElementNS(NS, "rect"); r.setAttribute("rx", 4); g.insertBefore(r, t); }
      var w = t.getComputedTextLength() + 20, y = +g.dataset.y;
      var x = g.dataset.end ? +g.dataset.end - w : +g.dataset.x;
      r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("width", w); r.setAttribute("height", 26);
      t.setAttribute("x", x + 10); t.setAttribute("y", y + 18.5);
    });
  }
  function inStage(spec, n) {
    return spec.split(",").some(function (p) { var ab = p.split("-").map(Number); return n >= ab[0] && n <= (ab.length > 1 ? ab[1] : ab[0]); });
  }
  window.WZ = { sizeTags: sizeTags, inStage: inStage, phone: e164 };
  function resizeAllTags() { $$("svg").forEach(function (s) { if (s.querySelector(".tag")) sizeTags(s); }); }
  if (document.fonts) document.fonts.ready.then(resizeAllTags);

  // ===== services: the scroll-through exterior waterproofing drawing =====
  var fig = $("#fig");
  if (fig) {
    sizeTags(fig);
    var steps = $$(".step"), parts = $$("[data-s]", fig), current = -1;
    var figN = $("#fig-n"), figT = $("#fig-t"), bar = $("#fig-bar");
    var show = function (n) {
      if (n === current) return;
      current = n;
      parts.forEach(function (el) { el.classList.toggle("off", !inStage(el.dataset.s, n)); });
      steps.forEach(function (s, i) { s.classList.toggle("on", i === n); });
      figN.textContent = "0" + (n + 1);
      figT.textContent = steps[n].querySelector("h3").textContent;
      bar.style.transform = "scaleX(" + (n + 1) / steps.length + ")";
    };
    var wide = matchMedia("(min-width: 901px)"), ticking = false;
    var pick = function () {
      ticking = false;
      var line = innerHeight * (wide.matches ? 0.55 : 0.78), n = 0;
      steps.forEach(function (s, i) { if (s.getBoundingClientRect().top < line) n = i; });
      show(n);
    };
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }, { passive: true });
    addEventListener("resize", pick);
    pick();
  }

  // ===== services: City rebate calculator =====
  var calc = $("#calc");
  if (calc) {
    var list = $("#items");
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
    var valve1 = $("#rb2"), valve2 = $("#rb3");
    valve1.addEventListener("change", function () { if (!valve1.checked) valve2.checked = false; });
    valve2.addEventListener("change", function () { if (valve2.checked) valve1.checked = true; });
    var update = function () {
      var total = 0, picked = 0, allQuoted = true;
      REBATES.forEach(function (r, i) {
        var on = $("#rb" + i).checked;
        var q = $("#rq" + i), box = q.parentNode, out = box.querySelector("output");
        box.hidden = !on;
        if (!on) return;
        picked++;
        var cost = parseFloat(q.value);
        var back = cost > 0 ? Math.min(cost * 0.8, r.max) : r.max;
        if (!(cost > 0)) allQuoted = false;
        out.textContent = cost > 0 ? money(back) + " back" : "";
        total += back;
      });
      $("#total").textContent = money(total);
      $("#total-note").textContent = !picked ? "Tick an item to start."
        : allQuoted ? "That's 80% of your quotes, within the City's limits."
        : "That's the most the City pays for what you ticked. Add your quotes for a closer number.";
    };
    calc.addEventListener("input", update);
    update();
  }

  // ===== cards lean toward the cursor =====
  if (!still && matchMedia("(hover: hover)").matches) {
    $$(".tile").forEach(function (t) {
      t.addEventListener("pointermove", function (e) {
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.transform = "rotateX(" + (0.5 - y) * 10 + "deg) rotateY(" + (x - 0.5) * 12 + "deg) translateZ(0)";
        t.style.setProperty("--mx", x * 100 + "%"); t.style.setProperty("--my", y * 100 + "%");
      });
      t.addEventListener("pointerleave", function () { t.style.transform = ""; });
    });
  }

  // ===== before / after sliders =====
  // Drawn ones come from the "how it gets fixed" drawings: first step = before, last step = after.
  function drawing(key, stage) {
    var f = FIXES[key];
    var wrap = document.createElement("div");
    wrap.innerHTML = '<svg viewBox="0 0 600 440" aria-hidden="true">' + f.svg + '</svg>';
    wrap.querySelectorAll("[data-s]").forEach(function (el) {
      if (inStage(el.dataset.s, stage)) el.classList.remove("off"); else el.style.display = "none";
    });
    return wrap.innerHTML;
  }
  // fixes.js loads after this file, so build the sliders once every script has run
  document.addEventListener("DOMContentLoaded", function () {
  $$("[data-ba]").forEach(function (host) {
    if (typeof FIXES === "undefined") return;
    var key = host.dataset.ba, f = FIXES[key];
    if (!f) return;
    var last = f.steps.length - 1;
    host.innerHTML =
      '<div class="ba" style="--pos:50%">' +
        '<div class="side before">' + drawing(key, 0) + '</div>' +
        '<div class="side after">' + drawing(key, last) + '</div>' +
        '<span class="badge b">Before</span><span class="badge a">After</span>' +
        '<div class="handle"><button type="button" aria-label="Drag to compare before and after" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">↔</button></div>' +
      '</div>' +
      '<div class="ba-cap"><b>' + f.title + '</b><span class="mono">Drawing · ' + f.steps[0][0] + ' → ' + f.steps[last][0] + '</span></div>';
    host.classList.add("ba-wrap");
    $$("svg", host).forEach(sizeTags);
  });
  $$(".ba").forEach(function (ba) {
    var btn = $(".handle button", ba), dragging = false;
    var set = function (p) {
      p = Math.max(0, Math.min(100, p));
      ba.style.setProperty("--pos", p + "%");
      btn.setAttribute("aria-valuenow", Math.round(p));
    };
    var fromEvent = function (e) { var r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    ba.addEventListener("pointerdown", function (e) { dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener("pointerup", function () { dragging = false; });
    ba.addEventListener("pointercancel", function () { dragging = false; });
    btn.addEventListener("keydown", function (e) {
      var now = parseFloat(ba.style.getPropertyValue("--pos")) || 50;
      if (e.key === "ArrowLeft") { set(now - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { set(now + 5); e.preventDefault(); }
    });
    // a little nudge the first time it scrolls into view, so people know it moves
    if (!still && "IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        seen.disconnect();
        var t0 = performance.now();
        (function wiggle(t) {
          var k = (t - t0) / 1400;
          if (k >= 1 || dragging) return set(50);
          set(50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k));
          requestAnimationFrame(wiggle);
        })(t0);
      }, { threshold: 0.6 });
      seen.observe(ba);
    }
  });
  });

  // ===== projects: real photos, only once there are some =====
  var real = $("#real");
  if (real) {
    if (!PROJECTS.length) { real.closest("section").hidden = true; }
    else PROJECTS.forEach(function (p) {
      var f = document.createElement("figure");
      f.innerHTML = '<img loading="lazy" alt=""><figcaption><span></span><b></b></figcaption>';
      f.querySelector("img").src = p.src; f.querySelector("img").alt = p.title;
      f.querySelector("span").textContent = p.area || ""; f.querySelector("b").textContent = p.title;
      real.appendChild(f);
    });
  }

  // ===== big numbers count up when they appear =====
  $$("[data-count]").forEach(function (el) {
    var to = +el.dataset.count, pre = el.dataset.pre || "";
    var fmt = function (n) { return pre + Math.round(n).toLocaleString("en-CA"); };
    if (still || !("IntersectionObserver" in window)) { el.textContent = fmt(to); return; }
    el.textContent = fmt(0);
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 4);
        el.textContent = fmt(to * e);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.5 });
    o.observe(el);
  });

  // ===== contact: the form writes a text message to Michael =====
  // There's no server, so nothing is stored. It opens the phone's Messages app with everything filled in.
  var form = $("#quote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (input) {
        var bad = !input.value.trim() || (input.type === "tel" && input.value.replace(/\D/g, "").length < 10);
        input.closest(".field").classList.toggle("bad", bad);
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (!ok) return;
      var v = function (id) { return $("#" + id).value.trim(); };
      var msg = "Hi Michael, I'd like a free estimate.\n" +
        "Name: " + v("q-name") + "\nPhone: " + v("q-phone") + "\nPostal code: " + v("q-postal").toUpperCase() +
        "\nProblem: " + v("q-problem") + (v("q-when") ? "\nWhen it leaks: " + v("q-when") : "") +
        (v("q-notes") ? "\n" + v("q-notes") : "");
      var out = $("#sent");
      out.hidden = false;
      $("pre", out).textContent = msg;
      location.href = "sms:" + e164 + "?&body=" + encodeURIComponent(msg);
    });
    $$("input, select", form).forEach(function (i) { i.addEventListener("input", function () { i.closest(".field").classList.remove("bad"); }); });
    var copy = $("#copy-msg");
    if (copy) copy.addEventListener("click", function () {
      navigator.clipboard.writeText($("#sent pre").textContent).then(function () { copy.textContent = "Copied"; });
    });
  }

  // ===== home: the loading curtain and the 3D intro =====
  var curtain = $(".curtain"), hero = $(".hero3d");
  // phones skip the 3D house: just the headline and buttons
  if (hero && matchMedia("(max-width: 760px)").matches) { if (curtain) curtain.remove(); document.body.classList.add("shown"); hero = null; }
  if (hero) {
    var seenIntro = false;
    try { seenIntro = sessionStorage.getItem("wz-intro") === "1"; sessionStorage.setItem("wz-intro", "1"); } catch (err) {}
    window.WZ.quickIntro = seenIntro || still;
    var lift = function () {
      if (!curtain || curtain.classList.contains("go")) return;
      curtain.classList.add("go");
      setTimeout(function () { curtain.remove(); }, 1100);
    };
    var reveal = function () { document.body.classList.add("shown"); };
    if (seenIntro || still) { if (curtain) curtain.remove(); curtain = null; }
    addEventListener("wz3d:ready", function () { document.documentElement.classList.remove("no3d"); lift(); });
    addEventListener("wz3d:built", reveal);
    // if the 3D can't load (old phone, blocked script), show the flat drawing instead
    var fail = function () { document.documentElement.classList.add("no3d"); lift(); reveal(); };
    addEventListener("wz3d:fail", fail);
    // (a tab opened in the background doesn't draw until you look at it, so only give up if the 3D never loaded at all)
    setTimeout(function () { if (!window.WZ.ready3d && !window.WZ.loaded3d) fail(); }, 6000);
  }
})();
