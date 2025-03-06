import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SalesDashboard from './pages/SalesDashboard';
import Companies from './pages/Companies';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import ExpiredProducts from './pages/ExpiredProducts';
import LowStocks from './pages/LowStocks';
import CategoryList from './pages/CategoryList';
import ManageStocks from './pages/ManageStocks';
import OnlineOrders from './pages/OnlineOrders';
import SalesReturns from './pages/SalesReturns';
import ExpenseList from './pages/ExpenseList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="sales-dashboard" element={<SalesDashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="expired-products" element={<ExpiredProducts />} />
          <Route path="low-stocks" element={<LowStocks />} />
          <Route path="category-list" element={<CategoryList />} />
          <Route path="manage-stocks" element={<ManageStocks />} />
          <Route path="online-orders" element={<OnlineOrders />} />
          <Route path="sales-returns" element={<SalesReturns />} />
          <Route path="expense-list" element={<ExpenseList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;