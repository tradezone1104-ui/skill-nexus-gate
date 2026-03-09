import { useState } from "react";
import { courses, categories } from "@/data/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star } from "lucide-react";

export default function AdminCourses() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Courses ({courses.length})</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10 bg-[#1E293B] border-[#334155]"
          />
        </div>
      </div>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Featured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((c) => (
                <TableRow key={c.id} className="border-[#334155]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={c.thumbnail} alt="" className="h-10 w-16 rounded object-cover" />
                      <span className="font-medium text-sm line-clamp-1 max-w-[200px]">{c.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.instructor}</TableCell>
                  <TableCell>₹{c.price}</TableCell>
                  <TableCell>{c.students}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {c.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    {c.featured && <Badge className="bg-primary/20 text-primary">Featured</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="border-[#334155]"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="border-[#334155]"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
