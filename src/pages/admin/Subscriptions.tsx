import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Search, 
  Users, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  MoreVertical, 
  Filter,
  TrendingUp,
  PieChart as PieChartIcon,
  User,
  Mail,
  Zap,
  History,
  XCircle,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subs, setSubs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map());
  const [courses, setCourses] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDurationDialogOpen, setIsDurationDialogOpen] = useState(false);
  const [durationDays, setDurationDays] = useState<string>("30");
  const [durationAction, setDurationAction] = useState<"extend" | "reduce">("extend");
  const [updatingDuration, setUpdatingDuration] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: subsData, error: subError } = await (supabase as any)
        .from("subscriptions")
        .select(`id, plan_name, start_date, end_date, status, user_id, created_at`)
        .order("created_at", { ascending: false });
        
      if (subError) throw subError;

      const { data: profData, error: profError } = await supabase.from("profiles").select("id, full_name, email");
      if (profError) throw profError;

      const { data: courseData, error: courseError } = await supabase.from("courses").select("id, title");
      if (courseError) throw courseError;

      setSubs(subsData || []);
      
      const pMap = new Map();
      (profData || []).forEach(p => pMap.set(p.id, p));
      setProfiles(pMap);

      const cMap = new Map();
      (courseData || []).forEach(c => cMap.set(c.id, c));
      setCourses(cMap);

    } catch (err) {
      console.error("Error loading subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const today = new Date();
    const active = subs.filter(s => s.status === 'active' && (!s.end_date || new Date(s.end_date) >= today)).length;
    const expired = subs.filter(s => s.end_date && new Date(s.end_date) < today).length;
    return {
      total: subs.length,
      active,
      expired,
      revenue: subs.reduce((acc, s) => {
        const price = s.plan_name?.toLowerCase().includes('yearly') ? 2999 : 299;
        return acc + price;
      }, 0)
    };
  }, [subs]);

  const chartData = useMemo(() => {
    const growth = subs.reduce((acc: any[], s) => {
      const date = new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, []).reverse().slice(-10);

    const distribution = subs.reduce((acc: any[], s) => {
      const planNameDisplay = s.plan_name?.toLowerCase().includes('yearly') ? 'Yearly' : 'Monthly';
      const existing = acc.find(item => item.name === planNameDisplay);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: planNameDisplay, value: 1 });
      }
      return acc;
    }, []);

    return { growth, distribution };
  }, [subs]);

  const filtered = useMemo(() => {
    return subs.filter(s => {
      const u = profiles.get(s.user_id);
      const uStr = `${u?.full_name || ""} ${u?.email || ""}`.toLowerCase();
      const today = new Date();

      let isExpired = false;
      if (s.end_date && new Date(s.end_date) < today) isExpired = true;
      
      const computedStatus = isExpired ? "expired" : s.status;

      if (search) {
        const q = search.toLowerCase();
        if (!uStr.includes(q)) return false;
      }

      if (statusFilter !== "all" && computedStatus !== statusFilter) return false;
      
      if (planFilter !== "all") {
        const isYearly = s.plan_name?.toLowerCase().includes('yearly');
        if (planFilter === "yearly" && !isYearly) return false;
        if (planFilter === "monthly" && isYearly) return false;
      }

      return true;
    });
  }, [subs, profiles, search, statusFilter, planFilter]);

  const handleOpenDurationDialog = (action: "extend" | "reduce") => {
    setDurationAction(action);
    setDurationDays("30");
    setIsDurationDialogOpen(true);
  };

  const handleUpdateDuration = async () => {
    if (!selectedSub) return;
    setUpdatingDuration(true);
    try {
      const days = parseInt(durationDays);
      if (isNaN(days) || days <= 0) throw new Error("Please enter a valid number of days");

      const currentEndDate = selectedSub.end_date ? new Date(selectedSub.end_date) : new Date();
      const newEndDate = new Date(currentEndDate);
      
      if (durationAction === "extend") {
        newEndDate.setDate(newEndDate.getDate() + days);
      } else {
        newEndDate.setDate(newEndDate.getDate() - days);
      }

      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ end_date: newEndDate.toISOString() })
        .eq("user_id", selectedSub.user_id);

      if (subError) throw subError;

      // History Tracking
      try {
        await (supabase as any)
          .from("subscription_history")
          .insert({
            user_id: selectedSub.user_id,
            action: durationAction === "extend" ? "extended" : "reduced",
            days_changed: durationAction === "extend" ? days : -days,
            plan_name: selectedSub.plan_name,
            amount: null,
            created_at: new Date().toISOString()
          });
      } catch (histError) {
        console.error("History tracking failed:", histError);
      }

      toast({
        title: `Plan ${durationAction === "extend" ? "Extended" : "Reduced"}`,
        description: `Successfully ${durationAction === "extend" ? "added" : "removed"} ${days} days. New expiry: ${newEndDate.toLocaleDateString('en-GB')}`,
      });

      loadData();
      setIsDurationDialogOpen(false);
      setIsDetailsOpen(false);
    } catch (err: any) {
      console.error("Update error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setUpdatingDuration(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!selectedSub) return;
    setReactivating(true);
    try {
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("user_id", selectedSub.user_id);

      if (subError) throw subError;

      // History Tracking
      try {
        await (supabase as any)
          .from("subscription_history")
          .insert({
            user_id: selectedSub.user_id,
            action: "reactivated",
            days_changed: 0,
            plan_name: selectedSub.plan_name,
            amount: null,
            created_at: new Date().toISOString()
          });
      } catch (histError) {
        console.error("History tracking failed:", histError);
      }

      toast({
        title: "Subscription Reactivated",
        description: "The subscription has been successfully reactivated.",
      });

      loadData();
      setIsDetailsOpen(false);
    } catch (err: any) {
      console.error("Reactivation error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to reactivate subscription",
        variant: "destructive",
      });
    } finally {
      setReactivating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedSub) return;
    setCancelling(true);
    try {
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", selectedSub.user_id);

      if (subError) throw subError;

      // History Tracking
      try {
        await (supabase as any)
          .from("subscription_history")
          .insert({
            user_id: selectedSub.user_id,
            action: "cancelled",
            days_changed: 0,
            plan_name: selectedSub.plan_name,
            amount: null,
            created_at: new Date().toISOString()
          });
      } catch (histError) {
        console.error("History tracking failed:", histError);
      }

      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been successfully marked as cancelled. Access remains until expiry.",
      });

      // Update local state or re-fetch
      loadData();
      setIsCancelDialogOpen(false);
      setIsDetailsOpen(false);
    } catch (err: any) {
      console.error("Cancellation error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleViewDetails = (sub: any) => {
    setSelectedSub(sub);
    setIsDetailsOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center py-20 min-h-[400px] items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 pb-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 font-inter">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Subscriptions</h1>
        <p className="text-[13px] text-muted-foreground opacity-70">Manage and analyze your platform subscriptions.</p>
      </div>

      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Subscribers", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Users", value: stats.active, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Expired Plans", value: stats.expired, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Est. Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[16px] transition-all duration-300 group hover:translate-y-[-2px] hover:shadow-lg hover:border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-[13px] font-medium text-muted-foreground opacity-70 uppercase tracking-wider">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white/[0.02] p-5 rounded-[16px] border border-white/[0.05] backdrop-blur-md">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-70" />
          <Input 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10 bg-background/30 border-white/[0.05] rounded-[12px] focus:ring-primary/20 text-[14px]" 
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground opacity-70" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-background/30 border-white/[0.05] rounded-[12px] text-[13px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[140px] bg-background/30 border-white/[0.05] rounded-[12px] text-[13px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[16px] overflow-hidden hover:translate-y-[-2px] transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-5 pt-5">
            <div className="space-y-1">
              <CardTitle className="text-[16px] font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Subscription Growth
              </CardTitle>
              <p className="text-[13px] text-muted-foreground opacity-70">Trend of new subscriptions over time</p>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.growth}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)'}}
                    itemStyle={{color: 'hsl(var(--primary))'}}
                  />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[16px] hover:translate-y-[-2px] transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-5 pt-5">
            <div className="space-y-1">
              <CardTitle className="text-[16px] font-medium flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Plan Distribution
              </CardTitle>
              <p className="text-[13px] text-muted-foreground opacity-70">Monthly vs Yearly breakdown</p>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {chartData.distribution.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-[12px] text-muted-foreground opacity-70 font-medium">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[18px] font-semibold text-foreground">Subscription Records</h2>
          <p className="text-[13px] text-muted-foreground opacity-70">Showing {filtered.length} entries</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filtered.map((s) => {
            const user = profiles.get(s.user_id);
            const course = courses.get(s.course_id);
            
            const today = new Date();
            let isExpired = false;
            if (s.end_date && new Date(s.end_date) < today) isExpired = true;
            const activeStatus = isExpired ? "expired" : "active";
            
            const remainingDays = s.end_date ? Math.max(0, Math.ceil((new Date(s.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : Infinity;

            return (
              <div 
                key={s.id} 
                className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-[16px] border backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg group ${
                  activeStatus === "active" 
                    ? "bg-white/[0.02] border-white/[0.05] hover:border-primary/20" 
                    : "bg-white/[0.01] border-white/[0.03] opacity-70"
                }`}
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-4 w-full lg:w-1/3">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0 ${activeStatus === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {user?.full_name?.[0] || "?"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[16px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">{user?.full_name || "Unknown User"}</span>
                    <span className="text-[13px] text-muted-foreground opacity-70 truncate">{user?.email || "No email available"}</span>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 rounded-full text-[12px] font-medium px-[10px] py-[4px] border-none">
                        {s.plan_name || "Plan"}
                      </Badge>
                      <Badge 
                        className={`rounded-full text-[12px] font-medium px-[10px] py-[4px] shadow-none border-none ${
                          activeStatus === "active" 
                            ? "bg-emerald-500/10 text-emerald-500" 
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {activeStatus === "active" ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* CENTER */}
                <div className="flex flex-wrap gap-8 my-4 lg:my-0 w-full lg:w-auto px-4 lg:px-0">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest opacity-70 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Duration
                    </span>
                    <div className="flex items-center gap-2 text-[13px] font-medium">
                      <span className="text-muted-foreground opacity-70">{s.start_date ? new Date(s.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "—"}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-40" />
                      <span className={activeStatus === 'expired' ? 'text-rose-500' : 'text-muted-foreground opacity-70'}>
                        {s.end_date ? new Date(s.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Lifetime"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest opacity-70 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Time Left
                    </span>
                    <span className={`text-[14px] font-semibold ${remainingDays <= 7 && activeStatus === 'active' ? 'text-amber-500 animate-pulse' : 'text-foreground'}`}>
                      {remainingDays === Infinity ? "No Limit" : `${remainingDays} Days`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest opacity-70 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> Access
                    </span>
                    <span className="text-[13px] font-medium line-clamp-1 max-w-[180px] text-muted-foreground opacity-70">
                      {course?.title || (!s.course_id ? "Premium Platform Access" : "Unknown Course")}
                    </span>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(s)}
                    className="bg-white/[0.05] border-white/[0.05] rounded-[10px] px-[14px] py-[8px] h-auto text-[13px] font-medium hover:bg-white/[0.1] hover:border-white/[0.1] transition-all"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-[10px] h-9 w-9 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground opacity-50 hover:opacity-100"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card/20 rounded-3xl border border-dashed border-border/50">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No subscriptions found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Details Panel */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="bg-[#0f172a] border-l border-white/[0.05] w-full sm:max-w-md p-0 font-inter">
          {selectedSub && (
            <div className="flex flex-col h-full">
              {/* HEADER SECTION */}
              <div className="p-6 pb-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-[18px] font-bold text-primary shrink-0">
                  {profiles.get(selectedSub.user_id)?.full_name?.[0] || "?"}
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-[18px] font-bold text-foreground truncate">
                    {profiles.get(selectedSub.user_id)?.full_name || "Unknown User"}
                  </h2>
                  <p className="text-[13px] text-muted-foreground opacity-70 truncate">
                    {profiles.get(selectedSub.user_id)?.email || "No email"}
                  </p>
                </div>
              </div>
              
              <Separator className="bg-white/[0.05]" />

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* CURRENT PLAN SECTION (2x2 Grid) */}
                <section className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Current Plan</h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground opacity-50 font-medium">Plan</span>
                      <p className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-primary" /> {selectedSub.plan_name || "Standard"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground opacity-50 font-medium">Status</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${(!selectedSub.end_date || new Date(selectedSub.end_date) >= new Date()) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${(!selectedSub.end_date || new Date(selectedSub.end_date) >= new Date()) ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {(!selectedSub.end_date || new Date(selectedSub.end_date) >= new Date()) ? "Active" : "Expired"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground opacity-50 font-medium">Start Date</span>
                      <p className="text-[13px] font-medium text-foreground/90">
                        {selectedSub.start_date ? new Date(selectedSub.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground opacity-50 font-medium">Expiry Date</span>
                      <p className="text-[13px] font-medium text-foreground/90">
                        {selectedSub.end_date ? new Date(selectedSub.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Lifetime"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* BILLING HISTORY (Timeline Style) */}
                <section className="space-y-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Billing History</h3>
                  <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.05]">
                    {[
                      { event: "Plan Renewed", date: selectedSub.created_at, amount: "₹299", status: "SUCCESS" },
                      { event: "Plan Upgraded", date: new Date(new Date(selectedSub.created_at).getTime() - 30*24*60*60*1000).toISOString(), amount: "₹2999", status: "SUCCESS" }
                    ].map((item, i) => (
                      <div key={i} className="relative pl-6 flex items-center justify-between group">
                        <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#0f172a] bg-emerald-500 z-10" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-semibold text-foreground leading-none">{item.event}</span>
                          <span className="text-[11px] text-muted-foreground opacity-60">
                            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-[14px] font-bold text-foreground">{item.amount}</span>
                          <span className="text-[9px] font-bold text-emerald-500 tracking-widest leading-none bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* ACTION BUTTONS */}
              <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] space-y-3">
                {selectedSub.status === 'cancelled' ? (
                  <Button 
                    onClick={handleReactivateSubscription}
                    disabled={reactivating}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-[12px] transition-all flex items-center justify-center gap-2"
                  >
                    {reactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Reactivate Subscription
                  </Button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleOpenDurationDialog("extend")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-[12px] transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Extend Plan
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleOpenDurationDialog("reduce")}
                        className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 font-bold h-11 rounded-[12px] transition-all flex items-center justify-center gap-2"
                      >
                        <Minus className="h-4 w-4" /> Reduce Plan
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCancelDialogOpen(true)}
                      className="w-full border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 h-11 rounded-[12px] transition-all bg-transparent"
                    >
                      Cancel Subscription
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Duration Adjustment Dialog */}
      <Dialog open={isDurationDialogOpen} onOpenChange={setIsDurationDialogOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.05] rounded-[20px] max-w-[400px] font-inter">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {durationAction === "extend" ? <Plus className="h-5 w-5 text-emerald-500" /> : <Minus className="h-5 w-5 text-amber-500" />}
              {durationAction === "extend" ? "Extend Subscription" : "Reduce Subscription"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              {durationAction === "extend" 
                ? "Select how many days you want to add to this subscription." 
                : "Select how many days you want to remove from this subscription."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {["30", "90", "365"].map((days) => (
                <Button
                  key={days}
                  variant={durationDays === days ? "default" : "outline"}
                  onClick={() => setDurationDays(days)}
                  className={`rounded-xl h-10 font-bold ${durationDays === days ? 'bg-primary' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'}`}
                >
                  {days} Days
                </Button>
              ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Custom Days</label>
              <Input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="Enter custom days..."
                className="bg-background/30 border-white/[0.05] rounded-[12px] h-11 focus:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsDurationDialogOpen(false)}
              className="bg-transparent border-white/[0.05] rounded-[12px] hover:bg-white/[0.02] h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateDuration}
              disabled={updatingDuration}
              className={`rounded-[12px] font-bold h-11 px-6 min-w-[120px] ${durationAction === 'extend' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'}`}
            >
              {updatingDuration ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-[#0f172a] border-white/[0.05] rounded-[20px] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground pt-2">
              Are you sure you want to cancel this subscription? 
              Your access will remain active until the expiry date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-3">
            <AlertDialogCancel className="bg-transparent border-white/[0.05] rounded-[12px] hover:bg-white/[0.02]">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleCancelSubscription();
              }}
              disabled={cancelling}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-[12px] font-bold"
            >
              {cancelling ? "Cancelling..." : "Confirm Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
