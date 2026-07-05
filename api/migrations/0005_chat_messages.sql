CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK(type IN ('text', 'action')),
    action TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS idx_chat_messages_order_id ON chat_messages(order_id);
