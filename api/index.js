const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const ws = require('ws');
const fs = require('fs/promises');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    // Only keep essential startup logs
    console.log('Connected to MongoDB database');
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

mongoose.set('strictQuery', true);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

// Initialize Express app
const app = express();
module.exports = app;

// Middleware setup
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173','http://44.204.27.188','http://44.204.27.188/5173'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

/**
 * Extract and verify user data from JWT token in request
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} User data from token
 */
async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (!token) return reject('No authentication token');
    
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) return reject('Invalid token');
      resolve(userData);
    });
  });
}

// Routes
app.get('/test', (req, res) => {
  res.json('test ok');
});

app.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(401).json('Unauthorized');
  }
});

app.get('/people', async (req, res) => {
  try {
    const users = await User.find({}, { '_id': 1, username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json('Failed to fetch users');
  }
});

app.get('/profile', async (req, res) => {
  try {
    const userData = await getUserDataFromRequest(req);
    res.json(userData);
  } catch (error) {
    res.status(401).json('Unauthorized');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(404).json('User not found');
    }

    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (!passOk) {
      return res.status(401).json('Invalid password');
    }

    jwt.sign({ 
      userId: foundUser._id, 
      username 
    }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { 
        sameSite: 'none', 
        secure: true,
        httpOnly: true // Add httpOnly for better security
      }).json({
        id: foundUser._id,
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json('Server error during login');
  }
});

app.post('/logout', (req, res) => {
  res.cookie('token', '', { 
    sameSite: 'none', 
    secure: true,
    httpOnly: true,
    expires: new Date(0) 
  }).json('ok');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json('Invalid username or password');
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json('Username already taken');
    }
    
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username,
      password: hashedPassword,
    });
    
    jwt.sign({ 
      userId: createdUser._id, 
      username 
    }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { 
        sameSite: 'none', 
        secure: true,
        httpOnly: true
      }).status(201).json({
        id: createdUser._id,
      });
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json('Error creating user');
  }
});

// Start server

const PORT = process.env.PORT || 4040;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

// Ensure uploads directory exists
(async function createUploadsDir() {
  try {
    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
})();

// WebSocket setup
const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
  /**
   * Notify all clients about currently online users
   */
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients]
          .filter(c => c.userId && c.username) // Make sure we have valid user data
          .map(c => ({ userId: c.userId, username: c.username })),
      }));
    });
  }

  // WebSocket keepalive with ping/pong mechanism
  connection.isAlive = true;
  
  connection.timer = setInterval(() => {
    if (!connection.isAlive) {
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      return;
    }
    
    connection.isAlive = false;
    connection.ping();
  }, 30000); // 30-second ping interval

  connection.on('pong', () => {
    connection.isAlive = true;
  });

  // Authenticate WebSocket connection using JWT from cookies
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.trim().startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) {
            console.error("WebSocket authentication failed:", err);
            return;
          }
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
          notifyAboutOnlinePeople();
        });
      }
    }
  }

  // Handle incoming messages
  connection.on('message', async (message) => {
    try {
      const messageData = JSON.parse(message.toString());
      const { recipient, text, file } = messageData;
      let filename = null;
      
      // Process file uploads
      if (file) {
        try {
          const parts = file.name.split('.');
          const ext = parts[parts.length - 1];
          filename = Date.now() + '.' + ext;
          const filePath = path.join(__dirname, 'uploads', filename);
          
          // Extract and save the file
          const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
          await fs.writeFile(filePath, bufferData);
        } catch (e) {
          console.error('File upload error:', e);
          filename = null;
        }
      }
      
      // Validate message has recipient and content
      if (!recipient || (!text && !filename)) {
        return;
      }
      
      // Save message to database
      try {
        const messageDoc = await Message.create({
          sender: connection.userId,
          recipient,
          text,
          file: filename,
        });
        
        // Forward message to recipient if online
        [...wss.clients]
          .filter(c => c.userId === recipient)
          .forEach(c => c.send(JSON.stringify({
            _id: messageDoc._id,
            sender: connection.userId,
            recipient,
            text,
            file: filename,
            createdAt: messageDoc.createdAt,
          })));
      } catch (err) {
        console.error('Message creation error:', err);
        connection.send(JSON.stringify({
          error: 'Failed to save message'
        }));
      }
    } catch (e) {
      console.error('Message processing error:', e);
    }
  });
  
  // Handle connection close
  connection.on('close', () => {
    clearInterval(connection.timer);
    notifyAboutOnlinePeople();
  });
  
  // Send initial online users list
  notifyAboutOnlinePeople();
});
