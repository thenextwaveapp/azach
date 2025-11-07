import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Leaf, Users, Lightbulb, Heart } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = "Our Story - AZACH";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Carousel className="absolute inset-0 w-full h-full">
          <CarouselContent className="h-full">
            <CarouselItem className="h-full">
        <div
                className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558769132-cb1aea80ae1d?q=80&w=2574)',
          }}
        />
            </CarouselItem>
            <CarouselItem className="h-full">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070)',
                }}
              />
            </CarouselItem>
            <CarouselItem className="h-full">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070)',
                }}
              />
            </CarouselItem>
            <CarouselItem className="h-full">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070)',
                }}
              />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="!left-4 !z-20 text-white border-white/50 hover:bg-white/20 hover:border-white bg-black/30" />
          <CarouselNext className="!right-4 !z-20 text-white border-white/50 hover:bg-white/20 hover:border-white bg-black/30" />
        </Carousel>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />

        <div className="container mx-auto px-4 relative z-20 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            The AZACH Story
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Reinventing Fashion, One Upcycled Piece at a Time
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              More Than a Fashion Brand—It's a Movement
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              AZACH is redefining how fashion is perceived and consumed by transforming discarded materials
              into bold, timeless, high-quality designs. Through upcycling, we give condemned fabrics a
              second life, proving that sustainability and style can go hand in hand.
            </p>
            <div className="rounded-lg overflow-hidden shadow-lg my-8">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070"
                alt="Upcycled fashion pieces"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              From a Personal Project to a Global Mission
            </h2>

            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                AZACH started as a personal project by Uche Aladimma Nwosu. What began as a simple act of
                upcycling personal clothes to extend their wearability soon turned into something much bigger.
                It wasn't until someone pointed out what he was doing that Uche took a deeper dive into the
                concept of upcycling.
              </p>

              <div className="my-8 rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920"
                  alt="Sustainable fashion creation process"
                  className="w-full h-[350px] object-cover"
                />
              </div>

              <p>
                Through research, he discovered the harmful effects of fast fashion—how much textile waste
                was ending up in landfills, how second-hand markets were being overwhelmed, and how fashion
                was contributing to environmental destruction. Seeing the impact, he became intentional about
                upcycling not just for himself but for others.
              </p>

              <div className="bg-muted/50 rounded-lg p-8 my-8">
                <p className="font-semibold text-foreground mb-4">Since then, we have:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span>Rescued thousands of garments from waste and gave them a new life</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span>Trained individuals on upcycling, equipping them with skills and job opportunities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span>Created a brand that merges sustainability, craftsmanship, and innovation</span>
                  </li>
                </ul>
              </div>

              <p>
                Today, AZACH has evolved into a global brand with its main office in Ojota, Lagos, and retail
                partners around the world. We are working hard to expand the circular economy and give more
                people the opportunity to reduce their environmental impact through sustainable fashion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-12">
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To redefine fashion by creating bold, high-quality designs from discarded materials,
                promoting sustainability, empowering communities, and changing how people perceive waste.
              </p>
            </div>

            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To lead the upcycling movement globally, making sustainable fashion accessible, desirable,
                and a norm—not an exception.
              </p>
            </div>
          </div>
          
          {/* Image Collage */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070"
                alt="Fashion craftsmanship"
                className="w-full h-[300px] object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920"
                alt="Sustainable fashion design"
                className="w-full h-[300px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            The Four Pillars of AZACH
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Sustainability & Upcycling</h3>
              <p className="text-muted-foreground">
                We transform waste into wearable art, reducing fashion's environmental impact.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Craftsmanship & Innovation</h3>
              <p className="text-muted-foreground">
                Every AZACH piece is a blend of traditional techniques and contemporary design.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Community & Empowerment</h3>
              <p className="text-muted-foreground">
                We create economic opportunities by training and employing local artisans.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Authenticity & Individuality</h3>
              <p className="text-muted-foreground">
                No two AZACH pieces are alike. We celebrate uniqueness and self-expression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Our Impact in Sustainable Fashion
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
              At AZACH, we are not just a fashion brand; we are making impact.
            </p>

            <div className="rounded-lg overflow-hidden shadow-lg mb-8">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071"
                alt="Community impact and empowerment"
                className="w-full h-[400px] object-cover"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-background rounded-lg p-6 border">
                <h3 className="font-bold text-lg mb-2">Reducing Textile Waste</h3>
                <p className="text-muted-foreground">
                  We upcycle second-hand fabrics that would otherwise end up in landfills,
                  contributing to pollution.
                </p>
              </div>

              <div className="bg-background rounded-lg p-6 border">
                <h3 className="font-bold text-lg mb-2">Empowering Communities</h3>
                <p className="text-muted-foreground">
                  By training individuals in upcycling, we provide jobs and economic opportunities.
                </p>
              </div>

              <div className="bg-background rounded-lg p-6 border">
                <h3 className="font-bold text-lg mb-2">Challenging Fast Fashion</h3>
                <p className="text-muted-foreground">
                  We offer a sustainable alternative that promotes conscious consumerism.
                </p>
              </div>

              <div className="bg-background rounded-lg p-6 border">
                <h3 className="font-bold text-lg mb-2">Expanding the Circular Economy</h3>
                <p className="text-muted-foreground">
                  We are building systems that help people participate in sustainable fashion.
                </p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              The more we grow and scale, the more impact we create. If we continue at this pace,
              AZACH will become a key player in global sustainable fashion, helping individuals and
              brands reduce their environmental footprint while making fashion a force for good.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-muted via-background to-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Join the Movement</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            AZACH is more than a brand—it's a vision for the future of fashion. Whether you are
            a customer, retailer, collaborator, or supporter, there's a place for you in this journey.
          </p>
          <p className="text-lg font-semibold mb-8">
            💡 Want to be part of the change? Work with us. Wear AZACH. Support sustainability.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop-all">
              <Button size="lg" className="text-lg px-8 py-6">
                Shop Now
              </Button>
            </Link>
            <Link to="/lookbook">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Lookbook
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
