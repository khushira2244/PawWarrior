import express from "express";
import {
  getAnimals,
  getAnimalById,
  getNearbyAnimals,
  createAnimal,
} from "../controllers/animal.controller.js";

const router = express.Router();

router.get("/", getAnimals);
router.get("/nearby", getNearbyAnimals);
router.get("/:animalId", getAnimalById);

router.post("/", createAnimal);

export default router;