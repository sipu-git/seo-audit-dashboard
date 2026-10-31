import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { AuditJobInput } from "./audit-input";

export type { AuditJobInput } from "./audit-input";

export const SEO_AUDIT_QUEUE = "seo-audit-jobs";

type QueueGlobals = typeof globalThis & {
  seoAuditQueue?: Queue<AuditJobInput>;
  seoAuditRedis?: IORedis;
};

const globalForQueue = globalThis as QueueGlobals;

export function getAuditQueue() {
  if (globalForQueue.seoAuditQueue) {
    return globalForQueue.seoAuditQueue;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is missing. Add the Upstash TCP URL to .env.local.");
  }

  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: 1 });
  const queue = new Queue<AuditJobInput>(SEO_AUDIT_QUEUE, { connection });

  globalForQueue.seoAuditRedis = connection;
  globalForQueue.seoAuditQueue = queue;
  return queue;
}
