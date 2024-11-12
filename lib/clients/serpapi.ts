import { getJson } from 'serpapi';

export class SerpAPIClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || '';
  }

  async search(query: string) {
    console.log('SerpAPI: Starting search for query:', query);
    try {
      const results = await getJson({
        q: query,
        api_key: this.apiKey,
        engine: "google",
        num: 5 // Limit results for testing
      });

      console.log('SerpAPI: Got results:', {
        numResults: results.organic_results?.length || 0,
        status: results.search_metadata?.status || 'unknown'
      });

      return {
        organic_results: results.organic_results || [],
        search_metadata: results.search_metadata
      };
    } catch (error) {
      console.error('SerpAPI error:', error);
      throw error;
    }
  }
} 