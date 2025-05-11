import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";
import { queryIndex, getIndex } from "./rag.js";
import { AgentState, PartialAgentState } from "./state.js";
import { VectorStoreIndex } from "llamaindex";

export class QueryIndexTool {
  private static _index: VectorStoreIndex;

  public static async getIndex() {
    if (!this._index) {
      this._index = await getIndex("docs");
    }
    return this._index;
  }

  public static queryIndexTool = new DynamicStructuredTool({
    name: "doc_retriever",
    description:
      "Retrieves relevant sections of external documentation based on a user query. Input must be a natural language question or topic. The tool returns the most pertinent content from the docs to help the agent craft an accurate, grounded response.",
    schema: z.object({
      query: z.string(),
    }),
    func: async (input: { query: string }) => {
      const index = await QueryIndexTool.getIndex();
      const result = await queryIndex(index, input.query);
      return result;
    },
  });

  public static async queryIndexToolNode(
    state: AgentState
  ): Promise<PartialAgentState> {
    const toolCall = state.toolCall;
    if (!toolCall) {
      return {};
    }
    const result = await QueryIndexTool.queryIndexTool.invoke(toolCall);
    return {
      messages: [result],
      toolCall: undefined,
    };
  }

  public static routeMessage = (state: AgentState) => {
    if (state.toolCall) {
      return "tool";
    }
    return "addAIResponse";
  };
}
