import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, DollarSign, CreditCard, Loader2 } from "lucide-react";
import { courses } from "@/data/courses";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  users: number;
  revenue: number;
  activeSubs: number;
  recentOrders: any[];
  recentUsers: any[];
  revenueChart: { date: string; revenue: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profilesRes, purchasesRes, subsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }),
        supabase.from("purchases").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").eq("status", "active"),
      ]);

      const profiles = profilesRes.data || [];
      const purchases = purchasesRes.data || [];
      const activeSubs = subsRes.data || [];

      const revenue = purchases.reduce((s, p) => s + Number(p.price_paid), 0);

      // Revenue chart - last 30 days
      const now = new Date();
      const chartData: { date: string; revenue: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const dayRev = purchases
          .filter((p) => p.created_at.slice(0, 10) === key)
          .reduce((s, p) => s + Number(p.price_paid), 0);
        chartData.push({ date: key.slice(5), revenue: dayRev });
      }

      setStats({
        users: profiles.length,
        revenue,
        activeSubs: activeSubs.length,
        recentOrders: purchases.slice(0, 10),
        recentUsers: profiles.slice(0, 10),
        revenueChart: chartData,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!stats) return null;

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400" },
    { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-green-400" },
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400" },
    { label: "Active Subs", value: stats.activeSubs, icon: CreditCard, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-[#0F172A] ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader><CardTitle className="text-lg">Revenue (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.revenueChart}>
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155" }} />
              <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead>Course ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.map((o) => (
                  <TableRow key={o.id} className="border-[#334155]">
                    <TableCell className="font-mono text-xs">{o.course_id.slice(0, 12)}...</TableCell>
                    <TableCell>₹{Number(o.price_paid).toLocaleString()}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {stats.recentOrders.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No orders yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader><CardTitle className="text-lg">Recent Signups</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUsers.map((u: any) => (
                  <TableRow key={u.id} className="border-[#334155]">
                    <TableCell>{u.full_name || "—"}</TableCell>
                    <TableCell className="text-xs">{u.email || "—"}</TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
