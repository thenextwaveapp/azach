import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy - AZACH";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-4xl font-semibold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: July 2026</p>

          <p className="text-muted-foreground">
            AZACH Creative Company ("AZACH", "we", "us", "our") operates azach.ng and azach.ca. This policy
            explains what personal data we collect when you use our site, why we collect it, and the choices
            you have.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">1. Information We Collect</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Account &amp; order data:</strong> name, email, phone, shipping/billing address, and order history, provided when you create an account, check out, or place a custom (Bespoke) or repair (Rework) request.</li>
            <li><strong className="text-foreground">Payment data:</strong> we never see or store your card details. Payments are processed directly by Paystack; we retain only the transaction reference and status.</li>
            <li><strong className="text-foreground">Reference images:</strong> photos you upload for Bespoke, Rework, or garment donation requests, used solely to fulfill that request.</li>
            <li><strong className="text-foreground">Newsletter &amp; marketing:</strong> your email address, if you subscribe or submit the welcome discount pop-up.</li>
            <li><strong className="text-foreground">Usage data:</strong> pages viewed, device/browser type, and approximate location (from IP), used to run the site (e.g. showing NGN vs. other currencies) and, where you've consented, for analytics.</li>
            <li><strong className="text-foreground">Cookies &amp; local storage:</strong> see Section 5 below.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-3">2. How We Use Your Information</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>To process and fulfill orders, including generating shipping labels and tracking numbers with DHL Express.</li>
            <li>To communicate with you about orders, custom/repair requests, and account activity.</li>
            <li>To send marketing emails if you've opted in — you can unsubscribe at any time.</li>
            <li>To detect and prevent fraud, abuse, and duplicate use of discount codes.</li>
            <li>To improve the site, understand what's working, and fix what isn't (analytics, where consented).</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-3">3. Who We Share Data With</h2>
          <p className="text-muted-foreground">
            We share the minimum data necessary with the vendors who help us operate: <strong className="text-foreground">Paystack</strong> (payment
            processing), <strong className="text-foreground">DHL Express</strong> (shipping and customs documentation), <strong className="text-foreground">Supabase</strong> (database
            and account infrastructure), and <strong className="text-foreground">Resend</strong> (transactional email delivery). We do not sell your personal
            data to anyone.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">4. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain order records for as long as needed for accounting, warranty, and legal purposes.
            Reference images and form submissions are kept only as long as needed to complete your request.
            You can request deletion of your account data at any time (Section 7).
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">5. Cookies &amp; Similar Technologies</h2>
          <p className="text-muted-foreground">We use:</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Essential:</strong> to keep you signed in, remember your cart, and remember your currency preference. The site cannot function without these.</li>
            <li><strong className="text-foreground">Analytics (optional):</strong> to understand site traffic and improve the shopping experience. These only load if you accept them in the cookie banner.</li>
          </ul>
          <p className="text-muted-foreground">
            You can change your cookie choice at any time by clearing your browser's local storage for this
            site, which will show the consent banner again.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">6. International Transfers</h2>
          <p className="text-muted-foreground">
            We ship worldwide from Lagos, Nigeria. If you're located outside Nigeria (including the EU/UK/Canada),
            your data is processed by us and our vendors listed above, some of whom operate infrastructure outside
            your country. We rely on our vendors' standard contractual and security safeguards for these transfers.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">7. Your Rights</h2>
          <p className="text-muted-foreground">
            You can request access to, correction of, or deletion of your personal data, or object to marketing use
            of your email, by contacting us at <a href="mailto:info@azach.ng" className="text-primary hover:underline">info@azach.ng</a>. We'll
            respond within a reasonable time.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">8. Children's Privacy</h2>
          <p className="text-muted-foreground">
            AZACH is not directed at children under 16, and we do not knowingly collect data from them.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">9. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this policy as our practices change. Material changes will be reflected by updating
            the date at the top of this page.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-3">10. Contact</h2>
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

export default PrivacyPolicy;
