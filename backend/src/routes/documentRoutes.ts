import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from "../controllers/documentController";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// @route   POST /api/documents
// @desc    Upload a new document
// @access  Private
router.post("/", protect, upload.single("file"), async (req, res, next) => {
  try {
    await uploadDocument(req, res);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/documents
// @desc    Get all user documents
// @access  Private
router.get("/", protect, getDocuments);

// @route   GET /api/documents/:id
// @desc    Get document by ID
// @access  Private
router.get("/:id", protect, getDocumentById);

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete("/:id", protect, async (req, res, next) => {
  try {
    await deleteDocument(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
