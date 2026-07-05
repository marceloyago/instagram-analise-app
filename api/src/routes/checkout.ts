import { Hono } from "hono";
import { createOrderRepository } from "../db/orders";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post("/api/checkout", async (c) => {
    const repo = createOrderRepository(c.env.DB);
    const order = await repo.create({ status: "pending", amount: 49.9 });
    return c.json({ orderId: order.id, status: order.status, amount: order.amount });
});

export default app;
