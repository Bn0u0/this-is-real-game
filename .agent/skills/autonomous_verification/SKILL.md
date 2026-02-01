---
name: Autonomous Verification
description: Enforces the use of "Gameplay Sentinel" to autonomously verify game mechanics (Movement, Combat, etc.) before marking tasks as complete.
---

# Autonomous Verification Protocol (自動化驗證標準)

## 1. 核心原則 (Core Principle)
**"如果 Sentinel 沒跑過，功能就等於沒做完。"**
(If the Sentinel hasn't run, the feature is not done.)

人工手動測試是不可靠的。所有的核心機制變更，都必須通過 `npm run check:gameplay` 的無頭瀏覽器驗證。

## 2. 執行時機 (Trigger Conditions)
在以下情況必須執行驗證：
- 修改了 `Player.ts` (玩家邏輯)
- 修改了 `InputManager` (輸入邏輯)
- 修改了 `ECS System` (核心物理/戰鬥系統)
- 準備提交 `Task` 為 `Verified` 狀態之前

## 3. 執行指令 (Command)
```bash
npm run check:gameplay
```

## 4. 判讀結果 (Interpreting Results)
- **✅ PASS**: 終端機顯示 `ALL TESTS PASSED`。你可以自信地提交。
- **❌ FAIL**: 終端機顯示錯誤日誌。
    - **Browser Error**: 可能是程式碼語法錯誤。
    - **Logic Error**: 例如 "Player did not move"。代表你的邏輯雖然沒報錯，但**沒有效果**。這是最危險的 Bug。

## 5. 擴充測試 (Extending Sentinel)
如果你新增了全新機制 (例如：撿起道具)，你必須在 `scripts/sentinel/check_gameplay.ts` 中新增對應的測試案例：
```typescript
// Example: Pickup Item
await page.evaluate(() => { spawnItem('health_pack'); });
// ... Move to item ...
// Assert inventory count increased
```
