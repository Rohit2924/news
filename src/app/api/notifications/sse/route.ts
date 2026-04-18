import { NextResponse } from 'next/server';

// export const runtime = 'no';

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Server-Sent Events for real-time notifications
 */

/**
 * @swagger
 * /api/notifications/stream:
 *   get:
 *     summary: Connect to the notifications SSE stream
 *     description: >
 *       Opens a Server-Sent Events (SSE) connection to receive real-time notifications from the server.
 *       The server will periodically send 'ping' events to keep the connection alive.
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: SSE stream established successfully
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: |
 *                 The server will continuously send events in the following format:
 *                 ```text
 *                 data: {"type":"connection","message":"Connected to notifications stream"}

 *                 data: {"type":"ping","timestamp":"2025-11-16T12:00:00.000Z"}
 *                 ```
 *       500:
 *         description: Failed to establish SSE connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 *     notes: |
 *       - The client should handle `abort` or connection close events.
 *       - Pings are sent every 30 seconds to keep the connection alive.
 *       - Initial 'connection' event is sent immediately after connecting.
 */


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