import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string
          institution: string | null
          country: string | null
          account_status: 'pending' | 'approved' | 'rejected'
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          institution?: string | null
          country?: string | null
          account_status?: 'pending' | 'approved' | 'rejected'
          is_admin?: boolean
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          product_name: string
          specification: string | null
          cost_price: number
          sell_price: number
          category_id: string | null
          description: string | null
          research_applications: string | null
          storage_requirements: string | null
          reconstitution_guide: string | null
          stock_quantity: number
          low_stock_threshold: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          display_order: number
          created_at: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_sku: string
          quantity: number
          disclaimer_acknowledged: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          product_sku: string
          quantity: number
          disclaimer_acknowledged?: boolean
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          address_type: 'shipping' | 'billing'
          full_name: string
          street_address: string
          city: string
          state_province: string | null
          postal_code: string
          country: string
          phone_number: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          address_type?: 'shipping' | 'billing'
          full_name: string
          street_address: string
          city: string
          state_province?: string | null
          postal_code: string
          country: string
          phone_number: string
          is_default?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          subtotal: number
          shipping_fee: number
          total: number
          order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          shipping_address_id: string | null
          tracking_number: string | null
          payment_intent_id: string | null
          checkout_disclaimer_accepted: boolean
          created_at: string
          updated_at: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_sku: string
          product_name: string
          specification: string | null
          quantity: number
          price_at_purchase: number
          line_total: number
        }
      }
    }
  }
}
