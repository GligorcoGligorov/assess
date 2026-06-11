export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'renter' | 'owner' | 'admin';
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  city: string;
  country: string;
  type: 'apartment' | 'house' | 'studio' | 'villa';
  bedrooms: number;
  bathrooms: number;
  area?: number;
  images: string[];
  amenities: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  property_title: string;
  renter_id: string;
  renter_name?: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}