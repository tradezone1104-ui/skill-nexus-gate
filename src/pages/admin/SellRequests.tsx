import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSellRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectMode, setRejectMode] = useState<"direct" | "counter">("direct");
  const [counterPrice, setCounterPrice] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [rRes, pRes] = await Promise.all([
      supabase.from("sell_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email"),
    ]);
    setRequests(rRes.data || []);
    const map: Record<string, any> = {};
    (pRes.data || []).forEach((p: any) => { map[p.id] = p; });
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string, userId: string) => {
    await supabase.from("sell_requests").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Sell Request Approved",
      message: "Your course sell request has been approved! Contact the CourseVerse Bot on Telegram to complete the sale.",
      icon: "check",
    });
    toast({ title: "Request approved" });
    fetchData();
  };

  const openRejectModal = (req: any) => {
    setSelectedRequest(req);
    setRejectMode("direct");
    setCounterPrice("");
    setCounterNote("");
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);

    if (rejectMode === "direct") {
      await supabase.from("sell_requests").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", selectedRequest.id);
      await supabase.from("notifications").insert({
        user_id: selectedRequest.user_id,
        title: "Sell Request Rejected",
        message: "Your course sell request has been rejected by the admin.",
        icon: "x",
      });
      toast({ title: "Request rejected" });
    } else {
      const price = parseFloat(counterPrice);
      if (!price || price <= 0) {
        toast({ title: "Please enter a valid price", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      await supabase.from("sell_requests").update({
        status: "counter_offer",
        admin_offer_price: price,
        admin_note: counterNote || null,
        updated_at: new Date().toISOString(),
      }).eq("id", selectedRequest.id);
      await supabase.from("notifications").insert({
        user_id: selectedRequest.user_id,
        title: "Sell Request Counter Offer",
        message: `Admin has offered ₹${price.toLocaleString()} for your course "${selectedRequest.course_name}". Visit your Exchange page to accept or reject this offer.`,
        icon: "indian-rupee",
      });
      toast({ title: "Counter price offer sent" });
    }

    setSubmitting(false);
    setRejectModalOpen(false);
    fetchData();
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    counter_offer: "bg-blue-500/20 text-blue-400",
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sell Requests ({requests.length})</h1>
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Expected ₹</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const user = profiles[r.user_id];
                return (
                  <TableRow key={r.id} className="border-[#334155]">
                    <TableCell className="text-sm">{user?.email || user?.full_name || "—"}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate">{r.course_name}</TableCell>
                    <TableCell className="text-sm">{r.course_author}</TableCell>
                    <TableCell>₹{Number(r.expected_price).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{r.platform}</TableCell>
                    <TableCell><Badge className={statusColor[r.status] || ""}>{r.status === "counter_offer" ? "Counter Offer" : r.status}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(r.id, r.user_id)} className="gap-1 bg-green-600 hover:bg-green-700">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => openRejectModal(r)} className="gap-1">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {requests.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No sell requests</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white">
          <DialogHeader>
            <DialogTitle>Reject Sell Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-[#0F172A] rounded-lg p-3 text-sm">
                <p><span className="text-muted-foreground">Course:</span> {selectedRequest.course_name}</p>
                <p><span className="text-muted-foreground">Expected:</span> ₹{Number(selectedRequest.expected_price).toLocaleString()}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant={rejectMode === "direct" ? "default" : "outline"}
                onClick={() => setRejectMode("direct")}
                className="flex-1"
              >
                Direct Reject
              </Button>
              <Button
                variant={rejectMode === "counter" ? "default" : "outline"}
                onClick={() => setRejectMode("counter")}
                className="flex-1"
              >
                Counter Price Offer
              </Button>
            </div>

            {rejectMode === "direct" && (
              <p className="text-sm text-muted-foreground">This will directly reject the sell request. The user will be notified.</p>
            )}

            {rejectMode === "counter" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Your offer price (₹)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Enter your price..."
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note to user (optional)</Label>
                  <Textarea
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    placeholder="Any message for the user..."
                    className="bg-[#0F172A] border-[#334155]"
                    rows={2}
                  />
                </div>
                <p className="text-sm text-muted-foreground">The user will be notified and can accept or reject your price offer.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button
              variant={rejectMode === "direct" ? "destructive" : "default"}
              onClick={handleRejectSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {rejectMode === "direct" ? "Reject" : "Send Counter Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
