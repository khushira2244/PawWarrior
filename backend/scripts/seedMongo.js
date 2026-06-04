import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "../src/config/db.js";

import Animal from "../src/models/Animal.js";
import CareLog from "../src/models/CareLog.js";
import Case from "../src/models/Case.js";
import Vet from "../src/models/Vet.js";
import VetAdvice from "../src/models/VetAdvice.js";
import CareFund from "../src/models/CareFund.js";
import AgentRun from "../src/models/AgentRun.js";
import LocationCluster from "../src/models/LocationCluster.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "..", "data");

const readJson = async (fileName) => {
  const filePath = path.join(dataPath, fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
};

const seedCollection = async (Model, data, label) => {
  await Model.deleteMany({});
  await Model.insertMany(data);
  console.log(`${label} seeded: ${data.length}`);
};

const seedMongo = async () => {
  try {
    await connectDB();

    const animals = await readJson("animals.json");
    const careLogs = await readJson("careLogs.json");
    const cases = await readJson("cases.json");
    const vets = await readJson("vets.json");
    const vetAdvice = await readJson("vetAdvice.json");
    const careFunds = await readJson("careFunds.json");
    const agentRuns = await readJson("agentRuns.json");
    const locationClusters = await readJson("locationClusters.json");

    await seedCollection(Animal, animals, "Animals");
    await seedCollection(CareLog, careLogs, "CareLogs");
    await seedCollection(Case, cases, "Cases");
    await seedCollection(Vet, vets, "Vets");
    await seedCollection(VetAdvice, vetAdvice, "VetAdvice");
    await seedCollection(CareFund, careFunds, "CareFunds");
    await seedCollection(AgentRun, agentRuns, "AgentRuns");
    await seedCollection(LocationCluster, locationClusters, "LocationClusters");

    console.log("MongoDB seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB seeding failed:", error.message);
    process.exit(1);
  }
};

seedMongo();