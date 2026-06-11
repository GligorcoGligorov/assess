export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: Date;
}

export interface CreateMessageDto {
  receiver_id: string;
  property_id: string;
  content: string;
}