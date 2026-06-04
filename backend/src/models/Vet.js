import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const vetSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    clinicName: {
      type: String,
      required: true,
    },

    doctorName: {
      type: String,
      default: "Unknown / Public Listing",
    },

    clusterId: {
      type: String,
      default: null,
      index: true,
    },

    servesDogIds: {
      type: [String],
      default: [],
    },

    area: String,
    addressHint: String,

    location: {
      type: locationSchema,
      required: true,
    },

    rating: {
      type: mongoose.Schema.Types.Mixed,
      default: "unknown",
    },

    hours: {
      type: String,
      default: "unknown",
    },

    availableForGuidance: {
      type: Boolean,
      default: false,
    },

    emergencySupport: {
      type: mongoose.Schema.Types.Mixed,
      default: "unknown",
    },

    lowCostGuidance: {
      type: String,
      default: "unknown",
    },

    streetAnimalSupport: {
      type: String,
      default: "unknown",
    },

    phone: {
      type: String,
      default: null,
    },

    chatLink: {
      type: String,
      default: null,
    },

    videoCallLink: {
      type: String,
      default: null,
    },

    source: {
      type: String,
      default: "manual",
    },

    partnershipStatus: {
      type: String,
      default: "not_contacted_yet",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Vet = mongoose.model("Vet", vetSchema);

export default Vet;