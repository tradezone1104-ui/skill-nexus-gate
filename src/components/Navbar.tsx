import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Heart, ShoppingCart, Bell, User, Sun, Moon, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const profileMenuItems = [
  { section: "Learning" },
  { label: "My Learning", to: "/my-learning" },
  { label: "My Cart", to: "/cart" },
  { label: "My Wishlist", to: "/wishlist" },
  { label: "Exchange Course on CV", to: "/exchange" },
  { label: "Refer a Friend", to: "/refer", badge: "Earn 20% CV Coins" },
  { divider: true },
  { section: "Account" },
  { label: "Notifications", to: "/notifications" },
  { label: "Messages", to: "/messages" },
  { label: "Account Settings", to: "/settings" },
  { label: "Payment Methods", to: "/settings/payments" },
  { label: "Subscription", to: "/subscribe" },
  { label: "CV Coins", to: "/cv-coins" },
  { label: "Purchase History", to: "/purchase-history" },
  { divider: true },
  { label: "Edit Profile", to: "/settings/profile" },
  { label: "Help and Support", to: "/support" },
  { label: "Log Out", to: "/logout", destructive: true },
];

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // TODO: Replace with real auth state
  const [isLoggedIn] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/courses?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">CV</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block">CourseVerse</span>
        </Link>

        {/* Always-visible nav links */}
        <div className="hidden lg:flex items-center gap-1 ml-4">
          <Link to="/free-learning">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Free Learning
            </Button>
          </Link>
          <Link to="/subscribe">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Subscribe
            </Button>
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for courses"
              className="pl-10 bg-muted border-border focus:border-primary"
            />
          </div>
        </form>

        {/* Logged-in only nav links */}
        {isLoggedIn && (
          <div className="hidden lg:flex items-center gap-1 ml-auto">
            <Link to="/cv-business">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                CV Business
              </Button>
            </Link>
            <Link to="/exchange">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Exchange
              </Button>
            </Link>
            <Link to="/my-learning">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                My Learning
              </Button>
            </Link>
          </div>
        )}

        {/* Right side icons */}
        <div className="flex items-center gap-1 ml-auto lg:ml-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isLoggedIn ? (
            <>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/notifications" className="hidden md:inline-flex">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>

              {/* Profile dropdown */}
              <div className="relative hidden md:block" ref={profileRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                </Button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-card py-2 animate-fade-in z-50">
                    {profileMenuItems.map((item, i) => {
                      if ('divider' in item) return <div key={i} className="my-1 border-t border-border" />;
                      if ('section' in item) return <div key={i} className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.section}</div>;
                      return (
                        <Link
                          key={i}
                          to={item.to!}
                          onClick={() => setProfileOpen(false)}
                          className={`block px-4 py-2 text-sm transition-colors ${item.destructive ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-muted'}`}
                        >
                          <span>{item.label}</span>
                          {'badge' in item && item.badge && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">{item.badge}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2 ml-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card p-4 animate-fade-in max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSearch} className="mb-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for courses" className="pl-10 bg-muted" />
            </div>
          </form>
          <div className="flex flex-col gap-1">
            <Link to="/free-learning" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Free Learning</Link>
            <Link to="/subscribe" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Subscribe</Link>
            {isLoggedIn ? (
              <>
                <Link to="/cv-business" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">CV Business</Link>
                <Link to="/exchange" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Exchange Courses</Link>
                <Link to="/my-learning" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">My Learning</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Wishlist</Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Cart</Link>
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Account Settings</Link>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Login</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-primary font-semibold hover:bg-muted transition-colors">Sign Up</Link>
              </>
            )}
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors">Explore All Courses</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
