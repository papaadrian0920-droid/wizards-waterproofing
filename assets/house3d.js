// The 3D intro on the home page: a slice of ground with a house on it, cut open at the front
// so you can see the basement, the footing, the weeping tile and the sump pump at work in a storm.
// Units are roughly metres. The cut is the plane z = 0; everything sits behind it.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const host = document.querySelector(".hero3d");
const pinsBox = host.querySelector(".pins");
const narrow = matchMedia("(max-width: 760px)");
const small = narrow.matches;
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const quick = !!(window.WZ && window.WZ.quickIntro);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
} catch (err) {
  dispatchEvent(new Event("wz3d:fail"));
  throw err;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.75 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = !small;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.prepend(renderer.domElement);
renderer.domElement.setAttribute("aria-hidden", "true");

const scene = new THREE.Scene();
const SKY = new THREE.Color("#0B0E14");
scene.background = SKY.clone();
scene.fog = new THREE.Fog(SKY, 40, 90);
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
const world = new THREE.Group();
scene.add(world);

// ---------- textures, drawn on the fly so there's nothing to download ----------
function speckle(base, dots, n = 1500, size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < n; i++) {
    g.fillStyle = dots[i % dots.length];
    g.beginPath(); g.arc(Math.random() * size, Math.random() * size, Math.random() * 2.2 + 0.4, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function bricks() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#4A2219"; g.fillRect(0, 0, 256, 256);
  const tones = ["#8A4130", "#7B3A2C", "#93503C", "#6E3326", "#844A36"];
  for (let r = 0; r < 16; r++) for (let k = -1; k < 5; k++) {
    g.fillStyle = tones[(r * 7 + k * 3 + 16) % tones.length];
    g.fillRect(k * 64 + (r % 2) * 32 + 2, r * 16 + 2, 60, 12);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function shingles() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#24262B"; g.fillRect(0, 0, 128, 128);
  for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) {
    g.fillStyle = ["#2E3036", "#2A2C31", "#33353B"][(r + k + 9) % 3];
    g.fillRect(k * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function siding() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#7E8C99"; g.fillRect(0, 0, 128, 128);
  for (let r = 0; r < 8; r++) {
    g.fillStyle = "#5E6B77"; g.fillRect(0, r * 16 + 13, 128, 3);
    g.fillStyle = "#9AA7B3"; g.fillRect(0, r * 16, 128, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const TEX = {
  grass: speckle("#3F6B2E", ["#4E8238", "#335A25", "#5C9142"], 2600),
  top: speckle("#4A3324", ["#5C4230", "#3A281C", "#6B4E38"]),
  clay: speckle("#6B4A33", ["#7D5A40", "#5A3D2A", "#8A6A4E"]),
  fill: speckle("#7A5A40", ["#8C6B4E", "#644831", "#9A7A5C"]),
  deep: speckle("#55402F", ["#634A36", "#45332A", "#6E5640"]),
  stone: speckle("#77756F", ["#A3A19A", "#5A5853", "#C4C2BA", "#8E8C86"], 4200),
  conc: speckle("#9C9991", ["#88857E", "#B0ADA5", "#7A776F"], 900),
  brick: bricks(),
  shing: shingles(),
  siding: siding()
};
function tex(name, w, h, extra = {}) {
  const t = TEX[name].clone();
  t.repeat.set(Math.max(1, w / 2.2), Math.max(1, h / 2.2));
  t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, ...extra });
}
const plain = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
const glow = (color, intensity = 1.5) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.6 });

const M = {
  wood: plain("#8A6A45"), woodDark: plain("#5A3D2C"), plaster: plain("#DCC79E"), plasterUp: plain("#D6C095"),
  white: plain("#EEEAE2"), alu: plain("#A3A5AA", { metalness: 0.6, roughness: 0.4 }), pvc: plain("#E2DED4", { roughness: 0.5 }),
  tile: plain("#1E1E1E", { roughness: 0.6 }), liner: plain("#202224"), membrane: plain("#111111", { roughness: 0.5 }),
  dimple: plain("#3A3B3E"), insul: plain("#A9877D", { roughness: 1 }), sofa: plain("#5E3C30"), sofaB: plain("#3F4F5E"),
  rug: plain("#8A3F33"), rugB: plain("#7A4B3C"), blanket: plain("#3E6FA8"), cat: plain("#141416", { roughness: 0.5 }),
  leaf: plain("#24452D", { flatShading: true }), leaf2: plain("#2E5838", { flatShading: true }), bark: plain("#3A281C"),
  fence: plain("#5E4D3E"), pump: plain("#D8B23A", { roughness: 0.5 }), valve: plain("#2E2F33", { roughness: 0.5 }),
  water: new THREE.MeshStandardMaterial({ color: "#2F8FE0", emissive: "#1C6FC0", emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.88 }),
  drop: glow("#3FA2FF", 2.6),
  winWarm: glow("#FFCF7A", 1.4), winNight: glow("#2A4466", 0.35), shade: glow("#FFE2A6", 1.6),
  tv: glow("#8EC5FF", 1.2), ledOn: glow("#47E36B", 3), ledOff: plain("#5A1E1E"), bulb: glow("#FFE9B0", 1.1),
  art: plain("#2F8FE0"), artSun: plain("#E8C547")
};

// ---------- building blocks ----------
function slab(x0, x1, y0, y1, z0, z1, material, parent) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  if (w < 0.001 || h < 0.001 || d < 0.001) return null;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof material === "function" ? material(w, h, d) : material);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = m.receiveShadow = !small;
  parent.add(m);
  return m;
}
// box a minus box b, as up to six boxes ([x0,x1,y0,y1,z0,z1])
function subtract(a, b) {
  const bx0 = Math.max(a[0], b[0]), bx1 = Math.min(a[1], b[1]), by0 = Math.max(a[2], b[2]), by1 = Math.min(a[3], b[3]), bz0 = Math.max(a[4], b[4]), bz1 = Math.min(a[5], b[5]);
  if (bx0 >= bx1 || by0 >= by1 || bz0 >= bz1) return [a];
  const out = [];
  if (a[0] < bx0) out.push([a[0], bx0, a[2], a[3], a[4], a[5]]);
  if (bx1 < a[1]) out.push([bx1, a[1], a[2], a[3], a[4], a[5]]);
  if (a[2] < by0) out.push([bx0, bx1, a[2], by0, a[4], a[5]]);
  if (by1 < a[3]) out.push([bx0, bx1, by1, a[3], a[4], a[5]]);
  if (a[4] < bz0) out.push([bx0, bx1, by0, by1, a[4], bz0]);
  if (bz1 < a[5]) out.push([bx0, bx1, by0, by1, bz1, a[5]]);
  return out;
}
const LAYERS = [[-0.14, 0, "grass"], [-1.1, -0.14, "top"], [-3.7, -1.1, "clay"], [-6, -3.7, "deep"]];
function earth(b, parent, backfill) {
  for (const [l0, l1, k] of LAYERS) {
    const y0 = Math.max(b[2], l0), y1 = Math.min(b[3], l1);
    const name = backfill && (k === "clay" || k === "top") ? "fill" : k;
    if (y1 > y0) slab(b[0], b[1], y0, y1, b[4], b[5], (w, h, d) => tex(name, Math.max(w, d), h), parent);
  }
}
const UP = new THREE.Vector3(0, 1, 0);
function pipe(a, b, r, material, parent) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dir = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 18), material);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  m.castShadow = !small;
  parent.add(m);
  return m;
}
// groups that grow up from a floor (or drop in) during the intro
const stages = [];
function stage(pivotY, t0, dur, kind = "grow") {
  const outer = new THREE.Group(), inner = new THREE.Group();
  outer.position.y = pivotY; inner.position.y = -pivotY;
  outer.add(inner); world.add(outer);
  stages.push({ outer, pivotY, t0, dur, kind });
  return inner;
}

// ---------- the ground ----------
const gEarth = stage(-6, 0.1, 0.9);
const HOLE = [-4.85, 4.85, -3.4, 0, -5.15, 0];
for (const b of subtract([-9, 9, -6, 0, -7, 0], HOLE)) earth(b, gEarth);

const gFound = stage(-3.4, 0.65, 0.75);
// backfill around the walls (lighter: this is the soil that was dug out and put back)
earth([-4.85, -4.09, -2.6, 0, -5.15, 0], gFound, true);
earth([4.09, 4.85, -2.6, 0, -5.15, 0], gFound, true);
earth([-4.09, 4.09, -2.6, 0, -5.15, -4.59], gFound, true);
// clear stone around the weeping tile
const stoneM = (w, h, d) => tex("stone", Math.max(w, d), h);
slab(-4.85, -4.225, -3.4, -2.6, -5.15, 0, stoneM, gFound);
slab(4.225, 4.85, -3.4, -2.6, -5.15, 0, stoneM, gFound);
slab(-4.225, 4.225, -3.4, -2.6, -5.15, -4.725, stoneM, gFound);
// footings, walls, slab
const concM = (w, h, d) => tex("conc", Math.max(w, d), h);
slab(-4.225, -3.525, -3.3, -2.95, -4.725, 0, concM, gFound);
slab(3.525, 4.225, -3.3, -2.95, -4.725, 0, concM, gFound);
slab(-3.525, 3.525, -3.3, -2.95, -4.725, -4.025, concM, gFound);
slab(-4.225, 4.225, -3.4, -3.3, -4.725, 0, (w, h, d) => tex("deep", w, h), gFound);
slab(-4, -3.75, -2.95, 0.35, -4.5, 0, concM, gFound);
slab(3.75, 4, -2.95, 0.35, -4.5, 0, concM, gFound);
slab(-3.75, 3.75, -2.95, 0.35, -4.5, -4.25, concM, gFound);
// waterproof membrane and dimpled drainage board on the outside of the walls, below the ground
slab(-4.03, -4, -2.95, 0, -4.53, 0, M.membrane, gFound);
slab(4, 4.03, -2.95, 0, -4.53, 0, M.membrane, gFound);
slab(-4.03, 4.03, -2.95, 0, -4.53, -4.5, M.membrane, gFound);
slab(-4.09, -4.03, -2.9, -0.05, -4.59, 0, M.dimple, gFound);
slab(4.03, 4.09, -2.9, -0.05, -4.59, 0, M.dimple, gFound);
slab(-4.09, 4.09, -2.9, -0.05, -4.59, -4.53, M.dimple, gFound);
// under the slab: native soil, then gravel, with the sump pit cut through both
const PIT = [-3.45, -2.65, -3.4, -2.45, -0.4, 0];
for (const b of subtract([-3.525, 3.525, -3.3, -2.95, -4.025, 0], PIT)) slab(...b, (w, h, d) => tex("deep", w, h), gFound);
for (const b of subtract([-3.75, 3.75, -2.95, -2.6, -4.25, 0], PIT)) slab(...b, stoneM, gFound);
for (const b of subtract([-3.75, 3.75, -2.6, -2.45, -4.25, 0], PIT)) slab(...b, concM, gFound);
// the pit: a plastic liner open to the front
slab(-3.45, -2.65, -3.35, -2.45, -0.42, -0.4, M.liner, gFound);
slab(-3.47, -3.45, -3.35, -2.45, -0.42, 0, M.liner, gFound);
slab(-2.65, -2.63, -3.35, -2.45, -0.42, 0, M.liner, gFound);
slab(-3.45, -2.65, -3.37, -3.35, -0.42, 0, M.liner, gFound);
const pitWater = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1, 0.38).translate(0, 0.5, 0), M.water);
pitWater.position.set(-3.05, -3.35, -0.2);
gFound.add(pitWater);
slab(-3.2, -2.9, -3.35, -3.02, -0.32, -0.08, M.pump, gFound);
const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), M.ledOff);
led.position.set(-3.05, -3.1, -0.07);
gFound.add(led);
// weeping tile all the way round the footing, and the pipe from it into the pit
for (const [a, b] of [[[-4.55, -3.1, -4.94], [-4.55, -3.1, 0]], [[-4.55, -3.1, -4.94], [4.55, -3.1, -4.94]], [[4.55, -3.1, -4.94], [4.55, -3.1, 0]]]) {
  pipe(a, b, 0.15, M.tile, gFound);
  pipe(a, [b[0], b[1], b[2] + 0.004], 0.1, M.water, gFound);
}
pipe([-4.55, -3.1, -0.05], [-3.45, -3.1, -0.05], 0.07, M.tile, gFound);
// the house sewer pipe, with its backwater valve, out to the street
pipe([0.6, -2.45, -0.15], [0.6, -2.8, -0.15], 0.07, M.valve, gFound);
pipe([0.6, -2.8, -0.15], [9, -3.25, -0.15], 0.08, plain("#8E949C", { roughness: 0.5 }), gFound);
slab(2.0, 2.55, -2.93, -2.62, -0.3, 0.01, M.valve, gFound);
slab(2.18, 2.37, -2.62, -2.45, -0.25, -0.05, M.valve, gFound);
slab(2.05, 2.5, -2.79, -2.76, 0.01, 0.015, glow("#E8C547", 0.8), gFound);
// sump pump discharge: up the wall, out above the ground, onto the lawn away from the house
const dis = [[-3.05, -3.02, -0.2], [-3.05, 0.15, -0.2], [-4.3, 0.15, -0.2], [-4.3, 0.06, -0.2], [-6.6, 0.06, -0.2]];
for (let i = 0; i < dis.length - 1; i++) pipe(dis[i], dis[i + 1], 0.05, M.pvc, gFound);
pipe([-3.05, -1.7, -0.2], [-3.05, -1.5, -0.2], 0.075, M.valve, gFound);

// ---------- the house ----------
const gHouse = stage(0.35, 1.15, 0.8);
const brickM = (w, h, d) => tex("brick", Math.max(w, d) * 1.4, h * 1.4);
slab(-4, 4, 0.35, 0.6, -4.5, 0, M.wood, gHouse);
slab(-4, -3.8, 0.6, 5.6, -4.5, 0, brickM, gHouse);
slab(3.8, 4, 0.6, 5.6, -4.5, 0, brickM, gHouse);
slab(-3.8, 3.8, 0.6, 5.6, -4.5, -4.3, brickM, gHouse);
slab(-3.8, 3.8, 0.6, 3.0, -4.3, -4.26, M.plaster, gHouse);
slab(-3.8, 3.8, 3.22, 5.6, -4.3, -4.26, M.plasterUp, gHouse);
slab(-3.8, -3.76, 0.6, 5.6, -4.26, 0, M.plaster, gHouse);
slab(3.76, 3.8, 0.6, 5.6, -4.26, 0, M.plaster, gHouse);
slab(-3.8, 3.8, 3.0, 3.22, -4.3, 0, M.wood, gHouse);
slab(-4, 4, 5.6, 5.78, -4.5, 0, M.wood, gHouse);
// windows: lit from inside on the outer walls, dark night glass on the inside
for (const [y0, y1] of [[1.3, 2.4], [3.8, 4.9]]) {
  slab(-4.03, -3.99, y0, y1, -3.0, -1.6, M.winWarm, gHouse);
  slab(-3.77, -3.74, y0, y1, -3.0, -1.6, M.winNight, gHouse);
}
slab(3.99, 4.03, 3.8, 4.9, -3.0, -1.6, M.winWarm, gHouse);
slab(3.74, 3.77, 3.8, 4.9, -3.0, -1.6, M.winNight, gHouse);
// living room
slab(-2.8, 0.4, 0.6, 0.62, -3.6, -1.0, M.rug, gHouse);
slab(-2.6, -0.6, 0.6, 1.05, -4.2, -3.4, M.sofa, gHouse);
slab(-2.6, -0.6, 1.05, 1.6, -4.25, -3.95, M.sofa, gHouse);
slab(-2.78, -2.6, 0.6, 1.3, -4.2, -3.4, M.sofa, gHouse);
slab(-0.6, -0.42, 0.6, 1.3, -4.2, -3.4, M.sofa, gHouse);
slab(-2.0, -1.0, 0.6, 0.95, -2.8, -2.2, M.woodDark, gHouse);
const cat = new THREE.Group();
cat.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), M.cat));
const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), M.cat); head.position.set(0.02, 0.2, 0.06); cat.add(head);
for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 6), M.cat); ear.position.set(0.02 + s * 0.055, 0.31, 0.06); cat.add(ear); }
const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.34, 6).translate(0, 0.17, 0), M.cat);
tail.position.set(0.12, -0.08, -0.02); tail.rotation.z = -0.9; cat.add(tail);
cat.position.set(-1.4, 1.22, -3.72); cat.scale.setScalar(1.15);
gHouse.add(cat);
pipe([0.1, 0.6, -3.9], [0.1, 2.15, -3.9], 0.025, M.woodDark, gHouse);
const shade1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.3, 16, 1, true), M.shade); shade1.position.set(0.1, 2.2, -3.9); gHouse.add(shade1);
slab(1.2, 2.8, 0.6, 1.1, -4.25, -3.85, M.woodDark, gHouse);
slab(1.3, 2.7, 1.25, 2.15, -4.25, -4.2, plain("#0E0E10"), gHouse);
slab(1.36, 2.64, 1.31, 2.09, -4.2, -4.18, M.tv, gHouse);
for (let i = 0; i < 8; i++) slab(2.9, 3.76, 0.6, 0.6 + (i + 1) * 0.3, -0.2 - (i + 1) * 0.3, -0.2 - i * 0.3, M.wood, gHouse);
// bedroom
slab(-3.75, -1.55, 3.22, 4.3, -4.26, -4.16, M.woodDark, gHouse);
slab(-3.7, -1.6, 3.22, 3.62, -4.2, -2.2, M.wood, gHouse);
slab(-3.65, -1.65, 3.62, 3.82, -4.15, -2.25, M.white, gHouse);
slab(-3.67, -1.63, 3.7, 3.88, -3.4, -2.23, M.blanket, gHouse);
slab(-3.4, -1.9, 3.82, 3.98, -4.12, -3.8, M.white, gHouse);
slab(-1.4, -0.9, 3.22, 3.75, -4.2, -3.7, M.woodDark, gHouse);
const shade2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.17, 0.22, 14, 1, true), M.shade); shade2.position.set(-1.15, 3.95, -3.95); gHouse.add(shade2);
slab(-0.4, 0.6, 4.2, 4.9, -4.26, -4.22, M.art, gHouse);
slab(-0.3, 0.5, 4.25, 4.5, -4.22, -4.21, M.artSun, gHouse);
slab(1.0, 2.6, 3.22, 5.2, -4.26, -3.9, M.woodDark, gHouse);
const bookC = ["#C2483A", "#E8C547", "#3E6FA8", "#5C8C4A", "#D9D3C4"];
for (const sy of [3.3, 4.0, 4.7]) { let x = 1.08; while (x < 2.45) { const w = 0.07 + Math.random() * 0.08, h = 0.38 + Math.random() * 0.2; slab(x, x + w, sy, sy + h, -4.22, -3.95, plain(bookC[Math.floor(Math.random() * 5)]), gHouse); x += w + 0.015; } slab(1.0, 2.6, sy - 0.04, sy, -4.26, -3.9, M.wood, gHouse); }
// basement, finished and dry
slab(-2.2, 1.0, -2.45, -2.43, -3.6, -1.2, M.rugB, gHouse);
slab(-1.8, 0.6, -2.45, -2.0, -4.15, -3.4, M.sofaB, gHouse);
slab(-1.8, 0.6, -2.0, -1.45, -4.2, -3.92, M.sofaB, gHouse);
pipe([1.3, -2.45, -3.9], [1.3, -0.95, -3.9], 0.025, M.woodDark, gHouse);
const shade3 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.28, 16, 1, true), M.shade); shade3.position.set(1.3, -0.9, -3.9); gHouse.add(shade3);
slab(-3.7, -3.2, -2.45, -0.8, -4.2, -3.5, M.woodDark, gHouse);
for (const [y, c] of [[-2.3, "#B98E5C"], [-1.75, "#A27B4E"], [-1.2, "#C49A68"]]) slab(-3.66, -3.24, y, y + 0.4, -4.15, -3.6, plain(c), gHouse);
for (let i = 0; i < 9; i++) slab(2.85, 3.72, -2.45, -2.45 + (i + 1) * 0.31, -4.2 + i * 0.3, -4.2 + (i + 1) * 0.3, M.wood, gHouse);
slab(0.38, 0.62, -2.45, -2.44, -0.27, -0.03, plain("#222"), gHouse);

// ---------- roof ----------
const gRoof = stage(0, 1.85, 0.75, "drop");
const pitch = Math.atan2(2.65, 4.6), run = Math.hypot(4.6, 2.65) + 0.3;
for (const s of [-1, 1]) {
  const r = new THREE.Mesh(new THREE.BoxGeometry(run, 0.2, 5.0), tex("shing", run * 1.6, 5 * 1.6));
  r.position.set(s * 2.3, 6.88, -2.45);
  r.rotation.z = -s * pitch;
  r.castShadow = r.receiveShadow = !small;
  gRoof.add(r);
  slab(s * 4.55 - 0.13, s * 4.55 + 0.13, 5.38, 5.56, -4.95, 0, M.alu, gRoof);
}
slab(-0.18, 0.18, 8.12, 8.3, -4.95, 0, plain("#1A1B1F"), gRoof);
const gable = new THREE.Shape([new THREE.Vector2(-3.95, 5.78), new THREE.Vector2(3.95, 5.78), new THREE.Vector2(0, 8.05)]);
const gableMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 0.12, bevelEnabled: false }), tex("brick", 6, 3));
gableMesh.position.z = -4.42; gRoof.add(gableMesh);
const atticBack = new THREE.Mesh(new THREE.ShapeGeometry(gable), plain("#1C1D21"));
atticBack.position.z = -4.29; gRoof.add(atticBack);
slab(-3.8, 3.8, 5.78, 6.02, -4.3, 0, M.insul, gRoof);
for (const z of [-0.6, -1.9, -3.2]) for (const s of [-1, 1]) {
  const raf = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.14, 0.1), M.wood);
  raf.position.set(s * 2.15, 6.82 - 0.16, z); raf.rotation.z = -s * pitch; gRoof.add(raf);
}
slab(2.0, 2.6, 6.6, 8.9, -3.4, -2.8, brickM, gRoof);
slab(1.9, 2.7, 8.9, 9.06, -3.5, -2.7, plain("#55565B"), gRoof);

// ---------- the finishing touches: trim, window frames, siding, a side door, a walkway, grass ----------
const trim = plain("#EDEAE2", { roughness: 0.55 });
const sillM = plain("#BDB8AC");
// white frames with a cross in the middle and a stone sill, on the outside of a side wall
function frameOn(side, y0, y1, z0, z1) {
  const x0 = side < 0 ? -4.08 : 4.0, x1 = side < 0 ? -4.0 : 4.08, t = 0.09;
  slab(x0, x1, y1, y1 + t, z0 - t, z1 + t, trim, gHouse);
  slab(x0, x1, y0 - t, y0, z0 - t, z1 + t, trim, gHouse);
  slab(x0, x1, y0, y1, z0 - t, z0, trim, gHouse);
  slab(x0, x1, y0, y1, z1, z1 + t, trim, gHouse);
  slab(x0, x1, y0, y1, (z0 + z1) / 2 - 0.035, (z0 + z1) / 2 + 0.035, trim, gHouse);
  slab(x0, x1, (y0 + y1) / 2 - 0.035, (y0 + y1) / 2 + 0.035, z0, z1, trim, gHouse);
  slab(side < 0 ? -4.22 : 4.0, side < 0 ? -4.0 : 4.22, y0 - t - 0.07, y0 - t, z0 - t - 0.06, z1 + t + 0.06, sillM, gHouse);
}
frameOn(-1, 1.3, 2.4, -3.0, -1.6);
frameOn(-1, 3.8, 4.9, -3.0, -1.6);
frameOn(1, 3.8, 4.9, -3.0, -1.6);
// siding on the upper floor (cut around the windows), with a white band where it meets the brick
const sideM = (w, h, d) => tex("siding", Math.max(w, d), h * 2.2);
for (const sx of [-1, 1]) {
  const wall = sx < 0 ? [-4.035, -4.0, 3.1, 5.6, -4.5, 0] : [4.0, 4.035, 3.1, 5.6, -4.5, 0];
  for (const b of subtract(wall, [-9, 9, 3.71, 4.99, -3.09, -1.51])) slab(...b, sideM, gHouse);
  slab(sx < 0 ? -4.07 : 4.0, sx < 0 ? -4.0 : 4.07, 3.0, 3.12, -4.5, 0, trim, gHouse);
  slab(sx < 0 ? -4.07 : 4.0, sx < 0 ? -4.0 : 4.07, 0.6, 5.6, -4.5, -4.38, trim, gHouse);
}
// a side door with a little roof, a porch light and concrete steps
slab(4.0, 4.05, 0.62, 2.7, -3.75, -2.75, plain("#24433F", { roughness: 0.5 }), gHouse);
slab(4.0, 4.09, 2.7, 2.8, -3.85, -2.65, trim, gHouse);
slab(4.0, 4.09, 0.6, 2.7, -3.85, -3.75, trim, gHouse);
slab(4.0, 4.09, 0.6, 2.7, -2.75, -2.65, trim, gHouse);
slab(4.05, 4.07, 1.0, 2.4, -3.6, -2.9, glow("#FFCF7A", 0.5), gHouse);
const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), plain("#D8B23A", { metalness: 0.8, roughness: 0.3 }));
knob.position.set(4.1, 1.6, -2.88); gHouse.add(knob);
slab(4.0, 4.65, 2.95, 3.04, -4.0, -2.5, plain("#2A2C31"), gHouse);
const porch = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), M.bulb);
porch.position.set(4.1, 2.35, -2.42); gHouse.add(porch);
const porchLight = new THREE.PointLight("#FFC98A", 0, 4.5, 2);
porchLight.position.set(4.5, 2.3, -2.6); porchLight.userData.full = 7; world.add(porchLight);
slab(4.0, 4.95, 0, 0.2, -3.95, -2.55, concM, gHouse);
slab(4.0, 4.65, 0.2, 0.4, -3.95, -2.55, concM, gHouse);
slab(4.0, 4.35, 0.4, 0.6, -3.95, -2.55, concM, gHouse);
// crisp white trim along the cut edge of the roof
for (const s of [-1, 1]) {
  const rake = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(4.6, 2.65) + 0.3, 0.16, 0.08), trim);
  rake.position.set(s * 2.3, 6.98, 0.04); rake.rotation.z = -s * Math.atan2(2.65, 4.6);
  gRoof.add(rake);
}

// ---------- yard: downspout, tree, fence, streetlamp ----------
const gYard = stage(0, 1.55, 0.7);
pipe([4.57, 5.42, -0.25], [4.15, 5.0, -0.25], 0.075, M.alu, gYard);
pipe([4.15, 5.0, -0.25], [4.15, 0.12, -0.25], 0.075, M.alu, gYard);
pipe([4.15, 0.12, -0.25], [7.0, 0.07, -0.25], 0.09, M.alu, gYard);
const tree = new THREE.Group();
tree.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 2.8, 8).translate(0, 1.4, 0), M.bark), { castShadow: !small }));
for (const [x, y, z, r, m] of [[0, 3.4, 0, 1.55, M.leaf], [-0.8, 2.7, 0.5, 1.1, M.leaf2], [0.75, 2.8, -0.5, 1.05, M.leaf2], [0.2, 4.4, 0.1, 0.95, M.leaf]]) {
  const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), m);
  f.position.set(x, y, z); f.castShadow = !small; tree.add(f);
}
tree.position.set(-6.8, 0, -5.0);
gYard.add(tree);
for (const [x, z, r] of [[-5.3, -3.4, 0.5], [-5.6, -2.6, 0.38], [5.7, -4.7, 0.45]]) {
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M.leaf2); b.position.set(x, r * 0.75, z); b.castShadow = !small; gYard.add(b);
}
for (let x = -8.8; x <= 8.81; x += 1.6) slab(x - 0.06, x + 0.06, 0, 1.2, -6.92, -6.8, M.fence, gYard);
slab(-8.8, 8.8, 0.85, 0.95, -6.9, -6.82, M.fence, gYard);
slab(-8.8, 8.8, 0.35, 0.45, -6.9, -6.82, M.fence, gYard);
pipe([7.6, 0, -5.8], [7.6, 4.6, -5.8], 0.07, plain("#3A3C40"), gYard);
pipe([7.6, 4.6, -5.8], [7.0, 4.75, -5.8], 0.05, plain("#3A3C40"), gYard);
const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), M.bulb); bulb.position.set(6.95, 4.62, -5.8); gYard.add(bulb);
for (let x = 5.05; x < 8.7; x += 0.62) slab(x, x + 0.52, 0, 0.045, -3.5, -2.95, concM, gYard);
// puddles: dark and shiny, so the lamps catch in them
const puddleM = new THREE.MeshStandardMaterial({ color: "#152230", roughness: 0.04, metalness: 0.7 });
for (const [x, z, r] of [[-7.4, -2.2, 0.7], [-2.6, -5.9, 0.5], [6.2, -5.0, 0.6], [8.2, -1.6, 0.45]]) {
  const p = new THREE.Mesh(new THREE.CircleGeometry(r, 28), puddleM);
  p.rotation.x = -Math.PI / 2; p.scale.set(1, 0.7, 1); p.position.set(x, 0.012, z); p.receiveShadow = true; gYard.add(p);
}
// grass: lots of little blades, each a slightly different green
const blades = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.26, 3).translate(0, 0.13, 0), plain("#FFFFFF", { roughness: 0.9 }), small ? 450 : 1400);
{
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), at = new THREE.Vector3(), col = new THREE.Color();
  let n = 0;
  while (n < blades.count) {
    const x = THREE.MathUtils.randFloat(-8.95, 8.95), z = THREE.MathUtils.randFloat(-6.75, -0.06);
    if (x > -4.15 && x < 4.15 && z > -4.66) continue;          // the house
    if (x > 3.95 && z > -4.05 && z < -2.45) continue;          // steps and walkway
    if (x > 4.1 && x < 7.1 && z > -0.45) continue;             // downspout extension
    e.set(THREE.MathUtils.randFloat(-0.3, 0.3), Math.random() * 6.3, THREE.MathUtils.randFloat(-0.3, 0.3));
    const k = THREE.MathUtils.randFloat(0.6, 1.4);
    blades.setMatrixAt(n, m4.compose(at.set(x, 0, z), q.setFromEuler(e), sc.set(k, k * THREE.MathUtils.randFloat(0.7, 1.6), k)));
    blades.setColorAt(n, col.setHSL(0.24 + Math.random() * 0.06, 0.5, 0.2 + Math.random() * 0.14));
    n++;
  }
  gYard.add(blades);
}

// a soft shadow under the whole slice, and a yellow outline on the cut face
const sc = document.createElement("canvas"); sc.width = sc.height = 128;
const sg = sc.getContext("2d"), grad = sg.createRadialGradient(64, 64, 4, 64, 64, 64);
grad.addColorStop(0, "rgba(0,0,0,.75)"); grad.addColorStop(1, "rgba(0,0,0,0)");
sg.fillStyle = grad; sg.fillRect(0, 0, 128, 128);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -6.6, -3.5);
world.add(shadow);
const outline = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.PlaneGeometry(18, 6)),
  new THREE.LineBasicMaterial({ color: "#FFC93C", transparent: true, opacity: 0 })
);
outline.position.set(0, -3, 0.01);
world.add(outline);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight("#8FA6C8", "#2A1F18", 0.7);
scene.add(hemi);
const moon = new THREE.DirectionalLight("#C9D8FF", 1.5);
moon.position.set(-10, 18, 14);
moon.castShadow = !small;
moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -14, right: 14, top: 14, bottom: -10, near: 1, far: 60 });
moon.shadow.bias = -0.0004;
scene.add(moon);
const rim = new THREE.DirectionalLight("#FFC96B", 0.5);
rim.position.set(10, 6, -12);
scene.add(rim);
const flash = new THREE.DirectionalLight("#DFE8FF", 0);
flash.position.set(4, 25, 10);
scene.add(flash);
const room = (color, i, d, x, y, z) => { const l = new THREE.PointLight(color, 0, d, 2); l.position.set(x, y, z); l.userData.full = i; world.add(l); return l; };
const lamps = [
  room("#FFC98A", 14, 7, 0.1, 2.0, -3.4),
  room("#FFC98A", 9, 6, -1.15, 3.9, -3.5),
  room("#FFC98A", 12, 7, 1.3, -1.1, -3.4),
  room("#FFD9A0", 40, 14, 6.95, 4.4, -5.6)
];
const tvLight = room("#8EC5FF", 6, 5, 2.0, 1.7, -3.3);

// ---------- rain ----------
const N = small ? 700 : 2000;
const rainPos = new Float32Array(N * 6), drops = [];
const WIND = -1.2;
function floorAt(x, z) {
  if (x > -4.75 && x < 4.75 && z > -4.95 && z < 0.05) return 5.55 + 2.65 * (1 - Math.min(1, Math.abs(x) / 4.6));
  return 0.02;
}
function spawn(d, anywhere) {
  d.x = THREE.MathUtils.randFloat(-8.6, 9.6);
  d.z = THREE.MathUtils.randFloat(-6.9, -0.05);
  d.y = anywhere ? THREE.MathUtils.randFloat(0, 16) : THREE.MathUtils.randFloat(13, 17);
  d.v = THREE.MathUtils.randFloat(13, 19);
}
for (let i = 0; i < N; i++) { const d = {}; spawn(d, true); drops.push(d); }
const rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.LineBasicMaterial({ color: "#C4E2FF", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
const rain = new THREE.LineSegments(rainGeo, rainMat);
rain.frustumCulled = false;
world.add(rain);
// ripples where drops land
const ripples = [];
for (let i = 0; i < 40; i++) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.12, 20), new THREE.MeshBasicMaterial({ color: "#A9D2FA", transparent: true, opacity: 0, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.visible = false; world.add(m);
  ripples.push({ m, life: 1 });
}
let rippleNext = 0;
function ripple(x, y, z) { const r = ripples[rippleNext++ % ripples.length]; r.m.position.set(x, y + 0.01, z); r.life = 0; r.m.visible = true; }
// a little drifting mist, so the storm has some air in it
const mistTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const MIST = small ? 50 : 120, mistPos = new Float32Array(MIST * 3);
for (let i = 0; i < MIST; i++) { mistPos[i * 3] = THREE.MathUtils.randFloat(-14, 14); mistPos[i * 3 + 1] = THREE.MathUtils.randFloat(0.4, 10); mistPos[i * 3 + 2] = THREE.MathUtils.randFloat(-10, -0.5); }
const mistGeo = new THREE.BufferGeometry();
mistGeo.setAttribute("position", new THREE.BufferAttribute(mistPos, 3));
const mistMat = new THREE.PointsMaterial({ map: mistTex, size: 3.4, color: "#6F82A3", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const mist = new THREE.Points(mistGeo, mistMat);
world.add(mist);
// the downspout's puddle out on the lawn
const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), M.water);
puddle.rotation.x = -Math.PI / 2; puddle.position.set(7.45, 0.025, -0.35); puddle.scale.setScalar(0.001);
world.add(puddle);
const pumpPuddle = puddle.clone(); pumpPuddle.position.set(-7.0, 0.025, -0.3); world.add(pumpPuddle);

// water working its way down through the soil (drawn on the cut face), and through the pipes
const dropGeo = new THREE.SphereGeometry(0.07, 8, 6);
const seeps = [];
for (let i = 0; i < 26; i++) {
  const left = i % 2 === 0;
  const m = new THREE.Mesh(dropGeo, M.drop);
  m.position.z = 0.05;
  world.add(m);
  seeps.push({ m, sx: left ? THREE.MathUtils.randFloat(-8.6, -5.0) : THREE.MathUtils.randFloat(5.0, 8.6), tx: left ? -4.55 : 4.55, ph: Math.random(), sp: THREE.MathUtils.randFloat(0.18, 0.28), wob: Math.random() * 6 });
}
const PATH_IN = [[-4.55, -3.1], [-3.45, -3.1], [-3.2, -3.2]];
const inflow = [];
for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(dropGeo, M.drop); m.position.z = 0.04; m.scale.setScalar(0.8); world.add(m); inflow.push({ m, ph: i / 5 }); }
const outflow = [];
for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(dropGeo, M.drop); m.scale.setScalar(0.75); m.visible = false; world.add(m); outflow.push({ m, ph: i / 14 }); }
function along(path, k) {
  let total = 0; const seg = [];
  for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(l); total += l; }
  let d = k * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) { const t = d / seg[i]; return path[i].map((v, j) => v + (path[i + 1][j] - v) * t); }
    d -= seg[i];
  }
  return path[path.length - 1];
}
const spout = [];
for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(dropGeo, M.drop); m.scale.setScalar(0.7); world.add(m); spout.push({ m, ph: i / 10 }); }

// far-off lightning
const boltMat = new THREE.LineBasicMaterial({ color: "#F4F8FF", transparent: true, opacity: 0 });
const bolt = new THREE.Line(new THREE.BufferGeometry(), boltMat);
scene.add(bolt);
function newBolt() {
  const pts = []; let x = THREE.MathUtils.randFloat(-30, 30), y = 34;
  const z = -45;
  while (y > 4) { pts.push(new THREE.Vector3(x, y, z)); x += THREE.MathUtils.randFloat(-2.5, 2.5); y -= THREE.MathUtils.randFloat(1.5, 3.5); }
  bolt.geometry.dispose();
  bolt.geometry = new THREE.BufferGeometry().setFromPoints(pts);
}

// ---------- labels pinned to the model: tap one and the camera flies in to explain it ----------
const SPOTS = [
  { name: "Weeping tile", at: [-4.55, -3.1, 0.05], side: "left", phone: true, link: "services.html#exterior",
    text: "A perforated pipe in clear stone beside the footing. It collects the water in the soil around the foundation and carries it to the sump pit, before it can push through the wall." },
  { name: "Sump pump", at: [-3.05, -3.0, 0.05], phone: true, link: "services.html#sump",
    text: "When the water in the pit rises, the pump switches on and pushes it up the pipe and out onto the lawn, away from the house. The City pays back up to $2,250 for one with an alarm." },
  { name: "Waterproof membrane", at: [-4.06, -1.4, 0.05], side: "left", link: "services.html#exterior",
    text: "A rubberized coating on the outside of the foundation wall, covered by a dimpled drainage board, so water runs down to the weeping tile instead of soaking into the concrete." },
  { name: "Backwater valve", at: [2.28, -2.78, 0.05], link: "services.html#rebate",
    text: "A one-way flap on the sewer pipe. Water can leave the house, but if the city sewer backs up in a storm, it can't come up through the floor drain. The City pays back up to $1,600." },
  { name: "Downspout extension", at: [6.2, 0.15, -0.25], link: "services.html#grading",
    text: "Carries the roof's water well away from the wall, so it doesn't soak the soil right against the foundation." },
  { name: "Dry basement", at: [-0.6, -1.0, -2.0], phone: true, link: "services.html",
    text: "All of it working together. The basement stays dry, even in a downpour." }
];
SPOTS.forEach((s) => { s.v = new THREE.Vector3(...s.at); });
const DIP = { v: new THREE.Vector3(-1.2, -1.7, -1.2) }; // where the intro camera dips in for a look
pinsBox.removeAttribute("aria-hidden");
const card = document.createElement("div");
card.className = "spot-card";
card.hidden = true;
card.setAttribute("role", "dialog");
card.innerHTML = '<span class="spot-k">How it works</span><h3></h3><p></p><div class="spot-actions"><a class="btn btn-sm">How Wizards fixes it <span class="arr" aria-hidden="true">→</span></a><button type="button" class="spot-back">Back to the full view</button></div>';
host.appendChild(card);
let focus = null, lastSpot = null;
const PINS = SPOTS.filter((s) => !small || s.phone).map((s) => {
  const el = document.createElement("button");
  el.type = "button";
  const side = small ? "" : s.side || ""; // phones: every label to the right of its dot, so none fall off the edge
  el.className = "pin " + side;
  el.innerHTML = "<span></span>";
  el.firstChild.textContent = s.name;
  el.setAttribute("aria-label", s.name + ", how it works");
  el.addEventListener("click", () => (focus === s ? closeSpot() : openSpot(s)));
  pinsBox.appendChild(el);
  // on phones the tile and pump dots are close together, so their labels split up and down
  const dy = small ? ({ "Weeping tile": -15, "Sump pump": 15 })[s.name] || 0 : 0;
  return { el, v: s.v, side, s, dy };
});
function openSpot(s) {
  focus = lastSpot = s;
  card.querySelector("h3").textContent = s.name;
  card.querySelector("p").textContent = s.text;
  card.querySelector("a").href = s.link;
  card.hidden = false;
  pinsBox.classList.add("focused");
  document.body.classList.add("spot-open");
  PINS.forEach((p) => p.el.classList.toggle("active", p.s === s));
}
function closeSpot() {
  focus = null;
  card.hidden = true;
  pinsBox.classList.remove("focused");
  document.body.classList.remove("spot-open");
  PINS.forEach((p) => p.el.classList.remove("active"));
}
card.querySelector(".spot-back").addEventListener("click", closeSpot);
addEventListener("keydown", (e) => { if (e.key === "Escape" && focus) closeSpot(); });

// ---------- camera: swoops in, then drifts; drag to look around ----------
const target = new THREE.Vector3(0, 0.6, -2.2);
const REST = { theta: 0.48, phi: 1.13 };
let R = 26, W = 1, H = 1;
const look = { theta: 0, phi: 0, dragT: 0, dragP: 0, mx: 0, my: 0 };
function resize() {
  // on phones the canvas is its own block above the text; on wider screens it fills the whole hero
  W = host.clientWidth;
  H = narrow.matches ? renderer.domElement.clientHeight || innerHeight * 0.54 : host.clientHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  const a = camera.aspect;
  // wide screens: the model sits up and to the right, clear of the headline
  R = a < 1 ? 31 / Math.max(a, 0.55) : a < 1.4 ? 39 : 37.5;
  if (!narrow.matches && a > 1.2) camera.setViewOffset(W, H, -W * 0.25, H * 0.11, W, H);
  else camera.setViewOffset(W, H, 0, H * 0.04, W, H);
  camera.updateProjectionMatrix();
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(W, H); }
}
// glow on anything bright: windows, lamps, the water, the lightning
let composer = null;
function makeComposer() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.55 : 0.75, 0.5, 0.8));
  composer.addPass(new OutputPass());
}
try { makeComposer(); } catch (err) { composer = null; }
resize();
addEventListener("resize", resize);
const cv = renderer.domElement;
let drag = null;
cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, t: look.dragT, p: look.dragP }; });
addEventListener("pointermove", (e) => {
  if (drag) {
    look.dragT = THREE.MathUtils.clamp(drag.t - (e.clientX - drag.x) * 0.006, -1.4, 1.1);
    look.dragP = THREE.MathUtils.clamp(drag.p - (e.clientY - drag.y) * 0.004, -0.45, 0.32);
  } else if (e.pointerType === "mouse") {
    look.mx = e.clientX / innerWidth - 0.5; look.my = e.clientY / innerHeight - 0.5;
  }
});
addEventListener("pointerup", () => { drag = null; });
cv.addEventListener("pointercancel", () => { drag = null; });

// ---------- the loop ----------
const ease = {
  back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  bounce: (t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; },
  io: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const START = { theta: -2.2, phi: 0.26, R: 2.4 }; // high up and round the back, so it sweeps all the way round
const BUILT = 4.4;
const aim = new THREE.Vector3();
let spotK = 0;
let t = quick ? 6 : 0, last = performance.now(), running = true, builtSent = false, nextFlash = quick ? 2 : 2.75, flashT = -1;
const tmp = new THREE.Vector3();
const perf = { n: 0, slow: 0 };

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  t += dt;

  // intro: each part grows or drops into place
  for (const s of stages) {
    const p = clamp01((t - s.t0) / s.dur);
    if (s.kind === "drop") { s.outer.position.y = s.pivotY + (1 - ease.bounce(p)) * 9; s.outer.visible = p > 0; }
    else { s.outer.scale.y = Math.max(0.0001, ease.back(p)); s.outer.visible = p > 0; }
  }
  const lightsOn = clamp01((t - 2.25) / 0.6);
  lamps.forEach((l) => { l.intensity = l.userData.full * lightsOn; });
  porchLight.intensity = porchLight.userData.full * lightsOn;
  mistMat.opacity = 0.09 * clamp01((t - 2.45) / 1.2);
  if (!still) for (let i = 0; i < MIST; i++) { mistPos[i * 3] += dt * (0.25 + (i % 5) * 0.06); if (mistPos[i * 3] > 14) mistPos[i * 3] = -14; }
  mistGeo.attributes.position.needsUpdate = true;
  rainMat.opacity = 0.55 * clamp01((t - 2.45) / 0.8);
  outline.material.opacity = 0.7 * clamp01((t - 2.6) / 0.6);
  if (t > BUILT && !builtSent) { builtSent = true; dispatchEvent(new Event("wz3d:built")); pinsBox.classList.add("on"); }

  // camera: sweeps round from behind while it builds, dips in to look at the basement, then pulls back.
  // Tapping a label flies it in to that spot instead.
  const k = ease.io(clamp01(t / 3.0));
  const idle = still || focus ? 0 : Math.sin(t * 0.13) * 0.12;
  look.theta += ((look.mx * 0.35) - look.theta) * 0.04;
  look.phi += ((look.my * 0.12) - look.phi) * 0.04;
  let th = THREE.MathUtils.lerp(START.theta, REST.theta, k) + idle + look.theta + look.dragT;
  let ph = THREE.MathUtils.clamp(THREE.MathUtils.lerp(START.phi, REST.phi, k) + look.phi + look.dragP, 0.3, 1.48);
  let rr = R * THREE.MathUtils.lerp(START.R, 1, k);
  aim.copy(target);
  spotK += ((focus ? 1 : 0) - spotK) * (1 - Math.exp(-dt * 3.2)); // same speed at any frame rate
  const dipK = quick ? 0 : Math.pow(Math.sin(Math.PI * clamp01((t - 2.6) / 2.0)), 2) * 0.85;
  const fk = Math.max(spotK, dipK), fv = spotK >= dipK && lastSpot ? lastSpot.v : DIP.v;
  if (fk > 0.001) {
    aim.lerp(fv, fk);
    th = THREE.MathUtils.lerp(th, REST.theta * 0.5 + look.dragT * 0.6, fk);
    ph = THREE.MathUtils.lerp(ph, 1.3 + look.dragP * 0.4, fk);
    rr = THREE.MathUtils.lerp(rr, Math.min(R * 0.42, 15), fk);
  }
  camera.position.set(aim.x + rr * Math.sin(ph) * Math.sin(th), aim.y + rr * Math.cos(ph), aim.z + rr * Math.sin(ph) * Math.cos(th));
  camera.lookAt(aim);

  // rain and ripples
  const raining = t > 2.45;
  for (let i = 0; i < N; i++) {
    const d = drops[i];
    if (raining && !still) {
      d.y -= d.v * dt; d.x += WIND * dt;
      const f = floorAt(d.x, d.z);
      if (d.y < f) { if (Math.random() < 0.06) ripple(d.x, f, d.z); spawn(d, false); }
    }
    const o = i * 6;
    rainPos[o] = d.x; rainPos[o + 1] = d.y; rainPos[o + 2] = d.z;
    rainPos[o + 3] = d.x - WIND * 0.03; rainPos[o + 4] = d.y + 0.38; rainPos[o + 5] = d.z;
  }
  rainGeo.attributes.position.needsUpdate = true;
  for (const r of ripples) {
    if (r.life >= 1) { r.m.visible = false; continue; }
    r.life += dt / 0.55;
    r.m.scale.setScalar(0.4 + r.life * 2.4);
    r.m.material.opacity = 0.55 * (1 - r.life);
  }

  // water moving through the system
  const wet = clamp01((t - 2.6) / 1.2);
  for (const s of seeps) {
    const p = (t * s.sp + s.ph) % 1;
    const x = THREE.MathUtils.lerp(s.sx, s.tx, p) + Math.sin(p * 9 + s.wob) * 0.12;
    const y = THREE.MathUtils.lerp(-0.2, -3.1, p);
    s.m.position.set(x, y, 0.05);
    s.m.scale.setScalar(Math.sin(p * Math.PI) * wet + 0.0001);
  }
  for (const f of inflow) {
    const p = (t * 0.35 + f.ph) % 1, q = along(PATH_IN, p);
    f.m.position.set(q[0], q[1], 0.04);
    f.m.scale.setScalar(0.8 * wet + 0.0001);
  }
  // the sump: fills over 7 seconds, pump runs for 1.8, repeat
  const cyc = (t - 3) % 10, phase = t < 3 ? 0 : cyc;
  const pumping = t >= 3 && phase > 7 && phase < 8.8;
  const level = t < 3 ? 0.12 + 0.2 * clamp01(t / 3) : phase < 7 ? 0.12 + 0.68 * (phase / 7) : pumping ? 0.8 - 0.68 * ((phase - 7) / 1.8) : 0.12;
  pitWater.scale.y = level * 0.9;
  led.material = pumping ? M.ledOn : M.ledOff;
  for (const o of outflow) {
    o.m.visible = pumping;
    if (pumping) { const q = along(dis, (t * 0.9 + o.ph) % 1); o.m.position.set(q[0], q[1] + 0.0, q[2]); }
  }
  pumpPuddle.scale.setScalar(THREE.MathUtils.lerp(pumpPuddle.scale.x, pumping ? 1 : 0.35 * wet + 0.001, 0.05));
  for (const s of spout) {
    const p = (t * 1.6 + s.ph) % 1;
    s.m.position.set(7.0 + p * 0.55, 0.07 - p * p * 0.1, -0.25 + Math.sin(s.ph * 20) * 0.06);
    s.m.scale.setScalar(0.7 * wet + 0.0001);
  }
  puddle.scale.setScalar(Math.max(0.001, wet * (1 + Math.sin(t * 2.4) * 0.06)));

  // little life: TV flicker, tree sway, cat tail
  const fl = 0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 31) * 0.07;
  M.tv.emissiveIntensity = 1.2 * fl; tvLight.intensity = 6 * fl * lightsOn;
  tree.rotation.z = Math.sin(t * 0.9) * 0.025;
  tail.rotation.z = -0.9 + Math.sin(t * 1.8) * 0.35;

  // lightning
  if (!still && t > nextFlash && flashT < 0) { flashT = 0; newBolt(); }
  if (flashT >= 0) {
    flashT += dt;
    const env = flashT < 0.06 ? 1 : flashT < 0.12 ? 0.15 : flashT < 0.2 ? 0.8 : Math.max(0, 1 - (flashT - 0.2) / 0.25);
    flash.intensity = 3.2 * env; boltMat.opacity = env;
    scene.background.copy(SKY).lerp(tmp.set(0.35, 0.4, 0.55), env * 0.35);
    if (flashT > 0.5) { flashT = -1; flash.intensity = 0; boltMat.opacity = 0; scene.background.copy(SKY); nextFlash = t + THREE.MathUtils.randFloat(6, 11); }
  }

  if (composer) composer.render(); else renderer.render(scene, camera);
  // slow device? drop the glow so it stays smooth
  if (composer && builtSent && !still && perf.n < 120) { perf.n++; if (dt > 1 / 32) perf.slow++; if (perf.n === 120 && perf.slow > 70) composer = null; }

  // labels follow their spots
  if (builtSent) for (const p of PINS) {
    tmp.copy(p.v).project(camera);
    const x = (tmp.x * 0.5 + 0.5) * W, y = (-tmp.y * 0.5 + 0.5) * H + p.dy;
    p.el.style.transform = p.side === "left" ? `translate(calc(${x + 5}px - 100%), calc(${y}px - 50%))` : `translate(${x - 5}px, calc(${y}px - 50%))`;
  }
}

let ready = false;
function loop(now) {
  if (!running) return;
  frame(now);
  if (!ready) { ready = true; window.WZ.ready3d = true; dispatchEvent(new Event("wz3d:ready")); }
  requestAnimationFrame(loop);
}
// don't burn battery when nobody's looking
function setRunning(on) {
  if (on === running) return;
  running = on;
  if (on) { last = performance.now(); requestAnimationFrame(loop); }
}
if ("IntersectionObserver" in window) new IntersectionObserver((es) => setRunning(es[0].isIntersecting && !document.hidden)).observe(host);
document.addEventListener("visibilitychange", () => setRunning(!document.hidden));
window.WZ.loaded3d = true; // the 3D is set up; it starts drawing as soon as the tab is visible
requestAnimationFrame(loop);
