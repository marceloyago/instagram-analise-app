import type { ChatMessage } from "../lib/chat-schema";

export interface ChatRepository {
    listByOrder(orderId: string): Promise<ChatMessage[]>;
    create(message: Omit<ChatMessage, "id" | "created_at">): Promise<ChatMessage>;
}

export function createChatRepository(db: D1Database): ChatRepository {
    return {
          async listByOrder(orderId: string): Promise<ChatMessage[]> {
                  const { results } = await db
                    .prepare("SELECT * FROM chat_messages WHERE order_id = ? ORDER BY created_at ASC")
                    .bind(orderId)
                    .all<ChatMessage>();
                  return results ?? [];
          },

          async create(message: Omit<ChatMessage, "id" | "created_at">): Promise<ChatMessage> {
                  const id = crypto.randomUUID();
                  const createdAt = new Date().toISOString();

            await db
                    .prepare(`
                              INSERT INTO chat_messages (id, order_id, role, content, type, action, created_at)
                                        VALUES (?, ?, ?, ?, ?, ?, ?)
                                                `)
                    .bind(
                                id,
                                message.order_id,
                                message.role,
                                message.content,
                                message.type ?? "text",
                                message.action ? JSON.stringify(message.action) : null,
                                createdAt
                              )
                    .run();

            return { ...message, id, created_at: createdAt } as ChatMessage;
          },
    };
}
