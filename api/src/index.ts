import { Hono } from "hono";
import { cors } from "hono/cors";
import checkoutRoute from "./routes/checkout";
import ordersRoute from "./routes/orders";
import instagramRoute from "./routes/instagram";
import collectRoute from "./routes/collect";
import analysisRoute from "./routes/analysis";
import chatGetRoute from "./routes/chat-get";
import chatRoute from "./routes/chat";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*" }));

app.route("/", checkoutRoute);
app.route("/", ordersRoute);
app.route("/", instagramRoute);
app.route("/", collectRoute);
app.route("/", analysisRoute);
app.route("/", chatGetRoute);
app.route("/", chatRoute);

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
