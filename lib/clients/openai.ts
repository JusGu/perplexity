import OpenAI from 'openai';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateQueries(searchString: string): Promise<string[]> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates search queries. Output exactly 3 search queries in JSON format with a 'queries' array."
        },
        {
          role: "user",
          content: `Generate 3 different search queries for: "${searchString}". Make them specific and search-engine friendly.`
        }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content || '{"queries": []}');
    return result.queries;
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