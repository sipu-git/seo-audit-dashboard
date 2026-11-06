import { Router } from "express";
import { createAuditPreviewController } from "../controllers/audit-preview.controller";

const router = Router();
router.post("/", createAuditPreviewController);

export default router;
