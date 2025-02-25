import express from "express";
import cookieParser from "cookie-parser";
import cors from "./config/cors.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { setupWebSocket } from "./websocket/websocket.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());
app.use(cors);

// Database connection
connectDB();

// Routes
app.use(authRoutes);
app.use(messageRoutes);

// Server setup
const server = app.listen(process.env.PORT || 4040, () => {
  console.log(`Server is running on port ${process.env.PORT || 4040}`);
});

// WebSocket setup
setupWebSocket(server);