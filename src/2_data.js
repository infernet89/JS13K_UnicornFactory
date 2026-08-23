const VER = 'v0.43';

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
const BRG = 130;     // unicorns sold to finish the rainbow bridge
const MILE = [10, 30, 60, 100];   // sales that earn a banner
const RUSHT = 7;     // seconds a rainbow rush lasts

// Upgrades: name, description, and the cost of each level. The number of costs
// is the max level. '@' in a description is replaced by the matching UV entry
// for the next level. Prices are fitted to a measured income curve so the wait
// for the next upgrade is about half a minute and settles around twenty seconds.
// The aim glint and auto-sell used to be bought here; both are now always on.
// Read in reading order: row one is control, row two is help hitting the ring,
// row three is throughput - which is also roughly cheapest to dearest.
// The whole tree costs $1102 against the ~$1150 a 130-sale run pays out, so the
// last level lands around sale 120 whatever the player's skill. See the README:
// that budget is fixed by BRG, not by these prices - income per sale barely moves,
// so cheaper upgrades buy a shorter run, never a richer one.
const U_SPD = 0, U_SAW = 1, U_CAL = 2, U_MAG = 3, U_WRD = 4, U_STK = 5, U_OVR = 6, U_RATE = 7, U_APP = 8;
const UP = [
  ['Fleet Hooves', 'gallop @% faster across the factory floor', [7, 18, 40]],
  ['Horn Saw', 'cut off just the last ring', [9]],
  ['Calibration', 'the colour you need falls @% of the time', [6, 17, 44, 110]],
  ['Colour Magnet', 'the ring you need drifts to your horn', [10, 24, 52]],
  ['Colour Ward', 'wrong rings sidestep the horn @', [14, 30, 66]],
  ['Perfect Streak', 'clean sales pay up to +$@ extra', [9, 21, 47]],
  ['Overdrive', 'rings fall @% faster, so money lands sooner', [12, 26, 56]],
  ['Overtime', 'the whole factory drops @% more rings', [15, 35, 78]],
  ['Apprentice', 'one more helper unicorn behind you (@ total)', [11, 22, 38, 62, 95, 128]]
];
const UV = [[0, 50, 108, 183], 0, [42, 55, 65, 75, 88], 0, ['', 'at the last moment', 'well ahead', 'half a screen ahead'], [0, 3, 6, 9], [0, 25, 55, 90], [0, 30, 65, 110], [0, 1, 2, 3, 4, 5, 6]];

const MAGR = [0, 1, 1.7, 2.6], MAGP = [0, .3, .5, .75];   // magnet radius (unicorn-heights), pull (field-widths/s)
const WRDH = [0, .12, .28, .5];                           // ward trigger height, fraction of the field
const OVR = [1, 1.25, 1.55, 1.9];                         // fall speed multiplier
const RATE = [1, 1.3, 1.65, 2.1];                         // spawn rate multiplier, players and helpers alike
const SPD = [.6, .9, 1.25, 1.7];                        // player top speed, in field-widths per second
