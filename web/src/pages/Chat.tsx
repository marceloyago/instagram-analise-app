import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getChatHistory, sendChatMessage } from "../lib/api";
import { Send, Loader2, Instagram, Printer } from "lucide-react";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    type: "text" | "action";
    action?: {
      label: string;
      url?: string;
      action_type?: "oauth" | "download_pdf";
    };
    created_at: string;
}

export default function Chat() {
    const { orderId } = useParams<{ orderId: string }>();
    const [searchParams] = useSearchParams();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const oauthSuccess = searchParams.get("oauth") === "success";

  const loadHistory = useCallback(async () => {
        if (!orderId) return;
        const res = await getChatHistory(orderId);
        setMessages(res.messages);
        if (oauthSuccess && res.messages.length <= 1) {
                triggerProgress();
        }
  }, [orderId, oauthSuccess]);

  useEffect(() => {
        loadHistory();
  }, [loadHistory]);

  useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function triggerProgress() {
        if (!orderId || loading) return;
        setLoading(true);
        const res = await sendChatMessage(orderId, "continue");
        setMessages(res.messages);
        setLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || !orderId || loading) return;
        setLoading(true);
        const res = await sendChatMessage(orderId, input.trim());
        setMessages(res.messages);
        setInput("");
        setLoading(false);
  }

  function handlePrint() {
        window.print();
  }

  function renderMessage(msg: ChatMessage) {
        const isUser = msg.role === "user";
        return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
                <div className={`message-bubble ${msg.role}`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.type === "action" && msg.action && (
                <div className="mt-3">
                  {msg.action.action_type === "oauth" && msg.action.url ? (
                  <a
                      href={msg.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition text-sm"
                    >
                  <Instagram size={16} />
                    {msg.action.label}</a>
                  ) : msg.action.action_type === "download_pdf" ? (
                  <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-2 bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-gray-700 transition text-sm"
                    >
                  <Printer size={16} />
                    {msg.action.label}</button>
                  ) : null}
                </div>
                )}
                </div>
              </div>
              );
  }

  return (
        <div className="h-screen bg-gray-50 flex justify-center items-center p-0 md:p-4">
        <div className="w-full max-w-lg h-full md:h-[90vh] bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-5 py-4 flex items-center gap-3 no-print">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
          <div>
          <h2 className="font-semibold text-sm">IA Estrategista</h2>
          <p className="text-xs text-white/70">Analise de Instagram</p></div>
          <div className="ml-auto text-xs text-white/50">
            Pedido #{orderId?.slice(0, 8)}</div>
        </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 messages-area">
            {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
          <Loader2 className="animate-spin mx-auto mb-2" /> Carregando...</div>
          )}
            {messages.map(renderMessage)}
            {loading && (
          <div className="flex justify-start">
          <div className="message-bubble assistant">
          <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div>
          </div>
          </div>
          )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t px-4 py-3 flex gap-2 no-print bg-white">
          <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              disabled={loading}
            />
          <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-full flex items-center justify-center hover:opacity-90 transition disabled:opacity-40"
            >
          <Send size={18} /></button></form>
        </div>
        </div>
    );
}
