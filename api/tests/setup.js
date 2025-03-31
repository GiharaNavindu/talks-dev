const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

let mongoServer;

// Setup function
beforeAll(async () => {
  // Set up MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
    mongoose.set('strictQuery', false);

  // Mock environment variables
  process.env.MONGO_URL = mongoUri;
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  
  // Create uploads directory if it doesn't exist
  const uploadsPath = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
  }
});

// Cleanup function
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  
  // Clean up uploads folder
  const uploadsPath = path.join(__dirname, '../uploads');
  if (fs.existsSync(uploadsPath)) {
    const files = fs.readdirSync(uploadsPath);
    files.forEach(file => {
      fs.unlinkSync(path.join(uploadsPath, file));
    });
  }
});