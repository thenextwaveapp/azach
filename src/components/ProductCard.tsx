import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsInWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { Link } from "react-router-dom";
import { useState } from "react";
import { QuickViewModal } from "./QuickViewModal";
import { OptimizedImage } from "./OptimizedImage";
import { Product } from "@/types/product";

interface ProductCardProps {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  product?: Product; // Full product object for quick view
}

export const ProductCard = ({ id, name, price, image, category, product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: isInWishlist } = useIsInWishlist(String(id));
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      image,
      category,
    });
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to add items to your wishlist',
        variant: 'destructive',
      });
      return;
    }

    if (!product) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(product.id);
        toast({
          title: 'Removed from wishlist',
          description: `${name} has been removed from your wishlist.`,
        });
      } else {
        await addToWishlist.mutateAsync(product.id);
        toast({
          title: 'Added to wishlist',
          description: `${name} has been added to your wishlist.`,
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) {
      setQuickViewOpen(true);
    }
  };

  return (
    <>
    <Link to={`/product/${id}`}>
      <Card className="group overflow-hidden border-0 shadow-none cursor-pointer">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <OptimizedImage
              src={image}
              alt={name}
                aspectRatio="portrait"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 bg-white/90 hover:bg-white"
                  onClick={handleToggleWishlist}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-black'}`} />
                </Button>
                {product && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 bg-white/90 hover:bg-white"
                    onClick={handleQuickView}
                    title="Quick view"
                  >
                    <Eye className="h-4 w-4 text-black" />
                  </Button>
                )}
              </div>

            <Button
              size="icon"
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
          <div className="pt-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{category}</p>
            <h3 className="font-medium">{name}</h3>
            <p className="text-lg font-semibold">{formatPrice(price)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
      
      {product && (
        <QuickViewModal
          product={product}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      )}
    </>
  );
};
