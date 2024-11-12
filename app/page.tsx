import { prisma } from "@/lib/prisma";
import SearchSidebar from "@/components/SearchSidebar";
import SearchForm from "@/components/SearchForm";

async function getSearches() {
  const searches = await prisma.search.findMany({
    include: {
      queries: {
        select: {
          searchString: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return searches;
}

export default async function Home() {
  const searches = await getSearches();

  return (
    <>
      <SearchSidebar searches={searches} />
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">What do you want to know?</h1>
        <SearchForm />
      </main>
    </>
  );
}
