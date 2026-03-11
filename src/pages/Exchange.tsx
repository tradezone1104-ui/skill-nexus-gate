import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, Upload, Clock, CheckCircle2, XCircle, ExternalLink, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { courses } from "@/data/courses";

interface ExchangeRequest {
  id: string;
  offer_course_name: string;
  offer_course_author: string;
  offer_platform: string;
  offer_course_link: string | null;
  offer_screenshot_url: string | null;
  want_course_name: string;
  want_type: string;
  status: string;
  admin_note: string | null;
  counter_offer_course_name: string | null;
  created_at: string;
}

interface SellRequest {
  id: string;
  course_name: string;
  course_author: string;
  platform: string;
  course_link: string | null;
  screenshot_url: string | null;
  expected_price: number;
  admin_offer_price: number | null;
  status: string;
  admin_note: string | null;
  created_at: string;
}

const TELEGRAM_BOT_URL = "https://t.me/CourseVerseBot";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Waiting for admin review", icon: Clock, color: "text-yellow-500" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-green-500" },
  accepted: { label: "Offer accepted", icon: CheckCircle2, color: "text-green-500" },
  counter_offer: { label: "Counter offer", icon: DollarSign, color: "text-orange-500" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive" },
  closed: { label: "Closed", icon: XCircle, color: "text-muted-foreground" },
};

const Exchange = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Exchange state
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([]);
  const [exchangeLoading, setExchangeLoading] = useState(true);
  const [exchangeSubmitting, setExchangeSubmitting] = useState(false);
  const [offerName, setOfferName] = useState("");
  const [offerAuthor, setOfferAuthor] = useState("");
  const [offerPlatform, setOfferPlatform] = useState("Other");
  const [offerLink, setOfferLink] = useState("");
  const [exchangeScreenshot, setExchangeScreenshot] = useState<File | null>(null);
  const [wantType, setWantType] = useState("specific");
  const [wantCourse, setWantCourse] = useState("");

  // Sell state
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [sellLoading, setSellLoading] = useState(true);
  const [sellSubmitting, setSellSubmitting] = useState(false);
  const [sellName, setSellName] = useState("");
  const [sellAuthor, setSellAuthor] = useState("");
  const [sellPlatform, setSellPlatform] = useState("Other");
  const [sellLink, setSellLink] = useState("");
  const [sellScreenshot, setSellScreenshot] = useState<File | null>(null);
  const [sellPrice, setSellPrice] = useState("");

  const fetchExchangeRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("exchange_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setExchangeRequests((data as ExchangeRequest[]) || []);
    setExchangeLoading(false);
  }, [user]);

  const fetchSellRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sell_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSellRequests((data as SellRequest[]) || []);
    setSellLoading(false);
  }, [user]);

  useEffect(() => {
    fetchExchangeRequests();
    fetchSellRequests();
  }, [fetchExchangeRequests, fetchSellRequests]);

  const uploadScreenshot = async (file: File) => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("exchange-screenshots").upload(path, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from("exchange-screenshots").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!offerName.trim() || !offerAuthor.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (wantType === "specific" && !wantCourse.trim()) {
      toast({ title: "Please enter the course name you want", variant: "destructive" });
      return;
    }
    setExchangeSubmitting(true);
    const screenshotUrl = exchangeScreenshot ? await uploadScreenshot(exchangeScreenshot) : null;

    const { error } = await supabase.from("exchange_requests").insert({
      user_id: user.id,
      offer_course_name: offerName.trim(),
      offer_course_author: offerAuthor.trim(),
      offer_platform: offerPlatform,
      offer_course_link: offerLink.trim() || null,
      offer_screenshot_url: screenshotUrl,
      want_course_name: wantType === "specific" ? wantCourse.trim() : "Any course from CourseVerse",
      want_type: wantType,
    });

    if (error) {
      toast({ title: "Failed to submit request", variant: "destructive" });
    } else {
      toast({ title: "Exchange request submitted!" });
      setOfferName(""); setOfferAuthor(""); setOfferPlatform("Other");
      setOfferLink(""); setExchangeScreenshot(null); setWantCourse(""); setWantType("specific");
      fetchExchangeRequests();
    }
    setExchangeSubmitting(false);
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!sellName.trim() || !sellAuthor.trim() || !sellPrice.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const price = parseFloat(sellPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: "Please enter a valid price", variant: "destructive" });
      return;
    }
    setSellSubmitting(true);
    const screenshotUrl = sellScreenshot ? await uploadScreenshot(sellScreenshot) : null;

    const { error } = await supabase.from("sell_requests").insert({
      user_id: user.id,
      course_name: sellName.trim(),
      course_author: sellAuthor.trim(),
      platform: sellPlatform,
      course_link: sellLink.trim() || null,
      screenshot_url: screenshotUrl,
      expected_price: price,
    });

    if (error) {
      toast({ title: "Failed to submit request", variant: "destructive" });
    } else {
      toast({ title: "Selling request submitted!" });
      setSellName(""); setSellAuthor(""); setSellPlatform("Other");
      setSellLink(""); setSellScreenshot(null); setSellPrice("");
      fetchSellRequests();
    }
    setSellSubmitting(false);
  };

  const handleAcceptOffer = async (reqId: string) => {
    const { error } = await supabase
      .from("sell_requests")
      .update({ status: "accepted" })
      .eq("id", reqId);
    if (error) {
      toast({ title: "Failed to accept offer", variant: "destructive" });
    } else {
      toast({ title: "Offer accepted!" });
      window.open(TELEGRAM_BOT_URL, "_blank");
      fetchSellRequests();
    }
  };

  const handleRejectOffer = async (reqId: string) => {
    const { error } = await supabase
      .from("sell_requests")
      .update({ status: "closed" })
      .eq("id", reqId);
    if (error) {
      toast({ title: "Failed to reject offer", variant: "destructive" });
    } else {
      toast({ title: "Offer rejected. Request closed." });
      fetchSellRequests();
    }
  };

  const suggestedCourses = courses.slice(0, 4);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <CategoryBar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <ArrowLeftRight className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-3">Exchange & Sell Courses</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Exchange or sell your courses on CourseVerse.</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-8 max-w-xl mx-auto text-center space-y-4">
            <p className="text-muted-foreground">Log in to submit exchange or selling requests.</p>
            <Button onClick={() => navigate("/login")} className="font-semibold">Sign In</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="exchange" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="exchange" className="gap-2"><ArrowLeftRight className="h-4 w-4" /> Exchange Courses</TabsTrigger>
            <TabsTrigger value="sell" className="gap-2"><DollarSign className="h-4 w-4" /> Sell Your Course</TabsTrigger>
          </TabsList>

          {/* ===== EXCHANGE TAB ===== */}
          <TabsContent value="exchange">
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">Exchange Courses</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">Offer a course you own and request another course from CourseVerse.</p>
            </div>

            <form onSubmit={handleExchangeSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 mb-10 space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Course You Offer</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offerName">Course Name *</Label>
                    <Input id="offerName" value={offerName} onChange={(e) => setOfferName(e.target.value)} placeholder="e.g. Smart Money Concepts" maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offerAuthor">Course Creator / Instructor *</Label>
                    <Input id="offerAuthor" value={offerAuthor} onChange={(e) => setOfferAuthor(e.target.value)} placeholder="e.g. John Doe" maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={offerPlatform} onValueChange={setOfferPlatform}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Udemy">Udemy</SelectItem>
                        <SelectItem value="Telegram">Telegram</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offerLink">Course Link (optional)</Label>
                    <Input id="offerLink" value={offerLink} onChange={(e) => setOfferLink(e.target.value)} placeholder="https://..." maxLength={500} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Upload Screenshot Proof (optional)</Label>
                    <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-3 hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{exchangeScreenshot ? exchangeScreenshot.name : "Click to upload image"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setExchangeScreenshot(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Course You Want</h2>
                <RadioGroup value={wantType} onValueChange={setWantType} className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="want-specific" />
                    <Label htmlFor="want-specific" className="cursor-pointer">Exchange for a specific course</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="want-any" />
                    <Label htmlFor="want-any" className="cursor-pointer">Ask for any course from CourseVerse</Label>
                  </div>
                </RadioGroup>

                {wantType === "specific" ? (
                  <div className="space-y-2">
                    <Label htmlFor="wantCourse">Course Name from CourseVerse *</Label>
                    <Input id="wantCourse" value={wantCourse} onChange={(e) => setWantCourse(e.target.value)} placeholder="e.g. Forex Trading Masterclass" maxLength={200} />
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">You're requesting any available course from CourseVerse in exchange. The admin will review your offer and suggest a suitable course.</p>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={exchangeSubmitting} className="w-full font-semibold">
                {exchangeSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit Exchange Request"}
              </Button>
            </form>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Exchange Requests</h2>
              {exchangeLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : exchangeRequests.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No exchange requests yet. Submit one above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exchangeRequests.map((req) => {
                    const sc = statusConfig[req.status] || statusConfig.pending;
                    const Icon = sc.icon;
                    return (
                      <div key={req.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm text-muted-foreground">Offering</p>
                            <p className="font-medium text-foreground">{req.offer_course_name} <span className="text-muted-foreground text-sm">by {req.offer_course_author}</span></p>
                          </div>
                          <Badge variant="outline" className={`${sc.color} border-current gap-1`}>
                            <Icon className="h-3 w-3" /> {sc.label}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Requesting</p>
                          <p className="font-medium text-foreground">
                            {req.want_type === "any" ? "Any course from CourseVerse" : req.want_course_name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>

                        {req.status === "approved" && (
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-primary">Your exchange request has been approved.</p>
                            <Button size="sm" asChild>
                              <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Contact CourseVerse Bot
                              </a>
                            </Button>
                          </div>
                        )}

                        {req.status === "rejected" && (
                          <div className="space-y-3">
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                              <p className="text-sm font-medium text-destructive">Your exchange request was not approved.</p>
                              {req.admin_note && <p className="text-xs text-muted-foreground mt-1">{req.admin_note}</p>}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Suggested courses you may exchange instead:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {suggestedCourses.map((c) => (
                                  <button key={c.id} onClick={() => { setWantType("specific"); setWantCourse(c.title); }} className="text-left bg-muted rounded-lg p-2 hover:bg-accent transition-colors">
                                    <p className="text-xs font-medium text-foreground line-clamp-2">{c.title}</p>
                                    <p className="text-xs text-muted-foreground">₹{c.price}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== SELL TAB ===== */}
          <TabsContent value="sell">
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">Sell Your Course</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">If you own a valuable course not available on CourseVerse, you can offer it to us.</p>
            </div>

            <form onSubmit={handleSellSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 mb-10 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sellName">Course Name *</Label>
                  <Input id="sellName" value={sellName} onChange={(e) => setSellName(e.target.value)} placeholder="e.g. Advanced Crypto Trading" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellAuthor">Course Creator / Instructor *</Label>
                  <Input id="sellAuthor" value={sellAuthor} onChange={(e) => setSellAuthor(e.target.value)} placeholder="e.g. Jane Smith" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={sellPlatform} onValueChange={setSellPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Udemy">Udemy</SelectItem>
                      <SelectItem value="Telegram">Telegram</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellLink">Course Link (optional)</Label>
                  <Input id="sellLink" value={sellLink} onChange={(e) => setSellLink(e.target.value)} placeholder="https://..." maxLength={500} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Upload Proof Screenshot (optional)</Label>
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-3 hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{sellScreenshot ? sellScreenshot.name : "Click to upload image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setSellScreenshot(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="sellPrice">Expected Selling Price (₹) *</Label>
                  <Input id="sellPrice" type="number" min="1" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="e.g. 499" />
                </div>
              </div>
              <Button type="submit" disabled={sellSubmitting} className="w-full font-semibold">
                {sellSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit Selling Request"}
              </Button>
            </form>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Selling Requests</h2>
              {sellLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : sellRequests.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No selling requests yet. Submit one above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sellRequests.map((req) => {
                    const sc = statusConfig[req.status] || statusConfig.pending;
                    const Icon = sc.icon;
                    return (
                      <div key={req.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-medium text-foreground">{req.course_name} <span className="text-muted-foreground text-sm">by {req.course_author}</span></p>
                            <p className="text-sm text-muted-foreground">{req.platform} · Your price: ₹{req.expected_price}</p>
                          </div>
                          <Badge variant="outline" className={`${sc.color} border-current gap-1`}>
                            <Icon className="h-3 w-3" /> {sc.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>

                        {req.status === "accepted" && (
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-primary">Your course selling request has been accepted.</p>
                            <Button size="sm" asChild>
                              <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Contact CourseVerse Bot
                              </a>
                            </Button>
                          </div>
                        )}

                        {req.status === "counter_offer" && req.admin_offer_price != null && (
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 space-y-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">Admin has made a counter offer:</p>
                              <p className="text-lg font-bold text-foreground mt-1">Admin Offer Price: ₹{req.admin_offer_price}</p>
                              {req.admin_note && <p className="text-xs text-muted-foreground mt-1">{req.admin_note}</p>}
                            </div>
                            <div className="flex gap-3">
                              <Button size="sm" onClick={() => handleAcceptOffer(req.id)} className="gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accept Offer
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectOffer(req.id)} className="gap-1.5">
                                <XCircle className="h-3.5 w-3.5" /> Reject Offer
                              </Button>
                            </div>
                          </div>
                        )}

                        {req.status === "rejected" && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <p className="text-sm font-medium text-destructive">Your selling request was not approved.</p>
                            {req.admin_note && <p className="text-xs text-muted-foreground mt-1">{req.admin_note}</p>}
                          </div>
                        )}

                        {req.status === "closed" && (
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">This request has been closed.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Exchange;
