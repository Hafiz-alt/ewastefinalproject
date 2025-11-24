/*
  # Marketplace Implementation

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `condition` (text)
      - `category` (text)
      - `images` (jsonb array of image URLs)
      - `status` (text: available, sold, reserved)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `buyer_id` (uuid, references profiles)
      - `product_id` (uuid, references products)
      - `status` (text: pending, paid, shipped, completed, cancelled)
      - `shipping_address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for sellers and buyers
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  condition text NOT NULL CHECK (condition IN ('like_new', 'good', 'fair')),
  category text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  shipping_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products
  FOR SELECT
  TO authenticated
  USING (status = 'available' OR seller_id = auth.uid());

CREATE POLICY "Users can create products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'recycler' OR profiles.role = 'technician')
      )
    )
  );

CREATE POLICY "Sellers can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);

-- Add trigger for updated_at
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();