import Animal from "../models/Animal.js";
import CareLog from "../models/CareLog.js";

export const getCareLogsByAnimalId = async (req, res) => {
  try {
    const { animalId } = req.params;

    const animalLogs = await CareLog.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      animalId,
      count: animalLogs.length,
      data: animalLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch care logs",
      error: error.message,
    });
  }
};

export const createCareLog = async (req, res) => {
  try {
    const {
      animalId,
      userId,
      actionType,
      notes,
      photoProof = false,
      location,
      source = "app_user",
      quantityNote = "",
    } = req.body;

    if (!animalId || !userId || !actionType) {
      return res.status(400).json({
        success: false,
        message: "animalId, userId, and actionType are required",
      });
    }

    const allowedActions = [
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
      "food_available_but_not_eaten",
    ];

    if (!allowedActions.includes(actionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid actionType",
        allowedActions,
      });
    }

    const animal = await Animal.findOne({ id: animalId });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const logCount = await CareLog.countDocuments();
    const now = new Date();

    const newCareLog = await CareLog.create({
      id: `log_${String(logCount + 1).padStart(3, "0")}`,
      animalId,
      userId,
      actionType,
      notes: notes || "",
      quantityNote,
      photoProof,
      location: location || null,
      createdAt: now,
      source,
    });

    animal.lastSeenAt = now;
    animal.seenByCommunityCount = (animal.seenByCommunityCount || 0) + 1;
    animal.careTags = animal.careTags || [];

    if (actionType === "food_given") {
      animal.lastFoodAt = now;
      animal.foodCountThisWeek = (animal.foodCountThisWeek || 0) + 1;

      animal.careTags = animal.careTags.filter(
        (tag) => tag !== "needs_food" && tag !== "food_irregular"
      );

      if (!animal.careTags.includes("food_given_today")) {
        animal.careTags.push("food_given_today");
      }
    }

    if (actionType === "water_given") {
      animal.lastWaterAt = now;
      animal.waterCountThisWeek = (animal.waterCountThisWeek || 0) + 1;

      animal.careTags = animal.careTags.filter(
        (tag) =>
          tag !== "needs_water" &&
          tag !== "needs_clean_water" &&
          tag !== "water_irregular"
      );

      if (!animal.careTags.includes("water_given_today")) {
        animal.careTags.push("water_given_today");
      }
    }

    if (actionType === "reported_problem") {
      if (!animal.careTags.includes("followup_photo_needed")) {
        animal.careTags.push("followup_photo_needed");
      }
    }

    if (actionType === "dog_refused_food" || actionType === "food_offered_refused") {
      if (!animal.careTags.includes("refused_food")) {
        animal.careTags.push("refused_food");
      }

      if (!animal.careTags.includes("observe_again")) {
        animal.careTags.push("observe_again");
      }
    }

    if (actionType === "other_dogs_fighting") {
      if (!animal.careTags.includes("unsafe_feeding_area")) {
        animal.careTags.push("unsafe_feeding_area");
      }
    }

    if (actionType === "unsafe_feeding_area") {
      if (!animal.careTags.includes("unsafe_feeding_area")) {
        animal.careTags.push("unsafe_feeding_area");
      }
    }

    if (actionType === "not_found") {
      if (!animal.careTags.includes("not_seen_recently")) {
        animal.careTags.push("not_seen_recently");
      }
    }

    if (actionType === "followup_photo_uploaded") {
      animal.careTags = animal.careTags.filter(
        (tag) => tag !== "followup_photo_needed"
      );

      if (!animal.careTags.includes("followup_photo_uploaded")) {
        animal.careTags.push("followup_photo_uploaded");
      }
    }

    await animal.save();

    res.status(201).json({
      success: true,
      message: "Care log created and animal memory updated successfully",
      data: {
        careLog: newCareLog,
        updatedAnimal: animal,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create care log",
      error: error.message,
    });
  }
};