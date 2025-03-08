import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaSignOutAlt,
  FaComments,
  FaFilePdf,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl text-white font-bold flex items-center"
          >
            <span className="text-white">Dr. AI</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/"
                  className="flex items-center hover:text-blue-200 transition-colors"
                >
                  <FaComments className="mr-1" />
                  <span>Chats</span>
                </Link>
                <Link
                  to="/documents"
                  className="flex items-center hover:text-blue-200 transition-colors"
                >
                  <FaFilePdf className="mr-1" />
                  <span>Documents</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center hover:text-blue-200 transition-colors"
                >
                  <FaUser className="mr-1" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center hover:text-blue-200 transition-colors"
                >
                  <FaSignOutAlt className="mr-1" />
                  <span>Logout</span>
                </button>
                <div className="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded-full text-black">
                  {user.firstName} {user.lastName}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-200 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            {user ? (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="flex items-center hover:text-blue-200 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaComments className="mr-2" />
                  <span>Chats</span>
                </Link>
                <Link
                  to="/documents"
                  className="flex items-center hover:text-blue-200 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaFilePdf className="mr-2" />
                  <span>Documents</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center hover:text-blue-200 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="mr-2" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center hover:text-blue-200 transition-colors py-2"
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Logout</span>
                </button>
                <div className="py-2 mt-2 border-t text-black border-blue-400">
                  Signed in as: {user.firstName} {user.lastName}
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="hover:text-blue-200 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors inline-block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
