import { useState, useEffect } from "react";
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

export type SortOption = "newest" | "price-low" | "price-high" | "name-asc" | "name-desc";

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    categories: string[];
    minPrice: number;
    maxPrice: number;
    inStock: boolean | null;
    onSale: boolean | null;
    gender: 'men' | 'women' | 'unisex' | null;
    sortBy: SortOption;
  }) => void;
  availableCategories: string[];
  maxPrice: number;
  hideGenderFilter?: boolean;
}

export const ProductFilters = ({
  onFiltersChange,
  availableCategories,
  maxPrice,
  hideGenderFilter = false,
}: ProductFiltersProps) => {
  const { formatPrice } = useCurrency();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [inStock, setInStock] = useState<boolean | null>(null);
  const [onSale, setOnSale] = useState<boolean | null>(null);
  const [gender, setGender] = useState<'men' | 'women' | 'unisex' | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Update price range when maxPrice changes
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Emit filter changes to parent
  useEffect(() => {
    onFiltersChange({
      categories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStock,
      onSale,
      gender,
      sortBy,
    });
  }, [categories, priceRange, inStock, onSale, gender, sortBy, onFiltersChange]);

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };

  const handleCategoryToggle = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceRangeChange = (range: number[]) => {
    setPriceRange([range[0], range[1]] as [number, number]);
  };

  const handleInStockChange = (checked: boolean) => {
    setInStock(checked ? true : null);
  };

  const handleOnSaleChange = (checked: boolean) => {
    setOnSale(checked ? true : null);
  };

  const handleGenderChange = (newGender: 'men' | 'women' | 'unisex' | null) => {
    setGender(newGender);
  };

  const clearFilters = () => {
    setCategories([]);
    setPriceRange([0, maxPrice]);
    setInStock(null);
    setOnSale(null);
    setGender(null);
  };

  const hasActiveFilters =
    categories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice ||
    inStock !== null ||
    onSale !== null ||
    gender !== null;

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
                checked={categories.includes(category)}
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

      {/* Gender */}
      {!hideGenderFilter && (
        <div>
          <Label className="text-sm font-semibold mb-4 block">Gender</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="gender-men"
                checked={gender === 'men'}
                onCheckedChange={(checked) => handleGenderChange(checked ? 'men' : null)}
              />
              <label
                htmlFor="gender-men"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
              >
                Men
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="gender-women"
                checked={gender === 'women'}
                onCheckedChange={(checked) => handleGenderChange(checked ? 'women' : null)}
              />
              <label
                htmlFor="gender-women"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
              >
                Women
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="gender-unisex"
                checked={gender === 'unisex'}
                onCheckedChange={(checked) => handleGenderChange(checked ? 'unisex' : null)}
              />
              <label
                htmlFor="gender-unisex"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
              >
                Unisex
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-4 block">
          Price Range
        </Label>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </div>
          <Slider
            value={priceRange}
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
            checked={inStock === true}
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
            checked={onSale === true}
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
                  {categories.length + (inStock !== null ? 1 : 0) + (onSale !== null ? 1 : 0) + (gender !== null ? 1 : 0)}
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
      <div className="hidden lg:block pb-4 border-b mb-6">
        <div className="flex items-start justify-between gap-6 mb-3">
          {/* Left Side - Filters */}
          <div className="flex items-center gap-4 flex-wrap flex-1">
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
                    variant={categories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryToggle(category)}
                    className="h-8 text-xs font-normal border border-transparent"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            {/* Gender Filters */}
            {!hideGenderFilter && (
              <div className="flex items-center gap-2">
                <Button
                  variant={gender === 'men' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenderChange(gender === 'men' ? null : 'men')}
                  className="h-8 text-xs font-normal border border-transparent"
                >
                  Men
                </Button>
                <Button
                  variant={gender === 'women' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenderChange(gender === 'women' ? null : 'women')}
                  className="h-8 text-xs font-normal border border-transparent"
                >
                  Women
                </Button>
                <Button
                  variant={gender === 'unisex' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenderChange(gender === 'unisex' ? null : 'unisex')}
                  className="h-8 text-xs font-normal border border-transparent"
                >
                  Unisex
                </Button>
              </div>
            )}

            {/* In Stock Filter */}
            <Button
              variant={inStock === true ? "default" : "outline"}
              size="sm"
              onClick={() => handleInStockChange(!inStock)}
              className="h-8 text-xs font-normal border border-transparent"
            >
              In Stock
            </Button>

            {/* On Sale Filter */}
            <Button
              variant={onSale === true ? "default" : "outline"}
              size="sm"
              onClick={() => handleOnSaleChange(!onSale)}
              className="h-8 text-xs font-normal border border-transparent"
            >
              On Sale
            </Button>

            {/* Price Range - Compact */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Price:</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">{formatPrice(priceRange[0])}</span>
                <span className="text-xs text-muted-foreground">-</span>
                <span className="text-xs">{formatPrice(priceRange[1])}</span>
              </div>
              <Slider
                value={priceRange}
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

          {/* Right Side - Sort (Fixed Position) */}
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
