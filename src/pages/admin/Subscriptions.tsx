import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [subsRes, profilesRes] = await Promise.all([
        supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      setSubs(subsRes.data || []);
      const map: Record<string, any> = {};
      (profilesRes.data || []).forEach((p: any) => { map[p.id] = p; });
      setProfiles(map);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions ({subs.length})</h1>
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => {
                const user = profiles[s.user_id];
                return (
                  <TableRow key={s.id} className="border-[#334155]">
                    <TableCell className="text-sm">{user?.email || user?.full_name || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{s.plan}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(s.start_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{new Date(s.expiry_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={s.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {subs.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No subscriptions</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
