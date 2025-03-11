import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { AlertCircle } from "lucide-react";

// Define the type for our stock item
interface StockItem {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  unit: string;
  quantity: number;
  image_url: string;
  created_at: string;
}

const LowStocks: React.FC = () => {
  const { supabase } = useAuth();
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the threshold for low stock
  const LOW_STOCK_THRESHOLD = 20;

  useEffect(() => {
    async function fetchLowStockItems() {
      try {
        setLoading(true);

        // Fetch products with low stock from Supabase
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .lt("quantity", LOW_STOCK_THRESHOLD)
          .order("quantity", { ascending: true });

        if (error) {
          throw error;
        }

        setLowStockItems(data || []);
      } catch (err) {
        console.error("Error fetching low stock items:", err);
        setError("Failed to load low stock items. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchLowStockItems();
  }, [supabase]);

  // Function to get the status class based on quantity
  const getStatusClass = (quantity: number) => {
    if (quantity <= 7) return "bg-red-100 text-red-600";
    if (quantity <= 20) return "bg-orange-100 text-orange-600";
    return "bg-yellow-100 text-yellow-600";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Low Stocks</h2>
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-4 text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No low stock items found
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          <img
                            src={item.image_url || "/api/placeholder/40/40"}
                            alt={item.product_name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.brand}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Rwf{item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          item.quantity
                        )}`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LowStocks;
