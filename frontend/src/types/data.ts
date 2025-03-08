export interface Message {
  _id?: string;
  sender: "user" | "ai";
  content: string;
  createdAt: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ChatData {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
