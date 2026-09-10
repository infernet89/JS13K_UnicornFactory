const resize = () => {
  DPR = min(devicePixelRatio || 1, 2);
  // An iframe can report 0 before it has been laid out, and a zero-size field
  // makes layout() produce negative radii, which throws. Never go below this.
  W = max(innerWidth, 240); H = max(innerHeight, 180);
  C.width = W * DPR | 0; C.height = H * DPR | 0;
  X.setTransform(DPR, 0, 0, DPR, 0, 0);
  layout();
};

const click = (x, y) => {
  if (shopOn) {
    if (x < SPX || x > SPX + SPW || y < SPY || y > SPY + SPH) { shopOn = 0; return }
    if (y < SPY + SHH) { if (x > SPX + SPW - FS * 2.4) shopOn = 0; return }
    const r = flr((y - SPY - SHH + sscr) / SRH);
    const i = r * SCOL + clamp(flr((x - SPX) / (SPW / SCOL)), 0, SCOL - 1);
    if (r >= 0 && i < UP.length) { if (upBuy(i)) sBuy(); else sBad() }
    return;
  }
  if (y < TOP) {
    if (x > W - FS * 2.3) { G.mu = G.mu ? 0 : 1; save(); if (!G.mu) sGood(4) }
    else if (x > SHX - FS * .4 && x < SHX + SHW + FS * .4) { shopOn = 1; sscr = 0; sCut() }
    return;
  }
  if (y > BBY - FS * .5) {
    const n = BBX.length;
    let i = n - 1;
    while (i > 0 && x < BBX[i] - FS * .25) i--;
    if (n > 2 && i == 0) { if (!cut()) sBad() }
    else if (i == n - 2) { if (!scrap()) sBad() }
    else if (!sell()) sBad();
  }
};

// Edge-triggered keys: [aliases, action, worksWhileShopOpen]. Adding a shortcut
// is one row. kPre holds last frame's state per row.
const KB = [
  [[' '], sell],
  [['x', 'X', 'Backspace'], scrap],
  [['c', 'C'], cut],
  [['b', 'B', 'Escape'], () => { shopOn = shopOn ? 0 : 1; sscr = 0 }, 1]
];
const kPre = [];
let last = 0;
// Update then draw, once each. The three screens differ only in what they step
// and what goes on top: the world, the sidebar and the top bar are common to two
// of them, so they are written once at the bottom rather than per branch.
const frame = t => {
  requestAnimationFrame(frame);
  const dt = min((t - last) / 1e3, .1); last = t;
  TIME += dt;
  X.clearRect(0, 0, W, H);

  if (!scr) {
    // Only the PLAY button starts the run; a tap anywhere else is ignored.
    const [bx, by, bw, bh] = playBtn();
    if (tapped() && IN.tx > bx && IN.tx < bx + bw && IN.ty > by && IN.ty < by + bh) { scr = 1; au(); sBuy() }
    drawBg(); drawTitle(); return;
  }

  music(dt);
  if (scr > 1) {
    ugait += dt * 11; upView(dt);
    if (bye < exo()) {
      bye += dt;
      APP.forEach((a, i) => a.fl = max(0, bye - i * .12));
      fly = max(0, bye - APP.length * .12);
    } else { endT += dt; bounce(dt) }
    if (endT > 4.2 && tapped()) { scr = 1; TC = 0; save() }
  } else {
    KB.forEach((e, i) => {
      const on = e[0].some(k => K[k]) ? 1 : 0;
      if (on && !kPre[i] && (e[2] || !shopOn)) e[1]();
      kPre[i] = on;
    });
    if (tapped()) click(IN.tx, IN.ty);
    if (G.h == 2 && shopOn) { G.h = 3; save() }
    if (shopOn) {
      if (IN.dn && IN.drag) sscr -= IN.dy;
      if (IN.w) sscr += IN.w * .5;
    } else { upGame(dt); upView(dt) }
    IN.dy = 0; IN.w = 0;
  }

  drawWorld(); drawRef(); drawUI();
  if (scr > 1) drawEnd(); else if (shopOn) drawShop();
};

addEventListener('resize', resize);
// layout() runs twice on purpose. resize() needs a field before load() can place
// the saved apprentices in it, and load() can restore the horn saw, which adds a
// third button to the bar - so the bar has to be measured again afterwards.
resize();
load();
layout();
requestAnimationFrame(t => { last = t; frame(t) });

// Konami code: up up down down left right left right B A pays $99999.
// Deliberately shipped - the user asked for it to stay in the released build.
const KON = 'arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a,';
let kseq = '';
addEventListener('keydown', e => {
  kseq = (kseq + e.key.toLowerCase() + ',').slice(-KON.length);
  if (kseq == KON) { kseq = ''; G.m += 99999; save(); sBuy(); ban('KONAMI  +$99999') }
});
