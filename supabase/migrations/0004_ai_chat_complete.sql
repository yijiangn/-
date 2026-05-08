-- ==========================================
-- AI 聊天助手 + 密码管理 完整建表
-- 在 Supabase SQL Editor 中一次性执行
-- ==========================================

-- 1. 应用配置表（密码、会话版本号）
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- 默认密码和版本号（如果还没有）
insert into public.app_config (key, value) values ('admin_password', 'fh324223..')
  on conflict (key) do nothing;
insert into public.app_config (key, value) values ('session_version', '1')
  on conflict (key) do nothing;

-- 2. 对话表
create table if not exists public.conversations (
  id text primary key,
  title text not null default '新对话',
  provider text not null default 'deepseek',
  model text not null default 'deepseek-v4-flash',
  system_prompt text,
  summary text,
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_updated on public.conversations(updated_at desc);

-- 3. 消息表
create table if not exists public.messages (
  id text primary key,
  conversation_id text not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null default '',
  reasoning_content text,
  provider text,
  model text,
  status text not null default 'completed'
    check (status in ('streaming', 'completed', 'failed', 'aborted')),
  finish_reason text,
  error_message text,
  token_input integer default 0,
  token_output integer default 0,
  sequence integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, sequence);
