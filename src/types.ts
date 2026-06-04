export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  isFeatured?: boolean;
  storeId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: string;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'In Transit' | 'Delivered';

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  discountCode?: string;
  backgroundColor: string;
  storeId?: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  trackingNumber?: string;
  shippingAddress: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'promotion' | 'event' | 'system';
  timestamp: string;
  isRead: boolean;
  link?: string;
}
