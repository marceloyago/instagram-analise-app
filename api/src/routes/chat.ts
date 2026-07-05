import { Hono } from "hono";
import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { chatRequestSchema } from "../lib/chat-schema";
import { createChatRepository } from "../db/chat";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

type Stage = "awaiting_handle" | "awaiting_connection" | "collecting" | "analyzing" | "done";

interface AnalysisResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    problems: string[];
    diagnosis: string;
    potential: string;
    action_plan: string[];
}

async function detectStage(
    orderId: string,
    history: { role: string; content: string }[],
    db: D1Database
  ): Promise<Stage> {
    const analysisRow = await db.prepare("SELECT id FROM analyses WHERE order_id = ?").bind(orderId).first();
    if (analysisRow) return "done";

  const snapshotRow = await db.prepare("SELECT id FROM instagram_snapshots WHERE order_id = ?").bind(orderId).first();
    if (snapshotRow) return "analyzing";

  const connectionRow = await db.prepare("SELECT id FROM instagram_connections WHERE order_id = ?").bind(orderId).first();
    if (connectionRow) return "collecting";

  const hasHandle = history.some(
        (m) => m.role === "user" && /^@?[a-zA-Z0-9._]{1,30}$/.test(m.content.trim().replace(/^@/, ""))
      );
    if (hasHandle) return "awaiting_connection";

  return "awaiting_handle";
}

interface ScriptedMessage {
    role: "assistant";
    content: string;
    type: "text" | "action";
    action?: {
      label: string;
      url?: string;
      action_type?: "oauth" | "download_pdf";
    };
}

async function generateScriptedMessage(
    stage: "awaiting_handle" | "awaiting_connection" | "collecting" | "analyzing",
    orderId: string,
    c: Context<{ Bindings: Env }>
  ): Promise<ScriptedMessage> {
    const baseUrl = new URL(c.req.url).origin;

  switch (stage) {
    case "awaiting_handle":
            return {
                      role: "assistant",
                      content: "E ai! Tudo certo com o pagamento. 🎉\n\nAgora me conta: qual eh o @ do Instagram que voce quer que eu analise? Pode mandar com ou sem o arroba.",
                      type: "text",
            };
    case "awaiting_connection":
            return {
                      role: "assistant",
                      content: "Perfeito! Agora preciso que voce conecte sua conta do Instagram pra eu conseguir acessar os dados publicos dela. Eh rapido e seguro - so leitura, ta? 🔒",
                      type: "action",
                      action: {
                                  label: "🔗 Conectar Instagram",
                                  url: `${baseUrl}/api/instagram/oauth/start?order_id=${orderId}`,
                                  action_type: "oauth",
                      },
            };
    case "collecting":
            return {
                      role: "assistant",
                      content: "Conectado! 🚀 Agora estou coletando seus dados do Instagram... so um segundinho.",
                      type: "text",
            };
    case "analyzing":
            return {
                      role: "assistant",
                      content: "Dados coletados! 📊 Agora estou analisando tudo com calma... isso pode levar alguns segundos.",
                      type: "text",
            };
  }
}

async function callCollect(orderId: string, c: Context<{ Bindings: Env }>): Promise<boolean> {
    const baseUrl = new URL(c.req.url).origin;
    const res = await fetch(`${baseUrl}/api/orders/${orderId}/collect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
    });
    return res.ok;
}

async function callAnalyze(orderId: string, c: Context<{ Bindings: Env }>): Promise<boolean> {
    const baseUrl = new URL(c.req.url).origin;
    const res = await fetch(`${baseUrl}/api/orders/${orderId}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
    });
    return res.ok;
}

async function fetchAnalysis(orderId: string, c: Context<{ Bindings: Env }>): Promise<AnalysisResult | null> {
    const baseUrl = new URL(c.req.url).origin;
    const res = await fetch(`${baseUrl}/api/orders/${orderId}/result`);
    if (!res.ok) return null;
    return res.json() as Promise<AnalysisResult>;
}

function formatAnalysisResult(analysis: AnalysisResult): string {
    const lines = [
          "",
          `📊 Nota geral: ${analysis.score}/100`,
          "",
          "✅ Pontos fortes:",
          ...analysis.strengths.map((s) => `- ${s}`),
          "",
          "⚠️ Pontos fracos:",
          ...analysis.weaknesses.map((w) => `- ${w}`),
          "",
          "🚨 Problemas identificados:",
          ...analysis.problems.map((p) => `- ${p}`),
          "",
          "🩺 Diagnostico:",
          analysis.diagnosis,
          "",
          "🚀 Potencial:",
          analysis.potential,
          "",
          "📋 Plano de acao:",
          ...analysis.action_plan.map((a, i) => `${i + 1}. ${a}`),
          "",
          "---",
          "Quer que eu aprofunde em algum desses pontos? Eh so perguntar! 👇",
        ];

  return lines.join("\n");
}

async function callLLM(
    orderId: string,
    userMessage: string,
    history: { role: string; content: string }[],
    c: Context<{ Bindings: Env }>
  ): Promise<string> {
    const analysis = await fetchAnalysis(orderId, c);
    const providerName = c.env.LLM_PROVIDER ?? "mock";
    const { createLLMProvider } = await import(`../providers/llm/${providerName}.ts`);
    const llm = createLLMProvider(c.env);

  const systemPrompt = `Voce eh um estrategista de social media brasileiro, especialista em Instagram. Analisou o perfil do cliente e agora esta numa conversa livre respondendo duvidas sobre o resultado.

  Dados da analise:
  ${analysis ? JSON.stringify(analysis, null, 2) : "Analise nao disponivel."}

  Responda em portugues do Brasil, direto ao ponto, sem enrolacao. Use os dados reais da analise quando possivel. Se nao souber algo, seja honesto.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: userMessage },
      ];

  return llm.chat(messages);
}

app.post("/api/orders/:id/chat", zValidator("json", chatRequestSchema), async (c) => {
    const orderId = c.req.param("id");
    const { content } = c.req.valid("json");
    const db = c.env.DB;
    const repo = createChatRepository(db);

           await repo.create({ order_id: orderId, role: "user", content, type: "text" });

           const history = await repo.listByOrder(orderId);
    const stage = await detectStage(orderId, history, db);

           let assistantMessage: ScriptedMessage;

           if (stage === "awaiting_handle") {
                 const handleMatch = content.trim().replace(/^@/, "").match(/^[a-zA-Z0-9._]{1,30}$/);
                 if (handleMatch) {
                         assistantMessage = await generateScriptedMessage("awaiting_connection", orderId, c);
                 } else {
                         assistantMessage = {
                                   role: "assistant",
                                   content: "Hmm, nao consegui identificar um @ do Instagram ai. Pode mandar de novo? Exemplo: @seuperfil ou so seuperfil",
                                   type: "text",
                         };
                 }
                 await repo.create({ ...assistantMessage, order_id: orderId });
                 return c.json({ messages: await repo.listByOrder(orderId) });
           }

           if (stage === "awaiting_connection") {
                 assistantMessage = await generateScriptedMessage("awaiting_connection", orderId, c);
                 await repo.create({ ...assistantMessage, order_id: orderId });
                 return c.json({ messages: await repo.listByOrder(orderId) });
           }

           if (stage === "collecting") {
                 assistantMessage = await generateScriptedMessage("collecting", orderId, c);
                 await repo.create({ ...assistantMessage, order_id: orderId });

      const collectOk = await callCollect(orderId, c);
                 if (collectOk) {
                         const updatedHistory = await repo.listByOrder(orderId);
                         const newStage = await detectStage(orderId, updatedHistory, db);

                   if (newStage === "analyzing") {
                             const analyzingMsg = await generateScriptedMessage("analyzing", orderId, c);
                             await repo.create({ ...analyzingMsg, order_id: orderId });

                           const analyzeOk = await callAnalyze(orderId, c);
                             if (analyzeOk) {
                                         const finalHistory = await repo.listByOrder(orderId);
                                         const finalStage = await detectStage(orderId, finalHistory, db);
                                         if (finalStage === "done") {
                                                       const analysis = await fetchAnalysis(orderId, c);
                                                       if (analysis) {
                                                                       const resultMsg: ScriptedMessage = {
                                                                                         role: "assistant",
                                                                                         content: formatAnalysisResult(analysis),
                                                                                         type: "action",
                                                                                         action: { label: "📄 Baixar PDF", action_type: "download_pdf" },
                                                                       };
                                                                       await repo.create({ ...resultMsg, order_id: orderId });
                                                                       return c.json({ messages: await repo.listByOrder(orderId) });
                                                       }
                                         }
                             }
                   }
                 }

      return c.json({ messages: await repo.listByOrder(orderId) });
           }

           if (stage === "analyzing") {
                 assistantMessage = await generateScriptedMessage("analyzing", orderId, c);
                 await repo.create({ ...assistantMessage, order_id: orderId });

      const analyzeOk = await callAnalyze(orderId, c);
                 if (analyzeOk) {
                         const finalHistory = await repo.listByOrder(orderId);
                         const finalStage = await detectStage(orderId, finalHistory, db);
                         if (finalStage === "done") {
                                   const analysis = await fetchAnalysis(orderId, c);
                                   if (analysis) {
                                               const resultMsg: ScriptedMessage = {
                                                             role: "assistant",
                                                             content: formatAnalysisResult(analysis),
                                                             type: "action",
                                                             action: { label: "📄 Baixar PDF", action_type: "download_pdf" },
                                               };
                                               await repo.create({ ...resultMsg, order_id: orderId });
                                   }
                         }
                 }

      return c.json({ messages: await repo.listByOrder(orderId) });
           }

           const llmResponse = await callLLM(orderId, content, history, c);
    assistantMessage = { role: "assistant", content: llmResponse, type: "text" };
    await repo.create({ ...assistantMessage, order_id: orderId });

           return c.json({ messages: await repo.listByOrder(orderId) });
});

export default app;
