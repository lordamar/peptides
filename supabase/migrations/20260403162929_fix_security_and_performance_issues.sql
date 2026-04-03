/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add indexes for all foreign keys to improve query performance
    - Optimize RLS policies by wrapping auth functions in SELECT to prevent re-evaluation per row
  
  2. Security Improvements
    - Fix function search paths to be immutable
    - Update all RLS policies to use (select auth.uid()) pattern for better performance
  
  ## Foreign Key Indexes Added
    - addresses(user_id)
    - cart_items(product_sku)
    - disclaimer_acceptances(user_id)
    - inventory_adjustments(created_by, product_sku)
    - order_items(order_id)
    - orders(shipping_address_id, user_id)
    - payment_transactions(order_id)
    - products(category_id)
  
  ## RLS Policy Optimizations
    - All auth.uid() calls wrapped in SELECT to prevent per-row re-evaluation
    - All auth.jwt() calls wrapped in SELECT
  
  ## Function Improvements
    - Set search_path to be immutable for security functions
*/

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_sku ON cart_items(product_sku);
CREATE INDEX IF NOT EXISTS idx_disclaimer_acceptances_user_id ON disclaimer_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_by ON inventory_adjustments(created_by);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_sku ON inventory_adjustments(product_sku);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_id ON orders(shipping_address_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Drop existing RLS policies that need optimization
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update user status" ON users;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Users can view own disclaimer acceptances" ON disclaimer_acceptances;
DROP POLICY IF EXISTS "Users can create disclaimer acceptances" ON disclaimer_acceptances;
DROP POLICY IF EXISTS "Admins can view all disclaimer acceptances" ON disclaimer_acceptances;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can create payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can view all payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can manage inventory adjustments" ON inventory_adjustments;

-- Recreate optimized RLS policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true);

CREATE POLICY "Admins can update user status"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);

-- Recreate optimized RLS policies for products table
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);

-- Recreate optimized RLS policies for disclaimer_acceptances table
CREATE POLICY "Users can view own disclaimer acceptances"
  ON disclaimer_acceptances FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create disclaimer acceptances"
  ON disclaimer_acceptances FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all disclaimer acceptances"
  ON disclaimer_acceptances FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true);

-- Recreate optimized RLS policies for addresses table
CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Recreate optimized RLS policies for cart_items table
CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Recreate optimized RLS policies for orders table
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);

-- Recreate optimized RLS policies for order_items table
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true);

-- Recreate optimized RLS policies for payment_transactions table
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payment_transactions.order_id 
      AND orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create payment transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payment_transactions.order_id 
      AND orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true);

-- Recreate optimized RLS policies for inventory_adjustments table
CREATE POLICY "Admins can manage inventory adjustments"
  ON inventory_adjustments FOR ALL
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);

-- Fix function search paths for security (using CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
CREATE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped due to CASCADE
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Fix generate_order_number function
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
CREATE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_number TEXT;
  date_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  date_prefix := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COALESCE(MAX(SUBSTRING(order_number FROM 10)::INTEGER), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE date_prefix || '%';
  
  new_number := date_prefix || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;
