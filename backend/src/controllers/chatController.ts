import { Request, Response } from "express";
import OpenAI from "openai";
import Chat from "../models/chatModel";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
// @ts-ignore
import pdfParse from "pdf-parse";

dotenv.config();
// Initialize OpenAI client
console.log(process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
export const createChat = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      user: req.user?._id,
      title: title || "New Conversation",
      messages: [],
    });

    res.status(201).json(chat);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user chats
// @route   GET /api/chats
// @access  Private
export const getChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find({ user: req.user?._id }).sort({
      updatedAt: -1,
    });

    res.json(chats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (chat) {
      res.json(chat);
    } else {
      res.status(404).json({ message: "Chat not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message in a chat
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Find the chat
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Add user message
    chat.messages.push({
      sender: "user",
      content,
      createdAt: new Date(),
    });

    // Convert chat messages to OpenAI format
    const systemMessage = {
      role: "system" as const,
      content:
        "You are an AI medical assistant named Dr. AI. You provide helpful medical information but always advise users to consult with real healthcare professionals for diagnosis and treatment. You are compassionate, informative, and clear in your responses. Format your responses using Markdown syntax for better readability. Use the following formatting consistently:\n\n- Use ## for main headings and ### for subheadings\n- Use **bold** for important terms and emphasis\n- Use bullet points (* item) for lists of information\n- Use numbered lists (1. Step) for procedures or sequences\n- Use `code` formatting for medical terms or measurements\n- Always include an appropriate heading structure in longer responses\n- Add a clear summary or conclusion at the end of longer responses\n\nRemember to always prioritize clarity and accuracy in medical information.",
    };

    const chatMessages = chat.messages.map((msg) => ({
      role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...chatMessages],
      max_tokens: 800,
    });

    // Add AI response
    const aiResponse =
      completion.choices[0]?.message?.content ||
      "Sorry, I could not process your request.";
    chat.messages.push({
      sender: "ai",
      content: aiResponse,
      createdAt: new Date(),
    });

    // Save the chat
    await chat.save();

    res.json(chat);
  } catch (error: any) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages in a chat
// @route   GET /api/chats/:id/messages
// @access  Private
export const getMessagesByChatId = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (chat) {
      res.json(chat.messages);
    } else {
      res.status(404).json({ message: "Chat not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a document to a chat
// @route   POST /api/chats/:id/upload
// @access  Private
export const uploadChatDocument = async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Find the chat
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get the user message content
    const userMessage = req.body.message || "Uploaded a medical document";

    // File information
    const attachmentUrl = `/uploads/${req.file.filename}`;
    const attachmentName = req.file.originalname;

    // Parse the PDF content
    let pdfContent = "";
    try {
      const filePath = path.join(__dirname, "../../uploads", req.file.filename);
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);

      // Get the full text
      const fullText = pdfData.text;

      // Calculate a reasonable chunk size to avoid token limits
      // We'll use approximately 4000 chars (about 1000 tokens)
      const maxChunkSize = 4000;

      if (fullText.length <= maxChunkSize) {
        // If the document is small enough, use the full text
        pdfContent = fullText;
      } else {
        // For larger documents, take first part, middle part, and last part to get a good overview
        const firstPart = fullText.substring(0, maxChunkSize * 0.6);
        const lastPart = fullText.substring(
          fullText.length - maxChunkSize * 0.4
        );

        pdfContent =
          firstPart +
          "\n\n[...Document content truncated due to size limitations...]\n\n" +
          lastPart;
      }

      // Add document metadata if available
      if (pdfData.info) {
        const metadata = [];
        if (pdfData.info.Title) metadata.push(`Title: ${pdfData.info.Title}`);
        if (pdfData.info.Author)
          metadata.push(`Author: ${pdfData.info.Author}`);
        if (pdfData.info.CreationDate)
          metadata.push(`Date: ${pdfData.info.CreationDate}`);

        if (metadata.length > 0) {
          pdfContent =
            `Document Metadata:\n${metadata.join(
              "\n"
            )}\n\nDocument Content:\n` + pdfContent;
        }
      }

      // Add page count info
      pdfContent += `\n\nTotal pages in document: ${pdfData.numpages}`;
    } catch (pdfError) {
      console.error("Error parsing PDF:", pdfError);
      pdfContent = "Unable to parse PDF content";
    }

    // Add user message with attachment
    chat.messages.push({
      sender: "user",
      content: userMessage,
      createdAt: new Date(),
      attachmentUrl,
      attachmentName,
    });

    // Convert chat messages to OpenAI format
    const systemMessage = {
      role: "system" as const,
      content:
        "You are an AI medical assistant named Dr. AI. You provide helpful medical information but always advise users to consult with real healthcare professionals for diagnosis and treatment. You are compassionate, informative, and clear in your responses. The user has shared a medical document with you. Use the information from this document to provide helpful insights, but acknowledge any limitations in your understanding of the document. Format your responses using Markdown syntax for better readability. Use the following formatting consistently:\n\n- Use ## for main headings and ### for subheadings\n- Use **bold** for important terms and emphasis\n- Use bullet points (* item) for lists of information\n- Use numbered lists (1. Step) for procedures or sequences\n- Use `code` formatting for medical terms or measurements\n- Always include an appropriate heading structure in longer responses\n- Add a clear summary or conclusion at the end of longer responses\n\nRemember to always prioritize clarity and accuracy in medical information.",
    };

    const chatMessages = chat.messages.map((msg, index) => {
      // If this is the last message (the one with the attachment)
      if (index === chat.messages.length - 1) {
        return {
          role: "user" as const,
          content: `${userMessage}\n\nI've uploaded a medical document titled "${attachmentName}". Here's the content of the document:\n\n${pdfContent}`,
        };
      }
      return {
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      };
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...chatMessages],
      max_tokens: 800,
    });

    // Add AI response
    const aiResponse =
      completion.choices[0]?.message?.content ||
      "I've received your document. I've reviewed the content but may not understand all medical details perfectly. Is there anything specific you'd like me to help explain?";

    chat.messages.push({
      sender: "ai",
      content: aiResponse,
      createdAt: new Date(),
    });

    // Save the chat
    await chat.save();

    res.json(chat);
  } catch (error: any) {
    console.error("Error in uploadChatDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a report from a chat
// @route   POST /api/chats/:id/report
// @access  Private
export const generateChatReport = async (req: Request, res: Response) => {
  try {
    // Find the chat
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user?._id,
    }).populate("user", "firstName lastName");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.messages.length < 2) {
      return res.status(400).json({
        message: "Not enough conversation to generate a report",
      });
    }

    // Check if any documents were shared in the conversation
    const sharedDocuments = chat.messages
      .filter((msg) => msg.attachmentUrl && msg.attachmentName)
      .map((msg) => ({
        name: msg.attachmentName || "Unnamed document",
        url: msg.attachmentUrl,
        sharedAt: new Date(msg.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        messageContent: msg.content,
      }));

    // Extract potential medical terms and symptoms from user messages
    const userMessagesContent = chat.messages
      .filter((msg) => msg.sender === "user")
      .map((msg) => msg.content)
      .join("\n");

    // Find AI recommendations from AI messages
    const aiResponses = chat.messages
      .filter((msg) => msg.sender === "ai")
      .map((msg) => msg.content);

    // Convert chat messages to OpenAI format
    const systemMessage = {
      role: "system" as const,
      content: `You are an AI medical assistant named Dr. AI. Based on the conversation history, create a comprehensive and well-formatted HTML medical report that includes:
IMPORTANT:
Don't include any comments in the response. 
Also just provide the html code, this will be dangerouslySetInnerHTML in the frontend.
1. The report should be in clean HTML format
2. The report should be in the language of the conversation
3. The report should be in the style of a medical report
4. The report should be in the tone of a medical report
Let's provide the report in the Table format.
Add proper styling to the table, make it look like a medical report.
The primary color of the report should be #1E88E5.
Also don't include response type like html in the response.
1. PATIENT INFORMATION: Use the chat context to determine patient's concerns
2. CONSULTATION SUMMARY: A clear summary of the patient's concerns and symptoms discussed
3. ASSESSMENT: Your analysis and potential considerations based on the conversation
4. RECOMMENDATIONS: Suggested next steps, tests, or treatments
5. DOCUMENTS REVIEWED: ${
        sharedDocuments.length > 0
          ? `The following medical documents were shared during the conversation:
     ${sharedDocuments
       .map((doc) => `- ${doc.name} (shared on ${doc.sharedAt})`)
       .join("\n     ")}`
          : "Note that no medical documents were shared during this consultation."
      }
6. DISCLAIMER: Include a clear medical disclaimer that this is AI-generated guidance and not a replacement for professional medical care

Format the report in clean HTML with appropriate headers using <h1>, <h2>, etc. tags and paragraph <p> tags. Use <ul> and <li> for lists where appropriate. Make the report professional, focusing on the medical aspects of the conversation.`,
    };

    const chatMessages = chat.messages.map((msg) => ({
      role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    // Get AI to generate the report
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        systemMessage,
        ...chatMessages,
        {
          role: "user" as const,
          content:
            "Please generate a detailed medical consultation report based on our conversation. Format it in clean HTML and make it professional.",
        },
      ],
      max_tokens: 2000,
    });

    const reportContent =
      completion.choices[0]?.message?.content ||
      "<h1>Unable to generate report</h1><p>Please try again later.</p>";

    res.json({ reportContent });
  } catch (error: any) {
    console.error("Error in generateChatReport:", error);
    res.status(500).json({ message: error.message });
  }
};
