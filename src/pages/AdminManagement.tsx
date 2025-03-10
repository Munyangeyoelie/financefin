import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { supabase } from "../lib/supabase";
import { saveAs } from "file-saver"; // Import file-saver for downloading
import type { Order, Product } from "../types/database";

const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  bgColor = "bg-blue-50",
  iconColor = "text-blue-600",
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </div>
      <div
        className={`h-12 w-12 ${bgColor} rounded-full flex items-center justify-center`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
    <p className="text-sm mt-4">
      <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
        {trend >= 0 ? "+" : ""}
        {trend}%
      </span>{" "}
      vs last month
    </p>
  </div>
);

// Define User type
interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(""); // Start date for filtering
  const [endDate, setEndDate] = useState<string>(""); // End date for filtering
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null); // Current user's role

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch the current user's role
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;

        if (userId) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

          if (userError) throw userError;
          setCurrentUserRole(userData?.role || null);
        }

        // Fetch orders for revenue calculation and raw data
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount, created_at, customer_email")
          .order("created_at", { ascending: false });

        if (orders) {
          const revenue = orders.reduce(
            (sum, order) => sum + order.total_amount,
            0
          );
          setTotalRevenue(revenue);
          setTotalOrders(orders.length);
          setOrdersData(orders);

          // Process sales data for chart
          const monthlySales = orders.reduce((acc, order) => {
            const month = new Date(order.created_at).toLocaleString("default", {
              month: "short",
            });
            acc[month] = (acc[month] || 0) + order.total_amount;
            return acc;
          }, {});

          setSalesData(
            Object.entries(monthlySales).map(([month, amount]) => ({
              month,
              amount,
            }))
          );
        }

        // Fetch unique customers count
        const { count } = await supabase
          .from("orders")
          .select("customer_email", { count: "exact", head: true })
          .not("customer_email", "is", null);

        setTotalCustomers(count || 0);

        // Fetch users
        const { data: usersData } = await supabase
          .from("users")
          .select("id, email, role, status, created_at");
        setUsers(usersData || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: `Frw ${totalRevenue.toLocaleString()}`,
      trend: 12.5,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Users,
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      trend: 8.1,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: ShoppingBag,
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      trend: -3.2,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: TrendingUp,
      title: "Growth Rate",
      value: "15.2%",
      trend: 4.8,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  // Function to download report as CSV with date range filtering
  const downloadReport = () => {
    // Filter orders by date range
    const filteredOrders = ordersData.filter((order) => {
      const orderDate = new Date(order.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        return orderDate <= end;
      }
      return true; // If no dates selected, include all
    });

    // Calculate filtered metrics
    const filteredRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const filteredOrdersCount = filteredOrders.length;
    const filteredCustomers = new Set(
      filteredOrders.map((order) => order.customer_email).filter(Boolean)
    ).size;

    const csvHeaders = [
      "Metric",
      "Value",
      "Trend vs Last Month",
      "Details",
    ].join(",");
    const csvRows = [
      `Total Revenue (Filtered),Frw ${filteredRevenue.toLocaleString()},${
        stats[0].trend
      }%,`,
      `Total Customers (Filtered),${filteredCustomers},${stats[1].trend}%,`,
      `Total Orders (Filtered),${filteredOrdersCount},${stats[2].trend}%,`,
      `Growth Rate,${stats[3].value},${stats[3].trend}%,`,
      ...filteredOrders.map(
        (order) =>
          `Order,Frw ${order.total_amount.toLocaleString()},,Created At: ${new Date(
            order.created_at
          ).toLocaleString()}, Customer: ${order.customer_email || "N/A"}`
      ),
    ].join("\n");

    const csvContent = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `admin_report_${startDate || "start"}_to_${endDate || "end"}.csv`
    );
  };

  // Function to toggle user status and send email
  const toggleUserStatus = async (
    userId: string,
    currentStatus: string,
    email: string
  ) => {
    if (currentUserRole !== "supa-admin") {
      alert("Only users with the role 'supa-admin' can modify user status.");
      return;
    }

    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      // Simulate email notification (replace with actual email service)
      if (newStatus === "inactive") {
        console.log(
          `Sending email to ${email}: Your account has been deactivated. Please contact the admin.`
        );
        // Example with SendGrid (uncomment and configure):
        // const sgMail = require('@sendgrid/mail');
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        // const msg = {
        //   to: email,
        //   from: 'admin@yourdomain.com',
        //   subject: 'Account Deactivated',
        //   text: 'Your account has been deactivated. Please contact the admin.',
        // };
        // await sgMail.send(msg);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        <div className="flex space-x-4">
          {currentUserRole === "supa-admin" ? (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="End Date"
              />
              <button
                onClick={downloadReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Download Report
              </button>
            </>
          ) : (
            <p className="text-red-600">
              Only 'supa-admin' users can download reports.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" name="Sales" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">User Management</h2>
        {currentUserRole === "supa-admin" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          toggleUserStatus(user.id, user.status, user.email)
                        }
                        className={`px-4 py-2 rounded ${
                          user.status === "active"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {user.status === "active" ? "Inactive" : "Active"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-red-600">
            Only 'supa-admin' users can manage user accounts.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
