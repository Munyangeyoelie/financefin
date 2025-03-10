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
import { saveAs } from "file-saver";
import type { Order, Expense } from "../types/database";

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

const AdminDashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [expensesData, setExpensesData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch orders for revenue calculation and raw data
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch expenses data
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("*")
          .order("created_at", { ascending: false });

        if (expensesError) throw expensesError;

        if (orders) {
          const revenue = orders.reduce(
            (sum, order) => sum + (order.total_amount || 0),
            0
          );
          setTotalRevenue(revenue);
          setTotalOrders(orders.length);
          setOrdersData(orders);

          // Process sales data for chart - grouped by day
          const dailySales = orders.reduce((acc, order) => {
            if (!order.created_at) return acc;
            const date = new Date(order.created_at).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + (order.total_amount || 0);
            return acc;
          }, {});

          // Convert to array and sort by date
          const sortedDailySales = Object.entries(dailySales)
            .map(([date, amount]) => ({
              date,
              amount,
              // Format date for display
              displayDate: new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
            }))
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          setSalesData(sortedDailySales);
        }

        if (expenses) {
          setExpensesData(expenses);
        }

        // Fetch unique customers count based on customer_name
        const uniqueCustomers = new Set();
        orders?.forEach((order) => {
          if (order.customer_name) {
            uniqueCustomers.add(order.customer_name);
          }
        });

        setTotalCustomers(uniqueCustomers.size);
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

  // Function to download comprehensive report as CSV
  const downloadReport = () => {
    try {
      // Create CSV string builder with proper encoding for Excel compatibility
      let csvContent = "\uFEFF"; // BOM for Excel to recognize UTF-8

      // 1. SUMMARY SECTION
      csvContent += "SUMMARY DATA\r\n";
      csvContent += "Metric,Value,Trend vs Last Month,Details\r\n";
      csvContent += `Total Revenue,Frw ${totalRevenue.toLocaleString()},${
        stats[0].trend
      }%,\r\n`;
      csvContent += `Total Customers,${totalCustomers.toLocaleString()},${
        stats[1].trend
      }%,\r\n`;
      csvContent += `Total Orders,${totalOrders.toLocaleString()},${
        stats[2].trend
      }%,\r\n`;
      csvContent += `Growth Rate,${stats[3].value},${stats[3].trend}%,\r\n`;
      csvContent += "\r\n"; // Empty row as separator

      // 2. ORDERS SECTION
      csvContent += "ORDERS DATA\r\n";
      csvContent +=
        "Order ID,Date,Customer,Total Amount,Status,Payment Method,Additional Info\r\n";

      if (ordersData && ordersData.length > 0) {
        ordersData.forEach((order) => {
          // Escape any commas in text fields
          const customerName = order.customer_name
            ? `"${order.customer_name.replace(/"/g, '""')}"`
            : "N/A";
          const notes = order.notes
            ? `"${order.notes.replace(/"/g, '""')}"`
            : "";
          const status = order.status ? `"${order.status}"` : "N/A";
          const paymentMethod = order.payment_method
            ? `"${order.payment_method}"`
            : "N/A";

          csvContent +=
            [
              order.id || "N/A",
              new Date(order.created_at).toLocaleString(),
              customerName,
              `Frw ${order.total_amount.toLocaleString()}`,
              status,
              paymentMethod,
              notes,
            ].join(",") + "\r\n";
        });
      } else {
        csvContent += "No order data available\r\n";
      }

      csvContent += "\r\n"; // Empty row as separator

      // 3. EXPENSES SECTION
      csvContent += "EXPENSES DATA\r\n";
      csvContent += "Expense ID,Date,Category,Amount,Vendor,Description\r\n";

      if (expensesData && expensesData.length > 0) {
        expensesData.forEach((expense) => {
          // Escape any commas in text fields
          const category = expense.category
            ? `"${expense.category.replace(/"/g, '""')}"`
            : "N/A";
          const description = expense.description
            ? `"${expense.description.replace(/"/g, '""')}"`
            : "";
          const vendor = expense.vendor
            ? `"${expense.vendor.replace(/"/g, '""')}"`
            : "N/A";

          csvContent +=
            [
              expense.id || "N/A",
              new Date(expense.created_at).toLocaleString(),
              category,
              `Frw ${expense.amount.toLocaleString()}`,
              vendor,
              description,
            ].join(",") + "\r\n";
        });
      } else {
        csvContent += "No expense data available\r\n";
      }

      // 4. DAILY SALES BREAKDOWN
      csvContent += "\r\n";
      csvContent += "DAILY SALES BREAKDOWN\r\n";
      csvContent += "Date,Total Sales\r\n";

      if (salesData && salesData.length > 0) {
        salesData.forEach((day) => {
          csvContent +=
            [day.date, `Frw ${day.amount.toLocaleString()}`].join(",") + "\r\n";
        });
      } else {
        csvContent += "No daily sales data available\r\n";
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(
        blob,
        `admin_report_${new Date().toISOString().split("T")[0]}.csv`
      );
    } catch (error) {
      console.error("Error generating report:", error);
      alert("There was an error generating the report. Please try again.");
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
        <button
          onClick={downloadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Sales Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `Frw ${value.toLocaleString()}`,
                  "Sales",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Bar dataKey="amount" name="Sales" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
