import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = "About - AZACH";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-semibold mb-6 uppercase tracking-tight">
              About
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-6">
              Reconstructing What Already Exists
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AZACH is a contemporary design brand focused on reconstruction, upcycling, and intentional craftsmanship.
              We create garments, objects, and systems using existing materials, transforming what already exists into pieces designed for modern living.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every AZACH piece is shaped through process, experimentation, and utility. Nothing is mass-produced. Nothing is exactly repeated.
            </p>
          </div>
        </div>
      </section>

      {/* How It Started */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-8 text-center uppercase tracking-tight">
              How It Started
            </h3>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                AZACH began as a personal experiment by Uche Aladimma Nwosu.
              </p>
              <p>
                What started with reconstructing personal clothing quickly became a deeper exploration into material waste, fashion consumption, and the possibilities of upcycling beyond sustainability alone.
              </p>
              <p>
                Instead of seeing discarded materials as waste, AZACH approached them as resources, materials capable of carrying new function, meaning, and identity through design.
              </p>
              <p>
                That approach became the foundation of the brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-8 text-center uppercase tracking-tight">
              What We Do
            </h3>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>AZACH works across:</p>
              <ul className="space-y-2 ml-6">
                <li>• Ready-to-Wear</li>
                <li>• Custom Pieces</li>
                <li>• Rework & Repair (RRS)</li>
                <li>• Material Reconstruction</li>
                <li>• Functional Design Objects</li>
              </ul>
              <p>
                Using primarily reclaimed and existing materials, we create pieces that balance utility, individuality, and contemporary design.
              </p>
              <p>
                No two pieces are exactly alike. Variations in texture, fading, tone, and construction are part of the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-8 text-center uppercase tracking-tight">
              Our Approach
            </h3>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                We believe design should extend the life of materials, not shorten it.
              </p>
              <p>
                Rather than constantly producing new resources, AZACH focuses on reconstruction, reworking existing materials into refined, functional pieces that remain relevant over time.
              </p>
              <p>Our process combines:</p>
              <ul className="space-y-2 ml-6">
                <li>• upcycling</li>
                <li>• craftsmanship</li>
                <li>• experimentation</li>
                <li>• repair</li>
                <li>• reconstruction</li>
                <li>• contemporary silhouette development</li>
              </ul>
              <p>
                The result is work that feels intentional, lived-in, and designed to last.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beyond Clothing */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-8 text-center uppercase tracking-tight">
              Beyond Clothing
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
              AZACH is not limited to fashion.
              The brand continues to expand into objects, packaging, furniture, and spatial ideas built from the same philosophy: rethink what already exists and build with intention.
            </p>
          </div>
        </div>
      </section>

      {/* Community & Impact */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-8 text-center uppercase tracking-tight">
              Community & Impact
            </h3>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>As the brand grows, so does the ecosystem around it.</p>
              <p>AZACH has:</p>
              <ul className="space-y-2 ml-6">
                <li>• diverted thousands of garments from waste</li>
                <li>• trained individuals in reconstruction and upcycling</li>
                <li>• created opportunities through craftsmanship and production</li>
                <li>• contributed to more circular ways of thinking about fashion and material use</li>
              </ul>
              <p>
                But impact is not just about sustainability. It is also about changing how people value materials, process, and consumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-8 text-center uppercase tracking-tight">
              Our Vision
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
              To build a globally recognised reconstruction-driven design brand that redefines how materials, garments, and everyday objects are created, used, and experienced.
            </p>
          </div>
        </div>
      </section>

      {/* The AZACH Principles */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-semibold mb-12 text-center uppercase tracking-tight">
              The AZACH Principles
            </h3>

            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-semibold mb-3">Reconstruction</h4>
                <p className="text-muted-foreground">
                  We transform existing materials into new forms and functions.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-3">Intentional Design</h4>
                <p className="text-muted-foreground">
                  Every piece is created with purpose, utility, and longevity in mind.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-3">Craftsmanship</h4>
                <p className="text-muted-foreground">
                  Process, detail, and construction remain central to everything we create.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-3">Individuality</h4>
                <p className="text-muted-foreground">
                  Variation is part of the work. No two pieces are exactly the same.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-3">Circular Thinking</h4>
                <p className="text-muted-foreground">
                  We believe materials should continue evolving rather than being discarded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build With Us */}
      <section className="py-20 bg-gradient-to-br from-white via-muted to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-semibold mb-8 uppercase tracking-tight">
              Build With Us
            </h3>
            <div className="space-y-4 text-lg text-muted-foreground mb-8">
              <p>Whether you are:</p>
              <ul className="space-y-2">
                <li>wearing AZACH</li>
                <li>reconstructing an existing piece</li>
                <li>collaborating with us</li>
                <li>donating materials</li>
                <li>or supporting the movement</li>
              </ul>
              <p className="pt-4">
                you become part of a growing system built around intentional creation and material longevity.
              </p>
            </div>
            <div className="space-y-3 text-xl font-light">
              <p>Reconstruct differently.</p>
              <p>Build intentionally.</p>
              <p className="font-semibold">Built from what was.</p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap mt-12">
              <Link to="/shop-all">
                <Button size="lg" className="bg-[#a97c50] hover:bg-[#8b6440] text-white uppercase font-semibold px-8">
                  Shop Now
                </Button>
              </Link>
              <Link to="/bespoke">
                <Button size="lg" variant="outline" className="uppercase font-semibold px-8">
                  Start Custom
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
