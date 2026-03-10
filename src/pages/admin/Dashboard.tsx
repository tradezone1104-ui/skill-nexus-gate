import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, DollarSign, CreditCard, ArrowLeftRight, Coins, Briefcase, Plus, Bell, Eye } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

interface Stats {
  users: number; totalCourses: number; publishedCourses: number; revenue: number;
  activeSubs: number; resellers: number; pendingExchange: number; pendingSell: number;
  recentOrders: any[]; recentUsers: any[]; revenueChart: { date: string; revenue: number }[];
  topCourses: { id: string; title: string; sales: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [profilesRes, coursesRes, purchasesRes, subsRes, resellersRes, exchangeRes, sellRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }),
        supabase.from("courses").select("id, title, is_published"),
        supabase.from("purchases").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").eq("status", "active"),
        supabase.from("reseller_applications").select("id, status").eq("status", "approved"),
        supabase.from("exchange_requests").select("id").eq("status", "pending"),
        supabase.from("sell_requests").select("id").eq("status", "pending"),
      ]);

      const profiles = profilesRes.data || [];
      const courses = coursesRes.data || [];
      const purchases = purchasesRes.data || [];
      const revenue = purchases.reduce((s, p) => s + Number(p.price_paid), 0);

      // Revenue chart
      const now = new Date();
      const chartData: { date: string; revenue: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const dayRev = purchases.filter(p => p.created_at.slice(0, 10) === key).reduce((s, p) => s + Number(p.price_paid), 0);
        chartData.push({ date: key.slice(5), revenue: dayRev });
      }

      // Top courses
      const courseSales: Record<string, number> = {};
      purchases.forEach(p => { courseSales[p.course_id] = (courseSales[p.course_id] || 0) + 1; });
      const topCourses = Object.entries(courseSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, sales]) => ({ id, title: courses.find(c => c.id === id)?.title || id.slice(0, 12), sales }));

      setStats({
        users: profiles.length, totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.is_published).length,
        revenue, activeSubs: (subsRes.data || []).length,
        resellers: (resellersRes.data || []).length,
        pendingExchange: (exchangeRes.data || []).length,
        pendingSell: (sellRes.data || []).length,
        recentOrders: purchases.slice(0, 10),
        recentUsers: profiles.slice(0, 10),
        revenueChart: chartData, topCourses,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40 bg-[#334155]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 bg-[#1E293B]" />)}
      </div>
      <Skeleton className="h-64 bg-[#1E293B]" />
    </div>
  );
  if (!stats) return null;

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400" },
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "text-green-400" },
    { label: "Published", value: stats.publishedCourses, icon: BookOpen, color: "text-emerald-400" },
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400" },
    { label: "Active Subs", value: stats.activeSubs, icon: CreditCard, color: "text-purple-400" },
    { label: "Resellers", value: stats.resellers, icon: Briefcase, color: "text-cyan-400" },
    { label: "Pending Exchange", value: stats.pendingExchange, icon: ArrowLeftRight, color: "text-orange-400" },
    { label: "Pending Sell", value: stats.pendingSell, icon: Coins, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/admin/courses")} className="bg-green-600 hover:bg-green-700 gap-1"><Plus className="h-4 w-4" /> Add Course</Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/notifications")} className="border-[#334155] gap-1"><Bell className="h-4 w-4" /> Notify</Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/exchange-requests")} className="border-[#334155] gap-1"><Eye className="h-4 w-4" /> Requests</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-[#0F172A] ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader><CardTitle className="text-lg">Revenue (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.revenueChart}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader><CardTitle className="text-lg">Sales (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.revenueChart}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155" }} />
                <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-[#334155]"><TableHead>Course</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {stats.recentOrders.map((o) => (
                  <TableRow key={o.id} className="border-[#334155] hover:bg-[#334155]/50">
                    <TableCell className="font-mono text-xs">{o.course_id.slice(0, 10)}...</TableCell>
                    <TableCell>₹{Number(o.price_paid).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {stats.recentOrders.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No orders</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader><CardTitle className="text-lg">Recent Signups</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-[#334155]"><TableHead>Name</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
              <TableBody>
                {stats.recentUsers.map((u: any) => (
                  <TableRow key={u.id} className="border-[#334155] hover:bg-[#334155]/50">
                    <TableCell className="text-sm">{u.full_name || u.email || "—"}</TableCell>
                    <TableCell className="text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader><CardTitle className="text-lg">Top Courses</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-[#334155]"><TableHead>Course</TableHead><TableHead>Sales</TableHead></TableRow></TableHeader>
              <TableBody>
                {stats.topCourses.map((c) => (
                  <TableRow key={c.id} className="border-[#334155] hover:bg-[#334155]/50">
                    <TableCell className="text-sm truncate max-w-[150px]">{c.title}</TableCell>
                    <TableCell>{c.sales}</TableCell>
                  </TableRow>
                ))}
                {stats.topCourses.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No sales data</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
