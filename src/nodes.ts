import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "./config.js";
import { AgentState, PartialAgentState } from "./state.js";
import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { HumanMessage } from "@langchain/core/messages";
import { QueryIndexTool } from "./tools.js";

const llm = new ChatGoogleGenerativeAI({
  model: config.llm.geminiModelName,
  apiKey: config.llm.geminiApiKey,
  temperature: 0,
}).bindTools([QueryIndexTool.queryIndexTool]);

export function addUserInputNode(state: AgentState): PartialAgentState {
  if (!state.input) {
    throw new Error("Input is missing in state");
  }
  const newMessage: BaseMessage = new HumanMessage({
    content: state.input,
  });
  return { messages: [newMessage] };
}

function getToolCall(response: AIMessageChunk) {
  const isToolCall =
    response.tool_calls &&
    Array.isArray(response.tool_calls) &&
    response.tool_calls?.length;
  if (isToolCall) {
    return response.tool_calls![0];
  }
  return null;
}

export async function callLLMNode(
  state: AgentState
): Promise<PartialAgentState> {
  if (!state.messages || state.messages.length === 0) {
    throw new Error("Messages are missing or empty in state");
  }
  const response = await llm.invoke(state.messages);

  const toolCall = getToolCall(response);
  if (toolCall) {
    return { toolCall, messages: [response] };
  }
  return { output: response.content.toString() };
}

export function addAIResponseNode(state: AgentState): PartialAgentState {
  if (!state.output) {
    // Handle cases where LLM might not return output (e.g., moderation, error)
    console.warn("No LLM output found in state to add.");
    // Decide how to proceed: maybe end the graph, return an error message, etc.
    // For now, just return without modifying messages
    return {};
  }
  const newMessage: BaseMessage = new AIMessage({
    content: state.output,
  });
  return { messages: [newMessage] };
}

export function systemPromptNode(state: AgentState): PartialAgentState {
  const prompt = `
You are a documentation-focused assistant. Your job is to help users solve real-world tasks by providing clear, structured, and practical answers based strictly on the official documentation. Use the "doc_retriever" tool to find the most relevant content before answering.

**When responding:**
- **Use simple, direct language.** Avoid jargon unless it's explained. Be concise—include only what's needed for the task.
- **Focus on tasks and use cases.** Frame answers around what the user wants to accomplish, not around menus or UI descriptions.
- **Structure your responses logically.** Use headings, bullet points, and step-by-step instructions when applicable.
- **Be action-oriented.** For interfaces or workflows, break down the process into clear steps ("Click X to do Y"), and explain *why* each step matters.
- **Provide examples or scenarios** to illustrate how the feature or concept is applied in practice.
- **Be honest about gaps.** If the docs don't contain the answer, say so—don't invent information.
- **Maintain consistency in terminology and tone.** Stick to the style and language of the documentation unless the user needs simplification.

In short, deliver answers that feel like *excellent documentation*: clear, relevant, and usable.
`;
  const newMessage: BaseMessage = new SystemMessage({
    content: prompt,
  });
  return { messages: [newMessage] };
}
