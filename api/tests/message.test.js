const request = require('supertest');
const { createTestUsers, createTestMessages } = require('./utils/test-db');

// Import app (adjust the path as needed)
let app;
let testData;
let testMessages;

describe('Messages Endpoints', () => {
  beforeAll(async () => {
    // Import app only after setup.js has run
    process.env.PORT = '4045';
    app = require('../index');
  });
  
  beforeEach(async () => {
    testData = await createTestUsers();
    testMessages = await createTestMessages(testData.users);
  });
  
  test('GET /messages/:userId should return conversation with specific user', async () => {
    const response = await request(app)
      .get(`/messages/${testData.users[1]._id}`)
      .set('Cookie', [`token=${testData.tokens.user1}`]);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    
    // Check message properties
    expect(response.body[0]).toHaveProperty('text');
    expect(response.body[0]).toHaveProperty('sender');
    expect(response.body[0]).toHaveProperty('recipient');
    expect(response.body[0]).toHaveProperty('createdAt');
    
    // Check if messages contain the expected text
    const messageTexts = response.body.map(msg => msg.text);
    expect(messageTexts).toContain('Hello from user 1 to user 2');
    expect(messageTexts).toContain('Hello back from user 2 to user 1');
  });
  
  test('GET /messages/:userId should return messages in chronological order', async () => {
    const response = await request(app)
      .get(`/messages/${testData.users[1]._id}`)
      .set('Cookie', [`token=${testData.tokens.user1}`]);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    
    // Check if messages are sorted by createdAt in ascending order
    const firstMessageDate = new Date(response.body[0].createdAt).getTime();
    const secondMessageDate = new Date(response.body[1].createdAt).getTime();
    expect(firstMessageDate).toBeLessThan(secondMessageDate);
  });
  
  test('GET /messages/:userId should return 401 without token', async () => {
    const response = await request(app)
      .get(`/messages/${testData.users[1]._id}`);
    
    expect(response.statusCode).toBe(401);
  });
  
  test('GET /messages/:userId should return 401 with invalid token', async () => {
    const response = await request(app)
      .get(`/messages/${testData.users[1]._id}`)
      .set('Cookie', [`token=invalid-token`]);
    
    expect(response.statusCode).toBe(401);
  });
  
  test('GET /messages/:userId should return empty array when no messages exist', async () => {
    // Create new test users without messages
    const newTestData = await createTestUsers();
    
    const response = await request(app)
      .get(`/messages/${newTestData.users[1]._id}`)
      .set('Cookie', [`token=${newTestData.tokens.user1}`]);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});