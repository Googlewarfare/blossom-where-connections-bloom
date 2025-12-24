import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary fill-current" />
              <span className="text-xl font-bold">Blossom</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Blossom into Love
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/discover" className="hover:text-primary transition-smooth">Discover</Link></li>
              <li><Link to="/premium" className="hover:text-primary transition-smooth">Premium</Link></li>
              <li><Link to="/success-stories" className="hover:text-primary transition-smooth">Success Stories</Link></li>
              <li><Link to="/events" className="hover:text-primary transition-smooth">Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-smooth">About Us</Link></li>
              <li><Link to="/safety" className="hover:text-primary transition-smooth">Safety Center</Link></li>
              <li><Link to="/verification" className="hover:text-primary transition-smooth">Get Verified</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-smooth">Help Center</Link></li>
              <li><Link to="/safety" className="hover:text-primary transition-smooth">Safety Tips</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-smooth">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Blossom. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-smooth">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-smooth">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
