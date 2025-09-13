// SSE connections
let clients = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Add client to list
    clients.push(res);

    // Remove client on disconnect
    req.on('close', () => {
      clients = clients.filter(client => client !== res);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'keepalive' })}\n\n`);
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Export broadcast function for use in other routes
export function broadcast(eventType, data) {
  clients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify({ type: eventType, ...data })}\n\n`);
    } catch (error) {
      // Client might be disconnected, remove from list
      clients = clients.filter(c => c !== client);
    }
  });
}
