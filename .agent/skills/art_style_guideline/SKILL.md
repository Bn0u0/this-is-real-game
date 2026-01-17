---
name: Art Style Guideline
description: Official Design Language for "Just Mowing" - Baba Is You Meets Wasteland.
---

# Art Style Guideline: Baba + Wasteland

This document defines the visual identity for the project. All UI, assets, and effects must adhere to these rules.

## core Philosophy
**"Baba Is You" shapes in a "Fallout" world.**
- **Geometric Primitives**: Characters and objects should be built from circles, squares, and triangles.
- **Flat Shading**: No gradients, no soft lighting. Use solid colors.
- **Pixel Perfect**: Fonts and effects should feel retro and grid-aligned.
- **Wasteland Grime**: Colors should be muted, rusty, or starkly contrasting (Neon on Black).

## Color Palette (Wasteland 8-bit)

| Name       | Hex       | Usage                          |
| :---       | :---      | :---                           |
| **Void**   | `#000000` | Backgrounds, Deep Shadows      |
| **Bone**   | `#F5F5DC` | Primary Text, UI Borders       |
| **Rust**   | `#D35400` | Warnings, Critical UI, Accents |
| **Dust**   | `#A9A9A9` | Secondary Text, Debris         |
| **Ash**    | `#555555` | Inactive Elements, Floor       |
| **Blood**  | `#8B0000` | Health, Danger                 |
| **Acid**   | `#556B2F` | Toxic zones, "Positive" low key|
| **Rad**    | `#00FF00` | *(Rare)* High-tech, extraction |
| **Gold**   | `#FFD700` | Currency, Loot                 |

## Typography
- **Primary Font**: `VT323` (Google Font) or similar monospace pixel font.
- **Rules**:
    - **Uppercase**: Use uppercase for headers and critical data.
    - **Brackets**: Decorate text with `[ ]`, `//`, `>>`.
    - **No Italics**: Pixel fonts read poorly in italics; use color for emphasis.

## Geometry Rules
- **Player**: Potato-shaped (Stacked ellipses) or irregular circle.
- **Enemies**: Strict geometric shapes.
    - Triangle = Grunt / Fast
    - Square = Tank / Slow
    - Pentagon = Elite
- **Loot**: Simple icons or geometric tokens (Diamond/Square).

## Effect Rules (VFX)
- **Particles**: ALWAYS use squares or rectangles. No round "flare" textures.
- **Trails**: Solid pixel trails.
- **Blending**: Use `NORMAL` blend mode mostly. Avoid excessive `ADD` (Glow) unless for specific "Rad" effects.
- **Screenshake**: Minimal but sharp.

## UI Components
- **Buttons**:
    - **Primary**: Solid background (Rust/Ash) with Bone text.
    - **Ghost**: Transparent background, colored border.
- **Containers**:
    - Dark background (`rgba(0,0,0,0.9)`).
    - Double borders or dashed lines.
    - "Terminal" aesthetic.

## "Baba" Wobble
- Objects should feel "alive" by having slight, jagged animations (squash/stretch) or outlining wobbles.
- Use `WobblePipeline` or manual scale/rotation sine waves sparingly.
