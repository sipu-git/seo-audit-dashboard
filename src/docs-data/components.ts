export const components = [
  {
    area: "Pages and navigation",
    paths: "app/page.tsx · app/admin/page.tsx · app/docs/page.tsx",
    responsibility:
      "Map the client, admin, and guide URLs to their page components. AppShell provides the shared sidebar, page heading, breadcrumb, and footer.",
  },
  {
    area: "Dashboard UI",
    paths: "src/components/ · src/components/widgets/",
    responsibility:
      "Compose the client and admin dashboards from forms, metrics, history/table, selected-report, and detail-sheet components. Shared dashboard widgets keep metrics and status badges consistent.",
  },
  {
    area: "Client data and caching",
    paths: "src/components/query-provider.tsx · src/lib/audit-queries.ts",
    responsibility:
      "Create the shared TanStack Query client and typed fetchers for audit lists and individual job statuses. Active jobs are polled; polling pauses while the tab is in the background.",
  },
  {
    area: "HTTP API",
    paths: "app/api/audits/ · app/api/audit-preview/",
    responsibility:
      "Validate submitted audit input, enqueue jobs, list stored audits, return queue status, generate an optional synchronous preview, and deliver PDF reports.",
  },
  {
    area: "Queue and worker",
    paths: "src/lib/audit-queue.ts · worker/audit-worker.ts",
    responsibility:
      "Share the BullMQ queue definition between web/API and worker. The worker runs the crawl and analysis, updates job progress, persists outcomes, and triggers completion notifications.",
  },
  {
    area: "Crawl and analysis",
    paths: "src/lib/crawler/ · src/lib/ai/nemotron/ · src/mocks/",
    responsibility:
      "Fetch and parse the submitted HTML, inspect robots and sitemap metadata, combine results with configured provider signals, and turn the signals into structured findings.",
  },
  {
    area: "Persistence",
    paths: "prisma/ · src/lib/prisma.ts",
    responsibility:
      "Define the audit record and database client. The record stores job identity, business details, state, score, analysis, data-source labels, errors, and report reference.",
  },
  {
    area: "PDF and notifications",
    paths: "src/lib/reports/ · src/lib/storage/ · src/lib/notifications/ · src/lib/webhooks/",
    responsibility:
      "Render reports as PDFs, store and serve reports from local development storage or private S3, and deliver completion messages/webhook events (mock delivery by default).",
  },
];