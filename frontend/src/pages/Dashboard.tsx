import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaPlus,
  FaComments,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";
import { config } from "../config";

interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { sender: string; content: string; createdAt: string }[];
}

const Dashboard = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.backendUrl}/api/chats`);
        setChats(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch chats");
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const createNewChat = async () => {
    try {
      setCreating(true);
      const response = await axios.post(`${config.backendUrl}/api/chats`, {
        title: `Conversation ${new Date().toLocaleDateString()}`,
      });

      navigate(`/chat/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create new chat");
      console.error("Error creating chat:", err);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) {
      return "No messages yet";
    }

    const lastMessage = chat.messages[chat.messages.length - 1];
    const sender = lastMessage.sender === "user" ? "You" : "Dr. AI";
    const content =
      lastMessage.content.length > 60
        ? `${lastMessage.content.substring(0, 60)}...`
        : lastMessage.content;

    return `${sender}: ${content}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Conversations</h1>
        <button
          onClick={createNewChat}
          disabled={creating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          {creating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : (
            <FaPlus className="mr-2" />
          )}
          New Conversation
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : chats.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <FaComments className="mx-auto text-gray-400 text-5xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your first conversation with Dr. AI
          </p>
          <button
            onClick={createNewChat}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors"
          >
            {creating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaPlus className="mr-2" />
            )}
            Start Conversation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => (
            <Link
              key={chat._id}
              to={`/chat/${chat._id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                {chat.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {getLastMessage(chat)}
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                <FaClock className="mr-1" />
                <span>{formatDate(chat.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
