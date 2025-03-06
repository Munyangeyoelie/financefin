/*
  # Initial Schema Setup for DreamsPOS

  1. New Tables
    - products
    - categories
    - companies
    - orders
    - order_items
    - expenses
    - stock_movements

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  company_id uuid REFERENCES companies(id),
  sku text UNIQUE,
  price decimal(10,2) NOT NULL DEFAULT 0,
  cost_price decimal(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text,
  customer_email text,
  status text DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  reference_number text,
  expense_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  movement_type text NOT NULL, -- 'in' or 'out'
  quantity integer NOT NULL,
  reference_number text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);