// Shared shorthands, canvas handle, raw input state and 2D drawing primitives.
// Comments are stripped by terser, so they cost nothing in the shipped zip.
const C = document.getElementById('c'), X = C.getContext('2d');
const M = Math, PI = M.PI, TAU = PI * 2;
const min = M.min, max = M.max, abs = M.abs, flr = M.floor, pow = M.pow, rnd = M.random;
const cos = M.cos, sin = M.sin;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rr = (a, b) => a + rnd() * (b - a);
const ease = t => t * t * (3 - 2 * t);
const hash = i => ((i * 9301 + 49297) % 233280) / 233280;

let W = 0, H = 0, DPR = 1, TIME = 0;

// Pointer: x/y track the cursor, dy/w accumulate scroll deltas consumed once per frame,
// tap fires on a press-release that never turned into a drag.
const IN = { x: -9, y: -9, dn: 0, tap: 0, tx: 0, ty: 0, drag: 0, dy: 0, w: 0 };
// Which control scheme the player is actually using, so a hint can name a key or
// a button. Set by the pointer type and cleared by any keypress: a media query
// would call a touchscreen laptop a phone for as long as its owner keeps typing.
let TCH = 0;
let _sy = 0;
const _p = e => { IN.x = e.clientX; IN.y = e.clientY };
C.addEventListener('pointerdown', e => {
  au(); _p(e); IN.dn = 1; IN.drag = 0; _sy = e.clientY; IN.dy = 0; TCH = e.pointerType == 'mouse' ? 0 : 1;
  try { C.setPointerCapture(e.pointerId) } catch (z) { }
});
C.addEventListener('pointermove', e => {
  if (IN.dn) { IN.dy += e.clientY - IN.y; if (abs(e.clientY - _sy) > 7) IN.drag = 1 }
  _p(e);
});
const _up = () => { if (IN.dn && !IN.drag) { IN.tap = 1; IN.tx = IN.x; IN.ty = IN.y } IN.dn = 0 };
C.addEventListener('pointerup', _up);
C.addEventListener('pointercancel', _up);
addEventListener('wheel', e => { IN.w += e.deltaY; e.preventDefault() }, { passive: false });
addEventListener('contextmenu', e => e.preventDefault());

const K = {};
addEventListener('keydown', e => { au(); TCH = 0; K[e.key] = 1; if (e.key == ' ' || e.key.slice(0, 5) == 'Arrow') e.preventDefault() });
addEventListener('keyup', e => K[e.key] = 0);
addEventListener('blur', () => { for (const k in K) K[k] = 0 });

const dot = (x, y, r) => { X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill() };
const tri = (a, b, c, d, e, f) => { X.beginPath(); X.moveTo(a, b); X.lineTo(c, d); X.lineTo(e, f); X.closePath(); X.fill() };
const box = (x, y, w, h, r) => { X.beginPath(); X.roundRect(x, y, w, h, r) };
// Filled rounded rect with an optional outline: every panel, pill and button.
const plate = (x, y, w, h, r, fill, line, lw) => {
  X.fillStyle = fill; box(x, y, w, h, r); X.fill();
  if (line) { X.strokeStyle = line; X.lineWidth = lw || 1; X.stroke() }
};
// mw is fillText's own maxWidth: the canvas condenses the glyphs to fit instead
// of spilling. Only the shop passes it, where a column can be narrow.
const txt = (s, x, y, sz, col, al, w, mw) => {
  X.font = (w ? w + ' ' : '') + sz + 'px system-ui,Segoe UI,sans-serif';
  X.fillStyle = col; X.textAlign = al || 'left'; X.textBaseline = 'middle';
  X.fillText(s, x, y, mw);
};
const grad = (x0, y0, x1, y1, a, b) => {
  const g = X.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, a); g.addColorStop(1, b); return g;
};
const hsl = (h, s, l, a) => 'hsl(' + h + ' ' + s + '% ' + l + '%/' + (a === undefined ? 1 : a) + ')';
