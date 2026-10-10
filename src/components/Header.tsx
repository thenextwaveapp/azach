import { ShoppingBag, Menu, Search, User, LogIn, Heart, Package, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/SearchDialog";
import { AccountDropdown } from "@/components/AccountDropdown";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { CartDrawer } from "@/components/CartDrawer";

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { getTotalItems } = useCart();
  const { user, isAnonymous, signOut } = useAuth();

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
      <header className={`sticky z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-500 ease-in-out ${
        isVisible ? "top-0 translate-y-0" : "-top-20 -translate-y-full"
      }`}>
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg hover:text-secondary transition-colors uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/shop-all" className="text-lg hover:text-secondary transition-colors uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                <Link to="/bespoke" className="text-lg hover:text-secondary transition-colors uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>Custom</Link>
                <Link to="/our-story" className="text-lg hover:text-secondary transition-colors uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/rework" className="text-lg hover:text-secondary transition-colors uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>Rework</Link>
                <Link to="/customer-service" className="text-lg hover:text-secondary transition-colors uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>Help</Link>
                <div className="border-t border-border mt-2 pt-2">
                  <Link to="/women" className="text-lg hover:text-secondary transition-colors block mb-3" onClick={() => setMobileMenuOpen(false)}>Women</Link>
                  <Link to="/men" className="text-lg hover:text-secondary transition-colors block mb-3" onClick={() => setMobileMenuOpen(false)}>Men</Link>
                  <Link to="/sale" className="text-lg hover:text-secondary transition-colors block" onClick={() => setMobileMenuOpen(false)}>Sale</Link>
                </div>
              </nav>

              {/* Mobile Actions */}
              <div className="border-t border-border mt-6 pt-6 flex flex-col gap-3">
                <div>
                  <CurrencySwitcher />
                </div>
                {/* Account Links */}
                {user && !isAnonymous ? (
                  <>
                    <Link to="/account" className="flex items-center gap-3 text-lg hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 text-lg hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <Package className="h-5 w-5" />
                      Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 text-lg hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <Heart className="h-5 w-5" />
                      Wishlist
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 text-lg hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                    <button
                      className="flex items-center gap-3 text-lg text-destructive hover:opacity-80 transition-colors"
                      onClick={() => { setMobileMenuOpen(false); signOut(); }}
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 text-lg hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="h-5 w-5" />
                      Login
                    </Link>
                    <Link to="/register" className="flex items-center gap-3 text-lg hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-5 w-5" />
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo - LEFT on desktop, absolutely centered on mobile */}
          <div className="hidden lg:flex flex-col items-start">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:opacity-80 transition-opacity"
            >
              <img src="/Azach-Logo.webp" alt="AZACH" className="h-8 w-auto" />
            </Link>
          </div>
          <div className="flex lg:hidden absolute left-1/2 -translate-x-1/2">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:opacity-80 transition-opacity"
            >
              <img src="/Azach-Logo.webp" alt="AZACH" className="h-4 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation - CENTER */}
          <nav className="hidden lg:flex gap-12 absolute left-1/2 -translate-x-1/2">
            <Link
              to="/shop-all"
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group uppercase tracking-wide"
            >
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/bespoke"
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group uppercase tracking-wide"
            >
              Custom
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/our-story"
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group uppercase tracking-wide"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/rework"
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group uppercase tracking-wide"
            >
              Rework
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/customer-service"
              className="relative text-sm font-medium transition-all duration-300 hover:text-secondary group uppercase tracking-wide"
            >
              Help
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Actions - RIGHT */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)} className="hover:bg-muted hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <CurrencySwitcher />
            <AccountDropdown />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Open cart${getTotalItems() > 0 ? ` (${getTotalItems()} items)` : ''}`}
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
          </div>

          {/* Mobile Quick Links - Search, Account, Cart */}
          <div className="flex lg:hidden items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <AccountDropdown />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Open cart${getTotalItems() > 0 ? ` (${getTotalItems()} items)` : ''}`}
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
    </>
  );
};
