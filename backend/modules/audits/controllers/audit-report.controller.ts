import type { Request, Response } from "express";
import { downloadAuditReport } from "../services/audit-report.service";

export async function getAuditReportController(request: Request, response: Response) {
  try {
    const report = await downloadAuditReport(request.params.jobId);
    if (report.kind === "not_found") {
      response.status(404).json({ error: "Audit report not found." });
      return;
    }
    if (report.kind === "not_ready") {
      response.status(409).json({ error: "The PDF report is not ready yet. Wait for the audit to complete, then try again." });
      return;
    }
    response.setHeader("Cache-Control", "private, no-store");
    if (report.kind === "redirect") {
      response.redirect(302, report.url);
      return;
    }

    const safeJobId = request.params.jobId.replace(/[^a-zA-Z0-9_-]/g, "_");
    response.status(200).set({
      "Content-Type": "application/pdf",
      "Content-Length": String(report.pdf.byteLength),
      "Content-Disposition": `attachment; filename="seo-audit-${safeJobId}.pdf"`,
    }).send(report.pdf);
  } catch (error) {
    console.error("Unable to deliver the audit PDF report:", error);
    response.status(503).json({ error: "Unable to download the PDF report." });
  }
}
