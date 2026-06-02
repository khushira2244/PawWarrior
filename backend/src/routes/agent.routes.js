import express from "express";
import {
  getAgentRunsForAnimal,
  runOpenProfileAgent,
  runLogCareAgent,
  runRequestVetAdviceAgent,
  runContributeFundAgent,
  runScanNewDogAgent,
} from "../controllers/agent.controller.js";

const router = express.Router();

router.get("/runs/animal/:animalId", getAgentRunsForAnimal);

router.post("/run/open-profile", runOpenProfileAgent);
router.post("/run/log-care", runLogCareAgent);
router.post("/run/request-vet-advice", runRequestVetAdviceAgent);
router.post("/run/contribute-fund", runContributeFundAgent);
router.post("/run/scan-new-dog", runScanNewDogAgent);

export default router;