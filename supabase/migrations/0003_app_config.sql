-- 应用配置表（密码、版本号等）
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- 插入默认配置（密码和版本号）
insert into public.app_config (key, value) values ('admin_password', 'fh324223..')
  on conflict (key) do nothing;
insert into public.app_config (key, value) values ('session_version', '1')
  on conflict (key) do nothing;
