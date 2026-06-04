

import { readJsonFile, writeJsonFile } from "../services/jsonData.service.js";



import Animal from "../models/Animal.js";
import { calculateDistanceMeters } from "../tools/geo.tools.js";
import { getAnimalMapStatus } from "../tools/animalStatus.tools.js";

export const getAnimals = async (req, res) => {
  try {
    const animals = await Animal.find().sort({ createdAt: -1 }).lean();

    const enrichedAnimals = animals.map((animal) => ({
      ...animal,
      mapStatus: getAnimalMapStatus(animal),
    }));

    res.json({
      success: true,
      count: enrichedAnimals.length,
      data: enrichedAnimals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch animals",
      error: error.message,
    });
  }
};

export const getAnimalById = async (req, res) => {
  try {
    const { animalId } = req.params;

    const animal = await Animal.findOne({ id: animalId }).lean();

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...animal,
        mapStatus: getAnimalMapStatus(animal),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch animal",
      error: error.message,
    });
  }
};

export const getNearbyAnimals = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 3000);

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "lat and lng are required",
      });
    }

    const animals = await Animal.find({
      profileStatus: "active",
    }).lean();

    const nearbyAnimals = animals
      .map((animal) => {
        const primaryLocation = animal.usualLocations?.[0];

        if (!primaryLocation?.lat || !primaryLocation?.lng) {
          return null;
        }

        const distanceMeters = calculateDistanceMeters(
          lat,
          lng,
          primaryLocation.lat,
          primaryLocation.lng
        );

        return {
          ...animal,
          distanceMeters,
          mapStatus: getAnimalMapStatus(animal),
        };
      })
      .filter(Boolean)
      .filter((animal) => animal.distanceMeters <= radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      success: true,
      count: nearbyAnimals.length,
      radius,
      data: nearbyAnimals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby animals",
      error: error.message,
    });
  }
};

export const createAnimal = async (req, res) => {
  try {
    const {
      name,
      species = "dog",
      createdBy,
      relationship = "new_community_dog",
      profileStatus = "active",
      breed = {
        aiEstimate: "unknown / indie-type dog",
        communityLabel: "Unknown",
        verifiedBreed: null,
        confidence: "low",
        status: "unverified",
      },
      identityFeatures = {
        color: "unknown",
        size: "unknown",
        uniqueMarks: [],
      },
      photos = [],
      usualLocations = [],
      normalBehaviour = "",
      currentCondition = "unknown",
      careTags = [],
      healthTags = [],
      environmentTags = [],
      aiObservation = {
        visibleConcern: false,
        conditionHint: "unknown",
        diagnosis: "not_provided",
        notes: "PawWarrior does not diagnose from image.",
      },
      missingStatus = "active",
      notes = "",
    } = req.body;

    if (!name || !createdBy || usualLocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "name, createdBy, and at least one usualLocation are required",
      });
    }

    const primaryLocation = usualLocations[0];

    if (!primaryLocation.lat || !primaryLocation.lng) {
      return res.status(400).json({
        success: false,
        message: "usualLocations[0].lat and usualLocations[0].lng are required",
      });
    }

    const animalCount = await Animal.countDocuments();
    const now = new Date();

    const newAnimal = await Animal.create({
      id: `dog_${String(animalCount + 1).padStart(3, "0")}`,
      sourceId: null,
      name,
      species,
      relationship,
      profileStatus,
      createdAt: now,
      lastSeenAt: now,
      breed,
      identityFeatures,
      photos,
      usualLocations,
      normalBehaviour,
      currentCondition,
      careTags,
      healthTags,
      environmentTags,
      aiObservation,
      missingStatus,
      foodCountThisWeek: 0,
      waterCountThisWeek: 0,
      lastFoodAt: null,
      lastWaterAt: null,
      seenByCommunityCount: 1,
      createdBy,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Animal profile created successfully",
      data: {
        ...newAnimal.toObject(),
        mapStatus: getAnimalMapStatus(newAnimal.toObject()),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create animal profile",
      error: error.message,
    });
  }
};