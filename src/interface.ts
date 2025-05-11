import { z } from "zod";
import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";

export const RawMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  messageOrder: z.number(),
  messageType: z.string(),
  content: z.string(),
});

export type RawMessage = z.infer<typeof RawMessageSchema>;

export function mapRawMessageToMessage(row: unknown): BaseMessage {
  if (!row) {
    throw new Error("Row is null");
  }
  if (typeof row !== "object") {
    throw new Error("Row is not an object");
  }
  const dbRow = row as Record<string, unknown>;
  const transformedRow = {
    id: dbRow.id,
    conversationId: dbRow.conversation_id,
    messageOrder: dbRow.message_order,
    messageType: dbRow.message_type,
    content: dbRow.content,
  };
  const rawMessage = RawMessageSchema.parse(transformedRow);
  const BaseMessage = {
    content: rawMessage.content,
    id: rawMessage.id,
    additional_kwargs: {
      conversationId: rawMessage.conversationId,
      messageOrder: rawMessage.messageOrder,
    },
  };
  switch (rawMessage.messageType) {
    case "human":
      return new HumanMessage(BaseMessage);
    case "ai":
      return new AIMessage(BaseMessage);
    case "system":
      return new SystemMessage(BaseMessage);
    default:
      throw new Error(`Unknown message type: ${rawMessage.messageType}`);
  }
}

export interface NewMessage {
  conversationId: string;
  messageOrder: number;
  messageType: string;
  content: string;
}
