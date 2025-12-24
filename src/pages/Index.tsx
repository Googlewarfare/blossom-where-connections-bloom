import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { StoryFeed } from "@/components/StoryFeed";
import { DailyQuestion } from "@/components/DailyQuestion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Stories Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Stories</h2>
            <Button variant="link" onClick={() => navigate('/discover')}>
              View All
            </Button>
          </div>
          <StoryFeed />
        </div>
      </section>

      {/* Daily Question Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Question of the Day</h2>
          </div>
          <DailyQuestion />
        </div>
      </section>

      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
