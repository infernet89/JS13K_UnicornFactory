# Unicorn Factory

My entry for JS13KGames 2026 — theme: **Unicorns and Rainbows**. Catch falling rings on a unicorn's horn and stack them into a correct rainbow, then sell it and spend the money on upgrades. Pure canvas, no assets, no libraries.

## Dev

```
node tools/serve.js      # http://localhost:8137  (serves src/ unminified)
npm run build            # -> dist/game.zip  (terser + roadroller + 7z deflate)
npm run fast             # build skipping roadroller
```

`src/*.js` are plain scripts concatenated in the order listed in `src/index.html`.

The version badge next to the mute button comes from `VER` in `src/1_core.js` — bump it on every hand-off so it is obvious which build is loaded.

**Remove before submission:** the `VER` badge and the two dashed debug buttons, `+$500` and `RST` (`DBG` in `src/2_data.js`, `dbgReset` in `src/3_game.js`, drawn in `drawUI`, handled in `click`).

## Layout

| file | role |
|---|---|
| `1_core.js` | canvas, input, number formatting, draw helpers |
| `2_data.js` | rainbow palette, upgrade table |
| `3_game.js` | state, ring spawning, catch/cut/scrap/sell, upgrades, apprentice AI, save/load |
| `4_art.js` | procedural art: unicorn, ring, star |
| `5_view.js` | responsive layout, scene, order sidebar, buttons, upgrade shop |
| `6_audio.js` | WebAudio synth |
| `7_main.js` | resize, click/key routing, game loop |

## Controls

| | |
|---|---|
| move | mouse / drag, or arrows / A-D |
| sell | SPACE, or the SELL button |
| scrap | X, or the SCRAP button |
| cut last ring | C, or the CUT button (needs Horn Saw) |
| shop | B or Esc, or the SHOP button |
