---
name: Deliver Feature
description: Automated delivery pipeline: Static Check -> Logic Test -> Smoke Test -> Deploy.
---

# 🚀 Deliver Feature (交付功能)

此技能負責執行「功能交付」的標準作業程序。即便是小修改，也必須通過此流程才能上線。

## 🎯 執行流程 (Pipeline)

### 1. 靜態防禦 (Static Defense) 🧹
**目標**: 攔截語法錯誤、配置遺失、低級 Bug。
*   指令: `npm run check:static` (scripts/sentinel/check_static.ts)
*   檢查: 
    *   全專案編譯 (`npm run build`)
    *   關鍵配置檔 (`package.json`, `vite.config.ts`) check
    *   關鍵修復檢查 (如 `pointer-events-auto`)

### 2. 邏輯鎖定 (Logic Locking) 🧮
**目標**: 驗證核心數學與邏輯正確性。
*   指令: `npm run test` (Vitest)
*   檢查: 僅測試純邏輯 (Service, Utils)，忽略 UI/Phaser。

### 3. 冒煙測試 (Smoke Test) ✈️
**目標**: 確保遊戲能啟動，無崩潰。
*   指令: `npm run check:boot` (scripts/sentinel/check_boot.ts)
*   檢查: 
    *   啟動 Vite Preview
    *   Headless Browser 開啟頁面
    *   監聽 Console Log 5 秒 (無 Error 即 Pass)

## 🏁 交付決策 (The Verdict)

*   **全數通過**: 
    1.  詢問用戶是否提交 (Commit)。
    2.  執行 `git push`。
    3.  提供 Vercel 連結。
*   **任一失敗**:
    1.  中斷流程。
    2.  提供錯誤報告。
    3.  **不執行** Push。

---
## 🛠️ 開發者指引
*   新增功能時，請同步更新 `check_static.ts` 加入新的關鍵檢查。
*   核心邏輯修改，請確保 `npm run test` 覆蓋率。
