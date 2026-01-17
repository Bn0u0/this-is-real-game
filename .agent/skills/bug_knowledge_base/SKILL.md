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
