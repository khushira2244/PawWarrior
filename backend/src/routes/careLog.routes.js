import express from "express";
import {
  getCareLogsByAnimalId,
  createCareLog,
} from "../controllers/careLog.controller.js";

const router = express.Router();

router.get("/:animalId", getCareLogsByAnimalId);
router.post("/", createCareLog);

export default router;