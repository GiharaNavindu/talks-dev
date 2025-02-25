import Message from "../models/Message.js";
import User from "../models/User.js";
import { getUserDataFromRequest } from "../utils/auth.js";

export const getMessages = async (req, res) => {
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
};

export const getPeople = async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
};