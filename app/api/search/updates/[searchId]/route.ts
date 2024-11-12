import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processSearch } from '@/lib/processors/search';

export async function GET(
  request: NextRequest,
  { params }: { params: { searchId: string } }
) {
  const searchId = params.searchId;
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        // Validate searchId
        if (!searchId) {
          throw new Error('Search ID is required');
        }

        // Get the search
        const search = await prisma.search.findUnique({
          where: { id: searchId },
          include: { queries: true }
        });

        if (!search) {
          const error = { type: 'error', message: 'Search not found' };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(error)}\n\n`));
          controller.close();
          return;
        }

        // Send initial status
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Starting search...' })}\n\n`)
        );

        // Process search with error handling
        await processSearch(search, {
          onStatus: (message) => {
            const update = { type: 'status', message };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          },
          onSearchResult: (data) => {
            const update = { type: 'searchResult', data };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          },
          onSummary: (content) => {
            const update = { type: 'summary', content };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          },
          onComplete: () => {
            const update = { type: 'complete' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
            controller.close();
          }
        });
      } catch (error) {
        console.error('Error in SSE stream:', error);
        const errorUpdate = { 
          type: 'error', 
          message: error instanceof Error ? error.message : 'Error processing search'
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorUpdate)}\n\n`));
        controller.close();
      }
    },

    cancel() {
      console.log('Client closed the connection');
    }
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 