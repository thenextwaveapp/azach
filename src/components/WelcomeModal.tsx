import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { X } from "lucide-react";
import { invokeFunction } from "@/lib/functionError";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_RESOLVED_EVENT } from "@/components/CookieConsent";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email must be less than 255 characters" }),
});

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenWelcomeModal");
    if (hasSeenModal) return;

    // Radix's modal Dialog blocks interaction with everything outside itself while open,
    // so this can never show while the cookie banner is still up — it would trap the user.
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleOpen = () => {
      timeoutId = setTimeout(() => setIsOpen(true), 1500);
    };

    if (localStorage.getItem(COOKIE_CONSENT_KEY)) {
      scheduleOpen();
    } else {
      const onResolved = () => scheduleOpen();
      window.addEventListener(COOKIE_CONSENT_RESOLVED_EVENT, onResolved, { once: true });
      return () => window.removeEventListener(COOKIE_CONSENT_RESOLVED_EVENT, onResolved);
    }

    return () => clearTimeout(timeoutId);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setShowConfirmClose(false);
    localStorage.setItem("hasSeenWelcomeModal", "true");
  };

  const handleXClick = () => {
    setShowConfirmClose(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      await invokeFunction("subscribe-newsletter", { email, withDiscount: true });

      toast({
        title: "Welcome to AZACH!",
        description: "Check your email for your 15% discount code.",
      });
      handleClose();
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "We couldn't send your discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleXClick()}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <button
            onClick={handleXClick}
            className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        
        <div className="relative bg-secondary text-secondary-foreground p-8 pb-12">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-secondary to-secondary/80" />
          <div className="relative z-10 text-center space-y-2">
            <DialogTitle className="text-3xl font-semibold">Welcome to AZACH</DialogTitle>
            <DialogDescription className="text-secondary-foreground/90 text-lg">
              Join our exclusive community
            </DialogDescription>
          </div>
        </div>

        <div className="p-8 -mt-6 relative z-10">
          <div className="bg-background rounded-lg shadow-lg p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-block px-4 py-2 bg-muted rounded-full">
                <p className="text-2xl font-semibold">15% OFF</p>
              </div>
              <p className="text-muted-foreground">
                Sign up for our newsletter and get 15% off your first order
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? "border-destructive" : ""}
                />
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Get My Discount"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to receive marketing emails from AZACH
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Confirmation Modal */}
    <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="relative bg-secondary text-secondary-foreground p-8 pb-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-secondary to-secondary/80" />
          <div className="relative z-10 text-center space-y-3">
            <div className="text-6xl font-semibold">15% OFF</div>
            <DialogTitle className="text-3xl font-semibold">Wait! Don't Miss Out</DialogTitle>
          </div>
        </div>

        <div className="p-8 -mt-4 relative z-10">
          <div className="bg-background rounded-lg shadow-lg p-6 space-y-5">
            <div className="text-center">
              <p className="text-muted-foreground text-base">
                This exclusive offer won't last forever. Get your discount code now!
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <Button
                size="lg"
                className="w-full text-base"
                onClick={() => setShowConfirmClose(false)}
              >
                Yes! I Want My 15% Off
              </Button>
              <button
                onClick={handleClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline py-2"
              >
                No thanks, I don't want to save 15%
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1 border-t pt-4">
              <div className="flex items-center gap-1">
                <span className="text-green-600">✓</span> No spam
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600">✓</span> Exclusive deals
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600">✓</span> Unsubscribe anytime
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
