import { prisma } from '@/lib/prisma';
import SearchSidebar from '@/components/SearchSidebar';
import { SearchWithQueries } from '@/types/search';

async function getSearches(): Promise<SearchWithQueries[]> {
  const searches = await prisma.search.findMany({
    include: {
      queries: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
  return searches;
}

export default async function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searches = await getSearches();

  return (
    <div className="flex min-h-screen">
      <SearchSidebar searches={searches} />
      <main className="flex-1 bg-black">
        {children}
      </main>
    </div>
  );
} 