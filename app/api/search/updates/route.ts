import { NextRequest } from 'next/server';
import { searchUpdatesStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  const searchId = request.nextUrl.searchParams.get('searchId');
  if (!searchId) {
    return new Response('Search ID required', { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Subscribe to updates for this search
  searchUpdatesStore.subscribe(searchId, async (update) => {
    try {
      const data = JSON.stringify(update) + '\n';
      await writer.write(encoder.encode(data));
    } catch (error) {
      console.error('Error writing to stream:', error);
    }
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 