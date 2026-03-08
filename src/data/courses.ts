export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice: number;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  lessons: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  thumbnail: string;
  tags: string[];
  telegramLink: string;
  featured?: boolean;
}

export const categories = [
  { id: "trading", name: "Trading", icon: "📈", count: 450 },
  { id: "investing", name: "Investing", icon: "💰", count: 380 },
  { id: "stock-market", name: "Stock Market", icon: "📊", count: 320 },
  { id: "business", name: "Business", icon: "💼", count: 510 },
  { id: "others", name: "Others", icon: "🎯", count: 340 },
];

const thumbnails = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80",
  "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&q=80",
  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=600&q=80",
];

const instructors = [
  "Alex Morgan", "Sarah Chen", "David Park", "Priya Sharma",
  "James Wilson", "Emily Rodriguez", "Michael Lee", "Jessica Brown",
];

const levels: Course["level"][] = ["Beginner", "Intermediate", "Advanced"];

const courseTitles: Record<string, string[]> = {
  trading: [
    "Forex Trading Masterclass", "Day Trading Strategies", "Crypto Trading Essentials",
    "Options Trading Blueprint", "Swing Trading Mastery", "Scalping Techniques Pro",
    "Algorithmic Trading with Python", "Price Action Trading", "Technical Analysis Deep Dive",
    "Risk Management in Trading",
  ],
  investing: [
    "Value Investing Fundamentals", "Real Estate Investment Guide", "Portfolio Management Pro",
    "Dividend Investing Strategy", "ETF Investing Masterclass", "Angel Investing 101",
    "Retirement Planning Guide", "Gold & Commodity Investing", "Mutual Fund Mastery",
    "Impact Investing Blueprint",
  ],
  "stock-market": [
    "Stock Market for Beginners", "Fundamental Analysis Pro", "IPO Investing Guide",
    "Stock Screening Mastery", "Market Psychology Decoded", "Sector Analysis Strategies",
    "Blue Chip Investing", "Penny Stock Strategies", "Market Timing Secrets",
    "Stock Valuation Models",
  ],
  business: [
    "Startup Foundations", "Digital Marketing Mastery", "E-Commerce Empire",
    "Leadership & Management", "Financial Modeling Excel", "Business Strategy MBA",
    "Sales Funnel Optimization", "Brand Building Blueprint", "Negotiation Masterclass",
    "Product Management Pro",
  ],
  others: [
    "Personal Finance 101", "Tax Planning Strategies", "Blockchain Fundamentals",
    "Data Analytics for Finance", "Excel for Business", "Public Speaking Mastery",
    "Time Management Pro", "Networking Strategies", "Freelancing Blueprint",
    "AI in Finance",
  ],
};

function generateCourse(id: number, categoryId: string, titleIdx: number): Course {
  const titles = courseTitles[categoryId];
  const title = titles[titleIdx % titles.length];
  const price = Math.floor(Math.random() * 180) + 19;

  return {
    id: `course-${id}`,
    title: `${title}${titleIdx >= titles.length ? ` Vol. ${Math.floor(titleIdx / titles.length) + 1}` : ""}`,
    description: `Master the essentials of ${title.toLowerCase()} with hands-on projects and real-world examples. Perfect for anyone looking to advance their skills.`,
    longDescription: `This comprehensive course covers everything you need to know about ${title.toLowerCase()}. You'll learn from industry experts through video lectures, practical exercises, and real-world case studies.\n\nWhat you'll learn:\n• Core concepts and fundamentals\n• Advanced strategies and techniques\n• Risk management and best practices\n• Real-world application and case studies\n• Hands-on projects and assignments\n\nThis course is designed for both beginners and experienced professionals looking to deepen their knowledge.`,
    price,
    originalPrice: Math.floor(price * (1.5 + Math.random())),
    category: categoryId,
    instructor: instructors[id % instructors.length],
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    students: Math.floor(Math.random() * 50000) + 500,
    duration: `${Math.floor(Math.random() * 40) + 5}h ${Math.floor(Math.random() * 59)}m`,
    lessons: Math.floor(Math.random() * 150) + 20,
    level: levels[id % 3],
    thumbnail: thumbnails[id % thumbnails.length],
    tags: [categoryId, levels[id % 3].toLowerCase()],
    telegramLink: "https://t.me/+example",
    featured: id < 8,
  };
}

// Generate 2000+ courses
export const courses: Course[] = [];
let courseId = 0;
const categoryIds = categories.map(c => c.id);

for (let i = 0; i < 2100; i++) {
  const catIdx = i % categoryIds.length;
  const titleIdx = Math.floor(i / categoryIds.length);
  courses.push(generateCourse(courseId++, categoryIds[catIdx], titleIdx));
}

export function searchCourses(query: string, category?: string): Course[] {
  const q = query.toLowerCase();
  return courses.filter(c => {
    const matchesQuery = !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    const matchesCat = !category || category === "all" || c.category === category;
    return matchesQuery && matchesCat;
  });
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}

export function getFeaturedCourses(): Course[] {
  return courses.filter(c => c.featured);
}

export function getCoursesByCategory(categoryId: string): Course[] {
  return courses.filter(c => c.category === categoryId);
}
