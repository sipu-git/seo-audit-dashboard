# Crawlix

Crawlix is an SEO audit workspace for local businesses and internal teams, built with Next.js.

## Project guide

Start the app and open `/docs` for the in-app guide to the client and admin dashboards, audit workflow, module responsibilities, API endpoints, data sources, and local setup.

Copy `.env.example` to `.env.local` for local development. Fill in the service credentials there; never commit `.env.local`.

## Crawler and technical checks

The worker checks `robots.txt` before crawling, respects the SEO-Audit-Bot allow/disallow rules, follows only a small number of safe HTTP redirects, and rejects localhost, private-network, link-local, reserved, and non-standard-port destinations. DNS answers are checked and pinned for each request to reduce SSRF and DNS-rebinding risk. HTML and text responses have size and timeout limits.

The crawler reads same-origin sitemap files and sitemap indexes, then crawls the submitted page plus up to `CRAWL_MAX_PAGES` pages discovered from sitemaps and same-origin links (default 8, maximum 25). It returns page metadata, title/description/headings, image alt gaps, canonical URLs, JSON-LD, robots rules, sitemap validity/counts, and crawl errors. JSON-LD checks are local structural checks for Schema.org context and `@type`; they do not replace Google's Rich Results Test or the full Schema.org validator.

## Scheduled audits with cron-job.org

The protected endpoint is `GET /api/cron/audits`. Configure cron-job.org to call `https://YOUR_DOMAIN/api/cron/audits` and add this request header in its Advanced settings:

```text
Authorization: Bearer YOUR_CRON_SECRET
```

Set `CRON_SECRET` in the Vercel Production environment and set `SCHEDULED_AUDIT_TARGETS` to a JSON array of target objects. Each object uses `url`, `businessType`, `city`, and `state`. A maximum of 30 targets is accepted. `CRON_AUDIT_INTERVAL=monthly` (default) queues each target once per month even if cron-job.org calls the endpoint more often. For a short demo, set `CRON_AUDIT_INTERVAL=2m` and configure the cron job to run every two minutes. Do not leave the two-minute setting on for a production schedule unless frequent repeat audits are intended.

The cron-job.org job must be enabled in its dashboard. For the current screenshot configuration, replace the root URL with `/api/cron/audits`, add the Authorization header, and switch **Enable job** on after the Vercel variables are set.

## PDF audit reports and mock delivery

The BullMQ worker generates an A4 PDF with Puppeteer after SEO analysis. It uploads to a private AWS S3 bucket when configured, or uses the operating system's temporary `reports/seo-audit-reports/` directory (`/tmp/reports/` on Linux/macOS) as a development fallback. Set `AUDIT_REPORT_STORAGE=s3` to require S3, or `AUDIT_REPORT_STORAGE=local` to force local mock storage. The local path can be overridden with `AUDIT_REPORTS_DIR`.

Add these server-only values to `.env.local` and the worker environment to enable S3 storage:

```env
AUDIT_REPORT_STORAGE=s3
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="your-private-bucket-name"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
```

The S3 integration uploads PDFs as private objects and creates a five-minute presigned download URL from the report route. Keep S3 Block Public Access enabled and grant the application only `s3:PutObject` and `s3:GetObject` permissions for the `seo-audit-reports/*` prefix. The AWS SDK can also use its default credential chain (including an IAM role) instead of access-key environment variables.

The worker logs mock WhatsApp and email deliveries after report generation. It also emits an `audit.completed` webhook event: without `AUDIT_COMPLETED_WEBHOOK_URL`, the event is logged as a mock; if configured, the worker posts the JSON event to that HTTPS URL. Email and WhatsApp are never sent to real recipients by these mock modules.

The local temporary directory is intended for assessment and development. It is not durable storage for a production deployment; use the required storage provider when moving beyond the mock implementation.

Keep the credentials out of client-side code and never commit `.env.local`. For local development, run the web app and worker in separate terminals: use `npm run dev` for the web app and `npm run worker` in a second terminal to process queued audits. The download button appears once the worker has generated and stored the PDF.

## Deploying the BullMQ worker on Vercel

The production Vercel deployment also starts the BullMQ consumer as a Vercel Daemon. `vercel.json` configures one `audit-worker` instance in Mumbai (`bom1`), and `Dockerfile.worker` installs dependencies, generates Prisma Client, installs Chrome for Puppeteer, and runs `npm run worker`.

Add the worker's required environment variables in Vercel Project Settings for Production: `REDIS_URL`, `DATABASE_URL`, `DIRECT_URL`, `USE_MOCKS=true`, `NVIDIA_API_KEY`, `NVIDIA_MODEL_ID`, `CRAWL_MAX_PAGES`, `AUDIT_REPORT_STORAGE=s3`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CRON_SECRET`, `CRON_AUDIT_INTERVAL`, and `SCHEDULED_AUDIT_TARGETS`. The Next.js web service needs `REDIS_URL`, both database URLs, and `USE_MOCKS=true`; set the cron variables for the web service too. Keep secrets in Vercel's environment settings; `.dockerignore` prevents local `.env` files and credentials from entering the daemon image.

Commit and push these files, then deploy the Production branch to Vercel. Check the project logs for `Worker listening on seo-audit-jobs` and job completion/error messages. Vercel Daemons run in production; `vercel dev` does not start them, so continue starting `npm run worker` locally during development. Daemons are in public beta and use provisioned-memory quota while running, including while idle.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
