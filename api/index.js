import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Message from "./models/Message.js";
import { WebSocketServer } from "ws";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();
mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) throw err;
  console.log("Connected to the database successfully!");
});

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) reject(err);
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

// Routes
app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const messages = await Message.find({
      $or: [
        { sender: userData.userId, recipient: userId },
        { sender: userId, recipient: userData.userId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(401).json("Unauthorized");
  }
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) return res.status(401).json("Invalid token");
      res.json(userData);
    });
  } else {
    res.status(401).json("No token provided");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ username });
    if (!foundUser) return res.status(404).json("User not found");
    
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (!passOk) return res.status(401).json("Invalid password");

    jwt.sign(
      { userId: foundUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, { sameSite: "none", secure: true }).json({
          id: foundUser._id,
        });
      }
    );
  } catch (err) {
    res.status(500).json("Internal server error");
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username,
      password: hashedPassword,
    });
    
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({ id: createdUser._id });
      }
    );
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json("Username already exists");
    }
    res.status(500).json("Error creating user");
  }
});

const server = app.listen(4040, () => {
  console.log("Server is running on port 4040");
});

// WebSocket Server
const wss = new WebSocketServer({ server });

function notifyAboutOnlinePeople() {
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
}

wss.on("connection", (connection, req) => {
  connection.isAlive = true;

  // Heartbeat mechanism
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => clearTimeout(connection.deathTimer));

  // Authentication
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("token="));
      
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) {
          console.error("Invalid WebSocket token");
          connection.close();
          return;
        }
        connection.userId = userData.userId;
        connection.username = userData.username;
        notifyAboutOnlinePeople();
      });
    } else {
      connection.close();
    }
  } else {
    connection.close();
  }

  // Message handling
  connection.on("message", async (message) => {
    if (!connection.userId) return;
    
    try {
      const messageData = JSON.parse(message.toString());
      const { recipient, text, file } = messageData;
      
      if (!recipient || (!text && !file)) return;

      let filename = null;
      if (file) {
        const parts = file.name.split(".");
        const ext = parts[parts.length - 1];
        filename = Date.now() + "." + ext;
        const path = __dirname + "/uploads/" + filename;
        const bufferData = Buffer.from(file.data.split(",")[1], "base64");
        fs.writeFileSync(path, bufferData);
      }

      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });

      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
          _id: messageDoc._id,
          sender: connection.userId,
          recipient,
          text,
          file: file ? filename : null,
          createdAt: messageDoc.createdAt,
        })));
    } catch (err) {
      console.error("Message handling error:", err);
    }
  });

  // Cleanup on close
  connection.on("close", () => {
    clearInterval(connection.timer);
    notifyAboutOnlinePeople();
  });
});