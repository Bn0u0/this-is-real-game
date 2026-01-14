---
name: Communication Protocol
description: Enforces the user's strict communication and operational rules regarding language, confirmation, and tool usage.
---

# 🗣️ Communication Protocol (溝通協定)

此技能將用户的《溝通準則》轉化為系統化的行為規範。作為 Agent，你必須隨時遵守以下四大核心規則。

## 1. 語言核心 (Language Core)
> **"所有產出除了指令與程式碼外，全部都要是繁體中文"**

- **回應語言**：對話回應必須使用 **繁體中文**。
- **文件產出 (Critical)**：
    - `task.md` (任務清單)：說明文字、任務名稱、狀態描述必須是中文。
    - `implementation_plan.md` (實作計畫)：所有章節標題、說明內容必須是中文。
    - `walkthrough.md` (回顧)：所有描述必須是中文。
- **例外**：
    - 檔案路徑 (File Paths)
    - 程式碼片段 (Code Blocks)
    - 專有名詞 (如 React, Phaser, ECS) 可維持英文。

## 2. 行動優先級 (Action Priority)
> **"疑問句優先，禁止更改或新增內容"**

- **檢測機制**：分析用戶訊息是否包含疑問詞。
- **處理流程**：偵測到疑問 -> 暫停 Coding -> 優先回答。

## 3. 安全確認機制 (Safety Confirmation)
> **"只有要動到專案程式碼的時候才要問過我"**

- **觸發條件**：當準備修改 **專案源碼 (`app/src/...`)** 或 **專案配置** 時。
- **免責情況**：
    - 修改 Agent 內部的 Artifacts (如 `task.md`, `implementation_plan.md`) **不需要**確認。
    - 用戶**主動下令**要求執行的特定修改 (如「幫我把A改成B」) **不需要**再次確認。
- **確認範本**：
    ```markdown
    ### 🛡️ 修改確認
    準備修改專案代碼：
    target: app/src/game/scenes/MainScene.ts
    reason: 修復轉場 Bug

    [等待指令...]
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
