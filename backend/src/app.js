import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import animalRoutes from "./routes/animal.routes.js";
import careLogRoutes from "./routes/careLog.routes.js";
import caseRoutes from "./routes/case.routes.js";
import vetRoutes from "./routes/vet.routes.js";
import vetAdviceRoutes from "./routes/vetAdvice.routes.js";
import careFundRoutes from "./routes/careFund.routes.js";
import agentRoutes from "./routes/agent.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PawWarrior API is running",
  });
});
app.use("/api/care-logs", careLogRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/vet-advice", vetAdviceRoutes);
app.use("/api/care-funds", careFundRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/care-logs", careLogRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/vet-advice", vetAdviceRoutes);
app.use("/api/care-funds", careFundRoutes);
app.use("/api/agents", agentRoutes);

export default app;



