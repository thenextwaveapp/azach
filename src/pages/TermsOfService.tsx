import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Terms of Service - AZACH";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-4xl font-semibold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: July 2026</p>

          <p className="text-muted-foreground">
            These Terms govern your use of azach.ng and azach.ca, operated by AZACH Creative Company ("AZACH",
            "we", "us"). By using the site or placing an order, you agree to these Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">1. Products &amp; Pricing</h2>
          <p className="text-muted-foreground">
            We make reasonable efforts to display product details, pricing, and availability accurately.
            Prices in Nigeria are charged in Naira (NGN); prices shown on azach.ca in other currencies are
            for display only and converted to NGN at checkout using the live exchange rate, since payments
            are settled in NGN. We reserve the right to correct pricing or listing errors, cancel affected
            orders, and issue a full refund if that happens.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">2. Orders &amp; Payment</h2>
          <p className="text-muted-foreground">
            All payments are processed securely by Paystack. Placing an order is an offer to purchase, which
            we accept once payment is confirmed. Stock is reserved for a short window while you complete
            checkout; if payment isn't completed in time, the reservation is released and the item may sell
            out. Fraudulent, duplicate, or abusive use of promotional/discount codes may result in order
            cancellation.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">3. Shipping</h2>
          <p className="text-muted-foreground">
            Orders are shipped via DHL Express. Delivery estimates shown at checkout are provided by DHL and
            are not guaranteed. Customs duties or import taxes on international orders are the customer's
            responsibility unless stated otherwise.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">4. Returns, Exchanges &amp; Custom Orders</h2>
          <p className="text-muted-foreground">
            Standard items may be returned per our <Link to="/returns" className="text-primary hover:underline">Returns &amp; Refunds policy</Link>.
            Bespoke (custom) pieces are made to order and are non-refundable except for manufacturing
            defects, as they cannot be resold.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">5. Accounts</h2>
          <p className="text-muted-foreground">
            You're responsible for keeping your account credentials secure and for all activity under your
            account. Guest checkout is available; we may offer to convert a guest session into a full account
            tied to the email used at checkout.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">6. Discount Codes</h2>
          <p className="text-muted-foreground">
            Discount codes are single-use per email address unless stated otherwise, cannot be combined with
            other offers unless explicitly allowed, and have no cash value. We may deactivate a code at any
            time without notice.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">7. Reviews &amp; User Content</h2>
          <p className="text-muted-foreground">
            By submitting a product review, you grant us a non-exclusive right to display it on the site.
            Reviews must be honest and based on your own experience; we may remove reviews that are abusive,
            fraudulent, or unrelated to the product.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">8. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All site content — designs, photography, logos, and text — belongs to AZACH or its licensors and
            may not be reproduced without permission.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">9. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the extent permitted by law, AZACH's liability for any claim relating to an order is limited
            to the amount you paid for that order. We are not liable for indirect or consequential losses.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">10. Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to
            conflict-of-law principles.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">11. Contact</h2>
          <p className="text-muted-foreground">
            AZACH Creative Company<br />
            32 Musa Adewoku Street, Ojota, Lagos, Nigeria<br />
            <a href="mailto:info@azach.ng" className="text-primary hover:underline">info@azach.ng</a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
