const C = document.getElementById('c'), X = C.getContext('2d');
const M = Math, PI = M.PI, TAU = PI * 2;
const min = M.min, max = M.max, abs = M.abs, flr = M.floor, pow = M.pow, sqr = M.sqrt, rnd = M.random;
const cos = M.cos, sin = M.sin, atan2 = M.atan2, log10 = M.log10;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rr = (a, b) => a + rnd() * (b - a);
const hash = i => ((i * 9301 + 49297) % 233280) / 233280;

let W = 0, H = 0, DPR = 1, LAND = 0, TIME = 0;

const SUF = ' K M B T Qa Qi Sx Sp Oc No De Ud Dd Td'.split(' ');
const fmt = n => {
  if (!(n > 0)) return '0';
  if (n < 1e3) return n < 100 && n % 1 > .049 ? n.toFixed(1) : '' + flr(n);
  const e = min(flr(log10(n) / 3), 13), m = n / pow(1e3, e);
  return (m < 10 ? m.toFixed(2) : m < 100 ? m.toFixed(1) : '' + flr(m)) + SUF[e];
};

const IN = { x: -9, y: -9, ox: 0, oy: 0, dn: 0, tap: 0, tx: 0, ty: 0, drag: 0, dy: 0, w: 0 };
let _sy = 0;
const _p = e => { IN.x = e.clientX; IN.y = e.clientY };
C.addEventListener('pointerdown', e => {
  au(); _p(e); IN.dn = 1; IN.drag = 0; _sy = e.clientY; IN.dy = 0; IN.ox = e.clientX; IN.oy = e.clientY;
  try { C.setPointerCapture(e.pointerId) } catch (z) { }
});
C.addEventListener('pointermove', e => {
  if (IN.dn) { IN.dy += e.clientY - IN.y; if (abs(e.clientY - _sy) > 7) IN.drag = 1 }
  _p(e);
});
const _up = e => { if (IN.dn && !IN.drag) { IN.tap = 1; IN.tx = IN.x; IN.ty = IN.y } IN.dn = 0 };
C.addEventListener('pointerup', _up);
C.addEventListener('pointercancel', _up);
addEventListener('wheel', e => { IN.w += e.deltaY; e.preventDefault() }, { passive: false });
addEventListener('contextmenu', e => e.preventDefault());

const VER = 'v0.5';
const LNA = .17;
const K = {};
addEventListener('keydown', e => { au(); K[e.key] = 1; if (e.key == ' ' || e.key.slice(0, 5) == 'Arrow') e.preventDefault() });
addEventListener('keyup', e => K[e.key] = 0);
addEventListener('blur', () => { for (const k in K) K[k] = 0 });

const dot = (x, y, r) => { X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill() };
const tri = (a, b, c, d, e, f) => { X.beginPath(); X.moveTo(a, b); X.lineTo(c, d); X.lineTo(e, f); X.closePath(); X.fill() };

const txt = (s, x, y, sz, col, al, w) => {
  X.font = (w ? w + ' ' : '') + sz + 'px system-ui,Segoe UI,sans-serif';
  X.fillStyle = col; X.textAlign = al || 'left'; X.textBaseline = 'middle';
  X.fillText(s, x, y);
};
const box = (x, y, w, h, r) => { X.beginPath(); X.roundRect(x, y, w, h, r) };
const grad = (x0, y0, x1, y1, a, b) => {
  const g = X.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, a); g.addColorStop(1, b); return g;
};
const hsl = (h, s, l, a) => 'hsl(' + h + ' ' + s + '% ' + l + '%/' + (a === undefined ? 1 : a) + ')';
