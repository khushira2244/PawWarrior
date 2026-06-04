import mongoose from "mongoose";

const centerSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const areaBoundsSchema = new mongoose.Schema(
  {
    north: Number,
    south: Number,
    east: Number,
    west: Number,
  },
  { _id: false }
);

const locationClusterSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    area: {
      type: String,
      default: "",
      index: true,
    },

    city: {
      type: String,
      default: "Hyderabad",
    },

    state: {
      type: String,
      default: "Telangana",
    },

    country: {
      type: String,
      default: "India",
    },

    center: {
      type: centerSchema,
      required: true,
    },

    radiusMeters: {
      type: Number,
      default: 1000,
    },

    bounds: {
      type: areaBoundsSchema,
      default: null,
    },

    animalIds: {
      type: [String],
      default: [],
    },

    vetIds: {
      type: [String],
      default: [],
    },

    openCaseIds: {
      type: [String],
      default: [],
    },

    carePressure: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },

    mapStatus: {
      type: String,
      enum: ["green", "yellow", "orange", "red"],
      default: "green",
      index: true,
    },

    priorityReasons: {
      type: [String],
      default: [],
    },

    stats: {
      totalAnimals: {
        type: Number,
        default: 0,
      },
      redFlagAnimals: {
        type: Number,
        default: 0,
      },
      orangeFlagAnimals: {
        type: Number,
        default: 0,
      },
      foodWaterGapAnimals: {
        type: Number,
        default: 0,
      },
      openCases: {
        type: Number,
        default: 0,
      },
      availableVets: {
        type: Number,
        default: 0,
      },
    },

    lastUpdatedBy: {
      type: String,
      default: "system",
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

const LocationCluster = mongoose.model(
  "LocationCluster",
  locationClusterSchema
);

export default LocationCluster;