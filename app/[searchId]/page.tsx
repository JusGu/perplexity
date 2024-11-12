import { getSearch } from '@/lib/api';
import { Suspense } from 'react';

// Add loading component
function LoadingState() {
  return <div>Loading search results...</div>;
}

// Separate search content component
async function SearchContent({ searchId }: { searchId: string }) {
  const search = await getSearch(searchId);
  
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
    </div>
  );
}

// Main page component
export default function SearchPage({
  params,
}: {
  params: { searchId: string };
}) {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<LoadingState />}>
        <SearchContent searchId={params.searchId} />
      </Suspense>
    </div>
  );
} 