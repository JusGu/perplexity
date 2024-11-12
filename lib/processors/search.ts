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
    console.log('Starting search process for:', searchString);
    
    // Create search record immediately
    const search = await prisma.search.create({
      data: {
        query: searchString,
        refinedQueries: '[]',
      }
    });
    this.searchId = search.id;
    console.log('Created search record with ID:', this.searchId);
    
    // Immediately yield the searchId
    yield { type: 'searchId', data: this.searchId };
    
    // Step 1: Generate refined queries
    yield { type: 'status', message: 'Generating search queries...' };
    console.log('Generating refined queries...');
    try {
      const queries = await this.openai.generateQueries(searchString);
      console.log('Generated queries:', queries);
      
      // Update search record with refined queries
      await prisma.search.update({
        where: { id: this.searchId },
        data: { 
          refinedQueries: JSON.stringify(queries)
        }
      });
      console.log('Updated search record with refined queries');
      
      yield { type: 'queries', data: queries };
    } catch (error) {
      console.error('Error generating queries:', error);
      throw error;
    }

    // Rest of the process...
    try {
      // Step 2: Search using SerpAPI
      yield { type: 'status', message: 'Searching...' };
      const searchResults = [];
      for (const query of JSON.parse(search.refinedQueries)) {
        console.log('Searching with query:', query);
        const result = await this.serpapi.search(query);
        searchResults.push(result);
        yield { type: 'searchResult', data: result };
      }

      // Step 3: Generate summary
      yield { type: 'status', message: 'Generating summary...' };
      console.log('Generating summary...');
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
      console.log('Updated search record with summary');
    } catch (error) {
      console.error('Error in search process:', error);
      throw error;
    }
  }
} 