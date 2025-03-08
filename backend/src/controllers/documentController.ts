import { Request, Response } from "express";
import fs from "fs";
import Document from "../models/documentModel";

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, path, size } = req.file;

    const document = await Document.create({
      user: req.user?._id,
      name: req.body.name || originalname,
      filename: originalname,
      contentType: mimetype,
      path,
      size,
    });

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await Document.find({ user: req.user?._id }).sort({
      createdAt: -1,
    });

    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from storage
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Delete document from database
    await document.deleteOne();

    res.json({ message: "Document removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
