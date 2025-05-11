// src/main.ts
import readline from "readline/promises";
import { getApp } from "./graph.js";
import { AgentState } from "./state.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("Starting conversation agent. Type 'exit' to quit.");
  // ---
  // await QueryIndexTool.getIndex();
  const app = await getApp();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const userInput = await rl.question("You: ");

    if (userInput.toLowerCase() === "exit") {
      break;
    }

    // Prepare the initial state for this turn
    const initialState: AgentState = {
      input: userInput,
      messages: [],
    };

    try {
      const finalState = await app.invoke(initialState);
      console.log(`AI: ${finalState.output}`);
    } catch (error) {
      console.error("\n--- Error during graph execution ---");
      console.error(error);
      console.log("AI: Sorry, I encountered an error. Please try again.");
    }
    console.log("---------------------\n");
  }

  rl.close();
  console.log("Conversation ended.");
}

main().catch(console.error);
