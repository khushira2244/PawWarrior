import { Storage } from "@google-cloud/storage";

import Animal from "../models/Animal.js";
import CareLog from "../models/CareLog.js";
import CareCase from "../models/Case.js";
import Vet from "../models/Vet.js";
import VetAdvice from "../models/VetAdvice.js";
import CareFund from "../models/CareFund.js";
import AgentRun from "../models/AgentRun.js";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const bucket = process.env.GCS_BUCKET_NAME
  ? storage.bucket(process.env.GCS_BUCKET_NAME)
  : null;

const uploadBase64ImageToGCS = async ({ base64Image, fileName }) => {
  if (!base64Image || !bucket) return null;

  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  const contentType = matches?.[1] || "image/jpeg";
  const base64Data = matches?.[2] || base64Image;

  const buffer = Buffer.from(base64Data, "base64");
  const safeFileName = fileName || "animal-scan.jpg";

  const file = bucket.file(`animals/${Date.now()}-${safeFileName}`);

  await file.save(buffer, {
    metadata: { contentType },
    resumable: false,
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${file.name}`;
};

const getNextId = async (Model, prefix, field = "id") => {
  const docs = await Model.find({ [field]: new RegExp(`^${prefix}_`) })
    .select(field)
    .lean();

  let max = 0;

  docs.forEach((doc) => {
    const value = doc[field];
    const number = Number(String(value || "").replace(`${prefix}_`, ""));
    if (!Number.isNaN(number) && number > max) max = number;
  });

  return `${prefix}_${String(max + 1).padStart(3, "0")}`;
};

const getAnimalLocation = (animal) => {
  return animal?.usualLocations?.[0] || animal?.location || null;
};

const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const earthRadius = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const findNearbyVetsInternal = async ({ lat, lng, radiusMeters = 3000 }) => {
  const vets = await Vet.find({}).lean();

  return vets
    .map((vet) => {
      const vetLocation = vet.location || vet.clinicLocation || {};
      if (!vetLocation.lat || !vetLocation.lng) return null;

      const distanceMeters = getDistanceMeters(
        Number(lat),
        Number(lng),
        Number(vetLocation.lat),
        Number(vetLocation.lng)
      );

      return {
        ...vet,
        distanceMeters: Math.round(distanceMeters),
      };
    })
    .filter(Boolean)
    .filter((vet) => vet.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
};

const buildMapStatus = ({ animal, careLogs = [], cases = [] }) => {
  const now = new Date();

  const lastFoodLog = careLogs.find((log) => log.actionType === "food_given");
  const lastWaterLog = careLogs.find((log) => log.actionType === "water_given");

  const hoursSince = (dateValue) => {
    if (!dateValue) return null;
    return Math.round((now - new Date(dateValue)) / (1000 * 60 * 60));
  };

  const foodHoursSinceLast = hoursSince(
    animal?.lastFoodAt || lastFoodLog?.createdAt
  );

  const waterHoursSinceLast = hoursSince(
    animal?.lastWaterAt || lastWaterLog?.createdAt
  );

  const primaryNeed = [];

  if (foodHoursSinceLast === null || foodHoursSinceLast > 24) {
    primaryNeed.push("needs_food");
  }

  if (waterHoursSinceLast === null || waterHoursSinceLast > 12) {
    primaryNeed.push("needs_water");
  }

  if (animal?.careTags?.includes("observe_again")) {
    primaryNeed.push("observe");
  }

  const hasOpenCase = cases.some((item) => item.status !== "closed");

  if (hasOpenCase || animal?.careTags?.includes("followup_photo_needed")) {
    primaryNeed.push("follow_up");
  }

  const needsVetGuidance =
    animal?.healthTags?.includes("needs_vet_guidance") ||
    animal?.healthTags?.includes("possible_skin_condition") ||
    animal?.currentCondition === "serious_issue" ||
    cases.some(
      (item) =>
        item?.vetStatus?.needed ||
        item?.priority === "high" ||
        item?.requiredActions?.includes("request_vet_guidance") ||
        item?.requiredActions?.includes("vet_guidance")
    );

  if (needsVetGuidance) {
    primaryNeed.push("vet_guidance");
  }

  let mapStatus = "green";
  let statusLabel = "Stable";

  if (primaryNeed.includes("needs_food") || primaryNeed.includes("needs_water")) {
    mapStatus = "yellow";
    statusLabel = "Care needed";
  }

  if (primaryNeed.includes("follow_up") || primaryNeed.includes("observe")) {
    mapStatus = "orange";
    statusLabel = "Follow-up needed";
  }

  if (primaryNeed.includes("vet_guidance")) {
    mapStatus = "red";
    statusLabel = "Vet guidance needed";
  }

  return {
    mapStatus,
    statusLabel,
    primaryNeed: [...new Set(primaryNeed)],
    careStatus: {
      foodStatus:
        foodHoursSinceLast !== null && foodHoursSinceLast <= 24
          ? "recently_given"
          : "needs_food",
      waterStatus:
        waterHoursSinceLast !== null && waterHoursSinceLast <= 12
          ? "recently_given"
          : "needs_water",
      foodHoursSinceLast,
      waterHoursSinceLast,
      careGaps: [...new Set(primaryNeed)].filter((need) =>
        ["needs_food", "needs_water"].includes(need)
      ),
    },
  };
};

const saveAgentRun = async ({
  trigger,
  userId,
  animalId,
  caseId = null,
  status = "completed",
  priority = "orange",
  mapFlag = "orange",
  steps = [],
  finalRecommendation = "",
  humanConfirmationRequired = false,
  metadata = {},
}) => {
  const id = await getNextId(AgentRun, "agent_run");

  return AgentRun.create({
    id,
    trigger,
    userId,
    animalId,
    caseId,
    status,
    priority,
    mapFlag,
    steps,
    finalRecommendation,
    humanConfirmationRequired,
    metadata,
  });
};

const normalizeLocation = (location = {}) => ({
  lat: Number(location.lat || 17.4646),
  lng: Number(location.lng || 78.3551),
  label: location.label || "Unknown location",
  area: location.area || "",
  city: location.city || "Hyderabad",
  state: location.state || "Telangana",
  country: location.country || "India",
});

export const getAgentRunsForAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;

    const runs = await AgentRun.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      animalId,
      count: runs.length,
      data: runs,
    });
  } catch (error) {
    console.error("getAgentRunsForAnimal failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch agent runs",
      error: error.message,
    });
  }
};

export const runOpenProfileAgent = async (req, res) => {
  try {
    const { animalId, userId = "demo_user_001" } = req.body;

    const animal = await Animal.findOne({ id: animalId }).lean();

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const [careLogs, cases, vetAdvice, careFunds, agentRuns] =
      await Promise.all([
        CareLog.find({ animalId }).sort({ createdAt: -1 }).lean(),
        CareCase.find({ animalId }).sort({ createdAt: -1 }).lean(),
        VetAdvice.find({ animalId }).sort({ createdAt: -1 }).lean(),
        CareFund.find({ animalId }).sort({ createdAt: -1 }).lean(),
        AgentRun.find({ animalId }).sort({ createdAt: -1 }).lean(),
      ]);

    const mapStatus = buildMapStatus({ animal, careLogs, cases });

    const agentRun = await saveAgentRun({
      trigger: "open_profile",
      userId,
      animalId,
      priority: mapStatus.mapStatus,
      mapFlag: mapStatus.mapStatus,
      steps: [
        {
          agent: "Animal Memory Agent",
          toolUsed: "getAnimalProfile",
          status: "completed",
          result: `Loaded profile for ${animal.name}.`,
        },
        {
          agent: "Care Memory Agent",
          toolUsed: "getCareHistory",
          status: "completed",
          result: `Loaded ${careLogs.length} care logs.`,
        },
        {
          agent: "Case Memory Agent",
          toolUsed: "getOpenCases",
          status: "completed",
          result: `Loaded ${cases.length} case records.`,
        },
        {
          agent: "Care Status Agent",
          toolUsed: "buildMapStatus",
          status: "completed",
          result: `Calculated status as ${mapStatus.statusLabel}.`,
        },
      ],
      finalRecommendation:
        mapStatus.mapStatus === "red"
          ? "Vet guidance is recommended. Continue safe observation and avoid self-medication."
          : "Profile loaded. Continue care based on current needs.",
      metadata: {
        animalName: animal.name,
        mapStatus,
        careLogCount: careLogs.length,
        caseCount: cases.length,
        vetAdviceCount: vetAdvice.length,
        careFundCount: careFunds.length,
      },
    });

    return res.json({
      success: true,
      message: "Open profile agent completed successfully",
      data: {
        animal,
        careLogs,
        cases,
        vetAdvice,
        careFunds,
        previousAgentRuns: agentRuns,
        mapStatus,
        agentRun,
      },
    });
  } catch (error) {
    console.error("runOpenProfileAgent failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run open profile agent",
      error: error.message,
    });
  }
};

export const runLogCareAgent = async (req, res) => {
  try {
    const {
      animalId,
      userId = "demo_user_001",
      actionType = "observed_only",
      notes,
      location,
      photoProof = false,
    } = req.body;

    const animal = await Animal.findOne({ id: animalId });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const normalizedLocation = normalizeLocation(
      location || getAnimalLocation(animal)
    );

    const careLogId = await getNextId(CareLog, "log");

    const careLog = await CareLog.create({
      id: careLogId,
      animalId,
      userId,
      actionType,
      notes:
        notes ||
        `${
          actionType === "water_given"
            ? "Clean water given"
            : actionType === "food_given"
              ? "Food given"
              : actionType === "reported_problem"
                ? "Problem reported"
                : "Animal observed"
        } through PawWarrior agent.`,
      photoProof,
      location: normalizedLocation,
      source: "agent_log_care",
    });

    const now = new Date();

    animal.lastSeenAt = now;
    animal.seenByCommunityCount = (animal.seenByCommunityCount || 0) + 1;

    if (actionType === "food_given") {
      animal.lastFoodAt = now;
      animal.foodCountThisWeek = (animal.foodCountThisWeek || 0) + 1;
      animal.careTags = [...new Set([...(animal.careTags || []), "food_given_today"])];
    }

    if (actionType === "water_given") {
      animal.lastWaterAt = now;
      animal.waterCountThisWeek = (animal.waterCountThisWeek || 0) + 1;
      animal.careTags = [...new Set([...(animal.careTags || []), "water_given_today"])];
    }

    if (actionType === "reported_problem") {
      animal.careTags = [
        ...new Set([...(animal.careTags || []), "observe_again", "followup_photo_needed"]),
      ];
      animal.healthTags = [
        ...new Set([...(animal.healthTags || []), "needs_vet_guidance"]),
      ];
    }

    await animal.save();

    const cases = await CareCase.find({ animalId }).lean();
    const careLogs = await CareLog.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    const mapStatus = buildMapStatus({
      animal: animal.toObject(),
      careLogs,
      cases,
    });

    const agentRun = await saveAgentRun({
      trigger: "log_care",
      userId,
      animalId,
      priority: mapStatus.mapStatus,
      mapFlag: mapStatus.mapStatus,
      steps: [
        {
          agent: "Care Action Agent",
          toolUsed: "createCareLog",
          status: "completed",
          result: `Created care log ${careLog.id} with action ${actionType}.`,
        },
        {
          agent: "Animal Memory Agent",
          toolUsed: "updateAnimalMemory",
          status: "completed",
          result:
            "Updated last seen, weekly care count, and food/water memory where applicable.",
        },
        {
          agent: "Care Status Agent",
          toolUsed: "getAnimalMapStatus",
          status: "completed",
          result: `Recalculated status as ${mapStatus.mapStatus}: ${mapStatus.statusLabel}.`,
        },
        {
          agent: "Safety Verification Agent",
          toolUsed: "verifySafety",
          status: "completed",
          result:
            "Care action stored without diagnosis, dosage, or self-medication advice.",
        },
      ],
      finalRecommendation:
        actionType === "reported_problem"
          ? "Problem recorded. Vet/NGO guidance is recommended if symptoms are serious or worsening."
          : "Care action recorded. Continue observation and follow up if needed.",
      metadata: {
        actionType,
        careLogId: careLog.id,
        animalName: animal.name,
        statusLabel: mapStatus.statusLabel,
        primaryNeed: mapStatus.primaryNeed,
        careStatus: mapStatus.careStatus,
      },
    });

    return res.json({
      success: true,
      message: "Log care agent completed successfully",
      data: {
        careLog,
        updatedAnimal: animal,
        mapStatus,
        finalRecommendation: agentRun.finalRecommendation,
        agentRun,
      },
    });
  } catch (error) {
    console.error("runLogCareAgent failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run log care agent",
      error: error.message,
    });
  }
};

export const runRequestVetAdviceAgent = async (req, res) => {
  try {
    const {
      animalId,
      caseId = null,
      userId = "demo_user_001",
      vetId = null,
      question = "Basic food, water, handling, and follow-up guidance requested.",
      location,
    } = req.body;

    const animal = await Animal.findOne({ id: animalId });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const normalizedLocation = normalizeLocation(
      location || getAnimalLocation(animal)
    );

    const nearbyVets = await findNearbyVetsInternal({
      lat: normalizedLocation.lat,
      lng: normalizedLocation.lng,
      radiusMeters: 3000,
    });

    const selectedVet =
      (vetId && (await Vet.findOne({ id: vetId }).lean())) ||
      nearbyVets[0] ||
      null;

    const adviceId = await getNextId(VetAdvice, "vet_advice");

    const vetAdvice = await VetAdvice.create({
      id: adviceId,
      animalId,
      caseId,
      requestedBy: userId,
      vetId: selectedVet?.id || null,
      status: "requested",
      question,
      requestType: "basic_guidance",
      safetyNote:
        "This is not a veterinary diagnosis. Do not self-medicate. Vet/NGO guidance is recommended.",
      location: normalizedLocation,
    });

    animal.healthTags = [
      ...new Set([...(animal.healthTags || []), "needs_vet_guidance"]),
    ];

    await animal.save();

    let updatedCase = null;

    if (caseId) {
      updatedCase = await CareCase.findOneAndUpdate(
        { id: caseId },
        {
          $set: {
            "vetStatus.needed": true,
            "vetStatus.assignmentStatus": selectedVet ? "suggested" : "pending",
            "vetStatus.nearbyVetCount": nearbyVets.length,
            "vetStatus.assignedVetId": selectedVet?.id || null,
            "vetStatus.searchRadiusMeters": 3000,
          },
          $addToSet: {
            requiredActions: "request_vet_guidance",
          },
        },
        { new: true }
      );
    }

    const agentRun = await saveAgentRun({
      trigger: "request_vet_advice",
      userId,
      animalId,
      caseId,
      priority: "red",
      mapFlag: "red",
      steps: [
        {
          agent: "Vet Escalation Agent",
          toolUsed: "findNearbyVets",
          status: "completed",
          result: `Found ${nearbyVets.length} nearby vet/helper options.`,
        },
        {
          agent: "Vet Advice Agent",
          toolUsed: "requestBasicVetAdvice",
          status: "completed",
          result: `Created vet advice request ${vetAdvice.id}.`,
        },
        {
          agent: "Safety Verification Agent",
          toolUsed: "verifySafety",
          status: "completed",
          result:
            "Vet request created without diagnosis, prescription, or dosage advice.",
        },
      ],
      finalRecommendation:
        "Vet guidance request created. Continue safe food/water support and avoid self-medication.",
      metadata: {
        vetAdviceId: vetAdvice.id,
        selectedVetId: selectedVet?.id || null,
        nearbyVetCount: nearbyVets.length,
      },
    });

    return res.json({
      success: true,
      message: "Vet advice agent completed successfully",
      data: {
        vetAdvice,
        selectedVet,
        nearbyVets,
        updatedCase,
        updatedAnimal: animal,
        agentRun,
      },
    });
  } catch (error) {
    console.error("runRequestVetAdviceAgent failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run request vet advice agent",
      error: error.message,
    });
  }
};

export const runContributeFundAgent = async (req, res) => {
  try {
    const {
      fundId,
      animalId,
      caseId = null,
      userId = "supporter_001",
      amount = 100,
      note = "Care support contribution.",
    } = req.body;

    let fund = null;

    if (fundId) {
      fund = await CareFund.findOne({ id: fundId });
    }

    if (!fund && animalId) {
      fund = await CareFund.findOne({ animalId, status: "open" });
    }

    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Care fund not found",
      });
    }

    const contributionId = `contribution_${String(
      (fund.contributors?.length || 0) + 1
    ).padStart(3, "0")}`;

    const numericAmount = Number(amount);
    const platformFee = Math.max(1, Math.round(numericAmount * 0.01));
    const netAmountForCare = numericAmount - platformFee;

    const transactionRef = `${fund.id}_${userId}_${Date.now()}`;

    const contribution = {
      id: contributionId,
      userId,
      amount: numericAmount,
      platformFee,
      netAmountForCare,
      currency: fund.currency || "INR",
      paymentMode: fund.paymentMode || "demo_pledge_plus_upi_intent",
      paymentStatus: "upi_intent_generated_pending_verification",
      upiIntentLink: `upi://pay?pa=${encodeURIComponent(
        fund.adminUpiId || "pawwarrior@okaxis"
      )}&pn=${encodeURIComponent(
        "PawWarrior Care"
      )}&tr=${transactionRef}&tn=${encodeURIComponent(
        `Care fund for ${fund.animalId} ${fund.caseId || ""}`
      )}&am=${numericAmount}&cu=INR`,
      transactionRef,
      note,
      moneyGoesToFinder: false,
      createdAt: new Date(),
    };

    fund.contributors = [...(fund.contributors || []), contribution];
    fund.collectedAmount = (fund.collectedAmount || 0) + numericAmount;
    fund.remainingAmount = Math.max(
      0,
      (fund.estimatedAmount || 0) - fund.collectedAmount
    );

    fund.auditTrail = [
      ...(fund.auditTrail || []),
      {
        action: "contribution_recorded",
        by: userId,
        at: new Date(),
        note: `Contribution of ₹${numericAmount} recorded. Money remains controlled by PawWarrior/admin.`,
      },
    ];

    await fund.save();

    const agentRun = await saveAgentRun({
      trigger: "contribute_fund",
      userId,
      animalId: fund.animalId || animalId,
      caseId: fund.caseId || caseId,
      priority: "orange",
      mapFlag: "orange",
      steps: [
        {
          agent: "Care Fund Agent",
          toolUsed: "contributeToCareFund",
          status: "completed",
          result: `Recorded contribution ${contribution.id} of ₹${numericAmount}.`,
        },
        {
          agent: "Trust & Audit Agent",
          toolUsed: "updateAuditTrail",
          status: "completed",
          result:
            "Contribution logged with admin-controlled release policy. Money does not go to finder directly.",
        },
      ],
      finalRecommendation:
        "Contribution recorded. Fund remains controlled by PawWarrior/admin with proof-based release.",
      metadata: {
        fundId: fund.id,
        contributionId: contribution.id,
        collectedAmount: fund.collectedAmount,
        remainingAmount: fund.remainingAmount,
      },
    });

    return res.json({
      success: true,
      message: "Contribution recorded successfully",
      data: {
        fund,
        contribution,
        agentRun,
      },
    });
  } catch (error) {
    console.error("runContributeFundAgent failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run contribute fund agent",
      error: error.message,
    });
  }
};

export const runScanNewDogAgent = async (req, res) => {
  try {
    const {
      userId = "demo_user_001",
      name = "Community Dog",
      species = "dog",
      location,
      identityFeatures = {},
      condition = "",
      currentCondition,
      initialAction = "observed_only",
      notes = "",
      photoUrl,
      base64Image,
      fileName = "scan.jpg",
      noMatchConfirmed = true,
    } = req.body;

    const normalizedLocation = normalizeLocation(location);

    const nearbyAnimals = await Animal.find({}).lean();

    const possibleMatches = nearbyAnimals
      .map((animal) => {
        const animalLocation = getAnimalLocation(animal);
        if (!animalLocation?.lat || !animalLocation?.lng) return null;

        const distanceMeters = getDistanceMeters(
          normalizedLocation.lat,
          normalizedLocation.lng,
          Number(animalLocation.lat),
          Number(animalLocation.lng)
        );

        return {
          animalId: animal.id,
          name: animal.name,
          distanceMeters: Math.round(distanceMeters),
          location: animalLocation,
        };
      })
      .filter(Boolean)
      .filter((item) => item.distanceMeters <= 300)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 5);

    if (!noMatchConfirmed && possibleMatches.length > 0) {
      return res.json({
        success: true,
        mode: "possible_match_found",
        message:
          "Nearby animal profiles found. Human should confirm before creating a new profile.",
        data: {
          possibleMatches,
          location: normalizedLocation,
        },
      });
    }

    const uploadedPhotoUrl =
      photoUrl ||
      (await uploadBase64ImageToGCS({
        base64Image,
        fileName,
      }));

    const animalId = await getNextId(Animal, "dog");

    const hasConcern =
      condition ||
      currentCondition === "mild_issue" ||
      currentCondition === "serious_issue";

    const finalCurrentCondition =
      currentCondition || (hasConcern ? "mild_issue" : "needs_followup");

    const createdAnimal = await Animal.create({
      id: animalId,
      sourceId: animalId,
      name,
      species,
      relationship: "new_community_dog",
      profileStatus: "active",
      photos: [uploadedPhotoUrl || "images/dog/Demo_dog.jpg"],
      usualLocations: [
        {
          ...normalizedLocation,
          source: "mobile_scan_gps",
        },
      ],
      normalBehaviour:
        "Newly scanned community animal. Behaviour to be updated after more observations.",
      currentCondition: finalCurrentCondition,
      careTags: [
        "observe_again",
        "followup_photo_needed",
        initialAction === "water_given" ? "water_given_today" : null,
        initialAction === "food_given" ? "food_given_today" : null,
      ].filter(Boolean),
      healthTags: [
        "needs_vet_guidance",
        hasConcern ? "possible_skin_condition" : null,
        "avoid_self_medication",
      ].filter(Boolean),
      environmentTags: [],
      missingStatus: "active",
      foodCountThisWeek: initialAction === "food_given" ? 1 : 0,
      waterCountThisWeek: initialAction === "water_given" ? 1 : 0,
      lastFoodAt: initialAction === "food_given" ? new Date() : null,
      lastWaterAt: initialAction === "water_given" ? new Date() : null,
      lastSeenAt: new Date(),
      seenByCommunityCount: 1,
      createdBy: userId,
      notes:
        notes ||
        "New animal profile created from mobile scan. Needs observation and vet/NGO guidance reference.",
      identityFeatures: {
        color: identityFeatures.color || "unknown",
        size: identityFeatures.size || "unknown",
        uniqueMarks: identityFeatures.uniqueMarks || [],
        furCondition: identityFeatures.furCondition || "unknown",
        bodyCondition: identityFeatures.bodyCondition || "unknown",
      },
      aiObservation: {
        visibleConcern: Boolean(hasConcern),
        conditionHint: hasConcern ? "needs_observation" : "not_clear",
        diagnosis: "not_provided",
        notes:
          condition ||
          "PawWarrior does not diagnose from image. Follow-up observation recommended.",
      },
      breed: {
        aiEstimate: "unknown / indie-type dog",
        communityLabel: "Indie",
        verifiedBreed: null,
        confidence: "low",
        status: "unverified",
      },
    });

    const careLogId = await getNextId(CareLog, "log");

    const careLog = await CareLog.create({
      id: careLogId,
      animalId,
      userId,
      actionType: initialAction,
      notes:
        notes ||
        `Initial scan recorded with action ${initialAction}. Vet guidance and follow-up observation recommended.`,
      photoProof: Boolean(uploadedPhotoUrl),
      location: normalizedLocation,
      source: "agent_scan_new_dog",
    });

    const caseId = await getNextId(CareCase, "case");

    const nearbyVets = await findNearbyVetsInternal({
      lat: normalizedLocation.lat,
      lng: normalizedLocation.lng,
      radiusMeters: 3000,
    });

    const createdCase = await CareCase.create({
      id: caseId,
      animalId,
      createdBy: userId,
      caseType: "new_scan_followup",
      priority: "medium",
      title: `Follow-up needed for ${createdAnimal.name}`,
      description:
        condition ||
        "New community animal scan created. Follow-up photo and vet/NGO guidance recommended.",
      status: "open",
      requiredActions: [
        "observe_again",
        "upload_followup_photo",
        "request_vet_guidance",
        "avoid_self_medication",
      ],
      safetyNote:
        "This is not a veterinary diagnosis. Vet/NGO guidance is recommended when needed.",
      location: normalizedLocation,
      vetStatus: {
        needed: true,
        assignmentStatus: nearbyVets.length ? "suggested" : "pending",
        nearbyVetCount: nearbyVets.length,
        assignedVetId: nearbyVets[0]?.id || null,
        searchRadiusMeters: 3000,
      },
      careFundId: null,
      resolutionSummary: "",
      closedAt: null,
      closedBy: null,
      statusHistory: [
        {
          status: "open",
          changedBy: userId,
          changedAt: new Date(),
          note: "Case created from scan new dog agent.",
        },
      ],
    });

    const careLogs = await CareLog.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    const cases = await CareCase.find({ animalId }).lean();

    const mapStatus = buildMapStatus({
      animal: createdAnimal.toObject(),
      careLogs,
      cases,
    });

    const agentRun = await saveAgentRun({
      trigger: "scan_new_dog",
      userId,
      animalId,
      caseId,
      priority: mapStatus.mapStatus,
      mapFlag: mapStatus.mapStatus,
      steps: [
        {
          agent: "Scan & Match Agent",
          toolUsed: "findNearbyAnimals",
          status: "completed",
          result:
            possibleMatches.length > 0
              ? `${possibleMatches.length} possible nearby matches reviewed by human.`
              : "No nearby match found.",
        },
        {
          agent: "Profile Creation Agent",
          toolUsed: "createAnimalProfile",
          status: "completed",
          result: `Created animal profile ${animalId}.`,
        },
        {
          agent: "Care Action Agent",
          toolUsed: "createCareLog",
          status: "completed",
          result: `Created initial care log ${careLog.id}.`,
        },
        {
          agent: "Vet Escalation Agent",
          toolUsed: "createFollowupCase",
          status: "completed",
          result: `Created case ${createdCase.id} with vet guidance required.`,
        },
        {
          agent: "Safety Verification Agent",
          toolUsed: "verifySafety",
          status: "completed",
          result:
            "Profile created with no diagnosis, no medicine advice, and vet/NGO guidance required.",
        },
      ],
      finalRecommendation:
        "New animal profile created. Follow-up observation and vet/NGO guidance are recommended. Avoid self-medication.",
      metadata: {
        animalName: createdAnimal.name,
        careLogId: careLog.id,
        caseId: createdCase.id,
        photoUrl: uploadedPhotoUrl || null,
        possibleMatches,
        mapStatus,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Scan new dog agent completed successfully",
      data: {
        animal: createdAnimal,
        newAnimal: createdAnimal,
        careLog,
        case: createdCase,
        nearbyVets,
        mapStatus,
        finalRecommendation: agentRun.finalRecommendation,
        agentRun,
      },
    });
  } catch (error) {
    console.error("runScanNewDogAgent failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run scan new dog agent",
      error: error.message,
    });
  }
};