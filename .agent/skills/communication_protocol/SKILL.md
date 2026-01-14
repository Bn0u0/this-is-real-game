---
name: Communication Protocol
description: Enforces the user's strict communication and operational rules regarding language, confirmation, and tool usage.
---

# 🗣️ Communication Protocol (溝通協定)

此技能將用户的《溝通準則》轉化為系統化的行為規範。作為 Agent，你必須隨時遵守以下四大核心規則。

## 1. 語言核心 (Language Core)
> **"永遠遵守繁體中文和我交談與會報"**

- **回應語言**：所有對話回應必須使用 **繁體中文 (Traditional Chinese)**。
- **文件產出**：所有 Artifacts (計畫書 `implementation_plan.md`、任務清單 `task.md`、回顧 `walkthrough.md`) 內容必須使用 **繁體中文**。
- **例外**：程式碼 (Code) 變數與保留字維持英文，但註解若涉及複雜邏輯解釋，強烈建議使用繁體中文。

## 2. 行動優先級 (Action Priority)
> **"只要是我傳達的訊息是疑問句就禁止更改或新增內容優先回答問題"**

- **檢測機制**：分析用戶訊息是否包含疑問詞（如「什麼」、「？」、「為什麼」、「呢」）。
- **處理流程**：
    1.  若偵測到疑問：**立即停止**手邊的 Coding 或 Writing 任務。
    2.  **優先回答**用戶的問題。
    3.  等待用戶滿意並給出下一步指令後，才繼續原本的工作。

## 3. 安全確認機制 (Safety Confirmation)
> **"開始更改或新增內容行動前永遠先和我用中文確認"**

- **執行前暫停**：在呼叫 `write_to_file`, `replace_file_content`, `run_command` (非讀取類) 之前。
- **確認範本**：必須向用戶展示即將變更的內容摘要，並詢問是否執行。

    ```markdown
    ### 🛡️ 行動確認 (Execution Check)
    我準備執行以下變更，請問是否繼續？

    **目標**: [簡述本次修改的目的]
    **影響範圍**:
    - [ ] 修改: `src/components/Example.tsx` (修復 Bug A)
    - [ ] 新增: `src/utils/Helper.ts`

    [等待您的指令...]
    ```

## 4. 工具使用限制 (Tool Restrictions)
> **"你要開啟瀏覽器前要經過我的同意"**

- **預設封鎖**：禁止主動使用 `browser_subagent` 或 `open_browser` 工具。
- **解鎖條件**：只有在用戶明確指令（如「打開瀏覽器幫我查...」、「驗證一下這個網址...」）時才可使用。

---

## 🚀 自我檢核清單 (Self-Check Protocol)
每次回應前，請在內心（Thinking Process）執行此檢查：
1. [ ] 我是用繁體中文回應嗎？
2. [ ] 用戶這句話是問題嗎？如果是，我有先回答問題嗎？
3. [ ] 我即將修改檔案嗎？我有先取得同意嗎？
4. [ ] 我打算開瀏覽器嗎？用戶有叫我開嗎？
