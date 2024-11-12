import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processSearch } from '@/lib/processors/search';

export async function GET(
  request: NextRequest,
  { params }: { params: { searchId: string } }
) {
  const searchId = params.searchId;

  // Set up SSE headers
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        // Get the search
        const search = await prisma.search.findUnique({
          where: { id: searchId },
          include: { queries: true }
        });

        if (!search) {
          controller.close();
          return;
        }

        // Send initial status
        const initialUpdate = { type: 'status', message: 'Starting search...' };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialUpdate)}\n\n`));

        // Process search and stream updates
        await processSearch(search, {
          onStatus: (message: string) => {
            const update = { type: 'status', message };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          },
          onSearchResult: (data: any) => {
            const update = { type: 'searchResult', data };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          },
          onSummary: (content: string) => {
            const update = { type: 'summary', content };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          },
          onComplete: () => {
            const update = { type: 'complete' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
            controller.close();
          },
        });
      } catch (error) {
        console.error('Error in SSE stream:', error);
        const errorUpdate = { type: 'status', message: 'Error processing search' };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorUpdate)}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 