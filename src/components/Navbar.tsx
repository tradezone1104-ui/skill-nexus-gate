import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Heart, ShoppingCart, Bell, Sun, Moon, LogIn, UserPlus, LogOut, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCartContext } from "@/contexts/CartContext";

const profileMenuItems = [
  { section: "Learning" },
  { label: "My Learning", to: "/my-learning" },
  { label: "My Cart", to: "/cart" },
  { label: "My Wishlist", to: "/wishlist" },
  { label: "Exchange Course on CV", to: "/exchange" },
  { label: "Free Learning", to: "/free-learning" },
  { label: "Refer a Friend", to: "/refer", badge: "Earn CV Coins" },
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
];

const notificationItems = [
  { id: 1, title: "New course added", desc: "Options Trading Masterclass is now available", time: "2h ago" },
  { id: 2, title: "Subscription reminder", desc: "Your premium membership renews in 3 days", time: "1d ago" },
  { id: 3, title: "Discount offer", desc: "Get 40% off on all trading bundles this weekend", time: "2d ago" },
];

const getInitials = (name: string | null | undefined): string => {
  if (!name || !name.trim()) return "U";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { cartCount } = useCartContext();
  const isLoggedIn = !!user;

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const initials = getInitials(displayName);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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

  const handleLogout = async () => {
    setProfileOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border w-full">
      <div className="w-full max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-1 shrink-0">
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm tracking-tight">CV</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block tracking-tight">CourseVerse</span>
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            <Link to="/free-learning">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm font-medium">
                Free Learning
              </Button>
            </Link>
            <Link to="/subscribe">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm font-medium">
                Subscribe
              </Button>
            </Link>
          </div>
        </div>

        {/* Center: Search bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[600px] mx-10">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for courses"
              className="pl-11 bg-muted border-border focus:border-primary h-11 text-sm rounded-full"
            />
          </div>
        </form>

        {/* Right: Auth buttons & icons */}
        <div className="flex items-center gap-1 shrink-0">
          {isLoggedIn && (
            <div className="hidden lg:flex items-center gap-1 mr-1">
              <Link to="/my-learning">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm font-medium">
                  My Learning
                </Button>
              </Link>
              <Link to="/cv-business">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm font-medium">
                  CV Business
                </Button>
              </Link>
              <Link to="/exchange">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm font-medium">
                  Exchange Courses
                </Button>
              </Link>
            </div>
          )}

          {/* Theme Toggle Dropdown */}
          <div className="relative" ref={themeRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setThemeOpen(!themeOpen)}
                  className="text-muted-foreground hover:text-foreground h-9 w-9"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Theme Settings
              </TooltipContent>
            </Tooltip>
            {themeOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-lg py-1 animate-fade-in z-50">
                <button
                  onClick={() => { setTheme("light"); setThemeOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light Mode
                  </span>
                  {theme === "light" && <Check className="h-4 w-4 text-primary" />}
                </button>
                <button
                  onClick={() => { setTheme("dark"); setThemeOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark Mode
                  </span>
                  {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
                </button>
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <>
              {/* Wishlist */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/wishlist">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Wishlist
                </TooltipContent>
              </Tooltip>

              {/* Cart */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/cart">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9 relative">
                      <ShoppingCart className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  My Cart
                </TooltipContent>
              </Tooltip>

              {/* Notifications Dropdown */}
              <div className="relative hidden md:block" ref={notifRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNotifOpen(!notifOpen)}
                      className="text-muted-foreground hover:text-foreground h-9 w-9 relative"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Notifications
                  </TooltipContent>
                </Tooltip>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="font-semibold text-sm text-foreground">Updates & Notifications</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notificationItems.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0">
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-2.5 text-center text-sm text-primary hover:bg-muted transition-colors border-t border-border"
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile dropdown with avatar */}
              <div className="relative hidden md:block" ref={profileRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="h-9 w-9 p-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                        {initials}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Account
                  </TooltipContent>
                </Tooltip>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg animate-fade-in z-50 flex flex-col" style={{ maxHeight: '70vh' }}>
                    {/* User info - fixed top */}
                    <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {initials}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-foreground truncate">{displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    {/* Scrollable menu items */}
                    <div className="overflow-y-auto flex-1 py-2 scrollbar-thin">
                      {profileMenuItems.map((item, i) => {
                        if ('divider' in item) return <div key={i} className="my-1 border-t border-border" />;
                        if ('section' in item) return <div key={i} className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.section}</div>;
                        return (
                          <Link
                            key={i}
                            to={item.to!}
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-2 text-sm transition-colors text-foreground hover:bg-muted"
                          >
                            <span>{item.label}</span>
                            {'badge' in item && item.badge && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">{item.badge}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                    {/* Logout - fixed bottom */}
                    <div className="shrink-0 border-t border-border">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-3.5 w-3.5 inline mr-2" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2 ml-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 text-sm font-medium">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-sm font-medium">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
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
            {isLoggedIn ? (
              <>
                <Link to="/my-learning" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">My Learning</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Wishlist</Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Cart</Link>
                <Link to="/exchange" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Exchange Courses</Link>
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Account Settings</Link>
                <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-left px-3 py-2.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/free-learning" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Free Learning</Link>
                <Link to="/subscribe" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Subscribe</Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Login</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-primary font-semibold hover:bg-muted transition-colors text-sm">Sign Up</Link>
              </>
            )}
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-foreground hover:bg-muted transition-colors text-sm font-medium">Explore All Courses</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
