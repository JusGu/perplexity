import { getJson } from 'serpapi';

export class SerpAPIClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || '';
  }

  async search(query: string) {
    const results = await getJson({
      q: query,
      api_key: this.apiKey,
      engine: "google"
    });

    return results;
  }
} 