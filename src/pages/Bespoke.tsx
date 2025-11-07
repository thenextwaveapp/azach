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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Bespoke = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = "Bespoke Orders - AZACH";
    // Scroll down to position the title at the top on page load
    window.scrollTo(0, 120);
  }, []);

  const [formData, setFormData] = useState({
    category: "",
    itemType: "",
    denimColor: "",
    secondaryFabricColor: "",
    patchOption: "",
    styleOption: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      shoulders: "",
      sleeveLength: "",
      inseam: "",
      outseam: "",
      neck: "",
      shirtLength: "",
      pantLength: "",
      skirtLength: "",
    },
    notes: "",
  });

  const menUnisexItems = [
    "Jackets",
    "Vests",
    "Shirts",
    "Bags",
    "Pants",
    "Hats",
    "Tote Bags",
  ];

  const womenItems = [
    "Long-skirts",
    "Skirts",
    "Bottoms",
    "Tops",
  ];

  const denimColors = [
    "Light",
    "Dark",
    "Indigo",
    "Brown",
    "Black",
    "Grey",
  ];

  const secondaryFabricColors = [
    "Red",
    "Pink",
    "Orange",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "White",
    "Black",
  ];

  const patchOptions = [
    "Classic AZACH Logo",
    "Vintage AZACH",
    "Minimalist AZACH",
    "Bold AZACH",
    "Custom Text",
    "No Patch",
  ];

  const getStyleOptions = () => {
    if (formData.itemType === "Shirts") {
      return ["Arizona Shirt", "Classic Shirt", "Oversized Shirt", "Fitted Shirt"];
    } else if (formData.itemType === "Pants") {
      return ["Patchwork Pant", "Classic Pant", "Wide Leg Pant", "Slim Fit Pant"];
    } else if (formData.itemType === "Jackets") {
      return ["Classic Jacket", "Denim Jacket", "Varsity Style", "Oversized Jacket"];
    } else if (formData.itemType === "Vests") {
      return ["Classic Vest", "Denim Vest", "Quilted Vest"];
    } else if (formData.itemType === "Tops") {
      return ["Classic Top", "Crop Top", "Oversized Top", "Fitted Top"];
    } else if (formData.itemType === "Bottoms" || formData.itemType === "Skirts" || formData.itemType === "Long-skirts") {
      return ["Classic Style", "A-Line", "Pencil", "Flared"];
    }
    return [];
  };

  const getItemTypeImage = () => {
    if (!formData.itemType) {
      // Fallback to category images
      if (formData.category === "men-unisex") {
        return "https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg";
      } else if (formData.category === "women") {
        return "https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg";
      }
      return null;
    }

    // Item type specific images
    const imageMap: Record<string, string> = {
      // Men/Unisex items
      "Jackets": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070",
      "Vests": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2070",
      "Shirts": "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=2070",
      "Bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070",
      "Pants": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2070",
      "Hats": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2070",
      "Tote Bags": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2070",
      // Women items
      "Long-skirts": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2070",
      "Skirts": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2070",
      "Bottoms": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=2070",
      "Tops": "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=2070",
    };

    return imageMap[formData.itemType] || null;
  };

  const getStyleImage = () => {
    if (!formData.styleOption) return null;

    // Style-specific images
    const styleImageMap: Record<string, string> = {
      // Shirt styles
      "Arizona Shirt": "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=500",
      "Classic Shirt": "https://images.unsplash.com/photo-1594938291221-94f18c0d0edb?q=80&w=500",
      "Oversized Shirt": "https://images.unsplash.com/photo-1602810318383-e386a2a75157?q=80&w=500",
      "Fitted Shirt": "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=500",
      // Pant styles
      "Patchwork Pant": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=500",
      "Classic Pant": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=500",
      "Wide Leg Pant": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=500",
      "Slim Fit Pant": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=500",
      // Jacket styles
      "Classic Jacket": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500",
      "Denim Jacket": "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=500",
      "Varsity Style": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500",
      "Oversized Jacket": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500",
      // Vest styles
      "Classic Vest": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500",
      "Denim Vest": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500",
      "Quilted Vest": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500",
      // Top styles
      "Classic Top": "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=500",
      "Crop Top": "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=500",
      "Oversized Top": "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=500",
      "Fitted Top": "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=500",
      // Skirt/Bottom styles
      "Classic Style": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=500",
      "A-Line": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=500",
      "Pencil": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=500",
      "Flared": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=500",
    };

    return styleImageMap[formData.styleOption] || null;
  };

  const getStyleDescription = () => {
    if (!formData.styleOption) return null;

    const descriptions: Record<string, { description: string; fit: string; denimColor: string; fabric: string; patch: string }> = {
      "Arizona Shirt": {
        description: "A bold statement piece featuring unique patchwork detailing and vintage-inspired design.",
        fit: "Relaxed fit with slightly dropped shoulders for a comfortable, street-ready silhouette.",
        denimColor: "Recommended: Indigo or Dark denim for maximum contrast with patchwork accents.",
        fabric: "Works beautifully with Red, Orange, or Blue secondary fabrics for vibrant energy.",
        patch: "Bold AZACH or Vintage AZACH patches complement this style perfectly."
      },
      "Classic Shirt": {
        description: "Timeless design with clean lines and versatile styling options.",
        fit: "Standard fit with traditional tailoring for a polished, everyday look.",
        denimColor: "Light or Indigo denim creates a fresh, classic aesthetic.",
        fabric: "Neutral tones like White, Black, or subtle Blue work best.",
        patch: "Classic AZACH Logo or Minimalist AZACH for understated elegance."
      },
      "Oversized Shirt": {
        description: "Contemporary oversized silhouette perfect for layering and street style.",
        fit: "Generous fit with extended length and relaxed shoulders for effortless cool.",
        denimColor: "Dark or Black denim provides a sleek, modern foundation.",
        fabric: "Bold colors like Red, Orange, or Pink add playful contrast.",
        patch: "Bold AZACH or Custom Text patches for a statement look."
      },
      "Fitted Shirt": {
        description: "Tailored silhouette that accentuates your form with precision craftsmanship.",
        fit: "Slim fit with structured shoulders for a refined, body-conscious shape.",
        denimColor: "Indigo or Brown denim offers sophisticated depth.",
        fabric: "Subtle accents in Blue, Purple, or White maintain elegance.",
        patch: "Minimalist AZACH or Classic AZACH Logo for refined detail."
      },
      "Patchwork Pant": {
        description: "Artisanal patchwork design showcasing upcycled denim in creative patterns.",
        fit: "Straight leg with comfortable waist for versatile styling.",
        denimColor: "Mix of Light, Dark, and Indigo creates the signature patchwork effect.",
        fabric: "Accent patches in Red, Orange, or Blue enhance the patchwork aesthetic.",
        patch: "Multiple Bold AZACH patches or Vintage AZACH for maximum impact."
      },
      "Classic Pant": {
        description: "Essential straight-leg design with timeless appeal and durability.",
        fit: "Standard fit through hip and thigh, straight leg opening.",
        denimColor: "Classic Indigo or Dark denim for everyday versatility.",
        fabric: "Minimal secondary fabric - Black or White for subtle contrast.",
        patch: "Classic AZACH Logo or no patch for clean simplicity."
      },
      "Wide Leg Pant": {
        description: "Modern wide-leg silhouette with flowing movement and contemporary edge.",
        fit: "Relaxed through hip and thigh, dramatic wide leg opening.",
        denimColor: "Light or Grey denim creates a fresh, airy feel.",
        fabric: "Bold secondary fabrics like Red, Orange, or Pink for statement style.",
        patch: "Bold AZACH or Custom Text for a fashion-forward look."
      },
      "Slim Fit Pant": {
        description: "Streamlined silhouette with modern tailoring and sleek lines.",
        fit: "Tapered fit from hip to ankle for a contemporary, body-conscious shape.",
        denimColor: "Dark or Black denim for a sleek, sophisticated look.",
        fabric: "Subtle accents in Blue, Purple, or White maintain the clean aesthetic.",
        patch: "Minimalist AZACH or Classic AZACH Logo for refined detail."
      },
      "Classic Jacket": {
        description: "Versatile outerwear piece with timeless design and functional details.",
        fit: "Standard fit with structured shoulders and comfortable room for layering.",
        denimColor: "Indigo or Dark denim for classic appeal.",
        fabric: "Neutral secondary fabrics like Black, White, or subtle Blue.",
        patch: "Classic AZACH Logo or Vintage AZACH for heritage feel."
      },
      "Denim Jacket": {
        description: "Iconic denim jacket reimagined through upcycling with unique character.",
        fit: "Relaxed fit with slightly boxy silhouette for casual comfort.",
        denimColor: "Classic Indigo or Light denim for traditional denim jacket aesthetic.",
        fabric: "Contrasting patches in Red, Orange, or Blue add personality.",
        patch: "Bold AZACH or Vintage AZACH patches on chest and back."
      },
      "Varsity Style": {
        description: "Sporty varsity-inspired design with bold color blocking and athletic details.",
        fit: "Relaxed fit with slightly oversized silhouette for street style appeal.",
        denimColor: "Dark or Black denim as the base for high contrast.",
        fabric: "Vibrant secondary fabrics in Red, Blue, or Orange for varsity stripes.",
        patch: "Bold AZACH patches on sleeves or chest for team spirit."
      },
      "Oversized Jacket": {
        description: "Statement oversized jacket with dramatic proportions and modern edge.",
        fit: "Generous fit with extended length and dropped shoulders for maximum impact.",
        denimColor: "Dark or Black denim creates a sleek, powerful silhouette.",
        fabric: "Bold secondary fabrics like Red, Orange, or Pink for contrast.",
        patch: "Large Bold AZACH or Custom Text patches for maximum visibility."
      },
      "Classic Vest": {
        description: "Versatile layering piece with clean lines and timeless appeal.",
        fit: "Standard fit with comfortable armholes for easy layering.",
        denimColor: "Indigo or Light denim for a fresh, casual look.",
        fabric: "Subtle secondary fabrics in Black, White, or Blue.",
        patch: "Classic AZACH Logo or Minimalist AZACH for subtle branding."
      },
      "Denim Vest": {
        description: "Sleeveless denim vest perfect for layering and street style.",
        fit: "Relaxed fit with open sides for ventilation and movement.",
        denimColor: "Classic Indigo or Dark denim for traditional appeal.",
        fabric: "Contrasting patches in Red, Orange, or Blue add edge.",
        patch: "Bold AZACH or Vintage AZACH patches on back panel."
      },
      "Quilted Vest": {
        description: "Textured quilted design with dimensional interest and warmth.",
        fit: "Standard fit with structured quilting for shape retention.",
        denimColor: "Dark or Brown denim provides rich, earthy tones.",
        fabric: "Warm secondary fabrics in Orange, Red, or Yellow for cozy feel.",
        patch: "Classic AZACH Logo or Vintage AZACH for artisanal touch."
      },
      "Classic Top": {
        description: "Essential top with versatile styling and comfortable fit.",
        fit: "Standard fit with comfortable ease for everyday wear.",
        denimColor: "Light or Indigo denim creates a fresh, feminine look.",
        fabric: "Soft secondary fabrics in Pink, Blue, or White.",
        patch: "Classic AZACH Logo or Minimalist AZACH for subtle elegance."
      },
      "Crop Top": {
        description: "Modern cropped silhouette perfect for layering and contemporary styling.",
        fit: "Fitted through body with cropped length for versatile pairing.",
        denimColor: "Light or Indigo denim for a fresh, youthful aesthetic.",
        fabric: "Playful secondary fabrics in Pink, Orange, or Yellow.",
        patch: "Bold AZACH or Custom Text for statement style."
      },
      "Oversized Top": {
        description: "Relaxed oversized top with effortless drape and modern appeal.",
        fit: "Generous fit with extended length for comfortable, laid-back style.",
        denimColor: "Dark or Grey denim for a sophisticated, modern look.",
        fabric: "Bold secondary fabrics in Red, Orange, or Pink for energy.",
        patch: "Bold AZACH or Vintage AZACH for street style edge."
      },
      "Fitted Top": {
        description: "Tailored top that accentuates your silhouette with precision fit.",
        fit: "Slim fit with structured seams for a body-conscious shape.",
        denimColor: "Indigo or Dark denim for sophisticated depth.",
        fabric: "Elegant secondary fabrics in Blue, Purple, or White.",
        patch: "Minimalist AZACH or Classic AZACH Logo for refined detail."
      },
      "Classic Style": {
        description: "Timeless skirt design with versatile styling and elegant silhouette.",
        fit: "Standard fit through waist with comfortable ease through hips.",
        denimColor: "Light or Indigo denim for a fresh, classic look.",
        fabric: "Soft secondary fabrics in Pink, Blue, or White.",
        patch: "Classic AZACH Logo or Minimalist AZACH for subtle elegance."
      },
      "A-Line": {
        description: "Flattering A-line silhouette that flows gracefully from waist to hem.",
        fit: "Fitted at waist, gradually flares to create the A-line shape.",
        denimColor: "Light or Indigo denim enhances the flowing movement.",
        fabric: "Feminine secondary fabrics in Pink, Orange, or Yellow.",
        patch: "Classic AZACH Logo or Vintage AZACH for timeless appeal."
      },
      "Pencil": {
        description: "Sleek pencil silhouette with sophisticated tailoring and modern edge.",
        fit: "Fitted through hip and thigh, straight to hem for streamlined look.",
        denimColor: "Dark or Black denim for a sleek, sophisticated aesthetic.",
        fabric: "Elegant secondary fabrics in Blue, Purple, or White.",
        patch: "Minimalist AZACH or Classic AZACH Logo for refined detail."
      },
      "Flared": {
        description: "Dramatic flared silhouette with movement and retro-inspired appeal.",
        fit: "Fitted at waist and hip, dramatic flare from mid-thigh to hem.",
        denimColor: "Light or Indigo denim showcases the flared movement beautifully.",
        fabric: "Bold secondary fabrics in Red, Orange, or Pink for statement style.",
        patch: "Bold AZACH or Vintage AZACH for maximum impact."
      }
    };

    return descriptions[formData.styleOption] || null;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.category || !formData.itemType || !formData.denimColor) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Bespoke Order:", formData);
    toast({
      title: "Order Submitted!",
      description: "Your bespoke order has been received. We'll contact you soon!",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-32 pb-32 relative overflow-hidden min-h-screen">
        {/* Elegant Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f7] via-[#f5f3f0] to-[#f0ede8]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(169, 124, 80, 0.08) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(169, 124, 80, 0.05) 0%, transparent 50%)`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Bespoke Orders</h1>
              <p className="text-lg text-muted-foreground">
                Create your perfect custom piece with your measurements and style preferences
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle>1. Select Category</CardTitle>
                  <CardDescription>Choose your category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-20 focus:outline-none focus:ring-0 ${
                        formData.category === "men-unisex"
                          ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                          : "hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => {
                        handleInputChange("category", "men-unisex");
                        handleInputChange("itemType", "");
                        handleInputChange("styleOption", "");
                      }}
                    >
                      Men/Unisex
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-20 focus:outline-none focus:ring-0 ${
                        formData.category === "women"
                          ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                          : "hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => {
                        handleInputChange("category", "women");
                        handleInputChange("itemType", "");
                        handleInputChange("styleOption", "");
                      }}
                    >
                      Women
                    </Button>
                  </div>
                  
                  {/* Image Block */}
                  {formData.category && getItemTypeImage() && (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      <OptimizedImage
                        key={formData.itemType || formData.category}
                        src={getItemTypeImage() || ""}
                        alt={formData.itemType ? `${formData.itemType} Collection` : `${formData.category === "men-unisex" ? "Men's" : "Women's"} Collection`}
                        aspectRatio="landscape"
                        className="w-full h-full transition-opacity duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Item Type Selection */}
              {formData.category && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>2. Select Item Type</CardTitle>
                    <CardDescription>Choose the item you want to customize</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={formData.itemType}
                      onValueChange={(value) => {
                        handleInputChange("itemType", value);
                        handleInputChange("styleOption", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.category === "men-unisex" ? menUnisexItems : womenItems).map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Style Option */}
              {formData.itemType && getStyleOptions().length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>3. Select Style</CardTitle>
                    <CardDescription>Choose your preferred style</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <Select
                          value={formData.styleOption}
                          onValueChange={(value) => handleInputChange("styleOption", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a style" />
                          </SelectTrigger>
                          <SelectContent>
                            {getStyleOptions().map((style) => (
                              <SelectItem key={style} value={style}>
                                {style}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.styleOption && getStyleDescription() && (
                          <div className="mt-6 space-y-6 pr-8">
                            <div className="space-y-3">
                              <h4 className="text-lg font-display font-bold text-foreground tracking-tight">
                                {formData.styleOption}
                              </h4>
                              <p className="text-base leading-relaxed text-foreground/90 font-sans">
                                {getStyleDescription()?.description}
                              </p>
                            </div>
                            
                            <div className="space-y-4 pt-2 border-t border-border/50">
                              <div className="space-y-2">
                                <h5 className="text-sm font-display font-semibold text-foreground">
                                  Fit & Silhouette
                                </h5>
                                <p className="text-sm leading-relaxed text-muted-foreground font-sans">
                                  {getStyleDescription()?.fit}
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="text-sm font-display font-semibold text-foreground">
                                  Denim Recommendation
                                </h5>
                                <p className="text-sm leading-relaxed text-muted-foreground font-sans">
                                  {getStyleDescription()?.denimColor}
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="text-sm font-display font-semibold text-foreground">
                                  Secondary Fabric
                                </h5>
                                <p className="text-sm leading-relaxed text-muted-foreground font-sans">
                                  {getStyleDescription()?.fabric}
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="text-sm font-display font-semibold text-foreground">
                                  Patch Suggestion
                                </h5>
                                <p className="text-sm leading-relaxed text-muted-foreground font-sans">
                                  {getStyleDescription()?.patch}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {formData.styleOption && getStyleImage() && (
                        <div className="flex-shrink-0 w-96">
                          <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted shadow-md border border-border/20">
                            <OptimizedImage
                              key={formData.styleOption}
                              src={getStyleImage() || ""}
                              alt={formData.styleOption}
                              aspectRatio="square"
                              className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Color Selection */}
              {formData.itemType && (
                <>
                  <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                      <CardTitle>4. Denim Color</CardTitle>
                      <CardDescription>Choose your primary denim color</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {denimColors.map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant="outline"
                            onClick={() => handleInputChange("denimColor", color.toLowerCase())}
                            className={`capitalize focus:outline-none focus:ring-0 ${
                              formData.denimColor === color.toLowerCase()
                                ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                                : "hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                      <CardTitle>5. Accent Color</CardTitle>
                      <CardDescription>Choose an accent color (optional)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {secondaryFabricColors.map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant="outline"
                            onClick={() => handleInputChange(
                              "secondaryFabricColor",
                              formData.secondaryFabricColor === color.toLowerCase() ? "" : color.toLowerCase()
                            )}
                            className={`capitalize focus:outline-none focus:ring-0 ${
                              formData.secondaryFabricColor === color.toLowerCase()
                                ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                                : "hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Patch Selection */}
              {formData.itemType && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>6. AZACH Patch Option</CardTitle>
                    <CardDescription>Choose your custom patch style</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={formData.patchOption}
                      onValueChange={(value) => handleInputChange("patchOption", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patch option" />
                      </SelectTrigger>
                      <SelectContent>
                        {patchOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Measurements */}
              {formData.itemType && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>7. Your Measurements</CardTitle>
                    <CardDescription>Please provide your measurements in inches or centimeters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="chest">Chest (inches)</Label>
                        <Input
                          id="chest"
                          type="number"
                          placeholder="e.g., 40"
                          value={formData.measurements.chest}
                          onChange={(e) => handleInputChange("measurements.chest", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waist">Waist (inches)</Label>
                        <Input
                          id="waist"
                          type="number"
                          placeholder="e.g., 32"
                          value={formData.measurements.waist}
                          onChange={(e) => handleInputChange("measurements.waist", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hips">Hips (inches)</Label>
                        <Input
                          id="hips"
                          type="number"
                          placeholder="e.g., 38"
                          value={formData.measurements.hips}
                          onChange={(e) => handleInputChange("measurements.hips", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shoulders">Shoulders (inches)</Label>
                        <Input
                          id="shoulders"
                          type="number"
                          placeholder="e.g., 18"
                          value={formData.measurements.shoulders}
                          onChange={(e) => handleInputChange("measurements.shoulders", e.target.value)}
                        />
                      </div>
                      {(formData.itemType === "Shirts" || formData.itemType === "Tops" || formData.itemType === "Jackets" || formData.itemType === "Vests") && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="sleeveLength">Sleeve Length (inches)</Label>
                            <Input
                              id="sleeveLength"
                              type="number"
                              placeholder="e.g., 24"
                              value={formData.measurements.sleeveLength}
                              onChange={(e) => handleInputChange("measurements.sleeveLength", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shirtLength">Shirt/Top Length (inches)</Label>
                            <Input
                              id="shirtLength"
                              type="number"
                              placeholder="e.g., 28"
                              value={formData.measurements.shirtLength}
                              onChange={(e) => handleInputChange("measurements.shirtLength", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="neck">Neck (inches)</Label>
                            <Input
                              id="neck"
                              type="number"
                              placeholder="e.g., 16"
                              value={formData.measurements.neck}
                              onChange={(e) => handleInputChange("measurements.neck", e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      {(formData.itemType === "Pants" || formData.itemType === "Bottoms") && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="inseam">Inseam (inches)</Label>
                            <Input
                              id="inseam"
                              type="number"
                              placeholder="e.g., 32"
                              value={formData.measurements.inseam}
                              onChange={(e) => handleInputChange("measurements.inseam", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="outseam">Outseam (inches)</Label>
                            <Input
                              id="outseam"
                              type="number"
                              placeholder="e.g., 42"
                              value={formData.measurements.outseam}
                              onChange={(e) => handleInputChange("measurements.outseam", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pantLength">Pant Length (inches)</Label>
                            <Input
                              id="pantLength"
                              type="number"
                              placeholder="e.g., 40"
                              value={formData.measurements.pantLength}
                              onChange={(e) => handleInputChange("measurements.pantLength", e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      {(formData.itemType === "Skirts" || formData.itemType === "Long-skirts") && (
                        <div className="space-y-2">
                          <Label htmlFor="skirtLength">Skirt Length (inches)</Label>
                          <Input
                            id="skirtLength"
                            type="number"
                            placeholder="e.g., 24"
                            value={formData.measurements.skirtLength}
                            onChange={(e) => handleInputChange("measurements.skirtLength", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Notes */}
              {formData.itemType && (
                <Card className="bg-white/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>8. Additional Notes</CardTitle>
                    <CardDescription>Any special requests or details?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Tell us about any special requests, preferred fit, or other details..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              {formData.itemType && (
                <div className="flex justify-end">
                  <Button type="submit" size="lg" className="px-8">
                    Submit Bespoke Order
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Bespoke;

