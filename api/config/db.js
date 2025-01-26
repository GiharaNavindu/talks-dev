import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = () => {
  mongoose.connect(process.env.MONGO_URL, (err) => {
    if (err) throw err;
    console.log("Connected to the database successfully!");
  });
};
