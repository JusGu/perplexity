import OpenAI from 'openai';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
    } else {
      console.log('OPENAI_API_KEY is configured:', process.env.OPENAI_API_KEY.slice(0, 5) + '...');
    }
  }

  async generateQueries(searchString: string): Promise<string[]> {
    console.log('🤖 OpenAI: Generating queries for:', searchString);
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates search queries. You must respond with exactly 3 search queries in a JSON array format. Example response: [\"query1\", \"query2\", \"query3\"]"
          },
          {
            role: "user",
            content: `Generate 3 different search queries for: "${searchString}". Make them specific and search-engine friendly. Respond only with the JSON array.`
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '[]';
      console.log('✅ OpenAI raw response:', content);
      
      try {
        const queries = JSON.parse(content);
        if (Array.isArray(queries) && queries.length === 3) {
          console.log('✅ OpenAI parsed queries:', queries);
          return queries;
        }
        console.warn('⚠️ OpenAI response not in expected format, using fallback');
        return [searchString];
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response:', { content, error: parseError.message });
        return [searchString];
      }
    } catch (error) {
      console.error('❌ OpenAI error:', {
        message: error.message,
        searchString
      });
      return [searchString];
    }
  }

  async generateSummary(searchResults: any[]) {
    return await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Summarize the search results in markdown format. Include relevant links and citations."
        },
        {
          role: "user",
          content: `Summarize these search results: ${JSON.stringify(searchResults)}`
        }
      ],
      stream: true
    });
  }
} 