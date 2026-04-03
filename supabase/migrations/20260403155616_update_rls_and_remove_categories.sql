/*
  # Update RLS Policies and Remove Outcome-Based Categories

  ## Changes Made
  1. RLS Policy Updates
    - Add public read access to products table for anonymous users
    - Add public read access to product_categories table for anonymous users
    - Maintain existing authenticated and admin policies

  2. Data Cleanup
    - Remove all outcome-based category data (Weight Management, Healing & Recovery, etc.)
    - Products table structure remains unchanged
    - Remove category relationships from products first, then delete categories

  ## Security
  - Products and categories viewable by everyone (public data)
  - Product management still restricted to admins only
*/

-- Drop existing policies for products and recreate with public access
DROP POLICY IF EXISTS "Authenticated users can view active products" ON products;
DROP POLICY IF EXISTS "Anyone can view product categories" ON product_categories;

-- Allow anonymous and authenticated users to view active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Allow anonymous and authenticated users to view categories
CREATE POLICY "Public can view categories"
  ON product_categories FOR SELECT
  USING (true);

-- Set all product category_id to NULL FIRST (remove foreign key references)
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;

-- Now delete all existing categories (outcome-based)
DELETE FROM product_categories;