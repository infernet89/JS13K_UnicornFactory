let AC = 0;
const au = () => {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { AC = 0 } }
  if (AC && AC.state == 'suspended') AC.resume();
};
const tone = (f, d, ty, v, f2, dl) => {
  if (!AC || G.mu) return;
  const t = AC.currentTime + (dl || 0), o = AC.createOscillator(), g = AC.createGain();
  o.type = ty; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(1e-4, t);
  g.gain.exponentialRampToValueAtTime(v, t + .012);
  g.gain.exponentialRampToValueAtTime(1e-4, t + d);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .03);
};
const arp = (ns, sp, ty, v, d) => ns.forEach((f, i) => tone(f, d, ty, v, 0, i * sp));
const SC = [523, 587, 659, 784, 880, 988, 1175];
const sGood = n => { tone(SC[n - 1], .17, 'triangle', .09); tone(SC[n - 1] * 2, .1, 'sine', .04, 0, .01) };
const sBad = () => { tone(180, .3, 'sawtooth', .07, 70); tone(92, .34, 'square', .05, 45) };
const sDone = () => arp([784, 988, 1175, 1568], .07, 'triangle', .08, .5);
const sSell = () => { arp([1047, 1319, 1568, 2093], .055, 'sine', .09, .35); tone(660, .12, 'square', .04, 1320) };
const sScrap = () => { tone(420, .28, 'sawtooth', .06, 90); tone(210, .3, 'triangle', .045, 60, .04) };
const sCut = () => { tone(880, .07, 'square', .035, 520); tone(300, .12, 'triangle', .035, 180, .05) };
const sApp = n => { tone(SC[n - 1] * 1.5, .07, 'sine', .028) };
const sBuy = () => arp([659, 880, 1319], .05, 'triangle', .07, .3);
