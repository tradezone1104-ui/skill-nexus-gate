import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Plus, Pencil, Trash2, ExternalLink, Download, Upload, X, Loader2, Copy, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Trading", "Options", "Investing", "Technical Analysis",
  "Price Action/SMC", "Indicators & Tools", "Crypto & Forex", "Algo & AI Skills"
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const DEFAULT_LEARN = [
  "Master the fundamentals from scratch",
  "Build real-world trading strategies",
  "Understand risk management and position sizing",
  "Read and analyze market charts with confidence",
  "Develop a disciplined trading psychology",
  "Apply advanced techniques used by professionals",
  "Create your own personalized trading system",
  "Access exclusive community resources and support",
];

const DEFAULT_REQUIREMENTS = [
  "No prior experience required — we start from the basics",
  "A computer or mobile device with internet access",
  "A demo or real trading/demat account (guidance provided)",
  "Willingness to practice and learn consistently",
];

const DEFAULT_TAGS = [
  "trading",
  "investing",
  "stock market",
  "beginners",
  "technical analysis",
];

const CAT_COLORS: Record<string, string> = {
  "Trading": "bg-blue-500/20 text-blue-400",
  "Options": "bg-purple-500/20 text-purple-400",
  "Investing": "bg-emerald-500/20 text-emerald-400",
  "Technical Analysis": "bg-amber-500/20 text-amber-400",
  "Price Action/SMC": "bg-rose-500/20 text-rose-400",
  "Indicators & Tools": "bg-cyan-500/20 text-cyan-400",
  "Crypto & Forex": "bg-orange-500/20 text-orange-400",
  "Algo & AI Skills": "bg-indigo-500/20 text-indigo-400",
};

interface CourseForm {
  title: string; short_description: string; description: string; category: string;
  subcategory: string;
  instructor_name: string; instructor_bio: string; price: string; original_price: string;
  thumbnail_url: string; telegram_link: string; level: string; language: string;
  duration_hours: string; total_lectures: string; rating: string; total_students: string;
  is_featured: boolean; is_free: boolean; is_published: boolean;
  what_you_learn: string[]; requirements: string[]; tags: string[];
}

const emptyForm: CourseForm = {
  title: "", short_description: "", description: "", category: CATEGORIES[0],
  subcategory: "",
  instructor_name: "", instructor_bio: "", price: "", original_price: "",
  thumbnail_url: "", telegram_link: "", level: "Beginner", language: "Hindi",
  duration_hours: "", total_lectures: "", rating: "", total_students: "",
  is_featured: false, is_free: false, is_published: false,
  what_you_learn: [], requirements: [], tags: [],
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [pubFilter, setPubFilter] = useState("all");
  const [featFilter, setFeatFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 20;
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const [thumbMode, setThumbMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [tagInput, setTagInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [reqInput, setReqInput] = useState("");

  const [csvOpen, setCsvOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filtered = courses.filter((c) => {
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase()) && !c.instructor_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "all" && c.category !== catFilter) return false;
    if (levelFilter !== "all" && c.level !== levelFilter) return false;
    if (pubFilter === "published" && !c.is_published) return false;
    if (pubFilter === "unpublished" && c.is_published) return false;
    if (featFilter === "featured" && !c.is_featured) return false;
    if (featFilter === "not-featured" && c.is_featured) return false;
    return true;
  });

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const openAdd = () => {
    setEditId(null); setForm({ ...emptyForm }); setLearnInput(""); setReqInput("");
    setTagInput(""); setThumbMode("url"); setFormOpen(true);
  };

  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({
      title: c.title || "", short_description: c.short_description || "", description: c.description || "",
      category: c.category || CATEGORIES[0], subcategory: c.subcategory || "",
      instructor_name: c.instructor_name || "", instructor_bio: c.instructor_bio || "",
      price: c.price != null && c.price !== 0 ? String(c.price) : "",
      original_price: c.original_price != null && c.original_price !== 0 ? String(c.original_price) : "",
      thumbnail_url: c.thumbnail_url || "", telegram_link: c.telegram_link || "",
      level: c.level || "Beginner", language: c.language || "Hindi",
      duration_hours: c.duration_hours != null && c.duration_hours !== 0 ? String(c.duration_hours) : "",
      total_lectures: c.total_lectures != null && c.total_lectures !== 0 ? String(c.total_lectures) : "",
      rating: c.rating != null && c.rating !== 0 ? String(c.rating) : "",
      total_students: c.total_students != null && c.total_students !== 0 ? String(c.total_students) : "",
      is_featured: !!c.is_featured, is_free: !!c.is_free, is_published: !!c.is_published,
      what_you_learn: c.what_you_learn || [], requirements: c.requirements || [], tags: c.tags || [],
    });
    setLearnInput(""); setReqInput(""); setTagInput("");
    setThumbMode(c.thumbnail_url ? "url" : "url");
    setFormOpen(true);
  };

  const buildPayload = (f: CourseForm) => ({
    title: f.title,
    short_description: f.short_description,
    description: f.description,
    category: f.category,
    subcategory: f.subcategory || null,
    instructor_name: f.instructor_name,
    instructor_bio: f.instructor_bio,
    price: f.price !== "" ? Number(f.price) : null,
    original_price: f.original_price !== "" ? Number(f.original_price) : null,
    thumbnail_url: f.thumbnail_url,
    telegram_link: f.telegram_link,
    level: f.level,
    language: f.language,
    duration_hours: f.duration_hours !== "" ? Number(f.duration_hours) : null,
    total_lectures: f.total_lectures !== "" ? Number(f.total_lectures) : null,
    rating: f.rating !== "" ? Number(f.rating) : null,
    total_students: f.total_students !== "" ? Number(f.total_students) : null,
    is_featured: f.is_featured,
    is_free: f.is_free,
    is_published: f.is_published,
    what_you_learn: f.what_you_learn.length > 0 ? f.what_you_learn : DEFAULT_LEARN,
    requirements: f.requirements.length > 0 ? f.requirements : DEFAULT_REQUIREMENTS,
    tags: f.tags.length > 0 ? f.tags : DEFAULT_TAGS,
  });

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);

    // Capture any pending inputs before building payload
    const finalLearn = [...form.what_you_learn];
    if (learnInput.trim()) finalLearn.push(learnInput.trim());

    const finalReq = [...form.requirements];
    if (reqInput.trim()) finalReq.push(reqInput.trim());

    const finalTags = [...form.tags];
    if (tagInput.trim()) {
      const t = tagInput.trim();
      if (!finalTags.includes(t)) finalTags.push(t);
    }

    const payload = buildPayload({
      ...form,
      what_you_learn: finalLearn.filter(i => i.trim() !== ""),
      requirements: finalReq.filter(i => i.trim() !== ""),
      tags: finalTags.filter(i => i.trim() !== "")
    });

    try {
      if (editId) {
        const { error } = await supabase.from("courses").update(payload as any).eq("id", editId);
        if (error) throw error;
        toast({ title: "Course updated successfully" });
      } else {
        const { error } = await supabase.from("courses").insert(payload as any);
        if (error) throw error;
        toast({ title: "Course added successfully" });
      }
      setFormOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Error saving course", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("courses").delete().eq("id", deleteId);
    if (error) toast({ title: "Error deleting course", description: error.message, variant: "destructive" });
    else toast({ title: "Course deleted" });
    setDeleteId(null);
    fetchCourses();
  };

  const handleDuplicate = async (c: any) => {
    const { id, created_at, updated_at, ...rest } = c;
    const { error } = await supabase.from("courses").insert({ ...rest, title: `${c.title} (Copy)`, is_published: false });
    if (error) toast({ title: "Duplicate failed", description: error.message, variant: "destructive" });
    else toast({ title: "Course duplicated" });
    fetchCourses();
  };

  const toggleField = async (id: string, field: "is_published" | "is_featured", current: boolean) => {
    setToggling(id + field);
    const { error } = await supabase.from("courses").update({ [field]: !current }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Course ${field === "is_published" ? (!current ? "published" : "unpublished") : (!current ? "featured" : "unfeatured")}` });
      setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: !current } : c));
    }
    setToggling(null);
  };

  // Thumbnail upload — uses course-thumbnails bucket
  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Only JPG, PNG, WEBP allowed", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("course-thumbnails").upload(path, file);
    if (error) {
      toast({ title: "Image upload failed", description: "Please try URL instead", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
    setForm(f => ({ ...f, thumbnail_url: urlData.publicUrl }));
    toast({ title: "Image uploaded successfully" });
    setUploading(false);
  };

  const addTag = (val: string) => {
    const tag = val.trim();
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput("");
  };
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && form.tags.length) {
      setForm(f => ({ ...f, tags: f.tags.slice(0, -1) }));
    }
  };

  const addLearnPoint = () => { if (learnInput.trim()) { setForm(f => ({ ...f, what_you_learn: [...f.what_you_learn, learnInput.trim()] })); setLearnInput(""); } };
  const addReqPoint = () => { if (reqInput.trim()) { setForm(f => ({ ...f, requirements: [...f.requirements, reqInput.trim()] })); setReqInput(""); } };

  // CSV
  const exportCSV = () => {
    const columns = [
      "title", "description", "short_description", "price", "original_price",
      "thumbnail_url", "instructor_name", "instructor_bio", "category",
      "subcategory", "level", "language", "duration_hours", "total_lectures",
      "rating", "total_reviews", "total_students", "telegram_link", "is_free",
      "is_featured", "is_published", "tags", "what_you_learn", "requirements"
    ];

    const header = columns.join(",") + "\n";
    const rows = courses.map(c => {
      return columns.map(col => {
        let val = c[col];
        if (val === null || val === undefined) val = "";

        if (col === "tags" && Array.isArray(val)) {
          val = `"${val.join(",")}"`;
        } else if ((col === "what_you_learn" || col === "requirements") && Array.isArray(val)) {
          val = `"${val.join("|")}"`;
        } else if (typeof val === "string") {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(",");
    }).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `courses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast({ title: "Export successful", description: `${courses.length} courses exported.` });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) { setCsvErrors(["CSV file must have a header and at least one row"]); return; }
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      const errors: string[] = [];
      const rows = lines.slice(1).map((line, idx) => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        if (!obj.title) errors.push(`Row ${idx + 2}: Title is required`);
        // Number fields: empty/missing → null, not 0
        obj.price = obj.price !== "" ? (Number(obj.price) || null) : null;
        obj.original_price = obj.original_price !== "" ? (Number(obj.original_price) || null) : null;
        obj.duration_hours = obj.duration_hours !== "" ? (Number(obj.duration_hours) || null) : null;
        obj.total_lectures = obj.total_lectures !== "" ? (Number(obj.total_lectures) || null) : null;
        obj.rating = obj.rating !== "" ? (Number(obj.rating) || null) : null;
        obj.total_students = obj.total_students !== "" ? (Number(obj.total_students) || null) : null;
        // Boolean fields: default to false
        obj.is_free = obj.is_free === "true";
        obj.is_featured = obj.is_featured === "true";
        obj.is_published = obj.is_published === "true";

        // Handle arrays with specific separators and defaults
        if (obj.tags && typeof obj.tags === "string" && obj.tags.trim()) {
          obj.tags = obj.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
        } else {
          obj.tags = DEFAULT_TAGS;
        }

        if (obj.what_you_learn && typeof obj.what_you_learn === "string" && obj.what_you_learn.trim()) {
          obj.what_you_learn = obj.what_you_learn.split("|").map((t: string) => t.trim()).filter(Boolean);
        } else {
          obj.what_you_learn = DEFAULT_LEARN;
        }

        if (obj.requirements && typeof obj.requirements === "string" && obj.requirements.trim()) {
          obj.requirements = obj.requirements.split("|").map((t: string) => t.trim()).filter(Boolean);
        } else {
          obj.requirements = DEFAULT_REQUIREMENTS;
        }
        // Clean empty strings to null for optional text fields
        if (!obj.category) obj.category = null;
        if (!obj.subcategory) obj.subcategory = null;
        if (!obj.instructor_name) obj.instructor_name = null;
        if (!obj.level) obj.level = null;
        return obj;
      });
      setCsvErrors(errors);
      setCsvData(rows);
    };
    reader.readAsText(file);
  };

  const importCSV = async () => {
    setCsvImporting(true);
    const cleaned = csvData.map(r => ({ ...r, title: r.title || "Untitled" }));
    const { error } = await supabase.from("courses").insert(cleaned);
    if (error) toast({ title: "Import failed", description: error.message, variant: "destructive" });
    else toast({ title: `${csvData.length} courses imported successfully` });
    setCsvImporting(false); setCsvOpen(false); setCsvData([]); setCsvErrors([]);
    fetchCourses();
  };

  const priceNum = form.price !== "" ? Number(form.price) : 0;
  const origNum = form.original_price !== "" ? Number(form.original_price) : 0;
  const discount = origNum > 0 ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[#334155] pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Courses ({filtered.length})</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setCsvOpen(true)} variant="outline" className="gap-2 border-[#334155]"><Upload className="h-4 w-4" /> CSV Upload</Button>
          <Button onClick={exportCSV} variant="outline" className="gap-2 border-[#334155]"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={openAdd} className="gap-2 bg-green-600 hover:bg-green-700 text-white"><Plus className="h-4 w-4" /> Add New Course</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-10 bg-[#1E293B] border-[#334155]" />
        </div>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(0); }}>
          <SelectTrigger className="w-44 bg-[#1E293B] border-[#334155]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Categories</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36 bg-[#1E293B] border-[#334155]"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Levels</SelectItem>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={pubFilter} onValueChange={(v) => { setPubFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-[#1E293B] border-[#334155]"><SelectValue placeholder="Published" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="unpublished">Unpublished</SelectItem></SelectContent>
        </Select>
        <Select value={featFilter} onValueChange={(v) => { setFeatFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36 bg-[#1E293B] border-[#334155]"><SelectValue placeholder="Featured" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="featured">Featured</SelectItem><SelectItem value="not-featured">Not Featured</SelectItem></SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-[#334155]" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-14">Thumb</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((c, idx) => (
                  <TableRow key={c.id} className="border-[#334155] hover:bg-[#334155]/50 transition-colors">
                    <TableCell className="text-muted-foreground text-xs">{page * perPage + idx + 1}</TableCell>
                    <TableCell>
                      {c.thumbnail_url ? (
                        <img src={c.thumbnail_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-[#334155] flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                    </TableCell>
                    <TableCell><span className="font-medium text-sm whitespace-normal break-words max-w-[200px] block">{c.title}</span></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={`text-xs ${CAT_COLORS[c.category] || "bg-secondary/20 text-secondary"}`}>{c.category}</Badge>
                        {c.subcategory && <span className="text-[10px] text-muted-foreground">{c.subcategory}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.instructor_name}</TableCell>
                    <TableCell>
                      {c.is_free ? (
                        <Badge className="bg-green-500/20 text-green-400">Free</Badge>
                      ) : (
                        <div className="text-sm">
                          <span className="font-semibold">₹{c.price ?? 0}</span>
                          {c.original_price != null && c.original_price > 0 && c.original_price !== c.price && (
                            <span className="text-muted-foreground line-through ml-1 text-xs">₹{c.original_price}</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{c.total_students || 0}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {Number(c.rating || 0).toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleField(c.id, "is_published", c.is_published)} disabled={toggling === c.id + "is_published"} className="cursor-pointer">
                        <Badge className={`text-xs transition-colors ${c.is_published ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}`}>
                          {toggling === c.id + "is_published" ? <Loader2 className="h-3 w-3 animate-spin" /> : (c.is_published ? "Published" : "Draft")}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleField(c.id, "is_featured", c.is_featured)} disabled={toggling === c.id + "is_featured"} className="cursor-pointer">
                        <Badge className={`text-xs transition-colors ${c.is_featured ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" : "bg-[#334155]/50 text-muted-foreground hover:bg-[#334155]"}`}>
                          {toggling === c.id + "is_featured" ? <Loader2 className="h-3 w-3 animate-spin" /> : (c.is_featured ? "Yes" : "No")}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview" onClick={() => window.open(`/course/${c.id}`, "_blank")}><ExternalLink className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicate" onClick={() => handleDuplicate(c)}><Copy className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" title="Delete" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-10 w-10 text-[#334155]" />
                      <p>No courses found</p>
                    </div>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-[#334155]">Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="border-[#334155]">Next</Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1E293B] border-[#334155]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {/* Section 1: Basic Info */}
            <SectionHeading title="Basic Info" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Course Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-[#0F172A] border-[#334155]"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subcategory</Label>
                <Input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} placeholder="e.g. Candlestick Patterns" className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                  <SelectTrigger className="bg-[#0F172A] border-[#334155]"><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Instructor Name</Label>
                <Input value={form.instructor_name} onChange={e => setForm(f => ({ ...f, instructor_name: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
            </div>

            {/* Section 2: Pricing */}
            <SectionHeading title="Pricing" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Selling Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 499" className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price (₹) {discount > 0 && <span className="text-green-400 ml-1 text-xs">{discount}% off</span>}</Label>
                <Input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="e.g. 1999" className="bg-[#0F172A] border-[#334155]" />
              </div>
            </div>

            {/* Section 3: Course Details */}
            <SectionHeading title="Course Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duration (hours)</Label>
                <Input type="number" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} placeholder="e.g. 8.5" className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Total Lectures</Label>
                <Input type="number" value={form.total_lectures} onChange={e => setForm(f => ({ ...f, total_lectures: e.target.value }))} placeholder="e.g. 42" className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Rating (0-5)</Label>
                <Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} placeholder="e.g. 4.7" className="bg-[#0F172A] border-[#334155]" />
                <p className="text-xs text-muted-foreground">Auto-updates when users rate</p>
              </div>
              <div className="space-y-1.5">
                <Label>Students Count</Label>
                <Input type="number" min={0} value={form.total_students} onChange={e => setForm(f => ({ ...f, total_students: e.target.value }))} placeholder="e.g. 1000" className="bg-[#0F172A] border-[#334155]" />
                <p className="text-xs text-muted-foreground">Auto-updates when users purchase</p>
              </div>
            </div>

            {/* Section 4: Media */}
            <SectionHeading title="Media" />
            <div className="space-y-3">
              <div className="flex gap-2 mb-2">
                <Button type="button" size="sm" variant={thumbMode === "upload" ? "default" : "outline"} onClick={() => setThumbMode("upload")} className={thumbMode === "upload" ? "bg-green-600 hover:bg-green-700" : "border-[#334155]"}>
                  <ImageIcon className="h-3.5 w-3.5 mr-1" /> Upload Image
                </Button>
                <Button type="button" size="sm" variant={thumbMode === "url" ? "default" : "outline"} onClick={() => setThumbMode("url")} className={thumbMode === "url" ? "bg-green-600 hover:bg-green-700" : "border-[#334155]"}>
                  <LinkIcon className="h-3.5 w-3.5 mr-1" /> Paste URL
                </Button>
              </div>
              {thumbMode === "upload" ? (
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleThumbUpload} className="hidden" />
                  <Button type="button" variant="outline" className="border-[#334155] gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Choose File"}
                  </Button>
                </div>
              ) : (
                <Input placeholder="https://example.com/image.jpg" value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
              )}
              {form.thumbnail_url && (
                <div className="mt-2">
                  <img src={form.thumbnail_url} alt="preview" className="h-[120px] w-[200px] rounded-lg object-cover border border-[#334155]" />
                </div>
              )}
            </div>

            {/* Section 5: Links */}
            <SectionHeading title="Links" />
            <div className="space-y-1.5">
              <Label>Telegram Link</Label>
              <Input value={form.telegram_link} onChange={e => setForm(f => ({ ...f, telegram_link: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
            </div>

            {/* Section 6: Description */}
            <SectionHeading title="Description" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Short Description</Label>
                <Textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="bg-[#0F172A] border-[#334155]" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Full Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-[#0F172A] border-[#334155]" rows={4} />
              </div>
            </div>

            {/* Section 7: Tags & Learning */}
            <SectionHeading title="Tags & Learning" />
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#0F172A] border border-[#334155] rounded-md min-h-[40px] items-center">
                {form.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter((_, j) => j !== i) }))} />
                  </Badge>
                ))}
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={form.tags.length === 0 ? `Defaults: ${DEFAULT_TAGS.join(", ")}` : ""}
                  className="bg-transparent outline-none text-sm flex-1 min-w-[100px] text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>What You'll Learn</Label>
              <div className="space-y-2">
                {form.what_you_learn.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input 
                      value={form.what_you_learn[i]} 
                      onChange={e => {
                        const val = e.target.value;
                        setForm(f => {
                          const updated = [...f.what_you_learn];
                          updated[i] = val;
                          return { ...f, what_you_learn: updated };
                        });
                      }} 
                      className="bg-[#0F172A] border-[#334155] flex-1" 
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => setForm(f => ({ ...f, what_you_learn: f.what_you_learn.filter((_, j) => j !== i) }))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={learnInput} onChange={e => setLearnInput(e.target.value)} className="bg-[#0F172A] border-[#334155]" placeholder={form.what_you_learn.length === 0 ? "Empty will use 8 default points..." : "Add a learning point"} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addLearnPoint())} />
                  <Button type="button" size="sm" onClick={addLearnPoint} className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Requirements</Label>
              <div className="space-y-2">
                {form.requirements.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input 
                      value={form.requirements[i]} 
                      onChange={e => {
                        const val = e.target.value;
                        setForm(f => {
                          const updated = [...f.requirements];
                          updated[i] = val;
                          return { ...f, requirements: updated };
                        });
                      }} 
                      className="bg-[#0F172A] border-[#334155] flex-1" 
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => setForm(f => ({ ...f, requirements: f.requirements.filter((_, j) => j !== i) }))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={reqInput} onChange={e => setReqInput(e.target.value)} className="bg-[#0F172A] border-[#334155]" placeholder={form.requirements.length === 0 ? "Empty will use 4 default points..." : "Add a requirement"} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addReqPoint())} />
                  <Button type="button" size="sm" onClick={addReqPoint} className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Section 8: Settings */}
            <SectionHeading title="Settings" />
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} /><Label>Published</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} /><Label>Featured</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_free} onCheckedChange={v => setForm(f => ({ ...f, is_free: v }))} /><Label>Free</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} className="border-[#334155]">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"} Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1E293B] border-[#334155]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The course will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#334155]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Upload Modal with Preview */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="max-w-2xl bg-[#1E293B] border-[#334155]">
          <DialogHeader><DialogTitle>Bulk Upload Courses (CSV)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#334155] rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload CSV file</p>
              <Input type="file" accept=".csv" onChange={handleCSVUpload} className="bg-[#0F172A] border-[#334155]" />
            </div>

            {csvErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-1">
                {csvErrors.map((err, i) => <p key={i} className="text-sm text-red-400">⚠ {err}</p>)}
              </div>
            )}

            {csvData.length > 0 && (
              <>
                <p className="text-sm text-green-400 font-medium">{csvData.length} courses found in CSV</p>
                <div className="overflow-x-auto max-h-56 border border-[#334155] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#334155]">
                        <TableHead>#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 5).map((r, i) => (
                        <TableRow key={i} className={`border-[#334155] ${!r.title ? "bg-red-500/10" : ""}`}>
                          <TableCell className="text-xs">{i + 1}</TableCell>
                          <TableCell className="text-sm font-medium">{r.title || <span className="text-red-400">Missing</span>}</TableCell>
                          <TableCell className="text-sm">{r.category || "—"}</TableCell>
                          <TableCell className="text-sm">{r.instructor_name || "—"}</TableCell>
                          <TableCell className="text-sm">{r.price != null ? `₹${r.price}` : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {csvData.length > 5 && <p className="text-xs text-muted-foreground text-center py-2">...and {csvData.length - 5} more rows</p>}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCsvOpen(false); setCsvData([]); setCsvErrors([]); }} className="border-[#334155]">Cancel</Button>
            <Button onClick={importCSV} disabled={csvData.length === 0 || csvImporting || csvErrors.length > 0} className="bg-green-600 hover:bg-green-700 gap-2">
              {csvImporting && <Loader2 className="h-4 w-4 animate-spin" />}Confirm Import ({csvData.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
