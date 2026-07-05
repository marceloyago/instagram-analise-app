import type { Order } from "../lib/chat-schema";

export interface OrderRepository {
    getById(id: string): Promise<Order | null>;
    create(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order>;
    updateStatus(id: string, status: Order["status"]): Promise<void>;
}

export function createOrderRepository(db: D1Database): OrderRepository {
    return {
          async getById(id: string): Promise<Order | null> {
                  return db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<Order>();
          },

          async create(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
                  const id = crypto.randomUUID();
                  const now = new Date().toISOString();

            await db
                    .prepare("INSERT INTO orders (id, status, amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
                    .bind(id, order.status, order.amount, now, now)
                    .run();

            return { ...order, id, created_at: now, updated_at: now };
          },

          async updateStatus(id: string, status: Order["status"]): Promise<void> {
                  await db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?")
                    .bind(status, new Date().toISOString(), id)
                    .run();
          },
    };
}
