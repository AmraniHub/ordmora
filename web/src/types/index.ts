export type UserRole = 'client' | 'admin' | 'manager' | 'delivery'

export interface Profile {
  id: string
  full_name: string
  username: string
  phone: string
  city: string
  delivery_address: string
  points_total: number
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'delivery'
  created_at: string
}

export type ProductCategory = 'parfums' | 'packs' | 'accessoires'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: ProductCategory
  points_value: number
  stock: number
  is_active: boolean
  created_at: string
}

export type OrderStatus = 'en_attente' | 'en_cours' | 'livree' | 'annulee'

export interface Order {
  id: string
  order_number: string
  client_id: string
  status: OrderStatus
  total_amount: number
  delivery_address: string
  notes?: string
  created_at: string
  updated_at: string
  profiles?: Profile
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  points_earned: number
  products?: Product
}

export type TransactionType = 'earned' | 'spent' | 'adjusted' | 'expired'

export interface WalletTransaction {
  id: string
  client_id: string
  points: number
  type: TransactionType
  description: string
  order_id?: string
  gift_redemption_id?: string
  expires_at?: string
  created_at: string
}

export interface Gift {
  id: string
  name: string
  description: string
  image_url: string
  points_required: number
  stock: number
  is_active: boolean
  created_at: string
}

export interface GiftRedemption {
  id: string
  client_id: string
  gift_id: string
  points_spent: number
  status: 'pending' | 'shipped' | 'delivered'
  created_at: string
  gifts?: Gift
  profiles?: Profile
}
