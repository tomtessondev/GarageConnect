export interface SearchFilters {
  width?: number;
  height?: number;
  diameter?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    sku: string;
    brand: string;
    model: string;
    width: number;
    height: number;
    diameter: number;
    priceRetail: number;
    isOverstock: boolean;
    discountPercent?: number | null;
  };
}

export interface CreateOrderData {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  totalAmount: number;
}

export interface WhatsAppMessage {
  from: string;
  body: string;
  messageId: string;
}
