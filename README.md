# Agentic OS

浏览器端仿真 macOS 桌面系统，作为前端展示层，未来可接入各 Agent 能力。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| 状态管理 | Zustand + Immer |
| 样式 | Tailwind CSS + CSS Modules |
| 构建工具 | Vite |
| 后端框架 | Hono (Node.js/Bun) |
| 运行时 | Bun |

## 目录结构

```
agentic-os/
├── frontend/     # Vite + React 前端
├── backend/      # Hono 后端 API
└── shared/
    └── types/    # 前后端共享类型
```

## 路由约定

- 前端：`https://openclaw.1702.store/agentic-os`（→ 本机 5173 端口）
- 后端：`https://openclaw.1702.store/agentic-os/api`（→ 本机 8765 端口）

## 快速开始

```bash
# 安装依赖
bun install

# 启动前端 (port 5173)
bun run dev:frontend

# 启动后端 (port 8765)
bun run dev:backend

# 同时启动
bun run dev
```

## 开发阶段

- **Phase 1**（当前）：桌面框架骨架 — 窗口管理、Dock、MenuBar
- **Phase 2**：核心应用 — Finder、Terminal、TextEdit
- **Phase 3**：后端集成 — 文件系统 API、持久化
- **Phase 4**：Agent 接入 — AgentBridge、Agent Chat 应用

## 架构文档

详见 `docs/architecture/` 目录（ADR 记录）。
