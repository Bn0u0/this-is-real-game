---
name: Bug Knowledge Base
description: A permanent record of identified bugs, architectural pitfalls, and logic errors. MUST be referenced before major refactors.
---

# Bug Knowledge Base (Bug 紀錄與防範指南)

This skill serves as a permanent record of identified bugs, architectural pitfalls, and logic errors found during the development of "This is Real Grass Cutting". Antigravity **MUST** reference this file before major refactors or when encountering similar symptoms.

## 1. Syntax & Variable Scope Errors
### [BUG-001] Undefined Variable 'earn' in SessionService
- **Description**: Trying to use `earn` outside its declared block or failing to declare it before usage in `handleMissionEnd`.
- **Root Cause**: Fragmented code replacement led to internal logic using a variable that wasn't properly initialized in the same scope.
- **Prevention**: Always verify variable accessibility when splitting logic across multiple lines or functions. Check linting/TypeScript errors before finalizing edits.

## 2. SSOT (Single Source of Truth) Violations
### [BUG-002] Multi-Service State Desync
- **Description**: Updating `wallet.gold` in UI without updating `credits` in Persistence, or vice versa.
- **Root Cause**: Lack of a centralized state manager for currency.
- **Prevention**: Use `InventoryService` as the ONLY source of truth for player data. `PersistenceService` should only handle I/O.

## 3. Appwrite Persistence Issues
### [BUG-003] JSON String Length Overflows
- **Description**: Storing massive inventory arrays in a single `String` field.
- **Root Cause**: MariaDB row size limits in local Appwrite/Docker environments.
- **Prevention**: Use granular fields like `loadout_json`, `stats_json` to distribute the load. Keep strings under 4096 characters if possible.

## 4. Platform-Specific SDK Errors
### [BUG-004] setSelfSigned is not a function (Web SDK)
- **Description**: Runtime crash when calling `client.setSelfSigned(true)` in the browser.
- **Root Cause**: `setSelfSigned` is a Node.js-only method. Browser security prohibits programmatic SSL bypass.
- **Prevention**: Never use server-side methods in the frontend client. For local SSL issues, use manual browser trust.

## 5. Connectivity & Environment Errors
### [BUG-005] ERR_NAME_NOT_RESOLVED (Appwrite Endpoint)
- **Description**: Frontend fails to fetch from Appwrite due to DNS failure.
- **Root Cause**: `VITE_APPWRITE_ENDPOINT` points to an expired Cloudflare Tunnel or incorrect IP.
- **Prevention**: For local development, prioritize `http://localhost/v1`. Avoid using temporary tunnels as the primary source of truth in `.env`.

## 6. Combat Logic Failures
### [BUG-006] Player Doesn't Auto-Fire (Speed Condition)
- **Description**: Player character never shoots despite having a weapon equipped.
- **Root Cause**: `autoFire` in `Player.ts` required `speed < 150` (near-stationary) to fire. Players moving at normal speed (200-400) would never meet this condition.
- **Prevention**: For 'run-and-gun' style games, set a high speed threshold (e.g., 500) or remove the condition entirely during MVP.

### [BUG-007] Player Doesn't Fire After Joystick Release (Velocity Coasting)
- **Description**: Player fires initially when stationary, but after using joystick and releasing, firing stops permanently.
- **Root Cause**: Phaser physics body continues coasting due to low drag. Velocity never reaches the firing threshold even when joystick is released.
- **Prevention**: Set high drag (`4000`) on joystick release and snap velocity to zero when below a threshold (`50`).

### [BUG-008] Motion Sickness from Global Shader
- **Description**: Applying a wobble/distortion shader to the entire MainCamera caused significant dizziness and motion sickness for the user.
- **Root Cause**: The shader distorted stable reference points (ground, UI overlay, empty space), mimicking "heat haze" or "drunk vision" rather than a stylized animation.
- **Prevention**: **Object-Based Wobble** is superior for gameplay comfort. Only animate dynamic entities (player, enemies, debris). The background/ground must remain visually stable to provide a reference frame.

### [BUG-009] JSX Special Characters in Text
- **Description**: Using `>` or `>>>` directly in JSX text content causes "Unexpected token" build errors.
- **Root Cause**: React JSX parser interprets `>` as a potential tag closing or invalid token sequence in certain contexts.
- **Prevention**: Always wrap special characters in curly braces like `{'>>>'}` or use HTML entities `&gt;`.

### [BUG-010] Phaser lineStyle Strict Arguments
- **Description**: calling `graphics.lineStyle(0)` caused TS error "Expected 2-3 arguments, but got 1".
- **Root Cause**: The project's TypeScript definition for Phaser demands clear arguments for width, color, and alpha, not allowing the shorthand found in some JS examples.
- **Prevention**: Always utilize the full signature: `lineStyle(width, color, alpha)`. Use `lineStyle(0, 0, 0)` for reset.

---
**Status**: ACTIVE
**Last Updated**: 2026-01-17
### [BUG-011] Duplicate Switch Defaults
- **Description**: TypeScript error "Duplicate default label" in switch statement.
- **Root Cause**: Adding a `default:` block without removing the existing one, or grouping it with a case label `case 'X': default:`.
- **Prevention**: Always inspect the existing `default` case before adding a new one. Remove or merge legacy cases.

### [BUG-012] Class Method Boundary
- **Description**: "Statement expected" or "Method definition outside class" error.
- **Root Cause**: Using `replace_file_content` near the end of a file and inadvertently appending a method *after* the closing `}` of the class.
- **Prevention**: When adding methods, locate the last method's closing brace `}` and insert *before* the class's final closing brace.

### [BUG-013] Missing Type Dependency
- **Description**: "Cannot find name 'X'" when 'X' is used as a Type Hint in constructor.
- **Root Cause**: Forgetting to import the class used in the type definition, especially when only adding it to the constructor signature.
- **Prevention**: Always double-check imports when introducing new dependency injections. Use VSCode's "Organize Imports" or manually verify.

---
**Status**: ACTIVE
**Last Updated**: 2026-01-18
### [BUG-014] Invalid Default Weapon ID in Save Data
- **Description**: "No weapon equipped" warning and failed initial combat logic.
- **Root Cause**: `InventoryService` initialized default profiles with a hardcoded ID (`W_T1_PISTA_01`) that did not exist in the `ItemLibrary` (which uses `weapon_crowbar_t0`).
- **Prevention**: When referencing Asset IDs in code (especially default values), always cross-check with the actual Asset Library or use a Type-Safe Enum/Constant. Don't use "Magic Strings".

### [BUG-015] Scene Transition Race Condition (Double Click Stall)
- **Description**: User has to click "Start" twice. First click logs "Navigating" but screen doesn't change.
- **Root Cause**: Calling `game.scene.start('MainScene')` when `MainScene` is already active (but perhaps paused or transitioning) caused a silent failure or limbo state.
- **Prevention**: always check `game.scene.isActive('Key')` before calling start. If active, emit a logic event (e.g., `START_MATCH`) instead of restarting the scene.

---
**Status**: ACTIVE
**Last Updated**: 2026-01-19
