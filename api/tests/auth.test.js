const request = require('supertest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Import app (adjust the path as needed)
let app;

describe('Authentication Endpoints', () => {
  beforeAll(() => {
    // Import app only after setup.js has run
    process.env.PORT = '4046';
    app = require('../index');
  });
  
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  test('POST /register should create a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'newuser',
        password: 'newpassword'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.headers['set-cookie']).toBeDefined();
    
    // Check if user was created in database
    const user = await User.findOne({ username: 'newuser' });
    expect(user).toBeTruthy();
    
    // Check if password was properly hashed
    const isPasswordValid = bcrypt.compareSync('newpassword', user.password);
    expect(isPasswordValid).toBe(true);
  });
  
  test('POST /register should fail with duplicate username', async () => {
    // Create a user first
    await User.create({
      username: 'existinguser',
      password: bcrypt.hashSync('password', 10)
    });
    
    // Try to create another user with the same username
    const response = await request(app)
      .post('/register')
      .send({
        username: 'existinguser',
        password: 'newpassword'
      });
    
    expect(response.statusCode).toBe(500);
  });
  
  test('POST /login should authenticate a user', async () => {
    // Create a user first
    await User.create({
      username: 'loginuser',
      password: bcrypt.hashSync('correctpassword', 10)
    });
    
    const response = await request(app)
      .post('/login')
      .send({
        username: 'loginuser',
        password: 'correctpassword'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('token=');
  });
  
  test('POST /login should reject invalid credentials', async () => {
    // Create a user first
    await User.create({
      username: 'loginuser',
      password: bcrypt.hashSync('correctpassword', 10)
    });
    
    const response = await request(app)
      .post('/login')
      .send({
        username: 'loginuser',
        password: 'wrongpassword'
      });
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toBe('Invalid password');
  });
  
  test('POST /login should reject non-existent user', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'nonexistentuser',
        password: 'anypassword'
      });
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('User not found');
  });
  
  test('POST /logout should clear the token cookie', async () => {
    const response = await request(app)
      .post('/logout');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('ok');
    
    const cookies = response.headers['set-cookie'][0];
    expect(cookies).toContain('token=;');
  });
});