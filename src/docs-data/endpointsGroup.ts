export const environmentGroups = [
  {
    title: "Core services",
    values: [
      ["DATABASE_URL", "PostgreSQL connection used by Prisma."],
      ["DIRECT_URL", "Direct PostgreSQL connection for migrations."],
      ["REDIS_URL", "Redis connection used by BullMQ and the worker."],
      ["NVIDIA_API_KEY", "Server-side API key required for Nemotron analysis."],
      ["NVIDIA_MODEL_ID", "Optional model override; the service has a default."],
      ["USE_MOCKS", "Set to true to use the current sample provider signals."],
    ],
  },
  {
    title: "PDF storage and optional integrations",
    values: [
      ["AUDIT_REPORT_STORAGE", "Choose local or s3; auto-selects based on S3 configuration if omitted."],
      ["AUDIT_REPORTS_DIR", "Optional local directory for generated PDFs."],
      ["AWS_REGION / AWS_S3_BUCKET", "S3 location when private object storage is used."],
      ["AWS credentials or IAM role", "Server/worker identity used to access S3. Never expose credentials in client code."],
      ["AUDIT_COMPLETED_WEBHOOK_URL", "Optional HTTPS endpoint for completion events."],
    ],
  },
];