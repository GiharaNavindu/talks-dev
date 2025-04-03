const User = require('../../models/User');
const Message = require('../../models/Message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create test users and return their data
const createTestUsers = async () => {
  // Clear existing users
  await User.deleteMany({});
  
  const user1 = await User.create({
    username: 'testuser1',
    password: bcrypt.hashSync('password1', 10)
  });
  
  const user2 = await User.create({
    username: 'testuser2',
    password: bcrypt.hashSync('password2', 10)
  });
  
  return {
    users: [user1, user2],
    tokens: {
      user1: jwt.sign({ userId: user1._id, username: user1.username }, process.env.JWT_SECRET),
      user2: jwt.sign({ userId: user2._id, username: user2.username }, process.env.JWT_SECRET)
    }
  };
};

// Create test messages between users
const createTestMessages = async (users) => {
  // Clear existing messages
  await Message.deleteMany({});
  
  const messages = [
    {
      sender: users[0]._id,
      recipient: users[1]._id,
      text: 'Hello from user 1 to user 2',
      createdAt: new Date(Date.now() - 60000) // 1 minute ago
    },
    {
      sender: users[1]._id,
      recipient: users[0]._id,
      text: 'Hello back from user 2 to user 1',
      createdAt: new Date()
    }
  ];
  
  return await Message.insertMany(messages);
};

// Clean up database
const cleanupDatabase = async () => {
  await User.deleteMany({});
  await Message.deleteMany({});
};

module.exports = {
  createTestUsers,
  createTestMessages,
  cleanupDatabase
};