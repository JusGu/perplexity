'use client';

import { useState } from 'react';

export default function SearchForm() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchString = formData.get('search') as string;

    setIsLoading(true);
    setResults([]);
    setSearchId(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchString }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Parse the chunks
        const chunk = new TextDecoder().decode(value);
        const updates = chunk.split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

        // Handle search ID
        updates.forEach(update => {
          if (update.type === 'searchId') {
            setSearchId(update.data);
          }
        });

        setResults(prev => [...prev, ...updates]);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          name="search"
          placeholder="Enter your search..."
          className="border p-2 mr-2 w-96 bg-black text-white placeholder-gray-400 rounded-md"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="results">
        {searchId && (
          <p className="text-sm text-gray-500 mb-2">
            Search ID: {searchId}
          </p>
        )}
        {results.map((result, index) => (
          <div key={index} className="mb-2">
            {result.type === 'status' && (
              <p className="text-gray-600">{result.message}</p>
            )}
            {result.type === 'queries' && (
              <div className="bg-gray-100 p-2 rounded">
                <h3>Generated Queries:</h3>
                <ul>
                  {result.data.map((query: string, i: number) => (
                    <li key={i}>{query}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.type === 'summary' && (
              <div className="prose" dangerouslySetInnerHTML={{ __html: result.data }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 