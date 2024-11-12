import { getJson } from 'serpapi';

export class SerpAPIClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || '';
    if (!this.apiKey) {
      console.error('SERPAPI_API_KEY is not set in environment variables');
    } else {
      console.log('SERPAPI_API_KEY is configured:', this.apiKey.slice(0, 5) + '...');
    }
  }

  async search(query: string) {
    console.log('🔍 SerpAPI: Searching for:', query);
    console.log('Using API key:', this.apiKey.slice(0, 5) + '...');
    
    try {
      const params = {
        q: query,
        api_key: this.apiKey,
        engine: "google",
        num: 5 // Limit results for testing
      };
      console.log('SerpAPI params:', { ...params, api_key: '***' });

      const results = await getJson(params);

      const summary = {
        query,
        numResults: results.organic_results?.length || 0,
        status: results.search_metadata?.status || 'unknown',
        id: results.search_metadata?.id || 'unknown'
      };
      console.log('✅ SerpAPI results:', summary);

      return {
        organic_results: results.organic_results || [],
        search_metadata: results.search_metadata
      };
    } catch (error) {
      console.error('❌ SerpAPI error:', {
        message: error.message,
        query,
        apiKeyConfigured: !!this.apiKey
      });
      throw error;
    }
  }
} 