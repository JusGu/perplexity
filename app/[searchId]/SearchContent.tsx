'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

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
        <h1 className="text-2xl font-bold mb-4 text-white">Search Results</h1>
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <p className="text-gray-300 mb-2">Query: {search.query}</p>
          <p className="text-gray-300 mb-4">Refined Queries: {search.refinedQueries}</p>
          
          {/* Live content being streamed */}
          {liveContent && (
            <div 
              className="prose prose-invert max-w-none text-gray-100" 
              dangerouslySetInnerHTML={{ __html: marked(liveContent) }} 
            />
          )}

          {/* Final summary */}
          {search.summary && !liveContent && (
            <div 
              className="prose prose-invert max-w-none text-gray-100" 
              dangerouslySetInnerHTML={{ __html: marked(search.summary) }} 
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