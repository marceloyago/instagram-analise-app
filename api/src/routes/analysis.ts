import { Hono } from "hono";
import { createAnalysisRepository } from "../db/analysis";
import { createSnapshotRepository } from "../db/snapshots";
import { createOrderRepository } from "../db/orders";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post("/api/orders/:id/analyze", async (c) => {
    const orderId = c.req.param("id");
    const orderRepo = createOrderRepository(c.env.DB);
    const order = await orderRepo.getById(orderId);
    if (!order || order.status !== "paid") return c.json({ error: "Payment required" }, 403);

           const snapRepo = createSnapshotRepository(c.env.DB);
    const snapshot = await snapRepo.getByOrderId(orderId);
    if (!snapshot) return c.json({ error: "Metrics not collected" }, 400);

           const analysis = {
                 order_id: orderId,
                 score: Math.floor(60 + Math.random() * 30),
                 strengths: [
                         "Boa frequencia de posts (5x por semana)",
                         "Bio otimizada com CTA claro",
                         "Uso consistente de hashtags de nicho",
                       ],
                 weaknesses: [
                         "Taxa de engajamento abaixo da media do nicho (1.2% vs 3.5%)",
                         "Poucos stories diarios (media de 2 vs recomendado 5+)",
                         "Horarios de postagem inconsistentes",
                       ],
                 problems: [
                         "Inconsistencia de horarios - posts saem em horarios aleatorios",
                         "Falta de resposta a comentarios (responde apenas 15%)",
                         "Conteudo sem carrosseis (so fotos simples, nenhum carrossel nos ultimos 30 dias)",
                       ],
                 diagnosis: "O perfil tem uma base solida de conteudo e frequencia, mas esta travado no crescimento porque nao otimiza o engajamento. O algoritmo do Instagram prioriza conteudo que gera interacao rapida - e seu perfil demora a responder comentarios, nao usa formatos que retem atencao (carrosseis, reels) e posta em horarios que nao coincidem com o pico de atividade da sua audiencia.",
                 potential: "Com ajustes de consistencia, formato de conteudo e engajamento ativo, esse perfil pode dobrar a taxa de alcance em 60-90 dias e chegar a 50k seguidores em 6 meses, mantendo o mesmo nicho.",
                 action_plan: [
                         "Definir calendario editorial fixo: 3 posts feed + 5 stories + 2 reels por semana",
                         "Instalar horarios de pico: usar Insights para descobrir quando seus seguidores estao online e postar 30min antes",
                         "Criar 2 carrosseis informativos por semana (formato com maior retencao no feed)",
                         "Responder 100% dos comentarios nas primeiras 60 minutos apos postar",
                         "Fazer 10 interacoes genuinas (comentarios, nao so likes) em perfis do mesmo nicho todo dia",
                       ],
           };

           const analysisRepo = createAnalysisRepository(c.env.DB);
    await analysisRepo.create(analysis);

           return c.json({ success: true, analysis });
});

app.get("/api/orders/:id/result", async (c) => {
    const orderId = c.req.param("id");
    const analysisRepo = createAnalysisRepository(c.env.DB);
    const analysis = await analysisRepo.getByOrderId(orderId);
    if (!analysis) return c.json({ error: "Analysis not found" }, 404);
    return c.json(analysis);
});

export default app;
