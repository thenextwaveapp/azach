import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you for subscribing!",
      description: "You'll receive our latest updates and exclusive offers.",
    });
    setEmail("");
  };

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Stay Updated</h2>
          <p className="text-lg text-muted-foreground">
            Subscribe to our newsletter for exclusive offers and fashion insights
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="hover:bg-[#a97c50] transition-colors">Subscribe</Button>
          </form>
        </div>
      </div>
    </section>
  );
};
