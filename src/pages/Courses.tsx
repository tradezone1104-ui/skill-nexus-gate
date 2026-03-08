import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { searchCourses, categories, courses as allCourses } from "@/data/courses";

const ITEMS_PER_PAGE = 20;

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0] as const;

// Compute global price range once
const allPrices = allCourses.map((c) => c.price);
const GLOBAL_MIN = Math.min(...allPrices);
const GLOBAL_MAX = Math.max(...allPrices);

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([GLOBAL_MIN, GLOBAL_MAX]);
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set());
  const [minRating, setMinRating] = useState<number>(0);

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
    setPage(1);
  };

  const activeFilterCount =
    (priceRange[0] > GLOBAL_MIN || priceRange[1] < GLOBAL_MAX ? 1 : 0) +
    (selectedLevels.size > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const clearFilters = () => {
    setPriceRange([GLOBAL_MIN, GLOBAL_MAX]);
    setSelectedLevels(new Set());
    setMinRating(0);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let results = searchCourses(query, category);

    // Price filter
    results = results.filter((c) => c.price >= priceRange[0] && c.price <= priceRange[1]);

    // Level filter
    if (selectedLevels.size > 0) {
      results = results.filter((c) => selectedLevels.has(c.level));
    }

    // Rating filter
    if (minRating > 0) {
      results = results.filter((c) => c.rating >= minRating);
    }

    // Sort
    if (sortBy === "price-low") results.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") results.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
    else results.sort((a, b) => b.students - a.students);

    return results;
  }, [query, category, sortBy, priceRange, selectedLevels, minRating]);

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
      <CategoryBar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
            {category !== "all" ? categories.find((c) => c.id === category)?.name || "All" : "All"} Courses
          </h1>
          <p className="text-muted-foreground">{filtered.length.toLocaleString()} courses available</p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search courses..."
              className="pl-10 bg-card border-border"
            />
          </div>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-44 bg-card border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v);
              setPage(1);
            }}
          >
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 border-border ${showFilters ? "bg-primary/10 border-primary/50 text-primary" : ""}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </Badge>
            )}
            {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">Advanced Filters</h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
                  <X className="h-3.5 w-3.5" /> Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Price Range</label>
                <Slider
                  min={GLOBAL_MIN}
                  max={GLOBAL_MAX}
                  step={5}
                  value={priceRange}
                  onValueChange={(val) => {
                    setPriceRange(val as [number, number]);
                    setPage(1);
                  }}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Difficulty Level</label>
                <div className="space-y-2">
                  {LEVELS.map((level) => (
                    <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
                      <Checkbox
                        checked={selectedLevels.has(level)}
                        onCheckedChange={() => toggleLevel(level)}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Minimum Rating</label>
                <div className="space-y-2">
                  {RATING_OPTIONS.map((r) => (
                    <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                      <Checkbox
                        checked={minRating === r}
                        onCheckedChange={() => {
                          setMinRating(minRating === r ? 0 : r);
                          setPage(1);
                        }}
                      />
                      <div className="flex items-center gap-1.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= r ? "fill-warning text-warning" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          {r}+
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active filter tags */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(priceRange[0] > GLOBAL_MIN || priceRange[1] < GLOBAL_MAX) && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-2.5">
                ₹{priceRange[0]} – ₹{priceRange[1]}
                <button
                  onClick={() => {
                    setPriceRange([GLOBAL_MIN, GLOBAL_MAX]);
                    setPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {Array.from(selectedLevels).map((level) => (
              <Badge key={level} variant="secondary" className="gap-1.5 text-xs py-1 px-2.5">
                {level}
                <button onClick={() => toggleLevel(level)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {minRating > 0 && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-2.5">
                {minRating}+ ★
                <button
                  onClick={() => {
                    setMinRating(0);
                    setPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear all
            </button>
          </div>
        )}

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginated.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {paginated.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No courses found. Try adjusting your filters.</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={() => setPage((p) => p + 1)} className="border-border hover:bg-muted">
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
