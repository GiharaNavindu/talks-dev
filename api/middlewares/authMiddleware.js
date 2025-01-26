import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/jwt.js";

export const authenticateJWT = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json("No token provided");
  jwt.verify(token, jwtSecret, (err, userData) => {
    if (err) return res.status(403).json("Invalid token");
    req.userId = userData.userId;
    next();
  });
};
