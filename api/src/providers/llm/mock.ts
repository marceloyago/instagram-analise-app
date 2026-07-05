export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface LLMProvider {
    chat(messages: LLMMessage[]): Promise<string>;
}

export function createLLMProvider(_env: Record<string, string>): LLMProvider {
    return {
          async chat(messages: LLMMessage[]): Promise<string> {
                  const lastUser = messages.filter((m) => m.role === "user").pop();
                  const userText = lastUser?.content?.toLowerCase() ?? "";

            if (userText.includes("engajamento") || userText.includes("baixo")) {
                      return "Seu engajamento esta em 1.2%, bem abaixo dos 3.5% do seu nicho. O principal gargalo eh a falta de resposta a comentarios - voce responde so 15%. Se passar a responder 100% nas primeiras 60 min, isso sobe o engajamento organico rapidinho. Quer um passo a passo disso?";
            }

            if (userText.includes("horario") || userText.includes("postar")) {
                      return "Voce posta em horarios aleatorios, e isso prejudica o alcance. O Instagram entrega primeiro pros seguidores mais engajados - se eles nao estao online na hora, seu post morre. Vai em Insights -> Audiencia e olha os horarios de pico. Regra: posta 30 min antes do pico. Pra maioria dos nichos no Brasil, isso eh entre 18h-21h.";
            }

            if (userText.includes("carrossel") || userText.includes("formato")) {
                      return "Carrosseis tem a maior retencao no feed do Instagram porque o algoritmo conta cada slide como uma 'impressao' separada. Seu perfil nao postou nenhum carrossel nos ultimos 30 dias. Sugestao: transforme suas dicas em carrosseis de 5-7 slides. O primeiro slide precisa ser um 'gancho' visual forte.";
            }

            if (userText.includes("semana") || userText.includes("posto") || userText.includes("calendario")) {
                      return "Com base na sua analise, aqui vai um calendario semanal pratico:\n\nSegunda: Carrossel educativo\nTerca: Reels (trend ou dica rapida)\nQuarta: Foto + legenda storytelling\nQuinta: Reels (bastidores)\nSexta: Carrossel (case ou resultado)\nSabado: Stories interativos\nDomingo: Foto + CTA forte\n\nStories todos os dias, minimo 5. Reels 2x por semana eh o minimo pra crescer em 2026.";
            }

            if (userText.includes("reels") || userText.includes("video")) {
                      return "Reels sao o formato com maior alcance organico do Instagram hoje. Seu perfil nao posta reels - isso eh uma oportunidade gigante. Comece com 2 reels por semana: um educativo (15-30s) e um de bastidores. Use legendas queimadas porque 85% assistem sem som. Gancho nos primeiros 3 segundos.";
            }

            if (userText.includes("obrigado") || userText.includes("valeu")) {
                      return "Disponha! Se surgir mais alguma duvida, eh so chamar. Boa sorte com o crescimento do perfil!";
            }

            return "Boa pergunta! Com base nos dados da sua analise, o foco principal deve ser em consistencia de horarios + formato de conteudo (carrosseis e reels) + engajamento ativo (responder comentarios).\n\nQuer que eu aprofunde em algum desses tres pilares?";
          },
    };
}
