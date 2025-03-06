import React from "react";
import { TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react";

const StatCard = ({ icon: Icon, title, value, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </div>
      <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
    <p className="text-sm mt-4">
      <span className={`${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
        {trend >= 0 ? "+" : ""}
        {trend}%
      </span>{" "}
      vs last month
    </p>
  </div>
);

const Dashboard = () => {
  const stats = [
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: "Frw 54,234",
      trend: 12.5,
    },
    { icon: Users, title: "Total Customers", value: "2,420", trend: 8.1 },
    { icon: ShoppingCart, title: "Total Orders", value: "1,210", trend: -3.2 },
    { icon: TrendingUp, title: "Growth Rate", value: "15.2%", trend: 4.8 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Add more dashboard components here */}
    </div>
  );
};

export default Dashboard;
