import { useState, useEffect } from "react";
import { Bell, DollarSign } from "lucide-react";
import { supabase } from "../lib/supabase";

interface TaxNotification {
  id: number;
  order_id: string;
  order_amount: number;
  tax_amount: number;
  created_at: string;
  read: boolean;
}

const TaxNotification = () => {
  const [notifications, setNotifications] = useState<TaxNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchTaxNotifications();
  }, []);

  const fetchTaxNotifications = async () => {
    try {
      // Assuming you have a "tax_notifications" table in Supabase
      const { data, error } = await supabase
        .from("tax_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((item) => !item.read).length);
      }
    } catch (error) {
      console.error("Error fetching tax notifications:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from("tax_notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking tax notification as read:", error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "frw",
    }).format(amount);
  };

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-100 relative"
        onClick={toggleDropdown}
        aria-label="Tax Notifications"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg z-10 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b">
            <h3 className="text-sm font-medium text-gray-700">
              Tax Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        Tax Alert: Order #{notification.order_id}
                      </p>
                      <p className="text-sm text-gray-700">
                        Order Amount:{" "}
                        {formatCurrency(notification.order_amount)}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        9% Tax: {formatCurrency(notification.tax_amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No tax notifications
              </div>
            )}
          </div>
          <div className="p-2 bg-gray-50 border-t text-center">
            <button className="text-xs text-blue-600 hover:text-blue-800">
              View all tax notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxNotification;
