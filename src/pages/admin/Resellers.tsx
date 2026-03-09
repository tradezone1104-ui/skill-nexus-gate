import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminResellers() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApps = async () => {
    const { data } = await supabase.from("reseller_applications").select("*").order("created_at", { ascending: false });
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reseller_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: `Application ${status}` });
    fetchApps();
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reseller Applications ({apps.length})</h1>
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a.id} className="border-[#334155]">
                  <TableCell className="font-medium text-sm">{a.full_name}</TableCell>
                  <TableCell className="text-sm">{a.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(a.promotion_channels || []).map((c: string) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell><Badge className={statusColor[a.status] || ""}>{a.status}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {a.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus(a.id, "approved")} className="gap-1 bg-green-600 hover:bg-green-700">
                          <Check className="h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, "rejected")} className="gap-1">
                          <X className="h-3 w-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {apps.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No applications</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
