import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Calendar, DollarSign, MapPin, CreditCard, Truck, ArrowLeft } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { useCurrency } from '@/contexts/CurrencyContext';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { formatAsCurrency } = useCurrency();
  const { data: order, isLoading } = useOrder(orderId || '');

  useEffect(() => {
    document.title = `Order #${orderId?.slice(0, 8)} - AZACH`;
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">Loading order details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order not found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find this order.
              </p>
              <Button asChild>
                <Link to="/orders">Back to Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {order.status}
              </Badge>
              <Badge className={`${getPaymentStatusColor(order.payment_status)} text-white`}>
                {order.payment_status}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {order.shipping_address && (
                  <>
                    <p className="font-medium">{order.shipping_address.fullName}</p>
                    <p className="text-sm text-muted-foreground">{order.shipping_address.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.shipping_address.country}</p>
                    <p className="text-sm text-muted-foreground">{order.shipping_address.phone}</p>
                    <p className="text-sm text-muted-foreground">{order.shipping_address.email}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment & Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{order.payment_provider}</p>
                </div>
                {order.paystack_reference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Reference</p>
                    <p className="font-mono text-sm">{order.paystack_reference}</p>
                  </div>
                )}
                {(order.dhl_tracking_number || order.topship_tracking_id) && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Tracking Number
                    </p>
                    <p className="font-mono text-sm">{order.dhl_tracking_number || order.topship_tracking_id}</p>
                    {order.topship_tracking_url && (
                      <a
                        href={order.topship_tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline text-muted-foreground"
                      >
                        Track your shipment
                      </a>
                    )}
                  </div>
                )}
                {order.estimated_delivery_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">
                      {new Date(order.estimated_delivery_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-20 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price: {formatAsCurrency(item.price, order.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatAsCurrency(item.price * item.quantity, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatAsCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span>
                    <span>-{formatAsCurrency(order.discount_amount, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatAsCurrency(order.shipping_cost, order.currency)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatAsCurrency(order.tax, order.currency)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatAsCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
