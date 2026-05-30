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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Bespoke = () => {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Custom (Bespoke) - AZACH";
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    emailWhatsApp: "",
    whatToCreate: "",
    ideaDescription: "",
    files: null as FileList | null,
    silhouetteType: "",
    location: "",
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

    if (!formData.fullName || !formData.emailWhatsApp || !formData.whatToCreate || !formData.ideaDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log("Custom Request:", formData);
    toast({
      title: "Request Submitted!",
      description: "We'll get back to you soon to discuss your custom piece.",
    });

    // Reset form
    setFormData({
      fullName: "",
      emailWhatsApp: "",
      whatToCreate: "",
      ideaDescription: "",
      files: null,
      silhouetteType: "",
      location: "",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <img
              src="/header-custom.png"
              alt="Custom (Bespoke)"
              className="w-full max-w-2xl mx-auto mb-6"
            />
            <h2 className="text-2xl md:text-3xl font-light mb-6">
              Create Something New
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Custom is for people who want a completely new piece made with AZACH.<br />
              You bring the idea, reference, or vision — we work with you to create a one-off piece using our reconstruction style and existing AZACH silhouettes.
            </p>
          </div>
        </div>
      </section>

      {/* This Is For You Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-center">This is for you if:</h3>
            <div className="space-y-3 text-lg">
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>You want a new custom piece</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>You have an idea or inspiration</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>You want something made specifically for you</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>You want a one-of-one AZACH piece</span>
              </p>
            </div>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Important Notes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pieces are created using existing AZACH silhouettes</li>
                <li>• Fully new/custom silhouettes outside our standard designs come at an additional cost</li>
                <li>• Denim shades and textures may vary due to upcycling</li>
                <li>• Available worldwide</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How Custom Works */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-12 text-center uppercase tracking-tight">
              How Custom Works
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Start the conversation</h4>
                <p className="text-sm text-muted-foreground">Tell us what you want to create.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">Share your idea</h4>
                <p className="text-sm text-muted-foreground">Send references, sketches, inspiration, or concepts.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Choose your silhouette</h4>
                <p className="text-sm text-muted-foreground">Select from available AZACH silhouettes.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  4
                </div>
                <h4 className="font-semibold mb-2">Measurements & fit</h4>
                <p className="text-sm text-muted-foreground">We take your measurements for the right fit.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  5
                </div>
                <h4 className="font-semibold mb-2">Design approval</h4>
                <p className="text-sm text-muted-foreground">We confirm all details before production.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  6
                </div>
                <h4 className="font-semibold mb-2">Production</h4>
                <p className="text-sm text-muted-foreground">Your piece is made within 7–10 working days.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  7
                </div>
                <h4 className="font-semibold mb-2">Delivery</h4>
                <p className="text-sm text-muted-foreground">Your piece gets shipped to you once ready.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Request Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-semibold mb-4 uppercase tracking-tight">
                Custom Request Form
              </h3>
              <p className="text-lg text-muted-foreground">
                Let's create something together.
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
                    <Label htmlFor="whatToCreate">What would you like to create? *</Label>
                    <Select
                      value={formData.whatToCreate}
                      onValueChange={(value) => handleInputChange("whatToCreate", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="jacket">Jacket</SelectItem>
                        <SelectItem value="full-look">Full Look</SelectItem>
                        <SelectItem value="bag-accessory">Bag / Accessory</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ideaDescription">Tell us about your idea *</Label>
                    <Textarea
                      id="ideaDescription"
                      placeholder="Describe your vision, references, or concept..."
                      className="min-h-[120px]"
                      value={formData.ideaDescription}
                      onChange={(e) => handleInputChange("ideaDescription", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files">Upload references (optional)</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload images, sketches, or inspiration references
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="silhouetteType">Do you want to use: *</Label>
                    <Select
                      value={formData.silhouetteType}
                      onValueChange={(value) => handleInputChange("silhouetteType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing">Existing AZACH silhouette</SelectItem>
                        <SelectItem value="custom">Fully custom silhouette</SelectItem>
                        <SelectItem value="not-sure">Not sure yet</SelectItem>
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

                  <Button
                    type="submit"
                    className="w-full bg-[#a97c50] hover:bg-[#8b6440] text-white uppercase font-semibold"
                    size="lg"
                  >
                    Start Your Request
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

export default Bespoke;
