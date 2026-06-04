import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    label: String,
    area: String,
    city: String,
    state: String,
    country: String,
    lat: Number,
    lng: Number,
    source: String,
  },
  { _id: false }
);

const animalSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sourceId: String,
    name: {
      type: String,
      required: true,
    },
    species: {
      type: String,
      default: "dog",
    },
    relationship: String,
    profileStatus: {
      type: String,
      default: "active",
    },

    breed: {
      aiEstimate: String,
      communityLabel: String,
      verifiedBreed: String,
      confidence: String,
      status: String,
    },

    identityFeatures: {
      color: String,
      size: String,
      uniqueMarks: [String],
      furCondition: String,
      bodyCondition: String,
    },

    photos: [String],
    usualLocations: [locationSchema],
    normalBehaviour: String,

    currentCondition: String,
    careTags: [String],
    healthTags: [String],
    environmentTags: [String],

    aiObservation: {
      visibleConcern: Boolean,
      conditionHint: String,
      diagnosis: String,
      notes: String,
    },

    missingStatus: {
      type: String,
      default: "active",
    },

    foodCountThisWeek: {
      type: Number,
      default: 0,
    },
    waterCountThisWeek: {
      type: Number,
      default: 0,
    },

    lastFoodAt: Date,
    lastWaterAt: Date,
    lastSeenAt: Date,

    seenByCommunityCount: {
      type: Number,
      default: 1,
    },

    createdBy: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Animal = mongoose.model("Animal", animalSchema);

export default Animal;