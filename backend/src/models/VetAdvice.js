import mongoose from "mongoose";

const vetAdviceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    animalId: {
      type: String,
      required: true,
      index: true,
    },

    caseId: {
      type: String,
      required: true,
      index: true,
    },

    requestedBy: {
      type: String,
      required: true,
    },

    vetId: {
      type: String,
      default: null,
      index: true,
    },

    requestType: {
      type: String,
      default: "basic_food_water_guidance",
    },

    status: {
      type: String,
      enum: ["requested", "completed", "cancelled"],
      default: "requested",
      index: true,
    },

    basicAdviceFee: {
      type: Number,
      default: 10,
    },

    paymentStatus: {
      type: String,
      default: "demo_not_charged",
    },

    userMessage: {
      type: String,
      default: "",
    },

    animalSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    caseSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    vetSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    advice: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    completedBy: {
      type: String,
      default: null,
    },

    safetyNote: {
      type: String,
      default:
        "This request is for basic food, water, precaution, and escalation guidance only. It is not a diagnosis or prescription.",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const VetAdvice = mongoose.model("VetAdvice", vetAdviceSchema);

export default VetAdvice;