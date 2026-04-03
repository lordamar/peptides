# Research Peptide E-Commerce Platform

A comprehensive e-commerce platform for research peptides with strict compliance measures, account gating, and three-stage disclaimer system.

## Features

### Core Functionality
- **Account-Gated Access**: Users must create accounts and be approved before viewing products
- **Three-Stage Disclaimer System**:
  1. Product View: Disclaimer modal appears when viewing product details
  2. Add to Cart: Disclaimer required when adding items to cart
  3. Checkout: Final comprehensive disclaimer before order placement
- **International Shipping**: Flat rate $70 USD worldwide shipping
- **Product Catalog**: 119+ research peptides organized by category
- **Admin Dashboard**: User approval and order management system

### Security & Compliance
- Row Level Security (RLS) on all database tables
- Disclaimer acceptance logging with timestamps
- Account status tracking (pending/approved/rejected)
- Research-use-only disclaimers throughout the platform

### User Experience
- Responsive design for mobile, tablet, and desktop
- Product search and filtering by category
- Shopping cart with quantity management
- Order history and tracking
- International address support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Stripe integration ready (requires configuration)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (already configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Database Setup

The database schema has been created with the following tables:
- `users` - Extended user profiles with account status
- `products` - Product catalog with pricing and inventory
- `product_categories` - Product organization
- `cart_items` - Shopping cart items
- `addresses` - International shipping addresses
- `orders` - Order records
- `order_items` - Order line items
- `disclaimer_acceptances` - Disclaimer tracking
- `payment_transactions` - Payment records
- `inventory_adjustments` - Inventory management

## Creating an Admin User

To create an admin user:

1. Register a new account through the website
2. Run this SQL in Supabase SQL Editor:

```sql
UPDATE users
SET is_admin = true, account_status = 'approved'
WHERE id = 'YOUR_USER_ID';
```

Replace 'YOUR_USER_ID' with your actual user ID from the auth.users table.

## User Flow

### For Customers
1. **Registration**: Create account with full name, institution, and country
2. **Approval**: Wait for admin to approve account (status: pending → approved)
3. **Browse**: Access product catalog after approval
4. **View Product**: Accept first disclaimer to view product details
5. **Add to Cart**: Accept second disclaimer when adding to cart
6. **Checkout**: Enter shipping address and accept final disclaimers
7. **Order Confirmation**: Receive order number and confirmation

### For Admins
1. **Login**: Access admin dashboard
2. **Approve Users**: Review and approve/reject pending researcher accounts
3. **Manage Orders**: View orders, update status, and track fulfillment

## Product Categories

- **Weight Management**: Semaglutide, Tirzepatide, Retatrutide, etc.
- **Healing & Recovery**: BPC-157, TB-500, combinations
- **Growth Factors**: HGH, IGF, CJC-1295, Ipamorelin
- **Cosmetic Peptides**: GHK-CU, Melanotan 2
- **Specialized Research**: Advanced research peptides
- **Accessories**: Bacteriostatic water and supplies

## Disclaimer System

The platform implements a three-stage disclaimer system to ensure legal compliance:

1. **Product View Disclaimer**: Required before viewing any product details
2. **Add to Cart Disclaimer**: Required before adding items to shopping cart
3. **Checkout Disclaimer**: Final comprehensive disclaimer with three checkboxes:
   - Products are for research purposes only
   - Products are NOT for human consumption
   - User is a qualified researcher with authorization

All disclaimer acceptances are logged with timestamps for legal records.

## Shipping

- **Flat Rate**: $70 USD to any worldwide destination
- **International Support**: Full international address fields
- **Order Tracking**: Admin can update order status and add tracking numbers

## Important Notes

### Legal Compliance
- All products are marked "FOR RESEARCH USE ONLY"
- Persistent disclaimers throughout the platform
- Account approval required for all purchases
- Comprehensive disclaimer logging

### Account Statuses
- **Pending**: New registrations awaiting admin approval
- **Approved**: Full access to products and purchasing
- **Rejected**: Account denied, no access to products

## Customization

### Adding Products
Products can be added via SQL or through the Supabase dashboard:

```sql
INSERT INTO products (
  sku, product_name, specification, cost_price, sell_price,
  category_id, description, stock_quantity
) VALUES (
  'NEWSKU', 'Product Name', '10mg*10vials', 50.00, 60.00,
  'category_id_here', 'Product description', 100
);
```

### Updating Shipping Fee
The $70 shipping fee is defined in:
- `src/pages/CartPage.tsx`
- `src/pages/CheckoutPage.tsx`
- Database default in `orders` table

### Stripe Integration
To enable payment processing:
1. Add Stripe publishable key to `.env`
2. Implement Stripe Checkout in `CheckoutPage.tsx`
3. Create Stripe webhook handler for payment confirmation

## Support

For issues or questions, check the Supabase dashboard for database logs and authentication issues.

## License

Proprietary - All rights reserved
