import { BookOpen, Wrench, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";

const sections = [
  {
    icon: BookOpen,
    title: "Free Courses",
    description: "Start your learning journey with our free courses covering trading basics, investing fundamentals, and more.",
    items: ["Introduction to Stock Market", "Candlestick Patterns 101", "Basics of Technical Analysis", "Portfolio Building for Beginners"],
  },
  {
    icon: Wrench,
    title: "Free Trading Tools",
    description: "Access essential tools to help you practice and improve your trading skills.",
    items: ["Position Size Calculator", "Risk-Reward Calculator", "Trading Journal Template", "Stock Screener Guide"],
  },
  {
    icon: FileText,
    title: "Free Resources",
    description: "Download PDFs, cheat sheets, and guides created by industry experts.",
    items: ["Chart Patterns Cheat Sheet", "Options Trading Guide PDF", "Trading Psychology Handbook", "Market Analysis Templates"],
  },
];

const FreeLearning = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <CategoryBar />
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-3">Free Learning</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Start learning for free. Explore courses, tools, and resources at no cost.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map(s => (
          <div key={s.title} className="bg-card rounded-xl border border-border p-6 space-y-4">
            <s.icon className="h-8 w-8 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">{s.title}</h2>
            <p className="text-sm text-muted-foreground">{s.description}</p>
            <ul className="space-y-2">
              {s.items.map(item => (
                <li key={item} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default FreeLearning;
