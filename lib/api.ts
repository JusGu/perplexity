import { prisma } from './prisma';

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