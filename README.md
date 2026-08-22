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
| `1_core.js` | canvas handle, input state, drawing primitives |
| `2_data.js` | palette, tuning constants, upgrade table |
| `3_game.js` | state, economy, simulation, apprentice AI, save/load |
| `4_art.js` | procedural art: unicorn, ring, cloud, star |
| `5_scene.js` | responsive layout and everything inside the play field |
| `6_ui.js` | order sidebar, top bar, action buttons, upgrade panel |
| `7_audio.js` | WebAudio synth |
| `8_main.js` | resize, click/key routing, game loop, frame composition |

Terser strips comments, so comments in `src/` cost nothing in the shipped zip — explain freely.

## Controls

| | |
|---|---|
| move | mouse / drag, or arrows / A-D |
| sell | SPACE, or the SELL button |
| scrap | X, or the SCRAP button |
| cut last ring | C, or the CUT button (needs Horn Saw) |
| shop | B or Esc, or the SHOP button |
