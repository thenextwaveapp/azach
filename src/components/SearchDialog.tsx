import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { useSearchProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { trackSearch } from "@/lib/analytics";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: filteredProducts = [], isLoading } = useSearchProducts(searchQuery);
  const lastTrackedTerm = useRef("");

  useEffect(() => {
    if (!open) {
      lastTrackedTerm.current = "";
      setSearchQuery("");
    }
  }, [open]);

  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < 2 || isLoading) return;

    const timer = setTimeout(() => {
      if (term === lastTrackedTerm.current) return;
      lastTrackedTerm.current = term;
      trackSearch(term, filteredProducts.length);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isLoading, filteredProducts.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading font-semibold tracking-normal normal-case">Search Products</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {searchQuery ? (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => onOpenChange(false)}
                        className="block"
                      >
                        <ProductCard
                          {...productToDisplay(product)}
                          product={product}
                          listName="Search Results"
                        />
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Start typing to search for products</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
