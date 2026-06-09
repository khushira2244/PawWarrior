import multer from "multer";
import { getAnimalImagesBucket, GCS_BUCKET_NAME } from "../config/gcs.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024,
  },
});

export const animalPhotoUploadMiddleware = upload.single("photo");

export const uploadAnimalPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No photo uploaded",
      });
    }

    const bucket = getAnimalImagesBucket();

    const extension = req.file.originalname.split(".").pop() || "jpg";
    const fileName = `animal-scans/scan_${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}.${extension}`;

    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
      resumable: false,
    });

    await file.makePublic();

    const photoUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileName}`;

    return res.status(201).json({
      success: true,
      message: "Animal photo uploaded successfully",
      data: {
        photoUrl,
        fileName,
      },
    });
  } catch (error) {
    console.error("Upload animal photo failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload animal photo",
      error: error.message,
    });
  }
};