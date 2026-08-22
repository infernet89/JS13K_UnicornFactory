let FS = 14, RFW = 60, TOP = 40, BOT = 60;
let FX = 0, FY = 0, FW = 0, FH = 0;
let HX = 0, UY = 0, US = 60, RS = 12, TY = 0, BASEY = 0, MG = 20;
const SYS = [];
let DBX = 0, SBX = 0, BBY = 0, BBW = 0, BBH = 0;
const PT = [], FLT = [];

const layout = () => {
  FS = clamp(min(W, H) / 30, 11, 22);
  RFW = clamp(min(W, H) * .13, 42, 92);
  TOP = FS * 2.7; BOT = FS * 3.9;
  FX = RFW; FY = TOP; FW = W - RFW; FH = H - TOP - BOT;
  US = clamp(min(FH * .25, FW * .3), 38, 180);
  RS = US * .17;
  UY = FY + FH; BASEY = UY - US * 1.05; TY = UY - US * 1.69;
  SYS[0] = BASEY - RS * .3;
  for (let i = 1; i < NR; i++) SYS[i] = SYS[i - 1] - (rsz(i - 1) + rsz(i)) * .27;
  MG = min(max(RS * 1.3, US * .44), FW * .3);
  HX = clamp(HX || FX + FW / 2, FX + MG, FX + FW - MG);
  const p = FS * .5;
  BBW = (W - p * 3) / 2; BBH = BOT - p * 1.3; BBY = H - BOT + p * .65;
  DBX = p; SBX = p * 2 + BBW;
};

const rsz = i => RS * (1 - i * .075);
const slotY = i => SYS[i];

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
    const rx = r0 * (1 - i * .075);
    X.globalAlpha = has ? .32 : nx ? 1 : .5;
    ring(cx, y, rx, i, 0);
    X.globalAlpha = 1;
    if (nx) {
      X.strokeStyle = 'hsl(50 100% 75%/' + (.4 + .45 * abs(sin(TIME * 3))) + ')';
      X.lineWidth = max(1.5, rx * .12);
      X.beginPath(); X.ellipse(cx, y, rx * 1.34, rx * .64, 0, 0, TAU); X.stroke();
    }
    if (has) {
      X.strokeStyle = bad == i ? '#ff4d6d' : '#7ce38b'; X.lineWidth = max(1.6, rx * .14);
      X.lineCap = 'round'; X.beginPath();
      if (bad == i) {
        X.moveTo(cx - rx * .3, y - rx * .3); X.lineTo(cx + rx * .3, y + rx * .3);
        X.moveTo(cx + rx * .3, y - rx * .3); X.lineTo(cx - rx * .3, y + rx * .3);
      } else {
        X.moveTo(cx - rx * .32, y); X.lineTo(cx - rx * .08, y + rx * .26); X.lineTo(cx + rx * .34, y - rx * .28);
      }
      X.stroke();
    }
  }
  txt('ORDER', cx, TOP / 2, FS * .68, '#8f79c4', 'center', 'bold');
};

const drawStack = (st, x, dy, ru, ln) => {
  const l = ln || 0;
  X.save(); X.translate(x, UY + dy); X.rotate(l * LNA); X.translate(-x, -(UY + dy));
  for (let i = 0; i < st.length; i++) {
    const r = st[i], y = lerp(TY, slotY(i), r.p * r.p) + dy;
    const lag = l * RS * .55 * pow((i + 1) / NR, 1.8);
    ring(x - lag, y, rsz(r.c), r.c, ru == i ? 1 : 0, sin(TIME * 2 + i) * .02 - l * .1);
  }
  X.restore();
};

const flyPos = u => {
  const e = u * u * .8 + u * .2;
  return [flyX + flyDir * FW * .3 * u, UY - (UY - (FY - US * 2.4)) * e];
};

const drawFly = () => {
  const u = min(fly / (FLYT * .62), 1), bw = US * .085;
  X.globalAlpha = .82 * (1 - clamp((fly - FLYT * .62) / (FLYT * .38), 0, 1));
  X.lineCap = 'round'; X.lineJoin = 'round';
  for (let k = 0; k < NR; k++) {
    X.strokeStyle = RC(k, 4); X.lineWidth = bw;
    X.beginPath();
    for (let i = 0; i <= 16; i++) {
      const q = flyPos(u * i / 16);
      i ? X.lineTo(q[0] + (k - 3) * bw, q[1]) : X.moveTo(q[0] + (k - 3) * bw, q[1]);
    }
    X.stroke();
  }
  X.globalAlpha = 1;
  if (u < 1) {
    const q = flyPos(u);
    X.save(); X.translate(q[0], q[1]); X.rotate(flyDir * .35 * u); X.translate(-q[0], -q[1]);
    uni(q[0], q[1], US, TIME, 1, 1, flyDir * .5);
    drawStack(flyStack, q[0], q[1] - UY, -1, flyDir * .5);
    X.restore();
  }
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
  txt(lab, x + BBW / 2, BBY + BBH * .37, FS * 1.05, on ? '#fff' : '#5c4a82', 'center', 'bold');
  txt(sub, x + BBW / 2, BBY + BBH * .73, FS * .66, on ? '#ffffffc4' : '#493a6b', 'center');
};

const drawUI = () => {
  X.fillStyle = '#150d26'; X.fillRect(FX, 0, W - FX, TOP);
  X.fillStyle = '#150d26'; X.fillRect(0, H - BOT, W, BOT);
  txt('$' + G.m, FX + FS * .8, TOP / 2, FS * 1.5, '#7ce38b', 'left', 'bold');
  const mw = X.measureText('$' + G.m).width;
  txt('SOLD ' + G.sold, FX + FS * 1.8 + mw, TOP / 2 + FS * .12, FS * .76, '#9b86c9', 'left');
  spk(W - FS * 1.4, TOP / 2, FS * .5, !G.mu);
  txt(VER, W - FS * 2.5, TOP / 2 + FS * .06, FS * .72, '#9683c4', 'right');
  btn(DBX, 'SCRAP', stack.length ? 'start a new unicorn' : 'nothing to scrap', stack.length > 0, bad >= 0, '#8a5fd6', '#5b3fa8');
  btn(SBX, 'SELL  $1', done ? 'rainbow complete!' : 'finish the rainbow', done, 0, '#39c47c', '#1f9e8e');
  FLT.forEach(f => { X.globalAlpha = 1 - f.l / 1.2; txt(f.s, f.x, f.y, FS * 1.3, f.c, 'center', 'bold') });
  X.globalAlpha = 1;
};

const draw = () => {
  X.save();
  if (shake > 0) X.translate(rr(-1, 1) * shake * FS * .55, rr(-1, 1) * shake * FS * .35);
  drawBg();
  drop.forEach(r => ring(r.x, r.y, rsz(r.c), r.c, 0, sin(r.w) * .09));
  if (fly) drawFly();
  const ent = fly ? clamp((fly - FLYT * .44) / (FLYT * .56), 0, 1) : 1;
  if (ent > 0) {
    const ex = fly ? lerp(flyDir > 0 ? FX - US * .9 : FX + FW + US * .9, HX, ent * ent * (3 - 2 * ent)) : HX;
    const ln = fly ? (flyDir > 0 ? 1 : -1) * (1 - ent) : ulean + (scrapT > 0 ? sin(scrapT * 54) * (scrapT / .55) * 1.9 : 0);
    uni(ex, UY, US, TIME, done, fly ? 1 : urun, ln);
    drawStack(stack, ex, 0, bad, ln);
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
};
