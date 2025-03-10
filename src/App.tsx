import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import SalesDashboard from "./pages/SalesDashboard";
import Companies from "./pages/Companies";
import ProductList from "./pages/ProductList";
import AddProduct from "./pages/AddProduct";
import ExpiredProducts from "./pages/ExpiredProducts";
import LowStocks from "./pages/LowStocks";
import CategoryList from "./pages/CategoryList";
import ManageStocks from "./pages/ManageStocks";
import OnlineOrders from "./pages/OnlineOrders";
import SalesReturns from "./pages/SalesReturns";
import ExpenseList from "./pages/ExpenseList";
import AdminManagement from "./pages/AdminManagement"; // Import the new AdminManagement page

// Protected route component for any logged-in user
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Redirect all unauthorized users to login */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales-dashboard" element={<SalesDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-management" element={<AdminManagement />} />{" "}
          {/* Add new route */}
          <Route path="/companies" element={<Companies />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/expired-products" element={<ExpiredProducts />} />
          <Route path="/low-stocks" element={<LowStocks />} />
          <Route path="/category-list" element={<CategoryList />} />
          <Route path="/manage-stocks" element={<ManageStocks />} />
          <Route path="/online-orders" element={<OnlineOrders />} />
          <Route path="/sales-returns" element={<SalesReturns />} />
          <Route path="/expense-list" element={<ExpenseList />} />
        </Route>
      </Route>

      {/* Login and Signup pages remain accessible */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Default redirect for unauthorized access */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
