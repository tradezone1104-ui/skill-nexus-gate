import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, HelpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const menuItems = [
  {
    icon: Send,
    label: "Telegram Support",
    href: "https://t.me/courseverse_support",
    external: true,
  },
  {
    icon: HelpCircle,
    label: "Help Center",
    to: "/help",
    external: false,
  },
  {
    icon: Mail,
    label: "Contact Us",
    to: "/contact",
    external: false,
  },
];

const FloatingSupport = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {/* Menu */}
      {open && (
        <div className="absolute bottom-16 right-0 w-52 bg-card border border-border rounded-xl shadow-lg animate-fade-in overflow-hidden mb-2">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Need Help?</p>
            <p className="text-xs text-muted-foreground">Choose an option below</p>
          </div>
          <div className="py-1">
            {menuItems.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to!}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setOpen(!open)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
      >
        {open ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
      </Button>
    </div>
  );
};

export default FloatingSupport;
