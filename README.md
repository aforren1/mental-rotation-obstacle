local devel: `npm run start` (no data saving, but everything else)
(`netlify dev` to try bundled version + netlify fns)

Production test: `npm run build && netlify dev`

## Order of events

1. Title screen
2. Basic instructions (< arrow if flipped, > if normal)
3. Practice (no obstacle)
4. Real deal (read from trial table)

## Notes

- Run `1_gen_block.py` to generate _all_ possible rotations/collisions via Cairo, then `2_gen_block.r` to pick the feasible ones.
- Keep obstacle on the screen-- flash the letter of interest
- Use monospace (same height too? or multiple heights?)
- Fixed 1s ITI
- Correct/incorrect feedback
- Configurable letter, obstacle
- currently 3 repeats x 5 angles x 2 letters x 2 types (mirror/not)
- Fixed-width font (at least for the chars we care about): https://www.dafont.com/instruction.font
- How to detect/quantify overlap?
  - convert to triangles first, then collision? https://stackoverflow.com/questions/50554803/triangulate-path-data-from-opentype-js-using-earcut
  - Offline pixel-by-pixel overlap?

### Trial data/settings:

- mirrored letter (t/f)
- angle of letter (0 - 2pi?) (Sam does -60 - +60)
- position relative to barrier (0 - 2pi?)
- distance from center of barrier (i.e. radius)
- letter (in principle anything, but {F, R} to start)
- obstacle properties? shape, size, ...
-
