import express from "express";
import auditsRouter from "./modules/audits/routes/audits.routes";
import auditPreviewRouter from "./modules/audit-preview/routes/audit-preview.routes";
import scheduledAuditsRouter from "./modules/scheduled-audits/routes/scheduled-audits.routes";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok", service: "crawlix-api" });
});
app.use("/api/audits", auditsRouter);
app.use("/api/audit-preview", auditPreviewRouter);
app.use("/api/cron/audits", scheduledAuditsRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API error:", error);
  response.status(500).json({ error: "An unexpected server error occurred." });
});
