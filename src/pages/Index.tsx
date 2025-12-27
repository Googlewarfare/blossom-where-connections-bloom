import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import { Manifesto } from "@/components/Manifesto";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset">
      <Navbar />
      <Hero />
      <Features />
      <Manifesto />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
