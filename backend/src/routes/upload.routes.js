import express from "express";
import {
  animalPhotoUploadMiddleware,
  uploadAnimalPhoto,
} from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/animal-photo", animalPhotoUploadMiddleware, uploadAnimalPhoto);

export default router;