import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const dismissedAt = localStorage.getItem("helm-install-dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 60 * 60 * 1000) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    } else {
      // Navigate to install page for manual instructions
      navigate("/install");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("helm-install-dismissed", Date.now().toString());
  };

  // Show for iOS users too (direct them to install page)
  const showBanner = !isInstalled && !dismissed && (deferredPrompt || isIOS);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[60] animate-slide-down">
      <div className="bg-card/95 backdrop-blur-xl border-b border-border shadow-elevated">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm truncate">حمّل تطبيق Helm</p>
              <p className="text-[11px] text-muted-foreground truncate">أضف التطبيق لشاشتك الرئيسية للوصول السريع</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleInstall}
              size="sm"
              className="gradient-primary text-primary-foreground rounded-xl text-xs h-9 px-4 font-bold"
            >
              تثبيت
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
