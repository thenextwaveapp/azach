import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { invokeFunction } from "@/lib/functionError";
import { trackGenerateLead } from "@/lib/analytics";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await invokeFunction("subscribe-newsletter", { email });
      trackGenerateLead("newsletter");
      toast({
        title: "Thank you for subscribing!",
        description: "You'll receive our latest updates and exclusive offers.",
      });
      setEmail("");
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "We couldn't subscribe that email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-8 bg-white border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-6">
          {/* Left: Stay Connected */}
          <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-wide">Stay Connected</h2>

            {/* Center: Email Form */}
            <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto md:flex-1 max-w-md">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button type="submit" disabled={submitting} className="bg-[#a97c50] hover:bg-[#8b6440] transition-colors disabled:opacity-60">
                {submitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>

            {/* Right: Social Media Icons */}
            <div className="flex gap-6 items-center">
              <a href="https://www.instagram.com/azachng" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/instagram.webp" alt="Instagram" className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://www.tiktok.com/@azachng" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/tiktok.webp" alt="TikTok" className="h-6 w-6" />
                <span className="sr-only">TikTok</span>
              </a>
              <a href="https://x.com/azachng?s=11" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/x.webp" alt="X" className="h-6 w-6" />
                <span className="sr-only">X</span>
              </a>
              <a href="https://www.facebook.com/share/18yazwSQ52/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/facebook.webp" alt="Facebook" className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
          </div>
        </div>
      </div>
    </section>
  );
};
