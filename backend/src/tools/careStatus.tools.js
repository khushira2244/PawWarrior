const hoursSince = (isoDate) => {
  if (!isoDate) return Infinity;

  const past = new Date(isoDate).getTime();
  const now = Date.now();

  return (now - past) / (1000 * 60 * 60);
};

export const getFoodWaterStatus = (animal) => {
  const careTags = animal.careTags || [];
  const healthTags = animal.healthTags || [];

  const foodHours = hoursSince(animal.lastFoodAt);
  const waterHours = hoursSince(animal.lastWaterAt);

  const isSummerRisk =
    careTags.includes("summer_care_needed") ||
    healthTags.includes("possible_heat_exhaustion");

  const foodThreshold = 24;
  const waterThreshold = isSummerRisk ? 8 : 12;

  let foodStatus = "recently_given";
  let waterStatus = "recently_given";

  if (foodHours > foodThreshold * 1.5) {
    foodStatus = "needs_food";
  } else if (foodHours > foodThreshold) {
    foodStatus = "may_need_food";
  }

  if (waterHours > waterThreshold * 1.5) {
    waterStatus = "needs_water";
  } else if (waterHours > waterThreshold) {
    waterStatus = "may_need_water";
  }

  const careGaps = [];

  if (foodStatus === "needs_food" || foodStatus === "may_need_food") {
    careGaps.push(foodStatus);
  }

  if (waterStatus === "needs_water" || waterStatus === "may_need_water") {
    careGaps.push(waterStatus);
  }

  return {
    foodStatus,
    waterStatus,
    foodHoursSinceLast: Number.isFinite(foodHours)
      ? Math.round(foodHours)
      : null,
    waterHoursSinceLast: Number.isFinite(waterHours)
      ? Math.round(waterHours)
      : null,
    careGaps,
  };
};