export interface RecyclabilityResult {
  recyclable: boolean;
  confidence: number;
  materials: Material[];
  disposalInstructions: string;
  environmentalImpact: string;
}

export interface Material {
  name: string;
  recyclable: boolean;
  percentage: number;
}

export interface ScanHistory {
  id: string;
  user_id: string;
  device_name: string;
  image_url: string;
  result: RecyclabilityResult;
  created_at: string;
}

export interface DeviceGiveaway {
  id: string;
  user_id: string;
  device_name: string;
  description: string;
  condition: string;
  image_url: string;
  location: string;
  status: 'available' | 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ChatRoom {
  id: string;
  user_id: string;
  admin_id?: string;
  title: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}