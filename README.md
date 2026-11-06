# Crawlix SEO Audit Workspace

Crawlix is organized as two separate applications:

- `frontend/` contains only the Next.js UI and its browser-side dependencies.
- `backend/` contains the Express API, BullMQ worker, live SEO providers, crawl/AI/report services, and Prisma schema/migrations.

The frontend does not import backend source or backend packages. It calls `/api/*`; Next.js proxies those requests to the local API during development, and Vercel routes them to the backend service in production.

## Requirements

- Node.js 20 or newer
- Redis, PostgreSQL, and an NVIDIA API key for a complete audit
- Chrome installed by Puppeteer for local PDF generation

## Local setup

Install each package independently from the repository root:

```powershell
npm ci --prefix frontend
npm ci --prefix backend
```

Create local environment files and add your credentials:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item backend/.env.example backend/.env
```

The frontend environment file only needs `BACKEND_API_URL=http://localhost:4000`. Database, Redis, NVIDIA, cron, crawl, storage, and webhook credentials belong in `backend/.env`. Never commit either local environment file.

Generate Prisma Client and migrate the database:

```powershell
npm run prisma:generate --prefix backend
npm run prisma:migrate --prefix backend -- --name initial_setup
```

Install Puppeteer's Chrome browser for local PDF generation:

```powershell
npm exec --prefix backend -- puppeteer browsers install chrome
```

Start three processes in separate terminals:

```powershell
npm run dev --prefix frontend
npm run api --prefix backend
npm run worker --prefix backend
```

Open `http://localhost:3000`. The API listens on port `4000`, and the Next.js rewrite forwards `/api/*` requests to it. Open `/docs` for the in-app project guide.

## Backend environment

Copy `backend/.env.example` and configure the needed services. `DATABASE_URL` is the transaction-pool connection for the application; `DIRECT_URL` is used by Prisma migrations. `REDIS_URL` connects BullMQ. `NVIDIA_API_KEY` authorizes analysis with NVIDIA Nemotron.

Audits use live crawl and PageSpeed data. Search Console and DataForSEO are queried only when their credentials are configured; otherwise the audit records those sources as unavailable instead of inserting sample data. Set `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN` and optionally `GOOGLE_SEARCH_CONSOLE_PROPERTY` for Search Console, and `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` for rankings. `NVIDIA_API_KEY` is required for analysis. Configure `AUDIT_COMPLETED_WEBHOOK_URL` to receive completion events. Set `AUDIT_REPORT_STORAGE=s3` and the AWS variables to store PDFs in a private S3 bucket; local storage is intended for development.

The backend entry point is `backend/index.ts`; `backend/app.ts` mounts feature routers. Business features keep their HTTP, validation, service, and persistence code together:

```text
backend/
  app.ts
  index.ts
  modules/
    audits/
      routes/
      controllers/
      services/
      repositories/
      validations/
    audit-preview/
      routes/
      controllers/
      services/
      repositories/   # live provider adapters
      validations/
    scheduled-audits/
      routes/
      controllers/
      services/
      repositories/
      validations/
    worker/
      services/
    shared/            # database, queue, crawler, AI, reports, storage, notifications
```

No mock provider data is used.

## Prisma commands

```powershell
npm run prisma:generate --prefix backend
npm run prisma:migrate --prefix backend -- --name describe_change
npm run prisma:deploy --prefix backend
npm run prisma:studio --prefix backend
```

The schema and migrations live in `backend/prisma/`, with the model and enum definitions split into subfolders. Use `prisma migrate dev` to create local migrations and `prisma migrate deploy` to apply committed migrations in production.

## Production deployment on Vercel

Set the Vercel project root to the repository root. The root `vercel.json` defines a Next.js frontend service, an Express API container service, and a continuously running BullMQ worker daemon. `/api/*` is routed to the API service; other requests go to the frontend.

Configure the backend variables from `backend/.env.example` in Vercel Production. Configure the frontend service with `BACKEND_API_URL` only if needed outside the Vercel route setup. Deploy the production branch and check Runtime Logs for `Crawlix API listening on port ...`, `Worker listening on seo-audit-jobs`, and audit completion/failure messages.

For scheduled audits, configure cron-job.org to call `GET /api/cron/audits` with the header `Authorization: Bearer <CRON_SECRET>`. Set `CRON_SECRET`, `CRON_AUDIT_INTERVAL`, and `SCHEDULED_AUDIT_TARGETS` in the backend service and worker environments.

## Important implementation notes

- The crawler only visits public HTTP/S hosts, observes robots rules, stays on the submitted origin, and has a configurable page limit.
- Google Search Console requires authorization for the website's property. Keyword ranking data requires a configured provider. Unavailable sources should be labeled rather than silently replaced with sample data.
- The admin portal is currently a monitoring view. Add authentication and role-based access before exposing client records in a production multi-user application.
