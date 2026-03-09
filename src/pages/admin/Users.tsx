import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2, ShieldCheck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  purchase_count: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const [profilesRes, rolesRes, purchasesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, avatar_url, created_at").order("created_at", { ascending: false }),
      (supabase as any).from("user_roles").select("user_id, role").eq("role", "admin"),
      supabase.from("purchases").select("user_id"),
    ]);

    const adminIds = new Set((rolesRes.data || []).map((r: any) => r.user_id));
    const purchaseCounts: Record<string, number> = {};
    (purchasesRes.data || []).forEach((p: any) => {
      purchaseCounts[p.user_id] = (purchaseCounts[p.user_id] || 0) + 1;
    });

    setUsers(
      (profilesRes.data || []).map((p: any) => ({
        ...p,
        is_admin: adminIds.has(p.id),
        purchase_count: purchaseCounts[p.id] || 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      await (supabase as any).from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    } else {
      await (supabase as any).from("user_roles").insert({ user_id: userId, role: "admin" });
    }
    toast({ title: currentlyAdmin ? "Admin role removed" : "Admin role granted" });
    fetchUsers();
  };

  const filtered = users.filter(
    (u) =>
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Users ({users.length})</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#1E293B] border-[#334155]" />
        </div>
      </div>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="border-[#334155]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {(u.full_name || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{u.full_name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.is_admin ? "default" : "secondary"} className={u.is_admin ? "bg-primary/20 text-primary" : ""}>
                      {u.is_admin ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{u.purchase_count}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAdmin(u.id, u.is_admin)}
                      className="gap-1"
                    >
                      {u.is_admin ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {u.is_admin ? "Remove Admin" : "Make Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
