export interface Property {
  id: string;
  owner_id: string;
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
  images?: string[];
  amenities?: string[];
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePropertyDto {
  title: string;
  description?: string;
  price: number;
  location: string;
  city: string;
  country: string;
  type: 'apartment' | 'house' | 'studio' | 'villa';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  amenities?: string[];
}

export interface PropertyFilters {
  city?: string;
  country?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  is_available?: boolean;
}