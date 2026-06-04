import Animal from "../models/Animal.js";
import Case from "../models/Case.js";
import CareFund from "../models/CareFund.js";

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

export const createCareFund = async (req, res) => {
  try {
    const {
      animalId,
      caseId,
      createdBy,
      purpose,
      estimatedAmount,
      currency = "INR",
      adminUpiId = null,
    } = req.body;

    if (!animalId || !caseId || !createdBy || !purpose || !estimatedAmount) {
      return res.status(400).json({
        success: false,
        message:
          "animalId, caseId, createdBy, purpose, and estimatedAmount are required",
      });
    }

    const amount = Number(estimatedAmount);

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "estimatedAmount must be greater than 0",
      });
    }

    const animal = await Animal.findOne({ id: animalId }).lean();
    const caseItem = await Case.findOne({ id: caseId });

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

    const existingOpenFund = await CareFund.findOne({
      animalId,
      caseId,
      status: "open",
    }).lean();

    if (existingOpenFund) {
      return res.status(409).json({
        success: false,
        message: "An open care fund already exists for this case",
        data: existingOpenFund,
      });
    }

    const fundCount = await CareFund.countDocuments();
    const now = new Date();

    const newFund = await CareFund.create({
      id: `fund_${String(fundCount + 1).padStart(3, "0")}`,
      animalId,
      caseId,
      createdBy,
      purpose,
      estimatedAmount: amount,
      collectedAmount: 0,
      remainingAmount: amount,
      currency,
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
          action: "care_fund_created",
          by: createdBy,
          at: now,
          note: "Care fund created under PawWarrior admin control.",
        },
      ],
      createdAt: now,
      updatedAt: now,
      closedAt: null,
    });

    caseItem.status = "care_fund_opened";
    caseItem.updatedAt = now;
    caseItem.careFundId = newFund.id;

    caseItem.statusHistory = caseItem.statusHistory || [];
    caseItem.statusHistory.push({
      status: "care_fund_opened",
      changedBy: createdBy,
      changedAt: now,
      note: `Care fund opened with estimated amount ₹${amount}.`,
    });

    await caseItem.save();

    res.status(201).json({
      success: true,
      message: "Care fund created successfully",
      data: newFund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create care fund",
      error: error.message,
    });
  }
};

export const getCareFundsByAnimalId = async (req, res) => {
  try {
    const { animalId } = req.params;

    const animalFunds = await CareFund.find({ animalId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      animalId,
      count: animalFunds.length,
      data: animalFunds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch care funds",
      error: error.message,
    });
  }
};

export const contributeToCareFund = async (req, res) => {
  try {
    const { fundId } = req.params;

    const {
      userId,
      amount,
      note = "",
      paymentMode = "demo_pledge_plus_upi_intent",
      adminUpiId = null,
    } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "userId and amount are required",
      });
    }

    const contributionAmount = Number(amount);

    if (contributionAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be greater than 0",
      });
    }

    const fund = await CareFund.findOne({ id: fundId });

    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Care fund not found",
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
      action: "contribution_recorded",
      by: userId,
      at: now,
      note: `Contribution of ₹${contributionAmount} recorded. Money remains controlled by PawWarrior/admin.`,
    });

    await fund.save();

    res.status(201).json({
      success: true,
      message: "Contribution recorded successfully",
      data: {
        fund,
        contribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to contribute to care fund",
      error: error.message,
    });
  }
};