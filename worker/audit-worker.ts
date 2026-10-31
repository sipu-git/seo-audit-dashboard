import { loadEnvConfig } from "@next/env";
import { AuditStatus, Prisma } from "@prisma/client";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { SEO_AUDIT_QUEUE, type AuditJobInput } from "../src/lib/audit-queue";
import { prisma } from "../src/lib/prisma";
import { notifyAuditCompleted } from "../src/lib/notifications/audit-completed";
import { closePdfBrowser } from "../src/lib/reports/pdf/browser";
import { generateAuditPdf } from "../src/lib/reports/pdf/generate";
import { storeAuditReport } from "../src/lib/storage/reports";

async function main() {
  loadEnvConfig(process.cwd());

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is missing. Add the Upstash TCP URL to .env.local.");
  }

  const { getAuditPreview } = await import("../app/api/audit-preview/audit.service");
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

  const worker = new Worker<AuditJobInput>(
    SEO_AUDIT_QUEUE,
    async (job) => {
      if (!job.id) {
        throw new Error("Audit job is missing its BullMQ job ID.");
      }

      const jobId = job.id;
      const input = job.data;

      const auditRecord = await prisma.audit.upsert({
        where: { jobId },
        create: {
          jobId,
          url: input.url,
          businessType: input.businessType,
          city: input.city,
          state: input.state,
          status: AuditStatus.PROCESSING,
        },
        update: {
          url: input.url,
          businessType: input.businessType,
          city: input.city,
          state: input.state,
          status: AuditStatus.PROCESSING,
          error: null,
          completedAt: null,
        },
      });

      await job.updateProgress(10);
      try {
        const result = await getAuditPreview(input, (progress) => job.updateProgress(progress));

        await prisma.audit.update({
          where: { jobId },
          data: {
            overallScore: result.analysis.overall_score,
            dataSources: result.dataSources as Prisma.InputJsonValue,
            signals: result.signals as Prisma.InputJsonValue,
            analysis: result.analysis as Prisma.InputJsonValue,
            note: result.note,
            error: null,
            reportPath: null,
          },
        });

        await job.updateProgress(92);
        const pdf = await generateAuditPdf({
          jobId,
          createdAt: auditRecord.createdAt,
          business: input,
          analysis: result.analysis,
          dataSources: result.dataSources,
          note: result.note,
        });

        await job.updateProgress(96);
        const reportPath = await storeAuditReport(jobId, pdf);

        await prisma.audit.update({
          where: { jobId },
          data: {
            status: AuditStatus.COMPLETED,
            reportPath,
            error: null,
            completedAt: new Date(),
          },
        });

        await notifyAuditCompleted({
          jobId,
          url: input.url,
          overallScore: result.analysis.overall_score,
        });

        await job.updateProgress(100);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Audit failed.";
        await prisma.audit.update({
          where: { jobId },
          data: { status: AuditStatus.FAILED, error: message },
        });
        throw error;
      }
    },
    { connection },
  );

  worker.on("ready", () => console.log(`Worker listening on ${SEO_AUDIT_QUEUE}`));
  worker.on("completed", (job) => console.log(`Audit job ${job.id} completed.`));
  worker.on("failed", (job, error) => {
    console.error(`Audit job ${job?.id ?? "unknown"} failed:`, error.message);
  });

  async function shutdown() {
    await worker.close();
    await closePdfBrowser();
    await connection.quit();
    await prisma.$disconnect();
    process.exit(0);
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Audit worker failed to start:", error);
  process.exitCode = 1;
});
