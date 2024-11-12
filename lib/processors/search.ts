import { OpenAIClient } from '../clients/openai';
import { SerpAPIClient } from '../clients/serpapi';
import { prisma } from '../prisma';

export class SearchProcessor {
  private openai: OpenAIClient;
  private serpapi: SerpAPIClient;
  private searchId: string | null = null;
  
  constructor() {
    this.openai = new OpenAIClient();
    this.serpapi = new SerpAPIClient();
  }

  async *processSearch(searchString: string) {
    // Create search record
    const search = await prisma.search.create({
      data: {
        query: searchString,
        refinedQueries: '[]',
      }
    });
    this.searchId = search.id;
    
    // Step 1: Generate refined queries
    yield { type: 'status', message: 'Generating search queries...' };
    const queries = await this.openai.generateQueries(searchString);
    
    // Update search record with refined queries
    await prisma.search.update({
      where: { id: this.searchId },
      data: { 
        refinedQueries: JSON.stringify(queries)
      }
    });
    
    yield { type: 'queries', data: queries };

    // Step 2: Search using SerpAPI
    yield { type: 'status', message: 'Searching...' };
    const searchResults = [];
    for (const query of queries) {
      const result = await this.serpapi.search(query);
      searchResults.push(result);
      yield { type: 'searchResult', data: result };
    }

    // Step 3: Generate summary
    yield { type: 'status', message: 'Generating summary...' };
    const summaryStream = await this.openai.generateSummary(searchResults);
    
    let fullSummary = '';
    for await (const chunk of summaryStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullSummary += content;
      yield { type: 'summary', data: content };
    }

    // Update search record with final summary
    await prisma.search.update({
      where: { id: this.searchId },
      data: { 
        summary: fullSummary
      }
    });

    yield { type: 'searchId', data: this.searchId };
  }
} 