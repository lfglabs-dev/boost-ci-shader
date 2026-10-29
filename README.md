# Boost-CI — Procedural GLSL Shader & Theme-Adaptive Vector SVGs

100% mathematical, zero-bitmap reconstructions of the Boost-CI speedometer emblem in **two tailored optical sizes**, with **native desktop dark-theme adaptation** and a **single-shot Green → Orange → Vivid Red → Orange** boost animation:

1. **Semantic Gauge Colour Progression & Single-Shot Stop (`4.4s`)**:
   - **Start / Low RPM (`0%–26%`)**: Fresh **Green-Lime** (`#B4F22C → #2AD04E → #10A040`).
   - **Mid-Range Spool (`26%–44%`)**: Transitions smoothly into signature **Boost Orange-Gold** (`#FECE2A → #FE8605 → #FD4E02`).
   - **High-Load Struggle (`44%–84.5%`)**: Fights aerodynamic load and limiter bounce in luminous **Vivid Scarlet-Red** (`#FF5C26 → #F8200C → #D11708` — bright and energetic, never muddy dark maroon).
   - **Final Settle (`84.5%–100%`)**: Cools smoothly back to **Boost Orange-Gold**, sweeps the left-to-right specular highlight across the dial, and **stops cleanly** at the `0°` reference pose (`animation-fill-mode: forwards`).
2. **Native Desktop Dark-Theme Adaptation (`prefers-color-scheme: dark`)**:
   - All 4 SVG files automatically detect the desktop theme via `@media (prefers-color-scheme: dark)` and adapt the dark gray/black needle and right metallic arc into refined **brushed light metallic gray** (`#BDC4D1 → #EEF2F8` needle and `#868E9E → #D4D8E2` track).
3. **Dual Optical-Size Variants**:
   - **High-Resolution Display** (`64px` to `4K/Retina`) — exact reference silhouette, `104.5px` uniform ring, sharp `7:30` tip.
   - **Small / Favicon Bold** (`16px`–`48px` browser favicons, tabs, CI badges) — `~91%` tight fill, `178px` bold ring, `R = 18px` micro-tip, and `70px` anti-bleed needle corridor.

## Deliverables

| File | Optical Variant | Mode | Description |
| :--- | :--- | :--- | :--- |
| `boost-ci.frag` | **Dual** (`u_variant = 0/1`) | Single-Shot / Manual GLSL | WebGL2 / OpenGL ES 3.0 / Shadertoy shader with `u_variant` and `u_dark_mode`. |
| `boost-ci.svg` | **High-Res Display** | CSS Single-Shot (`4.4s`) | Self-animating pure circular-arc SVG (`forwards` stop at Orange + `@media (prefers-color-scheme: dark)`). |
| `boost-ci-static.svg` | **High-Res Display** | Static (`3` paths) | Compact 3-path SVG with automatic desktop light/dark theme adaptation. |
| `boost-ci-favicon.svg` | **Small / Favicon Bold** | Static (`3` paths) | Compact 3-path bold optical SVG for `<link rel="icon">` favicons (`16×16`–`32×32`) with auto dark-theme light-gray adaptation. |
| `boost-ci-favicon-anim.svg` | **Small / Favicon Bold** | CSS Single-Shot (`4.4s`) | Self-animating bold optical SVG (`forwards` stop at Orange + auto dark-theme adaptation). |
| `index.html` | **Interactive Studio** | WebGL2 + SVG | Live comparison studio with Variant switcher, Auto Desktop Theme / Dark / Light selector, Replay Boost button, and `16px–64px` light/dark matrix. |

## Shader Uniforms (`boost-ci.frag`)

- `uniform vec2 u_resolution` — Viewport pixel dimensions `(width, height)`
- `uniform float u_time` — Elapsed time in seconds (`>= 4.4s` rests on the `0°` Orange-Gold pose)
- `uniform float u_variant` — `0.0` = High-Resolution Display, `1.0` = Small / Favicon Bold
- `uniform float u_dark_mode` — `0.0` = Light Theme (dark carbon needle/track), `1.0` = Dark Theme (brushed light-gray needle/track)
- `uniform float u_animate` — `1.0` for `4.4s` single-shot boost, `0.0` for manual control
- `uniform float u_progress` — Manual boost level in `[0.0, 1.12]` (`-1.0` = static unheated Orange reference)
- `uniform float u_speed` — Animation speed multiplier (`1.0` default)
- `uniform float u_bg_alpha` — `1.0` for solid background, `0.0` for transparent premultiplied RGBA output
