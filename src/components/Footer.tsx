import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card mt-20">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">CX</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">CourseX</span>
          </div>
          <p className="text-sm text-muted-foreground">Premium courses for trading, investing, and business mastery.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Categories</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/courses?category=trading" className="hover:text-primary transition-colors">Trading</Link>
            <Link to="/courses?category=investing" className="hover:text-primary transition-colors">Investing</Link>
            <Link to="/courses?category=stock-market" className="hover:text-primary transition-colors">Stock Market</Link>
            <Link to="/courses?category=business" className="hover:text-primary transition-colors">Business</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="hover:text-primary transition-colors cursor-pointer">About Us</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Contact</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Support</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="hover:text-primary transition-colors cursor-pointer">Help Center</span>
            <span className="hover:text-primary transition-colors cursor-pointer">FAQ</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
        © 2026 CourseX. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
