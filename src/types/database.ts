export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  company_id: string;
  sku: string | null;
  price: number;
  cost_price: number;
  quantity: number;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  reference_number: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}