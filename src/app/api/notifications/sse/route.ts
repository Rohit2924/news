import { NextResponse } from 'next/server';

export const runtime = 'edge';

// The GET function MUST accept the 'request' parameter to detect disconnections
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  try {
    const stream = new ReadableStream({
      start(controller) {
        // FIX 1: Add error handling to the sendEvent function
        function sendEvent(data: any) {
          try {
            const json = JSON.stringify(data);
            controller.enqueue(encoder.encode(`data: ${json}\n\n`));
          } catch (error) {
            // If the controller is already closed, log it and stop trying to send more data.
            if (error instanceof Error && error.message.includes('Controller is already closed')) {
              console.log('SSE connection closed by client. Stopping pings.');
              // We need access to the interval to clear it, so we'll define it outside.
              clearInterval(keepAlive);
            } else {
              console.error('Error sending SSE event:', error);
            }
          }
        }

        // Send initial connection message
        sendEvent({ type: 'connection', message: 'Connected to notifications stream' });

        // Keep connection alive with periodic messages
        const keepAlive = setInterval(() => {
          sendEvent({ type: 'ping', timestamp: new Date().toISOString() });
        }, 30000); // Send ping every 30 seconds

        // FIX 2: Properly detect when the client disconnects
        // This is the most important part. The 'abort' event fires when the client closes the connection.
        request.signal.addEventListener('abort', () => {
          console.log('SSE connection aborted by client. Cleaning up...');
          clearInterval(keepAlive); // Stop the interval
          controller.close();      // Close the controller
        });

        // NOTE: The `return () => { ... }` cleanup function is NOT the right place for this.
        // It is not reliably triggered on client disconnect.
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}