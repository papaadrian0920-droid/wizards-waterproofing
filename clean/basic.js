// ===== Business info: change things here, not in the pages =====
var BIZ = {
  owner: "Michael Papa",
  phone: "416-569-0776",
  years: 24,
  base: "North York",
  licenceNo: "T85-3954149",   // City of Toronto business licence, from his BBB profile. Check it's current.
  instagram: "michaelwpapa",
  logo: ""                    // put his logo file in this folder, then e.g. "logo.png"
};
// ===============================================================

(function () {
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var digits = BIZ.phone.replace(/\D/g, "");
  var e164 = "+" + (digits.length === 10 ? "1" + digits : digits);

  $$("[data-biz]").forEach(function (el) { var v = BIZ[el.dataset.biz]; if (v != null) el.textContent = v; });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + e164; });
  $$("[data-sms]").forEach(function (a) { a.href = "sms:" + e164; });
  $$("[data-ig]").forEach(function (a) { a.href = "https://www.instagram.com/" + BIZ.instagram + "/"; });
  $$(".yr").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (BIZ.logo) $$(".logo-mark").forEach(function (m) { m.innerHTML = '<img src="' + BIZ.logo + '" alt="">'; });

  // phone menu
  var btn = document.querySelector(".menu-btn");
  if (btn) btn.addEventListener("click", function () {
    var open = document.body.classList.toggle("menu-open");
    btn.setAttribute("aria-expanded", open);
    btn.textContent = open ? "✕" : "☰";
  });

  // The estimate form writes a text message to Michael. There's no server, so nothing is stored:
  // it opens the phone's Messages app with everything filled in.
  var form = document.getElementById("quote");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    [].slice.call(form.querySelectorAll("[required]")).forEach(function (input) {
      var bad = !input.value.trim() || (input.type === "tel" && input.value.replace(/\D/g, "").length < 10);
      input.closest(".field").classList.toggle("bad", bad);
      if (bad && ok) { input.focus(); ok = false; }
    });
    if (!ok) return;
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var msg = "Hi Michael, I'd like a free estimate.\nName: " + v("q-name") + "\nPhone: " + v("q-phone") +
      "\nPostal code: " + v("q-postal").toUpperCase() + "\nProblem: " + v("q-problem") +
      (v("q-notes") ? "\n" + v("q-notes") : "");
    var out = document.getElementById("sent");
    out.hidden = false;
    out.querySelector("pre").textContent = msg;
    location.href = "sms:" + e164 + "?&body=" + encodeURIComponent(msg);
  });
  [].slice.call(form.querySelectorAll("input, select")).forEach(function (i) {
    i.addEventListener("input", function () { i.closest(".field").classList.remove("bad"); });
  });
})();
