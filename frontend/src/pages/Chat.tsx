import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FaPaperPlane,
  FaArrowLeft,
  FaExclamationCircle,
  FaFilePdf,
  FaDownload,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatData } from "../types/data";

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const [chat, setChat] = useState<ChatData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5001/api/chats/${id}`
        );
        setChat(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch chat");
        console.error("Error fetching chat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && !selectedFile) return;

    try {
      setSending(true);
      setError(null);

      // Check if there's a file to upload
      if (selectedFile) {
        await handleFileUpload();
      } else {
        // Regular text message
        const response = await axios.post(
          `http://localhost:5001/api/chats/${id}/messages`,
          {
            content: message,
          }
        );

        setChat(response.data);
        setMessage("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB");
      return;
    }

    setUploadingFile(true);
    setMessage(message || `I'm uploading a document: ${selectedFile.name}`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("chatId", id || "");
      formData.append(
        "message",
        message || `I'm uploading a document: ${selectedFile.name}`
      );

      // Add a processing message for better UX
      const processingMsg = {
        sender: "ai" as const,
        content:
          "Processing your document... This might take a moment depending on the file size.",
        createdAt: new Date().toISOString(),
        _id: "temp-processing-" + Date.now(),
      };

      if (chat) {
        setChat({
          ...chat,
          messages: [
            ...chat.messages,
            {
              sender: "user",
              content:
                message || `I'm uploading a document: ${selectedFile.name}`,
              createdAt: new Date().toISOString(),
              _id: "temp-upload-" + Date.now(),
            },
            processingMsg,
          ],
        });
      }

      scrollToBottom();

      const response = await axios.post(
        `http://localhost:5001/api/chats/${id}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setChat(response.data);
      setMessage("");

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
    } catch (err: any) {
      // Remove the temporary processing message if there was an error
      if (chat) {
        setChat({
          ...chat,
          messages: chat.messages.filter(
            (msg) => !msg._id?.toString().includes("temp-")
          ),
        });
      }

      setError(err.response?.data?.message || "Failed to upload file");
      console.error("Error uploading file:", err);
    } finally {
      setUploadingFile(false);
    }
  };

  const generateReport = async () => {
    console.log(chat);
    if (!chat) return;

    try {
      setGeneratingReport(true);
      setError(null);

      const response = await axios.post(
        `http://localhost:5001/api/chats/${id}/report`
      );

      setReportContent(response.data.reportContent);
      setShowReportModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate report");
      console.error("Error generating report:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = () => {
    if (!reportContent) return;

    // Get user name or "Patient" as default
    const patientName = user ? `${user.firstName} ${user.lastName}` : "Patient";

    // Format current date properly for the report
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 5px;
          }
          h1 {
            color: #0066cc;
            margin-top: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            font-size: 1.5rem;
          }
          h2 {
            color: #0066cc;
            margin-top: 25px;
            font-size: 1.3rem;
          }
          h3 {
            color: #0066cc;
            margin-top: 20px;
            font-size: 1.1rem;
          }
          .date {
            color: #666;
            font-style: italic;
            margin-bottom: 20px;
          }
          .patient-info {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 25px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .disclaimer {
            background: #fff8dc;
            padding: 10px;
            border-left: 4px solid #e7c855;
            margin: 20px 0;
            font-size: 14px;
          }
          ul, ol {
            margin-top: 10px;
            margin-bottom: 15px;
            padding-left: 30px;
          }
          ul {
            list-style-type: disc;
          }
          ol {
            list-style-type: decimal;
          }
          p {
            margin-bottom: 15px;
          }
          code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius:.3em;
            font-family: monospace;
            font-size: 0.9em;
          }
          pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
          }
          blockquote {
            border-left: 3px solid #ccc;
            margin: 15px 0;
            padding-left: 15px;
            color: #555;
            font-style: italic;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          strong, b {
            font-weight: bold;
          }
          em, i {
            font-style: italic;
          }
          a {
            color: #0066cc;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Dr. AI Medical Assistant</div>
          <div>Consultation Report</div>
        </div>
        
        <div class="patient-info">
          <strong>Patient:</strong> ${patientName}<br>
          <strong>Date:</strong> ${currentDate}<br>
          <strong>Consultation ID:</strong> ${id}
        </div>
        
        ${reportContent}
        
        <div class="disclaimer">
          <strong>Disclaimer:</strong> This report was generated by an AI medical assistant and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </div>
        
        <div class="footer">
          Generated by Dr. AI Medical Assistant<br>
          ${new Date().toISOString().split("T")[0]}
        </div>
      </body>
      </html>
    `;

    // Create a temporary container to render the HTML
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Apply specific print styles
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #printContainer, #printContainer * {
          visibility: visible;
        }
        #printContainer {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);

    // Set an ID for print targeting
    container.id = "printContainer";

    // Open print dialog
    window.print();

    // Clean up
    document.body.removeChild(container);
    document.head.removeChild(style);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <FaExclamationCircle className="mr-2" />
        Chat not found or you don't have access to it.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 truncate">
            {chat.title}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}

      <div className="flex-grow overflow-y-auto no-scrollbar bg-gray-50 rounded-lg p-4 mb-4">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-center mb-2">No messages yet</p>
            <p className="text-center text-sm">
              Start the conversation with Dr. AI
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chat.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm mb-1">
                    {msg.sender === "user" ? "You" : "Dr. AI"}
                  </div>
                  {msg.sender === "user" ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none overflow-auto markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  {msg.attachmentUrl && (
                    <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
                      <FaFilePdf className="text-red-500 mr-2" />
                      <a
                        href={`http://localhost:5001${msg.attachmentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm truncate"
                      >
                        {msg.attachmentName || "Medical Document"}
                      </a>
                    </div>
                  )}
                  <div
                    className={`text-xs mt-1 text-right ${
                      msg.sender === "user" ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-center mb-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              setError(null);
              setSelectedFile(e.target.files?.[0] || null);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-800 mr-2 flex items-center"
            title="Upload PDF Document"
          >
            <FaFilePdf size={20} className="mr-1" />
            <span className="text-sm">Upload Medical Document</span>
          </button>
          {selectedFile && (
            <div className="flex items-center text-xs text-gray-700">
              <span className="truncate max-w-xs">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  setSelectedFile(null);
                  setUploadingFile(false);
                  setError(null);
                }}
                className="ml-2 text-red-500 hover:text-red-700"
                title="Remove file"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mb-2 px-3 py-2 bg-blue-50 text-xs text-blue-800 rounded-md">
            <p>
              <strong>Tip:</strong> You can add a message describing your
              document before sending
            </p>
          </div>
        )}

        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow p-3 text-black border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending || uploadingFile}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg"
            disabled={
              sending || uploadingFile || (!message.trim() && !selectedFile)
            }
          >
            {sending || uploadingFile ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>

        {chat?.messages.length > 0 && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={generateReport}
              disabled={generatingReport || chat.messages.length < 3}
              className={`flex items-center text-xs px-3 py-1 rounded-md ${
                chat.messages.length < 4
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
              title={
                chat.messages.length < 4
                  ? "Continue your conversation to generate a report"
                  : "Generate a detailed medical report from this conversation"
              }
            >
              {generatingReport ? (
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-700 mr-1"></div>
              ) : (
                <FaDownload className="mr-1" size={12} />
              )}
              Generate Medical Report
            </button>
          </div>
        )}
      </form>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Medical Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div
              className="p-4 flex-grow overflow-y-auto text-black"
              dangerouslySetInnerHTML={{ __html: reportContent }}
            />
            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={downloadReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
