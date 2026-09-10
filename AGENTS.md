# AGENTS.md

轻量级多用户 AI Agent 管理平台。后端 Hono + Cloudflare Workers + PostgreSQL(pgvector)，前端 Vite + React 19。所有注释、错误消息、提交信息、文档用**简体中文**（代码标识符用英文）。

## 仓库结构

- `backend/` — Hono API（Cloudflare Worker），入口 `src/index.ts`；路由在 `src/routes/`（`_middleware.ts` 为 `requireUser` 认证中间件）
- `frontend/` — Vite + React 19；`functions/api/[[path]].ts` 是 Pages Functions 同源代理，把 `/api/*` 转发到后端 Worker（生产依赖 `API_ORIGIN` 环境变量）
- `services/base/` — Python PDF 解析服务，**已停用**（PDF 已在 Worker 内用 unpdf 解析），仅保留参考，勿在其中开发
- `internal-docs/` — 被 gitignore 的本地开发/排障记录（Cloudflare 部署、RAG、安全审查等），排查问题时可读
- `docs/architecture.md` — 当前架构权威描述；README 中的项目结构树可能过时，以代码为准

## 常用命令

```bash
npm run dev:backend    # wrangler dev → http://localhost:8787
npm run dev:frontend   # vite → http://localhost:5173
npm run typecheck      # 根目录：backend tsc + frontend tsc --noEmit
```

backend 内：

```bash
npm run dev            # wrangler dev
npm run build          # wrangler deploy --dry-run（本地构建验证）
npm run typecheck      # tsc --noEmit
npm test               # vitest run（全部 mock DB，无需真实数据库）
npm run db:generate    # drizzle-kit generate（改 schema 后必须跑并提交迁移）
npm run db:push        # drizzle-kit push（本地直推 schema）
npm run db:seed        # 创建管理员账号，必须设 SEED_PASSWORD（shell env；SEED_EMAIL/SEED_NAME 有默认值）
npm run eval:rag       # RAG 检索效果评测（需真实 DATABASE_URL 与嵌入 provider）
npm run cf-typegen     # 改动 wrangler.jsonc bindings 后重新生成 worker-configuration.d.ts
```

frontend 内：`npm run lint`（oxlint）、`npm run build`（`tsc -b && vite build`）。

## 本地数据库

`wrangler dev`、`drizzle-kit`、seed 脚本都需要本地 Postgres（含 pgvector），仓库统一用 `postgres:18`：

```bash
docker run --name pg-agent -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:18
docker exec pg-agent createdb -U postgres agent_platform
docker exec pg-agent psql -U postgres -d agent_platform -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 推 schema（drizzle-kit 读 DATABASE_URL）
cd backend && DATABASE_URL=postgres://postgres:postgres@localhost:5432/agent_platform npm run db:push
```

注意：`wrangler dev` 用 `wrangler.jsonc` 的 hyperdrive `localConnectionString`，而 `drizzle-kit`/seed 用 `DATABASE_URL`，两者都要指向这个库。

## 环境变量（易错点）

- 本地 `wrangler dev` 只读 **`backend/.dev.vars`**（已 gitignore）；根目录 `.env.local`、`backend/.env.local.reference` 仅是参考模板，**不会被加载**。不要把值写进这些文件期待生效。
- 数据库：本地开发连接串由 `wrangler.jsonc` 的 hyperdrive `localConnectionString` 提供（`postgres://postgres:postgres@localhost:5432/agent_platform`，docker postgres:18 + pgvector）；`drizzle-kit`/seed 脚本则读 `DATABASE_URL` 环境变量。
- 本地 wrangler dev 不支持 AI binding，嵌入需 `EMBEDDING_PROVIDER=dashscope`（本地真实）或 `mock`（链路调试）；生产默认 workers-ai。切换 provider 时改 `backend/.dev.vars` 或 `wrangler secret`。
- 生产 secrets（JWT_SECRET、DEEPSEEK_API_KEY 等）用 `wrangler secret set`，禁止写入代码或仓库。
- `CORS_ORIGINS`（逗号分隔）覆盖默认 CORS 白名单。

## 架构要点

- **每请求独立 DB 连接**：Workers 禁止跨请求复用 postgres 连接，`src/lib/db/index.ts` 的 `withDb` + AsyncLocalStorage 管理连接生命周期；路由内通过 `getDb()` 取句柄，流式响应期间连接保持到流结束。新增后台/定时逻辑沿用此模式。
- Cloudflare bindings 通过 `src/lib/env-holder.ts` 模块级注入，非路由上下文（cron、waitUntil）要先 `setEnv(env)`。
- 除 `/api/auth`、`/api/health` 外所有 `/api/*` 都经 `requireUser`（`Authorization: Bearer`）。
- 测试在 `backend/src/lib/__tests__/`，vitest config 已预设 `JWT_SECRET`/`EMBEDDING_PROVIDER=mock` 等 env；所有 DB 交互测试都 mock `@/lib/db`，不碰真实数据库。
- 部署：CI 在 main 分支 push 后自动 typecheck → test → build → deploy（Workers + Pages）。本地部署用 `npm run deploy`。

## 工作约定

- 保持最小 diff，只改任务所需文件；不顺手重构、不整库格式化、不删除未要求的代码。
- 优先用仓库现有模式（简单 > 巧妙，现有代码 > 新抽象）；加依赖前先确认现有代码能否实现。
- 改逻辑要保证 `npm test` 通过；修复 bug 补回归测试，新增行为补测试。
- 改动前先规划，完成后自查：typecheck 通过、`npm test` 通过、无未使用 import、行为符合预期。
- 需求不清先问，不要猜；说明假设后再动手。
- 安全红线：不打印、不提交密钥/token/密码或敏感用户数据；生产 secrets 只用 `wrangler secret set`。
- 提交遵循小步原子提交；`internal-docs/` 不进 git。
