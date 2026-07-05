CREATE TABLE IF NOT EXISTS instagram_snapshots (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    handle TEXT NOT NULL,
    followers_count INTEGER NOT NULL,
    following_count INTEGER NOT NULL,
    media_count INTEGER NOT NULL,
    engagement_rate REAL NOT NULL,
    avg_likes INTEGER NOT NULL,
    avg_comments INTEGER NOT NULL,
    top_hashtags TEXT,
    bio TEXT,
    collected_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );
