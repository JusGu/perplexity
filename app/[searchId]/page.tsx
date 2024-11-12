import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage({ params }: { params: { searchId: string } }) {
  return (
    <div className="p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SearchContent searchId={params.searchId} />
      </Suspense>
    </div>
  );
} 