import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShieldCheck, Shield, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserRow {
  id: string; full_name: string | null; email: string | null; avatar_url: string | null;
  created_at: string; is_admin: boolean; purchase_count: number; has_sub: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 20;
  const { toast } = useToast();
  const [viewUser, setViewUser] = useState<UserRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const [profilesRes, rolesRes, purchasesRes, subsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, avatar_url, created_at").order("created_at", { ascending: false }),
      (supabase as any).from("user_roles").select("user_id, role").eq("role", "admin"),
      supabase.from("purchases").select("user_id"),
      supabase.from("subscriptions").select("user_id, status").eq("status", "active"),
    ]);
    const adminIds = new Set((rolesRes.data || []).map((r: any) => r.user_id));
    const subIds = new Set((subsRes.data || []).map((s: any) => s.user_id));
    const purchaseCounts: Record<string, number> = {};
    (purchasesRes.data || []).forEach((p: any) => { purchaseCounts[p.user_id] = (purchaseCounts[p.user_id] || 0) + 1; });
    setUsers((profilesRes.data || []).map((p: any) => ({
      ...p, is_admin: adminIds.has(p.id), purchase_count: purchaseCounts[p.id] || 0, has_sub: subIds.has(p.id),
    })));
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

  const filtered = users.filter((u) => {
    if (search && !(u.full_name || "").toLowerCase().includes(search.toLowerCase()) && !(u.email || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter === "admin" && !u.is_admin) return false;
    if (roleFilter === "user" && u.is_admin) return false;
    if (subFilter === "subscribed" && !u.has_sub) return false;
    if (subFilter === "not-subscribed" && u.has_sub) return false;
    return true;
  });

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Users ({users.length})</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-10 bg-[#1E293B] border-[#334155]" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
          <SelectTrigger className="w-32 bg-[#1E293B] border-[#334155]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="user">User</SelectItem></SelectContent>
        </Select>
        <Select value={subFilter} onValueChange={(v) => { setSubFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-[#1E293B] border-[#334155]"><SelectValue placeholder="Subscription" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="subscribed">Subscribed</SelectItem><SelectItem value="not-subscribed">Not Subscribed</SelectItem></SelectContent>
        </Select>
      </div>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-[#334155]" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((u) => (
                  <TableRow key={u.id} className="border-[#334155] hover:bg-[#334155]/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">{(u.full_name || "U")[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{u.full_name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.is_admin ? "default" : "secondary"} className={u.is_admin ? "bg-primary/20 text-primary" : ""}>{u.is_admin ? "Admin" : "User"}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.has_sub ? <Badge className="bg-green-500/20 text-green-400">Active</Badge> : <Badge variant="secondary">None</Badge>}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{u.purchase_count}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewUser(u)} className="gap-1 h-8"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleAdmin(u.id, u.is_admin)} className="gap-1 h-8">
                          {u.is_admin ? <Shield className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2"><Users className="h-10 w-10 text-[#334155]" /><p>No users found</p></div>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-[#334155]">Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="border-[#334155]">Next</Button>
        </div>
      )}

      {/* View User Modal */}
      <Dialog open={!!viewUser} onOpenChange={(o) => !o && setViewUser(null)}>
        <DialogContent className="bg-[#1E293B] border-[#334155]">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewUser.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">{(viewUser.full_name || "U")[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{viewUser.full_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Role</p><p className="font-medium">{viewUser.is_admin ? "Admin" : "User"}</p></div>
                <div><p className="text-muted-foreground">Joined</p><p className="font-medium">{new Date(viewUser.created_at).toLocaleDateString()}</p></div>
                <div><p className="text-muted-foreground">Purchases</p><p className="font-medium">{viewUser.purchase_count}</p></div>
                <div><p className="text-muted-foreground">Subscription</p><p className="font-medium">{viewUser.has_sub ? "Active" : "None"}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
