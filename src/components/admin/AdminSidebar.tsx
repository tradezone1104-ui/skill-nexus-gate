import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, ShoppingCart, CreditCard,
  Briefcase, Coins, ArrowLeftRight, DollarSign, Bell, Settings, LogOut, X, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/courses", icon: BookOpen, label: "Courses" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { to: "/admin/resellers", icon: Briefcase, label: "Resellers" },
  { to: "/admin/cv-coins", icon: Coins, label: "CV Coins" },
  { to: "/admin/exchange-requests", icon: ArrowLeftRight, label: "Exchange Requests" },
  { to: "/admin/sell-requests", icon: DollarSign, label: "Sell Requests" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const sidebar = (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-[#1E293B] w-64">
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <NavLink to="/admin" className="text-xl font-bold text-primary">
          CV Admin
        </NavLink>
        <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-[#1E293B] hover:text-foreground"
              )
            }
          >
            <l.icon className="h-4 w-4 shrink-0" />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t border-[#1E293B]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[#1E293B] hover:text-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Back to Site</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1E293B] p-2 rounded-lg text-foreground"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)}>
          <div className="fixed inset-y-0 left-0 z-50" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">{sidebar}</div>
    </>
  );
}
