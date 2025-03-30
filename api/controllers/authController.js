import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

export const test = (req, res) => res.json("test ok");

export const profile = (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json("No token provided");
  
  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) return res.status(401).json("Invalid token");
    res.json(userData);
  });
};

export const login = async (req, res) => {
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
};

export const logout = (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
};

export const register = async (req, res) => {
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
};