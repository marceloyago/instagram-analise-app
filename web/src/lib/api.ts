const API_BASE = import.meta.env.VITE_API_URL || "";

export async function createCheckout() {
    const res = await fetch(`${API_BASE}/api/checkout`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to create checkout");
    return res.json();
}

export async function getOrderStatus(orderId: string) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`);
    if (!res.ok) throw new Error("Failed to get order status");
    return res.json();
}

export async function payOrder(orderId: string) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/pay`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to pay order");
    return res.json();
}

export async function getChatHistory(orderId: string) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/chat`);
    if (!res.ok) throw new Error("Failed to load chat history");
    return res.json();
}

export async function sendChatMessage(orderId: string, content: string) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
}
