/*
  # Add Foreign Key Indexes and Fix RLS Policies

  ## Changes Made

  1. **Add Foreign Key Indexes**
     - Re-adding indexes for all foreign keys to improve query performance
     - These are essential for join operations and foreign key constraint checks
     
  2. **Fix Restrictive Policies**
     - Convert RESTRICTIVE policies back to regular policies
     - RESTRICTIVE policies still need optimized auth function calls
     - Consolidate overlapping policies to avoid multiple permissive policy warnings
     
  ## Indexes Added
     - addresses(user_id)
     - cart_items(product_sku)
     - disclaimer_acceptances(user_id)
     - inventory_adjustments(created_by, product_sku)
     - order_items(order_id)
     - orders(shipping_address_id, user_id)
     - payment_transactions(order_id)
     - products(category_id)

  ## Security Notes
     - All policies use (select auth.uid()) and (select auth.jwt()) pattern for optimal performance
     - Admin and user policies are separated to maintain clarity
     - Users can only access their own data, admins can access all data
*/

-- Add indexes for all foreign keys
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

-- Fix users table policies - combine into single policies per action
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update user status" ON users;

CREATE POLICY "Users and admins can view profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id 
    OR (select auth.jwt()->>'is_admin')::boolean = true
  );

CREATE POLICY "Users and admins can update profiles"
  ON users FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = id 
    OR (select auth.jwt()->>'is_admin')::boolean = true
  )
  WITH CHECK (
    (select auth.uid()) = id 
    OR (select auth.jwt()->>'is_admin')::boolean = true
  );

-- Fix products table policies - combine into single SELECT policy
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "View products"
  ON products FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR (select auth.jwt()->>'is_admin')::boolean = true
  );

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true);

-- Fix disclaimer_acceptances table policies - combine SELECT policies
DROP POLICY IF EXISTS "Users can view own disclaimer acceptances" ON disclaimer_acceptances;
DROP POLICY IF EXISTS "Admins can view all disclaimer acceptances" ON disclaimer_acceptances;
DROP POLICY IF EXISTS "Users can create disclaimer acceptances" ON disclaimer_acceptances;

CREATE POLICY "View disclaimer acceptances"
  ON disclaimer_acceptances FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id 
    OR (select auth.jwt()->>'is_admin')::boolean = true
  );

CREATE POLICY "Users can create disclaimer acceptances"
  ON disclaimer_acceptances FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix orders table policies - combine SELECT policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "View orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id 
    OR (select auth.jwt()->>'is_admin')::boolean = true
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);

-- Fix order_items table policies - combine SELECT policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

CREATE POLICY "View order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (select auth.uid())
    )
    OR (select auth.jwt()->>'is_admin')::boolean = true
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

-- Fix payment_transactions table policies - combine SELECT policies
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can view all payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can create payment transactions" ON payment_transactions;

CREATE POLICY "View payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payment_transactions.order_id 
      AND orders.user_id = (select auth.uid())
    )
    OR (select auth.jwt()->>'is_admin')::boolean = true
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

-- Fix inventory_adjustments table policy
DROP POLICY IF EXISTS "Admins can manage inventory adjustments" ON inventory_adjustments;

CREATE POLICY "Admins can manage inventory adjustments"
  ON inventory_adjustments FOR ALL
  TO authenticated
  USING ((select auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((select auth.jwt()->>'is_admin')::boolean = true);
