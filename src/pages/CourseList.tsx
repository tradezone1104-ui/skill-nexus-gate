import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { courses } from "@/data/courses";

const CourseList = () => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-6">All Courses</h1>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-11 h-11 bg-muted border-border focus:border-primary rounded-full text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">No courses found.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((course) => (
              <li key={course.id}>
                <Link
                  to={`/course/${course.id}`}
                  className="block py-3 px-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {course.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CourseList;
