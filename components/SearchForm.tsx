'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchForm() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = async (searchString: string) => {
    if (!searchString.trim()) return;
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchString }),
      });

      const data = await response.json();
      if (data.searchId) {
        router.push(`/${data.searchId}`);
      }
    } catch (error) {
      console.error('Error creating search:', error);
    }
  };

  return (
    <div className="w-full max-w-xl flex gap-2">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Ask me anything..."
        className="w-full p-4 rounded-lg border border-gray-300 bg-black text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(searchInput);
          }
        }}
      />
      <button
        onClick={() => handleSearch(searchInput)}
        className="px-6 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
      >
        Search
      </button>
    </div>
  );
} 