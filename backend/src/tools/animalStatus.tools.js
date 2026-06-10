import { getFoodWaterStatus } from "./careStatus.tools.js";

export const getAnimalMapStatus = (animal) => {
  const condition = animal.currentCondition;
  const careTags = animal.careTags || [];
  const healthTags = animal.healthTags || [];

  const careStatus = getFoodWaterStatus(animal);

  const needsVetGuidance =
    healthTags.includes("needs_vet_guidance") ||
    healthTags.includes("urgent_vet_escalation") ||
    healthTags.includes("possible_skin_condition") ||
    healthTags.includes("severe_malnutrition") ||
    healthTags.includes("severe_lethargy") ||
    healthTags.includes("suspected_leg_injury") ||
    healthTags.includes("nursing_mother") ||
    healthTags.includes("possible_heat_exhaustion") ||
    condition === "serious_issue";

  const hasMildIssue =
    condition === "mild_issue" ||
    healthTags.includes("possible_skin_irritation") ||
    healthTags.includes("visible_skin_patches") ||
    healthTags.includes("thin_body_condition") ||
    careTags.includes("followup_photo_needed");

  const primaryNeed = [...careStatus.careGaps];

  if (hasMildIssue || needsVetGuidance) {
    primaryNeed.push("observe", "follow_up");
  }

  if (needsVetGuidance) {
    primaryNeed.push("vet_guidance");
  }

  const uniquePrimaryNeed = [...new Set(primaryNeed)];

  if (needsVetGuidance) {
    return {
      mapStatus: "red",
      statusLabel: "Vet guidance needed",
      primaryNeed: uniquePrimaryNeed,
      careStatus,
    };
  }

  if (hasMildIssue) {
    return {
      mapStatus: "orange",
      statusLabel: "Follow-up needed",
      primaryNeed: uniquePrimaryNeed,
      careStatus,
    };
  }

  if (careStatus.careGaps.length > 0) {
    return {
      mapStatus: "yellow",
      statusLabel: "Food/water needed",
      primaryNeed: uniquePrimaryNeed,
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