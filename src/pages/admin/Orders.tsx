import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download } from "lucide-react";
import { getCourseById } from "@/data/courses";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    async function load() {
      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from("purchases").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      setOrders(ordersRes.data || []);
      const map: Record<string, any> = {};
      (profilesRes.data || []).forEach((p: any) => { map[p.id] = p; });
      setProfiles(map);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = orders.filter((o) => {
    if (dateFrom && o.created_at < dateFrom) return false;
    if (dateTo && o.created_at > dateTo + "T23:59:59") return false;
    return true;
  });

  const exportCSV = () => {
    const header = "User Email,Course,Amount,Date\n";
    const rows = filtered.map((o) => {
      const user = profiles[o.user_id];
      const course = getCourseById(o.course_id);
      return `"${user?.email || ""}","${course?.title || o.course_id}",${o.price_paid},${o.created_at}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Orders ({filtered.length})</h1>
        <Button onClick={exportCSV} variant="outline" className="gap-2 border-[#334155]">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-[#1E293B] border-[#334155] w-40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-[#1E293B] border-[#334155] w-40" />
        </div>
      </div>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => {
                const user = profiles[o.user_id];
                const course = getCourseById(o.course_id);
                return (
                  <TableRow key={o.id} className="border-[#334155]">
                    <TableCell className="text-sm">{user?.email || user?.full_name || "—"}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{course?.title || o.course_id}</TableCell>
                    <TableCell>₹{Number(o.price_paid).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
