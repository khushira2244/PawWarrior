import { readJsonFile } from "../services/jsonData.service.js";
import { calculateDistanceMeters } from "../tools/geo.tools.js";

const buildVetContactOptions = (vet) => {
  const cleanPhone = vet.phone ? String(vet.phone).replace(/\D/g, "") : null;

  return {
    phone: vet.phone || null,
    phoneLink: cleanPhone ? `tel:+${cleanPhone}` : null,
    chatLink:
      vet.chatLink || (cleanPhone ? `https://wa.me/${cleanPhone}` : null),
    videoCallLink: vet.videoCallLink || null,
    contactStatus: cleanPhone || vet.chatLink || vet.videoCallLink
      ? "contact_available"
      : "contact_not_added",
  };
};

const getVetAvailabilityRank = (vet) => {
  if (vet.emergencySupport === true) return 4;
  if (vet.availableForGuidance === true && vet.lowCostGuidance === "likely") {
    return 3;
  }
  if (vet.availableForGuidance === true) return 2;
  return 1;
};

export const getVets = async (req, res) => {
  try {
    const vets = await readJsonFile("vets.json");

    const normalizedVets = vets.map((vet) => ({
      ...vet,
      contactOptions: buildVetContactOptions(vet),
    }));

    res.json({
      success: true,
      count: normalizedVets.length,
      data: normalizedVets,
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

    const vets = await readJsonFile("vets.json");
    const vet = vets.find((item) => item.id === vetId);

    if (!vet) {
      return res.status(404).json({
        success: false,
        message: "Vet not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...vet,
        contactOptions: buildVetContactOptions(vet),
      },
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

    const vets = await readJsonFile("vets.json");

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
          contactOptions: buildVetContactOptions(vet),
          guidanceRank: getVetAvailabilityRank(vet),
        };
      })
      .filter(Boolean)
      .filter((vet) => vet.distanceMeters <= radius)
      .sort((a, b) => {
        if (b.guidanceRank !== a.guidanceRank) {
          return b.guidanceRank - a.guidanceRank;
        }

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