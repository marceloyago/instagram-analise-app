CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    strengths TEXT NOT NULL,
    weaknesses TEXT NOT NULL,
    problems TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    potential TEXT NOT NULL,
    action_plan TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );
