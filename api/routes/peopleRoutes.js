import express from "express";
import { getPeople, getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/people", getPeople);
router.get("/profile", getProfile);

export default router;
