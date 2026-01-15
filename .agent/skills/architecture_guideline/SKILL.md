---
name: Project Architecture Guideline
description: Enforces the Single Source of Truth (SSOT) and directory classification rules for the "Grass Cutting" game project.
---

# Project Architecture Guideline

All code modifications must strictly adhere to the following directory structure to maintain a Single Source of Truth (SSOT).

## 1. Directory Classification

### 🎮 Phaser Layer (`src/game/phaser/`)
All Object-Oriented Phaser-specific logic. **NEVER** place these in the root of `src/game/`.
- `actors/`: Player and unit classes with complex state/methods.
- `entities/`: Environmental objects (Turrets, Drones, Zones).
- `managers/`: Phaser-world state controllers (WaveManager, SoundManager).
- `systems/`: Standard Phaser systems (NetworkSync, Input).
- `factories/`: Asset and unit instantiation logic.
- `utils/`: Game-specific helper functions (SafeArea).
- `pipelines/`: Custom WebGL shaders and PostFX.

### 🧩 ECS Layer (`src/game/ecs/`)
All Data-oriented Entity Component System logic using `bitecs`.
- `components/`: Pure data structure definitions (e.g., `src/game/ecs/components/index.ts`).
- `systems/`: Pure logic systems that iterate over entities (e.g., `CollisionSystem`).

### 📦 Roots & Data
- `src/game/scenes/`: High-level Phaser Scene definitions.
- `src/game/data/`: Static registries, item libraries, and configuration files.
- `src/services/`: Global, UI-agnostic services (Inventory, Network, Session).
- `src/app/`: React entry points and global styling.
- `src/components/`: Reusable UI components.

## 2. Enforcement Rules
1. **No Root Files**: Files should not be placed directly in `src/game/` unless they are the `PhaserGame.tsx` bridge.
2. **ECS Isolation**: ECS systems must not import Phaser Managers. Use the ECS World to pass data.
3. **SSOT Imports**: Always use the most direct relative path within the component hierarchy. Do not allow redundant file copies.

## 3. Automation
Run `npm run check:architecture` (part of `npm run sentinel`) to verify directory compliance before committing changes.
