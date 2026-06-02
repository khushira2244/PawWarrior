import fs from "fs/promises";
import path from "path";

const dataPath = path.join(process.cwd(), "..", "data");

export const readJsonFile = async (fileName) => {
  const filePath = path.join(dataPath, fileName);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
};

export const writeJsonFile = async (fileName, data) => {
  const filePath = path.join(dataPath, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};