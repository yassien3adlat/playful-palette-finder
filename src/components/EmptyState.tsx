import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center animate-fade-in">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-muted/60 flex items-center justify-center">
          <Icon className="w-10 h-10 text-muted-foreground/60" />
        </div>
        <span className="absolute -inset-2 rounded-3xl bg-primary/5 -z-10" />
        <span className="absolute -inset-4 rounded-3xl bg-primary/[0.02] -z-20" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 gradient-primary text-primary-foreground rounded-xl press-effect shine-effect shadow-soft">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
