import express from "express";
import {
  createCareFund,
  getCareFundsByAnimalId,
  contributeToCareFund,
} from "../controllers/careFund.controller.js";

const router = express.Router();

router.post("/", createCareFund);
router.get("/animal/:animalId", getCareFundsByAnimalId);
router.post("/:fundId/contribute", contributeToCareFund);

export default router;