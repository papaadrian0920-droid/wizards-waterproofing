// The storm scene: a cut-away house in the rain, showing where every drop goes.
// Roof -> eavestrough -> downspout -> out onto the lawn. Soil -> weeping tile -> sump pit -> pump -> back outside.
// Everything is drawn here once, so both looks (index.html and blue.html) share it.
(function () {
  var box = document.getElementById("storm-fig");
  if (!box) return;

  // Ground height at any x, so rain lands on the roof, the lawn or the road
  function surface(x) {
    if (x < 380) return 336 - 18 * x / 380;
    if (x < 780) return 318;
    if (x < 960) return 318 + 16 * (x - 780) / 180;
    if (x < 1020) return 334;
    return 342;
  }
  function roof(x) {
    if (x >= 672 && x <= 708) return 40;                       // chimney
    if (x >= 352 && x <= 580) return 120 - (x - 352) * 98 / 228;
    if (x > 580 && x <= 808) return 22 + (x - 580) * 98 / 228;
    return null;
  }

  // basement stairs: 7 steps from the floor up to the main floor
  var stairs = "650,392";
  for (var i = 0; i < 7; i++) { var sx = 650 + i * 13, sy = 392 - (i + 1) * 13; stairs += " " + sx + "," + sy + " " + (sx + 13) + "," + sy; }
  stairs += " 741,392";

  box.innerHTML =
'<svg viewBox="0 0 1200 640" role="img" aria-label="A cut-away house in a rainstorm. Rain runs off the roof, into the eavestrough and out a downspout extension onto the lawn. Rain that soaks into the soil reaches the weeping tile beside the footing, drains into the sump pit, and the sump pump pushes it back outside. A backwater valve sits on the sewer pipe. The basement stays dry.">' +
'<defs>' +
  '<linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sky-a"/><stop offset="1" class="sky-b"/></linearGradient>' +
  '<radialGradient id="st-glow"><stop offset="0" stop-color="#FFE9B8" stop-opacity=".75"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="st-spill-l" x1="1" x2="0"><stop offset="0" stop-color="#FFD98A" stop-opacity=".28"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></linearGradient>' +
  '<linearGradient id="st-spill-r" x1="0" x2="1"><stop offset="0" stop-color="#FFD98A" stop-opacity=".28"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></linearGradient>' +
  '<linearGradient id="st-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".3"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></linearGradient>' +
  '<pattern id="st-soil" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#3B2B20"/><circle cx="6" cy="8" r="1.6" fill="#4F3A2B"/><circle cx="26" cy="18" r="2.2" fill="#2C2018"/><circle cx="14" cy="30" r="1.2" fill="#5A4433"/><circle cx="34" cy="34" r="1.8" fill="#4F3A2B"/></pattern>' +
  '<pattern id="st-stone" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#5E5D59"/><circle cx="3" cy="3" r="2.6" fill="#9A9893"/><circle cx="9" cy="9" r="2.6" fill="#85837E"/><circle cx="9.5" cy="3" r="1.5" fill="#B0AEA8"/></pattern>' +
  '<pattern id="st-conc" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#8B8983"/><circle cx="4" cy="5" r="1" fill="#6F6D68"/><circle cx="14" cy="13" r="1.3" fill="#A09E98"/><circle cx="9" cy="17" r=".8" fill="#6F6D68"/></pattern>' +
  '<pattern id="st-brick" width="24" height="12" patternUnits="userSpaceOnUse"><rect width="24" height="12" fill="#7B3A2C"/><path d="M0 .5H24M0 6.5H24M6 0V6M18 6V12" stroke="#4E241B"/></pattern>' +
  '<pattern id="st-shing" width="16" height="9" patternUnits="userSpaceOnUse"><rect width="16" height="9" fill="#2C2E34"/><path d="M0 8.5H16M8 0V9" stroke="#18191D"/></pattern>' +
  '<pattern id="st-dimple" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#3A3A3A"/><circle cx="3" cy="3" r="1.4" fill="#5A5A5A"/></pattern>' +
  '<clipPath id="st-rooms"><rect x="392" y="120" width="376" height="74"/><rect x="392" y="204" width="376" height="82"/><rect x="400" y="300" width="360" height="92"/></clipPath>' +
  '<clipPath id="st-storm-pipe"><circle cx="1150" cy="500" r="25"/></clipPath>' +
  '<clipPath id="st-san-pipe"><circle cx="1090" cy="570" r="16"/></clipPath>' +
'</defs>' +

// sky, far-off lightning, neighbours, clouds
'<rect width="1200" height="640" fill="url(#st-sky)"/>' +
'<polyline class="st-bolt" points="1062,0 1046,48 1064,54 1038,112 1056,116 1028,182" fill="none" stroke="#F4F8FF" stroke-width="2.5" stroke-linejoin="round"/>' +
'<g class="st-far">' +
  '<path d="M0 336V268L46 236 92 268V336ZM196 336V280L246 246 296 280V336ZM840 336V262L894 228 948 262V336ZM1090 342V270L1145 236 1200 270V342Z"/>' +
  '<g fill="#FFD98A" opacity=".55"><rect x="22" y="282" width="10" height="12"/><rect x="60" y="300" width="10" height="12"/><rect x="262" y="292" width="10" height="12"/><rect x="866" y="276" width="10" height="12"/><rect x="912" y="300" width="10" height="12"/><rect x="1160" y="288" width="10" height="12"/></g>' +
'</g>' +
'<g class="st-clouds">' +
  '<g class="st-cloud"><circle cx="140" cy="20" r="46"/><circle cx="200" cy="6" r="52"/><circle cx="268" cy="22" r="40"/><circle cx="90" cy="34" r="30"/></g>' +
  '<g class="st-cloud st-cloud-2"><circle cx="560" cy="-4" r="44"/><circle cx="624" cy="-14" r="50"/><circle cx="690" cy="0" r="38"/></g>' +
  '<g class="st-cloud"><circle cx="960" cy="14" r="42"/><circle cx="1030" cy="2" r="54"/><circle cx="1110" cy="18" r="44"/><circle cx="1180" cy="6" r="36"/></g>' +
'</g>' +

// tree and street lamp
'<g class="st-tree"><rect x="146" y="236" width="12" height="96" fill="#3A281C"/><path d="M152 290L130 262M152 276L176 252" stroke="#3A281C" stroke-width="5" stroke-linecap="round"/>' +
  '<g fill="#22402B"><circle cx="152" cy="212" r="46"/><circle cx="116" cy="240" r="32"/><circle cx="188" cy="240" r="34"/><circle cx="152" cy="176" r="32"/></g>' +
  '<g fill="#2C5236"><circle cx="138" cy="196" r="20"/><circle cx="176" cy="222" r="16"/><circle cx="122" cy="238" r="12"/></g></g>' +
'<polygon points="1008,174 1022,174 1084,342 952,334" fill="url(#st-cone)"/>' +
'<rect x="986" y="178" width="5" height="156" fill="#3A3C40"/><path d="M988.5 182q0-14 22-14" fill="none" stroke="#3A3C40" stroke-width="4"/>' +
'<polygon points="1004,166 1026,166 1022,175 1008,175" fill="#D9D7D0"/><ellipse class="st-bulb" cx="1015" cy="176" rx="6" ry="2.5" fill="#FFE9B0"/>' +

// the ground: soil, grass, sidewalk, road
'<path d="M0 336L380 318H780L960 334H1020V342H1200V640H0Z" fill="url(#st-soil)"/>' +
'<path d="M0 336L380 318M780 318L960 334" fill="none" stroke="#4E7A38" stroke-width="5"/>' +
'<rect x="960" y="331" width="60" height="8" fill="#9A988F"/><rect x="1012" y="331" width="8" height="14" fill="#A8A69D"/>' +
'<rect x="1020" y="339" width="180" height="12" fill="#2A2B2E"/><path d="M1100 344H1130M1160 344H1190" stroke="#C9C39A" stroke-width="2"/>' +
'<g class="st-ripples" fill="none" stroke="#9CC8F2" stroke-width="1.2">' +
  '<ellipse cx="1060" cy="341" rx="9" ry="1.6"/><ellipse cx="1120" cy="341" rx="9" ry="1.6"/><ellipse cx="1176" cy="341" rx="9" ry="1.6"/><ellipse cx="988" cy="332" rx="7" ry="1.4"/>' +
'</g>' +

// city sewers under the road, catch basin, house sewer pipe with backwater valve
'<rect x="1026" y="338" width="14" height="4" fill="#111"/>' +
'<path d="M1033 344V470L1124 498" fill="none" stroke="#6B6A66" stroke-width="7"/>' +
'<path class="st-flow" d="M1200 340H1034V470L1124 498" fill="none" stroke="#2F8FE0" stroke-width="2.5" stroke-linecap="round"/>' +
'<circle cx="1150" cy="500" r="28" fill="#1B1B1D" stroke="url(#st-conc)" stroke-width="6"/>' +
'<g clip-path="url(#st-storm-pipe)"><rect x="1120" y="505" width="60" height="30" fill="#2F8FE0" opacity=".85"/><path class="st-wave" d="M1100 505q6-3 12 0t12 0 12 0 12 0 12 0 12 0 12 0 12 0" fill="none" stroke="#9CC8F2" stroke-width="1.5"/></g>' +
'<path d="M636 392V408H832L1074 566" fill="none" stroke="#8E949C" stroke-width="7" stroke-linejoin="round"/>' +
'<circle cx="1090" cy="570" r="18" fill="#1B1B1D" stroke="url(#st-conc)" stroke-width="5"/>' +
'<g clip-path="url(#st-san-pipe)"><rect x="1070" y="575" width="40" height="20" fill="#6E6A55"/></g>' +

// footings, walls (with membrane and drainage board outside), slab, gravel, weeping tile in clear stone
'<rect x="336" y="414" width="36" height="26" fill="url(#st-stone)"/><rect x="788" y="414" width="36" height="26" fill="url(#st-stone)"/>' +
'<rect x="400" y="402" width="360" height="18" fill="url(#st-stone)"/>' +
'<rect x="366" y="420" width="48" height="16" fill="url(#st-conc)" stroke="#5E5C57"/><rect x="746" y="420" width="48" height="16" fill="url(#st-conc)" stroke="#5E5C57"/>' +
'<rect x="380" y="300" width="20" height="120" fill="url(#st-conc)" stroke="#5E5C57"/><rect x="760" y="300" width="20" height="120" fill="url(#st-conc)" stroke="#5E5C57"/>' +
'<rect x="376.5" y="318" width="3.5" height="102" fill="#111"/><rect x="780" y="318" width="3.5" height="102" fill="#111"/>' +
'<rect x="371" y="320" width="5.5" height="98" fill="url(#st-dimple)"/><rect x="783.5" y="320" width="5.5" height="98" fill="url(#st-dimple)"/>' +
'<rect x="400" y="392" width="360" height="10" fill="url(#st-conc)" stroke="#5E5C57"/>' +
'<g><circle cx="354" cy="428" r="9" fill="#1E1E1E" stroke="#0E0E0E" stroke-width="2"/><circle cx="806" cy="428" r="9" fill="#1E1E1E" stroke="#0E0E0E" stroke-width="2"/>' +
  '<circle class="st-tilewater" cx="354" cy="431" r="5" fill="#2F8FE0"/><circle class="st-tilewater" cx="806" cy="431" r="5" fill="#2F8FE0"/>' +
  '<g fill="#BDB8AC"><circle cx="347" cy="424" r="1"/><circle cx="361" cy="424" r="1"/><circle cx="799" cy="424" r="1"/><circle cx="813" cy="424" r="1"/></g></g>' +
// pipe from the weeping tile, under the footing, into the sump pit
'<path d="M356 436Q388 458 413 448" fill="none" stroke="#1E1E1E" stroke-width="6"/>' +
'<path class="st-flow" d="M356 436Q388 458 413 448" fill="none" stroke="#2F8FE0" stroke-width="2.5" stroke-linecap="round"/>' +

// basement room
'<rect x="400" y="300" width="360" height="92" fill="#CDB084"/><path d="M400 388H760" stroke="#9C805A" stroke-width="2"/>' +
'<rect x="560" y="320" width="34" height="24" fill="#3B5B7A" stroke="#5B4230" stroke-width="3"/>' +
'<ellipse cx="550" cy="392" rx="72" ry="3.5" fill="#8A4B3C"/>' +
'<rect x="500" y="352" width="98" height="20" rx="6" fill="#3F4F5E"/><rect x="500" y="368" width="98" height="18" rx="4" fill="#4F6274"/><rect x="494" y="358" width="12" height="28" rx="4" fill="#3F4F5E"/><rect x="592" y="358" width="12" height="28" rx="4" fill="#3F4F5E"/>' +
'<path d="M612 334V390M604 390H620" stroke="#2C2622" stroke-width="2.5"/><polygon points="602,334 622,334 618,322 606,322" fill="#F4DFA8"/>' +
'<polygon points="' + stairs + '" fill="#8A6A45" stroke="#5E4529" stroke-width="1.5"/>' +
'<rect x="630" y="389" width="12" height="3" fill="#222"/>' +
// backwater valve on the sewer pipe, with its access cover in the floor
'<rect x="693" y="392" width="14" height="11" fill="#555"/><rect x="690" y="389.5" width="20" height="3" fill="#333"/><rect x="688" y="402" width="24" height="12" rx="3" fill="#2E2F33" stroke="#111"/><path d="M696 404L704 412" stroke="#E8C547" stroke-width="2"/>' +

// sump pit, water, pump, check valve and discharge pipe
'<rect x="412" y="392" width="40" height="70" fill="#242424" stroke="#111" stroke-width="2"/>' +
'<rect class="st-pit" x="414" y="430" width="36" height="31" fill="#2F8FE0"/>' +
'<rect x="423" y="442" width="18" height="18" rx="3" fill="#C9C4B6" stroke="#111"/><circle class="st-led-off" cx="432" cy="449" r="2.4" fill="#5A1E1E"/><circle class="st-led" cx="432" cy="449" r="2.4" fill="#47E36B"/>' +
'<rect x="408" y="388" width="48" height="5" fill="#555"/>' +
'<path d="M432 442V306H374V318L302 322" fill="none" stroke="#DCD8CE" stroke-width="5" stroke-linejoin="round"/>' +
'<rect x="428" y="352" width="8" height="14" rx="1.5" fill="#5A5A5A"/>' +
'<path class="st-flow st-pumpflow" d="M432 442V306H374V318L302 322" fill="none" stroke="#2F8FE0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
'<ellipse class="st-outflow st-outflow-pump" cx="296" cy="323" rx="16" ry="3" fill="#2F8FE0"/>' +

// main floor and upstairs
'<rect x="380" y="286" width="400" height="14" fill="#8A6A45"/><path d="M380 293H780" stroke="#6E5235" stroke-dasharray="4 18"/>' +
'<rect x="392" y="204" width="376" height="82" fill="#D2B07A"/><rect x="392" y="120" width="376" height="74" fill="#CFAE79"/>' +
'<rect x="392" y="194" width="376" height="10" fill="#8A6A45"/><rect x="380" y="112" width="400" height="8" fill="#8A6A45"/>' +
'<path d="M392 282H768M392 190H768" stroke="#A88859" stroke-width="2"/>' +
// living room: sofa, cat, lamp, TV, stairs
'<rect x="430" y="246" width="96" height="22" rx="6" fill="#4A2F26"/><rect x="430" y="262" width="96" height="20" rx="4" fill="#5E3C30"/><rect x="424" y="252" width="12" height="30" rx="4" fill="#4A2F26"/><rect x="520" y="252" width="12" height="30" rx="4" fill="#4A2F26"/>' +
'<g fill="#18181A"><ellipse cx="478" cy="254" rx="9" ry="10"/><circle cx="478" cy="241" r="6.5"/><polygon points="472.5,238 473.5,230 478,235.5"/><polygon points="483.5,238 482.5,230 478,235.5"/></g>' +
'<path class="st-tail" d="M486 261q15-1 12-17" fill="none" stroke="#18181A" stroke-width="3" stroke-linecap="round"/>' +
'<path d="M552 236V282M544 282H560" stroke="#2C2622" stroke-width="2.5"/><polygon points="542,236 562,236 558,224 546,224" fill="#F4DFA8"/>' +
'<rect x="600" y="268" width="60" height="16" fill="#3A2A22"/><rect x="606" y="236" width="48" height="31" rx="2" fill="#111"/><rect class="st-tv" x="609" y="239" width="42" height="25" fill="#8EC5FF"/>' +
'<path d="M500 204V214" stroke="#2C2622" stroke-width="1.5"/><polygon points="492,220 508,220 504,213 496,213" fill="#2C2622"/>' +
'<polygon points="672,286 672,272 688,272 688,258 704,258 704,245 720,245 720,231 736,231 736,218 752,218 752,204 768,204 768,286" fill="#8A6A45" stroke="#5E4529" stroke-width="1.5"/>' +
// bedroom: bed, lamp, picture, bookshelf
'<rect x="404" y="150" width="8" height="40" fill="#5A3D2C"/><rect x="410" y="176" width="112" height="14" fill="#6B4A3A"/><rect x="410" y="169" width="112" height="9" fill="#EDEAE2"/><rect x="442" y="166" width="80" height="12" rx="3" fill="#3E6FA8"/><rect x="415" y="161" width="24" height="9" rx="4" fill="#FAF8F2"/>' +
'<rect x="530" y="174" width="22" height="16" fill="#5A3D2C"/><polygon points="533,166 549,166 546,156 536,156" fill="#F4DFA8"/>' +
'<rect x="600" y="138" width="42" height="28" fill="#2F8FE0" stroke="#5B4230" stroke-width="3"/><path d="M603 160L615 148 624 156 630 150 639 160Z" fill="#E8C547"/>' +
'<rect x="690" y="134" width="52" height="56" fill="#5A3D2C"/><path d="M690 152H742M690 171H742" stroke="#3E2A1E" stroke-width="2"/>' +
'<g><rect x="694" y="138" width="6" height="14" fill="#C2483A"/><rect x="701" y="140" width="5" height="12" fill="#E8C547"/><rect x="707" y="137" width="7" height="15" fill="#3E6FA8"/><rect x="720" y="141" width="6" height="11" fill="#5C8C4A"/><rect x="696" y="157" width="7" height="14" fill="#3E6FA8"/><rect x="704" y="159" width="5" height="12" fill="#C2483A"/><rect x="724" y="156" width="8" height="15" fill="#E8C547"/></g>' +
// lamp light in every room
'<g clip-path="url(#st-rooms)" class="st-lights"><circle cx="552" cy="230" r="96" fill="url(#st-glow)"/><circle cx="500" cy="220" r="64" fill="url(#st-glow)"/><g opacity=".16"><circle class="st-tvglow" cx="630" cy="252" r="56" fill="#8EC5FF"/></g><circle cx="541" cy="161" r="74" fill="url(#st-glow)"/><circle cx="612" cy="328" r="90" fill="url(#st-glow)"/></g>' +

// outside walls with windows and light spilling out into the rain
'<rect x="380" y="112" width="12" height="174" fill="url(#st-brick)"/><rect x="768" y="112" width="12" height="174" fill="url(#st-brick)"/>' +
'<g fill="#9FC6E4" stroke="#EDEAE2" stroke-width="2"><rect x="380" y="136" width="12" height="36"/><rect x="380" y="220" width="12" height="42"/><rect x="768" y="136" width="12" height="36"/></g>' +
'<polygon points="380,136 380,172 296,196 296,118" fill="url(#st-spill-l)"/><polygon points="380,220 380,262 296,290 296,202" fill="url(#st-spill-l)"/><polygon points="780,136 780,172 864,196 864,118" fill="url(#st-spill-r)"/>' +

// attic, roof, chimney, eavestroughs and downspout
'<polygon points="380,112 580,38 780,112" fill="#1E1F23"/>' +
'<path d="M480 112L580 38M680 112L580 38M530 112V75M630 112V75M580 112V38" stroke="#5E4529" stroke-width="3"/>' +
'<path d="M396 112q6-7 12 0t12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0" fill="none" stroke="#D88E8E" stroke-width="4"/>' +
'<rect x="676" y="44" width="28" height="44" fill="url(#st-brick)"/><rect x="672" y="40" width="36" height="6" fill="#55565B"/>' +
'<polygon points="352,120 580,22 808,120 796,125 580,36 364,125" fill="url(#st-shing)" stroke="#121316" stroke-width="2" stroke-linejoin="round"/>' +
'<path class="st-flow st-roofflow" d="M572 30L362 118M588 30L806 118" fill="none" stroke="#7DB8EE" stroke-width="2" stroke-linecap="round"/>' +
'<rect x="348" y="116" width="15" height="9" rx="2" fill="#A3A5AA"/><rect x="797" y="116" width="15" height="9" rx="2" fill="#A3A5AA"/>' +
'<rect x="800" y="124" width="8" height="190" fill="#A3A5AA"/><path d="M804 312L886 323" stroke="#A3A5AA" stroke-width="8" stroke-linecap="round"/>' +
'<path class="st-flow" d="M804 122V312L888 323" fill="none" stroke="#2F8FE0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
'<ellipse class="st-outflow" cx="900" cy="326" rx="16" ry="3" fill="#2F8FE0"/>' +

'<g id="st-seep"></g><g id="st-rain"></g>' +

// labels
'<g class="tag" data-x="410" data-y="308"><text>DRY BASEMENT</text></g>' +
'<g class="tag" data-x="470" data-y="486"><line x1="470" y1="499" x2="441" y2="458"/><text>SUMP PUMP</text></g>' +
'<g class="tag" data-x="640" data-y="480"><line x1="700" y1="480" x2="700" y2="414"/><text>BACKWATER VALVE</text></g>' +
'<g class="tag" data-end="868" data-y="446"><line x1="800" y1="446" x2="805" y2="438"/><text>WEEPING TILE</text></g>' +
'<g class="tag wide-only" data-x="206" data-y="254"><line x1="260" y1="280" x2="262" y2="320"/><text>GRADED AWAY</text></g>' +
'<g class="tag wide-only" data-x="836" data-y="262"><line x1="860" y1="288" x2="860" y2="316"/><text>DOWNSPOUT EXTENSION</text></g>' +
'<g class="tag wide-only" data-x="960" data-y="600"><line x1="1072" y1="600" x2="1080" y2="586"/><text>CITY SEWERS</text></g>' +

'<rect class="st-flash" width="1200" height="640" fill="#EAF2FF"/>' +
'</svg>';

  var svg = box.querySelector("svg");
  var NS = "http://www.w3.org/2000/svg";
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrow = matchMedia("(max-width: 700px)");
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // rain: each drop falls until it hits the roof or the ground, some splash
  var rain = svg.querySelector("#st-rain");
  var count = narrow.matches ? 90 : 170;
  for (var r = 0; r < count; r++) {
    var x = rnd(0, 1210), stop = roof(x - 8);
    if (stop === null) stop = surface(x - 8);
    var dur = (stop + 30) / rnd(620, 820), delay = -rnd(0, 3);
    var drop = document.createElementNS(NS, "line");
    drop.setAttribute("x1", x); drop.setAttribute("y1", -30); drop.setAttribute("x2", x - 2); drop.setAttribute("y2", -16);
    drop.setAttribute("class", "st-drop");
    drop.style.cssText = "--dx:-8px;--dy:" + (stop + 16) + "px;animation-duration:" + dur.toFixed(2) + "s;animation-delay:" + delay.toFixed(2) + "s";
    if (still) drop.style.transform = "translate(" + -8 * Math.random() + "px," + (stop + 16) * Math.random() + "px)";
    rain.appendChild(drop);
    if (r % 3 === 0) {
      var sp = document.createElementNS(NS, "ellipse");
      sp.setAttribute("cx", x - 8); sp.setAttribute("cy", stop); sp.setAttribute("rx", 5); sp.setAttribute("ry", 1.5);
      sp.setAttribute("class", "st-splash");
      sp.style.cssText = "animation-duration:" + dur.toFixed(2) + "s;animation-delay:" + delay.toFixed(2) + "s";
      rain.appendChild(sp);
    }
  }

  // water soaking down through the soil to the weeping tile on each side
  var seep = svg.querySelector("#st-seep");
  [[250, 344, 354], [812, 930, 806]].forEach(function (side) {
    for (var k = 0; k < 9; k++) {
      var sx = rnd(side[0], side[1]), sy = surface(sx) + 8;
      var d = document.createElementNS(NS, "circle");
      d.setAttribute("cx", sx); d.setAttribute("cy", sy); d.setAttribute("r", 2.6);
      d.setAttribute("class", "st-seep");
      d.style.cssText = "--dx:" + (side[2] - sx).toFixed(1) + "px;--dy:" + (424 - sy).toFixed(1) + "px;animation-duration:" + rnd(3.2, 5).toFixed(2) + "s;animation-delay:" + (-rnd(0, 5)).toFixed(2) + "s";
      seep.appendChild(d);
    }
  });

  // phones see the house up close; labels that would be cut off are hidden there
  function fit() {
    svg.setAttribute("viewBox", narrow.matches ? "290 0 600 540" : "0 0 1200 640");
    if (window.WZ) WZ.sizeTags(svg);
  }
  fit();
  narrow.addEventListener("change", fit);
  if (document.fonts) document.fonts.ready.then(fit);

  // no point animating it while it's off screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { box.classList.toggle("paused", !e[0].isIntersecting); }).observe(box);
  }
})();
