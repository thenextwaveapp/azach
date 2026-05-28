import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const DonateGarments = () => {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Donate Garments - AZACH";
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    emailWhatsApp: "",
    donationType: "",
    pieceCount: "",
    files: null as FileList | null,
    pickupDropoff: "",
    location: "",
    additionalNotes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      files: e.target.files,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.emailWhatsApp || !formData.donationType) {
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
      description: "Your donation request has been received. We'll contact you soon to arrange the details.",
    });

    // Reset form
    setFormData({
      fullName: "",
      emailWhatsApp: "",
      donationType: "",
      pieceCount: "",
      files: null,
      pickupDropoff: "",
      location: "",
      additionalNotes: "",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-semibold mb-6 uppercase tracking-tight">
              Donation
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-6">
              Give your pieces another life.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Not everything needs to be thrown away. Through our donation initiative, we create a system where your unused garments can still serve a purpose, either within the community or through our production process.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-12 text-center uppercase tracking-tight">
              How It Works
            </h3>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Send or drop off your items</h4>
                <p className="text-sm text-muted-foreground">You can donate pieces you no longer wear but are ready to pass on.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">We sort every item</h4>
                <p className="text-sm text-muted-foreground">Each piece is carefully reviewed and separated based on condition and usability.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Two possible paths</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Wearable pieces:</strong> Donated to charities and individuals within our community.<br/><br/>
                  <strong>Non-wearable pieces:</strong> Broken down and repurposed into future AZACH pieces through our upcycling process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-semibold mb-8 uppercase tracking-tight">
              Why This Matters
            </h3>
            <p className="text-xl text-muted-foreground mb-8">
              Clothing doesn't end when you're done with it.
            </p>
            <div className="text-left space-y-4 text-lg">
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>Reduce textile waste</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>Extend the life of garments</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>Support people within our community</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>Feed back into our circular production system</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Donate */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-semibold mb-8 text-center uppercase tracking-tight">
              What to Donate
            </h3>

            <div className="space-y-6">
              <div className="p-6 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3 text-lg">We accept:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Denim</li>
                  <li>• Wearable clothing</li>
                  <li>• Pieces with potential for reuse or reconstruction</li>
                </ul>
              </div>

              <div className="p-6 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3 text-lg">Please avoid:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Extremely damaged or contaminated items</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-muted rounded-lg text-center">
              <h4 className="font-semibold mb-3">A Shared Responsibility</h4>
              <p className="text-muted-foreground">
                This is not just about giving things away; it's about being intentional with what we no longer need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-semibold mb-4 uppercase tracking-tight">
                Make a Donation
              </h3>
              <p className="text-lg text-muted-foreground">
                Ready to pass something on?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailWhatsApp">Email / WhatsApp *</Label>
                    <Input
                      id="emailWhatsApp"
                      type="text"
                      placeholder="your.email@example.com or +234 XXX XXX XXXX"
                      value={formData.emailWhatsApp}
                      onChange={(e) => handleInputChange("emailWhatsApp", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donationType">What would you like to donate? *</Label>
                    <Select
                      value={formData.donationType}
                      onValueChange={(value) => handleInputChange("donationType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="denim">Denim</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="mixed">Mixed items</SelectItem>
                        <SelectItem value="not-sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pieceCount">About how many pieces? *</Label>
                    <Select
                      value={formData.pieceCount}
                      onValueChange={(value) => handleInputChange("pieceCount", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1–5</SelectItem>
                        <SelectItem value="5-10">5–10</SelectItem>
                        <SelectItem value="10+">10+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files">Upload images (optional)</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload photos of the items you're donating
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupDropoff">Pickup or Drop-off? *</Label>
                    <Select
                      value={formData.pickupDropoff}
                      onValueChange={(value) => handleInputChange("pickupDropoff", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drop-off">I'll drop it off</SelectItem>
                        <SelectItem value="pickup">I need pickup assistance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional notes (optional)</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any other details..."
                      className="min-h-[100px]"
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#a97c50] hover:bg-[#8b6440] text-white uppercase font-semibold"
                    size="lg"
                  >
                    Start Donation
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DonateGarments;
