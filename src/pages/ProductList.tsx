import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Plus, Search, Save, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Product, Category } from "../types/database";

interface ProductWithCategory extends Product {
  categories: Category;
}

const ProductList = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [startDate, setStartDate] = useState<string>(""); // Start date for filtering
  const [endDate, setEndDate] = useState<string>(""); // End date for filtering

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleEditStart = (product: ProductWithCategory) => {
    setEditingId(product.id);
    setEditedProduct({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
    });
  };

  const handleEditChange = (field: string, value: string | number) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: editedProduct.name,
          sku: editedProduct.sku,
          price: editedProduct.price,
          quantity: editedProduct.quantity,
        })
        .eq("id", id);

      if (error) throw error;

      setProducts(
        products.map((product) =>
          product.id === id ? { ...product, ...editedProduct } : product
        )
      );
      setEditingId(null);
      setEditedProduct({});
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditedProduct({});
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Print a single product (for consistency, though not requested)
  const printProduct = (product: ProductWithCategory) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Product Details</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h2>Product Details</h2>
            <table>
              <tr><th>ID</th><td>${product.id}</td></tr>
              <tr><th>Name</th><td>${product.name}</td></tr>
              <tr><th>SKU</th><td>${product.sku}</td></tr>
              <tr><th>Category</th><td>${product.categories?.name}</td></tr>
              <tr><th>Price</th><td>frw ${product.price.toFixed(2)}</td></tr>
              <tr><th>Quantity</th><td>${product.quantity}</td></tr>
            </table>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Print all products within the selected date range
  const printAllProducts = () => {
    const sortedProducts = [...products].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Filter products by date range
    const filteredProducts = sortedProducts.filter((product) => {
      const productDate = new Date(product.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return productDate >= start && productDate <= end;
      } else if (start) {
        return productDate >= start;
      } else if (end) {
        return productDate <= end;
      }
      return true; // If no dates selected, include all
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>All Product Transactions</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h2>All Product Transactions (${startDate || "Start"} to ${
        endDate || "End"
      })</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${filteredProducts
                  .map(
                    (product) => `
                      <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.sku}</td>
                        <td>${product.categories?.name}</td>
                        <td>frw ${product.price.toFixed(2)}</td>
                        <td>${product.quantity}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
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
        <h1 className="text-2xl font-semibold text-gray-800">Product List</h1>
        <div className="flex space-x-4">
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
            onClick={printAllProducts}
            className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
          >
            Print All Products
          </button>
          <Link
            to="/add-product"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product.id ? (
                      <input
                        type="text"
                        value={editedProduct.name || ""}
                        onChange={(e) =>
                          handleEditChange("name", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={`https://source.unsplash.com/100x100/?product&random=${product.id}`}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.id ? (
                      <input
                        type="text"
                        value={editedProduct.sku || ""}
                        onChange={(e) =>
                          handleEditChange("sku", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      product.sku
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.categories?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editedProduct.price || ""}
                        onChange={(e) =>
                          handleEditChange("price", Number(e.target.value))
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      `frw ${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editedProduct.quantity || ""}
                        onChange={(e) =>
                          handleEditChange("quantity", Number(e.target.value))
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      product.quantity
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {editingId === product.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(product.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Save changes"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-gray-600 hover:text-gray-900"
                            title="Cancel editing"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditStart(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit product"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete product"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => printProduct(product)}
                            className="text-green-600 hover:text-green-900"
                            title="Print product"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10a2 2 0 002-2z"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
