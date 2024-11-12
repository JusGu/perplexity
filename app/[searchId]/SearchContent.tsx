'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  headerIds: true, // Add ids to headers
  mangle: false, // Don't escape HTML
  headerPrefix: 'heading-', // Prefix for header ids
});

function LoadingState() {
  return <div>Loading search results...</div>;
}

interface SearchUpdate {
  type: 'status' | 'searchResult' | 'summary' | 'complete';
  data?: any;
  message?: string;
  content?: string;
}

interface SearchData {
  id: string;
  query: string;
  refinedQueries: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchSearch(searchId: string): Promise<SearchData | null> {
  const response = await fetch(`/api/search/${searchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search data');
  }
  return response.json();
}

export default function SearchContent({ searchId }: { searchId: string }) {
  const [search, setSearch] = useState<SearchData | null>(null);
  const [updates, setUpdates] = useState<SearchUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveContent, setLiveContent] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    let eventSource: EventSource | null = null;

    async function loadData() {
      try {
        const initialData = await fetchSearch(searchId);
        if (mounted) {
          setSearch(initialData);
          setLoading(false);
        }

        // Setup SSE connection
        eventSource = new EventSource(`/api/search/updates/${searchId}`);
        
        eventSource.onmessage = (event) => {
          if (mounted) {
            const update: SearchUpdate = JSON.parse(event.data);
            setUpdates(prev => [...prev, update]);

            // Handle different update types
            switch (update.type) {
              case 'summary':
                if (update.content) {
                  setLiveContent(prev => prev + update.content);
                }
                break;
              case 'complete':
                // Fetch final data and close connection
                fetchSearch(searchId).then(newData => {
                  if (mounted) {
                    setSearch(newData);
                    if (eventSource) {
                      eventSource.close();
                    }
                  }
                });
                break;
            }
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          if (eventSource) {
            eventSource.close();
          }
        };
      } catch (error) {
        console.error('Error loading search data:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'An error occurred');
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [searchId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!search) {
    return <div>Search not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Main query as large text */}
        {search?.query && (
          <h1 className="text-3xl font-bold mb-6 text-white">
            {search.query}
          </h1>
        )}

        {/* Refined queries as chips */}
        {search?.refinedQueries && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-400 mb-3">Searching</h2>
            <div className="flex flex-wrap gap-2">
              {search.refinedQueries.split(',').map((query, index) => (
                <div
                  key={index}
                  className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  {query.trim().replace(/[\[\]"]/g, '')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content section */}
        <div className="bg-gray-900 rounded-lg shadow p-6">
          {/* Live content being streamed */}
          {liveContent && (
            <div 
              className="prose prose-invert max-w-none 
                        prose-headings:text-gray-100 
                        prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                        prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3
                        prose-h3:text-xl prose-h3:font-medium prose-h3:mb-2
                        prose-p:text-gray-200 prose-p:mb-4
                        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-100 prose-strong:font-bold
                        prose-ul:text-gray-200 prose-ul:mb-4 prose-ul:list-disc
                        prose-ol:text-gray-200 prose-ol:mb-4 prose-ol:list-decimal
                        prose-li:mb-1
                        prose-code:text-gray-200 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
                        prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded
                        prose-blockquote:text-gray-300 prose-blockquote:border-gray-700
                        prose-hr:border-gray-700" 
              dangerouslySetInnerHTML={{ __html: marked(liveContent) }} 
            />
          )}

          {/* Final summary */}
          {search.summary && !liveContent && (
            <div 
              className="prose prose-invert max-w-none 
                        prose-headings:text-gray-100 
                        prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                        prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3
                        prose-h3:text-xl prose-h3:font-medium prose-h3:mb-2
                        prose-p:text-gray-200 prose-p:mb-4
                        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-100 prose-strong:font-bold
                        prose-ul:text-gray-200 prose-ul:mb-4 prose-ul:list-disc
                        prose-ol:text-gray-200 prose-ol:mb-4 prose-ol:list-decimal
                        prose-li:mb-1
                        prose-code:text-gray-200 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
                        prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded
                        prose-blockquote:text-gray-300 prose-blockquote:border-gray-700
                        prose-hr:border-gray-700" 
              dangerouslySetInnerHTML={{ __html: marked(search.summary || '') }} 
            />
          )}
        </div>
      </div>
      
      {/* Status updates */}
      <div className="space-y-2">
        {updates.map((update, index) => (
          <div key={index} className="text-sm">
            {update.type === 'status' && (
              <p className="text-gray-300">{update.message}</p>
            )}
            {update.type === 'searchResult' && (
              <div className="bg-gray-800 p-2 rounded">
                <p className="text-gray-300">Found {update.data.organic_results?.length || 0} results</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 