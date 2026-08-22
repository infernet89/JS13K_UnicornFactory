const resize = () => {
  DPR = min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  C.width = W * DPR | 0; C.height = H * DPR | 0;
  X.setTransform(DPR, 0, 0, DPR, 0, 0);
  layout();
};

const click = (x, y) => {
  if (shopOn) {
    if (x < SPX || x > SPX + SPW || y < SPY || y > SPY + SPH) { shopOn = 0; return }
    if (y < SPY + SHH) { if (x > SPX + SPW - FS * 2.4) shopOn = 0; return }
    const i = flr((y - SPY - SHH + sscr) / SRH);
    if (i >= 0 && i < UP.length) { if (upBuy(i)) sBuy(); else sBad() }
    return;
  }
  if (y < TOP) {
    if (x > W - FS * 2.3) { G.mu = G.mu ? 0 : 1; save(); if (!G.mu) sGood(4) }
    else if (x > RSX - FS * .3 && x < RSX + RSW + FS * .3) {
      if (rstArm > 0) { rstArm = 0; dbgReset() } else { rstArm = 3; sBad() }
    }
    else if (x > DGX - FS * .3 && x < DGX + DGW + FS * .3) { G.m += DBG; save(); sBuy() }
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

let last = 0, pSp = 0, pSc = 0, pCu = 0, pSh = 0;
const frame = t => {
  requestAnimationFrame(frame);
  const dt = min((t - last) / 1e3, .1); last = t;
  if (rstArm > 0) rstArm = max(0, rstArm - dt);

  const sp = K[' '] ? 1 : 0;
  const sc = K.x || K.X || K.Backspace ? 1 : 0;
  const cu = K.c || K.C ? 1 : 0;
  const sh = K.b || K.B || K.Escape ? 1 : 0;
  if (sh && !pSh) { shopOn = shopOn ? 0 : 1; sscr = 0 }
  if (!shopOn) {
    if (sp && !pSp) sell();
    if (sc && !pSc) scrap();
    if (cu && !pCu) cut();
  }
  pSp = sp; pSc = sc; pCu = cu; pSh = sh;
  if (IN.tap) { IN.tap = 0; click(IN.tx, IN.ty) }

  if (shopOn) {
    if (IN.dn && IN.drag) sscr -= IN.dy;
    if (IN.w) sscr += IN.w * .5;
    TIME += dt;
  } else {
    TIME += dt;
    upGame(dt); upView(dt);
  }
  IN.dy = 0; IN.w = 0;
  X.clearRect(0, 0, W, H);
  draw();
};

addEventListener('resize', resize);
resize();
load();
layout();
requestAnimationFrame(t => { last = t; frame(t) });
