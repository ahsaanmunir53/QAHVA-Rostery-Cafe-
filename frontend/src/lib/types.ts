export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: number;
  description: string;
  featured: boolean;
  soldOut: boolean;
  tag: string;
  image: string;
}

export interface CartLine { id: string; name: string; price: number; qty: number; }

export interface PublicSettings {
  phone: string; whatsapp: string; email: string; address: string; hours: string;
  deliveryFee: number; freeOver: number; openForOrders: boolean;
}

export interface Testimonial { id: string; name: string; text: string; stars: number; approved?: boolean; }
export interface GalleryItem { id: string; title: string; url: string; }
export interface Message { id: string; at: string; name: string; phone: string; message: string; }

export interface Order {
  id: string; createdAt: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  type: 'Pickup' | 'Delivery';
  customer: { name: string; phone: string; address: string; notes: string };
  items: { id: string; name: string; price: number; qty: number; lineTotal: number }[];
  subtotal: number; deliveryFee: number; total: number;
}

export interface AdminSettings extends PublicSettings {}

export interface Stats {
  total: number; pending: number; preparing: number; ready: number; completed: number; cancelled: number;
  today: number; monthRevenue: number; messages: number; recent: Order[];
}
