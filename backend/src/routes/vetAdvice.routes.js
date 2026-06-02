import express from "express";
import {
  requestVetAdvice,
  completeVetAdvice,
  getVetAdviceByAnimalId,
} from "../controllers/vetAdvice.controller.js";

const router = express.Router();

router.post("/request", requestVetAdvice);
router.post("/:caseId/complete", completeVetAdvice);
router.get("/animal/:animalId", getVetAdviceByAnimalId);

export default router;