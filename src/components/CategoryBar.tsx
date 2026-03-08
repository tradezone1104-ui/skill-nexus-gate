import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { categoryGroups, type CategoryGroup } from "@/data/categoryData";

const CategoryBar = () => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        barRef.current && !barRef.current.contains(e.target as Node)
      ) {
        setOpenCategory(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scroll = (dir: "left" | "right") => {
    barRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="relative border-b border-border bg-card">
      <div className="container mx-auto px-4 relative">
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 p-1 rounded-r border-r border-border text-muted-foreground hover:text-foreground lg:hidden">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div ref={barRef} className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 px-6 lg:px-0 lg:justify-center">
          {categoryGroups.map((cat) => (
            <div key={cat.id} className="relative">
              <button
                onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${openCategory === cat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${openCategory === cat.id ? "rotate-180" : ""}`} />
              </button>

              {openCategory === cat.id && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-card py-2 z-50 animate-fade-in"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {cat.name}
                  </div>
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/courses?category=${cat.id}&sub=${sub.id}`}
                      onClick={() => setOpenCategory(null)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link
                      to={`/courses?category=${cat.id}`}
                      onClick={() => setOpenCategory(null)}
                      className="block px-4 py-2 text-sm text-primary font-medium hover:bg-muted transition-colors"
                    >
                      View All {cat.name} →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 p-1 rounded-l border-l border-border text-muted-foreground hover:text-foreground lg:hidden">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoryBar;
