import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <>
      <footer className="py-16 bg-[#a97c50] text-white">
        <div className="container mx-auto px-4">
          {/* Top Section - Logo */}
          <div className="flex flex-col md:flex-row justify-start items-center mb-12 pb-12 border-b border-gray-800">
            <div className="mb-6 md:mb-0">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <img src="/Azach-Logo.png" alt="AZACH" className="h-16 w-auto brightness-0 invert" />
              </Link>
              <p className="text-xs tracking-wider text-gray-400 mt-2">EST. LAGOS, NIGERIA</p>
            </div>
          </div>

          {/* Links Section - 5 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/shop-all" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/women" className="hover:text-white transition-colors">Women</Link></li>
                <li><Link to="/men" className="hover:text-white transition-colors">Men</Link></li>
                <li><Link to="/sale" className="hover:text-white transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Custom</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/bespoke" className="hover:text-white transition-colors">Bespoke Orders</Link></li>
                <li><Link to="/bespoke" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Rework</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/rework" className="hover:text-white transition-colors">Repair Services</Link></li>
                <li><Link to="/rework" className="hover:text-white transition-colors">Alterations</Link></li>
                <li><Link to="/donate-garments" className="hover:text-white transition-colors">Donate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">About</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="/lookbook" className="hover:text-white transition-colors">Lookbook</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Help</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/customer-service" className="hover:text-white transition-colors">Customer Service</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2026 AZACH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
