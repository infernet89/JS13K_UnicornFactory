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
| `6_ui.js` | order sidebar, top bar, action buttons, upgrade panel |
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

`BRG` in `2_data.js` is the run length: 130 sales is about 14 minutes of good play.
`MILE` lists the sales that earn a banner.

The title screen is full-screen rather than a card: name up top, unicorn in the middle,
PLAY at the bottom, credits in the corners. Only the PLAY button starts the run; its
rect comes from `playBtn()`, used by both the drawing and the hit test so they cannot
drift apart.

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

Terser strips comments, so comments in `src/` cost nothing in the shipped zip — explain freely.

## Shared helpers

Places where one definition serves many callers — change them here, not at the call sites.

| helper | file | covers |
|---|---|---|
| `plate` | `1_core.js` | every filled rounded rect with an outline: pills, buttons, panels |
| `pt` | `5_scene.js` | the only particle constructor; `burst`/`puff`/`ringPT` all go through it |
| `rotAt` | `5_scene.js` | rotate the canvas about a point (caller restores) |
| `drawUnit` | `5_scene.js` | one unicorn plus its ring tower — the player and every apprentice |
| `KB` | `8_main.js` | edge-triggered keyboard shortcuts; a new one is a single row |
| `SK` | `3_game.js` | the list of saved scalars; a new counter is added here only |
| `upTot` | `3_game.js` | how built-up the factory is (music layers, end-screen tally) |

## Controls

| | |
|---|---|
| move | mouse / drag, or arrows / A-D |
| sell | SPACE, or the SELL button |
| scrap | X, or the SCRAP button |
| cut last ring | C, or the CUT button (needs Horn Saw) |
| shop | B or Esc, or the SHOP button |
