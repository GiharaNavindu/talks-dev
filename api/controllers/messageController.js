import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      sender: { $in: [userId] },
      recipient: { $in: [userId] },
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(401).json("Unauthorized");
  }
};

export const sendMessage = async (req, res) => {
  const { recipient, text, file } = req.body;
  try {
    const message = new Message({
      sender: req.userId,
      recipient,
      text,
      file: file || null,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json("Error sending message");
  }
};
