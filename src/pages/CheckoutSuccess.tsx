import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart after successful checkout
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <CheckCircle className="h-24 w-24 text-green-600 mx-auto" />
          <h1 className="text-4xl font-bold">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

          {sessionId && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Order Reference</p>
              <p className="font-mono text-sm mt-1">{sessionId}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            You will receive an email confirmation shortly with your order details.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              onClick={() => navigate('/orders')}
            >
              View Orders
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
