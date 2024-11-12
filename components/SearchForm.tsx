'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingData, setStreamingData] = useState<any[]>([]);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchString = formData.get('search') as string;

    setIsLoading(true);
    setStreamingData([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchString }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let redirected = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Parse the chunks
        const chunk = new TextDecoder().decode(value);
        console.log('Received chunk:', chunk);

        const updates = chunk
          .split('\n')
          .filter(Boolean)
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              console.error('Failed to parse line:', line, e);
              return null;
            }
          })
          .filter(Boolean);

        console.log('Processed updates:', updates);

        // Handle updates
        for (const update of updates) {
          setStreamingData(prev => [...prev, update]);
          
          if (update.type === 'searchId' && !redirected) {
            redirected = true;
            router.push(`/${update.data}`);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setStreamingData(prev => [...prev, { type: 'error', message: error.message }]);
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

      {/* Debug output */}
      <div className="mt-4 text-sm text-gray-500">
        {streamingData.map((data, index) => (
          <div key={index} className="mb-1">
            {JSON.stringify(data)}
          </div>
        ))}
      </div>
    </div>
  );
} 