import { Search } from '@prisma/client';
import { openai } from '../clients/openai';
import { serpapi } from '../clients/serpapi';

interface SearchCallbacks {
  onStatus: (message: string) => void;
  onSearchResult: (data: any) => void;
  onSummary: (content: string) => void;
  onComplete: () => void;
}

export async function processSearch(search: Search, callbacks: SearchCallbacks) {
  try {
    callbacks.onStatus('Searching the web...');
    
    // Perform web search
    let searchResults;
    try {
      searchResults = await serpapi.search(search.query);
      callbacks.onSearchResult(searchResults);
    } catch (error) {
      console.error('SerpAPI search error:', error);
      callbacks.onStatus('Error fetching search results');
      throw error;
    }

    callbacks.onStatus('Generating summary...');
    
    try {
      // Stream the summary generation
      const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes search results.'
          },
          {
            role: 'user',
            content: `Summarize these search results about "${search.query}": ${JSON.stringify(searchResults)}`
          }
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          callbacks.onSummary(content);
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      callbacks.onStatus('Error generating summary');
      throw error;
    }

    callbacks.onComplete();
  } catch (error) {
    console.error('Error in processSearch:', error);
    callbacks.onStatus('Search process failed');
    throw error;
  }
} 