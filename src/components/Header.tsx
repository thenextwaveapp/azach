import { ShoppingBag, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/SearchDialog";
import { AccountDropdown } from "@/components/AccountDropdown";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useCart } from "@/contexts/CartContext";
import { ShippingBanner } from "@/components/ShippingBanner";
import { CartDrawer } from "@/components/CartDrawer";

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { getTotalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      <ShippingBanner />
      <header className={`sticky z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-500 ease-in-out ${
        isVisible ? "top-0 translate-y-0" : "-top-20 -translate-y-full"
      }`}>
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/our-story" className="text-lg hover:text-secondary transition-colors">Our Story</Link>
                <Link to="/shop-all" className="text-lg hover:text-secondary transition-colors">Shop All</Link>
                <Link to="/women" className="text-lg hover:text-secondary transition-colors">Women</Link>
                <Link to="/men" className="text-lg hover:text-secondary transition-colors">Men</Link>
                <Link to="/sale" className="text-lg hover:text-secondary transition-colors">Sale</Link>
                <Link to="/bespoke" className="text-lg hover:text-secondary transition-colors">Bespoke</Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8">
            <Link 
              to="/our-story" 
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group"
            >
              Our Story
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/shop-all" 
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group"
            >
              Shop All
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/women" 
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group"
            >
              Women
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/men" 
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group"
            >
              Men
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/sale" 
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group"
            >
              Sale
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Logo */}
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity"
          >
            <img src="/Azach-Logo.png" alt="AZACH" className="h-10 w-auto" />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/bespoke">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex hover:bg-gradient-to-r hover:from-[#a97c50] hover:to-[#c4976d] hover:text-white transition-all duration-500 hover:scale-105 hover:shadow-md"
              >
                Bespoke
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hover:bg-muted hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <AccountDropdown />
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted hover:text-foreground"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
            <CurrencySwitcher />
          </div>
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
    </>
  );
};
