export interface Env {
    DB: D1Database;
    INSTAGRAM_PROVIDER: string;
    LLM_PROVIDER: string;
    PAYMENT_PROVIDER: string;
    INSTAGRAM_CLIENT_ID?: string;
    INSTAGRAM_CLIENT_SECRET?: string;
    INSTAGRAM_REDIRECT_URI?: string;
    ANTHROPIC_API_KEY?: string;
    ENCRYPTION_KEY?: string;
    ENVIRONMENT: string;
}
