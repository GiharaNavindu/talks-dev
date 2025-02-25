import express from "express";
import { getMessages, getPeople } from "../controllers/messageController.js";

const router = express.Router();

router.get("/messages/:userId", getMessages);
router.get("/people", getPeople);

export default router;