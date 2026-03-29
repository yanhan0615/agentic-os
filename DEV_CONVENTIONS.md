# DEV_CONVENTIONS.md - 开发流程规范

> 所有项目、所有阶段均适用。任何 Agent 不得绕过此流程。

---

## 标准开发流程

```
架构评审 → 老板批准 → dev 开发 + 自测 → 提 PR → arch 评审 PR
→ [如有问题] arch 提 comment → 通知 dev 修改 → 循环直到问题全部解决
→ arch sign-off（approve PR）→ 汇报墨爪 → 墨爪推进下一阶段
```

---

## 各阶段说明

### 1. 架构评审（arch 主导）
- arch agent 完成架构设计文档
- 汇报给墨爪，由墨爪转交老板审阅
- **老板批准后**，方可通知 dev 开始编码
- 此步骤是**硬卡点**，不可跳过

### 2. 功能开发（dev 主导）
- dev 在 feature branch 上开发（命名规范：`feature/phase-X-xxx`）
- 开发完成后自测通过
- 提出 Pull Request，目标分支：`main`
- PR 描述需包含：实现内容、自测结果、关联的架构设计

### 3. PR 评审（arch 主导）
arch 对 PR 进行全面评审，包括：
- **代码风格**：是否符合项目规范
- **代码质量**：可读性、健壮性、边界处理
- **架构匹配度**：实现是否与架构设计一致

#### 3a. 发现问题
- arch 在 PR 上提 comment，说明问题和修改建议
- arch 通知 dev 修改（可通过墨爪中转）
- dev 修改后更新 PR
- arch 重新评审，**循环直到所有问题解决**

#### 3b. 评审通过
- arch approve PR（GitHub 上的 "Approve" review）
- 通知墨爪：本阶段开发完成，PR 已 sign-off

### 4. 合并与推进（墨爪统筹）
- 墨爪确认 arch 已 approve
- merge PR 到 main
- 向老板汇报本阶段完成情况
- **等待老板指令**后，推进下一阶段

---

## 分支保护要求

GitHub 仓库 `main` 分支必须设置：
- ✅ 禁止直接 push
- ✅ 必须有 1 个 approving review（arch）才能 merge
- ✅ 禁止 force push

---

## 红线（任何 Agent 不得违反）

1. **dev 不得直接 push main**
2. **墨爪不得在 arch sign-off 之前 merge PR**
3. **墨爪不得在老板批准架构之前调度 dev 开始编码**
4. **任何阶段跳过审批都视为流程违规，需复盘**

---

_最后更新：2026-03-29，依据老板对流程的确认_
