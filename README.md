# Motion Prototype V1 — Anushree Jain portfolio

Your approved desktop design, unchanged, with the reference video's motion
language applied on top. Open `index.html` in a browser — no build step.

```
index.html              markup + copy (all text lives here)
css/style.css           layout, calibrated to the comp
js/main.js              the motion layer (GSAP + ScrollTrigger)
artifact.html           single-file build used for the hosted review link
build-artifact.py       regenerates artifact.html from the three files above
assets/
  illustrations/        your artwork + derived layers
  images/               project imagery (PLACEHOLDERS — see below)
  audio/                placeholder track (PLACEHOLDER)
```

## The scale system

Every value in `style.css` is written in design pixels from your 1440-wide
comp, via one unit:

```css
--s: min(calc(100vw / 1440), 1.25px);   /* 1 design px */
width: calc(391 * var(--s));            /* = 391px at 1440 */
```

Nothing is re-laid-out at other widths; the composition scales, and stops
growing past ~1800px. Breakpoints at 1024 and 760 only redefine `--s` and
override the handful of values that must move.

## Tuning the motion

Everything is in the `CONFIG` object at the top of `js/main.js`:

| Key | What it controls |
|---|---|
| `hero.pinLength` | scroll length of the hero→intro transition (× viewport height) |
| `hero.waveEnd` | fraction of that pin during which the cream wave rises |
| `hero.contentDrift` / `skyDrift` / `sunDrift` | hero layer parallax during the pin |
| `swap.hold` / `out` / `in` / `stagger` | the changing-word cycle |
| `letter` | per-letter hover (y, scale, rotation, duration) |
| `reveal` / `grid` / `cards` / `peek` | entry distances and staggers |
| `parallax` | landscape and strip drift |
| `wind` | degrees and seconds of the plant sway |

The hero words are data, not code — edit one attribute in `index.html`:

```html
<span class="swap" data-words="Builds,Codes,Ships,Solves"></span>
```

## Swapping content later

Images are plain `<img src>` inside fixed-size containers, so replacing a
file changes nothing about the animation. Card titles, copy and links are
ordinary markup. The audio is one `<audio src>`. No animation is keyed to a
filename.

## Substitutions to replace

1. **The two display fonts.** I don't have your originals, so the prototype
   uses Playfair Display and Plus Jakarta Sans, with `font-size` and
   `letter-spacing` calibrated so every text block occupies the *same
   footprint* as your comp (hero line 788px, CTA headline 1256px, and so on
   — all within ~1%). The cost is visible tracking on the hero. Send the
   real fonts and it's one line:
   ```css
   --display: "Playfair Display", Georgia, serif;
   ```
   then reset the tracking to 0 and re-check the widths.
2. **Project imagery** (`assets/images/*`) is cropped from your design
   screenshot at the exact box sizes. Drop in the real files.
3. **The audio track** is a generated 1:23 tone so the player is testable.
4. **The avatar** in the nav is an SVG stand-in.
5. **The hero sky and the two clouds beside the sun** are derived from the
   comp rather than source artwork; the export will be cleaner than the
   crop.

## Derived artwork layers

Two of your illustrations were split so they could move independently. No
shape was redrawn — the pieces recomposite exactly:

- `projects-bg.jpg` / `projects-fg.jpg` — the willow landscape cut above the
  coral band, so the foreground can travel faster than the background.
- `cta-hills.webp` / `cta-plants.webp` — the final landscape cut along the
  hill crest. The plants layer is then clipped into five clusters (seams
  fall in the gaps between plants, `PLANT_SEAMS` in `main.js`), each
  pivoting on its own base. The hill line never moves.

## Accessibility & performance

`prefers-reduced-motion: reduce` removes the pin, the parallax and every
reveal; the page then renders as a straight static translation of your comp
— which is the QA test. Audio never autoplays. Only `transform` and
`opacity` are animated.
