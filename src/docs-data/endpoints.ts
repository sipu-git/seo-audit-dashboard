export const endpoints = [
  {
    method: "POST",
    path: "/api/audits",
    purpose: "Validate the audit details and enqueue a background job.",
  },
  {
    method: "GET",
    path: "/api/audits?limit=100",
    purpose: "Return the latest persisted audits for the admin dashboard.",
  },
  {
    method: "GET",
    path: "/api/audits/{jobId}",
    purpose: "Return the queue state, progress, result, and error for a job.",
  },
  {
    method: "GET",
    path: "/api/audits/{jobId}/report",
    purpose: "Download the completed PDF; returns a not-ready response before completion.",
  },
  {
    method: "POST",
    path: "/api/audit-preview",
    purpose: "Run the preview service directly without first queueing a job.",
  },
];