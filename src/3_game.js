// Game state, economy and simulation. Rendering lives in 5_scene / 6_ui.
// js13kgames.com serves every entry from one origin, so localStorage is shared
// between all of them. Namespace the key, touch only this key, and never call
// localStorage.clear() - that would wipe other people's games.
const KEY = 'unicornfactory13k';
const G = { m: 0, sold: 0, junk: 0, mu: 0, st: 0, bst: 0, tm: 0, h: 0, u: UP.map(() => 0) };

let stack = [], bad = -1, done = 0, drop = [], utx = .5;
let spawnT = 0, shake = 0, badF = 0, urun = 0, ulean = 0;
let runT = 0, scrapT = 0, cutT = 0, autoT = 0, aimOn = 0, shopOn = 0, ugait = 0;
let fly = 0, flyX = 0, flyDir = 1, flyStack = [];
// scr: 0 title, 1 playing, 2 ending. banT/banS drive the centred banner.
let scr = 0, endT = 0, rushT = 45, rush = 0, banT = 0, banS = '';
// The ending opens with every unicorn flying off, staggered, the player last, so
// the cascade gets a clear sky. bye runs that exodus; endT only starts after it.
let bye = 0;
const exo = () => FLYT + APP.length * .12;
const ban = s => { banS = s; banT = 2.6 };
const APP = [];

// Which way a unicorn leaves the screen: over whichever edge it is already nearest.
const away = x => x > FX + FW / 2 ? -1 : 1;
// Hand a stack to the flyaway. It rides the rainbow trail out while the body walks
// back on from the far side, so the tower is copied before the caller clears it.
// t is where the animation starts: a hair past zero to run it now, zero to arm it
// for the ending, which ramps everyone's clock by hand to stagger the exodus.
const launch = t => { flyStack = stack; flyX = HX; flyDir = away(HX); fly = t };
const aLaunch = (a, t) => { a.fs = a.st; a.fx = a.x; a.fd = away(a.x); a.fl = t };

const upCost = i => UP[i][2][G.u[i]];
const upMax = i => G.u[i] >= UP[i][2].length;
const uv = i => { const a = UV[i]; return a ? a[upMax(i) ? G.u[i] : G.u[i] + 1] : 0 };
const upDesc = i => UP[i][1].replace('@', uv(i));
// How built-up the factory is: drives the music layers and the end-screen tally.
const upTot = () => G.u.reduce((a, b) => a + b, 0);
const upBuy = i => {
  if (upMax(i) || G.m < upCost(i)) return 0;
  G.m -= upCost(i); G.u[i]++; syncApp(); layout(); save(); return 1;
};

// --- tuning curves -------------------------------------------------------
const speed = () => min(1 + G.sold * .035, 2.4);
const gap = () => max(.42, 1.05 / speed()) / RATE[G.u[U_RATE]] / (rush > 0 ? 2 : 1);
const fallV = () => FH / (2.9 / speed()) * OVR[G.u[U_OVR]];
const need = () => stack.length;
const tol = c => rsz(c) * .95 + RS * .22;
const busy = () => fly || scrapT || cutT;

// A falling ring. py is last frame's y, used for line-crossing catch tests;
// tk marks it as claimed by an apprentice for this frame.
const mkDrop = (x, c) => drop.push({
  x: clamp(x, FX + MG, FX + FW - MG), y: FY - RS * 2, py: FY - RS * 2,
  v: fallV() * rr(.9, 1.12), c: c, w: rr(0, TAU), tk: 0
});

const spawn = () => mkDrop(rr(FX + MG, FX + FW - MG),
  bad < 0 && need() < NR && rnd() * 100 < UV[U_CAL][G.u[U_CAL]] ? need() : flr(rnd() * NR));

const grab = r => {
  stack.push({ c: r.c, p: 0 });
  if (r.c == need() - 1) {
    sGood(stack.length);
    if (stack.length >= NR) { done = 1; sDone() }
  } else {
    bad = stack.length - 1; badF = 1; shake = 1; sBad();
    flt(HX, TY + RS * 2, 'WRONG!', '#ff5d7a');
  }
};

const fling = () => {
  stack.forEach((r, i) => ringPT(r.c, HX + rr(-6, 6), slotY(i), 1, 1));
  puff(HX, slotY(2), 12);
  stack = []; bad = -1; done = 0;
};

// The one place money and the sale counter move, so the rush bonus, the
// milestone banners and the bridge all see every sale, the helpers' included.
const gain = n => {
  const p = n * (rush > 0 ? 2 : 1);
  G.m += p; G.sold++;
  if (MILE.indexOf(G.sold) >= 0) ban(G.sold + ' UNICORNS SOLD');
  if (G.sold == BRG) {
    scr = 2; endT = 0; banT = 0; bye = 0; mI = 0; RID = 0;
    // Reuse the sale flyaway: give everyone a trail to ride out on.
    APP.forEach(a => aLaunch(a, 0)); launch(0);
  }
  return p;
};

const payout = () => {
  G.st++; if (G.st > G.bst) G.bst = G.st;
  const b = G.u[U_STK] ? min(flr(G.st / 3), UV[U_STK][G.u[U_STK]]) : 0;
  return gain(PAY + b);
};

const sell = () => {
  if (!done || busy()) return 0;
  const b = payout(); sSell();
  burst(HX, slotY(3), 26);
  flt(HX, slotY(6) - RS * 2, '+$' + b, '#7ce38b');
  launch(1e-4);
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

// --- apprentices ---------------------------------------------------------
// One helper: x/px this and last frame's position, st its stack, t the pause before
// it sells, ln/rn/g the lean, run amount and gait phase, sp the countdown to its
// next guaranteed ring, tr the ring it is currently chasing, fl/fx/fd/fs its flyaway.
const syncApp = () => {
  while (APP.length < G.u[U_APP]) APP.push({ x: FX + FW * rr(.2, .8), px: 0, st: [], t: 0, ln: 0, rn: 0, g: rr(0, 9), sp: rr(.3, AGAP), tr: 0, fl: 0, fx: 0, fd: 1, fs: [] });
  APP.length = G.u[U_APP];
};

const asell = (a, i) => {
  const p = gain(PAY);
  const uy = aUy(i), sc = aSc(i);
  burst(a.x, uy - SOFF[3] * sc, 14);
  flt(a.x, uy - SOFF[6] * sc - RS, '+$' + p, '#8fe0a8');
  aLaunch(a, 1e-4);
  a.st = []; sApp(7); save();
};

const shove = (x, c, w, lo, hi) => {
  if (abs(x - c) >= w) return x;
  const l = c - w, r = c + w;
  if (l >= lo && r <= hi) return x < c ? l : r;
  return l >= lo ? l : r <= hi ? r : x;
};

const apprentices = dt => {
  const lane = US * .45, sep = US * .4;
  const lo = FX + MG * .7, hi = FX + FW - MG * .7;
  drop.forEach(r => r.tk = 0);
  APP.forEach((a, i) => {
    const ty = aTy(i), sc = aSc(i);
    a.st.forEach(r => { if (r.p < 1) r.p = min(1, r.p + dt * 5) });
    a.g += dt * (3 + a.rn * 8);
    a.sp -= dt;
    if (a.sp <= 0) {
      a.sp = AGAP * rr(.8, 1.2) / RATE[G.u[U_RATE]];
      if (!a.fl && a.st.length < NR) mkDrop(a.x + rr(-FW * .18, FW * .18), a.st.length);
    }
    if (a.fl) { a.fl += dt; if (a.fl < FLYT) return; a.fl = 0; a.fs = [] }

    let an = a.st.length;
    for (let j = drop.length; j--;) {
      const r = drop[j];
      if (r.c == an && r.py < ty && r.y >= ty && abs(r.x - a.x) < tol(r.c) * sc) {
        a.st.push({ c: r.c, p: 0 }); drop.splice(j, 1); sApp(a.st.length); an++; a.tr = 0; break;
      }
    }
    const pax = a.x, mv = FW * 1.3 * ASPD * dt;
    let tg = a.x;
    if (an >= NR) {
      a.t += dt;
      if (a.t > .35) { a.t = 0; asell(a, i); return }
    } else {
      const ok = r => r && r.c == an && r.y < ty && abs(r.x - HX) > lane && drop.indexOf(r) >= 0;
      if (!ok(a.tr)) {
        a.tr = 0;
        let bd = 1e9;
        for (let j = 0; j < drop.length; j++) {
          const r = drop[j], d = ty - r.y;
          if (!r.tk && r.c == an && d > 0 && abs(r.x - HX) > lane && d < bd) { bd = d; a.tr = r }
        }
      }
      if (a.tr) { a.tr.tk = 1; tg = a.tr.x }
    }
    if (abs(tg - HX) < lane) tg = HX + (tg < HX ? -lane : lane);
    a.x = clamp(a.x + clamp(tg - a.x, -mv, mv), lo, hi);
    a.px = pax;
  });
  for (let k = 0; k < 4; k++)
    for (let i = 0; i < APP.length; i++) {
      const a = APP[i];
      if (a.fl) continue;
      for (let j = i + 1; j < APP.length; j++) {
        const b = APP[j], d = b.x - a.x;
        if (b.fl || abs(d) >= sep) continue;
        const p = (sep - abs(d)) / 2 * (d < 0 ? -1 : 1);
        a.x -= p; b.x += p;
      }
    }
  APP.forEach(a => {
    if (a.fl) return;
    a.x = clamp(shove(a.x, HX, lane, lo, hi), lo, hi);
    const avx = (a.x - a.px) / dt;
    a.ln = lerp(a.ln, clamp(avx / (FW * .6), -1, 1), .25);
    a.rn = lerp(a.rn, min(abs(avx) / (FW * .18), 1), .3);
  });
};

// --- per-frame simulation ------------------------------------------------
const upGame = dt => {
  G.tm += dt;
  if (!G.h && stack.length) { G.h = 1; save() }
  else if (G.h == 1 && G.sold) { G.h = 2; save() }
  if (banT > 0) banT = max(0, banT - dt);
  if (rush > 0) rush = max(0, rush - dt);
  else if ((rushT -= dt) <= 0) { rushT = rr(55, 90); rush = RUSHT; ban('RAINBOW RUSH  x2'); sDone() }
  const t = clamp((IN.x - FX) / FW, 0, 1);
  const k = (K.ArrowRight || K.d || K.D ? 1 : 0) - (K.ArrowLeft || K.a || K.A ? 1 : 0);
  if (k) utx = clamp(utx + k * dt * SPD[G.u[U_SPD]], 0, 1);
  else if (IN.x > FX && IN.x < FX + FW && IN.y > FY && IN.y < H - BOT) utx = t;
  const px = HX, tg = FX + MG + utx * (FW - MG * 2), mv = FW * SPD[G.u[U_SPD]] * dt;
  HX = clamp(HX + clamp(tg - HX, -mv, mv), FX + MG, FX + FW - MG);
  const vx = (HX - px) / dt;
  // A mouse flick lasts a handful of frames, and while it crosses the screen the
  // unicorn is a blur under the cursor, so the gallop is only readable once it has
  // stopped. Latch the run on for a moment after every move: the stride then plays
  // out with the unicorn standing still, which is the only time it can be seen.
  const rt = min(abs(vx) / (FW * .18), 1);
  if (rt > .3) runT = .15;
  runT = max(0, runT - dt);
  ulean = lerp(ulean, clamp(vx / (FW * .6), -1, 1), rt > .3 ? .25 : .09);
  urun = lerp(urun, runT > 0 ? 1 : 0, runT > 0 ? .35 : .16);
  ugait += dt * (3 + urun * 8);
  if (rt > .45 && rnd() < dt * 22) burst(HX + rr(-US * .3, US * .3), UY - US * .03, 1, hsl(280, 60, 88, .8));

  if (fly) {
    fly += dt;
    const u = min(fly / (FLYT * FLY_UP), 1);
    if (u < 1 && rnd() < dt * 34) { const q = flyPos(flyX, flyDir, UY, 1, u); burst(q[0] + rr(-US * .35, US * .35), q[1] + rr(-US * .3, US * .3), 1) }
    if (fly >= FLYT) { fly = 0; flyStack = [] }
  }
  if (scrapT > 0) scrapT = max(0, scrapT - dt);
  if (cutT > 0) cutT = max(0, cutT - dt);
  // A finished rainbow sells itself after a beat. This used to be an upgrade;
  // making the player press SPACE on a stack that is unambiguously done was
  // busywork, and charging for the fix was worse.
  if (done && !fly) { autoT += dt; if (autoT > .4) { autoT = 0; sell() } } else autoT = 0;

  spawnT -= dt;
  if (spawnT <= 0) { spawnT = gap() * rr(.85, 1.2); spawn() }

  // Re-checked per ring: a catch can complete or ruin the rainbow, and every
  // later ring in the same frame must see that.
  const live = () => bad < 0 && !done && !busy();
  const mr = US * MAGR[G.u[U_MAG]], mp = FW * MAGP[G.u[U_MAG]] * dt;
  const wh = FH * WRDH[G.u[U_WRD]];
  aimOn = 0;
  for (let i = drop.length; i--;) {
    const r = drop[i];
    r.py = r.y; r.y += r.v * dt; r.w += dt * 2;
    if (live() && r.y < TY) {
      const dx = r.x - HX;
      if (r.c == need()) {
        if (G.u[U_MAG] && abs(dx) < mr) r.x -= clamp(dx, -mp, mp);
        if (abs(dx) < tol(r.c)) aimOn = 1;
      } else if (wh && TY - r.y < wh) {
        const gtl = tol(r.c) * 1.3;
        if (abs(dx) < gtl) {
          const rem = max((TY - r.y) / r.v, .06);
          const sp = min((gtl - abs(dx)) / rem * 1.25, FW * 1.8);
          r.x = clamp(r.x + (dx < 0 ? -sp : sp) * dt, FX + RS, FX + FW - RS);
        }
      }
    }
    if (live() && r.py < TY && r.y >= TY && abs(r.x - HX) < tol(r.c)) { grab(r); drop.splice(i, 1); continue }
    if (r.y > FY + FH + RS * 2) drop.splice(i, 1);
  }
  stack.forEach(r => { if (r.p < 1) r.p = min(1, r.p + dt * 5) });
  if (APP.length != G.u[U_APP]) syncApp();
  if (G.u[U_APP]) apprentices(dt);

  if (shake > 0) shake = max(0, shake - dt * 2.6);
  if (badF > 0) badF = max(0, badF - dt * 1.6);
};

// --- persistence ---------------------------------------------------------
// Every scalar in G is saved by name from one list, so adding a counter means
// adding it here and nowhere else. Upgrade levels ride along as a second slot.
const SK = ['m', 'sold', 'junk', 'mu', 'st', 'bst', 'tm', 'h'];
const save = () => {
  try { localStorage[KEY] = JSON.stringify([SK.map(k => G[k] | 0), G.u]) } catch (e) { }
};
const load = () => {
  try {
    const d = JSON.parse(localStorage[KEY]);
    SK.forEach((k, i) => G[k] = d[0][i] | 0);
    for (let i = 0; i < UP.length; i++) G.u[i] = min(d[1][i] | 0, UP[i][2].length);
    syncApp();
  } catch (e) { }
};

