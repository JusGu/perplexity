import { SearchProcessor } from '@/lib/processors/search';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { searchString } = await req.json();
    console.log('Search API: Received request for:', searchString);

    // Create response stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Process search in background
    const processor = new SearchProcessor();
    
    (async () => {
      try {
        for await (const update of processor.processSearch(searchString)) {
          console.log('Search API: Streaming update:', update);
          const data = JSON.stringify(update) + '\n';
          await writer.write(encoder.encode(data));
        }
      } catch (error: any) {
        console.error('Search API: Error during processing:', error);
        const errorMessage = JSON.stringify({ 
          type: 'error', 
          message: error?.message || 'An error occurred'
        }) + '\n';
        await writer.write(encoder.encode(errorMessage));
      } finally {
        console.log('Search API: Closing stream');
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Search API: Error handling request:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'An error occurred' }), 
      { status: 500 }
    );
  }
} 