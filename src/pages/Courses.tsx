import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { searchCourses, categories } from "@/data/courses";

const ITEMS_PER_PAGE = 20;

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let results = searchCourses(query, category);
    if (sortBy === "price-low") results.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") results.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
    else results.sort((a, b) => b.students - a.students);
    return results;
  }, [query, category, sortBy]);

  const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (val === "all") params.delete("category");
    else params.set("category", val);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
            {category !== "all" ? categories.find(c => c.id === category)?.name || "All" : "All"} Courses
          </h1>
          <p className="text-muted-foreground">{filtered.length.toLocaleString()} courses available</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search courses..."
              className="pl-10 bg-card border-border"
            />
          </div>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-44 bg-card border-border">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={v => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40 bg-card border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low-High</SelectItem>
              <SelectItem value="price-high">Price: High-Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginated.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {paginated.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No courses found. Try a different search.</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={() => setPage(p => p + 1)} className="border-border hover:bg-secondary">
              Load More Courses
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Courses;
