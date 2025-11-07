import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Filter, SortAsc, SortDesc } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Product } from "@/types/product";

export type SortOption = "newest" | "price-low" | "price-high" | "name-asc" | "name-desc";
export type FilterState = {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean | null;
  onSale: boolean | null;
};

interface ProductFiltersProps {
  products: Product[];
  onProductsChange: (filteredAndSorted: Product[]) => void;
  availableCategories: string[];
  maxPrice: number;
}

export const ProductFilters = ({
  products,
  onProductsChange,
  availableCategories,
  maxPrice,
}: ProductFiltersProps) => {
  const { formatPrice } = useCurrency();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, maxPrice],
    inStock: null,
    onSale: null,
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Apply filters and sorting together
  const applyFiltersAndSort = useCallback((newFilters: FilterState, sortOption: SortOption) => {
    let result = [...products];

    // Apply filters
    if (newFilters.categories.length > 0) {
      result = result.filter((p) => newFilters.categories.includes(p.category));
    }

    result = result.filter(
      (p) => p.price >= newFilters.priceRange[0] && p.price <= newFilters.priceRange[1]
    );

    if (newFilters.inStock !== null) {
      result = result.filter((p) => p.in_stock === newFilters.inStock);
    }

    if (newFilters.onSale !== null) {
      result = result.filter((p) => p.on_sale === newFilters.onSale);
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    onProductsChange(result);
  }, [products, onProductsChange]);

  // Initialize on mount
  useEffect(() => {
    applyFiltersAndSort(filters, sortBy);
  }, [applyFiltersAndSort]);

  const handleSortChange = (value: string) => {
    const sortOption = value as SortOption;
    setSortBy(sortOption);
    applyFiltersAndSort(filters, sortOption);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    applyFiltersAndSort(newFilters, sortBy);
  };

  const handlePriceRangeChange = (range: number[]) => {
    const newFilters = { ...filters, priceRange: [range[0], range[1]] as [number, number] };
    setFilters(newFilters);
    applyFiltersAndSort(newFilters, sortBy);
  };

  const handleInStockChange = (checked: boolean) => {
    const newFilters = { ...filters, inStock: checked ? true : null };
    setFilters(newFilters);
    applyFiltersAndSort(newFilters, sortBy);
  };

  const handleOnSaleChange = (checked: boolean) => {
    const newFilters = { ...filters, onSale: checked ? true : null };
    setFilters(newFilters);
    applyFiltersAndSort(newFilters, sortBy);
  };

  const clearFilters = () => {
    const resetFilters: FilterState = {
      categories: [],
      priceRange: [0, maxPrice],
      inStock: null,
      onSale: null,
    };
    setFilters(resetFilters);
    applyFiltersAndSort(resetFilters, sortBy);
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.inStock !== null ||
    filters.onSale !== null;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <Label className="text-sm font-semibold mb-4 block">Category</Label>
        <div className="space-y-3">
          {availableCategories.map((category) => (
            <div key={category} className="flex items-center space-x-3">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <label
                htmlFor={`category-${category}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-4 block">
          Price Range
        </Label>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
          </div>
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={maxPrice}
            min={0}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      {/* In Stock */}
      <div>
        <Label className="text-sm font-semibold mb-4 block">Availability</Label>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="in-stock"
            checked={filters.inStock === true}
            onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
          />
          <label
            htmlFor="in-stock"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            In Stock Only
          </label>
        </div>
      </div>

      {/* On Sale */}
      <div>
        <Label className="text-sm font-semibold mb-4 block">Special Offers</Label>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="on-sale"
            checked={filters.onSale === true}
            onCheckedChange={(checked) => handleOnSaleChange(checked as boolean)}
          />
          <label
            htmlFor="on-sale"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            On Sale
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-2">
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-8">
      {/* Mobile Filters Button */}
      <div className="lg:hidden mb-4">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {filters.categories.length + (filters.inStock !== null ? 1 : 0) + (filters.onSale !== null ? 1 : 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout - Horizontal Filter Bar */}
      <div className="hidden lg:flex items-center justify-between gap-6 pb-4 border-b mb-6">
        {/* Left Side - Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          
          {/* Category Filters */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {availableCategories.map((category) => (
                <Button
                  key={category}
                  variant={filters.categories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                  className="h-8 text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* In Stock Filter */}
          <Button
            variant={filters.inStock === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleInStockChange(!filters.inStock)}
            className="h-8 text-xs"
          >
            In Stock
          </Button>

          {/* On Sale Filter */}
          <Button
            variant={filters.onSale === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleOnSaleChange(!filters.onSale)}
            className="h-8 text-xs"
          >
            On Sale
          </Button>

          {/* Price Range - Compact */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Price:</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">{formatPrice(filters.priceRange[0])}</span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-xs">{formatPrice(filters.priceRange[1])}</span>
            </div>
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={maxPrice}
              min={0}
              step={10}
              className="w-24"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Right Side - Sort */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {sortBy.includes("price-low") || sortBy === "name-asc" ? (
              <SortAsc className="h-4 w-4 text-muted-foreground" />
            ) : (
              <SortDesc className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">
              Sort:
            </Label>
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger id="sort" className="w-[160px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Sort */}
      <div className="lg:hidden flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {sortBy.includes("price-low") || sortBy === "name-asc" ? (
            <SortAsc className="h-4 w-4 text-muted-foreground" />
          ) : (
            <SortDesc className="h-4 w-4 text-muted-foreground" />
          )}
          <Label htmlFor="sort-mobile" className="text-sm font-medium whitespace-nowrap">
            Sort:
          </Label>
        </div>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger id="sort-mobile" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

