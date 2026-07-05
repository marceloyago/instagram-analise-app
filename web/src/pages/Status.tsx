import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderStatus, payOrder } from "../lib/api";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

export default function Status() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState("pending");
    const [loading, setLoading] = useState(false);

  useEffect(() => {
        if (!orderId) return;
        const interval = setInterval(async () => {
                const data = await getOrderStatus(orderId);
                setStatus(data.status);
                if (data.status === "paid") {
                          clearInterval(interval);
                          navigate(`/chat/${orderId}`);
                }
        }, 2000);
        return () => clearInterval(interval);
  }, [orderId, navigate]);

  async function handlePay() {
        if (!orderId) return;
        setLoading(true);
        await payOrder(orderId);
        setStatus("paid");
        setLoading(false);
        navigate(`/chat/${orderId}`);
  }

  return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === "pending" ? (
          <>
          <CreditCard size={48} className="text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Aguardando pagamento</h2>
          <p className="text-gray-500 text-sm mb-6">
            Simule o pagamento clicando no botao abaixo.</p>
          <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Simular pagamento"}</button></>
          ) : (
          <>
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Pagamento confirmado!</h2>
          <p className="text-gray-500 text-sm">Redirecionando para o chat...</p></>
          )}
        </div>
        </div>
    );
}
