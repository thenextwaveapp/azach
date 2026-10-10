import { Link } from "react-router-dom";

interface FooterProps {
  dark?: boolean;
}

export const Footer = ({ dark = false }: FooterProps) => {
  return (
    <>
      <footer
        className={`relative py-16 text-white shadow-[0_-12px_32px_-8px_rgba(0,0,0,0.25)] ${
          dark ? 'bg-black' : 'bg-gradient-to-b from-[#8b6440] to-[#a97c50]'
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Top Section - Logo */}
          <div className="flex flex-col md:flex-row justify-start items-center mb-12 pb-12 border-b border-white/20">
            <div className="mb-6 md:mb-0">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <img src="/Azach-Logo.webp" alt="AZACH" className="h-4 md:h-8 w-auto brightness-0 invert" />
              </Link>
            </div>
          </div>

          {/* Links Section - 5 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Shop</h4>
              <ul className="space-y-3 text-sm text-white">
                <li><Link to="/shop-all" className="hover:text-white/80 transition-colors">All Products</Link></li>
                <li><Link to="/women" className="hover:text-white/80 transition-colors">Women</Link></li>
                <li><Link to="/men" className="hover:text-white/80 transition-colors">Men</Link></li>
                <li><Link to="/sale" className="hover:text-white/80 transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Custom</h4>
              <ul className="space-y-3 text-sm text-white">
                <li><Link to="/bespoke" className="hover:text-white/80 transition-colors">Bespoke Orders</Link></li>
                <li><Link to="/bespoke" className="hover:text-white/80 transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Rework</h4>
              <ul className="space-y-3 text-sm text-white">
                <li><Link to="/rework" className="hover:text-white/80 transition-colors">Repair Services</Link></li>
                <li><Link to="/rework" className="hover:text-white/80 transition-colors">Alterations</Link></li>
                <li><Link to="/donate-garments" className="hover:text-white/80 transition-colors">Donate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">About</h4>
              <ul className="space-y-3 text-sm text-white">
                <li><Link to="/our-story" className="hover:text-white/80 transition-colors">Our Story</Link></li>
                <li><Link to="/lookbook" className="hover:text-white/80 transition-colors">Lookbook</Link></li>
                <li><a href="https://azachng.wordpress.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Help</h4>
              <ul className="space-y-3 text-sm text-white">
                <li><Link to="/customer-service" className="hover:text-white/80 transition-colors">Customer Service</Link></li>
                <li><Link to="/returns" className="hover:text-white/80 transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/size-guide" className="hover:text-white/80 transition-colors">Size Guide</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
            <p>&copy; 2026 AZACH. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
