import type { InstagramSnapshot, InstagramConnection } from "../lib/chat-schema";

export interface SnapshotRepository {
    getByOrderId(orderId: string): Promise<InstagramSnapshot | null>;
    create(snapshot: Omit<InstagramSnapshot, "id" | "collected_at">): Promise<InstagramSnapshot>;
    getConnectionByOrderId(orderId: string): Promise<InstagramConnection | null>;
    createConnection(connection: Omit<InstagramConnection, "id" | "connected_at">): Promise<InstagramConnection>;
}

export function createSnapshotRepository(db: D1Database): SnapshotRepository {
    return {
          async getByOrderId(orderId: string): Promise<InstagramSnapshot | null> {
                  return db.prepare("SELECT * FROM instagram_snapshots WHERE order_id = ?").bind(orderId).first<InstagramSnapshot>();
          },

          async create(snapshot: Omit<InstagramSnapshot, "id" | "collected_at">): Promise<InstagramSnapshot> {
                  const id = crypto.randomUUID();
                  const now = new Date().toISOString();

            await db
                    .prepare(`
                              INSERT INTO instagram_snapshots (id, order_id, handle, followers_count, following_count, media_count, engagement_rate, avg_likes, avg_comments, top_hashtags, bio, collected_at)
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                                `)
                    .bind(
                                id,
                                snapshot.order_id,
                                snapshot.handle,
                                snapshot.followers_count,
                                snapshot.following_count,
                                snapshot.media_count,
                                snapshot.engagement_rate,
                                snapshot.avg_likes,
                                snapshot.avg_comments,
                                JSON.stringify(snapshot.top_hashtags),
                                snapshot.bio,
                                now
                              )
                    .run();

            return { ...snapshot, id, collected_at: now };
          },

          async getConnectionByOrderId(orderId: string): Promise<InstagramConnection | null> {
                  return db.prepare("SELECT * FROM instagram_connections WHERE order_id = ?").bind(orderId).first<InstagramConnection>();
          },

          async createConnection(connection: Omit<InstagramConnection, "id" | "connected_at">): Promise<InstagramConnection> {
                  const id = crypto.randomUUID();
                  const now = new Date().toISOString();

            await db
                    .prepare("INSERT INTO instagram_connections (id, order_id, access_token, handle, connected_at) VALUES (?, ?, ?, ?, ?)")
                    .bind(id, connection.order_id, connection.access_token, connection.handle, now)
                    .run();

            return { ...connection, id, connected_at: now };
          },
    };
}
