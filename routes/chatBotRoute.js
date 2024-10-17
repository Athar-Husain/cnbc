// routes/chatRoutes.js
import express from "express";
const router = express.Router();
import { handleChat } from "../controllers/chatController.js";

router.post("/azureai", handleChat);

export default router;
