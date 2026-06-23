import { supabase } from '@/lib/supabase';

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  shipping_address: any;
  billing_address: any;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_provider: 'stripe' | 'paystack';
  paystack_reference: string | null;
  stripe_session_id: string | null;
  dhl_tracking_number: string | null;
  dhl_shipment_id: string | null;
  dhl_label_url: string | null;
  estimated_delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export const orderService = {
  // Get all orders for the current user
  async getUserOrders(): Promise<OrderWithItems[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;
    if (!orders || orders.length === 0) return [];

    // Get order items for each order
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) throw itemsError;

    // Combine orders with their items
    const ordersWithItems: OrderWithItems[] = orders.map(order => ({
      ...order,
      order_items: orderItems?.filter(item => item.order_id === order.id) || []
    }));

    return ordersWithItems;
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError) throw orderError;
    if (!order) return null;

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
      ...order,
      order_items: orderItems || []
    };
  },

  // ADMIN FUNCTIONS
  // Get all orders (admin only)
  async getAllOrders(): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithItems[];
  },

  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment status (admin only)
  async updatePaymentStatus(orderId: string, paymentStatus: Order['payment_status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update shipping info (admin only)
  async updateShippingInfo(
    orderId: string,
    shippingInfo: {
      dhl_tracking_number?: string;
      dhl_shipment_id?: string;
      dhl_label_url?: string;
      estimated_delivery_date?: string;
    }
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...shippingInfo, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update order notes (admin only)
  async updateOrderNotes(orderId: string, notes: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

