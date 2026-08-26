// Responsive layout plus everything drawn inside the play field:
// sky, cloud bank, ring stacks, the sale flyaway and the aim glint.

// Field rect.
let FS = 14, RFW = 60, TOP = 40, BOT = 60;
let FX = 0, FY = 0, FW = 0, FH = 0;
// Player unicorn: x, hoof line, body height, ring radius, catch line, edge margin.
let HX = 0, UY = 0, US = 60, RS = 12, TY = 0, MG = 20;
// Bottom action bar and top-bar buttons.
let BBY = 0, BBW = 0, BBH = 0, SHX = 0, SHW = 0, DGX = 0, DGW = 0, RSX = 0, RSW = 0;
// Upgrade panel.
let SPX = 0, SPY = 0, SPW = 0, SPH = 0, SRH = 0, SHH = 0, SCOL = 1, SROW = 1, sscr = 0, smax = 0;
// SOFF[i] = height of stack slot i above the hooves, at scale 1.
const SOFF = [], BBX = [], PT = [], FLT = [];

// Rings shrink as the rainbow climbs, so colour and size both identify a ring.
// Rotate the canvas about a point rather than the origin. Callers must restore.
const rotAt = (x, y, a) => { X.save(); X.translate(x, y); X.rotate(a); X.translate(-x, -y) };

const taper = i => 1 - i * .075;
const rsz = i => RS * taper(i);
const slotY = i => UY - SOFF[i];
const tipY = (uy, sc) => uy - US * HORN * sc;
// Apprentice i, receding into the distance behind the player.
const aSc = i => .6 - i * .042;
const aUy = i => UY - US * (.34 + i * .075);
const aTy = i => tipY(aUy(i), aSc(i));

const layout = () => {
  FS = clamp(min(W, H) / 30, 11, 22);
  RFW = clamp(min(W, H) * .13, 42, 92);
  TOP = FS * 2.7; BOT = FS * 3.9;
  FX = RFW; FY = TOP; FW = W - RFW; FH = H - TOP - BOT;
  US = clamp(min(FH * .25, FW * .3), 38, 180);
  RS = US * .17;
  UY = FY + FH; TY = tipY(UY, 1);
  let o = US * 1.05 + RS * .3;
  SOFF[0] = o;
  for (let i = 1; i < NR; i++) { o += (rsz(i - 1) + rsz(i)) * .27; SOFF[i] = o }
  MG = min(max(RS * 1.3, US * .44), FW * .3);
  HX = clamp(HX || FX + FW / 2, FX + MG, FX + FW - MG);

  const p = FS * .5, nb = G.u[U_SAW] ? 3 : 2;
  BBW = (W - p * (nb + 1)) / nb; BBH = BOT - p * 1.3; BBY = H - BOT + p * .65;
  for (let i = 0; i < nb; i++) BBX[i] = p + i * (BBW + p);
  BBX.length = nb;
  DGW = FS * 3.4; RSW = FS * 3; SHW = FS * (W < FS * 34 ? 4.2 : 4.8);
  RSX = W - FS * 5.1 - RSW;
  DGX = RSX - FS * .6 - DGW;
  SHX = DGX - FS * .6 - SHW;

  // The shop sizes itself to the window rather than always scrolling: as many
  // columns as the width affords, then rows squeezed until every upgrade is on
  // screen at once. smax stays 0 - and the scrollbar hidden - unless the window
  // is too small even for the squeezed rows.
  SHH = FS * 3.1;
  SCOL = clamp(flr(W * .94 / (FS * 15)), 1, 3);
  SROW = M.ceil(UP.length / SCOL);
  SPW = min(W * .94, SCOL * FS * 22);
  SRH = max(min(FS * 3.9, (min(H * .94, 900) - SHH - FS * .9) / SROW), FS * 2.8);
  SPH = min(SHH + SROW * SRH + FS * .9, H * .94);
  SPX = (W - SPW) / 2; SPY = (H - SPH) / 2;
  smax = max(0, SROW * SRH - (SPH - SHH - FS * .9));
};

// Every particle is made here. hu >= 0 draws it as a ring of that colour,
// otherwise as a star of colour c; m is how long it lives.
const pt = (x, y, vx, vy, r, m, c, hu, rt) => PT.push({ x, y, vx, vy, r, m, c, hu, rt, l: 0 });

// Sparks thrown out of a sale or a catch.
const burst = (x, y, n, c) => {
  for (let i = 0; i < n; i++) {
    const a = rr(0, TAU), v = rr(40, 240);
    pt(x, y, cos(a) * v, sin(a) * v - 80, rr(2, 7) * (FS / 15), rr(.4, 1), c || RC(flr(rnd() * NR), 8), -1, rr(0, TAU));
  }
};

// Dust kicked up when a stack is dropped or cut.
const puff = (x, y, n) => {
  for (let i = 0; i < n; i++) {
    const a = rr(0, TAU);
    pt(x + rr(-RS, RS), y, cos(a) * rr(30, 130), sin(a) * rr(30, 130) - 60, rr(3, 9) * (FS / 15), rr(.4, .9), hsl(275, 20, rr(55, 80), .8), -1, rr(0, TAU));
  }
};

// A ring flung off the horn, still drawn as a ring.
const ringPT = (c, x, y, sc, up) => {
  const a = rr(-2.45, -.7);
  pt(x, y, cos(a) * rr(120, 330), sin(a) * rr(230, 520) * up, rsz(c) * sc, rr(.85, 1.5), 0, c, rr(-.4, .4));
};
const flt = (x, y, s, c) => FLT.push({ x: x, y: y, s: s, c: c, l: 0 });

const upView = dt => {
  for (let i = PT.length; i--;) {
    const p = PT[i]; p.l += dt;
    if (p.l > p.m) { PT.splice(i, 1); continue }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 620 * dt; p.vx *= .99; p.rt += dt * 6;
  }
  for (let i = FLT.length; i--;) {
    const f = FLT[i]; f.l += dt; f.y -= dt * FS * 2.4;
    if (f.l > 1.2) FLT.splice(i, 1);
  }
};

const CLL = [[.05, 4, .05], [.08, 9, .08], [.115, 15, .11]];
// Heights of the cloud terraces behind the player, in unicorn-heights above the
// hoof line. They match aUy(): .34 + i * .075 for apprentices 0, 2, 4 and 5.
const TER = [.34, .47, .6, .73];

// Scalloped cloud edge filling everything below it.
// sd seeds the bumps, so no two banks share a silhouette.
// The bump COUNT follows the radius: a distant bank has smaller puffs and needs
// more of them, or the arcs stop overlapping and the edge breaks open. Radii and
// positions are jittered, but bounded so the worst-case spacing still overlaps.
// dip is how far the valleys between bumps fall below the nominal line - keep it
// near zero on the terraces, or an apprentice standing in a valley has nothing
// under its hooves.
// fl flattens the bumps into ellipses. Width has to stay large so neighbours
// overlap, but on the terraces a circular bump would then be tall enough to swallow
// the 13px gap between layers and merge them into one mass, so those are flattened.
const bank = (r0, dy, col, sd, dip, fl) => {
  const y = UY + dy, n = max(6, flr(W / r0) + 2), sp = (W + r0 * 2) / n;
  X.beginPath(); X.moveTo(-4, H + 4); X.lineTo(-4, y);
  for (let i = 0; i <= n; i++) {
    const br = r0 * (.75 + hash(i * 9 + sd) * .8), ry = br * fl;
    X.ellipse(-r0 + i * sp + (hash(i * 5 + sd + 7) - .5) * r0 * .4, y + ry * dip, br, ry, 0, PI, 0);
  }
  X.lineTo(W + 4, H + 4); X.closePath();
  X.fillStyle = col; X.fill();
};

// The rainbow bridge is the run's goal: one arc per ring colour, sweeping out
// of the left horizon as unicorns are sold, closed on the right when it is done.
const brW = () => min(W, H) * .017;
// Radius is capped by the height above the top bar, so the apex of the arc
// stays on screen: the finale rides along it and has to be visible.
const brB = () => min(W * .48, (UY - TOP) * .8);
const brR = () => brB() + (NR - 1) * brW();
const brP = () => min(G.sold / BRG, 1);
const bridge = () => {
  const p = brP(), bw = brW(), b0 = brB();
  if (p <= 0) return;
  X.lineCap = 'butt';
  for (let i = 0; i < NR; i++) {
    strk(RC(i, 8, p < 1 ? .4 : .62), bw);
    X.arc(W / 2, UY, b0 + (NR - 1 - i) * bw, PI, PI + p * PI); X.stroke();
  }
};

// Ending backdrop, after the Solitaire win cascade: little rainbows are launched
// across the sky, fall under gravity and bounce off the cloud line. Every frame
// stamps them into a canvas that is never cleared, so they smear the whole screen
// with arcs instead of moving over it.
let TC = 0, TX = 0, BOU = [], RID = 0;
const bounce = dt => {
  if (!TC || TC.width != (W * DPR | 0)) {
    TC = document.createElement('canvas');
    TC.width = W * DPR | 0; TC.height = H * DPR | 0;
    TX = TC.getContext('2d'); TX.setTransform(DPR, 0, 0, DPR, 0, 0);
    BOU = [];
  }
  if (endT < dt * 3) { TX.clearRect(0, 0, W, H); BOU = [] }
  if (BOU.length < 4 && rnd() < dt * 3) {
    const d = rnd() < .5 ? 1 : -1;
    BOU.push({ x: d > 0 ? FX - FS : W + FS, y: FY + rr(0, FH * .35),
      vx: d * rr(FW * .13, FW * .3), vy: rr(0, 160), r: rr(FS * 1.8, FS * 4.4) });
  }
  TX.lineCap = 'butt';
  for (let i = BOU.length; i--;) {
    const b = BOU[i];
    b.vy += 1250 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y > UY) { b.y = UY; b.vy *= -.74 }
    for (let k = 0; k < NR; k++) {
      TX.strokeStyle = RC(k, 6, .3); TX.lineWidth = b.r * .1;
      TX.beginPath(); TX.arc(b.x, b.y, b.r - k * b.r * .1, PI, TAU); TX.stroke();
    }
    if (b.x < FX - FS * 6 || b.x > W + FS * 6) BOU.splice(i, 1);
  }
};

const drawBg = () => {
  // The sky lifts from deep night to dawn as the bridge closes, so progress is
  // felt without reading a number.
  const sk = brP(), sky = X.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, hsl(262 - sk * 42, 63, 11 + sk * 25));
  sky.addColorStop(.45, hsl(266 - sk * 18, 55, 22 + sk * 26));
  sky.addColorStop(1, hsl(287 + sk * 36, 42 + sk * 14, 30 + sk * 30));
  X.fillStyle = sky; X.fillRect(0, 0, W, H);

  const mr = min(W, H) * .07, mx = W * .84, my = H * .15;
  const mg = X.createRadialGradient(mx, my, mr * .7, mx, my, mr * 3.4);
  mg.addColorStop(0, '#ffe9b830'); mg.addColorStop(1, '#ffe9b800');
  X.fillStyle = mg; dot(mx, my, mr * 3.4);
  X.fillStyle = '#fdf0c8'; dot(mx, my, mr);
  X.fillStyle = '#ebdcae';
  dot(mx - mr * .3, my - mr * .25, mr * .2); dot(mx + mr * .34, my + mr * .12, mr * .13);

  for (let i = 0; i < 40; i++) {
    X.globalAlpha = (.25 + .65 * abs(sin(TIME * (.5 + hash(i) * 1.5) + i))) * .75 * (1 - sk * .85);
    star(hash(i * 3 + 1) * W, hash(i * 5 + 2) * H * .6, (1 + hash(i * 7) * 2) * (FS / 14), TIME * .25 + i, '#fff8d8');
  }
  X.globalAlpha = 1;

  for (let L = 0; L < 3; L++) {
    const cf = CLL[L];
    X.fillStyle = hsl(282, 65, 84, cf[2]);
    for (let i = 0; i < 5; i++) {
      const r = min(W, H) * cf[0] * (.7 + hash(i * 7 + L * 3) * .6), pe = W + r * 4;
      cloud(((hash(i * 5 + L) * pe + TIME * cf[1]) % pe) - r * 2, H * (.06 + hash(i * 11 + L * 2) * .55), r);
    }
  }

  bridge();

  // Apprentices stand higher the further back they are, so without something
  // under them they hang in open sky. One terrace per apprentice hoof line,
  // drawn far to near: each unicorn ends up above its own terrace's edge and in
  // front of it, and never overlaps a nearer one, which sits lower down.
  const r0 = W / 11;
  for (let i = TER.length; i--;)
    bank(r0 * (.62 - i * .12), -US * TER[i], hsl(274 + i * 4, 50 - i * 5, 62 - i * 7), 17 + i * 53, .1, .5);
  bank(r0, 0, '#b291e6', 3, .7, 1);
  bank(r0 * .95, r0 * .1, grad(0, UY, 0, H, '#7a58b8', '#3a2568'), 61, .7, 1);
  X.fillStyle = hsl(280, 55, 92, .18);
  for (let i = 0; i < 7; i++) {
    cloud(((hash(i * 17 + 5) * (W + 200) + TIME * 6) % (W + 200)) - 100,
      UY - r0 * (.55 + hash(i * 9) * .5), r0 * (.16 + hash(i * 3) * .13));
  }
};

// Rings threaded on a horn. ty is the tip they slide down from, ln the lean:
// the whole tower rotates with the body and each ring lags a little more than the one below.
// gt/rn are the gait phase and run amount: the tower rides the same body bob as
// the unicorn, each ring lagging a little more than the one below it so the stack
// whips instead of moving as one rigid piece.
const drawStack = (st, x, by, sc, ru, ln, ty, gt, rn) => {
  const l = ln || 0, cd = gt || 0, rr0 = rn || 0;
  rotAt(x, by, l * LNA);
  for (let i = 0; i < st.length; i++) {
    const r = st[i], bo = abs(sin(cd - i * .22)) * US * .09 * sc * rr0;
    const y = lerp(ty, by - SOFF[i] * sc, r.p * r.p) - bo;
    ring(x - l * RS * .55 * sc * pow((i + 1) / NR, 1.8), y, rsz(r.c) * sc, r.c, ru == i ? 1 : 0, sin(TIME * 2 + i) * .02 - l * .1);
  }
  X.restore();
};

const flyPos = (fx, dir, by, sc, u) => {
  const e = u * u * .8 + u * .2;
  return [fx + dir * FW * .3 * u, by - (by - (FY - US * 2.4 * sc)) * e];
};

// Sale flyaway: a rainbow trail arcing off-screen with the sold unicorn riding it.
const drawFly = (fx, dir, by, sc, ft, st, al) => {
  const u = min(ft / (FLYT * FLY_UP), 1), bw = US * .085 * sc;
  X.globalAlpha = al * .82 * (1 - clamp((ft - FLYT * FLY_UP) / (FLYT * (1 - FLY_UP)), 0, 1));
  X.lineCap = 'round'; X.lineJoin = 'round';
  for (let k = 0; k < NR; k++) {
    strk(RC(k, 4), bw);
    for (let i = 0; i <= 16; i++) {
      const q = flyPos(fx, dir, by, sc, u * i / 16);
      i ? X.lineTo(q[0] + (k - 3) * bw, q[1]) : X.moveTo(q[0] + (k - 3) * bw, q[1]);
    }
    X.stroke();
  }
  X.globalAlpha = al;
  if (u < 1) {
    const q = flyPos(fx, dir, by, sc, u);
    rotAt(q[0], q[1], dir * .35 * u);
    uni(q[0], q[1], US * sc, TIME, 1, 1, dir * .5, ugait);
    drawStack(st, q[0], q[1], sc, -1, dir * .5, tipY(q[1], sc), ugait, 1);
    X.restore();
  }
};

// Where to draw a unicorn that is mid-sale: the replacement runs in from the
// far side once the seller is clear. Returns [x, leanWhileEntering, visible].
const pose = (ft, dir, bx, sc) => {
  if (!ft) return [bx, 0, 1];
  // In the ending nobody comes back: e stays 0, so the body is never drawn again.
  const e = scr == 2 ? 0 : clamp((ft - FLYT * FLY_IN) / (FLYT * (1 - FLY_IN)), 0, 1);
  return [lerp(dir > 0 ? FX - US * sc : FX + FW + US * sc, bx, ease(e)), (dir > 0 ? 1 : -1) * (1 - e), e > 0];
};

const drawGlint = () => {
  const p = .55 + .45 * sin(TIME * 14), gy = max(FY, TY - FH * .3);
  X.fillStyle = grad(0, TY, 0, gy, hsl(50, 100, 80, .22 * p), '#fff3b000');
  X.fillRect(HX - RS * .16, gy, RS * .32, TY - gy);
  star(HX, TY, RS * (.34 + .12 * p), TIME * 2, '#fffbe0');
  star(HX, TY, RS * (.72 + .22 * p), -TIME * 1.3, hsl(50, 100, 78, .4 * p));
};

// One unicorn and its tower of rings. The player and every apprentice go through
// here, so the flyaway, the run-in and the gait stay identical for all of them.
// Returns whether the body was actually drawn: mid-sale it is still off-screen.
//
// The argument list is long because that is what sharing this path costs: the
// player keeps its state in globals and an apprentice keeps the same state in an
// object, so the only thing both can hand over is loose values. Reading order is
// where (x, uy, sc), what (st, ty), how it is moving (ln0, gt, rn), how it looks
// (ru = ruined ring index, glow, al, t) and finally the flyaway, which is the
// four fields aLaunch writes: clock, launch x, direction, the stack that rides out.
const drawUnit = (x, uy, sc, st, ty, ln0, gt, rn, ru, glow, al, t, ft, fx, fd, fs) => {
  X.globalAlpha = al;
  if (ft && ft < FLYT) drawFly(fx, fd, uy, sc, ft, fs, al);
  const q = pose(ft, fd, x, sc);
  if (q[2]) {
    const ln = ft ? q[1] : ln0, r = ft ? 1 : rn;
    uni(q[0], uy, US * sc, t, glow, r, ln, gt);
    drawStack(st, q[0], uy, sc, ru, ln, ty, gt, r);
  }
  X.globalAlpha = 1;
  return q[2];
};

const drawWorld = () => {
  X.save();
  if (shake > 0) X.translate(rr(-1, 1) * shake * FS * .55, rr(-1, 1) * shake * FS * .35);
  drawBg();
  if (scr == 2 && TC) X.drawImage(TC, 0, 0, W, H);
  drop.forEach(r => ring(r.x, r.y, rsz(r.c), r.c, 0, sin(r.w) * .09));

  for (let i = APP.length; i--;) {
    const a = APP[i];
    drawUnit(a.x, aUy(i), aSc(i), a.st, aTy(i), a.ln + sin(a.g) * .3 * a.rn, a.g, a.rn,
      -1, 0, .88 - i * .07, TIME + 1.7 + i * .9, a.fl, a.fx, a.fd, a.fs);
  }

  const shk = scrapT > 0 ? sin(scrapT * 54) * (scrapT / .55) * 1.9 : 0;
  if (drawUnit(HX, UY, 1, stack, TY, ulean + sin(ugait) * .3 * urun + shk, ugait, urun,
    bad, done, 1, TIME, fly, flyX, flyDir, flyStack) && aimOn) drawGlint();

  // A procession of seven riders coasts down the finished bridge: [start, duration,
  // size] each, with a random gap after the one before, so no two are abreast for
  // long. endT only starts once the exodus is over, so the first sets off to an
  // empty sky. Each one fades out at the far foot - the old single rider clamped its
  // progress at 1 and so sat parked there for the rest of the ending.
  if (scr == 2 && bye >= exo()) {
    if (!RID) { RID = []; for (let i = 0, d = 0; i < 7; i++, d += rr(.25, .8)) RID.push([d, rr(2.2, 4.4), rr(.22, .55)]) }
    // Size the riders off the bridge, not off US: on a tall phone the arc is less
    // than half its desktop radius, and full-size riders piled up at the apex.
    const rb = brR(), rs = min(US, rb * .27);
    RID.forEach((r, i) => {
      const u = (endT - r[0]) / r[1];
      if (u <= 0 || u >= 1) return;
      const aa = PI + u * PI, ex = W / 2 + cos(aa) * rb, ey = UY + sin(aa) * rb;
      X.globalAlpha = min(u * 7, (1 - u) * 7, 1);
      rotAt(ex, ey, aa - PI * 1.5);
      uni(ex, ey, rs * r[2], TIME + i, 0, 1, 0, ugait + i);
      X.restore();
      X.globalAlpha = 1;
      if (rnd() < .35) burst(ex, ey, 1);
    });
  }

  PT.forEach(p => {
    const a = 1 - p.l / p.m; X.globalAlpha = a;
    if (p.hu >= 0) ring(p.x, p.y, p.r, p.hu, 0, p.rt); else star(p.x, p.y, p.r * a, p.rt, p.c);
  });
  X.globalAlpha = 1;
  X.restore();

  if (badF > 0) {
    const g = X.createRadialGradient(W / 2, H / 2, min(W, H) * .28, W / 2, H / 2, max(W, H) * .62);
    g.addColorStop(0, '#ff003c00'); g.addColorStop(1, hsl(345, 100, 48, badF * .42));
    X.fillStyle = g; X.fillRect(0, 0, W, H);
  }
};
