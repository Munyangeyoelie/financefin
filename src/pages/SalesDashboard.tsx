import { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  Plus,
  ChevronDown,
  FileText,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  BarChart,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SalesDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: "Frw 0",
    totalOrders: "0",
    totalCustomers: "0",
    averageSale: "Frw 0",
    salesGrowth: "+0%",
    ordersGrowth: "+0%",
    customersGrowth: "+0%",
    averageSaleGrowth: "+0%",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const printRef = useRef(null);

  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    product: "",
    order_amount: "",
    status: "Pending",
  });

  const [editOrder, setEditOrder] = useState({
    id: null,
    customer_name: "",
    product: "",
    order_amount: "",
    status: "Pending",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 8;

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const from = (currentPage - 1) * recordsPerPage;
      const to = from + recordsPerPage - 1;

      const {
        data: ordersData,
        error,
        count,
      } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .ilike("customer_name", `%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const formattedOrders = ordersData.map((order) => ({
        ...order,
        date: new Date(order.created_at).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        customer: order.customer_name,
        amount: order.order_amount,
      }));

      setOrders(formattedOrders);
      setTotalRecords(count || 0);
      setTotalPages(Math.ceil(count / recordsPerPage) || 1);
      await fetchStatistics();
    } catch (err) {
      console.error("Error fetching orders:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard statistics
  const fetchStatistics = async () => {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from("orders")
        .select("order_amount, customer_name");

      if (salesError) throw salesError;

      if (!salesData || salesData.length === 0) {
        setStats({
          totalSales: "Frw 0",
          totalOrders: "0",
          totalCustomers: "0",
          averageSale: "Frw 0",
          salesGrowth: "+0%",
          ordersGrowth: "+0%",
          customersGrowth: "+0%",
          averageSaleGrowth: "+0%",
        });
        return;
      }

      const totalSales = salesData.reduce((sum, order) => {
        const amount =
          typeof order.order_amount === "string"
            ? parseFloat(order.order_amount.match(/[\d.]+/)?.[0] || 0)
            : parseFloat(order.order_amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const uniqueCustomers = new Set(
        salesData
          .filter((order) => order.customer_name)
          .map((order) => order.customer_name)
      ).size;

      const averageSale =
        salesData.length > 0 ? totalSales / salesData.length : 0;

      setStats({
        totalSales: `Frw ${totalSales.toFixed(2)}`,
        totalOrders: salesData.length.toString(),
        totalCustomers: uniqueCustomers.toString(),
        averageSale: `Frw ${averageSale.toFixed(2)}`,
        salesGrowth: "+8.5%",
        ordersGrowth: "+5.2%",
        customersGrowth: "+2.8%",
        averageSaleGrowth: "-0.5%",
      });
    } catch (err) {
      console.error("Error fetching statistics:", err.message);
    }
  };

  // Add new order
  const addOrder = async () => {
    if (
      !newOrder.customer_name ||
      !newOrder.product ||
      !newOrder.order_amount
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const numericAmount = parseFloat(newOrder.order_amount);
      if (isNaN(numericAmount))
        throw new Error("Amount must be a valid number");

      const orderData = {
        customer_name: newOrder.customer_name.trim(),
        product: newOrder.product.trim(),
        order_amount: numericAmount,
        total_amount: numericAmount,
        status: newOrder.status,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("orders").insert([orderData]);

      if (error) throw error;

      setNewOrder({
        customer_name: "",
        product: "",
        order_amount: "",
        status: "Pending",
      });
      setShowAddModal(false);
      await fetchOrders();
    } catch (err) {
      console.error("Error adding order:", err.message);
      alert(`Failed to add order: ${err.message}`);
    }
  };

  // Edit order functionality
  const openEditModal = (order) => {
    const amount =
      typeof order.amount === "string"
        ? order.amount.match(/[\d.]+/)?.[0] || "0"
        : order.amount.toString();

    setEditOrder({
      id: order.id,
      customer_name: order.customer_name || "",
      product: order.product || "",
      order_amount: amount,
      status: order.status || "Pending",
    });
    setShowEditModal(true);
  };

  const updateOrder = async () => {
    if (
      !editOrder.customer_name ||
      !editOrder.product ||
      !editOrder.order_amount
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const numericAmount = parseFloat(editOrder.order_amount);
      if (isNaN(numericAmount))
        throw new Error("Amount must be a valid number");

      const orderData = {
        customer_name: editOrder.customer_name.trim(),
        product: editOrder.product.trim(),
        order_amount: numericAmount,
        total_amount: numericAmount,
        status: editOrder.status,
      };

      const { error } = await supabase
        .from("orders")
        .update(orderData)
        .eq("id", editOrder.id);

      if (error) throw error;

      setEditOrder({
        id: null,
        customer_name: "",
        product: "",
        order_amount: "",
        status: "Pending",
      });
      setShowEditModal(false);
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err.message);
      alert(`Failed to update order: ${err.message}`);
    }
  };

  // Print functionality
  const openPrintModal = (order) => {
    setCurrentOrder(order);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Invoice #${currentOrder.id
            .toString()
            .padStart(4, "0")}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .invoice { max-width: 800px; margin: 20px auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details div { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>Order Invoice</h1>
              <p>Order #${currentOrder.id.toString().padStart(4, "0")}</p>
              <p>Date: ${currentOrder.date}</p>
            </div>
            <div class="details">
              <div><strong>Customer:</strong> ${
                currentOrder.customer_name || currentOrder.customer
              }</div>
              <div><strong>Status:</strong> ${currentOrder.status}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${currentOrder.product}</td>
                  <td>${currentOrder.amount}</td>
                </tr>
              </tbody>
            </table>
            <div class="total">Total: ${currentOrder.amount}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    setShowPrintModal(false);
  };

  // Delete order
  const deleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete);

      if (error) throw error;

      setShowDeleteModal(false);
      setOrderToDelete(null);
      await fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err.message);
      alert(`Failed to delete order: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, currentPage]);

  const statsCards = [
    {
      id: 1,
      title: "Total Sales",
      value: stats.totalSales,
      growth: stats.salesGrowth,
      positive: !stats.salesGrowth.includes("-"),
      icon: <DollarSign className="text-purple-700" size={20} />,
      bgColor: "bg-purple-100",
    },
    {
      id: 2,
      title: "Total Orders",
      value: stats.totalOrders,
      growth: stats.ordersGrowth,
      positive: !stats.ordersGrowth.includes("-"),
      icon: <ShoppingCart className="text-blue-700" size={20} />,
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      title: "Customers",
      value: stats.totalCustomers,
      growth: stats.customersGrowth,
      positive: !stats.customersGrowth.includes("-"),
      icon: <Users className="text-green-700" size={20} />,
      bgColor: "bg-green-100",
    },
    {
      id: 4,
      title: "Average Sale",
      value: stats.averageSale,
      growth: stats.averageSaleGrowth,
      positive: !stats.averageSaleGrowth.includes("-"),
      icon: <BarChart className="text-red-700" size={20} />,
      bgColor: "bg-red-100",
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Delivered":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > 2) pageNumbers.push("...");
      if (currentPage !== 1 && currentPage !== totalPages)
        pageNumbers.push(currentPage);
      if (currentPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
              <nav className="text-sm mt-1">
                <ol className="list-none p-0 inline-flex">
                  <li className="flex items-center text-gray-500">
                    <a href="#" className="text-purple-600">
                      Dashboard
                    </a>
                    <span className="mx-2">/</span>
                  </li>
                  <li className="flex items-center text-gray-500">Orders</li>
                </ol>
              </nav>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center text-gray-700 hover:bg-gray-50">
                <Calendar size={18} className="mr-2" />
                <span>Mar 01, 2025 - Mar 31, 2025</span>
                <ChevronDown size={18} className="ml-2" />
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center text-gray-700 hover:bg-gray-50">
                <Download size={18} className="mr-2" />
                <span>Export</span>
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md flex items-center hover:bg-purple-700"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} className="mr-2" />
                <span>Add New</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsCards.map((card) => (
              <div key={card.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${card.bgColor} mr-4`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{card.title}</p>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">
                      {card.value}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div
                    className={`flex items-center ${
                      card.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.positive ? (
                      <ArrowUp size={16} className="mr-1" />
                    ) : (
                      <ArrowDown size={16} className="mr-1" />
                    )}
                    <span>{card.growth}</span>
                    <span className="text-gray-500 ml-2 text-sm">
                      Since last month
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">
                  Orders List
                </h2>
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                  <button
                    className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    onClick={fetchOrders}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            #{order.id?.toString().padStart(4, "0") || "0000"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                                {order.customer?.charAt(0) || "?"}
                              </div>
                              {order.customer || "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {order.product || "No product"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                            {order.amount || "Frw 0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 text-xs rounded-full border ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {order.status || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.date || "No date"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-3">
                              <button
                                className="text-gray-500 hover:text-blue-600"
                                onClick={() => openPrintModal(order)}
                                title="Print Order"
                              >
                                <FileText size={18} />
                              </button>
                              <button
                                className="text-gray-500 hover:text-green-600"
                                onClick={() => openEditModal(order)}
                                title="Edit Order"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                className="text-gray-500 hover:text-red-600"
                                onClick={() => {
                                  setOrderToDelete(order.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {orders.length > 0 && (
              <div className="flex justify-between items-center p-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                  {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                  {totalRecords} entries
                </div>
                <div className="flex space-x-1">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {generatePageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 ${
                        page === currentPage
                          ? "bg-purple-600 text-white"
                          : "border border-gray-300 text-gray-500"
                      } rounded hover:bg-purple-700 hover:text-white ${
                        page === "..."
                          ? "cursor-default hover:bg-white hover:text-gray-500"
                          : ""
                      }`}
                      onClick={() => page !== "..." && setCurrentPage(page)}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Add New Order
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Customer Name*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newOrder.customer_name}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, customer_name: e.target.value })
                  }
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Product*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newOrder.product}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, product: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Amount*
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newOrder.order_amount}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, order_amount: e.target.value })
                  }
                  placeholder="Enter amount (e.g. 99.99)"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newOrder.status}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                onClick={addOrder}
              >
                <Check size={18} className="mr-2" />
                Add Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit Order
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Customer Name*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editOrder.customer_name}
                  onChange={(e) =>
                    setEditOrder({
                      ...editOrder,
                      customer_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Product*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editOrder.product}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, product: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Amount*
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editOrder.order_amount}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, order_amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editOrder.status}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                onClick={updateOrder}
              >
                <Check size={18} className="mr-2" />
                Update Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Confirmation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Print Order
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowPrintModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to print Order #
              {currentOrder?.id.toString().padStart(4, "0")}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowPrintModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                onClick={handlePrint}
              >
                <FileText size={18} className="mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this order? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                onClick={deleteOrder}
              >
                <Trash2 size={18} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
