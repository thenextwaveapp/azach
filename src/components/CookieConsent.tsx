import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { loadAnalytics, revokeAnalyticsConsent } from "@/lib/analytics";

export const COOKIE_CONSENT_KEY = "azach-cookie-consent";
export const COOKIE_CONSENT_RESOLVED_EVENT = "azach-cookie-consent-resolved";
const CONSENT_KEY = COOKIE_CONSENT_KEY;

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted") {
      loadAnalytics();
    } else if (stored === "essential-only") {
      revokeAnalyticsConsent();
    } else if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    loadAnalytics();
    setVisible(false);
    window.dispatchEvent(new Event(COOKIE_CONSENT_RESOLVED_EVENT));
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, "essential-only");
    revokeAnalyticsConsent();
    setVisible(false);
    window.dispatchEvent(new Event(COOKIE_CONSENT_RESOLVED_EVENT));
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-border shadow-lg"
    >
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          We use essential cookies to run this site (cart, sign-in, currency), and — only with your consent —
          analytics cookies to understand traffic. See our{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for details.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReject}>
            Reject All
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};
