import { OpenAIClient } from '../clients/openai';
import { SerpAPIClient } from '../clients/serpapi';
import { prisma } from '../prisma';
import { searchUpdatesStore } from '../store';

export class SearchProcessor {
  private openai: OpenAIClient;
  private serpapi: SerpAPIClient;
  private searchId: string | null = null;
  
  constructor() {
    this.openai = new OpenAIClient();
    this.serpapi = new SerpAPIClient();
  }

  async *processSearch(searchString: string) {
    console.log('🔄 Starting search process for:', searchString);
    
    // Create search record immediately
    const search = await prisma.search.create({
      data: {
        query: searchString,
        refinedQueries: '[]',
      }
    });
    this.searchId = search.id;
    
    const publishUpdate = (update: any) => {
      if (this.searchId) {
        searchUpdatesStore.publish(this.searchId, update);
      }
      return update;
    };
    
    yield publishUpdate({ type: 'searchId', data: this.searchId });
    
    try {
      // Step 1: Generate refined queries
      yield publishUpdate({ type: 'status', message: 'Generating search queries...' });
      const queries = await this.openai.generateQueries(searchString);
      
      await prisma.search.update({
        where: { id: this.searchId },
        data: { refinedQueries: JSON.stringify(queries) }
      });
      
      yield publishUpdate({ type: 'queries', data: queries });

      // Step 2: Search using SerpAPI
      yield publishUpdate({ type: 'status', message: 'Searching...' });
      const searchResults = [];
      
      for (const query of queries) {
        const result = await this.serpapi.search(query);
        searchResults.push(result);
        yield publishUpdate({ type: 'searchResult', data: result });
      }

      // Step 3: Generate summary
      yield publishUpdate({ type: 'status', message: 'Generating summary...' });
      const summaryStream = await this.openai.generateSummary(searchResults);
      
      let fullSummary = '';
      for await (const chunk of summaryStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullSummary += content;
        yield publishUpdate({ type: 'summary', data: content });
      }

      await prisma.search.update({
        where: { id: this.searchId },
        data: { summary: fullSummary }
      });
      
      yield publishUpdate({ type: 'complete', data: { summary: fullSummary } });
    } catch (error) {
      console.error('❌ Error in search process:', error);
      yield publishUpdate({ type: 'error', message: error instanceof Error ? error.message : 'An unknown error occurred' });
      throw error;
    }
  }
} 