# content-repurposer webapp

内容一键多平台改写的付费 Web 版。用户粘贴内容，选平台，调用 Anthropic API 生成小红书/Twitter/X/公众号/短视频口播稿/知乎风格版本。免费用户每天3次，付费用户购买月卡（30天不限次）或次数包（100次）解锁。

## 本地开发

```bash
npm install
cp .env.local.example .env.local  # 填入真实值
npx prisma generate
npx prisma db push   # 首次建表(需要一个可用的 PostgreSQL DATABASE_URL)
npm run dev
```

## 环境变量

见 `.env.local.example`：

- `ANTHROPIC_API_KEY` — Anthropic API key，用于生成改写内容
- `DATABASE_URL` — PostgreSQL 连接串（推荐 Vercel Postgres / Neon 的免费额度）
- `EMAIL_SERVER_*` / `EMAIL_FROM` — 邮箱登录用的 SMTP 配置（Auth.js Nodemailer provider）
- `ADMIN_KEY` — 人工核销后台 `/admin/orders?key=xxx` 的访问密码

## 目录说明

- `app/page.tsx` — 首页：粘贴内容 + 选平台 + 生成
- `app/api/repurpose/route.ts` — 核心接口：校验登录+额度，调 Anthropic API
- `app/pricing/page.tsx` — 定价页，Phase 0 人工核销购买流程
- `app/admin/orders/page.tsx` — 人工核销后台，标记订单已付款
- `lib/anthropic.ts` — Anthropic API 封装，读取 `lib/prompts/*.md` 平台风格规则
- `lib/db.ts` — 数据库连接 + 用量/额度校验逻辑
- `lib/auth.ts` — Auth.js 邮箱登录配置
- `prisma/schema.prisma` — User / Session / Order / UsageLog 表

## 部署

```bash
vercel login
vercel link
vercel env add ANTHROPIC_API_KEY
vercel env add DATABASE_URL
vercel env add EMAIL_SERVER_HOST
vercel env add EMAIL_SERVER_PORT
vercel env add EMAIL_SERVER_USER
vercel env add EMAIL_SERVER_PASSWORD
vercel env add EMAIL_FROM
vercel env add ADMIN_KEY
vercel --prod
```

部署后运行一次 `npx prisma db push`（指向生产数据库）建表。
