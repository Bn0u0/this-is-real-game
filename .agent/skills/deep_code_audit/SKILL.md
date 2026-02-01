---
name: Deep Code Audit
description: Perform a comprehensive, cognitive static analysis of a specific feature or logic flow to identify logical flaws, missing connections, or design inconsistencies.
---

# Deep Code Audit Protocol

Use this skill when the user asks to "audit", "check logic", "verify flow", or "deep check" a specific feature, or when you are debugging a complex issue where automated tests are passing but behavior is wrong.

## 1. Define Scope
Clearly identify the **Single Source of Truth** for the feature being audited.
- **Entry Point**: Where does the logic start? (e.g., `MainScene.update`, `EventBus.on('START_MATCH')`)
- **Key Components**: Which Managers, Systems, or Classes are involved?

## 2. Gather Context (Crucial)
You MUST read the *current* state of the files. Do not rely on memory.
- Use `view_file` on all relevant files identified in Step 1.
- Look for `imports` to see what dependencies are brought in.

## 3. Execution Trace (The "Dry Run")
Mentally simulate the code execution line-by-line for the critical path.
**Checklist for Tracing:**
- [ ] **Data Units**: Are time units consistent? (ms vs seconds). Are angles consistent? (Radians vs Degrees).
- [ ] **Null Safety**: Is `this.manager` or `this.player` checked before access?
- [ ] **State Sync**: If A updates a value, does B read the *new* value or the *old* one? (Order of operations).
- [ ] **Event Linkage**: If an event is emitted (`emit`), is there an active listener (`on`)? Is the listener cleaned up (`off`)?
- [ ] **Boundary Conditions**: What happens at 0 HP? What happens at Wave 0? What happens if the array is empty?

## 4. Verify Against "SKILL: Delivery Sentinel"
- Deep Code Audit finds *logic* errors.
- Sentinel finds *syntax/runtime* errors.
- **CRITICAL**: You MUST run `npm run check:gameplay` after any logic change to ensure the game still runs and plays correctly.
- If you find a logic error here, consider suggesting a new *test case* for the Sentinel to prevent future regression.

## 5. Report Format
Present your findings in a structured "Audit Report":

### 🔍 Deep Code Audit: [Feature Name]

**1. Execution Flow**
> Briefly describe the path: `Input` -> `Process` -> `Output`.

**2. Status Checks**
- **Data Integrity**: ✅ Pass / ❌ Fail (Explain)
- **Null Safety**: ✅ Pass / ❌ Fail (Explain)
- **Logic Consistency**: ✅ Pass / ❌ Fail (Explain)

**3. Critical Findings**
- List any blocking issues or bugs found.

**4. Recommendations**
- Refactoring suggestions or missing safeguards.
