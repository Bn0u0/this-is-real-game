# 🛡️ Advanced Deployment Sentinel (高階部署哨兵)

您希望的不僅是一個檢查清單，而是一個 **「主動防禦系統」**。
這個 Skill 將會包含三個層次的深度檢查：

## Layer 1: 剛性編譯與依賴檢查 (The Hard Gate)
這一步是基礎，但我們會加入「自動修復」嘗試。
1.  **TypeScript 嚴格編譯 (`tsc --noEmit`)**：
    *   不僅僅是跑編譯，而是捕捉錯誤代碼 (Output Parsing)。
    *   **Auto-Fix**: 如果是簡單的 `Type 'null' is not assignable to 'string'` 或 `Unused import`，我會嘗試自動修復。
2.  **依賴完整性掃描**：
    *   檢查 `package.json` vs `node_modules`。
    *   **Auto-Fix**: 如果發現缺件，自動執行 `npm install`。

## Layer 2: 專案邏輯深度掃描 (Deep Logic Scan)
針對本次變更的「上下文 (Context)」進行檢查，而不只是語法。
1.  **關鍵路徑驗證 (Critical Path Validation)**：
    *   針對 `App.tsx`, `MainScene.ts`, `InputSystem.ts` 等核心檔案。
    *   **RegEx 啟發式檢查**：搜尋危險模式（例如：全大寫的 `FIXME`, `TODO`, 或者像這次的 `pointer-events-none` 這種容易被覆蓋的關鍵設定）。
2.  **檔案關聯性分析 (Reference Integrity)**：
    *   如果我刪除了 `Enemy.ts`，我會掃描全專案是否還有 `import { Enemy }` 的殘留。
    *   這比單純編譯更能抓出「邏輯上的死連結」。

## Layer 3: 模擬與行為預測 (Simulation)
這部分比較進階，是 Agent 的核心能力。
1.  **配置檔完整性**：
    *   檢查 `vercel.json`, `vite.config.ts`, `.env` 是否符合當前環境需求。
2.  **變更總結與風險評估**：
    *   讀取 `git diff`。
    *   分析變更是否觸及「高風險區域」（如 ECS 核心、存檔系統）。
    *   如果觸及，我會強制要求您進行特定的人工測試（例如：「您修改了存檔邏輯，請務必測試 Vercel 線上存檔功能」）。

---

### Skill 實作架構

我們將建立 `deploy_sentinel` 技能，包含：
1.  `SKILL.md`: 定義執行流程。
2.  `sentinel.ts`: 一個由我編寫的 Node.js 腳本，用來執行上述的 Layer 1 & 2 掃描。
3.  `verify.sh`: 用於一鍵執行所有檢查。

這個 Skill 的目標是：**「只要 Sentinel 亮綠燈，您的專案在 Vercel 上就一定能跑。」**

您覺得這個深度與廣度是否符合您的期待？如果是，我就開始構建這個「哨兵」。
