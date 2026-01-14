# 🏗️ Project Verification Strategy: A Pragmatic First Principles Approach

## 1. 核心自我審查 (Senior Engineer Critique)
**原提案問題**：太過理想化。
1.  **維護成本 (Maintenance) 太高**：Puppeteer E2E 測試極為脆弱 (Brittle)，UI 稍微改個 CSS Class 就會炸。對於快速迭代的專案，這是災難。
2.  **Mocking 地獄**：測試 Phaser 遊戲邏輯需要大量的 Mocking (模擬物理、模擬輸入)，往往最後變成「測試 Mock 是否正常」而非「測試遊戲」。
3.  **Agent 能力邊界**：要求 Agent 每次都寫出完美的測試腳本是不切實際的。Agent 寫的測試如果報錯，User 還要幫忙修測試，得不償失。

## 2. 修正後的第一性原理 (Revised First Principles)

我們追求的是 **ROI (投資報酬率) 最高的驗證方式**，而不是「學術上完美的測試金字塔」。

**真理層次修正**：
1.  **靜態真理 (Low Cost, High Value)**：`tsc`, `lint`。這必須有，因為成本極低。
2.  **關鍵邏輯真理 (Medium Cost, High Value)**：只測試 **「純邏輯 (Pure Logic)」**。
    *   *不要測*：Phaser 的物理碰撞 (交給 Phaser 團隊去測)。
    *   *要測*：傷害計算公式、掉寶率計算、存檔資料結構。這些是 **「脫離遊戲引擎也能跑」** 的邏輯。
3.  **冒煙測試 (Smoke Test)**：取代脆弱的 E2E。
    *   只要能「成功啟動到標題畫面」且「不報錯」，就算過關。

## 3. 務實的演進架構 (Pragmatic Architecture)

### 階段一：絕對防禦 (Static Defense - The Guardian)
**目標**：阻止此類低級錯誤（如 `Vite not found`）。
*   **Action**: 
    1.  `npm run build` (全專案編譯)。
    2.  `Check Configs`: 檢查關鍵路徑是否與配置檔吻合。
    *   **Agent 責任**: 每次 Deliver 前強制執行。

### 階段二：純邏輯單元測試 (Pure Logic Unit Tests)
**目標**：保證數學與數據正確。
*   **Action**: 
    *   引入 `Vitest`。
    *   **只針對** `src/services/` (Inventory, Stats) 和 `src/utils/` 進行測試。
    *   **避開** `src/game/` (Phaser 相關)，除非該系統完全解耦。
    *   **Agent 責任**: 修改 Service 時，必須補上對應測試。

### 階段三：瀏覽器主控台監聽 (Console Sentinel) - 取代 Puppeteer
**目標**：低成本的「冒煙測試」。
*   **Action**: 
    *   不需要寫複雜的操作腳本。
    *   啟動本地伺服器 -> 打開頁面 -> **監聽 Console Logs**。
    *   如果 5 秒內出現 `Error` 或 `Exception` -> **判定失敗**。
    *   如果 5 秒內出現 `Game Booted` -> **判定成功**。
    *   **Agent 責任**: 使用簡單的腳本執行此「啟動檢查」。

## 4. 結論：從「全自動駕駛」降級為「輔助駕駛」

我們不要妄想 Agent 能全自動寫出完美的 E2E 測試。
**最佳解**是：
1.  **Agent** 負責 100% 的靜態檢查 (tsc, build)。
2.  **Agent** 負責 100% 的啟動檢查 (Console Monitor)。
3.  **Agent** 僅對 **純邏輯** 撰寫單元測試。
4.  **User** 負責最後的「手感」驗收 (Gameplay Feel)。

## 5. 具體執行步驟 (Action Plan)

1.  **建立 Sentinel**: 實作 `check_static.ts` (Build check + Config check)。
2.  **建立 Smoke Test**: 實作 `check_boot.ts` (Puppeteer 僅用於開啟頁面並監聽 Log，不操作)。
3.  **Skill 整合**: 將上述兩者整合進 `deliver_feature`。

這才是 **可維護、低負擔、高價值** 的推進方式。
