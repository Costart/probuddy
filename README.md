# Cloudflare Next.js Template

A production-ready starter template for building full-stack apps with **Next.js**, **Cloudflare D1** (SQLite), and **Auth.js**.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Auth**: Auth.js v5 (Credentials provider, JWT sessions)
- **Hosting**: Cloudflare Workers via @opennextjs/cloudflare
- **Styling**: Tailwind CSS v4 with Material Design 3 tokens
- **Password hashing**: Web Crypto API (PBKDF2)

## What is included

- Landing page with sign-up / sign-in links
- Email + password authentication (signup, login, logout)
- Protected dashboard route with middleware
- M3-inspired design system (Indigo + Teal)
- Reusable UI components (Button, Card, Input)
- Observability enabled by default (free Cloudflare logs and traces)
- Ready-to-uncomment R2, cron triggers, and staging environment configs
- Zero monthly cost on Cloudflare free tier

## Quick Start

### Prerequisites

- Node.js 18+
- A Cloudflare account (https://dash.cloudflare.com)

### 1. Clone and install

```bash
git clone https://github.com/Costart/cloudflare-nextjs-template.git my-app
cd my-app
npm install
```

### 2. Create a D1 database

```bash
npx wrangler login
npx wrangler d1 create my-app-db
```

Copy the database_id from the output and update wrangler.jsonc.

### 3. Set up environment

```bash
cp .env.local.example .env.local
```

Generate an auth secret:

```bash
npx auth secret
```

Paste the value into .env.local as AUTH_SECRET.

### 4. Generate and apply migrations

```bash
npm run db:generate
npm run db:migrate:local
```

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 6. Deploy

```bash
npm run db:migrate:remote
npm run deploy
```

Set secrets on the worker:

```bash
echo your-secret | npx wrangler secret put AUTH_SECRET
npx wrangler secret put AUTH_URL --text https://your-app.workers.dev
```

## Project Structure

```
src/
+-- app/
|   +-- (auth)/          # Login + Signup pages
|   +-- (dashboard)/     # Protected dashboard
|   +-- api/auth/        # Auth.js + signup API routes
|   +-- globals.css      # Tailwind + design tokens
|   +-- layout.tsx       # Root layout
+-- components/
|   +-- auth/            # LoginForm, SignupForm
|   +-- layout/          # DashboardNav
|   +-- ui/              # Button, Card, Input
+-- lib/
    +-- auth.ts          # Auth.js config
    +-- password.ts      # Web Crypto password hashing
    +-- utils.ts         # cn() helper
    +-- db/
        +-- index.ts     # D1 database connection
        +-- schema.ts    # Drizzle schema (users table)
```

## Configuring wrangler.jsonc

The template comes with a wrangler.jsonc that includes commented-out sections for common Cloudflare features. Uncomment what you need:

### R2 Object Storage

For file uploads, images, or any blob storage:

1. Create a bucket: npx wrangler r2 bucket create my-app-uploads
2. Uncomment the r2_buckets section in wrangler.jsonc
3. Uncomment the BUCKET type in env.d.ts
4. Access in code via getCloudflareContext().env.BUCKET

### Environment Variables and Secrets

- **Non-secret values** (like AUTH_URL): add to the vars section in wrangler.jsonc
- **Secrets** (API keys, AUTH_SECRET): set via CLI, never commit to code

```bash
echo your-secret | npx wrangler secret put AUTH_SECRET
npx wrangler secret put AUTH_URL --text https://your-domain.com
```

### Observability

Enabled by default. View logs and traces in the Cloudflare dashboard (https://dash.cloudflare.com) under Workers > your worker > Logs.

### Cron Triggers

For scheduled tasks (cleanup jobs, sending emails, etc.):

1. Uncomment the triggers section in wrangler.jsonc
2. Add a scheduled handler in your worker

### Staging Environment

For a separate staging deployment with isolated D1/R2 bindings:

1. Create a staging database: npx wrangler d1 create my-app-db-staging
2. Uncomment the env.staging section in wrangler.jsonc
3. Deploy to staging: npx wrangler deploy --env staging

## Adding tables

1. Edit src/lib/db/schema.ts to add new tables
2. Run npm run db:generate to create a migration
3. Run npm run db:migrate:local (local) or npm run db:migrate:remote (production)

## License

MIT
