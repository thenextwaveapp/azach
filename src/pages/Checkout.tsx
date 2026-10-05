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
import { useLiveExchangeRates } from '@/hooks/useLiveExchangeRate';
import { initializePaystackTransaction, loadPaystackScript, openPaystackPopup } from '@/lib/paystack';
import { getDHLRates, formatDeliveryEstimate } from '@/lib/dhl';
import { getTopshipRates } from '@/lib/topship';
import { Loader2, Package, Truck, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getFunctionErrorMessage } from '@/lib/functionError';
import { trackBeginCheckout } from '@/lib/analytics';

// One shipping option in the combined DHL + Topship list shown at checkout.
interface CheckoutShippingRate {
  provider: 'dhl' | 'topship';
  code: string; // DHL product code or Topship pricing tier — unique within a provider
  name: string;
  totalPrice: number; // NGN
  durationLabel: string;
  secondaryLabel: string;
}

interface ShippingAddress {
  email: string;
  fullName: string;
  phone: string;
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
  const { items, getTotalItems } = useCart();
  const { user, isAnonymous, loading: authLoading } = useAuth();
  const { currency, getPrice, formatAsCurrency } = useCurrency();
  const { data: rates, isLoading: ratesLoading } = useLiveExchangeRates();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingRates, setShippingRates] = useState<CheckoutShippingRate[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<CheckoutShippingRate | null>(null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentOff: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    email: (!isAnonymous && user?.email) ? user.email : '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '', // No default - user must select to avoid autofill conflicts
  });

  // Set page title
  useEffect(() => {
    document.title = "Checkout - AZACH";
  }, []);

  // Update email when user changes (but not for anonymous users)
  useEffect(() => {
    if (user?.email && !isAnonymous) {
      setShippingAddress(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user, isAnonymous]);

  // Load Paystack script on mount
  useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  // Clear location fields when country changes to prevent autofill conflicts
  const [previousCountry, setPreviousCountry] = useState<string>('');
  useEffect(() => {
    if (shippingAddress.country && previousCountry && shippingAddress.country !== previousCountry) {
      setShippingAddress(prev => ({
        ...prev,
        city: '',
        state: '',
        postalCode: '',
      }));
    }
    setPreviousCountry(shippingAddress.country);
  }, [shippingAddress.country]);

  // Fetch shipping rates when destination changes
  useEffect(() => {
    const fetchShippingRates = async () => {
      // Topship quotes on city + country; DHL additionally needs a postal code.
      if (!shippingAddress.country || !shippingAddress.city || !shippingAddress.postalCode || items.length === 0) return;

      setLoadingShipping(true);
      setShippingRates([]);
      setSelectedShippingRate(null);

      const cartItems = items.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));

      // Quote both providers in parallel — one failing shouldn't hide the other's rates.
      const [dhlResult, topshipResult] = await Promise.allSettled([
        getDHLRates({
          destinationCountry: shippingAddress.country,
          destinationPostalCode: shippingAddress.postalCode || undefined,
          destinationCity: shippingAddress.city || undefined,
          destinationAddressLine1: shippingAddress.address || undefined,
          items: cartItems,
        }),
        getTopshipRates({
          destinationCountry: shippingAddress.country,
          destinationCity: shippingAddress.city,
          items: cartItems,
        }),
      ]);

      const combined: CheckoutShippingRate[] = [];

      if (dhlResult.status === 'fulfilled') {
        for (const rate of dhlResult.value.rates) {
          combined.push({
            provider: 'dhl',
            code: rate.productCode,
            name: rate.productName,
            totalPrice: rate.totalPrice,
            durationLabel: `Estimated: ${formatDeliveryEstimate(rate.estimatedDeliveryDays)}`,
            secondaryLabel: `${rate.estimatedDeliveryDays} ${rate.estimatedDeliveryDays === 1 ? 'day' : 'days'}`,
          });
        }
      } else {
        console.error('Error fetching DHL rates:', dhlResult.reason);
      }

      if (topshipResult.status === 'fulfilled') {
        for (const rate of topshipResult.value.rates) {
          combined.push({
            provider: 'topship',
            code: rate.pricingTier,
            name: rate.mode,
            totalPrice: rate.totalPrice,
            durationLabel: rate.duration,
            secondaryLabel: rate.pricingTier.replace(/([a-z])([A-Z])/g, '$1 $2'),
          });
        }
      } else {
        console.error('Error fetching Topship rates:', topshipResult.reason);
      }

      combined.sort((a, b) => a.totalPrice - b.totalPrice);
      setShippingRates(combined);

      if (combined.length > 0) {
        setSelectedShippingRate(combined[0]); // cheapest overall
      } else {
        const reason = dhlResult.status === 'rejected' ? dhlResult.reason : topshipResult.status === 'rejected' ? topshipResult.reason : null;
        toast({
          title: 'Shipping rates unavailable',
          description: (reason as any)?.message || 'Could not calculate shipping. Please try again.',
          variant: 'destructive',
        });
      }

      setLoadingShipping(false);
    };

    // Debounce shipping rate fetch
    const timeoutId = setTimeout(fetchShippingRates, 800);
    return () => clearTimeout(timeoutId);
  }, [shippingAddress.country, shippingAddress.postalCode, shippingAddress.city, items]);

  const totalItems = getTotalItems();

  // Paystack only settles NGN on this account, so the actual charge is always NGN. We
  // still display — and base that NGN charge on — whatever currency the visitor is
  // browsing in, converting through the live rate rather than falling back to the
  // separately-stored NGN price.
  const getItemDisplayAmount = (item: (typeof items)[number]): number =>
    currency === 'NGN' ? item.price : (getPrice(item)?.amount ?? item.price);

  // Converts an amount already shown in the current display currency into NGN.
  const convertToNGN = (displayAmount: number): number => {
    if (currency === 'NGN' || !rates?.[currency]) return displayAmount;
    return (displayAmount / rates[currency]) * rates.NGN;
  };

  // Converts a raw NGN amount (e.g. the DHL shipping quote) into the current display currency.
  const convertFromNGN = (ngnAmount: number): number => {
    if (currency === 'NGN' || !rates?.[currency]) return ngnAmount;
    return (ngnAmount / rates.NGN) * rates[currency];
  };

  // The NGN amount actually charged for this item.
  const getItemChargeAmountNGN = (item: (typeof items)[number]): number =>
    currency === 'NGN' ? item.price : convertToNGN(getItemDisplayAmount(item));

  const subtotalDisplay = items.reduce((sum, item) => sum + getItemDisplayAmount(item) * item.quantity, 0);
  const shippingCostNGN = selectedShippingRate?.totalPrice || 0;
  const shippingCostDisplay = convertFromNGN(shippingCostNGN);

  const discountPercent = appliedDiscount?.percentOff ?? 0;
  const discountAmountDisplay = subtotalDisplay * (discountPercent / 100);
  const totalDisplay = subtotalDisplay - discountAmountDisplay + shippingCostDisplay;

  const subtotalChargeNGN = items.reduce((sum, item) => sum + getItemChargeAmountNGN(item) * item.quantity, 0);
  const discountAmountChargeNGN = subtotalChargeNGN * (discountPercent / 100);
  const totalChargeNGN = subtotalChargeNGN - discountAmountChargeNGN + shippingCostNGN;

  const handleApplyDiscount = async () => {
    const code = discountCodeInput.trim();
    if (!code) return;

    if (!shippingAddress.email) {
      setDiscountError('Enter your email above first.');
      return;
    }

    setApplyingDiscount(true);
    setDiscountError('');
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: { code, email: shippingAddress.email },
      });
      if (error) {
        setDiscountError(await getFunctionErrorMessage(error, 'Could not validate that code. Please try again.'));
        setAppliedDiscount(null);
        return;
      }

      if (!data?.valid) {
        setDiscountError(data?.error || 'Invalid discount code');
        setAppliedDiscount(null);
        return;
      }

      setAppliedDiscount({ code: data.code, percentOff: data.percentOff });
      toast({ title: 'Discount applied', description: `${data.percentOff}% off your order.` });
    } catch (error) {
      console.error('Discount validation error:', error);
      setDiscountError('Could not validate that code. Please try again.');
      setAppliedDiscount(null);
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput('');
    setDiscountError('');
  };

  // Waiting on the live rate before we can safely show/charge a non-NGN order.
  const ratePending = currency !== 'NGN' && ratesLoading;

  useEffect(() => {
    // Redirect to cart if empty
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (items.length === 0) return;
    trackBeginCheckout(
      items.map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        price: getItemDisplayAmount(item),
        quantity: item.quantity,
        item_category: item.category,
      })),
      subtotalDisplay,
      currency
    );
    // Fires once per checkout visit — item identity, not price/qty churn, should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async () => {
    try {
      // Ensure user is loaded
      if (!user?.id) {
        toast({
          title: 'Authentication required',
          description: 'Please wait while we set up your session...',
          variant: 'destructive',
        });
        return;
      }

      // Validate shipping address
      if (!shippingAddress.email || !shippingAddress.fullName || !shippingAddress.phone ||
          !shippingAddress.address || !shippingAddress.city || !shippingAddress.state ||
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

      // Cart items priced in NGN for the actual Paystack charge — converted from the
      // real USD price at the live rate when the order was shown/priced in USD.
      const cartItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: getItemChargeAmountNGN(item),
        quantity: item.quantity,
        image: item.image,
      }));

      // Use shipping address as billing address (can be enhanced later for separate billing)
      const billingAddress = shippingAddress;

      // Initialize Paystack transaction
      const checkoutData = await initializePaystackTransaction(
        cartItems,
        user.id, // Pass user_id (anonymous or authenticated)
        shippingAddress.email,
        'NGN', // Always NGN — no USD settlement account set up yet
        shippingAddress,
        shippingCostNGN,
        appliedDiscount?.code,
        selectedShippingRate?.provider,
        selectedShippingRate?.code
      );

      // Open Paystack popup
      openPaystackPopup(
        checkoutData,
        shippingAddress.email,
        totalChargeNGN,
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

      // Show the actual error message from the API
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

      toast({
        title: 'Checkout failed',
        description: errorMessage,
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
                    onChange={(e) => {
                      setShippingAddress({ ...shippingAddress, email: e.target.value });
                      if (appliedDiscount) handleRemoveDiscount();
                    }}
                    placeholder="your.email@example.com"
                    required
                    disabled={!!user && !isAnonymous}
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
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
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
                      {shippingRates.map((rate) => (
                        <div
                          key={`${rate.provider}-${rate.code}`}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedShippingRate?.provider === rate.provider && selectedShippingRate?.code === rate.code
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedShippingRate(rate)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{rate.name}</p>
                                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                  {rate.provider === 'dhl' ? 'DHL' : 'Topship'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{rate.durationLabel}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatAsCurrency(convertFromNGN(rate.totalPrice), currency)}
                              </p>
                              <p className="text-xs text-muted-foreground">{rate.secondaryLabel}</p>
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
                        {formatAsCurrency(getItemDisplayAmount(item) * item.quantity, currency)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 pb-2">
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <span>
                          Code <span className="font-semibold">{appliedDiscount.code}</span> applied — {appliedDiscount.percentOff}% off
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="text-muted-foreground hover:text-foreground underline text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <Input
                          value={discountCodeInput}
                          onChange={(e) => setDiscountCodeInput(e.target.value)}
                          placeholder="Discount code"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyDiscount}
                          disabled={applyingDiscount || !discountCodeInput.trim()}
                        >
                          {applyingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {discountError && <p className="text-xs text-destructive">{discountError}</p>}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                    <span>{formatAsCurrency(subtotalDisplay, currency)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Discount ({appliedDiscount.percentOff}%)</span>
                      <span>-{formatAsCurrency(discountAmountDisplay, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    {loadingShipping || ratePending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedShippingRate ? (
                      <span>{formatAsCurrency(shippingCostDisplay, currency)}</span>
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
                    <span>{formatAsCurrency(totalDisplay, currency)}</span>
                  </div>
                  {currency !== 'NGN' && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      Charged to your card in Naira at the current exchange rate.
                    </p>
                  )}
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleCheckout}
                  disabled={loading || loadingShipping || authLoading || ratePending || !user?.id}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading...
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
