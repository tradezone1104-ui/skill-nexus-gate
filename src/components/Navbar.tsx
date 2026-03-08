import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/courses?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">CX</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block">CourseVerse</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 2000+ courses..."
              className="pl-10 bg-secondary border-border focus:border-primary" />
            
          </div>
        </form>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/courses">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Explore
            </Button>
          </Link>
          <Link to="/courses?category=trading">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Trading
            </Button>
          </Link>
          <Link to="/courses?category=investing">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Investing
            </Button>
          </Link>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen &&
      <div className="md:hidden border-t border-border bg-card p-4 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="pl-10 bg-secondary" />
            
            </div>
          </form>
          <div className="flex flex-col gap-1">
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Explore All</Link>
            <Link to="/courses?category=trading" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Trading</Link>
            <Link to="/courses?category=investing" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Investing</Link>
            <Link to="/courses?category=stock-market" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Stock Market</Link>
            <Link to="/courses?category=business" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Business</Link>
          </div>
        </div>
      }
    </nav>);

};

export default Navbar;