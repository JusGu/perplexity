import { getJson } from 'serpapi';

if (!process.env.SERPAPI_API_KEY) {
  throw new Error('Missing SERPAPI_API_KEY environment variable');
}

export const serpapi = {
  search: async (query: string) => {
    try {
      const response = await getJson({
        q: query,
        api_key: process.env.SERPAPI_API_KEY,
        engine: "google",
      });
      return response;
    } catch (error) {
      console.error('SerpAPI error:', error);
      throw error;
    }
  }
}; 