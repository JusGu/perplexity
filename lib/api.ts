import { prisma } from './prisma';

// Only use this function in server components or API routes
export async function getSearch(searchId: string) {
  try {
    const search = await prisma.search.findUnique({
      where: { id: searchId },
      include: {
        queries: true
      }
    });
    
    return search;
  } catch (error) {
    console.error('Error fetching search:', error);
    return null;
  }
}