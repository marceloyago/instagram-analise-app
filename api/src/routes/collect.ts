import { Hono } from "hono";
import { createSnapshotRepository } from "../db/snapshots";
import { createOrderRepository } from "../db/orders";
import { createInstagramProvider } from "../providers/instagram/mock";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post("/api/orders/:id/collect", async (c) => {
    const orderId = c.req.param("id");
    const orderRepo = createOrderRepository(c.env.DB);
    const order = await orderRepo.getById(orderId);
    if (!order || order.status !== "paid") return c.json({ error: "Payment required" }, 403);

           const snapRepo = createSnapshotRepository(c.env.DB);
    const connection = await snapRepo.getConnectionByOrderId(orderId);
    if (!connection) return c.json({ error: "Instagram not connected" }, 400);

           const provider = createInstagramProvider(c.env);
    const metrics = await provider.getMetrics(connection.handle, connection.access_token);

           await snapRepo.create({
                 order_id: orderId,
                 handle: metrics.handle,
                 followers_count: metrics.followers_count,
                 following_count: metrics.following_count,
                 media_count: metrics.media_count,
                 engagement_rate: metrics.engagement_rate,
                 avg_likes: metrics.avg_likes,
                 avg_comments: metrics.avg_comments,
                 top_hashtags: metrics.top_hashtags,
                 bio: metrics.bio,
           });

           return c.json({ success: true, metrics });
});

export default app;
