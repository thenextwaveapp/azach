import { Header } from "@/components/Header";
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

const Rework = () => {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Rework & Repair (RRS) - AZACH";
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    serviceType: "",
    pieceType: "",
    workDescription: "",
    files: null as FileList | null,
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

    if (!formData.fullName || !formData.email || !formData.serviceType || !formData.workDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log("RRS Request:", formData);
    toast({
      title: "Request Submitted!",
      description: "We'll contact you soon to discuss your rework/repair needs.",
    });

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      whatsapp: "",
      serviceType: "",
      pieceType: "",
      workDescription: "",
      files: null,
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
            <h1 className="text-4xl md:text-6xl font-semibold mb-6 uppercase tracking-tight">
              Rework & Repair (RRS)
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-6">
              Transform What You Already Own
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              RRS is for people who already have garments they want to update, repair, or reconstruct.<br />
              Instead of starting from scratch, we work with your existing piece and give it a new life through reconstruction and redesign.
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
                <span>You have denim you want transformed</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>Your garment needs repair or adjustment</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>You want to redesign an existing piece</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#a97c50]">•</span>
                <span>You want to extend the life of something you already wear</span>
              </p>
            </div>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Important Notes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pieces are reworked using existing AZACH silhouettes and reconstruction styles</li>
                <li>• Fully custom redesigns outside our standard styles come at an additional cost</li>
                <li>• Currently available only within Lagos, Nigeria</li>
                <li>• Denim shades and textures may vary due to upcycling</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How RRS Works */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-12 text-center uppercase tracking-tight">
              How RRS Works
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Start the conversation</h4>
                <p className="text-sm text-muted-foreground">Tell us about the piece you want reworked or repaired.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">Send or drop off your item</h4>
                <p className="text-sm text-muted-foreground">RRS is currently Lagos-only.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Choose your reconstruction style</h4>
                <p className="text-sm text-muted-foreground">We guide you through the best AZACH silhouette or redesign direction.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  4
                </div>
                <h4 className="font-semibold mb-2">Measurements & adjustments</h4>
                <p className="text-sm text-muted-foreground">We confirm fit and changes needed.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  5
                </div>
                <h4 className="font-semibold mb-2">Design approval</h4>
                <p className="text-sm text-muted-foreground">We finalize all details before production.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  6
                </div>
                <h4 className="font-semibold mb-2">Rework process</h4>
                <p className="text-sm text-muted-foreground">Your piece is reconstructed within 7–10 working days.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#a97c50] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  7
                </div>
                <h4 className="font-semibold mb-2">Delivery / Pickup</h4>
                <p className="text-sm text-muted-foreground">Your updated piece is delivered or picked up once ready.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-semibold mb-8 uppercase tracking-tight">
              What to Expect
            </h3>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>Every piece is one-of-one</p>
              <p>Upcycled materials naturally vary in shade and texture</p>
              <p>Each piece is built through collaboration and process</p>
              <p>Thoughtful craftsmanship takes time and attention</p>
            </div>
          </div>
        </div>
      </section>

      {/* RRS Request Form */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-semibold mb-4 uppercase tracking-tight">
                RRS Request Form
              </h3>
              <p className="text-lg text-muted-foreground">
                Let's give your piece a new life.
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
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      type="text"
                      placeholder="+234 XXX XXX XXXX"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceType">What would you like us to work on? *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange("serviceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="rework-redesign">Rework / Redesign</SelectItem>
                        <SelectItem value="adjustment">Adjustment / Resizing</SelectItem>
                        <SelectItem value="not-sure">Not sure yet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pieceType">What type of piece is it? *</Label>
                    <Select
                      value={formData.pieceType}
                      onValueChange={(value) => handleInputChange("pieceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jeans">Jeans</SelectItem>
                        <SelectItem value="jacket">Jacket</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bag">Bag</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workDescription">Tell us what you want done *</Label>
                    <Textarea
                      id="workDescription"
                      placeholder="Describe what you want us to do with your piece..."
                      className="min-h-[120px]"
                      value={formData.workDescription}
                      onChange={(e) => handleInputChange("workDescription", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files">Upload images of the piece (optional)</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload photos of your garment
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Lagos, Nigeria"
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
                    Start RRS Request
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rework;
