const HUE = [354, 24, 52, 128, 190, 248, 305];
const SAT = [88, 92, 95, 68, 85, 72, 80];
const LIT = [58, 48, 65, 46, 56, 55, 64];
const NR = 7;
const RC = (i, d, a) => hsl(HUE[i], SAT[i], LIT[i] + (d || 0), a);
