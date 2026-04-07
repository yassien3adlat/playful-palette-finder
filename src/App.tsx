import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LazyPageWrapper } from "@/components/LazyPageWrapper";
import { InstallPrompt } from "@/components/InstallPrompt";

// Eagerly load critical path pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load authenticated pages for code-splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddChild = lazy(() => import("./pages/AddChild"));
const Assessment = lazy(() => import("./pages/Assessment"));
const ProgressPage = lazy(() => import("./pages/Progress"));
const Videos = lazy(() => import("./pages/Videos"));
const Centers = lazy(() => import("./pages/Centers"));
const Tips = lazy(() => import("./pages/Tips"));
const ChildProfile = lazy(() => import("./pages/ChildProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Install = lazy(() => import("./pages/Install"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              تخطي إلى المحتوى الرئيسي
            </a>
            <InstallPrompt />
            <div id="main-content">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<LazyPageWrapper><Dashboard /></LazyPageWrapper>} />
                <Route path="/add-child" element={<LazyPageWrapper><AddChild /></LazyPageWrapper>} />
                <Route path="/assessment" element={<LazyPageWrapper><Assessment /></LazyPageWrapper>} />
                <Route path="/progress" element={<LazyPageWrapper><ProgressPage /></LazyPageWrapper>} />
                <Route path="/videos" element={<LazyPageWrapper><Videos /></LazyPageWrapper>} />
                <Route path="/centers" element={<LazyPageWrapper><Centers /></LazyPageWrapper>} />
                <Route path="/tips" element={<LazyPageWrapper><Tips /></LazyPageWrapper>} />
                <Route path="/child/:id" element={<LazyPageWrapper><ChildProfile /></LazyPageWrapper>} />
                <Route path="/profile" element={<LazyPageWrapper><Profile /></LazyPageWrapper>} />
                <Route path="/install" element={<LazyPageWrapper><Install /></LazyPageWrapper>} />
                <Route path="/reset-password" element={<LazyPageWrapper><ResetPassword /></LazyPageWrapper>} />
                <Route path="*" element={<LazyPageWrapper><NotFound /></LazyPageWrapper>} />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
