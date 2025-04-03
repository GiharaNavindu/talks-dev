const WebSocket = require('ws');

/**
 * Create and connect a WebSocket client with authentication
 * @param {String} token JWT token for authentication
 * @param {Number} port Server port to connect to
 * @returns {Promise<WebSocket>} Connected WebSocket client
 */
const connectWebSocket = (token, port = 4040) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`, {
      headers: { 'Cookie': `token=${token}` }
    });
    
    ws.on('open', () => {
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      reject(error);
    });
    
    // Add timeout to avoid hanging test
    setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, 5000);
  });
};

/**
 * Wait for a specific message from WebSocket
 * @param {WebSocket} ws WebSocket client
 * @param {Function} filterFn Function to filter desired message
 * @returns {Promise<Object>} The received message
 */
const waitForMessage = (ws, filterFn) => {
  return new Promise((resolve, reject) => {
    const messageHandler = (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (filterFn(message)) {
          ws.removeListener('message', messageHandler);
          resolve(message);
        }
      } catch (e) {
        reject(e);
      }
    };
    
    ws.on('message', messageHandler);
    
    // Add timeout to avoid hanging test
    setTimeout(() => {
      ws.removeListener('message', messageHandler);
      reject(new Error('Timeout waiting for WebSocket message'));
    }, 5000);
  });
};

/**
 * Close WebSocket client if it's open
 * @param {WebSocket} ws WebSocket client
 */
const closeWebSocket = (ws) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
};

module.exports = {
  connectWebSocket,
  waitForMessage,
  closeWebSocket
};