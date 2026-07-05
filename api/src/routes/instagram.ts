import { Hono } from "hono";
import { createSnapshotRepository } from "../db/snapshots";
import { createOrderRepository } from "../db/orders";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/instagram/oauth/start", async (c) => {
    const orderId = c.req.query("order_id");
    if (!orderId) return c.json({ error: "order_id required" }, 400);

          const orderRepo = createOrderRepository(c.env.DB);
    const order = await orderRepo.getById(orderId);
    if (!order || order.status !== "paid") return c.json({ error: "Payment required" }, 403);

          const redirectUri = `${new URL(c.req.url).origin}/api/instagram/oauth/callback?order_id=${orderId}`;
    return c.json({ redirectUrl: redirectUri });
});

app.get("/api/instagram/oauth/callback", async (c) => {
    const orderId = c.req.query("order_id");
    if (!orderId) return c.json({ error: "order_id required" }, 400);

          const snapRepo = createSnapshotRepository(c.env.DB);
    await snapRepo.createConnection({
          order_id: orderId,
          access_token: "mock_token_" + orderId,
          handle: "connected_user",
    });

          const frontendUrl = c.env.ENVIRONMENT === "local"
      ? "http://localhost:5173"
                : new URL(c.req.url).origin.replace("/api", "");
    return c.redirect(`${frontendUrl}/chat/${orderId}?oauth=success`);
});

export default app;
