import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Rework = () => {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Rework & Repair - AZACH";
    window.scrollTo(0, 120);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    itemDescription: "",
    additionalNotes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.serviceType || !formData.itemDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log("Rework Request:", formData);
    toast({
      title: "Request Submitted!",
      description: "We'll contact you soon to discuss your rework/repair needs.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      serviceType: "",
      itemDescription: "",
      additionalNotes: "",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <OptimizedImage
          src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
          alt="Rework & Repair"
          aspectRatio="landscape"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-semibold mb-4 uppercase">Rework & Repair</h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
            Start from what you already own.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">This is for you if:</h2>
            <div className="space-y-3 text-lg text-muted-foreground">
              <p>• You have denim you want to transform</p>
              <p>• Your piece needs adjustment, fixing, or redesign</p>
              <p>• You want to give new life to something you already wear</p>
            </div>
            <div className="mt-8 p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Your piece is reworked using our existing silhouettes and reconstruction styles.
                If you want a fully custom redesign outside our standard silhouettes, this will come at an additional cost.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                <strong className="text-foreground">Location:</strong> Due to logistics, Rework & Repair is currently available only within Lagos, Nigeria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Services</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We specialize in extending the life of your favorite pieces through expert repair and creative reworking
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Repair & Mending</CardTitle>
                  <CardDescription>Fix tears, replace zippers, patch holes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Zipper replacement</li>
                    <li>• Tear and rip repair</li>
                    <li>• Button replacement</li>
                    <li>• Seam reinforcement</li>
                    <li>• Patch work</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Alterations</CardTitle>
                  <CardDescription>Perfect fit for your garments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Hemming</li>
                    <li>• Taking in/letting out</li>
                    <li>• Sleeve adjustments</li>
                    <li>• Waist adjustments</li>
                    <li>• Length modifications</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Creative Rework</CardTitle>
                  <CardDescription>Transform old pieces into new styles</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Add custom patches</li>
                    <li>• Distressing & aging</li>
                    <li>• Color blocking</li>
                    <li>• Style transformation</li>
                    <li>• Embellishments</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section className="py-16 bg-gradient-to-b from-white to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Request a Service</h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you with a quote
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-20 ${
                          formData.serviceType === "repair"
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => handleInputChange("serviceType", "repair")}
                      >
                        Repair & Mending
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-20 ${
                          formData.serviceType === "alteration"
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => handleInputChange("serviceType", "alteration")}
                      >
                        Alterations
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-20 ${
                          formData.serviceType === "rework"
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => handleInputChange("serviceType", "rework")}
                      >
                        Creative Rework
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemDescription">Item Description *</Label>
                    <Textarea
                      id="itemDescription"
                      placeholder="Describe the item and what service you need (e.g., 'Blue denim jacket with broken zipper')"
                      className="min-h-[100px]"
                      value={formData.itemDescription}
                      onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any other details or special requests..."
                      className="min-h-[80px]"
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link to="/customer-service">
                  <Button type="button" variant="outline">
                    Questions? Contact Us
                  </Button>
                </Link>
                <Button type="submit" size="lg" className="px-8">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">1. Start the conversation:</strong> Fill the form with details about your item</p>
                  <p><strong className="text-foreground">2. Send your item:</strong> Drop off or send your piece to us (Lagos only)</p>
                  <p><strong className="text-foreground">3. Choose your silhouette:</strong> Select from our available AZACH silhouettes</p>
                  <p><strong className="text-foreground">4. Measurements & fit:</strong> We take your measurements to ensure proper fit</p>
                  <p><strong className="text-foreground">5. Design & approval:</strong> We confirm all details before production</p>
                  <p><strong className="text-foreground">6. Production:</strong> Your piece is made within 7–10 working days</p>
                  <p><strong className="text-foreground">7. Delivery:</strong> We return your transformed piece</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Pricing & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Pricing:</strong> Varies by service complexity. Simple repairs start at $20. We'll provide a quote before starting work.</p>
                  <p><strong className="text-foreground">Timeline:</strong> Most repairs take 1-2 weeks. Complex rework projects may take 3-4 weeks.</p>
                  <p><strong className="text-foreground">Rush Service:</strong> Available for an additional fee. Contact us for details.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
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

          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 AZACH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Rework;
