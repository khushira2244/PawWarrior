import AgentRun from "../models/AgentRun.js";

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
  const runCount = await AgentRun.countDocuments();
  const now = new Date();

  const newAgentRun = await AgentRun.create({
    id: `agent_run_${String(runCount + 1).padStart(3, "0")}`,
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
  });

  return newAgentRun.toObject();
};

export const getAgentRunsByAnimalId = async (animalId) => {
  const runs = await AgentRun.find({ animalId })
    .sort({ createdAt: -1 })
    .lean();

  return runs;
};

export const getAgentRunById = async (agentRunId) => {
  const run = await AgentRun.findOne({ id: agentRunId }).lean();
  return run;
};