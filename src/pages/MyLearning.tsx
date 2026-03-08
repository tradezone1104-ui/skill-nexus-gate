import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";

const MyLearning = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <CategoryBar />
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display font-bold text-3xl text-foreground mb-8">My Learning</h1>
      <div className="bg-card rounded-xl border border-border p-12 text-center space-y-4">
        <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto" />
        <h2 className="font-display font-semibold text-xl text-foreground">No courses yet</h2>
        <p className="text-muted-foreground">Start learning by purchasing your first course or subscribing to Premium.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/courses">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Courses</Button>
          </Link>
          <Link to="/subscribe">
            <Button variant="outline">Subscribe</Button>
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default MyLearning;
