import express from "express";
import {
  getVets,
  getNearbyVets,
  getVetById,
} from "../controllers/vet.controller.js";

const router = express.Router();

router.get("/", getVets);
router.get("/nearby", getNearbyVets);
router.get("/:vetId", getVetById);

export default router;