import { useCart } from '@/contexts/CartContext';
import { Package, Truck } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 3;

export const ShippingBanner = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  // Don't show banner if cart is empty
  if (totalItems === 0) return null;

  // Free shipping unlocked
  if (totalItems >= FREE_SHIPPING_THRESHOLD) {
    return (
      <div className="bg-green-500 text-white py-2 px-4 text-center">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Truck className="h-4 w-4" />
          <p className="text-sm font-medium">
            Congratulations! You've unlocked FREE SHIPPING on your order!
          </p>
        </div>
      </div>
    );
  }

  // Show progress toward free shipping
  const itemsNeeded = FREE_SHIPPING_THRESHOLD - totalItems;
  const progressPercentage = (totalItems / FREE_SHIPPING_THRESHOLD) * 100;

  return (
    <div className="bg-black text-white py-2 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Package className="h-4 w-4" />
          <p className="text-sm font-medium">
            {itemsNeeded === 1 ? (
              <>Add <span className="font-bold">1 more item</span> to unlock FREE SHIPPING</>
            ) : (
              <>Add <span className="font-bold">{itemsNeeded} more items</span> to unlock FREE SHIPPING</>
            )}
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
