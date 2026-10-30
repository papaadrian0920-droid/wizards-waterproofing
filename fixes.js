// "See how it gets fixed" slideshows for the service cards.
// Each one is a drawing plus steps. Parts of the drawing with data-s="1-3" show only on those steps (counting from 0),
// like the big drawing on the page. These are the standard ways each job is done; Michael checks each house first.
// The patterns (soil, concrete, stone, dimple board) and the water arrow come from the big drawing's <defs>.

var SHEET = '<rect width="600" height="440" fill="#EEEAE1"/>';
var WATER = '#2F8FE0';
function tag(s, where, text, line) {
  // where: "x,y" anchors the left edge, "end:x,y" anchors the right edge
  var pos = where.indexOf("end:") === 0
    ? 'data-end="' + where.slice(4).split(",")[0] + '" data-y="' + where.split(",")[1] + '"'
    : 'data-x="' + where.split(",")[0] + '" data-y="' + where.split(",")[1] + '"';
  var l = line ? '<line x1="' + line[0] + '" y1="' + line[1] + '" x2="' + line[2] + '" y2="' + line[3] + '"/>' : "";
  return '<g class="tag" data-s="' + s + '" ' + pos + '>' + l + '<text>' + text + '</text></g>';
}
function rain(s) {
  return '<g data-s="' + s + '" stroke="' + WATER + '" stroke-width="2.5" stroke-linecap="round" opacity=".8">' +
    '<line x1="40" y1="20" x2="34" y2="38"/><line x1="100" y1="48" x2="94" y2="66"/><line x1="160" y1="16" x2="154" y2="34"/>' +
    '<line x1="220" y1="58" x2="214" y2="76"/><line x1="280" y1="22" x2="274" y2="40"/><line x1="340" y1="54" x2="334" y2="72"/></g>';
}
function arrow(s, d, dashed) {
  return '<path data-s="' + s + '" d="' + d + '" fill="none" stroke="' + WATER + '" stroke-width="3.5" stroke-linecap="round" marker-end="url(#arr)"' + (dashed ? ' stroke-dasharray="7 6"' : '') + '/>';
}
function pipe(s, cx, cy) {
  return '<g data-s="' + s + '"><circle cx="' + cx + '" cy="' + cy + '" r="14" fill="none" stroke="#7D7A73" stroke-width="1.5" stroke-dasharray="2 2"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#F4F3EF" stroke="#222" stroke-width="2.5"/>' +
    '<g fill="#222"><circle cx="' + cx + '" cy="' + (cy - 7) + '" r="1.5"/><circle cx="' + (cx - 7) + '" cy="' + (cy - 3) + '" r="1.5"/><circle cx="' + (cx + 7) + '" cy="' + (cy - 3) + '" r="1.5"/></g></g>';
}

var FIXES = {
  interior: {
    title: "Interior waterproofing",
    svg: SHEET +
      '<rect width="600" height="440" fill="url(#p-soil)"/>' +
      '<rect x="250" y="330" width="350" height="40" fill="url(#p-stone)" opacity=".8"/>' +
      '<rect x="250" y="0" width="350" height="300" fill="#F7F5EF"/>' +
      '<text class="lbl" x="20" y="30" style="fill:#E6D6BF">SOIL</text>' +
      '<text class="lbl" x="440" y="130" text-anchor="middle">BASEMENT</text>' +
      '<rect x="170" y="330" width="120" height="40" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<rect x="200" y="0" width="50" height="330" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<rect x="250" y="300" width="350" height="30" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      // the trench along the inside of the wall
      '<rect data-s="1-3" x="252" y="300" width="98" height="30" fill="#EEEAE1"/>' +
      '<rect data-s="1" x="290" y="330" width="60" height="45" fill="#EEEAE1"/>' +
      '<rect data-s="2-4" x="290" y="330" width="60" height="45" fill="url(#p-stone)" stroke="#8D897F"/>' +
      pipe("2-4", 320, 356) +
      '<rect data-s="2-4" x="250" y="110" width="7" height="220" fill="url(#p-dimple)"/>' +
      '<rect data-s="4" x="252" y="300" width="98" height="30" fill="#C4C1B9" stroke="#6E6C66" stroke-width="1.5"/>' +
      // sump pit
      '<g data-s="3-4"><rect x="470" y="300" width="60" height="110" fill="#DCD7CB" stroke="#333" stroke-width="2.5"/>' +
      '<rect x="473" y="380" width="54" height="28" fill="' + WATER + '" opacity=".55"/>' +
      '<rect x="488" y="368" width="24" height="36" rx="3" fill="#4A6A85"/>' +
      '<path d="M500 368 V60" stroke="#8F9890" stroke-width="6" fill="none"/>' +
      '<line x1="464" y1="300" x2="536" y2="300" stroke="#333" stroke-width="5"/></g>' +
      // water
      arrow("0", "M110 300 H188") + arrow("0", "M110 360 H160") +
      '<g data-s="0"><path d="M300 392 C282 370 262 350 254 304" fill="none" stroke="' + WATER + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<ellipse cx="310" cy="300" rx="50" ry="3.5" fill="' + WATER + '"/></g>' +
      arrow("3-4", "M336 356 H462", true) +
      arrow("4", "M120 410 C200 410 270 390 310 366") +
      arrow("4", "M500 330 V80") +
      tag("0", "330,236", "WATER AT THE FLOOR EDGE", [330, 249, 262, 298]) +
      tag("1", "370,236", "FLOOR CUT OPEN", [370, 249, 322, 304]) +
      tag("2", "300,150", "WALL MEMBRANE", [300, 163, 259, 180]) +
      tag("2", "370,250", "NEW DRAIN PIPE", [370, 263, 334, 350]) +
      tag("3", "330,230", "DRAINS TO THE SUMP PIT", [470, 256, 490, 298]) +
      tag("4", "300,236", "NEW CONCRETE, DRY FLOOR", [300, 262, 300, 300]),
    steps: [
      ["Why it leaks there", "Water builds up in the soil around and under the basement. It gets pushed in where the floor meets the wall, and spreads across the floor."],
      ["Cut the floor open", "A strip of the concrete floor is cut out along the inside of the leaking walls, and a trench is dug down beside the footing."],
      ["Drain pipe and wall membrane", "A perforated drain pipe goes into the trench in clear stone. A dimpled membrane goes on the inside of the wall, so any water coming through the wall runs down into the drain."],
      ["Into the sump pit", "The drain carries the water to a sump pit. When the pit fills, the sump pump pushes the water up and outside."],
      ["New concrete on top", "The trench gets filled in with new concrete. Water now goes into the drain and out, instead of across your floor. No digging outside, so the yard stays as it is."]
    ]
  },

  crack: {
    title: "Foundation crack repair",
    svg: SHEET +
      '<rect x="40" y="20" width="520" height="360" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<rect x="40" y="380" width="520" height="40" fill="#C8C1B3" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<text class="lbl" x="56" y="364" style="fill:#4E4C47">INSIDE WALL</text>' +
      '<text class="lbl" x="56" y="405" style="fill:#5F5C55">FLOOR</text>' +
      '<g data-s="0"><polyline points="262,160 276,160 266,205 284,250 272,300 290,345 282,380" fill="none" stroke="' + WATER + '" stroke-width="26" stroke-linejoin="round" opacity=".22"/>' +
      '<path d="M284 330 C288 350 282 365 288 384" stroke="' + WATER + '" stroke-width="3" fill="none"/>' +
      '<ellipse cx="292" cy="392" rx="46" ry="5" fill="' + WATER + '" opacity=".8"/></g>' +
      '<polyline data-s="0-1" points="262,20 270,70 258,110 276,160 266,205 284,250 272,300 290,345 282,380" fill="none" stroke="#1E1E1E" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<polyline data-s="2-3" points="262,22 270,70 258,110 276,160 266,205 284,250 272,300 290,345 282,378" fill="none" stroke="#8E8A80" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<polyline data-s="4" points="262,22 270,70 258,110 276,160 266,205 284,250 272,300 290,345 282,378" fill="none" stroke="#B9B6AE" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<g data-s="1-3">' + [[270, 70], [276, 160], [284, 250], [290, 345]].map(function (p) {
        return '<rect x="' + (p[0] - 4) + '" y="' + (p[1] - 16) + '" width="8" height="12" fill="#222"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="8" fill="#F4F3EF" stroke="#222" stroke-width="2.5"/>';
      }).join("") + '</g>' +
      '<g data-s="3"><path d="M296 345 L340 360" stroke="#333" stroke-width="7" stroke-linecap="round"/><rect x="336" y="348" width="70" height="26" rx="5" fill="#555"/>' +
      '<path d="M300 320 C306 250 286 170 280 100" fill="none" stroke="#E0A42E" stroke-width="5" stroke-dasharray="8 6" stroke-linecap="round"/>' +
      '<path d="M273 104 L280 90 L288 104 Z" fill="#D9A441"/></g>' +
      tag("0", "320,120", "LEAKING CRACK", [320, 133, 270, 140]) +
      tag("1", "320,146", "INJECTION PORTS", [320, 159, 286, 160]) +
      tag("2", "end:244,200", "SURFACE SEALED", [244, 213, 266, 213]) +
      tag("3", "330,214", "INJECT, BOTTOM TO TOP") +
      tag("4", "320,180", "SEALED THROUGH", [320, 193, 280, 200]),
    steps: [
      ["The crack", "Concrete shrinks as it cures, and the ground moves over the years, so foundation walls crack. When the soil outside gets wet, water pushes through."],
      ["Clean it and add ports", "The crack is cleaned out, and small injection ports are fixed along it, from the bottom to the top."],
      ["Seal the surface", "The face of the crack is sealed over with a paste, so the resin can't just run back out the front."],
      ["Inject, bottom to top", "Resin, usually polyurethane or epoxy, is pumped in at the lowest port until it reaches the next one up, then the next, until the crack is filled through the whole wall."],
      ["Sealed", "Once it sets, the ports are cut off. The crack is sealed through the wall from the inside, with no digging. If the outside of the wall has bigger problems, it gets fixed from outside instead."]
    ]
  },

  sump: {
    title: "Sump pumps",
    svg: SHEET +
      '<rect x="0" y="120" width="600" height="320" fill="url(#p-soil)"/>' +
      '<line x1="0" y1="120" x2="60" y2="120" stroke="#5E7F3A" stroke-width="5"/>' +
      '<rect x="100" y="300" width="500" height="40" fill="url(#p-stone)" opacity=".8"/>' +
      '<rect x="100" y="0" width="500" height="270" fill="#F7F5EF"/>' +
      '<text class="lbl" x="470" y="110" text-anchor="middle">BASEMENT</text>' +
      '<rect x="40" y="300" width="90" height="35" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<rect x="60" y="0" width="40" height="300" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<rect x="100" y="270" width="500" height="30" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      // water under the floor
      '<g data-s="0"><rect x="100" y="318" width="500" height="122" fill="' + WATER + '" opacity=".22"/>' +
      '<line x1="100" y1="318" x2="600" y2="318" stroke="' + WATER + '" stroke-width="2" stroke-dasharray="8 6"/>' +
      '<ellipse cx="220" cy="270" rx="56" ry="3.5" fill="' + WATER + '"/></g>' +
      arrow("0", "M180 336 V306") + arrow("0", "M270 336 V306") +
      // pit
      '<rect data-s="1" x="300" y="270" width="100" height="150" fill="#EEEAE1"/>' +
      '<g data-s="2-5"><rect x="300" y="290" width="100" height="130" fill="url(#p-stone)"/>' +
      '<rect x="130" y="314" width="180" height="12" fill="#F4F3EF" stroke="#222" stroke-width="1.5"/>' +
      '<rect x="310" y="276" width="80" height="140" fill="#DCD7CB" stroke="#333" stroke-width="3"/>' +
      '<g fill="#8D897F"><circle cx="322" cy="340" r="2.5"/><circle cx="378" cy="340" r="2.5"/><circle cx="322" cy="380" r="2.5"/><circle cx="378" cy="380" r="2.5"/></g></g>' +
      '<g data-s="5"><rect x="313" y="384" width="74" height="30" fill="' + WATER + '" opacity=".55"/></g>' +
      '<g data-s="3-5"><path d="M350 365 V70 H30 V112" fill="none" stroke="#8F9890" stroke-width="7" stroke-linejoin="round"/>' +
      '<rect x="335" y="365" width="30" height="44" rx="4" fill="#4A6A85"/>' +
      '<line x1="365" y1="378" x2="378" y2="378" stroke="#222" stroke-width="2"/><circle cx="381" cy="378" r="5" fill="#E9C84A" stroke="#222" stroke-width="1.5"/>' +
      '<rect x="341" y="198" width="18" height="26" rx="2" fill="#222"/></g>' +
      '<g data-s="4-5"><rect x="450" y="236" width="74" height="34" rx="4" fill="#2B2D31"/><text x="487" y="258" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#E9C84A">BATTERY</text>' +
      '<path d="M450 252 H404 V282" fill="none" stroke="#222" stroke-width="2"/>' +
      '<circle cx="540" cy="226" r="9" fill="#C0392B" stroke="#222" stroke-width="1.5"/></g>' +
      '<line data-s="5" x1="304" y1="272" x2="396" y2="272" stroke="#333" stroke-width="6"/>' +
      arrow("5", "M150 320 H300", true) + arrow("5", "M336 300 V100") + arrow("5", "M24 120 L4 126") +
      tag("0", "330,196", "WATER UNDER THE FLOOR", [400, 222, 400, 316]) +
      tag("1", "end:590,196", "HOLE THROUGH THE FLOOR", [420, 222, 380, 274]) +
      tag("2", "end:296,360", "PIT LINER + DRAIN", [296, 373, 312, 373]) +
      tag("3", "370,190", "CHECK VALVE", [370, 203, 360, 210]) +
      tag("3", "410,386", "PUMP", [410, 399, 366, 392]) +
      tag("4", "end:590,184", "BATTERY BACKUP + ALARM", [500, 210, 488, 236]) +
      tag("5", "110,20", "PUMPED OUTSIDE"),
    steps: [
      ["Water under the floor", "When the ground under your basement fills with water, it pushes up through cracks and the edges of the floor. A sump pump gives that water somewhere to go."],
      ["Dig the pit", "A hole is cut through the floor and dug out, usually in a low corner where water collects."],
      ["Pit liner", "A liner with holes in it goes into the hole, surrounded by stone. Water from the soil, and from any drain pipes around the basement, flows into it."],
      ["Pump and check valve", "The pump sits in the pit and turns on by itself when the water rises. A pipe carries the water up and outside, and a check valve stops it from running back down."],
      ["Battery backup and alarm", "Storms often knock out the power right when the pump is needed most. A battery backup keeps it pumping, and an alarm warns you if something stops working. The City pays back up to $2,250 for a pump with alarm, and up to $300 for the battery."],
      ["Lid on, pumping out", "A lid goes on the pit. Water drains in, the pump sends it outside away from the house, and the floor stays dry."]
    ]
  },

  underpin: {
    title: "Underpinning",
    svg: SHEET +
      '<rect x="0" y="40" width="600" height="400" fill="url(#p-soil)"/>' +
      '<line x1="0" y1="40" x2="160" y2="40" stroke="#5E7F3A" stroke-width="5"/>' +
      '<rect x="200" y="22" width="400" height="158" fill="#F7F5EF"/>' +
      '<rect x="200" y="10" width="400" height="12" fill="#BFAE90" stroke="#9C8B6E"/>' +
      '<text class="lbl" x="420" y="140" text-anchor="middle">BASEMENT</text>' +
      '<text class="lbl" x="12" y="70" style="fill:#E6D6BF">SOIL</text>' +
      '<rect data-s="0-2" x="200" y="180" width="400" height="20" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      // one section dug out under the footing
      '<polygon data-s="1-2" points="220,180 300,180 300,380 130,380 130,240 220,240" fill="#EEEAE1"/>' +
      '<polyline data-s="1-2" points="220,240 130,240 130,380 300,380 300,200" fill="none" stroke="#5C4734" stroke-width="2" stroke-dasharray="6 5"/>' +
      // new concrete under the old footing
      '<g data-s="2-4"><rect x="140" y="240" width="80" height="100" fill="url(#p-conc)" stroke="#4E6E8E" stroke-width="2"/>' +
      '<rect x="130" y="340" width="100" height="40" fill="url(#p-conc)" stroke="#4E6E8E" stroke-width="2"/></g>' +
      // inside dug down, then the new floor
      '<rect data-s="3" x="220" y="180" width="380" height="200" fill="#EEEAE1"/>' +
      '<g data-s="4"><rect x="220" y="335" width="380" height="45" fill="url(#p-stone)"/>' +
      '<rect x="220" y="180" width="380" height="130" fill="#F7F5EF"/>' +
      '<rect x="220" y="310" width="380" height="25" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/></g>' +
      pipe("4", 252, 357) +
      '<rect x="160" y="20" width="40" height="180" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<rect x="140" y="200" width="80" height="40" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      // ceiling height, before and after
      '<g data-s="0-3" stroke="#111" stroke-width="2"><line x1="560" y1="26" x2="560" y2="176"/><line x1="550" y1="26" x2="570" y2="26"/><line x1="550" y1="176" x2="570" y2="176"/></g>' +
      '<g data-s="4" stroke="#111" stroke-width="2"><line x1="560" y1="26" x2="560" y2="306"/><line x1="550" y1="26" x2="570" y2="26"/><line x1="550" y1="306" x2="570" y2="306"/></g>' +
      tag("0", "end:540,86", "LOW CEILING") +
      tag("1", "310,250", "DUG IN SECTIONS", [310, 263, 290, 263]) +
      tag("2", "310,280", "NEW FOOTING + WALL", [310, 293, 222, 293]) +
      tag("3", "320,250", "OLD FLOOR OUT, DUG DOWN") +
      tag("4", "end:540,200", "MORE HEADROOM"),
    steps: [
      ["Low ceiling", "A lot of older Toronto basements are too short to really use. Underpinning makes them taller by building new foundation underneath the house and lowering the floor."],
      ["Dig in sections", "A structural engineer draws up the plan and the City issues a building permit first. Then the digging under the footing is done in short sections, in a set order, so the house is always held up by solid ground."],
      ["New concrete underneath", "In each section, a new footing and wall are poured below the old one, then packed tight up against it. Section by section, the whole wall ends up sitting on new, deeper foundation."],
      ["Old floor out", "With the walls supported, the old floor is broken out and the ground inside is dug down to the new depth."],
      ["New, lower floor", "New stone, usually a new drain pipe, and a new concrete floor go in, a lot lower than before. You get real ceiling height."]
    ]
  },

  grading: {
    title: "Landscaping and grading",
    svg: SHEET +
      '<rect x="480" y="300" width="120" height="140" fill="url(#p-soil)"/>' +
      '<polygon data-s="0-1" points="0,160 480,185 480,440 0,440" fill="url(#p-soil)"/>' +
      '<line data-s="0-1" x1="0" y1="160" x2="480" y2="185" stroke="#5E7F3A" stroke-width="5"/>' +
      '<polygon data-s="2-3" points="0,195 480,150 480,440 0,440" fill="url(#p-soil)"/>' +
      '<line data-s="2-3" x1="0" y1="195" x2="480" y2="150" stroke="#5E7F3A" stroke-width="5"/>' +
      '<rect x="520" y="130" width="80" height="210" fill="#F7F5EF"/>' +
      '<rect x="520" y="340" width="80" height="20" fill="url(#p-conc)" stroke="#6E6C66"/>' +
      '<rect x="476" y="0" width="48" height="110" fill="#D6CFC0" stroke="#9C9586" stroke-width="1.5"/>' +
      '<rect x="480" y="110" width="40" height="250" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<rect x="470" y="360" width="60" height="30" fill="url(#p-conc)" stroke="#6E6C66" stroke-width="1.5"/>' +
      '<text class="lbl" x="560" y="250" text-anchor="middle">BSMT</text>' +
      '<path d="M462 0 V140" stroke="#8F9890" stroke-width="10" fill="none"/>' +
      '<path data-s="0" d="M462 140 V150" stroke="#8F9890" stroke-width="10" fill="none"/>' +
      '<path data-s="1" d="M462 135 V178 L300 172" stroke="#8F9890" stroke-width="9" fill="none" stroke-linejoin="round"/>' +
      '<path data-s="2-3" d="M462 135 V146 L300 160" stroke="#8F9890" stroke-width="9" fill="none" stroke-linejoin="round"/>' +
      rain("0,3") +
      '<g data-s="0"><path d="M462 152 C466 165 470 175 474 186" stroke="' + WATER + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M522 280 C528 300 522 318 528 338" stroke="' + WATER + '" stroke-width="3" fill="none"/><ellipse cx="556" cy="340" rx="26" ry="3" fill="' + WATER + '"/></g>' +
      arrow("0", "M200 162 L440 175") + arrow("0", "M470 200 V300") +
      arrow("3", "M430 148 L150 175") + arrow("3", "M296 162 L210 170") +
      tag("0", "30,100", "SLOPES TOWARD THE HOUSE", [140, 126, 200, 166]) +
      tag("1", "150,100", "DOWNSPOUT EXTENDED", [300, 126, 340, 168]) +
      tag("2", "30,100", "NEW SOIL, SLOPED AWAY", [150, 126, 150, 180]) +
      tag("3", "30,100", "RAIN RUNS AWAY"),
    steps: [
      ["The problem", "When the ground slopes toward the house, or the downspouts empty right beside the wall, rain soaks down against the foundation and finds its way in."],
      ["Extend the downspouts", "Downspouts get extensions so roof water lands well away from the walls. In Toronto, downspouts also have to be disconnected from the sewer."],
      ["Regrade the soil", "New soil is added against the house and packed down, so the ground slopes away from the walls wherever it needs to."],
      ["Rain runs away", "Now rain and snowmelt run off away from the house instead of soaking down beside it. It's often the cheapest fix, and sometimes the only one a house needs."]
    ]
  }
};

// ===== the pop-up slideshow =====
(function () {
  if (!window.WZ) return;
  var box = document.createElement("div");
  box.className = "fixer"; box.hidden = true;
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "fixer-title");
  box.innerHTML =
    '<div class="fixer-box">' +
      '<div class="fixer-head"><div><p class="mono">How it gets fixed</p><h3 id="fixer-title"></h3></div>' +
      '<button class="fixer-x" type="button" aria-label="Close">×</button></div>' +
      '<div class="fixer-body">' +
        '<figure class="sheet"><div class="fixer-fig"></div>' +
        '<figcaption class="sheet-foot"><span class="n"></span><span class="t"></span><span class="bar-track" aria-hidden="true"><span class="bar-fill"></span></span></figcaption></figure>' +
        '<div class="fixer-text" aria-live="polite"><span class="num"></span><h4></h4><p></p></div>' +
      '</div>' +
      '<div class="fixer-nav"><button class="btn btn-dark" type="button" data-go="-1">← Back</button><div class="dots"></div>' +
      '<button class="btn" type="button" data-go="1">Next →</button><a class="btn" data-call>Call for a free estimate</a></div>' +
      '<p class="fixer-note">This is the standard way it\'s done. Every house is different, so Michael looks at yours first and tells you exactly what it needs.</p>' +
    '</div>';
  document.body.appendChild(box);
  var $ = function (s) { return box.querySelector(s); };
  $("[data-call]").href = "tel:" + WZ.phone;

  var fix, n, parts, opener;
  function open(key, from) {
    fix = FIXES[key]; opener = from;
    $("#fixer-title").textContent = fix.title;
    $(".fixer-fig").innerHTML = '<svg viewBox="0 0 600 440" role="img" aria-label="Drawing of how ' + fix.title.toLowerCase() + ' is done">' + fix.svg + '</svg>';
    parts = [].slice.call(box.querySelectorAll(".fixer-fig [data-s]"));
    $(".dots").innerHTML = fix.steps.map(function (s, i) { return '<button type="button" aria-label="Step ' + (i + 1) + '" data-to="' + i + '"></button>'; }).join("");
    box.hidden = false;
    document.documentElement.classList.add("locked");
    WZ.sizeTags($(".fixer-fig svg"));
    box.classList.add("no-fade"); // jump straight to step 1 instead of fading out every other step
    show(0);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.remove("no-fade"); }); });
    $(".fixer-x").focus();
  }
  function close() {
    box.hidden = true;
    document.documentElement.classList.remove("locked");
    if (opener) opener.focus();
  }
  function show(i) {
    n = Math.max(0, Math.min(fix.steps.length - 1, i));
    parts.forEach(function (el) { el.classList.toggle("off", !WZ.inStage(el.dataset.s, n)); });
    var num = (n + 1 < 10 ? "0" : "") + (n + 1);
    $(".fixer-text .num").textContent = num;
    $(".fixer-text h4").textContent = fix.steps[n][0];
    $(".fixer-text p").textContent = fix.steps[n][1];
    $(".sheet-foot .n").textContent = num;
    $(".sheet-foot .t").textContent = fix.steps[n][0];
    $(".bar-fill").style.transform = "scaleX(" + (n + 1) / fix.steps.length + ")";
    box.querySelectorAll(".dots button").forEach(function (d, j) { if (j === n) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
    var last = n === fix.steps.length - 1;
    $('[data-go="-1"]').disabled = n === 0;
    $('[data-go="1"]').hidden = last;
    $("[data-call]").hidden = !last;
  }

  box.addEventListener("click", function (e) {
    if (e.target === box || e.target.closest(".fixer-x")) return close();
    var go = e.target.closest("[data-go]"), to = e.target.closest("[data-to]");
    if (go) show(n + Number(go.dataset.go));
    if (to) show(Number(to.dataset.to));
  });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(n + 1);
    if (e.key === "ArrowLeft") show(n - 1);
    if (e.key === "Tab") { // keep keyboard focus inside the pop-up
      var f = [].slice.call(box.querySelectorAll("button:not([disabled]):not([hidden]), a[href]:not([hidden])"));
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  // swipe left or right on phones
  var startX = null;
  $(".fixer-body").addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  $(".fixer-body").addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) > 50) show(n + (dx < 0 ? 1 : -1));
  });

  // a button on each service card that has a slideshow
  document.querySelectorAll(".svc[data-fix]").forEach(function (card) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "svc-more"; b.innerHTML = "See how it gets fixed <span aria-hidden=\"true\">→</span>";
    b.addEventListener("click", function () { open(card.dataset.fix, b); });
    card.appendChild(b);
  });
})();
