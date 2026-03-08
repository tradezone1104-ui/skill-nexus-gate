import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryGroups } from "@/data/categoryData";

const HOVER_DELAY = 120;

const CategoryBar = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [arrowLeft, setArrowLeft] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    if (openTimeoutRef.current) { clearTimeout(openTimeoutRef.current); openTimeoutRef.current = null; }
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
  };

  const updateArrow = useCallback((catId: string) => {
    const el = catRefs.current[catId];
    const container = containerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setArrowLeft(elRect.left - containerRect.left + elRect.width / 2);
    }
  }, []);

  const handleCategoryEnter = (catId: string) => {
    clearTimers();
    openTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(catId);
      updateArrow(catId);
    }, HOVER_DELAY);
  };

  const handleCategoryLeave = () => {
    clearTimers();
    closeTimeoutRef.current = setTimeout(() => setHoveredCategory(null), 150);
  };

  const handleSubbarEnter = () => {
    clearTimers();
  };

  const handleSubbarLeave = () => {
    clearTimers();
    closeTimeoutRef.current = setTimeout(() => setHoveredCategory(null), 150);
  };

  const scroll = (dir: "left" | "right") => {
    barRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const activeCat = categoryGroups.find((c) => c.id === hoveredCategory);

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Main category bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1200px] mx-auto px-6 relative">
          <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 p-1 rounded-r border-r border-border text-muted-foreground hover:text-foreground lg:hidden">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={barRef} className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-2 px-6 lg:px-0 lg:justify-center">
            {categoryGroups.map((cat) => (
              <div
                key={cat.id}
                ref={(el) => { catRefs.current[cat.id] = el; }}
                onMouseEnter={() => handleCategoryEnter(cat.id)}
                onMouseLeave={handleCategoryLeave}
                className="relative"
              >
                <Link
                  to={`/courses?category=${cat.id}`}
                  className={`flex items-center px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-150 ${
                    hoveredCategory === cat.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </div>

          <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 p-1 rounded-l border-l border-border text-muted-foreground hover:text-foreground lg:hidden">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subcategory overlay */}
      <div
        className="absolute top-full left-0 w-full z-50 overflow-hidden"
        style={{
          maxHeight: activeCat ? "48px" : "0",
          opacity: activeCat ? 1 : 0,
          transition: "max-height 0.2s ease-out, opacity 0.15s ease-out",
          pointerEvents: activeCat ? "auto" : "none",
        }}
        onMouseEnter={handleSubbarEnter}
        onMouseLeave={handleSubbarLeave}
      >
        {/* Triangle arrow */}
        <div
          className="absolute -top-[8px] z-10 transition-all duration-150"
          style={{ left: `${arrowLeft}px`, transform: "translateX(-50%)" }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid hsl(222 47% 11%)",
            }}
          />
        </div>

        {/* Subcategory bar */}
        <div
          style={{ background: "hsl(222 47% 11%)", height: "48px" }}
        >
          <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide">
            {activeCat?.subcategories.map((sub) => (
              <Link
                key={sub.id}
                to={`/courses?category=${activeCat.id}&sub=${sub.id}`}
                className="text-sm whitespace-nowrap font-medium transition-colors duration-150 py-1"
                style={{ color: "hsl(215 20% 65%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(215 20% 65%)")}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
