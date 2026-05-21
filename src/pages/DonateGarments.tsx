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
import { Recycle, Heart, Leaf } from "lucide-react";

const DonateGarments = () => {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Donate Garments - AZACH";
    window.scrollTo(0, 120);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    itemCount: "",
    itemTypes: "",
    condition: "",
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

    if (!formData.name || !formData.email || !formData.itemTypes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log("Donation Request:", formData);
    toast({
      title: "Thank You!",
      description: "Your donation request has been received. We'll contact you soon to arrange pickup or drop-off.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      itemCount: "",
      itemTypes: "",
      condition: "",
      additionalNotes: "",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <OptimizedImage
          src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
          alt="Donate Garments"
          aspectRatio="landscape"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-semibold mb-4 uppercase">Donate Garments</h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
            Give your pieces another life.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-muted-foreground mb-8">
              Not everything needs to be thrown away. Through our donation initiative, we create a system where your unused garments can still serve a purpose — either within the community or through our production process.
            </p>
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-3">A Shared Responsibility</h3>
              <p className="text-muted-foreground">
                This is not just about giving things away — it's about being intentional with what we no longer need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 uppercase">How It Works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-semibold mb-4">
                    1
                  </div>
                  <CardTitle>Send or Drop Off</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Donate pieces you no longer wear but are ready to pass on.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-semibold mb-4">
                    2
                  </div>
                  <CardTitle>We Sort Every Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Each piece is carefully reviewed and separated based on condition and usability.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-semibold mb-4">
                    3
                  </div>
                  <CardTitle>Two Possible Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-foreground">Wearable pieces:</strong> Donated to charities and individuals within our community.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Non-wearable pieces:</strong> Broken down and repurposed into future AZACH pieces through our upcycling process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 uppercase">Why This Matters</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Clothing doesn't end when you're done with it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-muted">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Recycle className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Reduce textile waste</li>
                    <li>• Extend the life of garments</li>
                    <li>• Feed back into our circular production system</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardHeader>
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                  <CardTitle>Community Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Support people within our community</li>
                    <li>• Give garments a second life</li>
                    <li>• Create meaningful impact</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What We Accept Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">What We Accept</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-green-600">✓ We Accept</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Denim jeans, jackets, and shirts (any condition)</li>
                    <li>• Cotton t-shirts and tops</li>
                    <li>• Casual wear and everyday clothing</li>
                    <li>• Vintage or retro pieces</li>
                    <li>• Bags and accessories</li>
                    <li>• Fabric scraps and remnants</li>
                    <li>• Gently worn or damaged items</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-red-600">✗ We Cannot Accept</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Heavily soiled or contaminated items</li>
                    <li>• Undergarments and swimwear</li>
                    <li>• Items with mold or mildew</li>
                    <li>• Formal wear (tuxedos, gowns)</li>
                    <li>• Synthetic athletic wear</li>
                    <li>• Items beyond repair</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-16 bg-gradient-to-b from-muted to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 uppercase">Make a Donation</h2>
              <p className="text-lg text-muted-foreground">
                Ready to pass something on? Fill out the form below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Contact Information */}
              <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle>1. Contact Information</CardTitle>
                  <CardDescription>How can we reach you?</CardDescription>
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
                      placeholder="+234 (XXX) XXX-XXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Donation Method */}
              {formData.name && formData.email && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>2. Donation Method</CardTitle>
                    <CardDescription>How would you like to donate?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-24 flex flex-col gap-2 ${
                          formData.address
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => {
                          if (!formData.address) {
                            handleInputChange("address", "pending");
                          }
                        }}
                      >
                        <strong>Pickup Service</strong>
                        <span className="text-xs">We come to you</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-24 flex flex-col gap-2 ${
                          formData.address === "drop-off"
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => handleInputChange("address", "drop-off")}
                      >
                        <strong>Drop-Off</strong>
                        <span className="text-xs">Visit our Lagos studio</span>
                      </Button>
                    </div>

                    {formData.address && formData.address !== "drop-off" && (
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="address">Pickup Address (Lagos only) *</Label>
                        <Textarea
                          id="address"
                          placeholder="Street address, area, Lagos"
                          className="min-h-[80px]"
                          value={formData.address === "pending" ? "" : formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Item Details */}
              {formData.address && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>3. Item Details</CardTitle>
                    <CardDescription>Tell us about what you're donating</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemCount">Approximate Number of Items</Label>
                      <Input
                        id="itemCount"
                        type="number"
                        placeholder="e.g., 5"
                        value={formData.itemCount}
                        onChange={(e) => handleInputChange("itemCount", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemTypes">Types of Items *</Label>
                      <Textarea
                        id="itemTypes"
                        placeholder="e.g., 3 denim jackets, 2 jeans, 5 t-shirts, cotton tops"
                        className="min-h-[100px]"
                        value={formData.itemTypes}
                        onChange={(e) => handleInputChange("itemTypes", e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Condition */}
              {formData.itemTypes && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>4. Overall Condition</CardTitle>
                    <CardDescription>What condition are the items in?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-20 flex flex-col gap-1 ${
                          formData.condition === "excellent"
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => handleInputChange("condition", "excellent")}
                      >
                        <strong>Excellent</strong>
                        <span className="text-xs">Like new</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-20 flex flex-col gap-1 ${
                          formData.condition === "good"
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => handleInputChange("condition", "good")}
                      >
                        <strong>Good</strong>
                        <span className="text-xs">Gently worn</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-20 flex flex-col gap-1 ${
                          formData.condition === "worn"
                            ? "bg-foreground text-background border-foreground"
                            : ""
                        }`}
                        onClick={() => handleInputChange("condition", "worn")}
                      >
                        <strong>Worn/Damaged</strong>
                        <span className="text-xs">For upcycling</span>
                      </Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="additionalNotes"
                        placeholder="Any other details about the items or special requests..."
                        className="min-h-[80px]"
                        value={formData.additionalNotes}
                        onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit */}
              {formData.condition && (
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Link to="/customer-service">
                    <Button type="button" variant="outline">
                      Questions? Contact Us
                    </Button>
                  </Link>
                  <Button type="submit" size="lg" className="px-8">
                    Submit Donation Request
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">How It Works</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Drop-Off</CardTitle>
                  <CardDescription>Visit our Lagos studio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Bring your donations directly to our studio in Lagos, Nigeria.</p>
                  <p className="text-foreground font-medium">Hours: Mon-Fri, 10am-6pm</p>
                  <p className="text-foreground font-medium">Location: Contact us for address</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Pickup Service</CardTitle>
                  <CardDescription>We come to you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>For larger donations or if you're unable to visit us, we offer free pickup service in the Lagos area.</p>
                  <p>Submit the form above and we'll schedule a convenient time.</p>
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

export default DonateGarments;
