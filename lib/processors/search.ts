import { Search } from '@prisma/client';
import { openai } from '../clients/openai';
import { serpapi } from '../clients/serpapi';

interface SearchCallbacks {
  onStatus: (message: string) => void;
  onSearchResult: (data: any) => void;
  onSummary: (content: string) => void;
  onComplete: () => void;
}

function trimSearchResults(results: any) {
  // Take only essential fields from organic results
  const trimmedResults = {
    organic_results: (results.organic_results || []).slice(0, 5).map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link
    })),
    answer_box: results.answer_box ? {
      title: results.answer_box.title,
      answer: results.answer_box.answer,
      snippet: results.answer_box.snippet
    } : null,
    knowledge_graph: results.knowledge_graph ? {
      title: results.knowledge_graph.title,
      description: results.knowledge_graph.description,
      type: results.knowledge_graph.type
    } : null,
    related_questions: (results.related_questions || []).slice(0, 3)
  };

  return trimmedResults;
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
      // Trim search results to reduce token count
      const trimmedResults = trimSearchResults(searchResults);

      // Stream the summary generation using GPT-4 Turbo
      const stream = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview', // GPT-4 Turbo with 128k context
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes search results. Provide a clear, concise summary with relevant details and insights.'
          },
          {
            role: 'user',
            content: `Summarize these search results about "${search.query}": ${JSON.stringify(trimmedResults)}`
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000 // Limit response length
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