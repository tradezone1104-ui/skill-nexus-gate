import { HelpCircle, ChevronDown, Search, BookOpen, CreditCard, Users, Settings, ShieldCheck, LifeBuoy } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqCategories = [
  {
    icon: BookOpen,
    title: "Courses & Learning",
    faqs: [
      { q: "How do I access my purchased courses?", a: "Go to 'My Learning' from the profile menu to see all your purchased courses. Click on any course to start learning." },
      { q: "Can I download courses for offline viewing?", a: "Yes, after purchasing a course you'll receive a Telegram link where you can access downloadable content." },
      { q: "How long do I have access to a course?", a: "You have lifetime access to all purchased courses. Once bought, they're yours forever." },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    faqs: [
      { q: "What payment methods are accepted?", a: "We accept UPI, credit/debit cards, net banking, and wallet payments through our secure payment gateway." },
      { q: "How do I get a refund?", a: "Contact our support team within 7 days of purchase if you're unsatisfied. We'll review your request and process eligible refunds." },
      { q: "Where can I see my purchase history?", a: "Go to 'Purchase History' from your profile menu to view all your past transactions." },
    ],
  },
  {
    icon: Users,
    title: "Referrals & CV Coins",
    faqs: [
      { q: "How does the referral program work?", a: "Share your unique referral link. When friends purchase courses using your link, you earn 20% as CV Coins." },
      { q: "What can I do with CV Coins?", a: "CV Coins can be used for course discounts, unlocking special content, or redeeming exclusive rewards." },
      { q: "How do I become a reseller?", a: "Apply through the 'CV Business' page. Once approved, you'll get access to the reseller dashboard with higher commission rates." },
    ],
  },
  {
    icon: Settings,
    title: "Account & Settings",
    faqs: [
      { q: "How do I change my password?", a: "Go to Account Settings from your profile menu, then click on 'Change Password' to update your credentials." },
      { q: "How do I update my profile picture?", a: "Navigate to 'Edit Profile' and click on your avatar to upload a new profile picture." },
      { q: "Can I change my email address?", a: "For security reasons, email changes require verification. Contact support to request an email update." },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security & Privacy",
    faqs: [
      { q: "Is my payment information secure?", a: "Yes, we use industry-standard encryption and never store your complete card details on our servers." },
      { q: "How do I enable two-factor authentication?", a: "Two-factor authentication can be enabled from Account Settings under the Security section." },
      { q: "Who can see my profile?", a: "Your profile is private by default. Only your reviews and public activity are visible to others." },
    ],
  },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    faqs: cat.faqs.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.faqs.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LifeBuoy className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">Help Center</h1>
          <p className="text-muted-foreground mb-6">Find answers to common questions about CourseVerse.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="pl-11 h-12 rounded-full bg-card border-border"
            />
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          {(searchQuery ? filteredCategories : faqCategories).map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground">{category.title}</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {category.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`${category.title}-${i}`} className="border border-border rounded-xl px-4 bg-card">
                    <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-muted/40">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">Our support team is ready to assist you.</p>
          <a href="/contact" className="text-primary font-medium hover:underline">Contact Support →</a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;
