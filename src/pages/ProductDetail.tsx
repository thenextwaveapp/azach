import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useIsInWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { ProductReviews } from '@/components/ProductReviews';
import { RelatedProducts } from '@/components/RelatedProducts';
import { OptimizedImage } from '@/components/OptimizedImage';
import { ShoppingBag, ArrowLeft, Heart, ZoomIn, ZoomOut } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: isInWishlist } = useIsInWishlist(id || '');
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - AZACH`;
    } else {
      document.title = "Product - AZACH";
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      category: product.category,
    });

    toast({
      title: 'Added to cart',
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
      navigate('/login');
      return;
    }

    if (!product) return;

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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative">
              <div
                className={`aspect-[3/4] overflow-hidden rounded-lg bg-muted relative ${isZoomEnabled ? 'cursor-crosshair' : 'cursor-default'}`}
                onMouseMove={isZoomEnabled ? handleMouseMove : undefined}
                onMouseEnter={isZoomEnabled ? () => setIsHovering(true) : undefined}
                onMouseLeave={isZoomEnabled ? () => setIsHovering(false) : undefined}
              >
                <OptimizedImage
                  src={
                    product.image_urls && product.image_urls.length > 0
                      ? selectedImageIndex === 0
                        ? product.image_url
                        : product.image_urls[selectedImageIndex - 1]
                      : product.image_url
                  }
                  alt={product.name}
                  aspectRatio="portrait"
                  priority={selectedImageIndex === 0}
                  className="w-full h-full"
                  style={{
                    transform: isZoomEnabled && isHovering ? `scale(2)` : 'scale(1)',
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    transition: isZoomEnabled && isHovering ? 'none' : 'transform 0.3s ease-out',
                  }}
                />
              </div>

              {/* Wishlist and Zoom Buttons */}
              <div className="absolute top-4 right-4 z-50 flex gap-2">
                {/* Wishlist Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black hover:bg-gray-900 shadow-lg border-0"
                  onClick={handleToggleWishlist}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`h-5 w-5 text-white transition-colors ${isInWishlist ? 'fill-white' : ''}`} />
                </Button>

                {/* Zoom Toggle Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black hover:bg-gray-900 shadow-lg border-0"
                  onClick={() => setIsZoomEnabled(!isZoomEnabled)}
                  title={isZoomEnabled ? "Disable zoom" : "Enable zoom"}
                >
                  {isZoomEnabled ? <ZoomOut className="h-5 w-5 text-white" /> : <ZoomIn className="h-5 w-5 text-white" />}
                </Button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.image_urls && product.image_urls.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {/* Cover Image Thumbnail */}
                <button
                  onClick={() => setSelectedImageIndex(0)}
                  className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    selectedImageIndex === 0 ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <OptimizedImage
                    src={product.image_url}
                    alt="Cover"
                    aspectRatio="square"
                    className="w-full h-full"
                    loading="lazy"
                  />
                </button>

                {/* Additional Images Thumbnails */}
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index + 1)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                      selectedImageIndex === index + 1 ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <OptimizedImage
                      src={url}
                      alt={`View ${index + 2}`}
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
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="mb-8 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{product.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{product.category}</span>
              </div>
              {product.gender && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">{product.gender}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Availability</span>
                <span className={`font-medium ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-auto">
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-16 border-t">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        <div className="mt-16 pt-16 border-t">
          <RelatedProducts currentProduct={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
