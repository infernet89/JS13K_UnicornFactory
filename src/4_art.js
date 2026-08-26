const star = (x, y, r, rot, col, n) => {
  X.save(); X.translate(x, y); X.rotate(rot); X.beginPath();
  const p = n || 4;
  for (let i = 0; i < p * 2; i++) {
    const a = i * PI / p, d = i & 1 ? r * .28 : r;
    i ? X.lineTo(cos(a) * d, sin(a) * d) : X.moveTo(cos(a) * d, sin(a) * d);
  }
  X.closePath(); X.fillStyle = col; X.fill(); X.restore();
};

const cloud = (x, y, r) => {
  X.beginPath();
  X.arc(x - r * 1.15, y + r * .12, r * .56, 0, TAU);
  X.arc(x - r * .46, y - r * .38, r * .82, 0, TAU);
  X.arc(x + r * .42, y - r * .18, r * .66, 0, TAU);
  X.arc(x + r * 1.12, y + r * .14, r * .48, 0, TAU);
  X.ellipse(x, y + r * .34, r * 1.55, r * .48, 0, 0, TAU);
  X.fill();
};

// The numeral is a colour-blind aid: four of the seven hues collapse together for
// a deuteranope, and the 7.5% size taper between neighbours is far too small to
// tell them apart on its own.
const ring = (x, y, rx, ci, ruin, tilt) => {
  const ry = rx * .4, t = rx * .33;
  const hu = HUE[ci], s = ruin ? 10 : SAT[ci], l = ruin ? 34 : LIT[ci];
  X.save(); X.translate(x, y); if (tilt) X.rotate(tilt);
  X.beginPath();
  X.ellipse(0, 0, rx, ry, 0, 0, TAU);
  X.ellipse(0, 0, rx - t, ry - t * .58, 0, 0, TAU);
  const g = X.createLinearGradient(-rx, -ry, rx, ry);
  g.addColorStop(0, hsl(hu, s, l + 16)); g.addColorStop(.45, hsl(hu, s, l));
  g.addColorStop(1, hsl(hu, s, l - 22));
  X.fillStyle = g; X.fill('evenodd');
  strk(ruin ? '#ff4d6d' : hsl(hu, 70, 20, .55), max(1, rx * .07));
  X.ellipse(0, 0, rx, ry, 0, 0, TAU); X.stroke();
  strk(hsl(hu, 100, ruin ? 60 : 86, .75), max(1, t * .3));
  X.ellipse(0, -ry * .3, rx - t * .5, ry * .5, 0, PI * 1.12, PI * 1.88); X.stroke();
  txt(ci + 1, 0, 0, rx * .62, hsl(hu, 94, 92, .82), 'center', 'bold');
  X.restore();
};

const leg = (x, w, sw, col, hoof) => {
  const lf = max(0, sw) * .5;
  X.fillStyle = col;
  X.beginPath();
  const tp = sw * .34;
  X.moveTo(x - w / 2 + tp, -.36); X.lineTo(x + w / 2 + tp, -.36);
  X.lineTo(x + w / 2 + sw, -.02 - lf); X.lineTo(x - w / 2 + sw, -.02 - lf);
  X.closePath(); X.fill();
  X.fillStyle = hoof;
  box(x - w / 2 + sw - .006, -.062 - lf, w + .012, .062, .02); X.fill();
};

const uni = (x, y, s, t, glow, run, ln, gt) => {
  const lean = ln || 0, r = run || 0, cd = gt || 0;
  X.save(); X.translate(x, y); X.rotate(lean * LNA);
  X.translate(0, sin(t * 3) * s * .012 - abs(sin(cd)) * s * .09 * r); X.scale(s, s);
  const W1 = '#fffaff', W2 = '#e3d2f7', SH = '#f0e4ff', HO = '#6d4ea3', DK = '#3b2a58';
  const sw = sin(cd) * .17 * r, sw2 = sin(cd + PI) * .17 * r;

  const tl = -lean * .2;
  X.fillStyle = W2;
  X.beginPath(); X.moveTo(-.21, -.62);
  X.bezierCurveTo(-.42 + tl, -.62, -.44 + tl, -.3, -.3 + tl, -.16);
  X.lineTo(-.17, -.34); X.closePath(); X.fill();
  X.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    strk(RC(i, 4), .046);
    X.moveTo(-.2, -.6 + i * .012);
    X.bezierCurveTo(-.37 - i * .012 + tl, -.6 + sin(t * 2) * .02, -.39 + tl, -.32, -.28 - i * .011 + tl, -.17 - i * .022);
    X.stroke();
  }

  leg(-.155, .09, sw2, W2, HO);
  leg(.155, .09, sw, W2, HO);

  X.fillStyle = W1;
  X.beginPath(); X.ellipse(0, -.48, .235, .175, 0, 0, TAU); X.fill();
  X.fillStyle = SH;
  X.beginPath(); X.ellipse(0, -.44, .15, .105, 0, 0, TAU); X.fill();

  leg(-.10, .095, sw, W1, HO);
  leg(.10, .095, sw2, W1, HO);

  X.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const f = (i / 6 - .5) * 2, wv = sin(t * 2.2 + i * .7) * .014 - lean * .11;
    strk(RC(i, 2), .055);
    X.moveTo(f * .085, -.9);
    X.quadraticCurveTo(f * .26 + wv, -.76, f * .225 + wv, -.55 + abs(f) * .07);
    X.stroke();
  }

  X.fillStyle = W1;
  X.beginPath(); X.moveTo(-.105, -.53); X.lineTo(.105, -.53);
  X.lineTo(.088, -.755); X.lineTo(-.088, -.755); X.closePath(); X.fill();

  X.fillStyle = W1;
  X.beginPath(); X.ellipse(0, -.83, .168, .152, 0, 0, TAU); X.fill();
  X.fillStyle = '#ffe6f6';
  X.beginPath(); X.ellipse(0, -.762, .098, .068, 0, 0, TAU); X.fill();
  X.fillStyle = '#e0a6cd'; dot(-.034, -.754, .014); dot(.034, -.754, .014);
  X.fillStyle = '#ffc7e4';
  X.beginPath(); X.ellipse(-.115, -.808, .034, .022, 0, 0, TAU); X.fill();
  X.beginPath(); X.ellipse(.115, -.808, .034, .022, 0, 0, TAU); X.fill();

  const bl = (t % 4.6) < .12;
  X.fillStyle = DK;
  if (bl) { X.fillRect(-.104, -.868, .055, .016); X.fillRect(.049, -.868, .055, .016) }
  else {
    X.beginPath(); X.ellipse(-.076, -.866, .029, .04, 0, 0, TAU); X.fill();
    X.beginPath(); X.ellipse(.076, -.866, .029, .04, 0, 0, TAU); X.fill();
    X.fillStyle = '#fff'; dot(-.066, -.881, .013); dot(.086, -.881, .013);
  }

  const et = sin(t * 1.7) * .022 - lean * .05;
  X.fillStyle = W1;
  tri(-.15, -.92, -.185 + et, -1.02, -.075, -.945);
  tri(.15, -.92, .185 - et, -1.02, .075, -.945);
  X.fillStyle = '#f9d9f0';
  tri(-.142, -.928, -.172 + et, -1.0, -.095, -.945);
  tri(.142, -.928, .172 - et, -1.0, .095, -.945);

  const hg = X.createLinearGradient(-.05, -.9, .05, -HORN);
  hg.addColorStop(0, '#f3b52c'); hg.addColorStop(.5, '#ffe08a'); hg.addColorStop(1, '#fffdf0');
  X.fillStyle = hg;
  X.beginPath(); X.moveTo(-.058, -.9); X.lineTo(.058, -.9); X.lineTo(0, -HORN); X.closePath(); X.fill();
  for (let i = 1; i < 11; i++) {
    const f = i / 11, w = .056 * (1 - f);
    strk('#d9992a', .011);
    X.moveTo(-w, -.9 - f * .79); X.lineTo(w, -.9 - f * .79 - .03); X.stroke();
  }
  if (glow) {
    X.fillStyle = hsl(48, 100, 70, .1 + .08 * sin(t * 7));
    X.beginPath(); X.arc(0, -.9, .9, 0, TAU); X.fill();
  }
  X.restore();
};
