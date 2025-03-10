import { Bell, Search, User } from "lucide-react";
import { useAuth } from "../components/AuthContext"; // Adjust path as needed
import { Link } from "react-router-dom";

const Header = () => {
  const { currentUser, profile, logout } = useAuth();
  const displayName = profile?.full_name || currentUser?.email || "Guest";

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover BG-gray-100">
            <Bell className="h-6 w-6 text-gray-600" />
          </button>
          {currentUser ? (
            <>
              <button className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {displayName}
                </span>
              </button>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover text-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover text-gray-800"
              >
                Login
              </Link>
              <Link
                to="/signUp"
                className="text-sm text-gray-600 hover text-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
