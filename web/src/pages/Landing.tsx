import { useNavigate } from "react-router-dom";
import { createCheckout } from "../lib/api";
import { Sparkles, Instagram, ArrowRight } from "lucide-react";

export default function Landing() {
    const navigate = useNavigate();

  async function handleStart() {
        const { orderId } = await createCheckout();
        navigate(`/status/${orderId}`);
  }

  return (
        <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Instagram size={40} /></div>
            <h1 className="text-4xl font-bold mb-4">Analise de Instagram por IA</h1>
            <p className="text-lg text-white/80 mb-8">
              Descubra o que esta travando o crescimento do seu perfil e receba um plano de acao personalizado.</p>
            <div className="space-y-4 mb-8 text-left">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-sm">Analise completa com nota de 0-100</span></div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-sm">Diagnostico e plano de acao especificos</span></div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-sm">Chat com estrategista de IA ilimitado</span></div>
            </div>
            <button
                onClick={handleStart}
                className="w-full bg-white text-purple-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition"
              >
            Analisar meu Instagram <ArrowRight size={20} /></button>
            <p className="text-sm text-white/50 mt-4">R$ 49,90 - pagamento unico</p>
          </div>
        </div>
    );
}
