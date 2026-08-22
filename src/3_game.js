const KEY = 'ufr1';
const G = { m: 0, sold: 0, junk: 0, mu: 0 };

let stack = [], bad = -1, done = 0, drop = [], utx = .5, uvx = 0;
let spawnT = 0, shake = 0, badF = 0, goodF = 0, urun = 0, ulean = 0, scrapT = 0;
let fly = 0, flyX = 0, flyDir = 1, flyStack = [];
const FLYT = 1.05;

const speed = () => min(1 + G.sold * .035, 2.4);
const gap = () => max(.42, 1.05 / speed());
const fallV = () => FH / (2.9 / speed());

const need = () => stack.length;

const spawn = () => {
  const c = bad < 0 && need() < NR && rnd() < .42 ? need() : flr(rnd() * NR);
  drop.push({ x: rr(FX + MG, FX + FW - MG), y: FY - RS * 2, v: fallV() * rr(.9, 1.12), c: c, w: rr(0, TAU) });
};

const grab = r => {
  if (r.c == need()) {
    stack.push({ c: r.c, p: 0 });
    goodF = 1; sGood(stack.length);
    if (stack.length >= NR) { done = 1; sDone() }
  } else {
    stack.push({ c: r.c, p: 0 });
    bad = stack.length - 1; badF = 1; shake = 1; sBad();
    flt(HX, TY + RS * 2, 'WRONG!', '#ff5d7a');
  }
};

const fling = ru => {
  stack.forEach((r, i) => {
    const a = rr(-2.45, -.7);
    PT.push({ x: HX + rr(-6, 6), y: slotY(i), r: rsz(r.c), hu: r.c, ru: ru, c: 0, l: 0, m: rr(.85, 1.5), vx: cos(a) * rr(120, 330), vy: sin(a) * rr(230, 520), rt: rr(-.4, .4) });
  });
  for (let i = 0; i < 12; i++) {
    const a = rr(0, TAU);
    PT.push({ x: HX + rr(-RS, RS), y: slotY(2), r: rr(3, 9) * (FS / 15), hu: -1, ru: 0, c: hsl(275, 20, rr(55, 80), .8), l: 0, m: rr(.4, .9), vx: cos(a) * rr(30, 130), vy: sin(a) * rr(30, 130) - 60, rt: rr(0, TAU) });
  }
  stack = []; bad = -1; done = 0;
};

const sell = () => {
  if (!done || fly) return 0;
  G.m++; G.sold++; sSell();
  burst(HX, slotY(3), 26);
  flt(HX, slotY(6) - RS * 2, '+$1', '#7ce38b');
  flyStack = stack; flyX = HX; flyDir = HX > FX + FW / 2 ? -1 : 1; fly = 1e-4; scrapT = 0;
  stack = []; bad = -1; done = 0;
  save(); return 1;
};

const scrap = () => {
  if (!stack.length || fly || scrapT > 0) return 0;
  G.junk++; sScrap(); shake = .7; scrapT = .55; fling(0); save(); return 1;
};

const upGame = dt => {
  const t = clamp((IN.x - FX) / FW, 0, 1);
  let k = (K.ArrowRight || K.d || K.D ? 1 : 0) - (K.ArrowLeft || K.a || K.A ? 1 : 0);
  if (k) utx = clamp(utx + k * dt * 1.35, 0, 1);
  else if (IN.x > FX && IN.x < FX + FW && IN.y > FY && IN.y < H - BOT) utx = t;
  const px = HX, tg = FX + MG + utx * (FW - MG * 2), mv = FW * 1.3 * dt;
  HX = clamp(HX + clamp(tg - HX, -mv, mv), FX + MG, FX + FW - MG);
  ulean = lerp(ulean, clamp((HX - px) / dt / (FW * .7), -1, 1), .22);
  urun = min(abs(ulean) * 1.6, 1);
  if (urun > .45 && rnd() < dt * 22) burst(HX + rr(-US * .3, US * .3), UY - US * .03, 1, hsl(280, 60, 88, .8));

  if (fly) {
    fly += dt;
    const u = min(fly / (FLYT * .62), 1);
    if (u < 1 && rnd() < dt * 34) { const q = flyPos(u); burst(q[0] + rr(-US * .35, US * .35), q[1] + rr(-US * .3, US * .3), 1) }
    if (fly >= FLYT) { fly = 0; flyStack = [] }
  }

  spawnT -= dt;
  if (spawnT <= 0) { spawnT = gap() * rr(.85, 1.2); spawn() }

  const tip = TY;
  for (let i = drop.length; i--;) {
    const r = drop[i];
    const py = r.y;
    r.y += r.v * dt; r.w += dt * 2;
    if (bad < 0 && !done && !fly && !scrapT && py < tip && r.y >= tip && abs(r.x - HX) < rsz(r.c) * .95 + RS * .22) { grab(r); drop.splice(i, 1); continue }
    if (r.y > FY + FH + RS * 2) drop.splice(i, 1);
  }
  stack.forEach(r => { if (r.p < 1) r.p = min(1, r.p + dt * 5) });

  if (scrapT > 0) scrapT = max(0, scrapT - dt);
  if (shake > 0) shake = max(0, shake - dt * 2.6);
  if (badF > 0) badF = max(0, badF - dt * 1.6);
  if (goodF > 0) goodF = max(0, goodF - dt * 3.4);
};

const save = () => {
  try { localStorage[KEY] = JSON.stringify([G.m, G.sold, G.junk, G.mu]) } catch (e) { }
};
const load = () => {
  try {
    const d = JSON.parse(localStorage[KEY]);
    if (d) { G.m = d[0] | 0; G.sold = d[1] | 0; G.junk = d[2] | 0; G.mu = d[3] | 0 }
  } catch (e) { }
};
