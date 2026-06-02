import express from "express";
import {
  getCasesByAnimalId,
  getOpenCases,
  createCase,
  updateCaseStatus,
} from "../controllers/case.controller.js";

const router = express.Router();

router.get("/open", getOpenCases);
router.get("/animal/:animalId", getCasesByAnimalId);

router.post("/", createCase);
router.patch("/:caseId/status", updateCaseStatus);

export default router;