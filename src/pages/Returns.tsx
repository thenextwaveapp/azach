import { Header } from "@/components/Header";
import { Package, Mail, Phone, Check, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const Returns = () => {
  // Set page title
  useEffect(() => {
    document.title = "Returns - AZACH";
  }, []);
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Returns & Refunds</h1>
            <p className="text-xl text-muted-foreground">
              Your satisfaction is our priority. We've made returns simple and hassle-free.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">30-Day Returns</h3>
                <p className="text-sm text-muted-foreground">Return items within 30 days of delivery</p>
              </div>
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Easy Process</h3>
                <p className="text-sm text-muted-foreground">Simple return authorization via email</p>
              </div>
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Full Refunds</h3>
                <p className="text-sm text-muted-foreground">Complete refund to original payment method</p>
              </div>
            </div>

            {/* Return Eligibility */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Return Eligibility</h2>
              <div className="bg-card p-8 rounded-lg border border-border">
                <p className="mb-6 text-muted-foreground">
                  We accept returns within 30 days of the purchase date. To qualify for a return, items must meet the following criteria:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Items must be in new, unworn, and unused condition with all original tags attached</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>All original packaging, accessories, and documentation must be included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Returns must be initiated within 30 days of receiving your order</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Proof of purchase (order confirmation or receipt) must be provided</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Non-Returnable Items */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Non-Returnable Items</h2>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-8 rounded-lg border border-amber-200 dark:border-amber-900">
                <p className="mb-4 text-amber-900 dark:text-amber-100">
                  The following items are considered final sale and cannot be returned or refunded unless defective or damaged:
                </p>
                <ul className="space-y-2 text-amber-800 dark:text-amber-200">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span>Sale and clearance items marked as "Final Sale"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span>Gift cards and e-gift certificates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span>Items showing signs of wear, washing, or alteration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span>Products without original tags or packaging</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How to Return */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6">How to Return an Item</h2>
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Contact Customer Support</h3>
                      <p className="text-muted-foreground">
                        Email us at <a href="mailto:info@azach.ng" className="text-primary hover:underline">info@azach.ng</a> with your order number and the item(s) you wish to return. Our team will respond within 24 hours with return authorization and detailed instructions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Prepare Your Package</h3>
                      <p className="text-muted-foreground">
                        Carefully pack your item(s) in the original packaging to prevent damage during transit. Include your order confirmation or receipt and ensure all tags remain attached.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Ship Your Return</h3>
                      <p className="text-muted-foreground mb-3">
                        Ship the item to the return address provided in your authorization email. Return shipping costs are the customer's responsibility unless the item is defective, damaged, or incorrect.
                      </p>
                      <div className="bg-muted p-4 rounded">
                        <p className="text-sm font-medium mb-1">Optional Prepaid Label</p>
                        <p className="text-sm text-muted-foreground">
                          For your convenience, we can provide a prepaid return shipping label for a nominal fee. Please request this when contacting customer support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Receive Your Refund</h3>
                      <p className="text-muted-foreground">
                        Once we receive and inspect your return, you'll receive an email notification. Approved refunds are processed within 7-15 business days to your original payment method.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Information */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Refund Processing</h2>
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Processing Timeline</h3>
                    <p className="text-muted-foreground mb-4">
                      After receiving and inspecting your returned item, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed within 7-15 business days.
                    </p>
                    <div className="bg-muted p-4 rounded">
                      <p className="text-sm font-medium mb-2">Please Note:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Refunds are issued to the original payment method used for purchase</li>
                        <li>• Original shipping fees are non-refundable</li>
                        <li>• Bank processing times may vary and could take an additional 5-10 business days</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Late or Missing Refunds</h3>
                    <p className="text-muted-foreground">
                      If you haven't received your refund after the stated processing period, please first check your bank account or contact your credit card company, as it may take additional time for the refund to be officially posted. If the issue persists after checking with your financial institution, please contact us at <a href="mailto:info@azach.ng" className="text-primary hover:underline">info@azach.ng</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchanges */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Exchanges</h2>
              <div className="bg-card p-8 rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">
                  To ensure you receive your preferred item as quickly as possible, we recommend the following process for exchanges:
                </p>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground">1.</span>
                    <span>Return your original item following our standard return process</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground">2.</span>
                    <span>Place a new order for the desired size, color, or style</span>
                  </li>
                </ol>
                <p className="text-muted-foreground mt-4">
                  This method ensures inventory availability and faster delivery of your preferred item.
                </p>
              </div>
            </div>

            {/* Damaged or Defective Items */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Damaged or Defective Items</h2>
              <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-lg border border-red-200 dark:border-red-900">
                <h3 className="font-semibold text-lg mb-3 text-red-900 dark:text-red-100">Received a Faulty Item?</h3>
                <p className="text-red-800 dark:text-red-200 mb-4">
                  If you receive an item that is damaged, defective, or incorrect, please contact us immediately at <a href="mailto:info@azach.ng" className="font-semibold hover:underline">info@azach.ng</a> or call us at <a href="tel:+2348064792146" className="font-semibold hover:underline">+234 806 479 2146</a>.
                </p>
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded">
                  <p className="font-medium text-red-900 dark:text-red-100 mb-2">We will resolve the issue by offering:</p>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <li>• A full replacement at no additional cost</li>
                    <li>• A complete refund including return shipping costs</li>
                    <li>• Expedited processing for defective item claims</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Need Assistance?</h2>
            <p className="text-muted-foreground mb-8">
              Our customer service team is here to help with your return or refund inquiry.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email Us</h3>
                <a href="mailto:info@azach.ng" className="text-primary hover:underline">info@azach.ng</a>
                <p className="text-xs text-muted-foreground mt-2">Response within 24 hours</p>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Call Us</h3>
                <a href="tel:+2348064792146" className="text-primary hover:underline">+234 806 479 2146</a>
                <p className="text-xs text-muted-foreground mt-2">Mon-Fri, 9am-6pm WAT</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Thank You Message */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground">
              Thank you for shopping at <span className="font-semibold text-foreground">AZACH</span>. We appreciate your business and are committed to providing you with an exceptional shopping experience.
            </p>
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

export default Returns;
