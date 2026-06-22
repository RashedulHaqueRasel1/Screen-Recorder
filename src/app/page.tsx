import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing";
import { FaqSection } from "@/components/landing/faq";
import { CtaBanner } from "@/components/landing/cta-banner";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
