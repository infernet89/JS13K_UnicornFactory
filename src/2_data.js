const VER = 'v0.20';

// Rainbow palette, one entry per ring colour, bottom of the horn first.
const HUE = [354, 24, 52, 128, 190, 248, 305];
const SAT = [88, 92, 95, 68, 85, 72, 80];
const LIT = [58, 48, 65, 46, 56, 55, 64];
const NR = HUE.length;
const RC = (i, d, a) => hsl(HUE[i], SAT[i], LIT[i] + (d || 0), a);

// Geometry, in unicorn-heights above the hooves.
const HORN = 1.69;   // horn tip, i.e. the catch line
const LNA = .17;     // radians of body tilt at full running speed

// Sale flyaway, as fractions of FLYT.
const FLYT = 1.05, FLY_UP = .62, FLY_IN = .44;

const PAY = 5;       // dollars per unicorn
const ASPD = .7;     // apprentice speed, relative to the player
const AGAP = 2.2;    // seconds between an apprentice's guaranteed rings
const DBG = 500;     // debug button payout

// Upgrades: name, description, and the cost of each level. The number of costs
// is the max level. '@' in a description is replaced by the matching UV entry
// for the next level. Prices are fitted to a measured income curve so the wait
// for the next upgrade starts near half a minute and grows gradually to minutes.
const U_AIM = 0, U_CAL = 1, U_SAW = 2, U_MAG = 3, U_WRD = 4, U_OVR = 5, U_RATE = 6, U_STK = 7, U_AUT = 8, U_APP = 9;
const UP = [
  ['Aim Glint', 'horn flashes when your ring lines up', [5]],
  ['Calibration', 'the colour you need falls @% of the time', [7, 22, 125, 9999]],
  ['Horn Saw', 'cut off just the last ring', [10]],
  ['Colour Magnet', 'the ring you need drifts to your horn', [18, 60, 230]],
  ['Colour Ward', 'wrong rings sidestep the horn @', [45, 145, 425]],
  ['Overdrive', 'rings fall @% faster, so money lands sooner', [26, 110, 310]],
  ['Overtime', 'the whole factory drops @% more rings', [50, 160, 475]],
  ['Perfect Streak', 'clean sales pay up to +$@ extra', [14, 90, 265]],
  ['Auto Sell', 'finished unicorns sell themselves', [65]],
  ['Apprentice', 'one more helper unicorn behind you (@ total)', [32, 75, 195, 365, 600, 800]]
];
const UV = [0, [42, 55, 65, 75, 99.99], 0, 0, ['', 'at the last moment', 'well ahead', 'half a screen ahead'], [0, 25, 55, 90], [0, 30, 65, 110], [0, 3, 6, 9], 0, [0, 1, 2, 3, 4, 5, 6]];

const MAGR = [0, 1, 1.7, 2.6], MAGP = [0, .3, .5, .75];   // magnet radius (unicorn-heights), pull (field-widths/s)
const WRDH = [0, .12, .28, .5];                           // ward trigger height, fraction of the field
const OVR = [1, 1.25, 1.55, 1.9];                         // fall speed multiplier
const RATE = [1, 1.3, 1.65, 2.1];                         // spawn rate multiplier, players and helpers alike
