import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { createDHLShipment } from '@/lib/dhl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  useAllOrders,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateShippingInfo,
  useUpdateOrderNotes,
} from '@/hooks/useAdminOrders';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  LogOut,
  Package,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Order, OrderWithItems } from '@/services/orderService';

const OrdersAdmin = () => {
  useEffect(() => {
    document.title = 'Orders Management - AZACH Admin';
  }, []);

  const { data: orders, isLoading } = useAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const updateShippingInfo = useUpdateShippingInfo();
  const updateOrderNotes = useUpdateOrderNotes();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<'created_at' | 'total' | 'status' | 'payment_status' | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [shippingFormData, setShippingFormData] = useState({
    dhl_tracking_number: '',
    dhl_shipment_id: '',
    dhl_label_url: '',
    estimated_delivery_date: '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);

  const handleCreateShipment = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.dhl_tracking_number) {
      toast({
        title: 'Shipment Already Created',
        description: `Tracking number: ${selectedOrder.dhl_tracking_number}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingShipment(true);
      const result = await createDHLShipment(selectedOrder.id);

      setShippingFormData({
        dhl_tracking_number: result.trackingNumber,
        dhl_shipment_id: result.shipmentId,
        dhl_label_url: result.labelUrl || '',
        estimated_delivery_date: shippingFormData.estimated_delivery_date,
      });

      toast({
        title: 'Success',
        description: 'DHL shipment created successfully!',
      });

      // Refresh order data
      setIsDetailsOpen(false);
      setTimeout(() => setIsDetailsOpen(true), 100);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create DHL shipment',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingShipment(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    });
    navigate('/');
  };

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const handleViewDetails = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShippingFormData({
      dhl_tracking_number: order.dhl_tracking_number || '',
      dhl_shipment_id: order.dhl_shipment_id || '',
      dhl_label_url: order.dhl_label_url || '',
      estimated_delivery_date: order.estimated_delivery_date
        ? new Date(order.estimated_delivery_date).toISOString().split('T')[0]
        : '',
    });
    setOrderNotes(order.notes || '');
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: Order['payment_status']) => {
    try {
      await updatePaymentStatus.mutateAsync({ orderId, paymentStatus });
      toast({
        title: 'Success',
        description: 'Payment status updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const handleShippingUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await updateShippingInfo.mutateAsync({
        orderId: selectedOrder.id,
        shippingInfo: {
          dhl_tracking_number: shippingFormData.dhl_tracking_number || undefined,
          dhl_shipment_id: shippingFormData.dhl_shipment_id || undefined,
          dhl_label_url: shippingFormData.dhl_label_url || undefined,
          estimated_delivery_date: shippingFormData.estimated_delivery_date || undefined,
        },
      });
      toast({
        title: 'Success',
        description: 'Shipping information updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update shipping information',
        variant: 'destructive',
      });
    }
  };

  const handleNotesUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrderNotes.mutateAsync({
        orderId: selectedOrder.id,
        notes: orderNotes,
      });
      toast({
        title: 'Success',
        description: 'Order notes updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order notes',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = orders
    ?.filter((order) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const shippingAddress = order.shipping_address as any;
      const billingAddress = order.billing_address as any;

      return (
        order.id.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order.payment_status.toLowerCase().includes(query) ||
        order.payment_provider.toLowerCase().includes(query) ||
        shippingAddress?.name?.toLowerCase().includes(query) ||
        shippingAddress?.email?.toLowerCase().includes(query) ||
        billingAddress?.name?.toLowerCase().includes(query) ||
        order.dhl_tracking_number?.toLowerCase().includes(query) ||
        order.order_items.some((item) => item.product_name.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;

      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortColumn === 'total') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortColumn === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'failed':
      case 'refunded':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-semibold">Orders Management</h1>
              {user && (
                <p className="text-sm text-muted-foreground mt-1">Logged in as: {user.email}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <Package className="mr-2 h-4 w-4" />
                Products
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by order ID, customer, tracking number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>
            {orders && orders.length > 0 && (
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {searchQuery
                  ? `Showing ${filteredOrders?.length || 0} of ${orders.length} orders`
                  : `${orders.length} total orders`}
              </p>
            )}
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer & Address</TableHead>
                <TableHead>Items</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Date
                    <SortIcon column="created_at" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center">
                    Total
                    <SortIcon column="total" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon column="status" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('payment_status')}
                >
                  <div className="flex items-center">
                    Payment
                    <SortIcon column="payment_status" />
                  </div>
                </TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const shippingAddress = order.shipping_address as any;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[200px]">
                          <p className="font-medium">{shippingAddress?.name || 'N/A'}</p>
                          <p className="text-muted-foreground text-xs truncate">
                            {shippingAddress?.email || ''}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {shippingAddress?.phone || ''}
                          </p>
                          <p className="text-muted-foreground text-xs truncate">
                            {shippingAddress?.city}, {shippingAddress?.country}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1 max-w-[150px]">
                          {order.order_items.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="truncate">
                              {item.quantity}× {item.product_name}
                            </p>
                          ))}
                          {order.order_items.length > 2 && (
                            <p className="text-muted-foreground">
                              +{order.order_items.length - 2} more
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value as Order['status'])}
                        >
                          <SelectTrigger className="w-32">
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.payment_status}
                          onValueChange={(value) =>
                            handlePaymentStatusUpdate(order.id, value as Order['payment_status'])
                          }
                        >
                          <SelectTrigger className="w-28">
                            <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                              {order.payment_status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {order.dhl_tracking_number ? (
                          <span className="text-xs font-mono">{order.dhl_tracking_number}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No tracking</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(order)}
                          title="View full details"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? (
                      <div className="space-y-2">
                        <p>No orders match your search "{searchQuery}"</p>
                        <Button variant="link" onClick={() => setSearchQuery('')}>
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      'No orders found'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Order #{selectedOrder?.id.slice(0, 8)}</DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="text-sm space-y-1">
                      <p>{(selectedOrder.shipping_address as any)?.name}</p>
                      <p>{(selectedOrder.shipping_address as any)?.address}</p>
                      <p>
                        {(selectedOrder.shipping_address as any)?.city},{' '}
                        {(selectedOrder.shipping_address as any)?.state}{' '}
                        {(selectedOrder.shipping_address as any)?.postalCode}
                      </p>
                      <p>{(selectedOrder.shipping_address as any)?.country}</p>
                      <p className="text-muted-foreground">
                        {(selectedOrder.shipping_address as any)?.email}
                      </p>
                      <p className="text-muted-foreground">
                        {(selectedOrder.shipping_address as any)?.phone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Payment Info</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        Provider:{' '}
                        <span className="font-mono">{selectedOrder.payment_provider}</span>
                      </p>
                      {selectedOrder.stripe_session_id && (
                        <p className="text-xs">
                          Stripe: {selectedOrder.stripe_session_id.slice(0, 20)}...
                        </p>
                      )}
                      {selectedOrder.paystack_reference && (
                        <p className="text-xs">
                          Paystack: {selectedOrder.paystack_reference}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Info Form */}
                <div>
                  <h3 className="font-semibold mb-3">DHL Shipping Information</h3>

                  {/* Create Shipment Button */}
                  {!selectedOrder?.dhl_tracking_number && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 mb-3">
                        No shipment created yet. Create a DHL shipment to automatically generate a label and tracking number.
                      </p>
                      <Button
                        onClick={handleCreateShipment}
                        disabled={isCreatingShipment}
                        className="w-full"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {isCreatingShipment ? 'Creating Shipment...' : 'Create DHL Shipment'}
                      </Button>
                    </div>
                  )}

                  {selectedOrder?.dhl_tracking_number && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-semibold">
                        ✓ Shipment Created
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Tracking: {selectedOrder.dhl_tracking_number}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="tracking">Tracking Number</Label>
                      <Input
                        id="tracking"
                        value={shippingFormData.dhl_tracking_number}
                        onChange={(e) =>
                          setShippingFormData({
                            ...shippingFormData,
                            dhl_tracking_number: e.target.value,
                          })
                        }
                        placeholder="Enter DHL tracking number"
                        readOnly={!!selectedOrder?.dhl_tracking_number}
                        className={selectedOrder?.dhl_tracking_number ? 'bg-gray-100' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipment">Shipment ID</Label>
                      <Input
                        id="shipment"
                        value={shippingFormData.dhl_shipment_id}
                        onChange={(e) =>
                          setShippingFormData({
                            ...shippingFormData,
                            dhl_shipment_id: e.target.value,
                          })
                        }
                        placeholder="Enter DHL shipment ID"
                        readOnly={!!selectedOrder?.dhl_tracking_number}
                        className={selectedOrder?.dhl_tracking_number ? 'bg-gray-100' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="label">Label URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="label"
                          value={shippingFormData.dhl_label_url}
                          onChange={(e) =>
                            setShippingFormData({
                              ...shippingFormData,
                              dhl_label_url: e.target.value,
                            })
                          }
                          placeholder="Enter DHL label URL or create shipment"
                          readOnly={!!selectedOrder?.dhl_tracking_number}
                          className={selectedOrder?.dhl_tracking_number ? 'bg-gray-100' : ''}
                        />
                        {shippingFormData.dhl_label_url && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              window.open(shippingFormData.dhl_label_url, '_blank')
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="delivery">Estimated Delivery Date</Label>
                      <Input
                        id="delivery"
                        type="date"
                        value={shippingFormData.estimated_delivery_date}
                        onChange={(e) =>
                          setShippingFormData({
                            ...shippingFormData,
                            estimated_delivery_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={handleShippingUpdate}
                      disabled={updateShippingInfo.isPending}
                      className="w-full"
                    >
                      {updateShippingInfo.isPending
                        ? 'Updating...'
                        : 'Update Shipping Information'}
                    </Button>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="font-semibold mb-3">Admin Notes</h3>
                  <div className="space-y-3">
                    <Textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Add internal notes about this order..."
                      rows={4}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleNotesUpdate}
                      disabled={updateOrderNotes.isPending}
                      variant="secondary"
                      className="w-full"
                    >
                      {updateOrderNotes.isPending ? 'Saving...' : 'Save Notes'}
                    </Button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrdersAdmin;
