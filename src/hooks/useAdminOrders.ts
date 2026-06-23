import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, type Order, type OrderWithItems } from '@/services/orderService';

// Get all orders (admin)
export function useAllOrders() {
  return useQuery<OrderWithItems[]>({
    queryKey: ['admin-all-orders'],
    queryFn: () => orderService.getAllOrders(),
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
    },
  });
}

// Update payment status
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: Order['payment_status'] }) =>
      orderService.updatePaymentStatus(orderId, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
    },
  });
}

// Update shipping info
export function useUpdateShippingInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      shippingInfo,
    }: {
      orderId: string;
      shippingInfo: {
        dhl_tracking_number?: string;
        dhl_shipment_id?: string;
        dhl_label_url?: string;
        estimated_delivery_date?: string;
      };
    }) => orderService.updateShippingInfo(orderId, shippingInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
    },
  });
}

// Update order notes
export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes: string }) =>
      orderService.updateOrderNotes(orderId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
    },
  });
}
