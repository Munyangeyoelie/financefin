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

const AdminDashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch orders for revenue calculation
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount, created_at")
          .order("created_at", { ascending: false });

        if (orders) {
          const revenue = orders.reduce(
            (sum, order) => sum + order.total_amount,
            0
          );
          setTotalRevenue(revenue);
          setTotalOrders(orders.length);

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
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Download Report
        </button>
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
    </div>
  );
};

export default AdminDashboard;
