const KEY = 'ufr3';
const G = { m: 0, sold: 0, junk: 0, mu: 0, st: 0, u: UP.map(() => 0) };

let stack = [], bad = -1, done = 0, drop = [], utx = .5;
let spawnT = 0, shake = 0, badF = 0, goodF = 0, urun = 0, ulean = 0;
let scrapT = 0, cutT = 0, autoT = 0, aimOn = 0, shopOn = 0, rstArm = 0, ugait = 0;
let fly = 0, flyX = 0, flyDir = 1, flyStack = [];
const APP = [];
const FLYT = 1.05;

const upCost = i => { const f = UP[i][5]; return f ? f[G.u[i]] : flr(UP[i][2] * pow(UP[i][3], G.u[i])) };
const upMax = i => G.u[i] >= UP[i][4];
const uv = i => { const a = UV[i]; return a ? a[upMax(i) ? G.u[i] : G.u[i] + 1] : 0 };
const upDesc = i => UP[i][1].replace('@', uv(i));
const upBuy = i => {
  if (upMax(i) || G.m < upCost(i)) return 0;
  G.m -= upCost(i); G.u[i]++; syncApp(); layout(); save(); return 1;
};

const speed = () => min(1 + G.sold * .035, 2.4);
const gap = () => max(.42, 1.05 / speed());
const fallV = () => FH / (2.9 / speed());
const need = () => stack.length;
const tol = c => rsz(c) * .95 + RS * .22;
const busy = () => fly || scrapT || cutT;

const spawn = () => {
  const c = bad < 0 && need() < NR && rnd() * 100 < UV[U_CAL][G.u[U_CAL]] ? need() : flr(rnd() * NR);
  drop.push({ x: rr(FX + MG, FX + FW - MG), y: FY - RS * 2, py: FY - RS * 2, v: fallV() * rr(.9, 1.12), c: c, w: rr(0, TAU), tk: 0 });
};

const grab = r => {
  stack.push({ c: r.c, p: 0 });
  if (r.c == need() - 1) {
    goodF = 1; sGood(stack.length);
    if (stack.length >= NR) { done = 1; sDone() }
  } else {
    bad = stack.length - 1; badF = 1; shake = 1; sBad();
    flt(HX, TY + RS * 2, 'WRONG!', '#ff5d7a');
  }
};

const puff = (x, y, n) => {
  for (let i = 0; i < n; i++) {
    const a = rr(0, TAU);
    PT.push({ x: x + rr(-RS, RS), y: y, r: rr(3, 9) * (FS / 15), hu: -1, ru: 0, c: hsl(275, 20, rr(55, 80), .8), l: 0, m: rr(.4, .9), vx: cos(a) * rr(30, 130), vy: sin(a) * rr(30, 130) - 60, rt: rr(0, TAU) });
  }
};

const ringPT = (c, x, y, sc, up) => {
  const a = rr(-2.45, -.7);
  PT.push({ x: x, y: y, r: rsz(c) * sc, hu: c, ru: 0, c: 0, l: 0, m: rr(.85, 1.5), vx: cos(a) * rr(120, 330), vy: sin(a) * rr(230, 520) * up, rt: rr(-.4, .4) });
};

const fling = () => {
  stack.forEach((r, i) => ringPT(r.c, HX + rr(-6, 6), slotY(i), 1, 1));
  puff(HX, slotY(2), 12);
  stack = []; bad = -1; done = 0;
};

const payout = () => {
  G.st++;
  const b = G.u[U_STK] ? min(flr(G.st / 3), UV[U_STK][G.u[U_STK]]) : 0;
  G.m += PAY + b; G.sold++;
  return b;
};

const sell = () => {
  if (!done || busy()) return 0;
  const b = payout(); sSell();
  burst(HX, slotY(3), 26);
  flt(HX, slotY(6) - RS * 2, '+$' + (PAY + b), '#7ce38b');
  flyStack = stack; flyX = HX; flyDir = HX > FX + FW / 2 ? -1 : 1; fly = 1e-4;
  stack = []; bad = -1; done = 0;
  save(); return 1;
};

const scrap = () => {
  if (!stack.length || busy()) return 0;
  G.junk++; G.st = 0; sScrap(); shake = .7; scrapT = .55; fling(); save(); return 1;
};

const cut = () => {
  if (!G.u[U_SAW] || !stack.length || busy()) return 0;
  const r = stack.pop();
  ringPT(r.c, HX, slotY(stack.length), 1, 1);
  puff(HX, slotY(stack.length), 4);
  if (bad >= stack.length) bad = -1;
  done = 0; cutT = .5; sCut(); return 1;
};

const syncApp = () => {
  while (APP.length < G.u[U_APP]) APP.push({ x: FX + FW * rr(.2, .8), st: [], t: 0, ln: 0, rn: 0, g: rr(0, 9), sp: rr(.3, AGAP), fl: 0, fx: 0, fd: 1, fs: [] });
  APP.length = G.u[U_APP];
};

const asell = (a, i) => {
  G.m += PAY; G.sold++;
  const uy = aUy(i), sc = aSc(i);
  burst(a.x, uy - SOFF[3] * sc, 14);
  flt(a.x, uy - SOFF[6] * sc - RS, '+$' + PAY, '#8fe0a8');
  a.fs = a.st; a.fx = a.x; a.fd = a.x > FX + FW / 2 ? -1 : 1; a.fl = 1e-4;
  a.st = []; sApp(7); save();
};

const apprentices = dt => {
  const lane = US * .62;
  for (let j = 0; j < drop.length; j++) drop[j].tk = 0;
  APP.forEach((a, i) => {
    const ty = aTy(i), sc = aSc(i);
    a.st.forEach(r => { if (r.p < 1) r.p = min(1, r.p + dt * 5) });
    a.g += dt * (4 + a.rn * 16);
    a.sp -= dt;
    if (a.sp <= 0) {
      a.sp = AGAP * rr(.8, 1.2);
      if (!a.fl && a.st.length < NR) drop.push({ x: clamp(a.x + rr(-FW * .18, FW * .18), FX + MG, FX + FW - MG), y: FY - RS * 2, py: FY - RS * 2, v: fallV() * rr(.9, 1.12), c: a.st.length, w: rr(0, TAU), tk: 0 });
    }
    if (a.fl) { a.fl += dt; if (a.fl >= FLYT) { a.fl = 0; a.fs = [] } return }

    let an = a.st.length;
    for (let j = drop.length; j--;) {
      const r = drop[j];
      if (r.c == an && r.py < ty && r.y >= ty && abs(r.x - a.x) < tol(r.c) * sc) {
        a.st.push({ c: r.c, p: 0 }); drop.splice(j, 1); sApp(a.st.length); an++; a.tr = 0; break;
      }
    }
    if (an >= NR) { a.t += dt; if (a.t > .35) { a.t = 0; asell(a, i) } return }

    const ok = r => r && r.c == an && r.y < ty && abs(r.x - HX) > lane && drop.indexOf(r) >= 0;
    if (!ok(a.tr)) {
      a.tr = 0;
      let bd = 1e9;
      for (let j = 0; j < drop.length; j++) {
        const r = drop[j], d = ty - r.y;
        if (!r.tk && r.c == an && d > 0 && abs(r.x - HX) > lane && d < bd) { bd = d; a.tr = r }
      }
    }
    const pax = a.x, mv = FW * 1.3 * ASPD * dt;
    let tg = a.x;
    if (a.tr) { a.tr.tk = 1; tg = a.tr.x }
    if (abs(tg - HX) < lane) tg = HX + (tg < HX ? -lane : lane);
    a.x = a.x + clamp(tg - a.x, -mv, mv);
    const d = a.x - HX;
    if (abs(d) < lane) a.x = HX + (d < 0 ? -lane : lane);
    a.x = clamp(a.x, FX + MG * .7, FX + FW - MG * .7);
    a.ln = lerp(a.ln, clamp((a.x - pax) / dt / (FW * .55), -1, 1), .25);
    a.rn = min(abs(a.ln) * 1.6, 1);
  });
};

const upGame = dt => {
  const t = clamp((IN.x - FX) / FW, 0, 1);
  const k = (K.ArrowRight || K.d || K.D ? 1 : 0) - (K.ArrowLeft || K.a || K.A ? 1 : 0);
  if (k) utx = clamp(utx + k * dt * 1.35, 0, 1);
  else if (IN.x > FX && IN.x < FX + FW && IN.y > FY && IN.y < H - BOT) utx = t;
  const px = HX, tg = FX + MG + utx * (FW - MG * 2), mv = FW * 1.3 * dt;
  HX = clamp(HX + clamp(tg - HX, -mv, mv), FX + MG, FX + FW - MG);
  ulean = lerp(ulean, clamp((HX - px) / dt / (FW * .7), -1, 1), .22);
  urun = min(abs(ulean) * 1.6, 1);
  ugait += dt * (4 + urun * 16);
  if (urun > .45 && rnd() < dt * 22) burst(HX + rr(-US * .3, US * .3), UY - US * .03, 1, hsl(280, 60, 88, .8));

  if (fly) {
    fly += dt;
    const u = min(fly / (FLYT * .62), 1);
    if (u < 1 && rnd() < dt * 34) { const q = flyPos(flyX, flyDir, UY, 1, u); burst(q[0] + rr(-US * .35, US * .35), q[1] + rr(-US * .3, US * .3), 1) }
    if (fly >= FLYT) { fly = 0; flyStack = [] }
  }
  if (scrapT > 0) scrapT = max(0, scrapT - dt);
  if (cutT > 0) cutT = max(0, cutT - dt);
  if (G.u[U_AUT] && done && !fly) { autoT += dt; if (autoT > .4) { autoT = 0; sell() } } else autoT = 0;

  spawnT -= dt;
  if (spawnT <= 0) { spawnT = gap() * rr(.85, 1.2); spawn() }

  const live = bad < 0 && !done && !busy();
  const mr = US * MAGR[G.u[U_MAG]], mp = FW * MAGP[G.u[U_MAG]] * dt;
  const wr = US * WRDR[G.u[U_WRD]], wp = FW * WRDP[G.u[U_WRD]] * dt;
  aimOn = 0;
  for (let i = drop.length; i--;) {
    const r = drop[i];
    r.py = r.y; r.y += r.v * dt; r.w += dt * 2;
    if (live && r.y < TY) {
      const dx = r.x - HX;
      if (r.c == need()) {
        if (G.u[U_MAG] && abs(dx) < mr) r.x -= clamp(dx, -mp, mp);
        if (G.u[U_AIM] && abs(dx) < tol(r.c)) aimOn = 1;
      } else if (G.u[U_WRD] && abs(dx) < wr) {
        r.x = clamp(r.x + (dx < 0 ? -wp : wp), FX + RS, FX + FW - RS);
      }
    }
    if (live && r.py < TY && r.y >= TY && abs(r.x - HX) < tol(r.c)) { grab(r); drop.splice(i, 1); continue }
    if (r.y > FY + FH + RS * 2) drop.splice(i, 1);
  }
  stack.forEach(r => { if (r.p < 1) r.p = min(1, r.p + dt * 5) });
  if (APP.length != G.u[U_APP]) syncApp();
  if (G.u[U_APP]) apprentices(dt);

  if (shake > 0) shake = max(0, shake - dt * 2.6);
  if (badF > 0) badF = max(0, badF - dt * 1.6);
  if (goodF > 0) goodF = max(0, goodF - dt * 3.4);
};

const dbgReset = () => {
  G.m = G.sold = G.junk = G.st = 0;
  G.u = UP.map(() => 0);
  stack = []; APP.length = 0; drop = []; PT.length = 0; FLT.length = 0;
  bad = -1; done = 0; fly = 0; scrapT = cutT = autoT = 0; shopOn = 0;
  try { delete localStorage[KEY] } catch (e) { }
  layout(); sScrap();
};

const save = () => {
  try { localStorage[KEY] = JSON.stringify([G.m, G.sold, G.junk, G.mu, G.st, G.u]) } catch (e) { }
};
const load = () => {
  try {
    const d = JSON.parse(localStorage[KEY]);
    if (!d) return;
    G.m = d[0] | 0; G.sold = d[1] | 0; G.junk = d[2] | 0; G.mu = d[3] | 0; G.st = d[4] | 0;
    if (d[5]) for (let i = 0; i < UP.length; i++) G.u[i] = min(d[5][i] | 0, UP[i][4]);
    syncApp();
  } catch (e) { }
};
