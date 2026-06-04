import Vet from "../models/Vet.js";
import { calculateDistanceMeters } from "../tools/geo.tools.js";

export const getVets = async (req, res) => {
  try {
    const vets = await Vet.find().sort({ id: 1 }).lean();

    res.json({
      success: true,
      count: vets.length,
      data: vets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vets",
      error: error.message,
    });
  }
};

export const getVetById = async (req, res) => {
  try {
    const { vetId } = req.params;

    const vet = await Vet.findOne({ id: vetId }).lean();

    if (!vet) {
      return res.status(404).json({
        success: false,
        message: "Vet not found",
      });
    }

    res.json({
      success: true,
      data: vet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vet",
      error: error.message,
    });
  }
};

export const getNearbyVets = async (req, res) => {
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

    const vets = await Vet.find().lean();

    const nearbyVets = vets
      .map((vet) => {
        const vetLocation = vet.location;

        if (!vetLocation?.lat || !vetLocation?.lng) {
          return null;
        }

        const distanceMeters = calculateDistanceMeters(
          lat,
          lng,
          vetLocation.lat,
          vetLocation.lng
        );

        return {
          ...vet,
          distanceMeters,
        };
      })
      .filter(Boolean)
      .filter((vet) => vet.distanceMeters <= radius)
      .sort((a, b) => {
        const availabilityRank = {
          available: 3,
          limited: 2,
          unavailable: 1,
        };

        const bRank = availabilityRank[b.availabilityStatus] || 0;
        const aRank = availabilityRank[a.availabilityStatus] || 0;

        if (bRank !== aRank) return bRank - aRank;

        return a.distanceMeters - b.distanceMeters;
      });

    res.json({
      success: true,
      count: nearbyVets.length,
      radius,
      data: nearbyVets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby vets",
      error: error.message,
    });
  }
};