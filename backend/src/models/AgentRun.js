import mongoose from "mongoose";

const agentStepSchema = new mongoose.Schema(
  {
    agent: {
      type: String,
      required: true,
    },

    toolUsed: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["completed", "failed", "skipped", "pending"],
      default: "completed",
    },

    result: {
      type: String,
      default: "",
    },

    inputSummary: {
      type: String,
      default: "",
    },

    resultSummary: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const agentRunSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    trigger: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    animalId: {
      type: String,
      default: null,
      index: true,
    },

    caseId: {
      type: String,
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["completed", "failed", "pending"],
      default: "completed",
      index: true,
    },

    priority: {
      type: String,
      default: "normal",
      index: true,
    },

    mapFlag: {
      type: String,
      default: null,
    },

    steps: {
      type: [agentStepSchema],
      default: [],
    },

    finalRecommendation: {
      type: String,
      default: "",
    },

    humanConfirmationRequired: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AgentRun = mongoose.model("AgentRun", agentRunSchema);

export default AgentRun;