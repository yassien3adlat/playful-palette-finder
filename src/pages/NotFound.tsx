import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, SearchX, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="orb orb-primary w-72 h-72 top-10 right-10 opacity-[0.06] animate-float-slow" />
      <div className="orb orb-accent w-56 h-56 bottom-20 left-10 opacity-[0.05] animate-float-delayed" />

      <div className="text-center animate-slide-up max-w-sm relative z-10">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-muted/60 flex items-center justify-center mx-auto border border-border/30 shadow-[var(--shadow-md)]">
            <SearchX className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <span className="absolute -inset-3 rounded-[28px] bg-primary/[0.03] -z-10" />
          <span className="absolute -inset-6 rounded-[32px] bg-primary/[0.02] -z-20" />
        </div>
        <h1 className="text-7xl font-black text-foreground mb-3 text-gradient-hero">404</h1>
        <p className="text-lg text-muted-foreground mb-2 font-semibold">الصفحة غير موجودة</p>
        <p className="text-sm text-muted-foreground/70 mb-8 max-w-[260px] mx-auto">يبدو أن هذه الصفحة انتقلت أو لم تعد موجودة</p>
        <div className="flex flex-col gap-3 items-center">
          <Button onClick={() => navigate("/")} size="lg" className="gradient-primary text-primary-foreground rounded-xl press-effect shine-effect shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)] transition-shadow group">
            <Home className="w-4 h-4 ml-1.5" /> العودة للرئيسية
            <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors press-effect">
            أو ارجع للصفحة السابقة
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
