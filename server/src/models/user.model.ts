export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'renter' | 'owner' | 'admin';
  avatar_url?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  role?: 'renter' | 'owner';
}

export interface LoginDto {
  email: string;
  password: string;
}