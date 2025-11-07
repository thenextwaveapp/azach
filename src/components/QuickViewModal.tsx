import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsInWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Product } from "@/types/product";
import { Link } from "react-router-dom";
import { useState } from "react";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: isInWishlist } = useIsInWishlist(product?.id || '');
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      category: product.category,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to add items to your wishlist',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(product.id);
        toast({
          title: 'Removed from wishlist',
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        await addToWishlist.mutateAsync(product.id);
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        variant: 'destructive',
      });
    }
  };

  const images = product.image_urls && product.image_urls.length > 0
    ? [product.image_url, ...product.image_urls]
    : [product.image_url];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div
              className="aspect-[3/4] overflow-hidden rounded-lg bg-muted relative cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <OptimizedImage
                src={images[selectedImageIndex]}
                alt={product.name}
                aspectRatio="portrait"
                priority={selectedImageIndex === 0}
                className="w-full h-full"
                style={{
                  transform: isHovering ? `scale(2)` : 'scale(1)',
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  transition: isHovering ? 'none' : 'transform 0.3s ease-out',
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`View ${index + 1}`}
                      aspectRatio="square"
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Availability</span>
                <span className={`font-medium ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`mr-2 h-5 w-5 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlist ? 'Saved' : 'Save'}
                </Button>
                <Link to={`/product/${product.id}`} className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

