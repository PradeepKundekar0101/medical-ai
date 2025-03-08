import { useState, useEffect, useRef } from "react";
import axios from "axios";

import {
  FaFilePdf,
  FaUpload,
  FaTrash,
  FaDownload,
  FaExclamationCircle,
  FaPlus,
} from "react-icons/fa";
import { config } from "../config";

interface Document {
  _id: string;
  name: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.backendUrl}/api/documents`);
      setDocuments(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch documents");
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileInputRef.current?.files?.length) {
      setError("Please select a file to upload");
      return;
    }

    const file = fileInputRef.current.files[0];

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", documentName || file.name);

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      await axios.post(`${config.backendUrl}/api/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Document uploaded successfully");
      setDocumentName("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh documents list
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload document");
      console.error("Error uploading document:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      await axios.delete(`http://localhost:5001/api/documents/${id}`);

      setSuccess("Document deleted successfully");

      // Update documents list
      setDocuments(documents.filter((doc) => doc._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete document");
      console.error("Error deleting document:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Medical Documents</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-center">
          <FaExclamationCircle className="mr-2" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upload New Document
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label
              htmlFor="documentName"
              className="block text-gray-700 font-medium mb-2"
            >
              Document Name (optional)
            </label>
            <input
              type="text"
              id="documentName"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter document name or use filename"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="file"
              className="block text-gray-700 font-medium mb-2"
            >
              Select PDF File
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="file"
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={() => setError(null)}
              />
              <label
                htmlFor="file"
                className="flex-grow cursor-pointer bg-gray-50 border border-gray-300 rounded-l-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {fileInputRef.current?.files?.[0]?.name || "Choose a PDF file"}
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-r-lg"
              >
                <FaUpload />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 10MB
            </p>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            disabled={uploading}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaPlus className="mr-2" />
            )}
            Upload Document
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Documents
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaFilePdf className="mx-auto text-gray-400 text-5xl mb-4" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFilePdf className="text-red-500 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {doc.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-600 hover:text-red-900 mr-4"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <a
                        href={`http://localhost:5001/api/documents/${doc._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                        title="Download"
                      >
                        <FaDownload />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
