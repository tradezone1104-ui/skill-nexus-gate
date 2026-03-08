import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import FreeLearning from "./pages/FreeLearning";
import Subscribe from "./pages/Subscribe";
import CVBusiness from "./pages/CVBusiness";
import ResellerDashboard from "./pages/ResellerDashboard";
import Exchange from "./pages/Exchange";
import MyLearning from "./pages/MyLearning";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import PurchaseHistory from "./pages/PurchaseHistory";
import CourseList from "./pages/CourseList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Homepage now handles both guest and logged-in states internally

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <PurchaseProvider>
                <SubscriptionProvider>
                <NotificationProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/course-list" element={<CourseList />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/course/:id" element={<CourseDetail />} />
                  <Route path="/free-learning" element={<FreeLearning />} />
                  <Route path="/subscribe" element={<Subscribe />} />
                  <Route path="/cv-business" element={<CVBusiness />} />
                  <Route path="/reseller-dashboard" element={<ResellerDashboard />} />
                  <Route path="/exchange" element={<Exchange />} />
                  <Route path="/my-learning" element={<MyLearning />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/purchase-history" element={<PurchaseHistory />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/settings/profile" element={<ProfileSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </NotificationProvider>
                </SubscriptionProvider>
                </PurchaseProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
