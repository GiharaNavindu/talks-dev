import express from "express";
import { connectDB } from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import peopleRoutes from "./routes/peopleRoutes.js";
import { authenticateJWT } from "./middlewares/authMiddleware.js";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

connectDB();

app.use("/auth", authRoutes);
app.use("/messages", authenticateJWT, messageRoutes);
app.use("/people", authenticateJWT, peopleRoutes);

const server = app.listen(4040, () => {
  console.log("Server running on port 4040");
});

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");
  ws.on("message", (message) => {
    console.log("Received:", message);
    ws.send("Message received");
  });
});
