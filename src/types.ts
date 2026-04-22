export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  type: 'text' | 'audio' | 'system' | 'order_card';
  audioUrl?: string;
  orderId?: string;
  orderData?: any;
}

export interface Driver {
  id: string;
  name: string;
  status: 'active' | 'on_route' | 'maintenance' | 'off';
  currentLocation: string;
  avatar?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  inventoryLevel: string;
  icon?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'typing';
  avatar: string;
}
