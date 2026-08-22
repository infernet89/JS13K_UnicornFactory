let FS = 14, RFW = 60, TOP = 40, BOT = 60;
let FX = 0, FY = 0, FW = 0, FH = 0;
let HX = 0, UY = 0, US = 60, RS = 12, TY = 0, MG = 20;
let BBY = 0, BBW = 0, BBH = 0, SHX = 0, SHW = 0, DGX = 0, DGW = 0, RSX = 0, RSW = 0;
let SPX = 0, SPY = 0, SPW = 0, SPH = 0, SRH = 0, SHH = 0, sscr = 0, smax = 0;
const SOFF = [], BBX = [], PT = [], FLT = [];

const rsz = i => RS * (1 - i * .075);

const layout = () => {
  FS = clamp(min(W, H) / 30, 11, 22);
  RFW = clamp(min(W, H) * .13, 42, 92);
  TOP = FS * 2.7; BOT = FS * 3.9;
  FX = RFW; FY = TOP; FW = W - RFW; FH = H - TOP - BOT;
  US = clamp(min(FH * .25, FW * .3), 38, 180);
  RS = US * .17;
  UY = FY + FH; TY = UY - US * 1.69;
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

const slotY = i => UY - SOFF[i];
const aSc = i => .6 - i * .05;
const aUy = i => UY - US * (.34 + i * .09);
const aTy = i => aUy(i) - US * 1.69 * aSc(i);

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
  const g = X.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#150a2b'); g.addColorStop(.45, '#311a58'); g.addColorStop(1, '#5b2c6e');
  X.fillStyle = g; X.fillRect(0, 0, W, H);

  const mr = min(W, H) * .07, mx = W * .84, my = H * .15;
  const mg = X.createRadialGradient(mx, my, mr * .7, mx, my, mr * 3.4);
  mg.addColorStop(0, '#ffe9b830'); mg.addColorStop(1, '#ffe9b800');
  X.fillStyle = mg; dot(mx, my, mr * 3.4);
  X.fillStyle = '#fdf0c8'; dot(mx, my, mr);
  X.fillStyle = '#ebdcae';
  dot(mx - mr * .3, my - mr * .25, mr * .2); dot(mx + mr * .34, my + mr * .12, mr * .13);

  for (let i = 0; i < 40; i++) {
    const sx = hash(i * 3 + 1) * W, sy = hash(i * 5 + 2) * H * .6;
    X.globalAlpha = (.25 + .65 * abs(sin(TIME * (.5 + hash(i) * 1.5) + i))) * .75;
    star(sx, sy, (1 + hash(i * 7) * 2) * (FS / 14), TIME * .25 + i, '#fff8d8');
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
    const cx = ((hash(i * 17 + 5) * (W + 200) + TIME * 6) % (W + 200)) - 100;
    cloud(cx, UY - r0 * (.55 + hash(i * 9) * .5), r0 * (.16 + hash(i * 3) * .13));
  }
};

const drawRef = () => {
  X.fillStyle = '#1a1030'; X.fillRect(0, 0, RFW, H - BOT);
  X.fillStyle = '#33224f'; X.fillRect(RFW - 2, 0, 2, H - BOT);
  const ch = FH / NR, r0 = min(RFW * .33, ch * .38), cx = RFW / 2;
  for (let i = 0; i < NR; i++) {
    const y = FY + FH - (i + .5) * ch, has = i < stack.length, nx = i == stack.length && bad < 0;
    X.globalAlpha = has ? .32 : nx ? 1 : .5;
    ring(cx, y, r0 * (1 - i * .075), i, 0);
    X.globalAlpha = 1;
    if (nx) {
      X.strokeStyle = 'hsl(50 100% 75%/' + (.4 + .45 * abs(sin(TIME * 3))) + ')';
      X.lineWidth = max(1.5, r0 * .12);
      X.beginPath(); X.ellipse(cx, y, r0 * 1.34, r0 * .64, 0, 0, TAU); X.stroke();
    }
    if (has) {
      X.strokeStyle = bad == i ? '#ff4d6d' : '#7ce38b'; X.lineWidth = max(1.6, r0 * .14);
      X.lineCap = 'round'; X.beginPath();
      if (bad == i) {
        X.moveTo(cx - r0 * .3, y - r0 * .3); X.lineTo(cx + r0 * .3, y + r0 * .3);
        X.moveTo(cx + r0 * .3, y - r0 * .3); X.lineTo(cx - r0 * .3, y + r0 * .3);
      } else {
        X.moveTo(cx - r0 * .32, y); X.lineTo(cx - r0 * .08, y + r0 * .26); X.lineTo(cx + r0 * .34, y - r0 * .28);
      }
      X.stroke();
    }
  }
  txt('ORDER', cx, TOP / 2, FS * .68, '#8f79c4', 'center', 'bold');
};

const drawStack = (st, x, by, sc, ru, ln, ty) => {
  const l = ln || 0;
  X.save(); X.translate(x, by); X.rotate(l * LNA); X.translate(-x, -by);
  for (let i = 0; i < st.length; i++) {
    const r = st[i], y = lerp(ty, by - SOFF[i] * sc, r.p * r.p);
    ring(x - l * RS * .55 * sc * pow((i + 1) / NR, 1.8), y, rsz(r.c) * sc, r.c, ru == i ? 1 : 0, sin(TIME * 2 + i) * .02 - l * .1);
  }
  X.restore();
};

const flyPos = (fx, dir, by, sc, u) => {
  const e = u * u * .8 + u * .2;
  return [fx + dir * FW * .3 * u, by - (by - (FY - US * 2.4 * sc)) * e];
};

const drawFly = (fx, dir, by, sc, ft, st, al) => {
  const u = min(ft / (FLYT * .62), 1), bw = US * .085 * sc;
  X.globalAlpha = al * .82 * (1 - clamp((ft - FLYT * .62) / (FLYT * .38), 0, 1));
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
    drawStack(st, q[0], q[1], sc, -1, dir * .5, q[1] - US * 1.69 * sc);
    X.restore();
  }
};

const drawGlint = () => {
  const p = .55 + .45 * sin(TIME * 14), gy = max(FY, TY - FH * .3);
  const g = X.createLinearGradient(0, TY, 0, gy);
  g.addColorStop(0, 'hsl(50 100% 80%/' + (.22 * p) + ')'); g.addColorStop(1, '#fff3b000');
  X.fillStyle = g; X.fillRect(HX - RS * .16, gy, RS * .32, TY - gy);
  star(HX, TY, RS * (.34 + .12 * p), TIME * 2, '#fffbe0');
  star(HX, TY, RS * (.72 + .22 * p), -TIME * 1.3, 'hsl(50 100% 78%/' + (.4 * p) + ')');
};

const spk = (x, y, r, on) => {
  X.fillStyle = on ? '#b79ee0' : '#5c4a80';
  X.beginPath();
  X.moveTo(x - r, y - r * .4); X.lineTo(x - r * .35, y - r * .4); X.lineTo(x + r * .3, y - r);
  X.lineTo(x + r * .3, y + r); X.lineTo(x - r * .35, y + r * .4); X.lineTo(x - r, y + r * .4);
  X.closePath(); X.fill();
  X.strokeStyle = on ? '#b79ee0' : '#5c4a80'; X.lineWidth = max(1, r * .2);
  X.beginPath();
  if (on) X.arc(x + r * .45, y, r * .5, -.9, .9);
  else { X.moveTo(x + r * .6, y - r * .5); X.lineTo(x + r * 1.2, y + r * .5); X.moveTo(x + r * 1.2, y - r * .5); X.lineTo(x + r * .6, y + r * .5) }
  X.stroke();
};

const btn = (x, lab, sub, on, hot, c1, c2) => {
  X.fillStyle = on ? (hot ? 'hsl(348 82% ' + (52 + 9 * sin(TIME * 8)) + '%)' : grad(x, BBY, x + BBW, BBY + BBH, c1, c2)) : '#241a3c';
  box(x, BBY, BBW, BBH, 9); X.fill();
  if (on) { X.strokeStyle = '#ffffff40'; X.lineWidth = 1; X.stroke() }
  txt(lab, x + BBW / 2, BBY + BBH * .37, FS * (BBW < FS * 9 ? .9 : 1.05), on ? '#fff' : '#5c4a82', 'center', 'bold');
  txt(sub, x + BBW / 2, BBY + BBH * .73, FS * .62, on ? '#ffffffc4' : '#493a6b', 'center');
};

const canBuy = () => { for (let i = 0; i < UP.length; i++) if (!upMax(i) && G.m >= upCost(i)) return 1; return 0 };

const drawUI = () => {
  X.fillStyle = '#150d26'; X.fillRect(FX, 0, W - FX, TOP);
  X.fillStyle = '#150d26'; X.fillRect(0, H - BOT, W, BOT);
  txt('$' + G.m, FX + FS * .8, TOP / 2, FS * (W < FS * 32 ? 1.25 : 1.5), '#7ce38b', 'left', 'bold');
  let hx = FX + FS * 1.5 + X.measureText('$' + G.m).width;
  if (G.u[U_STK] && G.st > 0) {
    txt('x' + G.st, hx, TOP / 2 + FS * .1, FS * .86, '#ffcf5c', 'left', 'bold');
    hx += X.measureText('x' + G.st).width + FS * .8;
  }
  if (W > FS * 32) txt('SOLD ' + G.sold, hx, TOP / 2 + FS * .12, FS * .76, '#9b86c9', 'left');

  const cb = canBuy();
  X.fillStyle = cb ? 'hsl(268 62% ' + (52 + 7 * sin(TIME * 5)) + '%)' : '#2b1c48';
  box(SHX, TOP * .18, SHW, TOP * .64, 6); X.fill();
  X.strokeStyle = cb ? '#d8bcff' : '#5a4488'; X.lineWidth = 1; X.stroke();
  txt('SHOP', SHX + SHW / 2, TOP / 2, FS * .82, cb ? '#fff' : '#a08ecb', 'center', 'bold');

  X.setLineDash([3, 2]); X.lineWidth = 1;
  X.fillStyle = '#3a2a14'; box(DGX, TOP * .18, DGW, TOP * .64, 6); X.fill();
  X.strokeStyle = '#c8912f'; X.stroke();
  txt('+$' + DBG, DGX + DGW / 2, TOP / 2, FS * .68, '#e8b64d', 'center', 'bold');
  X.fillStyle = rstArm > 0 ? '#8e1b33' : '#3a1620'; box(RSX, TOP * .18, RSW, TOP * .64, 6); X.fill();
  X.strokeStyle = '#d4577a'; X.stroke(); X.setLineDash([]);
  txt(rstArm > 0 ? 'SURE?' : 'RST', RSX + RSW / 2, TOP / 2, FS * .64, rstArm > 0 ? '#fff' : '#e0788f', 'center', 'bold');

  txt(VER, W - FS * 2.6, TOP / 2 + FS * .06, FS * .72, '#9683c4', 'right');
  spk(W - FS * 1.4, TOP / 2, FS * .5, !G.mu);

  const n = BBX.length;
  if (n > 2) btn(BBX[0], 'CUT', 'drop last ring', stack.length > 0, bad >= 0, '#e0913a', '#b0621f');
  btn(BBX[n - 2], 'SCRAP', stack.length ? 'start over' : 'nothing to scrap', stack.length > 0, bad >= 0 && n < 3, '#8a5fd6', '#5b3fa8');
  btn(BBX[n - 1], 'SELL  $' + PAY, done ? 'rainbow complete!' : 'finish the rainbow', done, 0, '#39c47c', '#1f9e8e');

  FLT.forEach(f => { X.globalAlpha = 1 - f.l / 1.2; txt(f.s, f.x, f.y, FS * 1.3, f.c, 'center', 'bold') });
  X.globalAlpha = 1;
};

const drawShop = () => {
  X.fillStyle = '#0b0618cc'; X.fillRect(0, 0, W, H);
  X.fillStyle = '#1d1234'; box(SPX, SPY, SPW, SPH, 14); X.fill();
  X.strokeStyle = '#4b3577'; X.lineWidth = 2; X.stroke();

  const top = SPY + SHH, vh = SPH - SHH - FS * .6, pad = FS * .55;
  sscr = clamp(sscr, 0, smax);
  X.save(); X.beginPath(); X.rect(SPX, top, SPW, vh); X.clip();
  for (let i = 0; i < UP.length; i++) {
    const y = top + i * SRH - sscr;
    if (y > top + vh || y + SRH < top) continue;
    const mx = upMax(i), c = upCost(i), ok = !mx && G.m >= c;
    X.fillStyle = mx ? '#231a3a' : ok ? '#2c1c4e' : '#1e1533';
    box(SPX + pad, y + pad * .4, SPW - pad * 2, SRH - pad * .8, 8); X.fill();
    if (ok) { X.strokeStyle = '#7ce38b88'; X.lineWidth = 1; X.stroke() }
    const tx = SPX + pad * 2, cy = y + SRH / 2;
    txt(UP[i][0], tx, cy - FS * .72, FS * .96, mx ? '#9d8bc6' : '#fff', 'left', 'bold');
    txt(upDesc(i), tx, cy + FS * .35, FS * .68, '#a794cf', 'left');
    const rx = SPX + SPW - pad * 2;
    txt(mx ? 'MAX' : '$' + c, rx, cy - FS * .68, FS * 1.02, mx ? '#7ce38b' : ok ? '#7ce38b' : '#6d5c93', 'right', 'bold');
    const pw = FS * .5;
    for (let k = 0; k < UP[i][4]; k++) {
      X.fillStyle = k < G.u[i] ? '#ffcf5c' : '#4a3a70';
      dot(rx - k * pw * 1.5, cy + FS * .5, pw * .34);
    }
  }
  X.restore();

  X.fillStyle = '#1d1234'; box(SPX, SPY, SPW, SHH, 14); X.fill();
  txt('UPGRADES', SPX + FS, SPY + SHH / 2, FS * 1.12, '#ff9fd6', 'left', 'bold');
  txt('$' + G.m, SPX + SPW - FS * 3, SPY + SHH / 2, FS * 1.12, '#7ce38b', 'right', 'bold');
  X.strokeStyle = '#b79ee0'; X.lineWidth = max(2, FS * .16); X.lineCap = 'round';
  const cx = SPX + SPW - FS * 1.4, cy = SPY + SHH / 2, q = FS * .42;
  X.beginPath(); X.moveTo(cx - q, cy - q); X.lineTo(cx + q, cy + q);
  X.moveTo(cx + q, cy - q); X.lineTo(cx - q, cy + q); X.stroke();
  if (smax > 0) {
    X.fillStyle = '#5a4488';
    const bh = (SPH - SHH) * (SPH - SHH) / (UP.length * SRH);
    X.fillRect(SPX + SPW - 5, top + (sscr / smax) * (SPH - SHH - bh - FS), 3, bh);
  }
};

const draw = () => {
  X.save();
  if (shake > 0) X.translate(rr(-1, 1) * shake * FS * .55, rr(-1, 1) * shake * FS * .35);
  drawBg();
  drop.forEach(r => ring(r.x, r.y, rsz(r.c), r.c, 0, sin(r.w) * .09));
  for (let i = APP.length; i--;) {
    const a = APP[i], sc = aSc(i), uy = aUy(i), al = .88 - i * .09;
    if (a.fl) drawFly(a.fx, a.fd, uy, sc, a.fl, a.fs, al);
    const ae = a.fl ? clamp((a.fl - FLYT * .44) / (FLYT * .56), 0, 1) : 1;
    if (ae > 0) {
      const ax = a.fl ? lerp(a.fd > 0 ? FX - US * sc : FX + FW + US * sc, a.x, ae * ae * (3 - 2 * ae)) : a.x;
      const al2 = a.fl ? (a.fd > 0 ? 1 : -1) * (1 - ae) : a.ln;
      X.globalAlpha = al;
      uni(ax, uy, US * sc, TIME + 1.7 + i * .9, 0, a.fl ? 1 : a.rn, al2, a.g);
      drawStack(a.st, ax, uy, sc, -1, al2, aTy(i));
    }
  }
  X.globalAlpha = 1;
  if (fly) drawFly(flyX, flyDir, UY, 1, fly, flyStack, 1);
  const ent = fly ? clamp((fly - FLYT * .44) / (FLYT * .56), 0, 1) : 1;
  if (ent > 0) {
    const ex = fly ? lerp(flyDir > 0 ? FX - US * .9 : FX + FW + US * .9, HX, ent * ent * (3 - 2 * ent)) : HX;
    const ln = fly ? (flyDir > 0 ? 1 : -1) * (1 - ent) : ulean + (scrapT > 0 ? sin(scrapT * 54) * (scrapT / .55) * 1.9 : 0);
    uni(ex, UY, US, TIME, done, fly ? 1 : urun, ln, ugait);
    drawStack(stack, ex, UY, 1, bad, ln, TY);
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
  drawRef();
  drawUI();
  if (shopOn) drawShop();
};
