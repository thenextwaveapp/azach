import { useQuery } from '@tanstack/react-query';
import { orderService, type OrderWithItems } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery<OrderWithItems[]>({
    queryKey: ['orders', user?.id],
    queryFn: () => orderService.getUserOrders(),
    enabled: !!user,
  });
};

export const useOrder = (orderId: string) => {
  const { user } = useAuth();

  return useQuery<OrderWithItems | null>({
    queryKey: ['order', orderId, user?.id],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!user && !!orderId,
  });
};

