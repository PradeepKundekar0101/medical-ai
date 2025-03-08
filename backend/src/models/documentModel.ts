import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface IDocument extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  filename: string;
  contentType: string;
  path: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model<IDocument>("Document", documentSchema);

export default Document;
