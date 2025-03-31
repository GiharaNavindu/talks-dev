const { createTestUsers } = require('./utils/test-db');
const { connectWebSocket, waitForMessage, closeWebSocket } = require('./utils/ws-client');
const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');

// Import app (adjust the path as needed)
let app;
let server;
let testData;

describe('WebSocket Functionality', () => {
  let wsClient1;
  let wsClient2;
  
  beforeAll(async () => {
    // Import app only after setup.js has run
    process.env.PORT = '4044';
    app = require('../index');
    server = app.listen(4041); // Use a different port for testing
  });
  
  afterAll(() => {
    server.close();
  });
  
  beforeEach(async () => {
    testData = await createTestUsers();
    
    // Connect WebSocket clients
    wsClient1 = await connectWebSocket(testData.tokens.user1, 4041);
    wsClient2 = await connectWebSocket(testData.tokens.user2, 4041);
    
    // Wait longer to ensure connections are fully established
    await new Promise(resolve => setTimeout(resolve, 300));
  });
  
  afterEach(() => {
    closeWebSocket(wsClient1);
    closeWebSocket(wsClient2);
  });
  
  test('WebSocket should receive online users notification', async () => {
    const message = await waitForMessage(wsClient1, msg => msg.online);
    
    expect(Array.isArray(message.online)).toBe(true);
    expect(message.online.length).toBe(2); // Both test users are online
    
    const onlineUsernames = message.online.map(u => u.username);
    expect(onlineUsernames).toContain('testuser1');
    expect(onlineUsernames).toContain('testuser2');
  });
  
  test('WebSocket should deliver text messages between users', async () => {
    // Set up message listener for second client
    const messagePromise = waitForMessage(wsClient2, msg => msg.text && !msg.online);
    
    // Send message from first client to second client
    wsClient1.send(JSON.stringify({
      recipient: testData.users[1]._id.toString(),
      text: 'Hello from user 1 to user 2 via WebSocket'
    }));
    
    // Wait for the message to be delivered
    const message = await messagePromise;
    
    expect(message.text).toBe('Hello from user 1 to user 2 via WebSocket');
    expect(message.sender).toBe(testData.users[0]._id.toString());
    expect(message.recipient).toBe(testData.users[1]._id.toString());
    
    // Verify message was saved to database
    const savedMessage = await Message.findOne({ text: 'Hello from user 1 to user 2 via WebSocket' });
    expect(savedMessage).toBeTruthy();
    expect(savedMessage.sender.toString()).toBe(testData.users[0]._id.toString());
    expect(savedMessage.recipient.toString()).toBe(testData.users[1]._id.toString());
  });
  
  test('WebSocket should handle file uploads', async () => {
    // Create a small base64 encoded test file
    const testFile = {
      name: 'test.txt',
      data: 'data:text/plain;base64,' + Buffer.from('Hello world').toString('base64')
    };
    
    // Set up message listener for second client
    const messagePromise = waitForMessage(wsClient2, msg => msg.file && !msg.online);
    
    // Send file from first client to second client
    wsClient1.send(JSON.stringify({
      recipient: testData.users[1]._id.toString(),
      file: testFile
    }));
    
    // Wait for the message to be delivered
    const message = await messagePromise;
    
    expect(message.file).toBeTruthy();
    expect(message.sender).toBe(testData.users[0]._id.toString());
    expect(message.recipient).toBe(testData.users[1]._id.toString());
    
    // Check if file exists in uploads folder
    const uploadsPath = path.join(__dirname, '../uploads');
    const filesInUpload = fs.readdirSync(uploadsPath);
    expect(filesInUpload).toContain(message.file);
    
    // Clean up the file
    fs.unlinkSync(path.join(uploadsPath, message.file));
    
    // Verify message was saved to database
    const savedMessage = await Message.findOne({ file: message.file });
    expect(savedMessage).toBeTruthy();
    expect(savedMessage.sender.toString()).toBe(testData.users[0]._id.toString());
    expect(savedMessage.recipient.toString()).toBe(testData.users[1]._id.toString());
  });
  
  test('WebSocket should handle disconnection and update online users', async () => {
    // Wait for initial online users notification
    await waitForMessage(wsClient1, msg => msg.online);
    
    // Close one client
    closeWebSocket(wsClient2);
    
    // Wait for updated online users notification
    const message = await waitForMessage(wsClient1, msg => {
      // Check if the online list length has changed
      return msg.online && msg.online.length === 1;
    });
    
    expect(Array.isArray(message.online)).toBe(true);
    expect(message.online.length).toBe(1); // Only one user should be online now
    expect(message.online[0].username).toBe('testuser1');
  });
});