import Animal from "../models/Animal.js";
import Case from "../models/Case.js";

export const getCasesByAnimalId = async (req, res) => {
  try {
    const { animalId } = req.params;

    const animalCases = await Case.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      animalId,
      count: animalCases.length,
      data: animalCases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch animal cases",
      error: error.message,
    });
  }
};

export const getOpenCases = async (req, res) => {
  try {
    const priorityRank = {
      urgent: 6,
      high: 5,
      medium_to_high: 4,
      medium: 3,
      low_to_medium: 2,
      low: 1,
    };

    const cases = await Case.find({
      status: { $nin: ["resolved", "closed"] },
    }).lean();

    const openCases = cases.sort((a, b) => {
      const bPriority = priorityRank[b.priority] || 0;
      const aPriority = priorityRank[a.priority] || 0;

      if (bPriority !== aPriority) return bPriority - aPriority;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      count: openCases.length,
      data: openCases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch open cases",
      error: error.message,
    });
  }
};

export const createCase = async (req, res) => {
  try {
    const {
      animalId,
      createdBy,
      caseType,
      priority = "medium",
      title,
      description,
      requiredActions = [],
      safetyNote = "This is not a veterinary diagnosis. Vet/NGO guidance is recommended when needed.",
      location = null,
      vetStatus = {
        needed: false,
        assignmentStatus: "not_required",
        nearbyVetCount: 0,
        assignedVetId: null,
        searchRadiusMeters: null,
      },
      metadata = {},
    } = req.body;

    if (!animalId || !createdBy || !caseType || !title) {
      return res.status(400).json({
        success: false,
        message: "animalId, createdBy, caseType, and title are required",
      });
    }

    const allowedPriorities = [
      "low",
      "low_to_medium",
      "medium",
      "medium_to_high",
      "high",
      "urgent",
    ];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
        allowedPriorities,
      });
    }

    const animal = await Animal.findOne({ id: animalId }).lean();

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const caseCount = await Case.countDocuments();
    const now = new Date();

    const newCase = await Case.create({
      id: `case_${String(caseCount + 1).padStart(3, "0")}`,
      animalId,
      createdBy,
      caseType,
      priority,
      title,
      description: description || "",
      status: "open",
      requiredActions,
      safetyNote,
      location,
      vetStatus,
      metadata,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      closedBy: null,
      statusHistory: [
        {
          status: "open",
          changedBy: createdBy,
          changedAt: now,
          note: "Case created",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: newCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create case",
      error: error.message,
    });
  }
};

export const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;

    const {
      status,
      changedBy,
      note = "",
      resolutionSummary = "",
    } = req.body;

    if (!status || !changedBy) {
      return res.status(400).json({
        success: false,
        message: "status and changedBy are required",
      });
    }

    const allowedStatuses = [
      "open",
      "in_progress",
      "vet_guidance_requested",
      "vet_guidance_completed",
      "care_fund_opened",
      "resolved",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        allowedStatuses,
      });
    }

    const existingCase = await Case.findOne({ id: caseId });

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const now = new Date();

    existingCase.status = status;
    existingCase.updatedAt = now;
    existingCase.resolutionSummary =
      resolutionSummary || existingCase.resolutionSummary || "";

    existingCase.statusHistory = existingCase.statusHistory || [];

    existingCase.statusHistory.push({
      status,
      changedBy,
      changedAt: now,
      note,
    });

    if (status === "resolved" || status === "closed") {
      existingCase.closedAt = now;
      existingCase.closedBy = changedBy;
    }

    await existingCase.save();

    res.json({
      success: true,
      message: "Case status updated successfully",
      data: existingCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update case status",
      error: error.message,
    });
  }
};