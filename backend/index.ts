import "dotenv/config";
import { app } from "./app";
import { closeAuditQueue } from "./modules/shared/queue/audit-queue";
import { prisma } from "./modules/shared/database/prisma";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Crawlix API listening on port ${port}`);
});

server.on("error", (error) => {
  console.error("Crawlix API failed to start:", error);
  process.exitCode = 1;
});

let isShuttingDown = false;
function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}; shutting down Crawlix API.`);

  server.close(async (error) => {
    if (error) {
      console.error("Unable to close the API server cleanly:", error);
      process.exitCode = 1;
    }

    try {
      await closeAuditQueue();
      await prisma.$disconnect();
    } catch (shutdownError) {
      console.error("Unable to close backend connections cleanly:", shutdownError);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
