
import { Database } from '@/integrations/supabase/types';

// Extending types from the auto-generated Supabase types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Define order statuses
export type OrderStatus = 'pending' | 'processing' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';

// Define user roles
export type UserRole = 'customer' | 'admin' | 'delivery';

export interface ProfileType extends Tables<'profiles'> {
  role?: UserRole;
}

export interface AddressType extends Tables<'addresses'> {}

// Define ProductType with all necessary fields
export interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  rating?: number;
  num_reviews?: number;
  discountPercentage?: number;
  created_at: string;
  updated_at: string;
  // Add these properties to match Product type
  numReviews?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderType {
  id: string;
  user_id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount?: number;
  total: number;
  created_at: string;
  updated_at: string;
  tracking?: {
    events: {
      status: OrderStatus;
      timestamp: string;
      location?: string;
      note?: string;
      description?: string;
    }[];
    signature?: string;
    deliveredAt?: string;
    driver?: {
      id: string;
      name: string;
      phone: string;
      photo: string;
    };
  };
  delivery_method: {
    id: string;
    name: string;
    price: number;
    estimatedDays: number;
  };
  payment_method: {
    id: string;
    name: string;
    last4?: string;
  };
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  estimated_delivery: string;
  scheduled_delivery?: any;
  notes?: string;
  loyalty_points_earned?: number;
  loyalty_points_used?: number;
  promo_code?: string;
}
