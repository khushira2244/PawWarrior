import { readJsonFile, writeJsonFile } from "./jsonData.service.js";

export const saveAgentRun = async ({
  trigger,
  userId,
  animalId = null,
  caseId = null,
  status = "completed",
  priority = "normal",
  mapFlag = null,
  steps = [],
  finalRecommendation = "",
  humanConfirmationRequired = false,
  metadata = {},
}) => {
  const agentRuns = await readJsonFile("agentRuns.json");

  const now = new Date().toISOString();

  const newAgentRun = {
    id: `agent_run_${String(agentRuns.length + 1).padStart(3, "0")}`,
    trigger,
    userId,
    animalId,
    caseId,
    status,
    priority,
    mapFlag,
    steps,
    finalRecommendation,
    humanConfirmationRequired,
    metadata,
    createdAt: now,
    updatedAt: now,
  };

  agentRuns.push(newAgentRun);

  await writeJsonFile("agentRuns.json", agentRuns);

  return newAgentRun;
};

export const getAgentRunsByAnimalId = async (animalId) => {
  const agentRuns = await readJsonFile("agentRuns.json");

  return agentRuns
    .filter((run) => run.animalId === animalId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};