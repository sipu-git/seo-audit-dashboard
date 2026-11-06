import { Router } from "express";
import { createAuditController, getAuditStatusController, listAuditsController } from "../controllers/audits.controller";
import { getAuditReportController } from "../controllers/audit-report.controller";

const router = Router();

router.get("/", listAuditsController);
router.post("/", createAuditController);
router.get("/:jobId/report", getAuditReportController);
router.get("/:jobId", getAuditStatusController);

export default router;
