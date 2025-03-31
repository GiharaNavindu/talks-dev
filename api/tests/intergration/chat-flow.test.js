const request = require('supertest');
const { connectWebSocket, waitForMessage, closeWebSocket } = require('../utils/ws-client');
const User = require('../../models/User');
const Message = require('../../models/Message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import app (adjust the path as needed)
let app;
let server;

describe('End-to-End Chat Flow', () => {
  let user1, user2;
  let user1Token, user2Token;
  let wsClient1, wsClient2;
  
  beforeAll(async () => {
    // Import app only after setup.js has run
    app = require('../../index');
    server = app.listen(4042); // Use a different port for this test suite
  });
  
  afterAll(() => {
    server.close();
  });
  
  beforeEach(async () => {
    // Clean database
    await User.deleteMany({});
    await Message.deleteMany({});
    
    // Register two users
    const registerUser1 = await request(app)
      .post('/register')
      .send({
        username: 'chatuser1',
        password: 'password1'
      });
    
    const registerUser2 = await request(app)
      .post('/register')
      .send({
        username: 'chatuser2',
        password: 'password2'
      });
    
    // Extract tokens from cookies
    user1Token = registerUser1.headers['set-cookie'][0]
      .split(';')[0]
      .replace('token=', '');
    
    user2Token = registerUser2.headers['set-cookie'][0]
      .split(';')[0]
      .replace('token=', '');
    
    user1 = await User.findOne({ username: 'chatuser1' });
    user2 = await User.findOne({ username: 'chatuser2' });
    
    // Connect WebSocket clients
    wsClient1 = await connectWebSocket(user1Token, 4042);
    wsClient2 = await connectWebSocket(user2Token, 4042);
    
    // Wait for connection establishment
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  afterEach(() => {
    closeWebSocket(wsClient1);
    closeWebSocket(wsClient2);
  });
  
  test('Complete chat flow: register, connect, send messages, check history', async () => {
    // Step 1: Verify users can see each other in the people list
    const peopleResponse = await request(app)
      .get('/people')
      .set('Cookie', [`token=${user1Token}`]);
    
    expect(peopleResponse.statusCode).toBe(200);
    expect(peopleResponse.body.length).toBe(2);
    
    // Step 2: Send a message from user1 to user2
    const messageText = "Hello, this is a test message from user1";
    wsClient1.send(JSON.stringify({
      recipient: user2._id.toString(),
      text: messageText
    }));
    
    // Step 3: User2 should receive the message
    const receivedMessage = await waitForMessage(
      wsClient2, 
      msg => msg.text === messageText
    );
    
    expect(receivedMessage.text).toBe(messageText);
    expect(receivedMessage.sender).toBe(user1._id.toString());
    
    // Step 4: User2 sends a reply
    const replyText = "This is a reply from user2";
    wsClient2.send(JSON.stringify({
      recipient: user1._id.toString(),
      text: replyText
    }));
    
    // Step 5: User1 should receive the reply
    const receivedReply = await waitForMessage(
      wsClient1, 
      msg => msg.text === replyText
    );
    
    expect(receivedReply.text).toBe(replyText);
    expect(receivedReply.sender).toBe(user2._id.toString());
    
    // Step A: Create a small base64 encoded test file
    const testFile = {
      name: 'integration-test.txt',
      data: 'data:text/plain;base64,' + Buffer.from('Integration test file content').toString('base64')
    };
    
    // Step B: Send file from user1 to user2
    wsClient1.send(JSON.stringify({
      recipient: user2._id.toString(),
      file: testFile
    }));
    
    // Step C: User2 should receive the file
    const receivedFile = await waitForMessage(
      wsClient2,
      msg => msg.file && msg.sender === user1._id.toString()
    );
    
    expect(receivedFile.file).toBeTruthy();
    
    // Step 6: Check message history for user1
    const historyResponse = await request(app)
      .get(`/messages/${user2._id}`)
      .set('Cookie', [`token=${user1Token}`]);
    
    expect(historyResponse.statusCode).toBe(200);
    expect(historyResponse.body.length).toBe(3); // 2 text messages + 1 file
    
    // Verify the message history contains both messages and the file
    const historyTexts = historyResponse.body
      .filter(msg => msg.text)
      .map(msg => msg.text);
    
    expect(historyTexts).toContain(messageText);
    expect(historyTexts).toContain(replyText);
    
    const fileMessage = historyResponse.body.find(msg => msg.file);
    expect(fileMessage).toBeTruthy();
    
    // Step 7: User1 logs out
    const logoutResponse = await request(app)
      .post('/logout')
      .set('Cookie', [`token=${user1Token}`]);
    
    expect(logoutResponse.statusCode).toBe(200);
    
    // Step 8: After some time, user2 should see user1 offline
    // Close WebSocket connection to simulate disconnect
    closeWebSocket(wsClient1);
    
    // Wait for the ping/pong mechanism to detect disconnection
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    // User2 should receive updated online users notification
    const onlineUsersAfterLogout = await waitForMessage(
      wsClient2,
      msg => msg.online && msg.online.length === 1
    );
    
    expect(onlineUsersAfterLogout.online.length).toBe(1);
    expect(onlineUsersAfterLogout.online[0].username).toBe('chatuser2');
  });
});