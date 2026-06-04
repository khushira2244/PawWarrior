import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        lat: Number,
        lng: Number,
        label: String,
        area: String,
        city: String,
        state: String,
        country: String,
    },
    { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
    {
        status: String,
        changedBy: String,
        changedAt: Date,
        note: String,
    },
    { _id: false }
);

const vetStatusSchema = new mongoose.Schema(
    {
        needed: {
            type: Boolean,
            default: false,
        },
        assignmentStatus: {
            type: String,
            default: "not_required",
        },
        nearbyVetCount: {
            type: Number,
            default: 0,
        },
        assignedVetId: {
            type: String,
            default: null,
        },
        searchRadiusMeters: {
            type: Number,
            default: null,
        },
    },
    { _id: false }
);

const caseSchema = new mongoose.Schema(
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

        createdBy: {
            type: String,
            default: "system_seed",
        },

        caseType: {
            type: String,
            required: true,
        },

       priority: {
  type: String,
  enum: [
    "low",
    "low_to_medium",
    "medium",
    "medium_to_high",
    "high",
    "urgent"
  ],
  default: "medium",
  index: true,
},

        title: {
            type: String,
            default: "Untitled care case",
        },

        description: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "open",
                "in_progress",
                "vet_guidance_requested",
                "vet_guidance_completed",
                "care_fund_opened",
                "resolved",
                "closed",
            ],
            default: "open",
            index: true,
        },

        requiredActions: [String],

        safetyNote: {
            type: String,
            default:
                "This is not a veterinary diagnosis. Vet/NGO guidance is recommended when needed.",
        },

        location: {
            type: locationSchema,
            default: null,
        },

        vetStatus: {
            type: vetStatusSchema,
            default: () => ({}),
        },

        careFundId: {
            type: String,
            default: null,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        resolutionSummary: {
            type: String,
            default: "",
        },

        closedAt: {
            type: Date,
            default: null,
        },

        closedBy: {
            type: String,
            default: null,
        },

        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Case = mongoose.model("Case", caseSchema);

export default Case;