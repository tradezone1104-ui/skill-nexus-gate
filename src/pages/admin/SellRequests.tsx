import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSellRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
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

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("sell_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: `Request ${status}` });
    fetchData();
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    "counter-offer": "bg-blue-500/20 text-blue-400",
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
                    <TableCell><Badge className={statusColor[r.status] || ""}>{r.status}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(r.id, "approved")} className="gap-1 bg-green-600 hover:bg-green-700">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(r.id, "rejected")} className="gap-1">
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
    </div>
  );
}
