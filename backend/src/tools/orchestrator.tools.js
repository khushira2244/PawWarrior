import { pawWarriorToolNames } from "../config/geminiTools.js";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const getApiBaseUrl = () =>
  process.env.PAWWARRIOR_API_BASE_URL || DEFAULT_API_BASE_URL;

const toolRegistry = {
  find_nearby_animals: {
    method: "GET",
    path: ({ lat, lng, radius = 3000 }) =>
      `/api/animals/nearby?lat=${encodeURIComponent(
        lat
      )}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`,
    requiresHumanConfirmation: false,
    actionType: "read",
  },

  open_profile: {
    method: "POST",
    path: () => "/api/agents/run/open-profile",
    requiresHumanConfirmation: false,
    actionType: "read_and_analyze",
  },

  log_care: {
    method: "POST",
    path: () => "/api/agents/run/log-care",
    requiresHumanConfirmation: true,
    actionType: "write",
  },

  find_nearby_vets: {
    method: "GET",
    path: ({ lat, lng, radius = 3000 }) =>
      `/api/vets/nearby?lat=${encodeURIComponent(
        lat
      )}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`,
    requiresHumanConfirmation: false,
    actionType: "read",
  },

  request_vet_advice: {
    method: "POST",
    path: () => "/api/agents/run/request-vet-advice",
    requiresHumanConfirmation: true,
    actionType: "write",
  },

  contribute_fund: {
    method: "POST",
    path: () => "/api/agents/run/contribute-fund",
    requiresHumanConfirmation: true,
    actionType: "financial_write",
  },

  scan_new_dog: {
    method: "POST",
    path: () => "/api/agents/run/scan-new-dog",
    requiresHumanConfirmation: true,
    actionType: "multi_record_write",
  },
};

const sanitizeToolArguments = (toolName, args = {}) => {
  const sanitized = { ...args };

  // Gemini must never invent or override these safety-sensitive values.
  if (toolName === "scan_new_dog") {
    sanitized.aiObservation = {
      ...(sanitized.aiObservation || {}),
      diagnosis: "not_provided",
    };

    if (!sanitized.firstActionType) {
      sanitized.firstActionType = "observed_only";
    }

    if (
      sanitized.openCareFund &&
      (!sanitized.estimatedAmount || Number(sanitized.estimatedAmount) <= 0)
    ) {
      sanitized.openCareFund = false;
      delete sanitized.estimatedAmount;
      delete sanitized.fundPurpose;
    }
  }

  if (toolName === "contribute_fund") {
    sanitized.amount = Number(sanitized.amount);

    if (!Number.isFinite(sanitized.amount) || sanitized.amount <= 0) {
      throw new Error("A valid contribution amount greater than 0 is required.");
    }
  }

  return sanitized;
};

const buildRequestOptions = ({ method, args }) => {
  if (method === "GET") {
    return {
      method,
      headers: {
        Accept: "application/json",
      },
    };
  }

  return {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(args),
  };
};

export const getPawWarriorToolConfig = (toolName) => {
  if (!pawWarriorToolNames.has(toolName)) {
    return null;
  }

  return toolRegistry[toolName] || null;
};

export const requiresHumanConfirmation = (toolName) => {
  const config = getPawWarriorToolConfig(toolName);
  return config?.requiresHumanConfirmation ?? true;
};

export const executePawWarriorTool = async ({
  toolName,
  args = {},
  confirmed = false,
}) => {
  if (!pawWarriorToolNames.has(toolName)) {
    throw new Error(`Unsupported PawWarrior tool: ${toolName}`);
  }

  const config = toolRegistry[toolName];

  if (!config) {
    throw new Error(`No executor configured for tool: ${toolName}`);
  }

  const sanitizedArgs = sanitizeToolArguments(toolName, args);

  if (config.requiresHumanConfirmation && !confirmed) {
    return {
      executed: false,
      requiresHumanConfirmation: true,
      toolName,
      actionType: config.actionType,
      proposedArguments: sanitizedArgs,
      message: "Human confirmation is required before this action is executed.",
    };
  }

  const apiBaseUrl = getApiBaseUrl();
  const path = config.path(sanitizedArgs);
  const url = `${apiBaseUrl}${path}`;

  const response = await fetch(
    url,
    buildRequestOptions({
      method: config.method,
      args: sanitizedArgs,
    })
  );

  const result = await response.json().catch(() => ({
    success: false,
    message: "Tool returned a non-JSON response.",
  }));

  if (!response.ok) {
    throw new Error(
      result?.message || `Tool execution failed with status ${response.status}`
    );
  }

  return {
    executed: true,
    requiresHumanConfirmation: false,
    toolName,
    actionType: config.actionType,
    result,
  };
};

export const getAvailablePawWarriorTools = () =>
  Object.entries(toolRegistry).map(([name, config]) => ({
    name,
    method: config.method,
    actionType: config.actionType,
    requiresHumanConfirmation: config.requiresHumanConfirmation,
  }));