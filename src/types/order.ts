export interface OrderItem {
    id: string;
    name: string;
    size: 'small' | 'medium' | 'large';
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    items: OrderItem[];
    totalPrice: number;
    timestamp: string;
    status: 'pending' | 'completed' | 'cancelled';
}

export interface CreateOrderRequest {
    items: Omit<OrderItem, 'id'>[];
}

export interface CreateOrderResponse {
    success: boolean;
    orderId: string;
    timestamp: string;
    message: string;
}
