import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useProduct, useProductsByStyle, useBundleComponents, useBundleSiblings } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useIsInWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { ProductReviews } from '@/components/ProductReviews';
import { RelatedProducts } from '@/components/RelatedProducts';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ShoppingBag, ArrowLeft, Heart, ZoomIn, ZoomOut, Ruler, ChevronDown } from 'lucide-react';
import { trackAddToCart, trackAddToWishlist, trackViewItem } from '@/lib/analytics';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { addToCart } = useCart();
  const { currency, formatDisplayPrice, getPrice } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: isInWishlist } = useIsInWishlist(id || '');
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: stylePieces } = useProductsByStyle(product?.style_code, id || '');
  const { data: bundleComponents } = useBundleComponents(product?.is_bundle ? product.id : undefined);
  const { data: bundleSiblings } = useBundleSiblings(product?.bundle_id, id || '');
  const { data: parentBundle } = useProduct(product?.bundle_id || '');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - AZACH`;
    } else {
      document.title = "Product - AZACH";
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const display = getPrice(product);
    trackViewItem(
      {
        item_id: String(product.id),
        item_name: product.name,
        price: display?.amount ?? product.price,
        item_category: product.category,
      },
      currency
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Product structured data — lets Google show price/availability rich snippets in search
  // results. NGN is used as the canonical price since that's what actually gets charged.
  useEffect(() => {
    if (!product) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: [product.image_url, ...(product.image_urls || [])],
      sku: product.sku,
      brand: { "@type": "Brand", name: "AZACH" },
      offers: {
        "@type": "Offer",
        url: window.location.href,
        priceCurrency: "NGN",
        price: product.price,
        availability: product.in_stock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      category: product.category,
      currency_prices: product.currency_prices,
    });

    const display = getPrice(product);
    trackAddToCart(
      {
        item_id: String(product.id),
        item_name: product.name,
        price: display?.amount ?? product.price,
        item_category: product.category,
      },
      currency
    );

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

  // Swipe left/right on the main image to move between it and the additional images —
  // the desktop thumbnail rail has no touch equivalent on mobile.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, imageCount: number) => {
    if (touchStartX.current === null || imageCount <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 50;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      setSelectedImageIndex((prev) =>
        deltaX < 0 ? (prev + 1) % imageCount : (prev - 1 + imageCount) % imageCount
      );
    }
    touchStartX.current = null;
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
        const display = getPrice(product);
        trackAddToWishlist(
          {
            item_id: String(product.id),
            item_name: product.name,
            price: display?.amount ?? product.price,
            item_category: product.category,
          },
          currency
        );
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
            <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
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
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, (product.image_urls?.length ?? 0) + 1)}
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
                  aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-5 w-5 text-white transition-colors ${isInWishlist ? 'fill-white' : ''}`} />
                </Button>

                {/* Zoom Toggle Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black hover:bg-gray-900 shadow-lg border-0"
                  onClick={() => setIsZoomEnabled(!isZoomEnabled)}
                  aria-label={isZoomEnabled ? "Disable zoom" : "Enable zoom"}
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
              <h1 className="text-4xl font-semibold mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-semibold">
                  {formatDisplayPrice(product)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatDisplayPrice(product, 'original_price')}
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
              {product.size && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{product.size}</span>
                </div>
              )}
              {product.gender && product.gender.length > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">{product.gender.join(' + ')}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Material</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {product.measurements && (product.measurements.top_length_in || product.measurements.bottom_length_in || product.measurements.waist_in || product.measurements.chest_in || product.measurements.sleeve_in) && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-medium">
                    {[
                      product.measurements.top_length_in && `Top Length: ${product.measurements.top_length_in}in`,
                      product.measurements.bottom_length_in && `Bottom Length: ${product.measurements.bottom_length_in}in`,
                      product.measurements.chest_in && `Chest: ${product.measurements.chest_in}in`,
                      product.measurements.waist_in && `Waist: ${product.measurements.waist_in}in`,
                      product.measurements.sleeve_in && `Sleeve: ${product.measurements.sleeve_in}in`,
                    ].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Availability</span>
                <span className={`font-medium ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <Link
                to="/size-guide"
                className="flex items-center gap-1.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 w-fit"
              >
                <Ruler className="h-4 w-4" />
                Size Guide
              </Link>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-auto space-y-2">
              <div className="flex gap-2">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/cart')}
                >
                  View Cart
                </Button>
              </div>
              {product.custom_size_available && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/bespoke?style_code=${encodeURIComponent(product.style_code || '')}`)}
                >
                  <Ruler className="mr-2 h-5 w-5" />
                  Order Custom Size in This Style
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* This Set Includes (viewing the bundle itself) */}
        {product.is_bundle && bundleComponents && bundleComponents.length > 0 && (
          <div className="mt-16 pt-16 border-t">
            <h2 className="text-2xl font-semibold mb-2">This Set Includes</h2>
            <p className="text-muted-foreground mb-6">
              This set includes all the pieces shown below. You can also buy each piece separately if you prefer.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bundleComponents.map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => navigate(`/product/${piece.id}`)}
                  className="border rounded-lg p-3 flex gap-3 text-left"
                >
                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    <OptimizedImage
                      src={piece.image_url}
                      alt={piece.name}
                      aspectRatio="portrait"
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {piece.bundle_role || 'Piece'}
                      {piece.bundle_quantity > 1 && ` • x${piece.bundle_quantity}`}
                    </p>
                    <p className="text-sm font-medium truncate">{piece.name}</p>
                    <p className="text-sm font-semibold">{formatDisplayPrice(piece)}</p>
                    {!piece.in_stock && (
                      <span className="text-xs font-semibold text-red-600">SOLD OUT</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Part of a Set (viewing a component piece) */}
        {product.bundle_id && (
          <div className="mt-16 pt-16 border-t">
            <h2 className="text-2xl font-semibold mb-2">Part of a Set</h2>
            <p className="text-muted-foreground mb-6">
              This piece{product.bundle_role ? ` (${product.bundle_role})` : ''} can be bought alone, or as part of the full set.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {parentBundle && (
                <button
                  onClick={() => navigate(`/product/${parentBundle.id}`)}
                  className="border-2 border-primary rounded-lg p-3 flex gap-3 text-left"
                >
                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    <OptimizedImage
                      src={parentBundle.image_url}
                      alt={parentBundle.name}
                      aspectRatio="portrait"
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-primary">Full Set</p>
                    <p className="text-sm font-medium truncate">{parentBundle.name}</p>
                    <p className="text-sm font-semibold">{formatDisplayPrice(parentBundle)}</p>
                    {!parentBundle.in_stock && (
                      <span className="text-xs font-semibold text-red-600">SOLD OUT</span>
                    )}
                  </div>
                </button>
              )}
              {bundleSiblings?.map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => navigate(`/product/${piece.id}`)}
                  className="border rounded-lg p-3 flex gap-3 text-left"
                >
                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    <OptimizedImage
                      src={piece.image_url}
                      alt={piece.name}
                      aspectRatio="portrait"
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {piece.bundle_role || 'Piece'}
                    </p>
                    <p className="text-sm font-medium truncate">{piece.name}</p>
                    <p className="text-sm font-semibold">{formatDisplayPrice(piece)}</p>
                    {!piece.in_stock && (
                      <span className="text-xs font-semibold text-red-600">SOLD OUT</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Available Pieces in This Style */}
        {stylePieces && stylePieces.length > 0 && (
          <div className="mt-16 pt-16 border-t">
            <h2 className="text-2xl font-semibold mb-6">
              Available Pieces in This Style ({stylePieces.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {stylePieces.map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => navigate(`/product/${piece.id}`)}
                  className="text-left group"
                >
                  <div className="aspect-square overflow-hidden rounded-md bg-muted relative">
                    <OptimizedImage
                      src={piece.image_url}
                      alt={piece.name}
                      aspectRatio="square"
                      className="w-full h-full transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {!piece.in_stock && (
                      <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-semibold px-2 py-1 rounded">
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2 truncate">{piece.sku || piece.name}</p>
                  {piece.size && <p className="text-xs text-muted-foreground">Size: {piece.size}</p>}
                  <p className="text-sm font-semibold">{formatDisplayPrice(piece)}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Each piece is unique. Color, patches and details vary.</p>
          </div>
        )}

        {/* Product Details (collapsible) */}
        {(product.material || product.care_instructions || product.measurements || product.model_info) && (
          <div className="mt-16 pt-16 border-t">
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h2 className="text-2xl font-semibold">Product Details</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {product.material && (
                      <div>
                        <h3 className="font-semibold mb-1">Material Composition</h3>
                        <p className="text-muted-foreground">{product.material}</p>
                      </div>
                    )}
                    {product.measurements && (product.measurements.top_length_in || product.measurements.bottom_length_in || product.measurements.waist_in || product.measurements.chest_in || product.measurements.sleeve_in) && (
                      <div>
                        <h3 className="font-semibold mb-1">Product Dimensions</h3>
                        <p className="text-muted-foreground">
                          {[
                            product.measurements.top_length_in && `Top Length: ${product.measurements.top_length_in}in`,
                            product.measurements.bottom_length_in && `Bottom Length: ${product.measurements.bottom_length_in}in`,
                            product.measurements.chest_in && `Chest: ${product.measurements.chest_in}in`,
                            product.measurements.waist_in && `Waist: ${product.measurements.waist_in}in`,
                            product.measurements.sleeve_in && `Sleeve: ${product.measurements.sleeve_in}in`,
                          ].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    )}
                    {product.care_instructions && (
                      <div>
                        <h3 className="font-semibold mb-1">Care Instructions</h3>
                        <p className="text-muted-foreground">{product.care_instructions}</p>
                      </div>
                    )}
                  </div>
                  {product.model_info && (product.model_info.height_in || product.model_info.bust_in || product.model_info.waist_in || product.model_info.hips_in || product.model_info.wearing_size) && (
                    <div>
                      <h3 className="font-semibold mb-1">Model Information</h3>
                      <ul className="text-muted-foreground space-y-1">
                        {product.model_info.height_in && <li>Height: {product.model_info.height_in}in</li>}
                        {product.model_info.bust_in && <li>Bust: {product.model_info.bust_in}in</li>}
                        {product.model_info.waist_in && <li>Waist: {product.model_info.waist_in}in</li>}
                        {product.model_info.hips_in && <li>Hips: {product.model_info.hips_in}in</li>}
                        {product.model_info.wearing_size && <li>Wearing Size: {product.model_info.wearing_size}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16 pt-16 border-t">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        <div className="mt-16 pt-16 border-t">
          <RelatedProducts currentProduct={product} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
