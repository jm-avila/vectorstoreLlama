import { BaseMessage } from "@langchain/core/messages";

export type ToolCall = {
  name: string;
  args: Record<string, any>;
  id?: string;
  type?: "tool_call";
};
export interface AgentState {
  messages: BaseMessage[];
  input: string;
  output?: string;
  toolCall?: ToolCall;
}

export type PartialAgentState = Partial<AgentState>;
