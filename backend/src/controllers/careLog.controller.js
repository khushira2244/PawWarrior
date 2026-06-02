import { readJsonFile, writeJsonFile } from "../services/jsonData.service.js";

export const getCareLogsByAnimalId = async (req, res) => {
  try {
    const { animalId } = req.params;

    const careLogs = await readJsonFile("careLogs.json");

    const animalLogs = careLogs
      .filter((log) => log.animalId === animalId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      "other_dogs_fighting",
      "unsafe_feeding_area",
      "not_found",
      "followup_photo_uploaded",
    ];

    if (!allowedActions.includes(actionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid actionType",
        allowedActions,
      });
    }

    const careLogs = await readJsonFile("careLogs.json");
    const animals = await readJsonFile("animals.json");

    const animalIndex = animals.findIndex((animal) => animal.id === animalId);

    if (animalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const now = new Date().toISOString();

    const newCareLog = {
      id: `log_${String(careLogs.length + 1).padStart(3, "0")}`,
      animalId,
      userId,
      actionType,
      notes: notes || "",
      photoProof,
      location: location || null,
      createdAt: now,
      source,
    };

    careLogs.push(newCareLog);

    const animal = animals[animalIndex];

    animal.lastSeenAt = now;
    animal.seenByCommunityCount = (animal.seenByCommunityCount || 0) + 1;

    animal.careTags = animal.careTags || [];

    if (actionType === "food_given") {
      animal.lastFoodAt = now;
      animal.foodCountThisWeek = (animal.foodCountThisWeek || 0) + 1;

      animal.careTags = animal.careTags.filter(
        (tag) => tag !== "needs_food" && tag !== "food_irregular"
      );
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
    }

    if (actionType === "reported_problem") {
      if (!animal.careTags.includes("followup_photo_needed")) {
        animal.careTags.push("followup_photo_needed");
      }
    }

    if (actionType === "dog_refused_food") {
      if (!animal.careTags.includes("observe_again")) {
        animal.careTags.push("observe_again");
      }
    }

    if (actionType === "other_dogs_fighting") {
      if (!animal.careTags.includes("unsafe_feeding_area")) {
        animal.careTags.push("unsafe_feeding_area");
      }
    }

    if (actionType === "not_found") {
      if (!animal.careTags.includes("not_seen_recently")) {
        animal.careTags.push("not_seen_recently");
      }
    }

    animals[animalIndex] = animal;

    await writeJsonFile("careLogs.json", careLogs);
    await writeJsonFile("animals.json", animals);

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