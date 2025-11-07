import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { X } from "lucide-react";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email must be less than 255 characters" }),
});

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenWelcomeModal");
    if (!hasSeenModal) {
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcomeModal", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse({ email });
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    toast({
      title: "Welcome to AZACH!",
      description: "Check your email for your 15% discount code.",
    });
    
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="relative bg-secondary text-secondary-foreground p-8 pb-12">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-secondary to-secondary/80" />
          <div className="relative z-10 text-center space-y-2">
            <DialogTitle className="text-3xl font-bold">Welcome to AZACH</DialogTitle>
            <DialogDescription className="text-secondary-foreground/90 text-lg">
              Join our exclusive community
            </DialogDescription>
          </div>
        </div>

        <div className="p-8 -mt-6 relative z-10">
          <div className="bg-background rounded-lg shadow-lg p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-block px-4 py-2 bg-muted rounded-full">
                <p className="text-2xl font-bold">15% OFF</p>
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
              <Button type="submit" className="w-full">
                Get My Discount
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to receive marketing emails from AZACH
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
