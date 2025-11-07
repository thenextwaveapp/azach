import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import { productToDisplay } from '@/utils/productHelpers';
import { useEffect } from 'react';

const Wishlist = () => {
  // Set page title
  useEffect(() => {
    document.title = "Wishlist - AZACH";
  }, []);
  const { user } = useAuth();
  const { data: wishlistData = [], isLoading } = useWishlist();

  const wishlistItems = wishlistData.map((item: any) =>
    item.products ? productToDisplay(item.products) : null
  ).filter(Boolean);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Start adding items to your wishlist
              </p>
              <Button asChild>
                <Link to="/">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

