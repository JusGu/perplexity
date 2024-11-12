import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processSearch } from '@/lib/processors/search';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Create search record
    const search = await prisma.search.create({
      data: {
        query,
        refinedQueries: JSON.stringify([
          `History of ${query}`,
          `Key factors in ${query}`,
          `Analysis of ${query}`
        ])
      }
    });

    return Response.json({ searchId: search.id });
  } catch (error) {
    console.error('Search API: Error handling request:', error);
    return Response.json(
      { error: 'Failed to process search' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchId = request.nextUrl.searchParams.get('searchId');
    if (!searchId) {
      return Response.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    const search = await prisma.search.findUnique({
      where: { id: searchId },
      include: { queries: true }
    });

    if (!search) {
      return Response.json(
        { error: 'Search not found' },
        { status: 404 }
      );
    }

    return Response.json(search);
  } catch (error) {
    console.error('Search API: Error fetching search:', error);
    return Response.json(
      { error: 'Failed to fetch search' },
      { status: 500 }
    );
  }
} 