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
let SPX = 0, SPY = 0, SPW = 0, SPH = 0, SRH = 0, SHH = 0, sscr = 0, smax = 0;
// SOFF[i] = height of stack slot i above the hooves, at scale 1.
const SOFF = [], BBX = [], PT = [], FLT = [];

// Rings shrink as the rainbow climbs, so colour and size both identify a ring.
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

  SPW = min(W * .93, 470); SPH = min(H * .88, 620);
  SPX = (W - SPW) / 2; SPY = (H - SPH) / 2;
  SHH = FS * 3.1; SRH = clamp(FS * 3.9, 56, 94);
  smax = max(0, UP.length * SRH - (SPH - SHH - FS * .6));
};

// hu >= 0 draws the particle as a ring of that colour, otherwise as a star of colour c.
const burst = (x, y, n, c) => {
  for (let i = 0; i < n; i++) {
    const a = rr(0, TAU), v = rr(40, 240);
    PT.push({ x: x, y: y, vx: cos(a) * v, vy: sin(a) * v - 80, l: 0, m: rr(.4, 1), r: rr(2, 7) * (FS / 15), c: c || RC(flr(rnd() * NR), 8), hu: -1, ru: 0, rt: rr(0, TAU) });
  }
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

// Scalloped cloud bank filling everything below the hoof line.
const bank = (r0, dy, col) => {
  X.beginPath(); X.moveTo(-4, H + 4); X.lineTo(-4, UY + dy);
  for (let i = 0; i <= 11; i++) {
    const br = r0 * (.55 + hash(i * 13 + 3) * .55);
    X.arc(i * W / 11, UY + dy + br * .75, br, PI, 0);
  }
  X.lineTo(W + 4, H + 4); X.closePath();
  X.fillStyle = col; X.fill();
};

const drawBg = () => {
  const sky = X.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#150a2b'); sky.addColorStop(.45, '#311a58'); sky.addColorStop(1, '#5b2c6e');
  X.fillStyle = sky; X.fillRect(0, 0, W, H);

  const mr = min(W, H) * .07, mx = W * .84, my = H * .15;
  const mg = X.createRadialGradient(mx, my, mr * .7, mx, my, mr * 3.4);
  mg.addColorStop(0, '#ffe9b830'); mg.addColorStop(1, '#ffe9b800');
  X.fillStyle = mg; dot(mx, my, mr * 3.4);
  X.fillStyle = '#fdf0c8'; dot(mx, my, mr);
  X.fillStyle = '#ebdcae';
  dot(mx - mr * .3, my - mr * .25, mr * .2); dot(mx + mr * .34, my + mr * .12, mr * .13);

  for (let i = 0; i < 40; i++) {
    X.globalAlpha = (.25 + .65 * abs(sin(TIME * (.5 + hash(i) * 1.5) + i))) * .75;
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

  const r0 = W / 11;
  bank(r0, 0, '#b291e6');
  bank(r0 * .95, r0 * .1, grad(0, UY, 0, H, '#7a58b8', '#3a2568'));
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
  X.save(); X.translate(x, by); X.rotate(l * LNA); X.translate(-x, -by);
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
    X.strokeStyle = RC(k, 4); X.lineWidth = bw;
    X.beginPath();
    for (let i = 0; i <= 16; i++) {
      const q = flyPos(fx, dir, by, sc, u * i / 16);
      i ? X.lineTo(q[0] + (k - 3) * bw, q[1]) : X.moveTo(q[0] + (k - 3) * bw, q[1]);
    }
    X.stroke();
  }
  X.globalAlpha = al;
  if (u < 1) {
    const q = flyPos(fx, dir, by, sc, u);
    X.save(); X.translate(q[0], q[1]); X.rotate(dir * .35 * u); X.translate(-q[0], -q[1]);
    uni(q[0], q[1], US * sc, TIME, 1, 1, dir * .5, ugait);
    drawStack(st, q[0], q[1], sc, -1, dir * .5, tipY(q[1], sc), ugait, 1);
    X.restore();
  }
};

// Where to draw a unicorn that is mid-sale: the replacement runs in from the
// far side once the seller is clear. Returns [x, leanWhileEntering, visible].
const pose = (ft, dir, bx, sc) => {
  if (!ft) return [bx, 0, 1];
  const e = clamp((ft - FLYT * FLY_IN) / (FLYT * (1 - FLY_IN)), 0, 1);
  return [lerp(dir > 0 ? FX - US * sc : FX + FW + US * sc, bx, ease(e)), (dir > 0 ? 1 : -1) * (1 - e), e > 0];
};

const drawGlint = () => {
  const p = .55 + .45 * sin(TIME * 14), gy = max(FY, TY - FH * .3);
  X.fillStyle = grad(0, TY, 0, gy, 'hsl(50 100% 80%/' + (.22 * p) + ')', '#fff3b000');
  X.fillRect(HX - RS * .16, gy, RS * .32, TY - gy);
  star(HX, TY, RS * (.34 + .12 * p), TIME * 2, '#fffbe0');
  star(HX, TY, RS * (.72 + .22 * p), -TIME * 1.3, 'hsl(50 100% 78%/' + (.4 * p) + ')');
};

const drawWorld = () => {
  X.save();
  if (shake > 0) X.translate(rr(-1, 1) * shake * FS * .55, rr(-1, 1) * shake * FS * .35);
  drawBg();
  drop.forEach(r => ring(r.x, r.y, rsz(r.c), r.c, 0, sin(r.w) * .09));

  for (let i = APP.length; i--;) {
    const a = APP[i], sc = aSc(i), uy = aUy(i), al = .88 - i * .07;
    if (a.fl) drawFly(a.fx, a.fd, uy, sc, a.fl, a.fs, al);
    const q = pose(a.fl, a.fd, a.x, sc);
    if (q[2]) {
      const ln = a.fl ? q[1] : a.ln + sin(a.g) * .3 * a.rn;
      X.globalAlpha = al;
      uni(q[0], uy, US * sc, TIME + 1.7 + i * .9, 0, a.fl ? 1 : a.rn, ln, a.g);
      drawStack(a.st, q[0], uy, sc, -1, ln, aTy(i), a.g, a.fl ? 1 : a.rn);
    }
  }
  X.globalAlpha = 1;

  if (fly) drawFly(flyX, flyDir, UY, 1, fly, flyStack, 1);
  const q = pose(fly, flyDir, HX, 1);
  if (q[2]) {
    const ln = fly ? q[1] : ulean + sin(ugait) * .3 * urun + (scrapT > 0 ? sin(scrapT * 54) * (scrapT / .55) * 1.9 : 0);
    uni(q[0], UY, US, TIME, done, fly ? 1 : urun, ln, ugait);
    drawStack(stack, q[0], UY, 1, bad, ln, TY, ugait, fly ? 1 : urun);
    if (aimOn) drawGlint();
  }

  PT.forEach(p => {
    const a = 1 - p.l / p.m; X.globalAlpha = a;
    if (p.hu >= 0) ring(p.x, p.y, p.r, p.hu, p.ru, p.rt); else star(p.x, p.y, p.r * a, p.rt, p.c);
  });
  X.globalAlpha = 1;
  X.restore();

  if (badF > 0) {
    const g = X.createRadialGradient(W / 2, H / 2, min(W, H) * .28, W / 2, H / 2, max(W, H) * .62);
    g.addColorStop(0, '#ff003c00'); g.addColorStop(1, 'hsl(345 100% 48%/' + badF * .42 + ')');
    X.fillStyle = g; X.fillRect(0, 0, W, H);
  }
};
