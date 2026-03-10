import { useEffect, useState, useCallback } from "react";
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
import { Search, Star, Plus, Pencil, Trash2, ExternalLink, Download, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Trading", "Options", "Investing", "Technical Analysis",
  "Price Action/SMC", "Indicators & Tools", "Crypto & Forex", "Algo & AI Skills"
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

interface CourseForm {
  title: string; short_description: string; description: string; category: string;
  instructor_name: string; price: number; original_price: number;
  thumbnail_url: string; telegram_link: string; level: string; language: string;
  duration_hours: number; total_lectures: number; rating: number; total_students: number;
  is_featured: boolean; is_free: boolean; is_published: boolean;
  what_you_learn: string[]; requirements: string[]; tags: string[];
}

const emptyForm: CourseForm = {
  title: "", short_description: "", description: "", category: CATEGORIES[0],
  instructor_name: "", price: 0, original_price: 0,
  thumbnail_url: "", telegram_link: "", level: "Beginner", language: "Hindi",
  duration_hours: 0, total_lectures: 0, rating: 0, total_students: 0,
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

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Multi-input helpers
  const [learnInput, setLearnInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // CSV upload
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
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

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setLearnInput(""); setReqInput(""); setTagsInput(""); setFormOpen(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({
      title: c.title || "", short_description: c.short_description || "", description: c.description || "",
      category: c.category || CATEGORIES[0], instructor_name: c.instructor_name || "",
      price: c.price || 0, original_price: c.original_price || 0,
      thumbnail_url: c.thumbnail_url || "", telegram_link: c.telegram_link || "",
      level: c.level || "Beginner", language: c.language || "Hindi",
      duration_hours: c.duration_hours || 0, total_lectures: c.total_lectures || 0,
      rating: c.rating || 0, total_students: c.total_students || 0,
      is_featured: !!c.is_featured, is_free: !!c.is_free, is_published: !!c.is_published,
      what_you_learn: c.what_you_learn || [], requirements: c.requirements || [], tags: c.tags || [],
    });
    setLearnInput(""); setReqInput(""); setTagsInput((c.tags || []).join(", "));
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      ...form,
      tags: tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(Boolean) : form.tags,
    };
    if (editId) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editId);
      if (error) toast({ title: "Error updating course", description: error.message, variant: "destructive" });
      else toast({ title: "Course updated successfully" });
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      if (error) toast({ title: "Error adding course", description: error.message, variant: "destructive" });
      else toast({ title: "Course added successfully" });
    }
    setSaving(false);
    setFormOpen(false);
    fetchCourses();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("courses").delete().eq("id", deleteId);
    if (error) toast({ title: "Error deleting course", description: error.message, variant: "destructive" });
    else toast({ title: "Course deleted" });
    setDeleteId(null);
    fetchCourses();
  };

  const addLearnPoint = () => { if (learnInput.trim()) { setForm(f => ({ ...f, what_you_learn: [...f.what_you_learn, learnInput.trim()] })); setLearnInput(""); } };
  const addReqPoint = () => { if (reqInput.trim()) { setForm(f => ({ ...f, requirements: [...f.requirements, reqInput.trim()] })); setReqInput(""); } };

  const exportCSV = () => {
    const header = "title,category,instructor_name,price,original_price,level,rating,total_students,is_published,is_featured\n";
    const rows = courses.map(c =>
      `"${c.title}","${c.category}","${c.instructor_name}",${c.price},${c.original_price},"${c.level}",${c.rating},${c.total_students},${c.is_published},${c.is_featured}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "courses.csv"; a.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        // Type conversions
        if (obj.price) obj.price = Number(obj.price) || 0;
        if (obj.original_price) obj.original_price = Number(obj.original_price) || 0;
        if (obj.duration_hours) obj.duration_hours = Number(obj.duration_hours) || 0;
        if (obj.total_lectures) obj.total_lectures = Number(obj.total_lectures) || 0;
        if (obj.rating) obj.rating = Number(obj.rating) || 0;
        if (obj.total_students) obj.total_students = Number(obj.total_students) || 0;
        if (obj.is_free) obj.is_free = obj.is_free === "true";
        if (obj.is_featured) obj.is_featured = obj.is_featured === "true";
        if (obj.is_published) obj.is_published = obj.is_published === "true";
        if (obj.tags) obj.tags = obj.tags.split(";").map((t: string) => t.trim());
        if (obj.what_you_learn) obj.what_you_learn = obj.what_you_learn.split(";").map((t: string) => t.trim());
        if (obj.requirements) obj.requirements = obj.requirements.split(";").map((t: string) => t.trim());
        return obj;
      });
      setCsvData(rows);
    };
    reader.readAsText(file);
  };

  const importCSV = async () => {
    setCsvImporting(true);
    const { error } = await supabase.from("courses").insert(csvData.map(r => ({ ...r, title: r.title || "Untitled" })));
    if (error) toast({ title: "Import failed", description: error.message, variant: "destructive" });
    else toast({ title: `${csvData.length} courses imported` });
    setCsvImporting(false);
    setCsvOpen(false);
    setCsvData([]);
    fetchCourses();
  };

  const discount = form.original_price > 0 ? Math.round(((form.original_price - form.price) / form.original_price) * 100) : 0;

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
                  <TableHead>Course</TableHead>
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
                {paged.map((c) => (
                  <TableRow key={c.id} className="border-[#334155] hover:bg-[#334155]/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {c.thumbnail_url && <img src={c.thumbnail_url} alt="" className="h-10 w-16 rounded object-cover" />}
                        <span className="font-medium text-sm line-clamp-1 max-w-[200px]">{c.title}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{c.category}</Badge></TableCell>
                    <TableCell className="text-sm">{c.instructor_name}</TableCell>
                    <TableCell>{c.is_free ? <Badge className="bg-green-500/20 text-green-400">Free</Badge> : `₹${c.price}`}</TableCell>
                    <TableCell>{c.total_students || 0}</TableCell>
                    <TableCell><span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{c.rating || 0}</span></TableCell>
                    <TableCell>
                      <Badge className={c.is_published ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {c.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.is_featured && <Badge className="bg-primary/20 text-primary">Featured</Badge>}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/course/${c.id}`, "_blank")}><ExternalLink className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-12">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1E293B] border-[#334155]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
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
                <Label>Level</Label>
                <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                  <SelectTrigger className="bg-[#0F172A] border-[#334155]"><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Instructor Name</Label>
                <Input value={form.instructor_name} onChange={e => setForm(f => ({ ...f, instructor_name: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price (₹){discount > 0 && <span className="text-green-400 ml-2">{discount}% off</span>}</Label>
                <Input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: Number(e.target.value) }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (hours)</Label>
                <Input type="number" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: Number(e.target.value) }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Total Lectures</Label>
                <Input type="number" value={form.total_lectures} onChange={e => setForm(f => ({ ...f, total_lectures: Number(e.target.value) }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Rating (0-5)</Label>
                <Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
              <div className="space-y-1.5">
                <Label>Students Count</Label>
                <Input type="number" value={form.total_students} onChange={e => setForm(f => ({ ...f, total_students: Number(e.target.value) }))} className="bg-[#0F172A] border-[#334155]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail URL</Label>
              <Input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
              {form.thumbnail_url && <img src={form.thumbnail_url} alt="preview" className="h-20 rounded mt-1 object-cover" />}
            </div>
            <div className="space-y-1.5">
              <Label>Telegram Link</Label>
              <Input value={form.telegram_link} onChange={e => setForm(f => ({ ...f, telegram_link: e.target.value }))} className="bg-[#0F172A] border-[#334155]" />
            </div>
            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="bg-[#0F172A] border-[#334155]" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Full Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-[#0F172A] border-[#334155]" rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="bg-[#0F172A] border-[#334155]" placeholder="tag1, tag2, tag3" />
            </div>
            {/* What you'll learn */}
            <div className="space-y-1.5">
              <Label>What You'll Learn</Label>
              <div className="flex gap-2">
                <Input value={learnInput} onChange={e => setLearnInput(e.target.value)} className="bg-[#0F172A] border-[#334155]" placeholder="Add a point" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addLearnPoint())} />
                <Button type="button" size="sm" onClick={addLearnPoint} className="bg-green-600 hover:bg-green-700">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {form.what_you_learn.map((p, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{p}<X className="h-3 w-3 cursor-pointer" onClick={() => setForm(f => ({ ...f, what_you_learn: f.what_you_learn.filter((_, j) => j !== i) }))} /></Badge>
                ))}
              </div>
            </div>
            {/* Requirements */}
            <div className="space-y-1.5">
              <Label>Requirements</Label>
              <div className="flex gap-2">
                <Input value={reqInput} onChange={e => setReqInput(e.target.value)} className="bg-[#0F172A] border-[#334155]" placeholder="Add a requirement" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addReqPoint())} />
                <Button type="button" size="sm" onClick={addReqPoint} className="bg-green-600 hover:bg-green-700">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {form.requirements.map((p, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{p}<X className="h-3 w-3 cursor-pointer" onClick={() => setForm(f => ({ ...f, requirements: f.requirements.filter((_, j) => j !== i) }))} /></Badge>
                ))}
              </div>
            </div>
            {/* Toggles */}
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

      {/* CSV Upload Modal */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="max-w-xl bg-[#1E293B] border-[#334155]">
          <DialogHeader><DialogTitle>Bulk Upload Courses (CSV)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#334155] rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload CSV file</p>
              <Input type="file" accept=".csv" onChange={handleCSVUpload} className="bg-[#0F172A] border-[#334155]" />
            </div>
            {csvData.length > 0 && (
              <>
                <p className="text-sm text-green-400">{csvData.length} courses ready to import</p>
                <div className="max-h-40 overflow-y-auto text-xs">
                  {csvData.slice(0, 5).map((r, i) => <div key={i} className="py-1 border-b border-[#334155]">{r.title} — ₹{r.price}</div>)}
                  {csvData.length > 5 && <div className="py-1 text-muted-foreground">...and {csvData.length - 5} more</div>}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCsvOpen(false); setCsvData([]); }} className="border-[#334155]">Cancel</Button>
            <Button onClick={importCSV} disabled={csvData.length === 0 || csvImporting} className="bg-green-600 hover:bg-green-700 gap-2">
              {csvImporting && <Loader2 className="h-4 w-4 animate-spin" />}Import {csvData.length} Courses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
