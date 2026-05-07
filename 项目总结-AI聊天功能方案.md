# 考研学习助手 — 项目总结 & AI 聊天功能方案

## 一、项目概况

| 项目 | 说明 |
|------|------|
| 名称 | 考研学习助手 (kaoyan-study-dashboard) |
| 路径 | `D:\Desktop\辅助学习助手\` |
| 部署 | Vercel (`kaoyan-yijiangns-projects.vercel.app`) |
| 技术栈 | Next.js 14 (App Router) + React 18 + Tailwind CSS 3 + TypeScript 5.7 |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | 无登录。Service Role Key 直连数据库，单用户模式 |

## 二、现有功能

| 功能模块 | 路由 | 说明 |
|---------|------|------|
| 首页总览 | `/` | 今日任务、打卡日历、学习统计、知识卡片 |
| 任务管理 | `/tasks` | CRUD 考研任务（数学/英语/408），含进度和步骤 |
| 错题管理 | `/mistakes` | 记录错题，含来源、章节、标签、附件上传 |
| 知识点管理 | `/knowledge` | 记录知识点，含内容类型、复习提示 |
| 数据统计 | `/stats` | 学习数据可视化 |
| 数据导入导出 | `/data` | Markdown/CSV 批量导入导出 |
| 全局搜索 | `/search` | 跨任务/错题/知识点搜索 |
| 番茄钟 | 全局组件 | 专注计时，顶部栏和移动端均可使用 |
| 深色模式 | 全局 | next-themes 实现 |

## 三、后台架构

```
浏览器层:
  usePersistentCollection (localStorage 本地缓存)
  → services/*.ts (调用 /api/*)
  → fetch 到 Next.js Route Handlers

服务端 (Next.js Route Handlers):
  API 路由 (src/app/api/*/route.ts)
  → *Service() 仓库函数 (src/lib/supabase/*-repository.ts)
  → supabaseRestRequest() (直接 fetch 到 Supabase REST API，使用 service_role key)

数据库:
  Supabase PostgreSQL
  3 张表: tasks, study_records, attachments
  无 user_id 过滤，无 RLS，单用户直连
```

### 关键设计点

1. **不使用 `@supabase/supabase-js` SDK**，而是通过原生 fetch 调用 Supabase REST API
2. **两套仓库函数并存**：`listTasks()` 需要 auth context，`listTasksService()` 用 service_role 无需认证
3. **私钥安全**：`SUPABASE_SERVICE_ROLE_KEY` 仅在服务端可读（`config.ts` 带 `import "server-only"`）
4. **Service Mode**：环境变量 `NEXT_PUBLIC_SERVICE_MODE=true` 告知前端无需登录，`useAuthSession` 返回 `status: "disabled"`

### 环境变量

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJ...
SUPABASE_SERVICE_ROLE_KEY         = eyJ...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET = study-attachments
NEXT_PUBLIC_SERVICE_MODE          = true
DEEPSEEK_API_KEY                  = sk-...  (本次新增)
```

### 核心目录结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局（侧边栏+顶栏+主体）
│   ├── page.tsx                # 首页
│   ├── api/                    # API 路由
│   │   ├── tasks/              # 任务 CRUD
│   │   ├── study-records/      # 错题/知识点 CRUD
│   │   ├── search/             # 全局搜索
│   │   ├── uploads/            # 附件上传
│   │   ├── export/             # 数据导出
│   │   ├── import/             # 数据导入
│   │   └── auth/               # 登录（service mode 下闲置）
│   ├── tasks/                  # 任务页
│   ├── mistakes/               # 错题页
│   ├── knowledge/              # 知识点页
│   ├── stats/                  # 统计页
│   ├── data/                   # 数据管理页
│   ├── search/                 # 搜索页
│   └── settings/               # 设置页
├── features/                   # 功能模块
│   ├── tasks/
│   ├── mistakes/
│   ├── knowledge/
│   ├── home/
│   ├── search/
│   ├── stats/
│   └── data-management/
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         # 侧边栏导航（含 navItems 数组）
│   │   ├── top-bar.tsx         # 顶部栏
│   │   └── ...
│   └── ui/
│       └── icons.tsx           # SVG 图标库
├── lib/
│   ├── supabase/               # Supabase 服务端
│   │   ├── config.ts           # 读取服务端环境变量 (server-only)
│   │   ├── rest.ts             # REST API 封装 (server-only)
│   │   ├── tasks-repository.ts # 任务仓库
│   │   ├── study-records-repository.ts
│   │   ├── search-repository.ts
│   │   ├── mappers.ts          # snake_case <-> camelCase
│   │   └── public-config.ts    # 客户端环境变量读取
│   ├── local-data.ts           # localStorage hook
│   └── validation.ts           # 运行时数据校验
├── services/                   # 客户端 API 调用
│   ├── tasks.ts
│   ├── study-records.ts
│   ├── search.ts
│   └── request-json.ts         # 通用 fetch 封装
├── hooks/
│   └── use-auth-session.ts     # 认证状态 hook
└── types/
    └── database.ts             # DB 行类型定义
```

## 四、AI 聊天功能方案

### 需求

1. 网页版 AI 聊天界面（类似 ChatGPT）
2. 多模型支持（先用 DeepSeek，后续扩展 Claude/GPT/Gemini/GLM/Kimi）
3. 历史对话持久化，支持查询和自定义名称
4. 通用问答，不限于学习场景
5. 用户已有 DeepSeek API Key

### 技术方案

#### API 层 — 流式响应

新建 `POST /api/ai/chat`：
- 接收 `{ messages, model, conversationId }`
- 调用 DeepSeek API（OpenAI 兼容格式）后以 SSE 流式返回，前端实时打字
- 消息保存到 Supabase

#### AI Provider 抽象层 — `src/lib/ai/`

```
src/lib/ai/
├── types.ts                    # ChatMessage, ProviderConfig 等类型
├── providers/
│   ├── index.ts                # Provider 注册表
│   └── deepseek.ts             # DeepSeek 适配（OpenAI 兼容）
└── stream.ts                   # SSE 流式响应工具
```

后续加模型只需新增一个 provider 文件 + 注册到 index.ts。

#### 数据库 — 新建 2 张表

```sql
create table public.conversations (
  id text primary key,
  title text not null default '新对话',
  model text not null default 'deepseek-chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id text primary key,
  conversation_id text not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);
```

#### 仓库层 — `src/lib/supabase/chat-repository.ts`

沿用现有 Service 模式（service_role 直连）：
- `listConversationsService()` / `createConversationService()` / `renameConversationService()` / `deleteConversationService()`
- `listMessagesService()` / `insertMessageService()`

#### 前端 — `src/features/ai-chat/`

```
src/features/ai-chat/
├── types.ts
├── components/
│   ├── chat-page-client.tsx     # 主页面：左列表 + 右聊天
│   ├── conversation-sidebar.tsx # 对话列表（新建/重命名/删除）
│   ├── chat-area.tsx            # 聊天区（消息列表+输入框）
│   └── message-bubble.tsx       # 消息气泡（Markdown 渲染）
└── hooks/
    ├── use-chat.ts              # 聊天逻辑（发消息、流式接收）
    └── use-conversations.ts     # 对话列表管理
```

#### 导航

在 `sidebar.tsx` 的 `navItems` 中新增：
```tsx
{ href: "/ai", icon: SparklesIcon, label: "AI 助手" }
```

#### 数据流

```
用户输入消息
  → POST /api/ai/chat { messages, model, conversationId }
  → API route 调用 DeepSeek API（SSE 流式）
  → 前端实时渲染打字效果
  → 完成后保存 user + assistant 消息到 Supabase
  → 更新对话列表（按更新时间排序）
```

#### 新建文件清单（14 个）

| 文件 | 作用 |
|------|------|
| `src/lib/ai/types.ts` | AI 通用类型 |
| `src/lib/ai/providers/deepseek.ts` | DeepSeek 适配器 |
| `src/lib/ai/providers/index.ts` | Provider 注册表 |
| `src/lib/ai/stream.ts` | SSE 流式工具 |
| `src/lib/supabase/chat-repository.ts` | 对话/消息仓库 |
| `src/app/api/ai/chat/route.ts` | AI 聊天 API |
| `src/features/ai-chat/types.ts` | 前端类型 |
| `src/features/ai-chat/components/chat-page-client.tsx` | 主页面 |
| `src/features/ai-chat/components/conversation-sidebar.tsx` | 对话列表 |
| `src/features/ai-chat/components/chat-area.tsx` | 聊天区域 |
| `src/features/ai-chat/components/message-bubble.tsx` | 消息气泡 |
| `src/features/ai-chat/hooks/use-chat.ts` | 聊天 Hook |
| `src/features/ai-chat/hooks/use-conversations.ts` | 对话管理 Hook |
| `src/app/ai/page.tsx` | 路由入口 |

#### 修改文件（4 个）

| 文件 | 改动 |
|------|------|
| `src/components/layout/sidebar.tsx` | +1 导航项 |
| `src/components/ui/icons.tsx` | +SparklesIcon |
| `.env.local` | +DEEPSEEK_API_KEY |
| `.env.example` | +DEEPSEEK_API_KEY |

## 五、不改动的部分

- 现有所有页面和 API 完全不变
- 现有数据表不变（仅新增 conversations + messages 表）
- 侧边栏只是尾部新增一个入口
- Service role 模式、数据同步逻辑全部不变
