import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const jwtSecret = process.env.JWT_SECRET;

export function setupWebSocket(server) {
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
          const path = join(__dirname, "../uploads", filename);
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

  return wss;
}