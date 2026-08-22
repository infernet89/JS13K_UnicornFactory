const resize = () => {
  DPR = min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  C.width = W * DPR | 0; C.height = H * DPR | 0;
  X.setTransform(DPR, 0, 0, DPR, 0, 0);
  layout();
};

const click = (x, y) => {
  if (y < TOP) {
    if (x > W - FS * 2.3) { G.mu = G.mu ? 0 : 1; save(); if (!G.mu) sGood(4) }
    return;
  }
  if (y > BBY - FS * .5) {
    if (x < DBX + BBW + FS * .4) { if (!scrap()) sBad() }
    else if (!sell()) sBad();
  }
};

let last = 0, pSp = 0, pSc = 0;
const frame = t => {
  requestAnimationFrame(frame);
  const dt = min((t - last) / 1e3, .1); last = t;
  TIME += dt;

  const sp = K[' '] ? 1 : 0, sc = K.x || K.X || K.Escape || K.Backspace ? 1 : 0;
  if (sp && !pSp) sell();
  if (sc && !pSc) scrap();
  pSp = sp; pSc = sc;
  if (IN.tap) { IN.tap = 0; click(IN.tx, IN.ty) }

  upGame(dt); upView(dt);
  X.clearRect(0, 0, W, H);
  draw();
};

addEventListener('resize', resize);
resize();
load();
requestAnimationFrame(t => { last = t; frame(t) });
