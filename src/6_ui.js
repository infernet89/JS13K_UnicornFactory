// Chrome drawn on top of the field: order sidebar, top bar, action buttons, upgrade panel.

const drawRef = () => {
  X.fillStyle = '#1a1030'; X.fillRect(0, 0, RFW, H - BOT);
  X.fillStyle = '#33224f'; X.fillRect(RFW - 2, 0, 2, H - BOT);
  const ch = FH / NR, r0 = min(RFW * .33, ch * .38), cx = RFW / 2;
  for (let i = 0; i < NR; i++) {
    const y = FY + FH - (i + .5) * ch, has = i < stack.length, nx = i == stack.length && bad < 0;
    X.globalAlpha = has ? .32 : nx ? 1 : .5;
    ring(cx, y, r0 * taper(i), i, 0);
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

const spk = (x, y, r, on) => {
  const c = on ? '#b79ee0' : '#5c4a80';
  X.fillStyle = c;
  X.beginPath();
  X.moveTo(x - r, y - r * .4); X.lineTo(x - r * .35, y - r * .4); X.lineTo(x + r * .3, y - r);
  X.lineTo(x + r * .3, y + r); X.lineTo(x - r * .35, y + r * .4); X.lineTo(x - r, y + r * .4);
  X.closePath(); X.fill();
  X.strokeStyle = c; X.lineWidth = max(1, r * .2);
  X.beginPath();
  if (on) X.arc(x + r * .45, y, r * .5, -.9, .9);
  else { X.moveTo(x + r * .6, y - r * .5); X.lineTo(x + r * 1.2, y + r * .5); X.moveTo(x + r * 1.2, y - r * .5); X.lineTo(x + r * .6, y + r * .5) }
  X.stroke();
};

// Small pill in the top bar. dash marks the two debug-only controls.
const tab = (x, w, lab, fs, fill, line, col, dash) => {
  if (dash) X.setLineDash([3, 2]);
  plate(x, TOP * .18, w, TOP * .64, 6, fill, line);
  if (dash) X.setLineDash([]);
  txt(lab, x + w / 2, TOP / 2, FS * fs, col, 'center', 'bold');
};

const btn = (x, lab, sub, on, hot, c1, c2) => {
  plate(x, BBY, BBW, BBH, 9,
    on ? (hot ? 'hsl(348 82% ' + (52 + 9 * sin(TIME * 8)) + '%)' : grad(x, BBY, x + BBW, BBY + BBH, c1, c2)) : '#241a3c',
    on && '#ffffff40');
  txt(lab, x + BBW / 2, BBY + BBH * .37, FS * (BBW < FS * 9 ? .9 : 1.05), on ? '#fff' : '#5c4a82', 'center', 'bold');
  txt(sub, x + BBW / 2, BBY + BBH * .73, FS * .62, on ? '#ffffffc4' : '#493a6b', 'center');
};

const canBuy = () => { for (let i = 0; i < UP.length; i++) if (!upMax(i) && G.m >= upCost(i)) return 1; return 0 };

const drawUI = () => {
  X.fillStyle = '#150d26';
  X.fillRect(FX, 0, W - FX, TOP); X.fillRect(0, H - BOT, W, BOT);

  txt('$' + G.m, FX + FS * .8, TOP / 2, FS * (W < FS * 32 ? 1.25 : 1.5), '#7ce38b', 'left', 'bold');
  let hx = FX + FS * 1.5 + X.measureText('$' + G.m).width;
  if (G.u[U_STK] && G.st > 0) {
    txt('x' + G.st, hx, TOP / 2 + FS * .1, FS * .86, '#ffcf5c', 'left', 'bold');
    hx += X.measureText('x' + G.st).width + FS * .8;
  }
  // The target disappears once it is met, so it never reads "145 / 130".
  if (W > FS * 32) txt('SOLD ' + G.sold + (G.sold < BRG ? ' / ' + BRG : ''),
    hx, TOP / 2 + FS * .12, FS * .76, '#9b86c9', 'left');

  const cb = canBuy();
  tab(SHX, SHW, 'SHOP', .82, cb ? 'hsl(268 62% ' + (52 + 7 * sin(TIME * 5)) + '%)' : '#2b1c48', cb ? '#d8bcff' : '#5a4488', cb ? '#fff' : '#a08ecb');
  tab(DGX, DGW, '+$' + DBG, .68, '#3a2a14', '#c8912f', '#e8b64d', 1);
  tab(RSX, RSW, rstArm > 0 ? 'SURE?' : 'RST', .64, rstArm > 0 ? '#8e1b33' : '#3a1620', '#d4577a', rstArm > 0 ? '#fff' : '#e0788f', 1);

  txt(VER, W - FS * 2.6, TOP / 2 + FS * .06, FS * .72, '#9683c4', 'right');
  spk(W - FS * 1.4, TOP / 2, FS * .5, !G.mu);

  const n = BBX.length;
  if (n > 2) btn(BBX[0], 'CUT', 'drop last ring', stack.length > 0, bad >= 0, '#e0913a', '#b0621f');
  btn(BBX[n - 2], 'SCRAP', stack.length ? 'start over' : 'nothing to scrap', stack.length > 0, bad >= 0 && n < 3, '#8a5fd6', '#5b3fa8');
  btn(BBX[n - 1], 'SELL  $' + PAY, done ? 'rainbow complete!' : 'finish the rainbow', done, 0, '#39c47c', '#1f9e8e');

  if (rush > 0) { X.fillStyle = 'hsl(' + (TIME * 260 % 360) + ' 100% 62%/.06)'; X.fillRect(FX, TOP, W - FX, FH) }
  if (banT > 0) txt(banS, FX + (W - FX) / 2, TOP + FH * .2, FS * 1.6,
    'hsl(' + (TIME * 220 % 360) + ' 92% 74%/' + min(banT / .45, 1) + ')', 'center', 'bold');
  hint();

  FLT.forEach(f => { X.globalAlpha = 1 - f.l / 1.2; txt(f.s, f.x, f.y, FS * 1.3, f.c, 'center', 'bold') });
  X.globalAlpha = 1;
};

const drawShop = () => {
  X.fillStyle = '#0b0618cc'; X.fillRect(0, 0, W, H);
  plate(SPX, SPY, SPW, SPH, 14, '#1d1234', '#4b3577', 2);

  const top = SPY + SHH, vh = SPH - SHH - FS * .6, pad = FS * .55;
  sscr = clamp(sscr, 0, smax);
  X.save(); X.beginPath(); X.rect(SPX, top, SPW, vh); X.clip();
  for (let i = 0; i < UP.length; i++) {
    const y = top + i * SRH - sscr;
    if (y > top + vh || y + SRH < top) continue;
    const mx = upMax(i), c = upCost(i), ok = !mx && G.m >= c;
    plate(SPX + pad, y + pad * .4, SPW - pad * 2, SRH - pad * .8, 8,
      mx ? '#231a3a' : ok ? '#2c1c4e' : '#1e1533', ok && '#7ce38b88');
    const tx = SPX + pad * 2, cy = y + SRH / 2, rx = SPX + SPW - pad * 2;
    txt(UP[i][0], tx, cy - FS * .72, FS * .96, mx ? '#9d8bc6' : '#fff', 'left', 'bold');
    txt(upDesc(i), tx, cy + FS * .35, FS * .68, '#a794cf', 'left');
    txt(mx ? 'MAX' : '$' + c, rx, cy - FS * .68, FS * 1.02, mx || ok ? '#7ce38b' : '#6d5c93', 'right', 'bold');
    const pw = FS * .5;
    for (let k = 0; k < UP[i][2].length; k++) {
      X.fillStyle = k < G.u[i] ? '#ffcf5c' : '#4a3a70';
      dot(rx - k * pw * 1.5, cy + FS * .5, pw * .34);
    }
  }
  X.restore();

  plate(SPX, SPY, SPW, SHH, 14, '#1d1234');
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

// --- overlays: hints, title, ending ---------------------------------------
// Shared attract pulse for every 'do this next' line on screen.
const blink = () => 'hsl(50 100% 76%/' + (.45 + .55 * abs(sin(TIME * 3))) + ')';
// Each hint waits for the action it teaches and never comes back: G.h is saved.
const HINT = ['catch the RED ring on your horn', 'press SPACE to sell it', 'press B to spend your money'];
const hint = () => {
  if (G.h > 2 || shopOn) return;
  const s = G.h ? G.h > 1 ? canBuy() && HINT[2] : done && HINT[1] : HINT[0];
  if (s) txt(s, FX + (W - FX) / 2, BBY - FS * 1.15, FS * .88, blink(), 'center', 'bold');
};

const panel = (w, h) => {
  X.fillStyle = '#0b0618d8'; X.fillRect(0, 0, W, H);
  plate((W - w) / 2, (H - h) / 2, w, h, 16, '#1d1234', '#7a58b8', 2);
};

// Full-screen title: name up top, unicorn in the middle, PLAY at the bottom and
// the credits in the corners. The unicorn is sized so its horn clears the tagline.
// Clicking anywhere starts, so the button is an affordance rather than a gate.
// PLAY button rect, shared by the title drawing and the click test so the two can
// never drift apart. Height is generous enough to be a comfortable touch target.
const playBtn = () => {
  const bw = min(W * .52, 230);
  return [(W - bw) / 2, H * .79, bw, FS * 3.4];
};

const drawTitle = () => {
  X.fillStyle = '#0b0618c8'; X.fillRect(0, 0, W, H);
  const ts = min(W * .165, H * .125);
  txt('UNICORN', W / 2, H * .15, ts, '#ff9fd6', 'center', 'bold');
  txt('FACTORY', W / 2, H * .27, ts, '#7ce38b', 'center', 'bold');
  txt('stack the rings, build the rainbow', W / 2, H * .36, FS * .9, '#a794cf', 'center');

  uni(W / 2, H * .73, min(W * .3, H * .195), TIME, 0, 1, sin(TIME * 2.2) * .6, TIME * 9);

  const [bx, by, bw, bh] = playBtn();
  const hot = IN.x > bx && IN.x < bx + bw && IN.y > by && IN.y < by + bh;
  plate(bx, by, bw, bh, 10, hot ? '#4bd68f' : grad(bx, by, bx + bw, by + bh, '#39c47c', '#1f9e8e'),
    'hsl(0 0% 100%/' + (.25 + .3 * abs(sin(TIME * 3))) + ')', 2);
  txt('PLAY', W / 2, by + bh / 2, FS * 1.5, '#fff', 'center', 'bold');

  txt('Made for JS13KGames', FS, H - FS * 1.1, FS * .78, '#7c6aa8', 'left');
  txt('By Infernet89', W - FS, H - FS * 1.1, FS * .78, '#7c6aa8', 'right');
};

const drawEnd = () => {
  const a = clamp((endT - 3.4) / .8, 0, 1);
  if (a <= 0) return;
  X.globalAlpha = a;
  const w = min(W * .88, 410), h = min(H * .82, 350), x = (W - w) / 2, y = (H - h) / 2, p = FS * 1.5;
  panel(w, h);
  txt('THE BRIDGE IS DONE', W / 2, y + h * .13, FS * 1.2, '#ff9fd6', 'center', 'bold');
  [['unicorns sold', G.sold], ['scrapped', G.junk], ['best streak', G.bst],
   ['upgrades', upTot()],
   ['time', flr(G.tm / 60) + 'm ' + (flr(G.tm) % 60) + 's']].forEach((r, i) => {
    const ry = y + h * (.32 + i * .115);
    txt(r[0], x + p, ry, FS * .84, '#a794cf', 'left');
    txt('' + r[1], x + w - p, ry, FS * .96, '#fff', 'right', 'bold');
  });
  txt('click to keep playing', W / 2, y + h * .93, FS * .88, blink(), 'center', 'bold');
  X.globalAlpha = 1;
};
