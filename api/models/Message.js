import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: String,
  file: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);