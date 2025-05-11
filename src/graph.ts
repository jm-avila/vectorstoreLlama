// src/graph.ts
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import {
  addUserInputNode,
  callLLMNode,
  addAIResponseNode,
  systemPromptNode,
} from "./nodes.js";
import { BaseMessage } from "@langchain/core/messages";
import { ToolCall } from "./state.js";
import { QueryIndexTool } from "./tools.js";

export async function getApp() {
  // Define the workflow
  const workflow = new StateGraph<AgentState>({
    channels: {
      toolCall: {
        reducer: (_: ToolCall | undefined, y: ToolCall | undefined) => y,
        default: () => undefined,
      },
      messages: {
        reducer: (history: BaseMessage[], newMessage: BaseMessage) =>
          history.concat(newMessage),
        default: () => [],
      },
      input: {
        reducer: (x: string | undefined, y: string | undefined) => y ?? x ?? "",
        default: () => "",
      },
      output: {
        reducer: (x: string | undefined, y: string | undefined) => y ?? x ?? "",
        default: () => "",
      },
    },
  });

  // Add nodes to the graph
  workflow
    .addNode("systemPrompt", systemPromptNode)
    .addNode("addUserInput", addUserInputNode)
    .addNode("callLLM", callLLMNode)
    .addNode("addAIResponse", addAIResponseNode)
    .addNode("tool", QueryIndexTool.queryIndexToolNode)
    .addEdge(START, "systemPrompt")
    .addEdge("systemPrompt", "addUserInput")
    .addEdge("addUserInput", "callLLM")
    .addConditionalEdges("callLLM", QueryIndexTool.routeMessage, {
      tool: "tool",
      addAIResponse: "addAIResponse",
    })
    .addEdge("tool", "callLLM")
    .addEdge("callLLM", "addAIResponse")
    .addEdge("addAIResponse", END);
  // Compile the graph into a runnable app
  const app = workflow.compile();

  console.log("LangGraph compiled successfully.");

  return app;
}
