import { z } from "zod";

export const chatMessageSchema = z.object({
    id: z.string().uuid(),
    order_id: z.string().uuid(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    type: z.enum(["text", "action"]).default("text"),
    action: z.object({
          label: z.string(),
          url: z.string().optional(),
          action_type: z.enum(["oauth", "download_pdf"]).optional(),
    }).optional(),
    created_at: z.string().datetime(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
    content: z.string().min(1).max(2000),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const orderSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(["pending", "paid", "failed", "refunded"]),
    amount: z.number(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export type Order = z.infer<typeof orderSchema>;

export const analysisSchema = z.object({
    id: z.string().uuid(),
    order_id: z.string().uuid(),
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    problems: z.array(z.string()),
    diagnosis: z.string(),
    potential: z.string(),
    action_plan: z.array(z.string()),
    created_at: z.string().datetime(),
});

export type Analysis = z.infer<typeof analysisSchema>;

export const instagramSnapshotSchema = z.object({
    id: z.string().uuid(),
    order_id: z.string().uuid(),
    handle: z.string(),
    followers_count: z.number(),
    following_count: z.number(),
    media_count: z.number(),
    engagement_rate: z.number(),
    avg_likes: z.number(),
    avg_comments: z.number(),
    top_hashtags: z.array(z.string()),
    bio: z.string(),
    collected_at: z.string().datetime(),
});

export type InstagramSnapshot = z.infer<typeof instagramSnapshotSchema>;

export const instagramConnectionSchema = z.object({
    id: z.string().uuid(),
    order_id: z.string().uuid(),
    access_token: z.string(),
    handle: z.string(),
    connected_at: z.string().datetime(),
});

export type InstagramConnection = z.infer<typeof instagramConnectionSchema>;
