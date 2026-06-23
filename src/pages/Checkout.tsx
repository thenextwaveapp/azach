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
import { initializePaystackTransaction, loadPaystackScript, openPaystackPopup } from '@/lib/paystack';
import { getDHLRates, calculateCartHash, formatDeliveryEstimate, type DHLShippingRate } from '@/lib/dhl';
import { Loader2, Package, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShippingAddress {
  email: string;
  fullName: string;
  address: string; // Combined address line
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Expanded country list for global shipping
const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AU', name: 'Australia' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IN', name: 'India' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'CH', name: 'Switzerland' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingRates, setShippingRates] = useState<DHLShippingRate[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<DHLShippingRate | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    email: user?.email || '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'NG', // Default to Nigeria
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

  // Load Paystack script on mount
  useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  // Fetch shipping rates when destination changes
  useEffect(() => {
    const fetchShippingRates = async () => {
      if (!shippingAddress.country || !shippingAddress.city || !shippingAddress.postalCode || items.length === 0) return;

      setLoadingShipping(true);
      setShippingRates([]);
      setSelectedShippingRate(null);

      try {
        const cartItems = items.map(item => ({
          id: item.id,
          quantity: item.quantity,
        }));

        const result = await getDHLRates({
          destinationCountry: shippingAddress.country,
          destinationPostalCode: shippingAddress.postalCode || undefined,
          destinationCity: shippingAddress.city || undefined,
          items: cartItems,
        });

        setShippingRates(result.rates);

        // Auto-select cheapest rate
        if (result.rates.length > 0) {
          const cheapest = result.rates.sort((a, b) => a.totalPrice - b.totalPrice)[0];
          setSelectedShippingRate(cheapest);
        }
      } catch (error: any) {
        console.error('Error fetching shipping rates:', error);
        toast({
          title: 'Shipping rates unavailable',
          description: error.message || 'Could not calculate shipping. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingShipping(false);
      }
    };

    // Debounce shipping rate fetch
    const timeoutId = setTimeout(fetchShippingRates, 800);
    return () => clearTimeout(timeoutId);
  }, [shippingAddress.country, shippingAddress.postalCode, shippingAddress.city, items]);

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  // TEMPORARY: Disable shipping cost for testing
  const shippingCost = 0; // selectedShippingRate?.totalPrice || 0;
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
      if (!shippingAddress.email || !shippingAddress.fullName || !shippingAddress.address ||
          !shippingAddress.city || !shippingAddress.state ||
          !shippingAddress.postalCode || !shippingAddress.country) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all required shipping address fields.',
          variant: 'destructive',
        });
        return;
      }

      // TEMPORARY: Commented out for testing
      // Validate shipping rate selected
      // if (!selectedShippingRate) {
      //   toast({
      //     title: 'No shipping method selected',
      //     description: 'Please wait for shipping rates to load or select a shipping method.',
      //     variant: 'destructive',
      //   });
      //   return;
      // }

      setLoading(true);

      // Prepare cart items (prices are already in NGN from database)
      const cartItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price, // Already in NGN
        quantity: item.quantity,
        image: item.image,
      }));

      // Initialize Paystack transaction
      const checkoutData = await initializePaystackTransaction(
        cartItems,
        shippingAddress.email,
        'NGN', // Always use NGN for Paystack (Nigerian gateway)
        shippingAddress,
        shippingCost
      );

      // Open Paystack popup
      openPaystackPopup(
        checkoutData,
        shippingAddress.email,
        total,
        (reference: string) => {
          // Payment successful - redirect to success page
          navigate(`/checkout/success?reference=${reference}`);
        },
        () => {
          // Payment cancelled
          setLoading(false);
          toast({
            title: 'Payment cancelled',
            description: 'You cancelled the payment. Your cart is still saved.',
          });
        }
      );
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
          <h1 className="text-4xl font-semibold mb-8">Checkout</h1>

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
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Lagos"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="Lagos"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    placeholder="100001"
                    required
                  />
                </div>
              </div>

              {/* Shipping Options */}
              {shippingAddress.country && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Method
                  </h3>
                  {loadingShipping ? (
                    <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Calculating shipping rates...</span>
                    </div>
                  ) : shippingRates.length > 0 ? (
                    <div className="space-y-2">
                      {shippingRates.map((rate, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedShippingRate?.productCode === rate.productCode
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedShippingRate(rate)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{rate.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                Estimated: {formatDeliveryEstimate(rate.estimatedDeliveryDays)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPrice(rate.totalPrice)}</p>
                              <p className="text-xs text-muted-foreground">
                                {rate.estimatedDeliveryDays} {rate.estimatedDeliveryDays === 1 ? 'day' : 'days'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-muted rounded-lg text-center text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Enter your postal code to see shipping options</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-muted rounded-lg p-6 mb-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
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
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    {loadingShipping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedShippingRate ? (
                      <span>{formatPrice(shippingCost)}</span>
                    ) : (
                      <span className="text-muted-foreground">Calculate</span>
                    )}
                  </div>
                  {selectedShippingRate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      via {selectedShippingRate.productName}
                    </p>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleCheckout}
                  disabled={loading || loadingShipping}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay with Paystack'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Secure payment powered by Paystack. Your payment information is encrypted and secure.
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
