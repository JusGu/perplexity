'use client';

import { useEffect, useState } from 'react';

function LoadingState() {
  return <div>Loading search results...</div>;
}

interface SearchUpdate {
  type: string;
  data?: any;
  message?: string;
}

interface SearchData {
  query: string;
  refinedQueries: string;
  summary?: string;
}

async function fetchSearch(searchId: string): Promise<SearchData | null> {
  const response = await fetch(`/api/search/${searchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search data');
  }
  return response.json();
}

function SearchContent({ searchId }: { searchId: string }) {
  const [search, setSearch] = useState<SearchData | null>(null);
  const [updates, setUpdates] = useState<SearchUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let eventSource: EventSource | null = null;

    async function loadData() {
      try {
        // Initial data fetch
        const initialData = await fetchSearch(searchId);
        if (mounted) {
          setSearch(initialData);
          setLoading(false);
        }

        // Setup SSE connection
        eventSource = new EventSource(`/api/search/updates?searchId=${searchId}`);
        
        eventSource.onmessage = (event) => {
          if (mounted) {
            const update = JSON.parse(event.data);
            setUpdates(prev => [...prev, update]);

            // Update search data when complete
            if (update.type === 'complete') {
              fetchSearch(searchId).then(newData => {
                if (mounted) {
                  setSearch(newData);
                }
              });
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

    // Cleanup function
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
    <div>
      <h1>Search Results</h1>
      <p>Query: {search.query}</p>
      <p>Refined Queries: {search.refinedQueries}</p>
      {search.summary && (
        <div className="prose" dangerouslySetInnerHTML={{ __html: search.summary }} />
      )}
      
      {/* Real-time updates */}
      <div className="mt-4">
        <h2>Live Updates</h2>
        {updates.map((update, index) => (
          <div key={index} className="mb-2">
            {update.type === 'status' && (
              <p className="text-gray-600">{update.message}</p>
            )}
            {update.type === 'searchResult' && (
              <div className="bg-gray-100 p-2 rounded">
                <p>Found {update.data.organic_results?.length || 0} results</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main page component
export default function SearchPage({ params }: { params: { searchId: string } }) {
  return (
    <div className="container mx-auto p-4">
      <SearchContent searchId={params.searchId} />
    </div>
  );
} 