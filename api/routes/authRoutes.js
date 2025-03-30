import express from "express";
import { 
  test,
  profile,
  login,
  logout,
  register
} from "../controllers/authController.js";

const router = express.Router();

router.get("/test", test);
router.get("/profile", profile);
router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);

export default router;