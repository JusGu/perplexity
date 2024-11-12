import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getSearch(searchId: string) {
  const search = await prisma.search.findUnique({
    where: { id: searchId },
    include: {
      queries: true,
    },
  });

  if (!search) notFound();
  return search;
}

export default async function SearchPage({
  params,
}: {
  params: { searchId: string };
}) {
  const search = await getSearch(params.searchId);
  const initialQuery = search.queries[0];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{initialQuery.searchString}</h1>
    </div>
  );
} 