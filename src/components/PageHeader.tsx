import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  children?: ReactNode;
  compact?: boolean;
}

export function PageHeader({ title, backTo = "/dashboard", children, compact }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`relative overflow-hidden gradient-hero text-primary-foreground ${compact ? "p-4" : "px-5 pt-6 pb-5"}`}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-24 h-24 rounded-full bg-primary-foreground/3" />
      
      <div className="container mx-auto flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backTo)}
            className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/15 active:bg-primary-foreground/20 transition-colors backdrop-blur-sm border border-primary-foreground/5 flex items-center justify-center"
            aria-label="الرجوع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold truncate">{title}</h1>
        </div>
        {children}
      </div>
    </header>
  );
}
