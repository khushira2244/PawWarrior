import dotenv from "dotenv";
import { executePawWarriorTool } from "../src/tools/orchestrator.tools.js";

dotenv.config();

const run = async () => {
  try {
    const result = await executePawWarriorTool({
      toolName: "open_profile",
      args: {
        animalId: "dog_001",
        userId: "demo_user_001",
      },
      confirmed: true,
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
  }
};

run();