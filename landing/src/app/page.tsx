import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Comparison from "@/components/Comparison";
import HowItWorks from "@/components/HowItWorks";
import Integrations from "@/components/Integrations";
import Install from "@/components/Install";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Comparison />
        <HowItWorks />
        <Integrations />
        <Install />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
