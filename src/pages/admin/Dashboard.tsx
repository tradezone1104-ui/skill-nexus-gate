import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users, BookOpen, DollarSign, CreditCard, ArrowLeftRight, Coins, Briefcase,
  Plus, Bell, Eye, TrendingUp, Calculator, ArrowRight,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useNavigate } from "react-router-dom";

interface Stats {
  users: number;
  totalCourses: number;
  publishedCourses: number;
  revenue: number;
  activeSubs: number;
  resellers: number;
  pendingExchange: number;
  pendingSell: number;
  todayRevenue: number;
  avgOrderValue: number;
  recentOrders: any[];
  recentUsers: any[];
  allPurchases: any[];
  allCourses: any[];
  allProfiles: any[];
  allRoles: any[];
}

const DONUT_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#14B8A6"];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function buildChartData(purchases: any[], days: number) {
  const now = new Date();
  const data: { date: string; revenue: number; sales: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayPurchases = purchases.filter((p) => p.created_at.slice(0, 10) === key);
    data.push({
      date: key.slice(5),
      revenue: dayPurchases.reduce((s: number, p: any) => s + Number(p.price_paid), 0),
      sales: dayPurchases.length,
    });
  }
  return data;
}

function buildCategoryData(purchases: any[], courses: any[]) {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const catSales: Record<string, number> = {};
  purchases.forEach((p) => {
    const course = courseMap.get(p.course_id);
    const cat = course?.category || "Unknown";
    catSales[cat] = (catSales[cat] || 0) + 1;
  });
  return Object.entries(catSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("30");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [profilesRes, coursesRes, purchasesRes, subsRes, resellersRes, exchangeRes, sellRes, rolesRes] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("courses").select("*"),
          supabase.from("purchases").select("*").order("created_at", { ascending: false }),
          supabase.from("subscriptions").select("*").eq("status", "active"),
          supabase.from("reseller_applications").select("id, status").eq("status", "approved"),
          supabase.from("exchange_requests").select("id").eq("status", "pending"),
          supabase.from("sell_requests").select("id").eq("status", "pending"),
          supabase.from("user_roles").select("*"),
        ]);

      const profiles = profilesRes.data || [];
      const courses = coursesRes.data || [];
      const purchases = purchasesRes.data || [];
      const roles = rolesRes.data || [];
      const revenue = purchases.reduce((s, p) => s + Number(p.price_paid), 0);

      const today = new Date().toISOString().slice(0, 10);
      const todayRevenue = purchases
        .filter((p) => p.created_at.slice(0, 10) === today)
        .reduce((s, p) => s + Number(p.price_paid), 0);

      setStats({
        users: profiles.length,
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.is_published).length,
        revenue,
        activeSubs: (subsRes.data || []).length,
        resellers: (resellersRes.data || []).length,
        pendingExchange: (exchangeRes.data || []).length,
        pendingSell: (sellRes.data || []).length,
        todayRevenue,
        avgOrderValue: purchases.length ? Math.round(revenue / purchases.length) : 0,
        recentOrders: purchases.slice(0, 20),
        recentUsers: profiles.slice(0, 20),
        allPurchases: purchases,
        allCourses: courses,
        allProfiles: profiles,
        allRoles: roles,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 bg-[#334155]" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-[#1E293B]" />
          ))}
        </div>
        <Skeleton className="h-64 bg-[#1E293B]" />
      </div>
    );
  if (!stats) return null;

  const days = Number(chartPeriod);
  const chartData = buildChartData(stats.allPurchases, days);
  const categoryData = buildCategoryData(stats.allPurchases, stats.allCourses);

  const courseMap = new Map(stats.allCourses.map((c) => [c.id, c]));
  const profileMap = new Map(stats.allProfiles.map((p) => [p.id, p]));
  const roleMap = new Map(stats.allRoles.map((r) => [r.user_id, r.role]));

  // Top courses
  const courseSales: Record<string, { sales: number; revenue: number }> = {};
  stats.allPurchases.forEach((p) => {
    if (!courseSales[p.course_id]) courseSales[p.course_id] = { sales: 0, revenue: 0 };
    courseSales[p.course_id].sales += 1;
    courseSales[p.course_id].revenue += Number(p.price_paid);
  });
  const topCourses = Object.entries(courseSales)
    .sort((a, b) => b[1].sales - a[1].sales)
    .slice(0, 10)
    .map(([id, data]) => {
      const c = courseMap.get(id);
      return { id, title: c?.title || "Unknown", category: c?.category || "—", thumbnail: c?.thumbnail_url, is_published: c?.is_published, ...data };
    });

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400" },
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "text-green-400" },
    { label: "Published", value: stats.publishedCourses, icon: BookOpen, color: "text-emerald-400" },
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400" },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-lime-400" },
    { label: "Active Subs", value: stats.activeSubs, icon: CreditCard, color: "text-purple-400" },
    { label: "Resellers", value: stats.resellers, icon: Briefcase, color: "text-cyan-400" },
    { label: "Avg Order Value", value: `₹${stats.avgOrderValue.toLocaleString()}`, icon: Calculator, color: "text-teal-400" },
    { label: "Pending Exchange", value: stats.pendingExchange, icon: ArrowLeftRight, color: "text-orange-400" },
    { label: "Pending Sell", value: stats.pendingSell, icon: Coins, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => navigate("/admin/courses")} className="bg-green-600 hover:bg-green-700 gap-1">
            <Plus className="h-4 w-4" /> Add Course
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/notifications")} className="border-[#334155] gap-1">
            <Bell className="h-4 w-4" /> Notify
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/exchange-requests")} className="border-[#334155] gap-1">
            <Eye className="h-4 w-4" /> Requests
          </Button>
        </div>
      </div>

      {/* 10 Stat Cards — 2 rows of 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-[#0F172A] ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Toggle */}
      <div className="flex justify-end">
        <ToggleGroup type="single" value={chartPeriod} onValueChange={(v) => v && setChartPeriod(v)} className="bg-[#1E293B] rounded-lg p-1 border border-[#334155]">
          <ToggleGroupItem value="7" className="text-xs px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white">7D</ToggleGroupItem>
          <ToggleGroupItem value="30" className="text-xs px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white">30D</ToggleGroupItem>
          <ToggleGroupItem value="90" className="text-xs px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white">90D</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 3 Charts in a row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Revenue ({days}D)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Sales ({days}D)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155" }} />
                <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Sales by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders — full width */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 gap-1" onClick={() => navigate("/admin/orders")}>
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[280px] overflow-y-auto overflow-x-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-12">Thumb</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
                )}
                {stats.recentOrders.map((o, i) => {
                  const course = courseMap.get(o.course_id);
                  const profile = profileMap.get(o.user_id);
                  return (
                    <TableRow key={o.id} className={`border-[#334155] ${i % 2 === 0 ? "bg-[#1E293B]" : "bg-[#263244]"}`}>
                      <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                      <TableCell>
                        {course?.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center text-xs">N/A</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-normal">{course?.title || o.course_id}</TableCell>
                      <TableCell className="text-sm">{profile?.full_name || profile?.email || "—"}</TableCell>
                      <TableCell className="font-semibold">₹{Number(o.price_paid).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{formatDateTime(o.created_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Signups — full width */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recent Signups</CardTitle>
          <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 gap-1" onClick={() => navigate("/admin/users")}>
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[280px] overflow-y-auto overflow-x-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-12">Avatar</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUsers.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users yet</TableCell></TableRow>
                )}
                {stats.recentUsers.map((u, i) => {
                  const role = roleMap.get(u.id) || "user";
                  const initials = (u.full_name || u.email || "?").charAt(0).toUpperCase();
                  return (
                    <TableRow key={u.id} className={`border-[#334155] ${i % 2 === 0 ? "bg-[#1E293B]" : "bg-[#263244]"}`}>
                      <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#334155] text-sm">{initials}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-sm whitespace-normal">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-sm">{u.email || "—"}</TableCell>
                      <TableCell className="text-xs">{formatDateTime(u.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={role === "admin" ? "bg-red-600/20 text-red-400 border-red-600/30" : "bg-blue-600/20 text-blue-400 border-blue-600/30"}>
                          {role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Courses — full width */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Top Courses</CardTitle>
          <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 gap-1" onClick={() => navigate("/admin/courses")}>
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[280px] overflow-y-auto overflow-x-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-12">Thumb</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCourses.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No sales data</TableCell></TableRow>
                )}
                {topCourses.map((c, i) => (
                  <TableRow key={c.id} className={`border-[#334155] ${i % 2 === 0 ? "bg-[#1E293B]" : "bg-[#263244]"}`}>
                    <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                    <TableCell>
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#334155] flex items-center justify-center text-xs">N/A</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-normal">{c.title}</TableCell>
                    <TableCell className="text-sm">{c.category}</TableCell>
                    <TableCell className="font-semibold">{c.sales}</TableCell>
                    <TableCell className="font-semibold">₹{c.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={c.is_published ? "bg-green-600/20 text-green-400 border-green-600/30" : "bg-red-600/20 text-red-400 border-red-600/30"}>
                        {c.is_published ? "Published" : "Unpublished"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
