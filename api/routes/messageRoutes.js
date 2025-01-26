import express from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/messages/:userId", getMessages);
router.post("/message", sendMessage);

export default router;
