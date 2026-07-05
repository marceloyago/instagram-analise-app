import type { Analysis } from "../lib/chat-schema";

export interface AnalysisRepository {
    getByOrderId(orderId: string): Promise<Analysis | null>;
    create(analysis: Omit<Analysis, "id" | "created_at">): Promise<Analysis>;
}

export function createAnalysisRepository(db: D1Database): AnalysisRepository {
    return {
          async getByOrderId(orderId: string): Promise<Analysis | null> {
                  return db.prepare("SELECT * FROM analyses WHERE order_id = ?").bind(orderId).first<Analysis>();
          },

          async create(analysis: Omit<Analysis, "id" | "created_at">): Promise<Analysis> {
                  const id = crypto.randomUUID();
                  const now = new Date().toISOString();

            await db
                    .prepare(`
                              INSERT INTO analyses (id, order_id, score, strengths, weaknesses, problems, diagnosis, potential, action_plan, created_at)
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                                `)
                    .bind(
                                id,
                                analysis.order_id,
                                analysis.score,
                                JSON.stringify(analysis.strengths),
                                JSON.stringify(analysis.weaknesses),
                                JSON.stringify(analysis.problems),
                                analysis.diagnosis,
                                analysis.potential,
                                JSON.stringify(analysis.action_plan),
                                now
                              )
                    .run();

            return { ...analysis, id, created_at: now };
          },
    };
}
