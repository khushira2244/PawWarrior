import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        lat: Number,
        lng: Number,
        label: String,
    },
    { _id: false }
);

const careLogSchema = new mongoose.Schema(
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

        userId: {
            type: String,
            required: true,
        },

        actionType: {
            type: String,
            required: true,
            enum: [
                "food_given",
                "water_given",
                "observed_only",
                "reported_problem",
                "dog_refused_food",
                "food_offered_refused",
                "other_dogs_fighting",
                "unsafe_feeding_area",
                "not_found",
                "followup_photo_uploaded",
                "water_available_observed",
                "food_available_observed",
                "food_water_present_observed",
                "food_available_but_not_eaten"
            ],
        },

        notes: {
            type: String,
            default: "",
        },

        photoProof: {
            type: Boolean,
            default: false,
        },

        location: {
            type: locationSchema,
            default: null,
        },

        source: {
            type: String,
            default: "app_user",
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const CareLog = mongoose.model("CareLog", careLogSchema);

export default CareLog;