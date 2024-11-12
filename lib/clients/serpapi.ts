import { getJson } from 'serpapi';

if (!process.env.SERPAPI_API_KEY) {
  throw new Error('Missing SERPAPI_API_KEY environment variable');
}

interface SerpApiParams {
  q: string;
  location?: string;
  hl?: string;
  gl?: string;
  google_domain?: string;
  safe?: string;
  start?: number;
  num?: number;
  device?: 'desktop' | 'tablet' | 'mobile';
}

export const serpapi = {
  search: async (query: string) => {
    try {
      // Default parameters for a Google search
      const params: SerpApiParams = {
        q: query,
        google_domain: 'google.com',
        location: 'United States',
        hl: 'en',
        gl: 'us',
        safe: 'active',
        device: 'desktop',
        num: 10, // Number of results per page
      };

      // Build query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      // Add API key
      const apiKey = process.env.SERPAPI_API_KEY;
      const url = `https://serpapi.com/search.json?${queryString}&api_key=${apiKey}&engine=google`;

      console.log('Making SerpAPI request to:', url.replace(apiKey || '', '[REDACTED]'));

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Check for API-level errors
      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      // Return relevant search data
      return {
        organic_results: data.organic_results || [],
        knowledge_graph: data.knowledge_graph,
        answer_box: data.answer_box,
        related_questions: data.related_questions,
        related_searches: data.related_searches,
        search_metadata: data.search_metadata,
        search_parameters: data.search_parameters,
        search_information: data.search_information,
      };
    } catch (error) {
      console.error('SerpAPI error:', error);
      throw error;
    }
  },

  // Helper method for pagination
  searchPage: async (query: string, page: number) => {
    const start = (page - 1) * 10;
    try {
      const params: SerpApiParams = {
        q: query,
        google_domain: 'google.com',
        location: 'United States',
        hl: 'en',
        gl: 'us',
        safe: 'active',
        device: 'desktop',
        start,
        num: 10,
      };

      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const apiKey = process.env.SERPAPI_API_KEY;
      const url = `https://serpapi.com/search.json?${queryString}&api_key=${apiKey}&engine=google`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      return data;
    } catch (error) {
      console.error('SerpAPI error:', error);
      throw error;
    }
  }
}; 