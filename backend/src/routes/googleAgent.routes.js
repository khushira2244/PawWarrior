import express from "express";

import {
  getGoogleAgentTools,
  runGoogleAgentMission,
} from "../controllers/googleAgent.controller.js";

const router = express.Router();

router.get("/tools", getGoogleAgentTools);
router.post("/mission", runGoogleAgentMission);

export default router;