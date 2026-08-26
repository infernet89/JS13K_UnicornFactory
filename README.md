# Unicorn Factory

My entry for JS13KGames 2026 — theme: **Unicorns and Rainbows**. Catch falling rings on a unicorn's horn and stack them into a correct rainbow, then sell it and spend the money on upgrades. Pure canvas, no assets, no libraries.

## Dev

```
node tools/serve.js      # http://localhost:8137  (serves src/ unminified)
npm run build            # -> dist/game.zip  (terser + roadroller + 7z deflate)
npm run fast             # build skipping roadroller
```

`src/*.js` are plain scripts concatenated in the order listed in `src/index.html`,
then wrapped in an IIFE at build time, so nothing leaks to the global scope.

## Storage

js13kgames.com serves every entry from one origin, so **all entries share one
localStorage**. Two rules follow, and both are competition requirements:

- The key is namespaced: `KEY = 'unicornfactory13k'` in `3_game.js`. Never shorten it
  to something generic that another entry could pick too.
- **Never call `localStorage.clear()`** — it would wipe every other game's save. Touch
  only `localStorage[KEY]`; the debug reset uses `delete localStorage[KEY]`.

The same goes for throwaway test snippets run in the console: use
`localStorage.removeItem(KEY)`, not `clear()`.

The version badge next to the mute button comes from `VER` in `src/2_data.js` — bump it on every hand-off so it is obvious which build is loaded.

**Remove before submission:** the `VER` badge and the two dashed debug buttons, `+$500` and `RST` (`DBG` in `src/2_data.js`, `dbgReset` in `src/3_game.js`, drawn in `drawUI`, handled in `click`).

**Keep in the release:** the Konami code (`KON` in `8_main.js`) — up up down down left
right left right B A pays $99999. It is a deliberate easter egg, not debug scaffolding.

## Measuring size

`npm run build` is **not deterministic**: roadroller's `optimize(1)` is a randomised
search, so the same source varies by roughly 7 bytes between runs. Never judge a small
change by one build.

To compare two versions of the source, use `npm run fast` and read the `js minified`
line instead — terser is deterministic, so that number is a clean signal.

Beware that the two numbers can disagree sharply. Folding six repeated fill-and-stroke
blocks into `plate()` cut 208 bytes of minified source but changed the zip by about
nothing, because roadroller was already modelling the repetition away. Deduplicating
source is worth doing for maintainability; expect it to buy no space. Real space comes
from deleting data and logic outright.

## Layout

| file | role |
|---|---|
| `1_core.js` | canvas handle, input state, drawing primitives |
| `2_data.js` | palette, tuning constants, upgrade table |
| `3_game.js` | state, economy, simulation, apprentice AI, save/load |
| `4_art.js` | procedural art: unicorn, ring, cloud, star |
| `5_scene.js` | responsive layout and everything inside the play field |
| `6_ui.js` | order sidebar, top bar, action buttons, upgrade panel, overlays |
| `7_audio.js` | WebAudio synth |
| `8_main.js` | resize, click/key routing, screen routing, game loop, frame composition |

## Screens

`scr` in `3_game.js` drives them: `0` title, `1` playing, `2` ending.

The ending fires once, on the sale that reaches `BRG` (`G.sold == BRG`, so it cannot
retrigger), and runs in two phases:

1. **Exodus**, timed by `bye` up to `exo()` = `FLYT + APP.length * .12`. Every unicorn
   rides out on the ordinary sale flyaway, staggered, the player last. `pose()` returns
   `e = 0` while `scr == 2`, which is what stops them running back in.
2. **Finale**, timed by `endT`, which only starts once `bye` reaches `exo()` — so the
   rider, the cascade and the stats card keep their original timings unchanged.

Seven riders coast down the finished bridge during the finale. `RID` in `5_scene.js`
holds `[start, duration, size]` per rider, rolled once when the ending fires (reset to
`0` in `gain()`, rebuilt lazily) with a random gap after the one before. Two things
that are easy to get wrong:

- each rider's progress `u` is **not** clamped, and it is skipped once `u >= 1`. The
  earlier single rider used `min(endT / 3.4, 1)` and so sat parked at the far foot of
  the bridge for the rest of the ending.
- their size comes from the bridge radius (`min(US, brR() * .27)`), not from `US`. On a
  tall phone the arc is under half its desktop radius, and `US`-sized riders piled up
  on top of each other at the apex. The expression is a no-op on a desktop window.

Clicking after `endT > 4.2` returns to play; the flyaway timers reset themselves on the
next tick and everyone walks back on.

The ending backdrop is the old Solitaire win cascade in rainbows: `bounce()` in
`5_scene.js` launches little rainbow arcs that fall, bounce off the cloud line and get
stamped into `TC`, an offscreen canvas that is never cleared — that is where the trail
comes from, since the real frame is cleared every tick. `TC` is blitted right after
`drawBg()` so it stays behind the bridge and the unicorns, is cleared when the ending
starts, and is dropped on the way out so a full-screen canvas is not held forever.

`BRG` in `2_data.js` is the run length: 130 sales is about 9-10 minutes now that the
upgrades are affordable enough to be bought (it was 13-14 before the rebalance, because
the player stayed slow). It also sets the money budget for the whole game — see Economy.
`MILE` lists the sales that earn a banner.

The title screen is full-screen rather than a card: logotype up top, unicorn in the
middle, PLAY at the bottom, credits in the corners. Only the PLAY button starts the run;
its rect comes from `playBtn()`, used by both the drawing and the hit test so they cannot
drift apart.

## The title lettering

Both words are drawn, not stored. Each is seven letters long, so each runs straight
through the seven rainbow hues one letter at a time, and every letter is four nested
outlines with a bloom behind it — neon tubing, matching the artwork in `COLLATERALS/`
that the title was designed from.

- The nesting comes from stroking the glyph at shrinking widths and punching every other
  pass straight back out with `destination-out`. That needs a canvas of its own, or the
  punches take the sky with them.
- The glows go on **last**, with `destination-over`, so they slide underneath rather than
  being punched out along with everything else.
- `drawTitle` then blits that canvas twice: a blurred additive pass, then the crisp one
  on top. The blurred pass is what makes it read as lit rather than merely outlined.
- Cached in `TT`, rebuilt only when the size changes, because the title screen redraws
  every frame for the pulsing PLAY button and the walking unicorn.

The supplied artwork itself cannot ship. The whole game is about 11.8 KB and the smallest
legible copy of that image costs roughly 7.9 KB in the zip. Three measured dead ends, so
nobody repeats them:

- **With an alpha channel it costs 7.5 KB minimum**, even at an illegible 160 px, because
  Chrome's `toDataURL('image/webp', q)` silently ignores the quality argument for images
  that have alpha and encodes them losslessly.
- **Changing the page background to suit it does not help.** White and its soft gradients
  cost more to encode than black.
- **Decomposing it** — a 1-bit mask of the letter shapes, rings rebuilt by erosion, glow
  as gradients — does fit, at about 1.3 KB, and was working at 13,190 bytes. It was
  dropped for the fully procedural version above, which costs a third of that and needs
  no asset pipeline.

One thing worth knowing about that artwork: it carries **both words superimposed**. The
crisp nested rings spell FACTORY and the soft blobs behind them spell UNICORN. Any
compressed copy eats the thin rings first and ends up reading as UNICORN alone.

`bank(r0, dy, col, sd, dip, fl)` draws one scalloped cloud edge. Three of its
parameters exist because of bugs that were measured, not guessed:

- the bump **count** is derived from `r0` (`flr(W / r0) + 2`), never fixed. Shrinking
  the radius for distance while keeping the spacing left the far terrace 53% open sky.
- `dip` is how far the valleys between bumps fall below the nominal line. Keep it near
  zero on the terraces, or an apprentice standing in a valley has nothing under it.
- `fl` flattens the bumps into ellipses. Width has to stay large so neighbours overlap,
  but a circular bump that wide is tall enough to swallow the gap between terraces and
  merge them into one mass.

`sd` seeds each bank separately; without it every terrace shared one silhouette.

To check for holes, render `drawBg()` and sample pixels just below each apprentice hoof
line (`UY - US * (.34 + i * .075)`): dark means sky, and sky there means floating.

`TER` in `5_scene.js` lists the cloud terraces stepping up behind the player, in
unicorn-heights above the hoof line. They exist so the apprentices — which stand higher
the further back they are — have something under their hooves; keep them lined up with
`aUy()`, which is `.34 + i * .075`. They are drawn far to near before the main bank, so
each unicorn ends up in front of its own terrace and never overlaps a nearer one.

The sold counter shows `SOLD n / BRG` until the target is met, then just `SOLD n`.
It is hidden below `W > FS * 32`, so on a narrow phone it does not appear at all.

## Shop

Nine upgrades. The panel sizes itself to the window in `layout()` and only falls back
to scrolling when it truly cannot fit — eleven items in one fixed-height column used to
force a scrollbar even on a 1080p desktop:

- `SCOL` = `clamp(flr(W * .94 / (FS * 15)), 1, 3)`. Because `FS` is `min(W, H) / 30`,
  the test reduces to an aspect ratio: a portrait window always gets one column, and a
  second column needs roughly `W >= 1.06 * H`. Three columns need a wide desktop or a
  phone held sideways.
- `SROW` follows from `SCOL`, then `SRH` is the ideal `FS * 3.9` squeezed down to
  whatever the height allows, with a floor of `FS * 2.8` — below that a card cannot hold
  its two lines of text.
- `SPH` is then exactly the height of the grid, so **`smax` is 0** and the scrollbar is
  hidden at every ordinary window size. It only goes positive once `SRH` has hit its
  floor and the rows still overflow (measured: 240x180, the `resize()` minimum).

Measured, all with `smax == 0`: 1920x1080 → 3x3, 768x1024 → 2x5, 375x812 → 1x9,
812x375 (phone on its side) → 3x3. Nine tiles a three-column grid exactly; the
two-column case leaves one empty slot, which is why the count wants to be 9 or 12 and
not something in between.

Card text is drawn with the `mw` argument of `txt`, which is `fillText`'s own
`maxWidth`: the name and the description are given whatever the price and the level pips
leave them, and the canvas condenses the glyphs rather than spilling into the next
column. Nothing needs to know how wide a string is.

The hit test in `click` mirrors the grid — row from `y`, column from `x`, `i = r * SCOL + c`
— and the last row's empty slots fall out because `i < UP.length` fails.

### Always on, not for sale

The **aim glint** and **auto-sell** were upgrades and are now free from the first frame.
Both were $5-and-$65 non-decisions bought once and forgotten, and both were really
usability rather than power: the glint tells you the ring is lined up, and pressing
SPACE on a stack that is unambiguously finished is busywork. Charging for either made
the first minute worse, which is the only minute a competition judge is guaranteed to
play. `U_AIM` and `U_AUT` are gone; the two gates in `3_game.js` are now unconditional.

SPACE still sells, half a second before auto-sell would — it is the hurry-up key, not
the only way out. The middle tutorial hint moved with the change: it used to read
"press SPACE to sell it" and fired on `done`, so after auto-sell went free it flashed
for four frames and taught nothing. It now fires on `bad >= 0` and teaches the recovery
from a ruined stack, which is the thing new players actually get stuck on.

## Hints and the control scheme

Two of the three hints, and the line on the end card, name a control — and the control
is a key on a desktop and an on-screen button on a phone. They are built at draw time
from `TCH` in `1_core.js` rather than stored as strings:

| | `TCH == 0` | `TCH == 1` |
|---|---|---|
| ruined stack | press X to start over | tap SCRAP to start over |
| money to spend | press B to spend your money | tap SHOP to spend your money |
| end card | click to keep playing | tap to keep playing |

`TCH` is set from `pointerdown`'s `pointerType` (anything that is not a mouse counts as
touch, so a stylus gets button wording) and cleared by any `keydown`. Deliberately not a
`(pointer:coarse)` media query: that calls a touchscreen laptop a phone for as long as
its owner keeps typing, whereas the last-input test follows whatever they are actually
holding. It is always correct by the time it matters, because the player has to tap or
click PLAY before any hint that names a control can appear.

Anything new that names a key has to go through `TCH` too.

The line is drawn on a dark pill, because it sits just above the button bar — which is
exactly where the pale cloud bank and the unicorn are, and pale yellow on pale lilac was
unreadable. `hint()` sets the font itself so `measureText` matches what `txt` is about
to draw, then sizes the pill from that: guessing a width from the character count would
not survive switching between the key and the button wording, which differ by six
characters.

## Economy

The one number to know: **a 130-sale run pays out about $1150, and almost nothing you do
to the price table changes that.** Income is `PAY` per sale plus the streak bonus and the
rush multiplier, and the run is a fixed number of *sales* — so cheaper upgrades buy a
shorter run, never a richer one. Measured over six runs spanning expert to sloppy play,
total income landed between $1126 and $1222 while the clock ran from 9.1 to 10.7 minutes.

That makes the tree total the real design knob, and it must come in under ~$1150. The
tree costs **$1102** across 29 levels. Before the rebalance it cost $4851, which is why
the finale used to arrive with two of six apprentices bought and the screen half empty —
the most spectacular thing in the game was mostly unseen at the exact moment it should
have paid off.

Consequences worth knowing before touching the prices:

- 29 levels against a $1150 budget forces an average level cost of $40 and gentle curves
  (about 2x per level, not the 3.5x the old table used). Steeper curves and a completable
  tree cannot both fit. Fewer levels is the only way to buy back steepness.
- The same arithmetic sets the purchase rhythm at roughly one every twenty seconds. That
  is not tunable through prices either.
- Raising `PAY` does nothing to pacing: gap = price / rate, and `PAY` scales both.
- To make the run *longer* rather than richer, raise `BRG`. It is the budget.

Measured with an auto-player driven headlessly through `upGame(dt)` at 1/60 (target the
nearest needed ring, weave around wrong ones, buy the cheapest affordable upgrade after
every sale). The last level lands around sale 118-127 of 130 at every skill level, so the
tree completes in the final stretch rather than at the finale or long before it.

Calibration's fourth tier used to cost $9999 — unreachable, a joke that read as a bug
once everything else became completable. It is now $110 for 88%, the dearest single
purchase and usually the last one bought.

Terser strips comments, so comments in `src/` cost nothing in the shipped zip — explain freely.

## Shared helpers

Places where one definition serves many callers — change them here, not at the call sites.

| helper | file | covers |
|---|---|---|
| `plate` | `1_core.js` | every filled rounded rect with an outline: pills, buttons, panels |
| `strk` | `1_core.js` | colour + width + `beginPath` for every stroked shape; the caller strokes |
| `seg` / `cross` | `1_core.js` | a line, and an X on its own ellipse: mistake marker, shop close, muted speaker |
| `fnt` / `txt` | `1_core.js` | all canvas text; `fnt` takes the context, since the title builds on one of its own. `txt`'s last argument is `fillText`'s `maxWidth`, used by the shop |
| `hsl` | `1_core.js` | every computed colour. Nothing builds an `hsl(...)` string by hand any more |
| `tapped` | `1_core.js` | consume the pending tap; whoever reads it first gets it |
| `pt` | `5_scene.js` | the only particle constructor; `burst`/`puff`/`ringPT` all go through it |
| `rotAt` | `5_scene.js` | rotate the canvas about a point (caller restores) |
| `drawUnit` | `5_scene.js` | one unicorn plus its ring tower — the player and every apprentice |
| `launch` / `aLaunch` | `3_game.js` | arm the flyaway; the only place the four `fly*` fields are written |
| `away` | `3_game.js` | which edge a unicorn leaves by — whichever one it is already nearest |
| `blink` / `pul` | `6_ui.js` | the attract pulse behind every 'do this next' cue, sidebar halo included |
| `KB` | `8_main.js` | edge-triggered keyboard shortcuts; a new one is a single row |
| `SK` | `3_game.js` | the list of saved scalars; a new counter is added here only |
| `upTot` | `3_game.js` | how built-up the factory is (music layers, end-screen tally) |

`drawUnit` takes sixteen positional arguments and that is deliberate: the player keeps
its state in globals and an apprentice keeps the same state in an object, so loose values
are the only thing both can hand over. The last four are exactly the fields `aLaunch`
writes.

`frame()` in `8_main.js` steps one of the three screens and then draws once at the
bottom. The world, the sidebar and the top bar are common to playing and the ending, so
they are written once rather than in every branch; only the overlay on top differs.

`layout()` runs twice at boot on purpose. `resize()` has to give `load()` a field to
place the saved apprentices in, and `load()` can restore the Horn Saw, which adds a third
button to the bar — so the bar has to be measured again afterwards.

## Controls

| | |
|---|---|
| move | mouse / drag, or arrows / A-D |
| sell | automatic; SPACE or the SELL button sells half a second sooner |
| scrap | X, or the SCRAP button |
| cut last ring | C, or the CUT button (needs Horn Saw) |
| shop | B or Esc, or the SHOP button |
