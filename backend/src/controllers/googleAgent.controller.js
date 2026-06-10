import { selectPawWarriorTool } from "../services/gemini.service.js";

import {
  executePawWarriorTool,
  getAvailablePawWarriorTools,
  getPawWarriorToolConfig,
} from "../tools/orchestrator.tools.js";

const validateConfirmationPayload = ({ toolName, arguments: toolArguments }) => {
  if (!toolName) {
    throw new Error("toolName is required for confirmed execution");
  }

  if (!toolArguments || typeof toolArguments !== "object") {
    throw new Error("arguments are required for confirmed execution");
  }

  const toolConfig = getPawWarriorToolConfig(toolName);

  if (!toolConfig) {
    throw new Error(`Unsupported PawWarrior tool: ${toolName}`);
  }

  return toolConfig;
};

export const getGoogleAgentTools = async (req, res) => {
  try {
    res.json({
      success: true,
      count: getAvailablePawWarriorTools().length,
      data: getAvailablePawWarriorTools(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Google agent tools",
      error: error.message,
    });
  }
};

export const runGoogleAgentMission = async (req, res) => {
  try {
    const {
      mission,
      userId = "demo_user_001",
      context = {},

      // Used only after the user confirms a proposed write action.
      confirmed = false,
      toolName = null,
      arguments: confirmedArguments = null,
    } = req.body;

    /*
      MODE 1:
      The frontend sends a confirmed tool and arguments after the user
      approves a sensitive write action.
    */
    if (confirmed) {
      const toolConfig = validateConfirmationPayload({
        toolName,
        arguments: confirmedArguments,
      });

      const execution = await executePawWarriorTool({
        toolName,
        args: confirmedArguments,
        confirmed: true,
      });

      return res.json({
        success: true,
        mode: "confirmed_execution",
        message: "Confirmed PawWarrior action executed successfully",
        geminiDecision: null,
        tool: {
          name: toolName,
          actionType: toolConfig.actionType,
          requiresHumanConfirmation: toolConfig.requiresHumanConfirmation,
        },
        execution,
      });
    }

    /*
      MODE 2:
      Gemini reads the natural-language mission and selects a tool.
    */
    if (!mission || typeof mission !== "string" || !mission.trim()) {
      return res.status(400).json({
        success: false,
        message: "mission is required",
      });
    }

    const geminiDecision = await selectPawWarriorTool({
      mission: mission.trim(),
      userId,
      context,
    });

    if (!geminiDecision.selectedTool) {
      return res.json({
        success: true,
        mode: "no_tool_selected",
        message:
          geminiDecision.message ||
          "Gemini did not select a PawWarrior tool for this mission.",
        geminiDecision,
        execution: null,
      });
    }

    const toolConfig = getPawWarriorToolConfig(geminiDecision.selectedTool);

    if (!toolConfig) {
      return res.status(400).json({
        success: false,
        message: `Unsupported tool selected: ${geminiDecision.selectedTool}`,
      });
    }

    /*
      Read actions execute immediately.
      Write actions return a confirmation proposal first.
    */
    const execution = await executePawWarriorTool({
      toolName: geminiDecision.selectedTool,
      args: geminiDecision.arguments,
      confirmed: false,
    });

    const needsConfirmation = execution.requiresHumanConfirmation === true;

    res.json({
      success: true,
      mode: needsConfirmation
        ? "confirmation_required"
        : "tool_executed",
      message: needsConfirmation
        ? "Gemini selected an action that requires human confirmation."
        : "Gemini selected and executed a PawWarrior tool successfully.",
      mission: mission.trim(),
      userId,
      geminiDecision: {
        selectedTool: geminiDecision.selectedTool,
        arguments: geminiDecision.arguments,
        functionCallId: geminiDecision.functionCallId,
        modelText: geminiDecision.modelText,
        usageMetadata: geminiDecision.usageMetadata,
      },
      tool: {
        name: geminiDecision.selectedTool,
        actionType: toolConfig.actionType,
        requiresHumanConfirmation: toolConfig.requiresHumanConfirmation,
      },
      execution,
      confirmationRequest: needsConfirmation
        ? {
          confirmed: true,
          toolName: geminiDecision.selectedTool,
          arguments: {
            ...(geminiDecision.arguments || {}),

            // Keep original frontend context values that Gemini may drop
            ...(context || {}),

            // Important: preserve uploaded GCS image URL
            photoUrl:
              context?.photoUrl ||
              geminiDecision.arguments?.photoUrl ||
              null,
          },
          warning:
            "Review the proposed action before confirming. PawWarrior will not execute this write action without human approval.",
        }
        : null,

    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to run Gemini orchestrator mission",
      error: error.message,
    });
  }
};