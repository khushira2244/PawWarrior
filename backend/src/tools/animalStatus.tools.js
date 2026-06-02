import { getFoodWaterStatus } from "./careStatus.tools.js";

export const getAnimalMapStatus = (animal) => {
  const condition = animal.currentCondition;
  const careTags = animal.careTags || [];
  const healthTags = animal.healthTags || [];

  const careStatus = getFoodWaterStatus(animal);

  const hasUrgentVet =
    condition === "serious_issue" ||
    healthTags.includes("urgent_vet_escalation") ||
    healthTags.includes("severe_malnutrition") ||
    healthTags.includes("severe_lethargy") ||
    healthTags.includes("suspected_leg_injury") ||
    healthTags.includes("nursing_mother") ||
    healthTags.includes("possible_heat_exhaustion");

  if (hasUrgentVet) {
    return {
      mapStatus: "red",
      statusLabel: "Vet guidance needed",
      primaryNeed: [
        ...careStatus.careGaps,
        "vet_guidance",
      ],
      careStatus,
    };
  }

  const hasMildIssue =
    condition === "mild_issue" ||
    healthTags.includes("possible_skin_condition") ||
    healthTags.includes("possible_skin_irritation") ||
    healthTags.includes("visible_skin_patches") ||
    healthTags.includes("thin_body_condition") ||
    careTags.includes("followup_photo_needed");

  if (hasMildIssue) {
    return {
      mapStatus: "orange",
      statusLabel: "Follow-up needed",
      primaryNeed:
        careStatus.careGaps.length > 0
          ? [...careStatus.careGaps, "observe", "follow_up"]
          : ["observe", "follow_up"],
      careStatus,
    };
  }

  const needsFoodWater = careStatus.careGaps.length > 0;

  if (needsFoodWater) {
    return {
      mapStatus: "yellow",
      statusLabel: "Food/water needed",
      primaryNeed: careStatus.careGaps,
      careStatus,
    };
  }

  return {
    mapStatus: "green",
    statusLabel: "Recently cared / stable",
    primaryNeed: ["observe"],
    careStatus,
  };
};