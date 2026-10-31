import { Activity, Database, Gauge, Play, Workflow } from "lucide-react";

export const workflow = [
  {
    number: "01",
    title: "Submit a website",
    description:
      "Enter a full website URL and the business type, city, and state. The form validates the required fields before it sends the request.",
    detail: "Client dashboard or Admin portal",
    icon: Play,
  },
  {
    number: "02",
    title: "Validate and enqueue",
    description:
      "The API checks the request and adds an SEO audit job to the BullMQ queue in Redis. The client receives a job ID without waiting for the analysis to finish.",
    detail: "POST /api/audits → BullMQ → Redis",
    icon: Workflow,
  },
  {
    number: "03",
    title: "Process the audit",
    description:
      "The separate worker records the job in PostgreSQL, crawls the submitted page, combines the crawl with sample provider signals, and requests a prioritized analysis.",
    detail: "worker/audit-worker.ts",
    icon: Activity,
  },
  {
    number: "04",
    title: "Save the report",
    description:
      "The worker stores the score and analysis, generates a PDF, saves it to the configured report storage, and marks the database record complete. Failures are recorded against the audit.",
    detail: "Prisma + PDF + local storage or private S3",
    icon: Database,
  },
  {
    number: "05",
    title: "Follow progress and review",
    description:
      "The dashboards query job status while work is active. The client can view progress and its report; admins can search, filter, page through jobs, and open audit details.",
    detail: "TanStack Query + audit status APIs",
    icon: Gauge,
  },
];
