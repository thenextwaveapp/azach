import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const CustomerService = () => {
  // Set page title
  useEffect(() => {
    document.title = "Customer Service - AZACH";
  }, []);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: "What is RRS?",
      answer: "RRS stands for Rework & Repair Service. It is AZACH's aftercare initiative designed to extend the life of garments through repairs, alterations, and creative reconstruction. Customers can bring in old garments, which we transform into something renewed, personalized, and wearable again."
    },
    {
      question: "Where do we source materials?",
      answer: "We source reclaimed denim, second-hand textiles, and discarded fabrics from local markets, our community, customers, and textile waste streams. These materials are carefully selected and transformed into reconstructed garments through upcycling and craftsmanship."
    },
    {
      question: "What makes AZACH a circular/sustainable brand?",
      answer: "AZACH extends the life cycle of existing materials by transforming textile waste into wearable pieces. Through upcycling, repair, and intentional production, we reduce waste while encouraging more conscious fashion consumption."
    },
    {
      question: "How do we track impact?",
      answer: "We track impact through the volume of materials repurposed, garments rescued from waste, and individuals trained through our upcycling initiatives. As we continue to grow, we are developing better systems to measure both our environmental and community impact."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'url(/header-customer-service.png)',
            backgroundPosition: 'center 20%'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/35" />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-semibold text-white"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Customer Service
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mt-4 text-white">
              We're Here To Help
            </h2>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-2">info@azach.ng</p>
              <p className="text-xs text-muted-foreground">We'll respond within 24 hours</p>
            </div>

            <div className="text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-1">+234 806 479 2146</p>
              <p className="text-sm text-muted-foreground mb-2">+1 (403) 827-9068</p>
              <p className="text-xs text-muted-foreground">Mon-Fri, 9am-6pm</p>
            </div>

            <div className="text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-sm text-muted-foreground mb-1">32 Musa Adewoku Street</p>
              <p className="text-xs text-muted-foreground mb-3">Ojota Lagos, Nigeria</p>
              <p className="text-sm text-muted-foreground mb-1">1400 Na'a Drive SW</p>
              <p className="text-xs text-muted-foreground">Calgary, AB, Canada</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-semibold mb-4">Send Us a Message</h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                Thank you for contacting us! We'll respond to your message within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-semibold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Find answers to common questions about orders, shipping, and returns.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-background rounded-lg shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CustomerService;
