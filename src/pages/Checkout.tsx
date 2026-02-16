import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { createCheckoutSession, stripePromise } from '@/lib/stripe';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShippingAddress {
  email: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const COUNTRIES = [
  'Canada',
  'United States'
];

const FREE_SHIPPING_THRESHOLD = 3;
const SHIPPING_COST_CAD = 15; // Base shipping cost in CAD

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems } = useCart();
  const { user } = useAuth();
  const { formatPrice, currency, convertPrice } = useCurrency();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    email: user?.email || '',
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Canada',
  });

  // Set page title
  useEffect(() => {
    document.title = "Checkout - AZACH";
  }, []);

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setShippingAddress(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const totalItems = getTotalItems();
  const isFreeShipping = totalItems >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST_CAD;
  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;

  useEffect(() => {
    // Redirect to cart if empty
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleCheckout = async () => {
    try {
      // Validate shipping address
      if (!shippingAddress.email || !shippingAddress.fullName || !shippingAddress.addressLine1 ||
          !shippingAddress.city || !shippingAddress.state ||
          !shippingAddress.postalCode || !shippingAddress.country) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all required shipping address fields.',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);

      // Convert all items to the selected currency
      const itemsInSelectedCurrency = items.map(item => ({
        ...item,
        price: convertPrice(item.price) // Convert CAD (DB) to selected currency
      }));

      // Add shipping as a line item if not free (also converted)
      const convertedShippingCost = convertPrice(shippingCost);
      if (shippingCost > 0) {
        itemsInSelectedCurrency.push({
          id: 'shipping',
          name: 'Shipping',
          price: convertedShippingCost,
          quantity: 1,
          image: '',
          category: 'shipping',
        });
      }

      // Send prices in the selected currency to Stripe
      const { url } = await createCheckoutSession(
        itemsInSelectedCurrency,
        user?.email,
        currency, // Charge in the user's selected currency
        shippingAddress
      );

      // Redirect to Stripe Checkout URL
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Shipping Address Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                    disabled={!!user}
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    placeholder="Apt 4B"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="NY"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={shippingAddress.country}
                      onValueChange={(value) => setShippingAddress({ ...shippingAddress, country: value })}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-muted rounded-lg p-6 mb-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={isFreeShipping ? 'text-green-600 font-semibold' : ''}>
                      {isFreeShipping ? 'FREE' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {isFreeShipping && (
                    <p className="text-xs text-green-600">
                      🎉 You've qualified for free shipping!
                    </p>
                  )}
                  {!isFreeShipping && totalItems < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-muted-foreground">
                      Add {FREE_SHIPPING_THRESHOLD - totalItems} more item{FREE_SHIPPING_THRESHOLD - totalItems > 1 ? 's' : ''} for free shipping
                    </p>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  You will be redirected to Stripe to complete your payment securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
