import { Hono } from "hono";
import { createChatRepository } from "../db/chat";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/orders/:id/chat", async (c) => {
    const orderId = c.req.param("id");
    const repo = createChatRepository(c.env.DB);
    const messages = await repo.listByOrder(orderId);
    return c.json({ messages });
});

export default app;
