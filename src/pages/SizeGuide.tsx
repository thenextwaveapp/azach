import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SizeGuide = () => {
  // Set page title
  useEffect(() => {
    document.title = "Size Guide - AZACH";
  }, []);
  const [activeTab, setActiveTab] = useState<"men" | "women">("men");

  const mensSizes = [
    { size: "XXXS", chest: { inches: "28-30", cm: "71-76" }, waist: { inches: "20-22", cm: "51-56" } },
    { size: "XS", chest: { inches: "32-34", cm: "81-86" }, waist: { inches: "24-26", cm: "61-66" } },
    { size: "S", chest: { inches: "36-38", cm: "91-97" }, waist: { inches: "28-30", cm: "71-76" } },
    { size: "M", chest: { inches: "38-40", cm: "97-102" }, waist: { inches: "28-30", cm: "71-76" } },
    { size: "L", chest: { inches: "42-44", cm: "107-112" }, waist: { inches: "34-37", cm: "86-94" } },
    { size: "XL", chest: { inches: "46-48", cm: "117-122" }, waist: { inches: "38-42", cm: "97-107" } },
    { size: "XXL", chest: { inches: "50-52", cm: "127-132" }, waist: { inches: "44-46", cm: "112-117" } },
    { size: "3XL", chest: { inches: "54-56", cm: "137-142" }, waist: { inches: "48-50", cm: "122-127" } },
    { size: "4XL", chest: { inches: "58-60", cm: "147-152" }, waist: { inches: "52-54", cm: "132-137" } },
    { size: "5XL", chest: { inches: "62-64", cm: "157-162" }, waist: { inches: "54-60", cm: "137-152" } },
  ];

  const womensSizes = [
    { ukSize: "2", usSize: "0", bust: { inches: "28", cm: "71" }, waist: { inches: "20", cm: "51" }, hips: { inches: "32", cm: "81" }, label: "3XS" },
    { ukSize: "4", usSize: "0", bust: { inches: "30", cm: "76" }, waist: { inches: "22", cm: "56" }, hips: { inches: "34", cm: "86" }, label: "XXS" },
    { ukSize: "6", usSize: "2", bust: { inches: "32", cm: "81" }, waist: { inches: "24", cm: "61" }, hips: { inches: "36", cm: "91" }, label: "XS" },
    { ukSize: "8", usSize: "4", bust: { inches: "34", cm: "86" }, waist: { inches: "26", cm: "66" }, hips: { inches: "38", cm: "97" }, label: "S" },
    { ukSize: "10", usSize: "6", bust: { inches: "36", cm: "91" }, waist: { inches: "28", cm: "71" }, hips: { inches: "40", cm: "102" }, label: "S" },
    { ukSize: "12", usSize: "8", bust: { inches: "38", cm: "97" }, waist: { inches: "30", cm: "76" }, hips: { inches: "42", cm: "107" }, label: "M" },
    { ukSize: "14", usSize: "10", bust: { inches: "40", cm: "102" }, waist: { inches: "32", cm: "81" }, hips: { inches: "44", cm: "112" }, label: "L" },
    { ukSize: "16", usSize: "12", bust: { inches: "42", cm: "107" }, waist: { inches: "34", cm: "86" }, hips: { inches: "46", cm: "117" }, label: "XL" },
    { ukSize: "18", usSize: "14", bust: { inches: "44", cm: "112" }, waist: { inches: "36", cm: "91" }, hips: { inches: "48", cm: "123" }, label: "XL" },
    { ukSize: "20", usSize: "16", bust: { inches: "46", cm: "117" }, waist: { inches: "38", cm: "97" }, hips: { inches: "50", cm: "127" }, label: "XXL" },
    { ukSize: "22", usSize: "18", bust: { inches: "48", cm: "123" }, waist: { inches: "40", cm: "102" }, hips: { inches: "52", cm: "132" }, label: "XXL" },
    { ukSize: "24", usSize: "20", bust: { inches: "50", cm: "127" }, waist: { inches: "42", cm: "107" }, hips: { inches: "54", cm: "137" }, label: "3XL" },
    { ukSize: "26", usSize: "22", bust: { inches: "52", cm: "132" }, waist: { inches: "44", cm: "112" }, hips: { inches: "56", cm: "142" }, label: "4XL" },
    { ukSize: "28", usSize: "24", bust: { inches: "54", cm: "137" }, waist: { inches: "46", cm: "117" }, hips: { inches: "58", cm: "147" }, label: "4XL" },
    { ukSize: "30", usSize: "26", bust: { inches: "56", cm: "142" }, waist: { inches: "48", cm: "123" }, hips: { inches: "60", cm: "152" }, label: "5XL" },
  ];

  const trouserLengths = [
    { label: "SHORT", inches: "42", cm: "107" },
    { label: "REGULAR", inches: "44", cm: "112" },
    { label: "LONG", inches: "46", cm: "117" },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Size Guide</h1>
            <p className="text-xl text-muted-foreground">
              Find your perfect fit with our comprehensive sizing charts
            </p>
          </div>
        </div>
      </section>

      {/* Size Selection Tabs */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab("men")}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "men"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Men's Sizes
            </button>
            <button
              onClick={() => setActiveTab("women")}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "women"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Women's Sizes
            </button>
          </div>
        </div>
      </section>

      {/* Size Tables */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {activeTab === "men" ? (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Men's Size Chart</h2>

              {/* Men's Size Table */}
              <div className="overflow-x-auto mb-12">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-3 text-left font-semibold">SIZE</th>
                      <th className="border border-border px-4 py-3 text-center font-semibold" colSpan={2}>CHEST MEASUREMENT</th>
                      <th className="border border-border px-4 py-3 text-center font-semibold" colSpan={2}>WAIST MEASUREMENT</th>
                    </tr>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-4 py-2"></th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">INCHES</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">CM</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">INCHES</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mensSizes.map((size, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="border border-border px-4 py-3 font-semibold">{size.size}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.chest.inches}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.chest.cm}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.waist.inches}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.waist.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How to Measure - Men */}
              <div className="bg-muted p-8 rounded-lg mb-8">
                <h3 className="text-2xl font-bold mb-4">How to Measure</h3>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Chest:</h4>
                    <p>Measure around the fullest part of your chest, keeping the tape measure horizontal.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Waist:</h4>
                    <p>Measure around your natural waistline, keeping the tape measure comfortably loose.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Women's Size Chart</h2>

              {/* Women's Size Table */}
              <div className="overflow-x-auto mb-12">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-3 text-left font-semibold">SIZE</th>
                      <th className="border border-border px-4 py-3 text-center font-semibold">UK SIZE</th>
                      <th className="border border-border px-4 py-3 text-center font-semibold">USA SIZE</th>
                      <th className="border border-border px-4 py-3 text-center font-semibold" colSpan={2}>BUST</th>
                      <th className="border border-border px-4 py-3 text-center font-semibold" colSpan={2}>WAIST</th>
                      <th className="border border-border px-4 py-3 text-center font-semibold" colSpan={2}>HIPS</th>
                    </tr>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-4 py-2"></th>
                      <th className="border border-border px-4 py-2"></th>
                      <th className="border border-border px-4 py-2"></th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">INCHES</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">CM</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">INCHES</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">CM</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">INCHES</th>
                      <th className="border border-border px-4 py-2 text-xs font-medium">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {womensSizes.map((size, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="border border-border px-4 py-3 font-semibold">{size.label}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.ukSize}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.usSize}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.bust.inches}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.bust.cm}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.waist.inches}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.waist.cm}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.hips.inches}</td>
                        <td className="border border-border px-4 py-3 text-center">{size.hips.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How to Measure - Women */}
              <div className="bg-muted p-8 rounded-lg mb-8">
                <h3 className="text-2xl font-bold mb-4">How to Measure</h3>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Bust:</h4>
                    <p>Measure around the fullest part of your bust, keeping the tape measure horizontal and comfortably loose.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Waist:</h4>
                    <p>Measure around your natural waistline at the smallest part of your waist.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Hips:</h4>
                    <p>Measure around the fullest part of your hips, approximately 8 inches below your waist.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trouser Length Table */}
          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Trouser Length Guide</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-6 py-3 text-left font-semibold">LENGTH</th>
                    <th className="border border-border px-6 py-3 text-center font-semibold">INCHES</th>
                    <th className="border border-border px-6 py-3 text-center font-semibold">CM</th>
                  </tr>
                </thead>
                <tbody>
                  {trouserLengths.map((length, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="border border-border px-6 py-4 font-semibold">{length.label}</td>
                      <td className="border border-border px-6 py-4 text-center">{length.inches}</td>
                      <td className="border border-border px-6 py-4 text-center">{length.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-muted p-6 rounded-lg">
              <h4 className="font-semibold mb-2">How to Measure Trouser Length:</h4>
              <p className="text-muted-foreground">Measure from the top of the waistband to the bottom of the leg hem along the inside seam.</p>
            </div>
          </div>

          {/* Fit Tips */}
          <div className="max-w-4xl mx-auto mt-16 bg-primary/5 p-8 rounded-lg border border-primary/20">
            <h3 className="text-2xl font-bold mb-4 text-center">Fit Tips</h3>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Between Sizes?</h4>
                <p>If you're between sizes, we generally recommend sizing up for a more comfortable fit.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Different Styles</h4>
                <p>Some styles may fit differently. Check individual product pages for specific fit notes.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
                <p>Contact our customer service team for personalized sizing advice.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Returns</h4>
                <p>Not the right fit? We offer free returns within 30 days of purchase.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          {/* Top Section - Logo and Social */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 pb-12 border-b border-gray-800">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mb-6 md:mb-0"
            >
              <img src="/Azach-Logo.png" alt="AZACH" className="h-16 w-auto brightness-0 invert" />
            </Link>
            <div className="flex gap-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/instagram.png" alt="Instagram" className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/facebook.png" alt="Facebook" className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/x.png" alt="X" className="h-6 w-6" />
                <span className="sr-only">X</span>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/tiktok.png" alt="TikTok" className="h-6 w-6" />
                <span className="sr-only">TikTok</span>
              </a>
              <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/snapchat.png" alt="Snapchat" className="h-6 w-6" />
                <span className="sr-only">Snapchat</span>
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/shop-all" className="hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/women" className="hover:text-white transition-colors">Women</Link></li>
                <li><Link to="/men" className="hover:text-white transition-colors">Men</Link></li>
                <li><Link to="/sale" className="hover:text-white transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Help</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/customer-service" className="hover:text-white transition-colors">Customer Service</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="/lookbook" className="hover:text-white transition-colors">Lookbook</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 AZACH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SizeGuide;
