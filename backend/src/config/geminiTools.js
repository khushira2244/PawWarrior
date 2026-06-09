import { Type } from "@google/genai";

export const pawWarriorFunctionDeclarations = [
  {
    name: "find_nearby_animals",
    description:
      "Find existing active community animal profiles near a supplied GPS location before creating a new animal profile. Use this when the user reports or scans an animal whose identity is not confirmed.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        lat: {
          type: Type.NUMBER,
          description: "Latitude of the user's current animal sighting.",
        },
        lng: {
          type: Type.NUMBER,
          description: "Longitude of the user's current animal sighting.",
        },
        radius: {
          type: Type.NUMBER,
          description:
            "Search radius in meters. Use 1000 to 3000 unless the user provides another value.",
        },
      },
      required: ["lat", "lng"],
    },
  },

  {
    name: "open_profile",
    description:
      "Open an existing animal profile and retrieve its care memory, recent food and water status, active cases, vet advice, care funds, and safe next actions.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        animalId: {
          type: Type.STRING,
          description: "Existing PawWarrior animal ID, such as dog_001.",
        },
        userId: {
          type: Type.STRING,
          description: "User requesting the animal profile.",
        },
      },
      required: ["animalId", "userId"],
    },
  },

  {
    name: "log_care",
    description:
      "Record a real care action for an existing animal profile, such as food given, water given, observation only, or a reported problem. Use only when the user clearly states that the action happened.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        animalId: {
          type: Type.STRING,
          description: "Existing PawWarrior animal ID.",
        },
        userId: {
          type: Type.STRING,
          description: "User who performed or reported the action.",
        },
        actionType: {
          type: Type.STRING,
          description: "The care action that actually occurred.",
          enum: [
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
          ],
        },
        notes: {
          type: Type.STRING,
          description: "Short factual notes about the care action.",
        },
        photoProof: {
          type: Type.BOOLEAN,
          description: "Whether the user supplied photo proof.",
        },
        location: {
          type: Type.OBJECT,
          description: "Optional location where the care action happened.",
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            label: { type: Type.STRING },
          },
        },
      },
      required: ["animalId", "userId", "actionType"],
    },
  },

  {
    name: "find_nearby_vets",
    description:
      "Find nearby vet clinic options for an animal location. Use this before requesting vet advice when the user has not selected a vet.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        lat: {
          type: Type.NUMBER,
          description: "Latitude of the animal location.",
        },
        lng: {
          type: Type.NUMBER,
          description: "Longitude of the animal location.",
        },
        radius: {
          type: Type.NUMBER,
          description: "Search radius in meters, normally 3000.",
        },
      },
      required: ["lat", "lng"],
    },
  },

  {
    name: "request_vet_advice",
    description:
      "Create a basic vet guidance request for an existing animal case. This is limited to food, water, precautions, handling, and escalation guidance. It must not request diagnosis, medicine dosage, or prescriptions.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        animalId: {
          type: Type.STRING,
          description: "Existing PawWarrior animal ID.",
        },
        caseId: {
          type: Type.STRING,
          description: "Existing PawWarrior case ID.",
        },
        userId: {
          type: Type.STRING,
          description: "User requesting vet guidance.",
        },
        vetId: {
          type: Type.STRING,
          description:
            "Optional selected vet ID. Omit when vet selection is pending.",
        },
        requestType: {
          type: Type.STRING,
          description: "Type of safe guidance requested.",
          enum: [
            "basic_food_water_guidance",
            "precaution_guidance",
            "followup_guidance",
            "site_visit_discussion",
          ],
        },
        userMessage: {
          type: Type.STRING,
          description:
            "Factual user message describing the concern without diagnosis claims.",
        },
      },
      required: ["animalId", "caseId", "userId", "requestType"],
    },
  },

  {
    name: "contribute_fund",
    description:
      "Record a user contribution to an existing PawWarrior-controlled animal care fund. Use only when the user clearly confirms the amount and fund. Never send money directly to the finder.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        animalId: {
          type: Type.STRING,
          description: "Animal associated with the care fund.",
        },
        caseId: {
          type: Type.STRING,
          description: "Case associated with the care fund.",
        },
        fundId: {
          type: Type.STRING,
          description: "Existing PawWarrior care fund ID.",
        },
        userId: {
          type: Type.STRING,
          description: "User contributing to the fund.",
        },
        amount: {
          type: Type.NUMBER,
          description:
            "Contribution amount explicitly confirmed by the user. Never invent an amount.",
        },
        note: {
          type: Type.STRING,
          description: "Optional contribution note.",
        },
      },
      required: ["animalId", "fundId", "userId", "amount"],
    },
  },

  {
    name: "scan_new_dog",
    description:
      "Create a new community dog workflow only after no existing profile is confirmed. This can create an animal profile, initial observation log, follow-up case, nearby vet suggestion, optional care fund, and AgentRun timeline.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        userId: {
          type: Type.STRING,
          description: "User reporting the new dog.",
        },
        name: {
          type: Type.STRING,
          description:
            "Temporary or community name for the new dog. Use a neutral name when unknown.",
        },
        currentCondition: {
          type: Type.STRING,
          description: "Safe visible-condition classification, not a diagnosis.",
          enum: ["unknown", "stable", "mild_issue", "serious_issue"],
        },
        careTags: {
          type: Type.ARRAY,
          description: "Observed care needs.",
          items: { type: Type.STRING },
        },
        healthTags: {
          type: Type.ARRAY,
          description:
            "Visible concern tags only. Do not include diagnosis or medicine claims.",
          items: { type: Type.STRING },
        },
        environmentTags: {
          type: Type.ARRAY,
          description: "Environmental risk tags such as traffic risk.",
          items: { type: Type.STRING },
        },
        identityFeatures: {
          type: Type.OBJECT,
          description: "Visible identity features used for future matching.",
          properties: {
            color: { type: Type.STRING },
            size: { type: Type.STRING },
            uniqueMarks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["color", "size"],
        },
        location: {
          type: Type.OBJECT,
          description: "Location where the new dog was found.",
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            label: { type: Type.STRING },
            area: { type: Type.STRING },
            city: { type: Type.STRING },
            state: { type: Type.STRING },
            country: { type: Type.STRING },
          },
          required: ["lat", "lng"],
        },
        aiObservation: {
          type: Type.OBJECT,
          description:
            "Safe observation summary. diagnosis must always remain not_provided.",
          properties: {
            visibleConcern: { type: Type.BOOLEAN },
            conditionHint: { type: Type.STRING },
            diagnosis: {
              type: Type.STRING,
              enum: ["not_provided"],
            },
            notes: { type: Type.STRING },
          },
          required: ["visibleConcern", "conditionHint", "diagnosis"],
        },
        firstActionType: {
          type: Type.STRING,
          description: "Initial action performed by the reporting user.",
          enum: [
            "observed_only",
            "food_given",
            "water_given",
            "reported_problem",
          ],
        },
        firstActionNotes: {
          type: Type.STRING,
          description: "Factual initial observation or care notes.",
        },
        createCase: {
          type: Type.BOOLEAN,
          description:
            "Whether a follow-up case should be created for visible concern or care gaps.",
        },
        caseType: {
          type: Type.STRING,
          description: "Case classification.",
        },
        casePriority: {
          type: Type.STRING,
          enum: ["low", "medium", "high", "urgent"],
        },
        openCareFund: {
          type: Type.BOOLEAN,
          description:
            "Open a care fund only when the user, vet, or admin has confirmed that financial support is needed.",
        },
        estimatedAmount: {
          type: Type.NUMBER,
          description:
            "Estimated amount confirmed by a user, vet, or admin. Never invent an amount.",
        },
        fundPurpose: {
          type: Type.STRING,
          description: "Purpose of the optional care fund.",
        },
      },
      required: [
        "userId",
        "name",
        "currentCondition",
        "identityFeatures",
        "location",
        "aiObservation",
        "firstActionType",
      ],
    },
  },
];

export const pawWarriorGeminiTools = [
  {
    functionDeclarations: pawWarriorFunctionDeclarations,
  },
];

export const pawWarriorToolNames = new Set(
  pawWarriorFunctionDeclarations.map((tool) => tool.name)
);