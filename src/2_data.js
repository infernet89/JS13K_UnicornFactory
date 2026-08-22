const HUE = [354, 24, 52, 128, 190, 248, 305];
const SAT = [88, 92, 95, 68, 85, 72, 80];
const LIT = [58, 48, 65, 46, 56, 55, 64];
const NR = 7;
const PAY = 5;
const DBG = 500;
const RC = (i, d, a) => hsl(HUE[i], SAT[i], LIT[i] + (d || 0), a);

const U_AIM = 0, U_CAL = 1, U_SAW = 2, U_MAG = 3, U_WRD = 4, U_STK = 5, U_AUT = 6, U_APP = 7;
const UP = [
  ['Aim Glint', 'horn flashes when your ring lines up', 8, 1, 1],
  ['Calibration', 'the colour you need falls @% of the time', 15, 2.8, 4, [15, 42, 117, 9999]],
  ['Horn Saw', 'cut off just the last ring', 25, 1, 1],
  ['Colour Magnet', 'the ring you need drifts to your horn', 40, 2.6, 3],
  ['Colour Ward', 'rings of the wrong colour veer away', 60, 2.8, 3],
  ['Perfect Streak', 'clean sales pay up to +$@ extra', 55, 2.7, 3],
  ['Auto Sell', 'finished unicorns sell themselves', 80, 1, 1],
  ['Apprentice', 'one more helper unicorn behind you (@ total)', 200, 3, 4]
];
const UV = [0, [42, 55, 65, 75, 99.99], 0, 0, 0, [0, 3, 6, 9], 0, [0, 1, 2, 3, 4]];
const ASPD = .7, AGAP = 3.2;
const MAGR = [0, 1, 1.7, 2.6], MAGP = [0, .3, .5, .75];
const WRDR = [0, .9, 1.4, 2.1], WRDP = [0, .3, .5, .75];
