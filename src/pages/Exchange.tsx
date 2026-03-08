import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, Upload, Clock, CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  status: string;
  admin_note: string | null;
  created_at: string;
}

const TELEGRAM_BOT_URL = "https://t.me/CourseVerseBot";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Waiting for admin review", icon: Clock, color: "text-yellow-500" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-green-500" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive" },
};

const Exchange = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [offerName, setOfferName] = useState("");
  const [offerAuthor, setOfferAuthor] = useState("");
  const [offerPlatform, setOfferPlatform] = useState("Other");
  const [offerLink, setOfferLink] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [wantCourse, setWantCourse] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("exchange_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRequests((data as ExchangeRequest[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!offerName.trim() || !offerAuthor.trim() || !wantCourse.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    let screenshotUrl: string | null = null;

    if (screenshotFile) {
      const ext = screenshotFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("exchange-screenshots")
        .upload(path, screenshotFile);
      if (!error) {
        const { data: urlData } = supabase.storage
          .from("exchange-screenshots")
          .getPublicUrl(path);
        screenshotUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("exchange_requests").insert({
      user_id: user.id,
      offer_course_name: offerName.trim(),
      offer_course_author: offerAuthor.trim(),
      offer_platform: offerPlatform,
      offer_course_link: offerLink.trim() || null,
      offer_screenshot_url: screenshotUrl,
      want_course_name: wantCourse.trim(),
    });

    if (error) {
      toast({ title: "Failed to submit request", variant: "destructive" });
    } else {
      toast({ title: "Exchange request submitted!" });
      setOfferName("");
      setOfferAuthor("");
      setOfferPlatform("Other");
      setOfferLink("");
      setScreenshotFile(null);
      setWantCourse("");
      fetchRequests();
    }
    setSubmitting(false);
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
            <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-3">Exchange Courses</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Offer a course you own and request another course from CourseVerse.</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-8 max-w-xl mx-auto text-center space-y-4">
            <p className="text-muted-foreground">Log in to submit exchange requests.</p>
            <Button onClick={() => navigate("/login")} className="font-semibold">Sign In to Exchange</Button>
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
        <div className="text-center mb-10">
          <ArrowLeftRight className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">Exchange Courses</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Offer a course you own and request another course from CourseVerse.</p>
        </div>

        {/* Submit form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 mb-10 space-y-8">
          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Course You Offer</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="offerName">Course Name *</Label>
                <Input id="offerName" value={offerName} onChange={(e) => setOfferName(e.target.value)} placeholder="e.g. Smart Money Concepts" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerAuthor">Course Creator / Author *</Label>
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
                  <span className="text-sm text-muted-foreground">{screenshotFile ? screenshotFile.name : "Click to upload image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Course You Want</h2>
            <div className="space-y-2">
              <Label htmlFor="wantCourse">Course Name from CourseVerse *</Label>
              <Input id="wantCourse" value={wantCourse} onChange={(e) => setWantCourse(e.target.value)} placeholder="e.g. Forex Trading Masterclass" maxLength={200} />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full font-semibold">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit Exchange Request"}
          </Button>
        </form>

        {/* Requests list */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Exchange Requests</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : requests.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">No exchange requests yet. Submit one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
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
                      <p className="font-medium text-foreground">{req.want_course_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>

                    {req.status === "approved" && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Your exchange request has been approved.</p>
                        <Button size="sm" asChild>
                          <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Contact Exchange Bot
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
                              <button
                                key={c.id}
                                onClick={() => setWantCourse(c.title)}
                                className="text-left bg-muted rounded-lg p-2 hover:bg-accent transition-colors"
                              >
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
      </div>
      <Footer />
    </div>
  );
};

export default Exchange;
