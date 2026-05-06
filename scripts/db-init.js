#!/usr/bin/env node

// 读取 .env.local 中的 Supabase 配置，然后通过 REST API 执行迁移 SQL。
// 由于 Supabase 托管版不提供直接 SQL 执行 API，此脚本打印迁移 SQL 并引导用户在 Dashboard 中执行。

const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.log("[提示] 未找到 .env.local，请先配置环境变量。");
    console.log("参考 .env.example 创建 .env.local 文件。");
    return null;
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
  }
  return env;
}

function main() {
  const env = loadEnv();
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "0001_init.sql");

  if (!fs.existsSync(sqlPath)) {
    console.log("[错误] 找不到迁移文件: supabase/migrations/0001_init.sql");
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("=" .repeat(60));
  console.log("  Supabase 数据库初始化");
  console.log("=" .repeat(60));
  console.log();

  if (env?.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("Supabase URL: " + env.NEXT_PUBLIC_SUPABASE_URL);
  }

  console.log();
  console.log("请按以下步骤操作：");
  console.log();
  console.log("  1. 打开 Supabase Dashboard");
  console.log("  2. 进入 SQL Editor");
  console.log("  3. 复制下方 SQL 语句");
  console.log("  4. 点击 Run 执行");
  console.log();
  console.log("-".repeat(60));
  console.log(sql);
  console.log("-".repeat(60));
  console.log();
  console.log("注意：只执行 0001_init.sql，不要执行 0002_auth_rls.sql。");
  console.log("      0002 添加了 user_id 字段和 RLS 策略，仅用于需要登录的模式。");
  console.log();
}

main();
