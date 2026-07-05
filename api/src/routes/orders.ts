import { Hono } from "hono";
import { createOrderRepository } from "../db/orders";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/orders/:id/status", async (c) => {
    const orderId = c.req.param("id");
    const repo = createOrderRepository(c.env.DB);
    const order = await repo.getById(orderId);
    if (!order) return c.json({ error: "Order not found" }, 404);
    return c.json({ id: order.id, status: order.status, amount: order.amount });
});

app.post("/api/orders/:id/pay", async (c) => {
    const orderId = c.req.param("id");
    const repo = createOrderRepository(c.env.DB);
    const order = await repo.getById(orderId);
    if (!order) return c.json({ error: "Order not found" }, 404);
    await repo.updateStatus(orderId, "paid");
    return c.json({ id: orderId, status: "paid" });
});

export default app;
