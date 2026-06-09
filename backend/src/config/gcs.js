import { Storage } from "@google-cloud/storage";

export const storage = new Storage();

export const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;

export const getAnimalImagesBucket = () => {
  if (!GCS_BUCKET_NAME) {
    throw new Error("GCS_BUCKET_NAME is missing");
  }

  return storage.bucket(GCS_BUCKET_NAME);
};