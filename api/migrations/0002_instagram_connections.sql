CREATE TABLE IF NOT EXISTS instagram_connections (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    handle TEXT NOT NULL,
    connected_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );
