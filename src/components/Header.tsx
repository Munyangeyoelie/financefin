import React, { useState, useEffect } from "react";
import { Search, User } from "lucide-react"; // Assuming lucide-react is installed
import { useAuth } from "../components/AuthContext"; // Adjust path as needed
import { supabase } from "../lib/supabase"; // Ensure supabase is initialized
import Notification from "./Notification"; // Ensure this component exists

const Header = () => {
  const { currentUser, logout } = useAuth() || {
    currentUser: null,
    logout: () => {},
  }; // Fallback if useAuth fails
  const [userFullName, setUserFullName] = useState("");

  // Fetch user data if currentUser exists
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.id) return; // Exit if no user ID

      try {
        const { data, error } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", currentUser.id)
          .single();

        if (error) throw error;
        setUserFullName(data?.full_name || "");
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Determine display name with fallbacks
  const displayName = userFullName || currentUser?.email || "Guest";

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side: Search Bar */}
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

        {/* Right Side: User Info and Logout */}
        <div className="flex items-center space-x-4">
          <Notification />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Hello, {displayName}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
