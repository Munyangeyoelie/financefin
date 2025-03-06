import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Building2,
  Package,
  AlertCircle,
  Boxes,
  List,
  ShoppingCart,
  RotateCcw,
  Receipt,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    {
      path: "/admin-dashboard",
      icon: LayoutDashboard,
      label: "Admin Dashboard",
    },
    { path: "/sales-dashboard", icon: ShoppingBag, label: "Sales Dashboard" },
    { path: "/companies", icon: Building2, label: "Companies" },
    { path: "/product-list", icon: Package, label: "Product List" },
    { path: "/expired-products", icon: AlertCircle, label: "Expired Products" },
    { path: "/low-stocks", icon: Boxes, label: "Low Stocks" },
    { path: "/category-list", icon: List, label: "Categories" },
    { path: "/online-orders", icon: ShoppingCart, label: "Online Orders" },
    { path: "/sales-returns", icon: RotateCcw, label: "Sales Returns" },
    { path: "/expense-list", icon: Receipt, label: "Expenses" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600">Gerad stock</h1>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
                isActive ? "bg-blue-50 text-blue-600" : ""
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
