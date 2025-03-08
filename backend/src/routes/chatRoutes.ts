import express from "express";
import {
  createChat,
  getChats,
  getChatById,
  sendMessage,
  getMessagesByChatId,
  uploadChatDocument,
  generateChatReport,
} from "../controllers/chatController";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// @route   POST /api/chats
// @desc    Create a new chat
// @access  Private
router.post("/", protect, createChat);

// @route   GET /api/chats
// @desc    Get all user chats
// @access  Private
router.get("/", protect, getChats);

// @route   GET /api/chats/:id
// @desc    Get chat by ID
// @access  Private
router.get("/:id", protect, getChatById);

// @route   POST /api/chats/:id/messages
// @desc    Send a message in a chat
// @access  Private
router.post("/:id/messages", protect, async (req, res, next) => {
  try {
    await sendMessage(req, res);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chats/:id/messages
// @desc    Get all messages in a chat
// @access  Private
router.get("/:id/messages", protect, getMessagesByChatId);

// @route   POST /api/chats/:id/upload
// @desc    Upload a document to a chat
// @access  Private
router.post(
  "/:id/upload",
  protect,
  upload.single("file"),
  async (req, res, next) => {
    try {
      await uploadChatDocument(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/chats/:id/report
// @desc    Generate a report from a chat
// @access  Private
router.post("/:id/report", protect, async (req, res, next) => {
  try {
    await generateChatReport(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
