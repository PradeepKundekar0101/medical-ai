import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface IMessage {
  sender: "user" | "ai";
  content: string;
  createdAt: Date;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface IChat extends mongoose.Document {
  user: IUser["_id"];
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attachmentUrl: {
    type: String,
    required: false,
  },
  attachmentName: {
    type: String,
    required: false,
  },
});

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      default: "New Conversation",
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
