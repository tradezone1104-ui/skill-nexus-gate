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
      { q: "How do I access my purchased courses?", a: "After purchasing a course, you can access it from the \"My Learning\" section in your account. All purchased courses remain available in your dashboard so you can continue learning anytime." },
      { q: "Can I download courses for offline viewing?", a: "Offline download is available only for individually purchased courses. Courses accessed through Premium subscription cannot be downloaded for offline use." },
      { q: "How long do I have access to a course?", a: "If you purchase a course individually, you get lifetime access to that course. If you access courses through Premium subscription, access remains active only while your subscription is active." },
      { q: "Do I get access to all courses with Premium?", a: "Yes. Premium members can access all courses included in the subscription library while the subscription is active. However, premium courses cannot be downloaded for offline use." },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    faqs: [
      { q: "What payment methods are accepted?", a: "We accept secure online payments through UPI, debit cards, credit cards, and supported digital payment methods." },
      { q: "How do I get a refund?", a: "Refunds are only issued if there is a genuine issue with the course such as: missing content, incorrect course information, or technical access problems. Refund requests are reviewed by our support team before approval." },
      { q: "Where can I see my purchase history?", a: "You can view all your purchases in the \"Purchase History\" section inside your profile dashboard." },
    ],
  },
  {
    icon: Users,
    title: "Referrals & CV Coins",
    faqs: [
      { q: "How does the referral program work?", a: "You can invite friends using your personal referral link. When someone joins and makes a purchase through your referral link, you earn CV Coins as a reward." },
      { q: "What can I do with CV Coins?", a: "CV Coins can be used to get discounts on courses, unlock special offers, or access selected premium content." },
      { q: "How do I join the CV Business reseller program?", a: "You can apply for the CV Business reseller program from the CV Business section. Once approved, you can start promoting courses and earn commissions on successful sales." },
    ],
  },
  {
    icon: Settings,
    title: "Account & Settings",
    faqs: [
      { q: "How do I change my password?", a: "Go to Account Settings → Security → Change Password and update your password securely." },
      { q: "How do I update my profile picture?", a: "You can update your profile avatar from the Edit Profile section in your account settings." },
      { q: "Can I change my email address?", a: "Yes. You can update your email from the Account Settings page after verifying your identity." },
    ],
  },
  {
    icon: HelpCircle,
    title: "Platform Features",
    faqs: [
      { q: "What is the Exchange Courses feature?", a: "If you own a rare or valuable course that is not available on CourseVerse, you can request to exchange it for another course. Our team will review the request and approve or reject it." },
      { q: "Can I sell a course I own to CourseVerse?", a: "Yes. If you own a rare course, you can submit a request through the Sell Your Course option. Our team will review the course and may offer a purchase price." },
      { q: "Where are the courses delivered?", a: "After purchase or approval, course access instructions will be provided through the platform dashboard or our official communication channel." },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security & Privacy",
    faqs: [
      { q: "Is my payment information secure?", a: "Yes. All payments are processed through secure payment gateways. CourseVerse does not store sensitive card details on its servers." },
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
