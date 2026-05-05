# Supabase 接入说明

## 1. 初始化 Supabase
1. 在 Supabase 创建项目。
2. 在 `SQL Editor` 执行 `supabase/migrations/0001_init.sql`。
3. 创建一个公开 bucket：`study-attachments`。
4. 把 `.env.example` 复制为 `.env.local`，填入：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`

## 2. Next.js 中的组织方式
- `src/lib/supabase/config.ts`：环境变量读取和校验
- `src/lib/supabase/rest.ts`：服务端访问 Supabase REST / Storage 的底层封装
- `src/lib/supabase/mappers.ts`：数据库行与前端模型互转
- `src/lib/supabase/*-repository.ts`：服务端仓库层
- `src/services/*.ts`：前端调用 `/api/*` 的服务层
- `src/app/api/*`：Next.js Route Handlers

## 3. 当前实现范围
- 任务：增删改查、归档
- 学习记录：错题/知识点增删改查、归档
- 图片/文件：上传到 Supabase Storage，并写入附件元数据
- 搜索：任务 + 错题 + 知识点统一搜索与筛选

## 4. 当前架构说明
- 页面仍保留本地缓存能力，避免 Supabase 未配置时项目直接不可用。
- 一旦 `.env.local` 配置完成，页面会优先从 `/api/*` 拉取 Supabase 数据，并把结果同步回本地缓存。
- 当前实现是 `单用户个人工具` 方案，使用服务端 Route Handler 持有 `service role key`。
- 后续若要加认证，可在表中补 `user_id` 并把 API 切到基于登录态的访问控制。
