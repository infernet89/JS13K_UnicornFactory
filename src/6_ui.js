// Chrome drawn on top of the field: order sidebar, top bar, action buttons and
// upgrade panel, then the three full-screen overlays - hint, title and ending.

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
      // The same attract pulse as the on-screen hints: this halo is a 'do this next'.
      strk(blink(), max(1.5, r0 * .12));
      X.ellipse(cx, y, r0 * 1.34, r0 * .64, 0, 0, TAU); X.stroke();
    }
    if (has) {
      X.lineCap = 'round';
      strk(bad == i ? '#ff4d6d' : '#7ce38b', max(1.6, r0 * .14));
      if (bad == i) cross(cx, y, r0 * .3, r0 * .3);
      else { X.moveTo(cx - r0 * .32, y); X.lineTo(cx - r0 * .08, y + r0 * .26); X.lineTo(cx + r0 * .34, y - r0 * .28) }
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
  strk(c, max(1, r * .2));
  if (on) X.arc(x + r * .45, y, r * .5, -.9, .9);
  else cross(x + r * .9, y, r * .3, r * .5);
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
    on ? (hot ? hsl(348, 82, 52 + 9 * sin(TIME * 8)) : grad(x, BBY, x + BBW, BBY + BBH, c1, c2)) : '#241a3c',
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
  tab(SHX, SHW, 'SHOP', .82, cb ? hsl(268, 62, 52 + 7 * sin(TIME * 5)) : '#2b1c48', cb ? '#d8bcff' : '#5a4488', cb ? '#fff' : '#a08ecb');
  tab(DGX, DGW, '+$' + DBG, .68, '#3a2a14', '#c8912f', '#e8b64d', 1);
  tab(RSX, RSW, rstArm > 0 ? 'SURE?' : 'RST', .64, rstArm > 0 ? '#8e1b33' : '#3a1620', '#d4577a', rstArm > 0 ? '#fff' : '#e0788f', 1);

  txt(VER, W - FS * 2.6, TOP / 2 + FS * .06, FS * .72, '#9683c4', 'right');
  spk(W - FS * 1.4, TOP / 2, FS * .5, !G.mu);

  const n = BBX.length;
  if (n > 2) btn(BBX[0], 'CUT', 'drop last ring', stack.length > 0, bad >= 0, '#e0913a', '#b0621f');
  btn(BBX[n - 2], 'SCRAP', stack.length ? 'start over' : 'nothing to scrap', stack.length > 0, bad >= 0 && n < 3, '#8a5fd6', '#5b3fa8');
  btn(BBX[n - 1], 'SELL  $' + PAY, done ? 'rainbow complete!' : 'finish the rainbow', done, 0, '#39c47c', '#1f9e8e');

  if (rush > 0) { X.fillStyle = hsl(TIME * 260 % 360, 100, 62, .06); X.fillRect(FX, TOP, W - FX, FH) }
  if (banT > 0) txt(banS, FX + (W - FX) / 2, TOP + FH * .2, FS * 1.6,
    hsl(TIME * 220 % 360, 92, 74, min(banT / .45, 1)), 'center', 'bold');
  hint();

  FLT.forEach(f => { X.globalAlpha = 1 - f.l / 1.2; txt(f.s, f.x, f.y, FS * 1.3, f.c, 'center', 'bold') });
  X.globalAlpha = 1;
};

const drawShop = () => {
  X.fillStyle = '#0b0618cc'; X.fillRect(0, 0, W, H);
  plate(SPX, SPY, SPW, SPH, 14, '#1d1234', '#4b3577', 2);

  const top = SPY + SHH, vh = SPH - SHH - FS * .9, pad = FS * .5, cw = SPW / SCOL;
  sscr = clamp(sscr, 0, smax);
  X.save(); X.beginPath(); X.rect(SPX, top, SPW, vh); X.clip();
  for (let i = 0; i < UP.length; i++) {
    const y = top + flr(i / SCOL) * SRH - sscr, x = SPX + (i % SCOL) * cw;
    if (y > top + vh || y + SRH < top) continue;
    const mx = upMax(i), c = upCost(i), ok = !mx && G.m >= c;
    plate(x + pad * .55, y + pad * .35, cw - pad * 1.1, SRH - pad * .7, 8,
      mx ? '#231a3a' : ok ? '#2c1c4e' : '#1e1533', ok && '#7ce38b88');
    const tx = x + pad * 1.6, cy = y + SRH / 2, rx = x + cw - pad * 1.6;
    // Levels are pips on the second line, hard right; the name and the
    // description are handed whatever width is left over as fillText's maxWidth,
    // so a narrow column condenses its text instead of spilling into the
    // neighbouring card.
    const n = UP[i][2].length, pw = FS * .62;
    txt(UP[i][0], tx, cy - FS * .68, FS * .94, mx ? '#9d8bc6' : '#fff', 'left', 'bold', rx - tx - FS * 3.4);
    txt(mx ? 'MAX' : '$' + c, rx, cy - FS * .68, FS * 1, mx || ok ? '#7ce38b' : '#6d5c93', 'right', 'bold');
    txt(upDesc(i), tx, cy + FS * .62, FS * .66, '#a794cf', 'left', 0, max(FS, rx - tx - n * pw));
    for (let k = 0; k < n; k++) {
      X.fillStyle = k < G.u[i] ? '#ffcf5c' : '#4a3a70';
      dot(rx - (n - 1 - k) * pw, cy + FS * .62, pw * .3);
    }
  }
  X.restore();

  plate(SPX, SPY, SPW, SHH, 14, '#1d1234');
  txt('UPGRADES', SPX + FS, SPY + SHH / 2, FS * 1.12, '#ff9fd6', 'left', 'bold');
  txt('$' + G.m, SPX + SPW - FS * 3, SPY + SHH / 2, FS * 1.12, '#7ce38b', 'right', 'bold');
  X.lineCap = 'round';
  strk('#b79ee0', max(2, FS * .16));
  const q = FS * .42;
  cross(SPX + SPW - FS * 1.4, SPY + SHH / 2, q, q); X.stroke();
  if (smax > 0) {
    X.fillStyle = '#5a4488';
    const bh = vh * vh / (SROW * SRH);
    X.fillRect(SPX + SPW - 5, top + (sscr / smax) * (vh - bh), 3, bh);
  }
};

// --- overlays: hints, title, ending ---------------------------------------
// Shared attract pulse for every 'do this next' line on screen.
const pul = () => abs(sin(TIME * 3));
const blink = () => hsl(50, 100, 76, .45 + .55 * pul());
// Each hint waits for the action it teaches and never comes back: G.h is saved.
// Two of the three name a control, which is a key on a desktop and a button on a
// phone, so they are built from TCH rather than stored.
const hint = () => {
  if (G.h > 2 || shopOn) return;
  const s = G.h
    ? G.h > 1
      ? canBuy() && (TCH ? 'tap SHOP' : 'press B') + ' to spend your money'
      : bad >= 0 && (TCH ? 'tap SCRAP' : 'press X') + ' to start over'
    : 'catch the RED ring on your horn';
  if (!s) return;
  // The line sits just above the button bar, which is exactly where the pale cloud
  // bank and the unicorn are, and pale yellow on pale lilac was unreadable. Set the
  // font first so measureText matches what txt is about to draw, then lay a dark
  // pill under it - guessing a width from the character count would not survive
  // switching between the key and the button wording.
  const sz = FS * .88, hx = FX + (W - FX) / 2, hy = BBY - FS * 1.45;
  fnt(X, sz, 'bold');
  const hw = X.measureText(s).width + sz * 1.5, hh = sz * 1.9;
  plate(hx - hw / 2, hy - hh / 2, hw, hh, hh / 2, '#0b0618d4', '#ffffff20');
  txt(s, hx, hy, sz, blink(), 'center', 'bold');
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

// Both title words are drawn, not stored: seven letters each, so each word runs
// straight through the seven rainbow hues, one per letter. Every letter is four
// nested outlines with a bloom behind it - neon tubing, which is the look of the
// artwork the title was designed from.
//
// The nesting comes from stroking the glyph at shrinking widths and punching every
// other pass straight back out. That needs a canvas of its own: 'destination-out' on
// the real one would take the sky with it. The glows go on last with
// 'destination-over' so they slide underneath instead of being punched too.
// rev runs the rainbow the other way, so the two words mirror each other instead of
// repeating the same left-to-right ramp twice.
const neon = (q, s, cx, cy, sz, rev) => {
  const hu = i => rev ? NR - 1 - i : i;
  fnt(q, sz, 'bold');
  q.textAlign = 'center'; q.textBaseline = 'middle'; q.lineJoin = 'round';
  // Letters are placed one at a time, so the word has to be measured by hand:
  // each glyph's own width plus a fixed gap, centred on the whole run.
  const L = [...s], gp = sz * .07, ws = L.map(c => q.measureText(c).width);
  const tw = ws.reduce((a, w) => a + w + gp, -gp);
  const px = i => { let x = cx - tw / 2; for (let k = 0; k < i; k++) x += ws[k] + gp; return x + ws[i] / 2 };
  L.forEach((c, i) => {
    q.strokeStyle = RC(hu(i), 24);
    for (let k = 4; k--;) {
      const lw = sz * (.028 + k * .05);
      q.globalCompositeOperation = 'source-over'; q.lineWidth = lw; q.strokeText(c, px(i), cy);
      q.globalCompositeOperation = 'destination-out'; q.lineWidth = lw - sz * .015; q.strokeText(c, px(i), cy);
    }
  });
  q.globalCompositeOperation = 'destination-over';
  q.shadowBlur = sz * .5;
  L.forEach((c, i) => { q.shadowColor = RC(hu(i), 14); q.fillStyle = RC(hu(i), 4, .3); q.fillText(c, px(i), cy) });
  q.shadowBlur = 0; q.globalCompositeOperation = 'source-over';
};
// Rebuilt only when the size changes; the title screen redraws every frame for the
// pulsing PLAY button and the walking unicorn.
let TT = 0, TTS = 0, TTW = 0;

const drawTitle = () => {
  X.fillStyle = '#0b0618c8'; X.fillRect(0, 0, W, H);
  const ts = min(W * .143, H * .108);
  if (TTS != ts || TTW != W) {
    TTS = ts; TTW = W;
    TT = document.createElement('canvas');
    TT.width = W; TT.height = ts * 3.1;
    const q = TT.getContext('2d');
    neon(q, 'UNICORN', W / 2, ts * .9, ts);
    neon(q, 'FACTORY', W / 2, ts * 2.15, ts, 1);
  }
  // Blurred additive pass first, crisp tubing on top: that is what makes it read as
  // lit rather than merely outlined.
  const y0 = H * .13 - ts * .9;
  X.save();
  X.globalCompositeOperation = 'lighter'; X.filter = 'blur(' + ts * .1 + 'px)';
  X.drawImage(TT, 0, y0);
  X.restore();
  X.drawImage(TT, 0, y0);

  txt('stack the rings, build the rainbow', W / 2, y0 + ts * 2.85, FS * .9, '#a794cf', 'center');

  uni(W / 2, H * .73, min(W * .3, H * .195), TIME, 0, 1, sin(TIME * 2.2) * .6, TIME * 9);

  const [bx, by, bw, bh] = playBtn();
  const hot = IN.x > bx && IN.x < bx + bw && IN.y > by && IN.y < by + bh;
  plate(bx, by, bw, bh, 10, hot ? '#4bd68f' : grad(bx, by, bx + bw, by + bh, '#39c47c', '#1f9e8e'),
    hsl(0, 0, 100, .25 + .3 * pul()), 2);
  txt('PLAY', W / 2, by + bh / 2, FS * 1.5, '#fff', 'center', 'bold');

  txt('Made for JS13KGames', FS, H - FS * 1.1, FS * .78, '#7c6aa8', 'left');
  txt('By Infernet89', W - FS, H - FS * 1.1, FS * .78, '#7c6aa8', 'right');
};

const drawEnd = () => {
  const a = clamp((endT - 3.4) / .8, 0, 1);
  if (a <= 0) return;
  X.globalAlpha = a;
  const w = min(W * .88, 410), h = min(H * .82, 350), x = (W - w) / 2, y = (H - h) / 2, p = FS * 1.5;
  X.fillStyle = '#0b0618d8'; X.fillRect(0, 0, W, H);
  plate(x, y, w, h, 16, '#1d1234', '#7a58b8', 2);
  txt('THE BRIDGE IS DONE', W / 2, y + h * .13, FS * 1.2, '#ff9fd6', 'center', 'bold');
  [['unicorns sold', G.sold], ['scrapped', G.junk], ['best streak', G.bst],
   ['upgrades', upTot()],
   ['time', flr(G.tm / 60) + 'm ' + (flr(G.tm) % 60) + 's']].forEach((r, i) => {
    const ry = y + h * (.32 + i * .115);
    txt(r[0], x + p, ry, FS * .84, '#a794cf', 'left');
    txt('' + r[1], x + w - p, ry, FS * .96, '#fff', 'right', 'bold');
  });
  txt((TCH ? 'tap' : 'click') + ' to keep playing', W / 2, y + h * .93, FS * .88, blink(), 'center', 'bold');
  X.globalAlpha = 1;
};
