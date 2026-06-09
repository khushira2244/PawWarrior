import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const uploadBase64ImageToGCS = async ({ base64Image, fileName }) => {
  if (!base64Image) return null;

  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  const contentType = matches?.[1] || "image/jpeg";
  const base64Data = matches?.[2] || base64Image;

  const buffer = Buffer.from(base64Data, "base64");

  const file = bucket.file(`animals/${Date.now()}-${fileName}`);

  await file.save(buffer, {
    metadata: {
      contentType,
    },
    resumable: false,
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${file.name}`;
};