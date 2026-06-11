export interface Booking {
  id: string;
  property_id: string;
  renter_id: string;
  check_in: Date;
  check_out: Date;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookingDto {
  property_id: string;
  check_in: string;
  check_out: string;
  message?: string;
}