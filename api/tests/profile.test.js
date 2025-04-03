const request = require('supertest');
const { createTestUsers } = require('./utils/test-db');

// Import app (adjust the path as needed)
let app;
let testData;

describe('User Profile Endpoints', () => {
  beforeAll(async () => {
    // Import app only after setup.js has run
    process.env.PORT = '4043';
    app = require('../index');
    testData = await createTestUsers();
  });
  
  test('GET /profile should return user data with valid token', async () => {
    const response = await request(app)
      .get('/profile')
      .set('Cookie', [`token=${testData.tokens.user1}`]);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('username', 'testuser1');
  });
  
  test('GET /profile should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/profile')
      .set('Cookie', [`token=invalid-token`]);
    
    expect(response.statusCode).toBe(401);
  });
  
  test('GET /profile should return 401 without token', async () => {
    const response = await request(app)
      .get('/profile');
    
    expect(response.statusCode).toBe(401);
  });
  
  test('GET /people should return list of users', async () => {
    const response = await request(app)
      .get('/people')
      .set('Cookie', [`token=${testData.tokens.user1}`]);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('username');
    expect(response.body[0]).toHaveProperty('_id');
    
    // Check if both test users are in the response
    const usernames = response.body.map(user => user.username);
    expect(usernames).toContain('testuser1');
    expect(usernames).toContain('testuser2');
  });
  
  test('GET /test endpoint should respond with test ok', async () => {
    const response = await request(app)
      .get('/test');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('test ok');
  });
});