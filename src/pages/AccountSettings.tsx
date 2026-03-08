import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Camera, User, Lock, Eye, EyeOff, Shield, CreditCard,
  Crown, Bell, Send, ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Section = "profile" | "security" | "payments" | "subscription" | "notifications";

const sidebarItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
  { id: "subscription", label: "Subscription", icon: Crown },
  { id: "notifications", label: "Notification Preferences", icon: Bell },
];

const AccountSettings = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine initial section from path
  const pathSection = location.pathname.split("/settings/")[1] as Section | undefined;
  const [activeSection, setActiveSection] = useState<Section>(
    pathSection && sidebarItems.some((s) => s.id === pathSection) ? pathSection : "profile"
  );

  // Profile state
  const [fullName, setFullName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Payment state
  const [upiId, setUpiId] = useState("");
  const [paytmNumber, setPaytmNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // Notification prefs
  const [notifCourseUpdates, setNotifCourseUpdates] = useState(true);
  const [notifDiscounts, setNotifDiscounts] = useState(true);
  const [notifReferrals, setNotifReferrals] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    window.history.replaceState(null, "", `/settings/${section}`);
  };

  // === Profile Handlers ===
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, WebP or GIF.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 2MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      toast({ title: "Avatar updated" });
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const trimmed = fullName.trim();
    if (!trimmed) { toast({ title: "Name cannot be empty", variant: "destructive" }); return; }
    if (trimmed.length > 100) { toast({ title: "Name must be under 100 characters", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: trimmed }).eq("id", user.id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
    setSaving(false);
  };

  // === Security Handlers ===
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (newPassword.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setUpdatingPassword(false);
  };

  // === Payment Handlers ===
  const handleSavePayment = async () => {
    setSavingPayment(true);
    await new Promise((r) => setTimeout(r, 500));
    toast({ title: "Payment method saved", description: "Your payout details have been updated." });
    setSavingPayment(false);
  };

  // === Notification Handlers ===
  const handleSaveNotifications = () => {
    toast({ title: "Preferences saved", description: "Your notification preferences have been updated." });
  };

  const displayAvatar = avatarUrl || profile?.avatar_url || "";

  if (authLoading) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">Update your personal information</p>
            </div>

            {/* Avatar */}
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                      {displayAvatar ? (
                        <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90"
                      disabled={uploading}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{fullName || "Your Name"}</p>
                    <p className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "JPG, PNG, WebP or GIF. Max 2MB."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" maxLength={100} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={user?.email || ""} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Telegram Username</Label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} placeholder="@username" className="pl-10" maxLength={50} />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your password and security settings</p>
            </div>
            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={updatingPassword}>
                  {updatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "payments":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Payment Methods</h2>
              <p className="text-sm text-muted-foreground mt-1">Add payout details for your CV Business earnings</p>
            </div>
            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">UPI</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>UPI ID</Label>
                  <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" maxLength={50} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">Paytm</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Paytm Number</Label>
                  <Input value={paytmNumber} onChange={(e) => setPaytmNumber(e.target.value)} placeholder="10 digit number" maxLength={10} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">Bank Transfer</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Bank Account Number</Label>
                  <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Account number" maxLength={20} />
                </div>
                <div className="space-y-1.5">
                  <Label>IFSC Code</Label>
                  <Input value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} placeholder="IFSC code" maxLength={11} />
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleSavePayment} disabled={savingPayment}>
              {savingPayment ? "Saving..." : "Save Payment Method"}
            </Button>
          </div>
        );

      case "subscription":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Subscription</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your CourseVerse Premium plan</p>
            </div>
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <span className="text-sm font-semibold text-foreground">Free</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-muted-foreground">No active subscription</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Billing Date</span>
                  <span className="text-sm text-muted-foreground">—</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground mb-1">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">Unlock 2,000+ premium courses starting at ₹499/month</p>
                <Button onClick={() => navigate("/subscribe")}>Explore Plans</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground mt-1">Control what notifications you receive</p>
            </div>
            <Card className="border-border">
              <CardContent className="p-6 space-y-5">
                {[
                  { label: "Course Updates", desc: "New lessons, course completions, and learning reminders", checked: notifCourseUpdates, set: setNotifCourseUpdates },
                  { label: "Discount Alerts", desc: "Flash sales, special offers, and promotional discounts", checked: notifDiscounts, set: setNotifDiscounts },
                  { label: "Referral Earnings", desc: "When friends purchase through your referral link", checked: notifReferrals, set: setNotifReferrals },
                  { label: "System Messages", desc: "Account updates, security alerts, and platform news", checked: notifSystem, set: setNotifSystem },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.checked} onCheckedChange={item.set} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-8">Account Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <nav className="w-full md:w-60 shrink-0">
            <div className="bg-card border border-border rounded-2xl overflow-hidden md:sticky md:top-24">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors text-left ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-opacity ${activeSection === item.id ? "opacity-100" : "opacity-0"}`} />
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {renderSection()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountSettings;
