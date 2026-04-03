/*
  # Fix RLS Performance and Remove Unused Indexes

  ## Changes Made
  
  ### 1. RLS Policy Performance Optimization
  All RLS policies have been updated to use `(select auth.<function>())` instead of `auth.<function>()`.
  This prevents re-evaluation of auth functions for each row, significantly improving query performance at scale.
  
  **Tables Updated:**
  - `users` - 2 policies optimized
  - `products` - 4 policies optimized
  - `disclaimer_acceptances` - 1 policy optimized
  - `orders` - 2 policies optimized
  - `order_items` - 1 policy optimized
  - `payment_transactions` - 1 policy optimized
  - `inventory_adjustments` - 1 policy optimized
  
  ### 2. Unused Index Removal
  Removed indexes that have not been used to reduce storage overhead and improve write performance:
  - `idx_cart_items_product_sku`
  - `idx_disclaimer_acceptances_user_id`
  - `idx_addresses_user_id`
  - `idx_inventory_adjustments_created_by`
  - `idx_inventory_adjustments_product_sku`
  - `idx_order_items_order_id`
  - `idx_orders_shipping_address_id`
  - `idx_orders_user_id`
  - `idx_payment_transactions_order_id`
  - `idx_products_category_id`
  
  ## Important Notes
  1. Auth function calls are now evaluated once per query instead of per row
  2. Unused indexes have been removed to improve write performance
  3. Manual configuration required in Supabase Dashboard:
     - Auth DB Connection Strategy: Switch to percentage-based allocation
     - Leaked Password Protection: Enable HaveIBeenPwned integration (requires Pro Plan)
*/

-- ============================================================================
-- DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_cart_items_product_sku;
DROP INDEX IF EXISTS idx_disclaimer_acceptances_user_id;
DROP INDEX IF EXISTS idx_addresses_user_id;
DROP INDEX IF EXISTS idx_inventory_adjustments_created_by;
DROP INDEX IF EXISTS idx_inventory_adjustments_product_sku;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_orders_shipping_address_id;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_payment_transactions_order_id;
DROP INDEX IF EXISTS idx_products_category_id;

-- ============================================================================
-- OPTIMIZE RLS POLICIES - USERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users and admins can view profiles" ON users;
CREATE POLICY "Users and admins can view profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid()) OR 
    (select (auth.jwt()->>'is_admin')::boolean)
  );

DROP POLICY IF EXISTS "Users and admins can update profiles" ON users;
CREATE POLICY "Users and admins can update profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid()) OR 
    (select (auth.jwt()->>'is_admin')::boolean)
  )
  WITH CHECK (
    id = (select auth.uid()) OR 
    (select (auth.jwt()->>'is_admin')::boolean)
  );

-- ============================================================================
-- OPTIMIZE RLS POLICIES - PRODUCTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "View products" ON products;
CREATE POLICY "View products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK ((select (auth.jwt()->>'is_admin')::boolean));

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING ((select (auth.jwt()->>'is_admin')::boolean))
  WITH CHECK ((select (auth.jwt()->>'is_admin')::boolean));

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING ((select (auth.jwt()->>'is_admin')::boolean));

-- ============================================================================
-- OPTIMIZE RLS POLICIES - DISCLAIMER_ACCEPTANCES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "View disclaimer acceptances" ON disclaimer_acceptances;
CREATE POLICY "View disclaimer acceptances"
  ON disclaimer_acceptances
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR 
    (select (auth.jwt()->>'is_admin')::boolean)
  );

-- ============================================================================
-- OPTIMIZE RLS POLICIES - ORDERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "View orders" ON orders;
CREATE POLICY "View orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR 
    (select (auth.jwt()->>'is_admin')::boolean)
  );

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING ((select (auth.jwt()->>'is_admin')::boolean))
  WITH CHECK ((select (auth.jwt()->>'is_admin')::boolean));

-- ============================================================================
-- OPTIMIZE RLS POLICIES - ORDER_ITEMS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "View order items" ON order_items;
CREATE POLICY "View order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = (select auth.uid()) OR (select (auth.jwt()->>'is_admin')::boolean))
    )
  );

-- ============================================================================
-- OPTIMIZE RLS POLICIES - PAYMENT_TRANSACTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "View payment transactions" ON payment_transactions;
CREATE POLICY "View payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payment_transactions.order_id 
      AND (orders.user_id = (select auth.uid()) OR (select (auth.jwt()->>'is_admin')::boolean))
    )
  );

-- ============================================================================
-- OPTIMIZE RLS POLICIES - INVENTORY_ADJUSTMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage inventory adjustments" ON inventory_adjustments;
CREATE POLICY "Admins can manage inventory adjustments"
  ON inventory_adjustments
  FOR ALL
  TO authenticated
  USING ((select (auth.jwt()->>'is_admin')::boolean))
  WITH CHECK ((select (auth.jwt()->>'is_admin')::boolean));
