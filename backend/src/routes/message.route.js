import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessages,
} from "../controllers/message.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessages);

export default router;
