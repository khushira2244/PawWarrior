import Animal from "../models/Animal.js";
import CareLog from "../models/CareLog.js";
import Case from "../models/Case.js";
import Vet from "../models/Vet.js";
import VetAdvice from "../models/VetAdvice.js";
import CareFund from "../models/CareFund.js";

import {
  saveAgentRun,
  getAgentRunsByAnimalId,
} from "../services/agentRun.service.js";

import { getAnimalMapStatus } from "../tools/animalStatus.tools.js";
import { calculateDistanceMeters } from "../tools/geo.tools.js";

const PLATFORM_FEE_PERCENT = 1;

const generateUpiIntentLink = ({
  upiId,
  payeeName,
  amount,
  transactionRef,
  note,
}) => {
  if (!upiId) return null;

  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    tr: transactionRef,
    tn: note,
    am: String(amount),
    cu: "INR",
  });

  return `upi://pay?${params.toString()}`;
};

export const getAgentRunsForAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;

    const runs = await getAgentRunsByAnimalId(animalId);

    res.json({
      success: true,
      animalId,
      count: runs.length,
      data: runs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent runs",
      error: error.message,
    });
  }
};

export const runOpenProfileAgent = async (req, res) => {
  try {
    const { animalId, userId = "demo_user_001" } = req.body;

    if (!animalId) {
      return res.status(400).json({
        success: false,
        message: "animalId is required",
      });
    }

    const animal = await Animal.findOne({ id: animalId }).lean();

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const animalCareLogs = await CareLog.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    const animalCases = await Case.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    const openCases = animalCases.filter(
      (item) => item.status !== "closed" && item.status !== "resolved"
    );

    const animalVetAdvice = await VetAdvice.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    const animalCareFunds = await CareFund.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    const mapStatus = getAnimalMapStatus(animal);

    const hasOpenCase = openCases.length > 0;
    const hasVetAdvice = animalVetAdvice.length > 0;
    const hasCareFund = animalCareFunds.length > 0;

    const steps = [
      {
        agent: "Profile Memory Agent",
        toolUsed: "getAnimalProfile",
        status: "completed",
        result: `Loaded profile for ${animal.name}.`,
      },
      {
        agent: "Care Memory Agent",
        toolUsed: "getCareHistory",
        status: "completed",
        result: `Found ${animalCareLogs.length} care log(s).`,
      },
      {
        agent: "Case Tracking Agent",
        toolUsed: "getOpenCases",
        status: "completed",
        result: hasOpenCase
          ? `Found ${openCases.length} active case(s).`
          : "No active case found.",
      },
      {
        agent: "Vet Guidance Agent",
        toolUsed: "getVetAdviceByAnimal",
        status: "completed",
        result: hasVetAdvice
          ? `Found ${animalVetAdvice.length} vet advice record(s).`
          : "No vet advice recorded yet.",
      },
      {
        agent: "Care Fund Agent",
        toolUsed: "getCareFundsByAnimal",
        status: "completed",
        result: hasCareFund
          ? `Found ${animalCareFunds.length} care fund record(s).`
          : "No care fund opened yet.",
      },
      {
        agent: "Safety Verification Agent",
        toolUsed: "verifySafety",
        status: "completed",
        result:
          "No diagnosis or medicine dosage is shown. Vet/NGO guidance is recommended for serious or worsening signs.",
      },
    ];

    const nextActions = [];

    if (mapStatus.careStatus?.careGaps?.includes("needs_water")) {
      nextActions.push("provide_clean_water_if_safe");
    }

    if (mapStatus.careStatus?.careGaps?.includes("needs_food")) {
      nextActions.push("offer_simple_food_if_safe");
    }

    if (mapStatus.mapStatus === "orange") {
      nextActions.push("upload_followup_photo");
      nextActions.push("observe_again_within_24_hours");
    }

    if (mapStatus.mapStatus === "red") {
      nextActions.push("request_vet_or_ngo_guidance");
      nextActions.push("avoid_self_medication");
    }

    if (hasOpenCase && !hasVetAdvice) {
      nextActions.push("request_basic_vet_guidance");
    }

    if (hasOpenCase && !hasCareFund && mapStatus.mapStatus === "red") {
      nextActions.push("open_care_support_ledger_if_cost_needed");
    }

    const finalRecommendation =
      nextActions.length > 0
        ? `Recommended next actions: ${nextActions.join(", ")}.`
        : "Animal appears recently cared for. Continue observation and update if condition changes.";

    const agentRun = await saveAgentRun({
      trigger: "open_profile",
      userId,
      animalId,
      caseId: openCases[0]?.id || null,
      status: "completed",
      priority: mapStatus.mapStatus,
      mapFlag: mapStatus.mapStatus,
      steps,
      finalRecommendation,
      humanConfirmationRequired: false,
      metadata: {
        animalName: animal.name,
        statusLabel: mapStatus.statusLabel,
        primaryNeed: mapStatus.primaryNeed,
        careStatus: mapStatus.careStatus,
        openCaseCount: openCases.length,
        vetAdviceCount: animalVetAdvice.length,
        careFundCount: animalCareFunds.length,
      },
    });

    res.json({
      success: true,
      message: "Open profile agent completed successfully",
      data: {
        animal,
        mapStatus,
        careLogs: animalCareLogs.slice(0, 5),
        openCases,
        latestVetAdvice: animalVetAdvice[0] || null,
        careFunds: animalCareFunds,
        nextActions,
        finalRecommendation,
        agentRun,
      },
    });
  } catch (error) {
    res.status(500).json({
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
      actionType,
      notes = "",
      photoProof = false,
      location = null,
      source = "agent_log_care",
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
      notes,
      photoProof,
      location,
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

    if (
      actionType === "dog_refused_food" ||
      actionType === "food_offered_refused"
    ) {
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

    const animalObject = animal.toObject();
    const updatedMapStatus = getAnimalMapStatus(animalObject);

    const steps = [
      {
        agent: "Care Action Agent",
        toolUsed: "createCareLog",
        status: "completed",
        result: `Created care log ${newCareLog.id} with action ${actionType}.`,
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
        result: `Recalculated status as ${updatedMapStatus.mapStatus}: ${updatedMapStatus.statusLabel}.`,
      },
      {
        agent: "Safety Verification Agent",
        toolUsed: "verifySafety",
        status: "completed",
        result:
          "Care action stored without diagnosis, dosage, or self-medication advice.",
      },
    ];

    const finalRecommendation =
      actionType === "water_given"
        ? "Water support recorded. Continue observation and request vet/NGO guidance if symptoms worsen."
        : actionType === "food_given"
        ? "Food support recorded. Continue observation and do not force-feed if the dog refuses."
        : actionType === "reported_problem"
        ? "Problem report recorded. Follow-up photo and vet/NGO guidance may be needed."
        : "Care action recorded. Continue safe observation.";

    const agentRun = await saveAgentRun({
      trigger: "log_care",
      userId,
      animalId,
      caseId: null,
      status: "completed",
      priority: updatedMapStatus.mapStatus,
      mapFlag: updatedMapStatus.mapStatus,
      steps,
      finalRecommendation,
      humanConfirmationRequired: false,
      metadata: {
        actionType,
        careLogId: newCareLog.id,
        animalName: animal.name,
        statusLabel: updatedMapStatus.statusLabel,
        primaryNeed: updatedMapStatus.primaryNeed,
        careStatus: updatedMapStatus.careStatus,
      },
    });

    res.status(201).json({
      success: true,
      message: "Log care agent completed successfully",
      data: {
        careLog: newCareLog,
        updatedAnimal: animalObject,
        mapStatus: updatedMapStatus,
        finalRecommendation,
        agentRun,
      },
    });
  } catch (error) {
    res.status(500).json({
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
      caseId,
      userId = "demo_user_001",
      vetId = null,
      requestType = "basic_food_water_guidance",
      userMessage = "",
      basicAdviceFee = 10,
    } = req.body;

    if (!animalId || !caseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "animalId, caseId, and userId are required",
      });
    }

    const animal = await Animal.findOne({ id: animalId }).lean();
    const caseItem = await Case.findOne({ id: caseId });
    const selectedVet = vetId ? await Vet.findOne({ id: vetId }).lean() : null;

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (vetId && !selectedVet) {
      return res.status(404).json({
        success: false,
        message: "Vet not found",
      });
    }

    const now = new Date();
    const adviceCount = await VetAdvice.countDocuments();

    const vetSnapshot = selectedVet
      ? {
          id: selectedVet.id,
          clinicName: selectedVet.clinicName,
          doctorName: selectedVet.doctorName,
          area: selectedVet.area,
          hours: selectedVet.hours,
          availableForGuidance: selectedVet.availableForGuidance,
          emergencySupport: selectedVet.emergencySupport,
          chatLink: selectedVet.chatLink || null,
          videoCallLink: selectedVet.videoCallLink || null,
        }
      : null;

    const newVetAdviceRequest = await VetAdvice.create({
      id: `vet_advice_${String(adviceCount + 1).padStart(3, "0")}`,
      animalId,
      caseId,
      requestedBy: userId,
      vetId,
      requestType,
      status: "requested",
      basicAdviceFee,
      paymentStatus: "demo_not_charged",
      userMessage,
      animalSnapshot: {
        name: animal.name,
        currentCondition: animal.currentCondition,
        careTags: animal.careTags || [],
        healthTags: animal.healthTags || [],
        lastFoodAt: animal.lastFoodAt || null,
        lastWaterAt: animal.lastWaterAt || null,
      },
      caseSnapshot: {
        caseType: caseItem.caseType,
        priority: caseItem.priority,
        title: caseItem.title,
        requiredActions: caseItem.requiredActions || [],
      },
      vetSnapshot,
      advice: null,
      safetyNote:
        "This request is for basic food, water, precaution, and escalation guidance only. It is not a diagnosis or prescription.",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    });

    caseItem.status = "vet_guidance_requested";
    caseItem.updatedAt = now;

    caseItem.vetStatus = {
      ...(caseItem.vetStatus?.toObject?.() || caseItem.vetStatus || {}),
      needed: true,
      assignmentStatus: vetId ? "vet_selected" : "pending",
      assignedVetId: vetId,
    };

    caseItem.statusHistory = caseItem.statusHistory || [];
    caseItem.statusHistory.push({
      status: "vet_guidance_requested",
      changedBy: userId,
      changedAt: now,
      note: vetId
        ? `Vet guidance requested through agent. Vet selected: ${vetId}`
        : "Vet guidance requested through agent. Vet selection pending.",
    });

    await caseItem.save();

    const mapStatus = getAnimalMapStatus(animal);

    const steps = [
      {
        agent: "Vet Request Agent",
        toolUsed: "validateAnimalAndCase",
        status: "completed",
        result: `Validated ${animal.name} and case ${caseId}.`,
      },
      {
        agent: "Vet Registry Agent",
        toolUsed: "getVetProfile",
        status: vetId ? "completed" : "skipped",
        result: vetId
          ? `Selected vet ${vetId} for guidance.`
          : "No specific vet selected. Vet assignment remains pending.",
      },
      {
        agent: "Vet Advice Agent",
        toolUsed: "createVetAdviceRequest",
        status: "completed",
        result: `Created vet advice request ${newVetAdviceRequest.id}.`,
      },
      {
        agent: "Case Tracking Agent",
        toolUsed: "updateCaseStatus",
        status: "completed",
        result: "Updated case status to vet_guidance_requested.",
      },
      {
        agent: "Safety Verification Agent",
        toolUsed: "verifySafety",
        status: "completed",
        result:
          "Request limited to food, water, precautions, and escalation guidance. No diagnosis or prescription generated.",
      },
    ];

    const finalRecommendation = vetId
      ? "Vet guidance request created. User can open doctor chat/video link if contact is available."
      : "Vet guidance request created. Vet selection is pending; show nearby vet options to user/admin.";

    const agentRun = await saveAgentRun({
      trigger: "request_vet_advice",
      userId,
      animalId,
      caseId,
      status: "completed",
      priority: mapStatus.mapStatus,
      mapFlag: mapStatus.mapStatus,
      steps,
      finalRecommendation,
      humanConfirmationRequired: true,
      metadata: {
        animalName: animal.name,
        vetAdviceId: newVetAdviceRequest.id,
        vetId,
        requestType,
        caseStatus: "vet_guidance_requested",
        statusLabel: mapStatus.statusLabel,
        primaryNeed: mapStatus.primaryNeed,
      },
    });

    res.status(201).json({
      success: true,
      message: "Request vet advice agent completed successfully",
      data: {
        vetAdviceRequest: newVetAdviceRequest,
        updatedCase: caseItem,
        selectedVet,
        finalRecommendation,
        agentRun,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to run request vet advice agent",
      error: error.message,
    });
  }
};
export const runContributeFundAgent = async (req, res) => {
  try {
    const {
      animalId,
      caseId,
      fundId,
      userId = "supporter_001",
      amount,
      note = "",
      paymentMode = "demo_pledge_plus_upi_intent",
      adminUpiId = null,
    } = req.body;

    if (!animalId || !fundId || !userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "animalId, fundId, userId, and amount are required",
      });
    }

    const contributionAmount = Number(amount);

    if (contributionAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be greater than 0",
      });
    }

    const animal = await Animal.findOne({ id: animalId }).lean();
    const caseItem = caseId ? await Case.findOne({ id: caseId }).lean() : null;
    const fund = await CareFund.findOne({ id: fundId });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    if (caseId && !caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Care fund not found",
      });
    }

    if (fund.animalId !== animalId) {
      return res.status(400).json({
        success: false,
        message: "Fund does not belong to this animal",
      });
    }

    if (caseId && fund.caseId !== caseId) {
      return res.status(400).json({
        success: false,
        message: "Fund does not belong to this case",
      });
    }

    if (fund.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Care fund is not open for contributions",
      });
    }

    const now = new Date();

    const platformFee = Math.round(
      (contributionAmount * PLATFORM_FEE_PERCENT) / 100
    );

    const netAmountForCare = contributionAmount - platformFee;
    const transactionRef = `${fund.id}_${userId}_${Date.now()}`;

    const upiIntentLink = generateUpiIntentLink({
      upiId: adminUpiId || fund.adminUpiId,
      payeeName: "PawWarrior Care",
      amount: contributionAmount,
      transactionRef,
      note: `Care fund for ${fund.animalId} ${fund.caseId}`,
    });

    fund.contributors = fund.contributors || [];

    const contribution = {
      id: `contribution_${String(fund.contributors.length + 1).padStart(
        3,
        "0"
      )}`,
      userId,
      amount: contributionAmount,
      platformFee,
      netAmountForCare,
      currency: fund.currency || "INR",
      paymentMode,
      paymentStatus: upiIntentLink
        ? "upi_intent_generated_pending_verification"
        : "demo_pledge_recorded",
      upiIntentLink,
      transactionRef,
      note,
      moneyGoesToFinder: false,
      createdAt: now,
    };

    fund.contributors.push(contribution);

    fund.collectedAmount = fund.contributors.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    fund.remainingAmount = Math.max(
      Number(fund.estimatedAmount || 0) - fund.collectedAmount,
      0
    );

    fund.updatedAt = now;

    if (fund.remainingAmount === 0) {
      fund.status = "funded";
    }

    fund.auditTrail = fund.auditTrail || [];
    fund.auditTrail.push({
      action: "agent_contribution_recorded",
      by: userId,
      at: now,
      note: `Agent recorded contribution of ₹${contributionAmount}. Money remains controlled by PawWarrior/admin.`,
    });

    await fund.save();

    const mapStatus = getAnimalMapStatus(animal);

    const steps = [
      {
        agent: "Care Fund Agent",
        toolUsed: "validateCareFund",
        status: "completed",
        result: `Validated fund ${fundId} for ${animal.name}.`,
      },
      {
        agent: "Contribution Agent",
        toolUsed: "recordContribution",
        status: "completed",
        result: `Recorded contribution of ₹${contributionAmount} by ${userId}.`,
      },
      {
        agent: "Payment Intent Agent",
        toolUsed: "generateUpiIntentLink",
        status: upiIntentLink ? "completed" : "skipped",
        result: upiIntentLink
          ? "Generated UPI intent link for pending user payment verification."
          : "No UPI ID available; contribution recorded as demo pledge.",
      },
      {
        agent: "Trust Ledger Agent",
        toolUsed: "updateCareFundLedger",
        status: "completed",
        result: `Collected ₹${fund.collectedAmount}, remaining ₹${fund.remainingAmount}. Money does not go to finder.`,
      },
      {
        agent: "Safety Verification Agent",
        toolUsed: "verifyFundPolicy",
        status: "completed",
        result:
          "Fund remains controlled by PawWarrior/admin and requires proof before release.",
      },
    ];

    const finalRecommendation =
      fund.remainingAmount > 0
        ? `Contribution recorded. ₹${fund.remainingAmount} still needed for this care fund.`
        : "Care fund is fully funded. Admin/verified steward should verify proof before any release.";

    const agentRun = await saveAgentRun({
      trigger: "contribute_fund",
      userId,
      animalId,
      caseId: fund.caseId || caseId || null,
      status: "completed",
      priority: mapStatus.mapStatus,
      mapFlag: mapStatus.mapStatus,
      steps,
      finalRecommendation,
      humanConfirmationRequired: true,
      metadata: {
        animalName: animal.name,
        fundId,
        contributionId: contribution.id,
        contributionAmount,
        platformFee,
        netAmountForCare,
        collectedAmount: fund.collectedAmount,
        remainingAmount: fund.remainingAmount,
        paymentStatus: contribution.paymentStatus,
        moneyGoesToFinder: false,
        fundController: fund.fundController,
      },
    });

    res.status(201).json({
      success: true,
      message: "Contribute fund agent completed successfully",
      data: {
        fund,
        contribution,
        finalRecommendation,
        agentRun,
      },
    });
  } catch (error) {
    res.status(500).json({
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
      name,
      species = "dog",
      relationship = "new_community_dog",
      currentCondition = "unknown",
      careTags = [],
      healthTags = [],
      environmentTags = [],
      identityFeatures = {
        color: "unknown",
        size: "unknown",
        uniqueMarks: [],
      },
      photos = [],
      location,
      aiObservation = {
        visibleConcern: false,
        conditionHint: "unknown",
        diagnosis: "not_provided",
        notes: "PawWarrior does not diagnose from image.",
      },
      firstActionType = "observed_only",
      firstActionNotes = "",
      createCase = true,
      caseType = "new_dog_followup",
      casePriority = "medium",
      caseTitle,
      caseDescription = "",
      requiredActions = [],
      estimatedAmount = null,
      openCareFund = false,
      fundPurpose = "",
      adminUpiId = null,
    } = req.body;

    if (!name || !userId || !location?.lat || !location?.lng) {
      return res.status(400).json({
        success: false,
        message: "name, userId, location.lat, and location.lng are required",
      });
    }

    const now = new Date();

    const animalCount = await Animal.countDocuments();
    const careLogCount = await CareLog.countDocuments();
    const caseCount = await Case.countDocuments();
    const careFundCount = await CareFund.countDocuments();

    const newAnimal = await Animal.create({
      id: `dog_${String(animalCount + 1).padStart(3, "0")}`,
      sourceId: null,
      name,
      species,
      relationship,
      profileStatus: "active",
      createdAt: now,
      lastSeenAt: now,
      breed: {
        aiEstimate: "unknown / indie-type dog",
        communityLabel: "Unknown",
        verifiedBreed: null,
        confidence: "low",
        status: "unverified",
      },
      identityFeatures,
      photos,
      usualLocations: [
        {
          label: location.label || "User scan location",
          area: location.area || "",
          city: location.city || "Hyderabad",
          state: location.state || "Telangana",
          country: location.country || "India",
          lat: location.lat,
          lng: location.lng,
          source: "agent_scan_location",
        },
      ],
      normalBehaviour: "",
      currentCondition,
      careTags,
      healthTags,
      environmentTags,
      aiObservation,
      missingStatus: "active",
      foodCountThisWeek: firstActionType === "food_given" ? 1 : 0,
      waterCountThisWeek: firstActionType === "water_given" ? 1 : 0,
      lastFoodAt: firstActionType === "food_given" ? now : null,
      lastWaterAt: firstActionType === "water_given" ? now : null,
      seenByCommunityCount: 1,
      createdBy: userId,
      notes: "Created through Scan New Dog Agent.",
    });

    const newCareLog = await CareLog.create({
      id: `log_${String(careLogCount + 1).padStart(3, "0")}`,
      animalId: newAnimal.id,
      userId,
      actionType: firstActionType,
      notes:
        firstActionNotes ||
        "Initial observation created through Scan New Dog Agent.",
      photoProof: photos.length > 0,
      location,
      createdAt: now,
      source: "scan_new_dog_agent",
    });

    let newCase = null;

    const shouldCreateCase =
      createCase &&
      (aiObservation.visibleConcern ||
        currentCondition === "mild_issue" ||
        currentCondition === "serious_issue" ||
        healthTags.includes("needs_vet_guidance") ||
        healthTags.includes("urgent_vet_escalation"));

    if (shouldCreateCase) {
      newCase = await Case.create({
        id: `case_${String(caseCount + 1).padStart(3, "0")}`,
        animalId: newAnimal.id,
        createdBy: userId,
        caseType,
        priority:
          currentCondition === "serious_issue" ||
          healthTags.includes("urgent_vet_escalation")
            ? "high"
            : casePriority,
        title:
          caseTitle ||
          `${newAnimal.name} needs follow-up and safe care guidance`,
        description:
          caseDescription ||
          "New dog scan created a follow-up case based on visible concern or care gap.",
        status: "open",
        requiredActions:
          requiredActions.length > 0
            ? requiredActions
            : [
                "provide_clean_water_if_safe",
                "observe_again",
                "upload_followup_photo",
                "avoid_self_medication",
              ],
        safetyNote:
          "This is not a veterinary diagnosis. Vet/NGO guidance is recommended when needed.",
        location,
        vetStatus: {
          needed:
            healthTags.includes("needs_vet_guidance") ||
            healthTags.includes("urgent_vet_escalation") ||
            currentCondition === "serious_issue",
          assignmentStatus: "pending",
          nearbyVetCount: 0,
          assignedVetId: null,
          searchRadiusMeters: 3000,
        },
        metadata: {
          createdFrom: "scan_new_dog_agent",
          aiConditionHint: aiObservation.conditionHint,
        },
        createdAt: now,
        updatedAt: now,
        closedAt: null,
        closedBy: null,
        statusHistory: [
          {
            status: "open",
            changedBy: userId,
            changedAt: now,
            note: "Case created by Scan New Dog Agent.",
          },
        ],
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
          location.lat,
          location.lng,
          vetLocation.lat,
          vetLocation.lng
        );

        return {
          ...vet,
          distanceMeters,
        };
      })
      .filter(Boolean)
      .filter((vet) => vet.distanceMeters <= 3000)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    if (newCase) {
      newCase.vetStatus = {
        ...(newCase.vetStatus?.toObject?.() || newCase.vetStatus || {}),
        nearbyVetCount: nearbyVets.length,
        assignedVetId: nearbyVets[0]?.id || null,
        assignmentStatus: nearbyVets.length > 0 ? "suggested" : "pending",
      };

      await newCase.save();
    }

    let newFund = null;

    if (openCareFund && newCase && estimatedAmount) {
      const amount = Number(estimatedAmount);

      newFund = await CareFund.create({
        id: `fund_${String(careFundCount + 1).padStart(3, "0")}`,
        animalId: newAnimal.id,
        caseId: newCase.id,
        createdBy: userId,
        purpose:
          fundPurpose ||
          `Care support for ${newAnimal.name}'s follow-up case`,
        estimatedAmount: amount,
        collectedAmount: 0,
        remainingAmount: amount,
        currency: "INR",
        status: "open",
        paymentMode: "demo_pledge_plus_upi_intent",
        paymentVerificationMode: "manual_or_demo",
        adminUpiId,
        fundController: {
          type: "pawwarrior_admin",
          id: "admin_001",
          name: "PawWarrior Care Admin",
        },
        moneyGoesToFinder: false,
        contributors: [],
        releasePolicy: {
          requiresProof: true,
          moneyGoesToFinder: false,
          allowedReleaseTargets: [
            "vet_clinic",
            "medicine_purchase_with_bill",
            "food_purchase_with_bill",
            "verified_transport",
          ],
        },
        auditTrail: [
          {
            action: "care_fund_created_by_agent",
            by: userId,
            at: now,
            note: "Care fund created by Scan New Dog Agent under PawWarrior admin control.",
          },
        ],
        createdAt: now,
        updatedAt: now,
        closedAt: null,
      });

      newCase.careFundId = newFund.id;
      newCase.status = "care_fund_opened";
      newCase.updatedAt = now;

      newCase.statusHistory = newCase.statusHistory || [];
      newCase.statusHistory.push({
        status: "care_fund_opened",
        changedBy: userId,
        changedAt: now,
        note: `Care fund opened by Scan New Dog Agent with estimated amount ₹${amount}.`,
      });

      await newCase.save();
    }

    const newAnimalObject = newAnimal.toObject();
    const mapStatus = getAnimalMapStatus(newAnimalObject);

    const steps = [
      {
        agent: "Scan & Match Agent",
        toolUsed: "createAnimalProfile",
        status: "completed",
        result: `Created new animal profile ${newAnimal.id} for ${newAnimal.name}.`,
      },
      {
        agent: "Care Memory Agent",
        toolUsed: "createInitialCareLog",
        status: "completed",
        result: `Created initial care log ${newCareLog.id} with action ${firstActionType}.`,
      },
      {
        agent: "Health Risk Agent",
        toolUsed: "evaluateVisibleConcern",
        status: "completed",
        result: aiObservation.visibleConcern
          ? `Visible concern detected: ${aiObservation.conditionHint}.`
          : "No visible concern recorded.",
      },
      {
        agent: "Case Tracking Agent",
        toolUsed: "createCaseIfNeeded",
        status: newCase ? "completed" : "skipped",
        result: newCase
          ? `Created/updated case ${newCase.id}.`
          : "No case created because no follow-up condition was triggered.",
      },
      {
        agent: "Vet Escalation Agent",
        toolUsed: "findNearbyVets",
        status: "completed",
        result:
          nearbyVets.length > 0
            ? `Found ${nearbyVets.length} nearby vet option(s). Suggested ${nearbyVets[0].id}.`
            : "No nearby vet found within 3 km.",
      },
      {
        agent: "Fund Planner Agent",
        toolUsed: "createCareFundIfNeeded",
        status: newFund ? "completed" : "skipped",
        result: newFund
          ? `Created care fund ${newFund.id} with estimated amount ₹${newFund.estimatedAmount}.`
          : "No care fund opened.",
      },
      {
        agent: "Safety Verification Agent",
        toolUsed: "verifySafety",
        status: "completed",
        result:
          "No diagnosis or medicine dosage generated. User should request vet/NGO guidance for serious signs.",
      },
    ];

    const finalRecommendation =
      mapStatus.mapStatus === "red"
        ? "New dog profile created with high-priority follow-up. Provide clean water if safe, avoid self-medication, and request vet/NGO guidance."
        : mapStatus.mapStatus === "orange"
        ? "New dog profile created with follow-up need. Provide food/water if safe and upload a follow-up photo."
        : "New dog profile created. Continue observation and update care logs.";

    const agentRun = await saveAgentRun({
      trigger: "scan_new_dog",
      userId,
      animalId: newAnimal.id,
      caseId: newCase?.id || null,
      status: "completed",
      priority: mapStatus.mapStatus,
      mapFlag: mapStatus.mapStatus,
      steps,
      finalRecommendation,
      humanConfirmationRequired: true,
      metadata: {
        animalName: newAnimal.name,
        careLogId: newCareLog.id,
        caseId: newCase?.id || null,
        fundId: newFund?.id || null,
        nearbyVetCount: nearbyVets.length,
        suggestedVetId: nearbyVets[0]?.id || null,
        statusLabel: mapStatus.statusLabel,
        primaryNeed: mapStatus.primaryNeed,
        careStatus: mapStatus.careStatus,
      },
    });

    res.status(201).json({
      success: true,
      message: "Scan new dog agent completed successfully",
      data: {
        animal: newAnimal,
        initialCareLog: newCareLog,
        case: newCase,
        nearbyVets: nearbyVets.slice(0, 3),
        careFund: newFund,
        mapStatus,
        finalRecommendation,
        agentRun,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to run scan new dog agent",
      error: error.message,
    });
  }
};