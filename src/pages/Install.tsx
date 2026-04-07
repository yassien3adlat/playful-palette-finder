import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download, CheckCircle, Smartphone, Share, MoreVertical,
  PlusSquare, ArrowRight, Trophy, Wifi, WifiOff, Zap,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const benefits = [
    { icon: Zap, title: "وصول فوري", desc: "افتح التطبيق مباشرة من شاشتك الرئيسية" },
    { icon: WifiOff, title: "يعمل بدون إنترنت", desc: "الصفحات المحفوظة تعمل حتى بدون اتصال" },
    { icon: Smartphone, title: "تجربة كاملة", desc: "شاشة كاملة بدون شريط المتصفح" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero p-6 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors" aria-label="الرجوع">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">تثبيت تطبيق Helm</h1>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-lg space-y-6">
        {/* Hero */}
        <div className="text-center py-4 animate-slide-up">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">حمّل Helm على جوالك</h2>
          <p className="text-muted-foreground text-sm">استمتع بتجربة أسرع وأسهل مباشرة من شاشتك الرئيسية</p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          {benefits.map((b, i) => (
            <Card key={i} className="shadow-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <b.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Install Action */}
        {isInstalled ? (
          <Card className="shadow-elevated border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">التطبيق مثبت بالفعل!</h3>
              <p className="text-sm text-muted-foreground mb-4">يمكنك فتح Helm من شاشتك الرئيسية</p>
              <Button onClick={() => navigate("/dashboard")} className="gradient-primary text-primary-foreground rounded-xl">
                الذهاب للرئيسية
              </Button>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button
            onClick={handleInstall}
            className="w-full gradient-primary text-primary-foreground rounded-2xl h-14 text-lg font-bold shadow-soft hover:shadow-elevated transition-all hover:scale-[1.02]"
          >
            <Download className="w-6 h-6 ml-2" />
            تثبيت التطبيق الآن
          </Button>
        ) : (
          /* Manual instructions */
          <Card className="shadow-elevated border-border/50">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-bold text-foreground text-center text-lg">
                {isIOS ? "خطوات التثبيت على iPhone" : "خطوات التثبيت"}
              </h3>

              {isIOS ? (
                <div className="space-y-4">
                  <Step
                    number={1}
                    icon={Share}
                    title="اضغط على زر المشاركة"
                    desc="في أسفل المتصفح Safari، اضغط على أيقونة المشاركة (المربع مع السهم)"
                  />
                  <Step
                    number={2}
                    icon={PlusSquare}
                    title='اختر "إضافة إلى الشاشة الرئيسية"'
                    desc="مرر لأسفل في قائمة الخيارات واضغط عليها"
                  />
                  <Step
                    number={3}
                    icon={CheckCircle}
                    title='اضغط "إضافة"'
                    desc="سيظهر التطبيق على شاشتك الرئيسية كتطبيق عادي"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Step
                    number={1}
                    icon={MoreVertical}
                    title="افتح قائمة المتصفح"
                    desc="اضغط على النقاط الثلاث (⋮) في أعلى المتصفح Chrome"
                  />
                  <Step
                    number={2}
                    icon={Download}
                    title='اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"'
                    desc="ستجدها في القائمة المنسدلة"
                  />
                  <Step
                    number={3}
                    icon={CheckCircle}
                    title='اضغط "تثبيت"'
                    desc="سيظهر التطبيق على شاشتك الرئيسية جاهز للاستخدام"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Helm يعمل على جميع الأجهزة: iPhone، Android، وأجهزة الكمبيوتر
        </p>
      </div>
    </div>
  );
};

const Step = ({ number, icon: Icon, title, desc }: { number: number; icon: any; title: string; desc: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 mt-0.5">
      {number}
    </div>
    <div>
      <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h4>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
  </div>
);

export default Install;
