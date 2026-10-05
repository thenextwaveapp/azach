import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { trackPurchase } from '@/lib/analytics';

type VerifyState = 'verifying' | 'success' | 'failed';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Paystack uses 'trxref' or 'reference' parameter
  const reference = searchParams.get('trxref') || searchParams.get('reference') || searchParams.get('session_id');
  const { items, clearCart } = useCart();
  const [state, setState] = useState<VerifyState>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.title = "Order Confirmed - AZACH";
  }, []);

  useEffect(() => {
    if (!reference) {
      setState('failed');
      setErrorMessage('No payment reference found.');
      return;
    }

    // Actively confirms the order was recorded, rather than trusting that the webhook
    // fired — closes the gap where a webhook failure would otherwise leave a customer
    // who was actually charged with no order in the system.
    verifyPaystackTransaction(reference)
      .then((verification) => {
        // Paystack returns amount in kobo.
        trackPurchase(
          verification.reference,
          items.map((item) => ({
            item_id: String(item.id),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            item_category: item.category,
          })),
          verification.amount / 100,
          verification.currency
        );
        setState('success');
        clearCart();
      })
      .catch((error) => {
        console.error('Payment verification failed:', error);
        setState('failed');
        setErrorMessage(error instanceof Error ? error.message : 'Could not confirm your payment.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  if (state === 'verifying') {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Loader2 className="h-16 w-16 text-muted-foreground mx-auto animate-spin" />
            <h1 className="text-3xl font-semibold">Confirming your payment...</h1>
            <p className="text-muted-foreground">This only takes a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <AlertTriangle className="h-20 w-20 text-amber-500 mx-auto" />
            <h1 className="text-3xl font-semibold">We couldn't confirm this payment</h1>
            <p className="text-muted-foreground">
              {errorMessage} If you were charged, please contact us at{' '}
              <a href="mailto:info@azach.ng" className="text-primary hover:underline">info@azach.ng</a> with
              your payment reference and we'll sort it out right away.
            </p>
            {reference && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Payment Reference</p>
                <p className="font-mono text-sm mt-1">{reference}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" onClick={() => navigate('/')}>Continue Shopping</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <CheckCircle className="h-24 w-24 text-green-600 mx-auto" />
          <h1 className="text-4xl font-semibold">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

          {reference && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Order Reference</p>
              <p className="font-mono text-sm mt-1">{reference}</p>
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
