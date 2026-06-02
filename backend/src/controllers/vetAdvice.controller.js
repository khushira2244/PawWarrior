import { readJsonFile, writeJsonFile } from "../services/jsonData.service.js";

const buildVetContactOptions = (vet) => {
  const cleanPhone = vet?.phone ? String(vet.phone).replace(/\D/g, "") : null;

  return {
    phone: vet?.phone || null,
    phoneLink: cleanPhone ? `tel:+${cleanPhone}` : null,
    chatLink:
      vet?.chatLink || (cleanPhone ? `https://wa.me/${cleanPhone}` : null),
    videoCallLink: vet?.videoCallLink || null,
    contactStatus:
      cleanPhone || vet?.chatLink || vet?.videoCallLink
        ? "contact_available"
        : "contact_not_added",
  };
};

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

    const vetAdviceList = await readJsonFile("vetAdvice.json");
    const animals = await readJsonFile("animals.json");
    const cases = await readJsonFile("cases.json");
    const vets = await readJsonFile("vets.json");

    const animal = animals.find((item) => item.id === animalId);
    const caseItem = cases.find((item) => item.id === caseId);
    const vet = vetId ? vets.find((item) => item.id === vetId) : null;

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

    const now = new Date().toISOString();

    const newVetAdviceRequest = {
      id: `vet_advice_${String(vetAdviceList.length + 1).padStart(3, "0")}`,
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
            contactOptions: buildVetContactOptions(vet),
          }
        : null,
      advice: null,
      safetyNote:
        "This request is for basic food, water, precaution, and escalation guidance only. It is not a diagnosis or prescription.",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    vetAdviceList.push(newVetAdviceRequest);

    const caseIndex = cases.findIndex((item) => item.id === caseId);

    if (caseIndex !== -1) {
      cases[caseIndex].status = "vet_guidance_requested";
      cases[caseIndex].updatedAt = now;

      cases[caseIndex].vetStatus = {
        ...(cases[caseIndex].vetStatus || {}),
        needed: true,
        assignmentStatus: vetId ? "vet_selected" : "pending",
        assignedVetId: vetId,
      };

      cases[caseIndex].statusHistory = cases[caseIndex].statusHistory || [];
      cases[caseIndex].statusHistory.push({
        status: "vet_guidance_requested",
        changedBy: requestedBy,
        changedAt: now,
        note: vetId
          ? `Vet guidance requested and vet selected: ${vetId}`
          : "Vet guidance requested. Vet selection pending.",
      });
    }

    await writeJsonFile("vetAdvice.json", vetAdviceList);
    await writeJsonFile("cases.json", cases);

    res.status(201).json({
      success: true,
      message: "Vet advice request created successfully",
      data: newVetAdviceRequest,
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
      vetId = null,
      foodGuidance = [],
      waterGuidance = [],
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

    const vetAdviceList = await readJsonFile("vetAdvice.json");
    const cases = await readJsonFile("cases.json");

    const adviceIndex = vetAdviceList.findIndex(
      (item) => item.caseId === caseId && item.status !== "completed"
    );

    if (adviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Open vet advice request not found for this case",
      });
    }

    const caseIndex = cases.findIndex((item) => item.id === caseId);

    if (caseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const now = new Date().toISOString();

    const completedAdvice = {
      foodGuidance,
      waterGuidance,
      precautions,
      siteVisitRecommended,
      estimatedTreatmentCost,
      followUpNeeded,
      adviceNotes,
      safetyNote:
        "Basic vet guidance only. This is not a final diagnosis or prescription. Do not self-medicate.",
    };

    vetAdviceList[adviceIndex].status = "completed";
    vetAdviceList[adviceIndex].vetId = vetId || vetAdviceList[adviceIndex].vetId;
    vetAdviceList[adviceIndex].advice = completedAdvice;
    vetAdviceList[adviceIndex].completedBy = completedBy;
    vetAdviceList[adviceIndex].completedAt = now;
    vetAdviceList[adviceIndex].updatedAt = now;

    cases[caseIndex].status = "vet_guidance_completed";
    cases[caseIndex].updatedAt = now;

    cases[caseIndex].vetStatus = {
      ...(cases[caseIndex].vetStatus || {}),
      needed: true,
      assignmentStatus: "completed",
      assignedVetId: vetId || cases[caseIndex].vetStatus?.assignedVetId || null,
    };

    cases[caseIndex].statusHistory = cases[caseIndex].statusHistory || [];
    cases[caseIndex].statusHistory.push({
      status: "vet_guidance_completed",
      changedBy: completedBy,
      changedAt: now,
      note: "Vet guidance completed and saved.",
    });

    await writeJsonFile("vetAdvice.json", vetAdviceList);
    await writeJsonFile("cases.json", cases);

    res.json({
      success: true,
      message: "Vet advice completed successfully",
      data: vetAdviceList[adviceIndex],
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

    const vetAdviceList = await readJsonFile("vetAdvice.json");

    const animalAdvice = vetAdviceList
      .filter((item) => item.animalId === animalId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      animalId,
      count: animalAdvice.length,
      data: animalAdvice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vet advice",
      error: error.message,
    });
  }
};