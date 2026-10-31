import { sendAuditEmail } from "../../mocks/email.mock";
import { sendWhatsApp } from "../../mocks/twilio.mock";
import { emitAuditCompletedWebhook } from "../webhooks/audit-completed";

type AuditCompletedNotification = {
  jobId: string;
  url: string;
  overallScore: number;
};

export async function notifyAuditCompleted(audit: AuditCompletedNotification) {
  const reportDownloadPath = `/api/audits/${encodeURIComponent(audit.jobId)}/report`;
  const event = {
    id: `${audit.jobId}:audit.completed`,
    type: "audit.completed" as const,
    createdAt: new Date().toISOString(),
    data: {
      jobId: audit.jobId,
      url: audit.url,
      overallScore: audit.overallScore,
      reportDownloadPath,
    },
  };

  const deliveries = await Promise.allSettled([
    sendWhatsApp(audit.jobId, reportDownloadPath, audit.overallScore),
    sendAuditEmail({
      clientId: audit.jobId,
      reportPath: reportDownloadPath,
      score: audit.overallScore,
    }),
    emitAuditCompletedWebhook(event),
  ]);

  deliveries.forEach((delivery, index) => {
    if (delivery.status === "rejected") {
      console.error(`[AUDIT NOTIFICATION ${index + 1}] Delivery failed:`, delivery.reason);
    }
  });
}
