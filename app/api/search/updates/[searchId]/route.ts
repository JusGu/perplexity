import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Search } from '@prisma/client';

interface SearchCallbacks {
  onStatus: (message: string) => void;
  onSearchResult: (data: any) => void;
  onSummary: (content: string) => void;
  onComplete: () => void;
}

async function processSearch(search: Search, callbacks: SearchCallbacks) {
  // Your search processing logic here
  // This is a placeholder - you'll need to implement the actual search processing
  callbacks.onStatus('Starting search...');
  // ... rest of the implementation
}

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
        });

        if (!search) {
          controller.close();
          return;
        }

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