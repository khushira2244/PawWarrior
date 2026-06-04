import Animal from "../models/Animal.js";
import Case from "../models/Case.js";
import Vet from "../models/Vet.js";
import VetAdvice from "../models/VetAdvice.js";

export const requestVetAdvice = async (req, res) => {
  try {
    const {
      animalId,
      caseId,
      requestedBy,
      vetId = null,
      requestType = "basic_food_water_guidance",
      userMessage = "",
      basicAdviceFee = 10,
    } = req.body;

    if (!animalId || !caseId || !requestedBy) {
      return res.status(400).json({
        success: false,
        message: "animalId, caseId, and requestedBy are required",
      });
    }

    const animal = await Animal.findOne({ id: animalId }).lean();
    const caseItem = await Case.findOne({ id: caseId });
    const vet = vetId ? await Vet.findOne({ id: vetId }).lean() : null;

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

    if (vetId && !vet) {
      return res.status(404).json({
        success: false,
        message: "Vet not found",
      });
    }

    const adviceCount = await VetAdvice.countDocuments();
    const now = new Date();

    const vetAdviceRequest = await VetAdvice.create({
      id: `vet_advice_${String(adviceCount + 1).padStart(3, "0")}`,
      animalId,
      caseId,
      requestedBy,
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
      vetSnapshot: vet
        ? {
            id: vet.id,
            clinicName: vet.clinicName,
            doctorName: vet.doctorName,
            area: vet.area,
            hours: vet.hours,
            availableForGuidance: vet.availableForGuidance,
            emergencySupport: vet.emergencySupport,
            chatLink: vet.chatLink || null,
            videoCallLink: vet.videoCallLink || null,
          }
        : null,
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
      changedBy: requestedBy,
      changedAt: now,
      note: vetId
        ? `Vet guidance requested. Vet selected: ${vetId}`
        : "Vet guidance requested. Vet selection pending.",
    });

    await caseItem.save();

    res.status(201).json({
      success: true,
      message: "Vet advice request created successfully",
      data: {
        vetAdviceRequest,
        updatedCase: caseItem,
        selectedVet: vet,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to request vet advice",
      error: error.message,
    });
  }
};

export const completeVetAdvice = async (req, res) => {
  try {
    const { caseId } = req.params;

    const {
      completedBy,
      foodGuidance = "",
      waterGuidance = "",
      precautions = [],
      siteVisitRecommended = false,
      estimatedTreatmentCost = null,
      followUpNeeded = true,
      adviceNotes = "",
    } = req.body;

    if (!completedBy) {
      return res.status(400).json({
        success: false,
        message: "completedBy is required",
      });
    }

    const vetAdviceRequest = await VetAdvice.findOne({
      caseId,
      status: "requested",
    }).sort({ createdAt: -1 });

    if (!vetAdviceRequest) {
      return res.status(404).json({
        success: false,
        message: "Open vet advice request not found for this case",
      });
    }

    const caseItem = await Case.findOne({ id: caseId });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const now = new Date();

    vetAdviceRequest.status = "completed";
    vetAdviceRequest.completedBy = completedBy;
    vetAdviceRequest.completedAt = now;
    vetAdviceRequest.updatedAt = now;

    vetAdviceRequest.advice = {
      foodGuidance,
      waterGuidance,
      precautions,
      siteVisitRecommended,
      estimatedTreatmentCost,
      followUpNeeded,
      adviceNotes,
      safetyNote:
        "This is basic guidance only. It is not a diagnosis or prescription. For serious symptoms, seek in-person vet/NGO help.",
    };

    await vetAdviceRequest.save();

    caseItem.status = "vet_guidance_completed";
    caseItem.updatedAt = now;

    caseItem.vetStatus = {
      ...(caseItem.vetStatus?.toObject?.() || caseItem.vetStatus || {}),
      assignmentStatus: "completed",
    };

    caseItem.statusHistory = caseItem.statusHistory || [];
    caseItem.statusHistory.push({
      status: "vet_guidance_completed",
      changedBy: completedBy,
      changedAt: now,
      note: "Vet guidance completed.",
    });

    await caseItem.save();

    res.json({
      success: true,
      message: "Vet advice completed successfully",
      data: {
        vetAdvice: vetAdviceRequest,
        updatedCase: caseItem,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to complete vet advice",
      error: error.message,
    });
  }
};

export const getVetAdviceByAnimalId = async (req, res) => {
  try {
    const { animalId } = req.params;

    const adviceList = await VetAdvice.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      animalId,
      count: adviceList.length,
      data: adviceList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vet advice",
      error: error.message,
    });
  }
};