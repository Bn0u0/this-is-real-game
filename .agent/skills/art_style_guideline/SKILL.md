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

## Visual Identity V2: The "Trash-Crayon" Aesthetic

### 1. The "Baba" Core (Shape & Line)
- **No Outlines**: Shapes should be defined by their solid color against the contrasting background.
    - **Tech**: `lineStyle(0)` or transparent.
    - **Animation**: The shape itself should "breathe" or wobble (Vertex wobble or Scale wobble).
- **Primitives**: Characters are blobs, not anatomically correct.
- **Text**: Hand-drawn style monospace (VT323 is good, but a jagged font is better).

### 2. The "Wasteland" Skin (Color & Texture)
- **Palette Principles**:
    - **Background**: Deep, noisy darks (`#1a1a1a`, `#2D1B2E`).
    - **Foreground**: Desaturated "Bone" (`#E3DAC9`) or "Cardboard" (`#D2B48C`).
    - **Accents**: Neon Radiation (`#39FF14`) or Rust Oxide (`#CD5C5C`).
- **Texture Rule**: Objects are "Solid Color" but with "One Flaw".
    - Example: A gray square (Solid) + 1 Orange Pixel (Rust).
    - Example: A white blob (Solid) + 1 Black line (Scar).

## Color Palette V2 (Refined)

| Role | Name | Hex | Notes |
| :--- | :--- | :--- | :--- |
| **Flesh** | **Bone** | `#E3DAC9` | Not white. Old paper color. |
| **Gear** | **Scrap** | `#708090` | Slate gray, blue-ish tint. |
| **Rust** | **Oxide** | `#CD5C5C` | Indian Red. Dried blood/rust. |
| **Danger** | **Toxic** | `#39FF14` | Neon Green. High contrast. |
| **Void** | **Abyss** | `#111111` | Almost black, for depth. |

## Implementation Rules (Strict)

1.  **No Pure White (`#FFFFFF`)**: Use Bone (`#E3DAC9`) for "white" objects.
2.  **No Clean Circles**: All circles must be slightly irregular (e.g. ellipses with varied x/y).
3.  **The "Wobble"**:
    - **Idle**: `scaleX` / `scaleY` must oscillate `+/- 2%` on distinct Sine waves.
    - **Move**: "Trot" animation (Legs) is dominant.
4.  **Shadows**: Sharp, hard ellipses. No soft blurs. `alpha=0.4`.
