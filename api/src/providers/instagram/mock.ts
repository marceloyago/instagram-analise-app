export interface InstagramMetrics {
    handle: string;
    followers_count: number;
    following_count: number;
    media_count: number;
    engagement_rate: number;
    avg_likes: number;
    avg_comments: number;
    top_hashtags: string[];
    bio: string;
}

export interface InstagramProvider {
    getMetrics(handle: string, _token: string): Promise<InstagramMetrics>;
}

export function createInstagramProvider(_env: Record<string, string>): InstagramProvider {
    return {
          async getMetrics(handle: string): Promise<InstagramMetrics> {
                  const baseFollowers = handle.length * 1234 + 5000;

            return {
                      handle,
                      followers_count: baseFollowers,
                      following_count: Math.floor(baseFollowers * 0.15),
                      media_count: Math.floor(baseFollowers * 0.08),
                      engagement_rate: 1.2 + Math.random() * 2,
                      avg_likes: Math.floor(baseFollowers * 0.03),
                      avg_comments: Math.floor(baseFollowers * 0.005),
                      top_hashtags: ["#marketingdigital", "#instagramdicas", "#empreendedorismo", "#socialmedia", "#crescimentonoig"],
                      bio: `Perfil de ${handle} | Conteudo sobre marketing e crescimento no Instagram | DM para colaboracoes`,
            };
          },
    };
}
