import { Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background"
      role="status"
      aria-label="جاري تحميل الصفحة"
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
}

export function LazyPageWrapper({ children }: Props) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}
