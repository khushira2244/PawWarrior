import mongoose from "mongoose";

const fundControllerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "pawwarrior_admin",
    },
    id: {
      type: String,
      default: "admin_001",
    },
    name: {
      type: String,
      default: "PawWarrior Care Admin",
    },
  },
  { _id: false }
);

const contributorSchema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    amount: Number,
    platformFee: Number,
    netAmountForCare: Number,
    currency: {
      type: String,
      default: "INR",
    },
    paymentMode: {
      type: String,
      default: "demo_pledge_plus_upi_intent",
    },
    paymentStatus: String,
    upiIntentLink: String,
    transactionRef: String,
    note: String,
    moneyGoesToFinder: {
      type: Boolean,
      default: false,
    },
    createdAt: Date,
  },
  { _id: false }
);

const releasePolicySchema = new mongoose.Schema(
  {
    requiresProof: {
      type: Boolean,
      default: true,
    },
    moneyGoesToFinder: {
      type: Boolean,
      default: false,
    },
    allowedReleaseTargets: {
      type: [String],
      default: [
        "vet_clinic",
        "medicine_purchase_with_bill",
        "food_purchase_with_bill",
        "verified_transport",
      ],
    },
  },
  { _id: false }
);

const auditTrailSchema = new mongoose.Schema(
  {
    action: String,
    by: String,
    at: Date,
    note: String,
  },
  { _id: false }
);

const careFundSchema = new mongoose.Schema(
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

    createdBy: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      required: true,
    },

    estimatedAmount: {
      type: Number,
      required: true,
    },

    collectedAmount: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["open", "funded", "closed"],
      default: "open",
      index: true,
    },

    paymentMode: {
      type: String,
      default: "demo_pledge_plus_upi_intent",
    },

    paymentVerificationMode: {
      type: String,
      default: "manual_or_demo",
    },

    adminUpiId: {
      type: String,
      default: null,
    },

    fundController: {
      type: fundControllerSchema,
      default: () => ({}),
    },

    moneyGoesToFinder: {
      type: Boolean,
      default: false,
    },

    contributors: {
      type: [contributorSchema],
      default: [],
    },

    releasePolicy: {
      type: releasePolicySchema,
      default: () => ({}),
    },

    auditTrail: {
      type: [auditTrailSchema],
      default: [],
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const CareFund = mongoose.model("CareFund", careFundSchema);

export default CareFund;