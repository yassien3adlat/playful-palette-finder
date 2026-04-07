import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useInView } from "@/hooks/useInView";
import { useEffect, useState, lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InstallPrompt } from "@/components/InstallPrompt";
import {
  Trophy, Users, Target, TrendingUp, MapPin, BookOpen, ChevronLeft,
  Sparkles, Shield, Star, Quote, CheckCircle2, ArrowLeft, Zap, Heart,
  ChevronDown, MessageSquare, Award, Rocket, Clock, Play, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import helmLogo from "@/assets/helm-logo.png";

const HeroScene3D = lazy(() => import("@/components/HeroScene3D"));

const features = [
  { icon: Users, title: "تسجيل الأطفال", description: "سجّل بيانات أطفالك بسهولة وتابع تطورهم الرياضي مع ملفات شخصية متكاملة", color: "from-primary to-emerald-500" },
  { icon: Target, title: "اختبار القدرات", description: "27 سؤال ذكي يحلل 8 قدرات بدنية وذهنية لطفلك بدقة عالية", color: "from-secondary to-amber-400" },
  { icon: Trophy, title: "اقتراح الرياضة", description: "توصيات مبنية على تحليل علمي شامل مع نسب التوافق لـ 11 رياضة", color: "from-primary to-teal-500" },
  { icon: TrendingUp, title: "متابعة التقدم", description: "رسوم بيانية أسبوعية وتقييمات أداء لتتبع تطور مهارات طفلك", color: "from-accent to-blue-400" },
  { icon: MapPin, title: "أماكن التدريب", description: "اكتشف الأندية ومراكز التدريب القريبة مع التقييمات والموقع على الخريطة", color: "from-secondary to-orange-400" },
  { icon: BookOpen, title: "نصائح متخصصة", description: "إرشادات غذائية وذهنية ولياقية مصنّفة من خبراء رياضة الأطفال", color: "from-primary to-green-500" },
];

const stats = [
  { value: "27", label: "سؤال تحليلي", icon: Target },
  { value: "11", label: "رياضة مدعومة", icon: Zap },
  { value: "50+", label: "مركز تدريب", icon: MapPin },
  { value: "8", label: "قدرات تحليلية", icon: Award },
];

const steps = [
  { step: "١", title: "سجّل حسابك", desc: "أنشئ حساباً مجانياً في ثوانٍ باستخدام بريدك أو Google", icon: Rocket },
  { step: "٢", title: "أضف طفلك", desc: "أدخل بيانات الطفل: العمر، الطول، الوزن، الجنس", icon: Users },
  { step: "٣", title: "اختبار القدرات", desc: "أجب على 27 سؤال عن قدرات طفلك البدنية وتفضيلاته", icon: Target },
  { step: "٤", title: "ابدأ الرحلة", desc: "احصل على توصيات مفصلة وتابع تقدمه أسبوعياً", icon: Trophy },
];

const testimonials = [
  { name: "أم محمد", text: "ساعدني التطبيق في اكتشاف أن ابني لديه موهبة في السباحة! الآن هو بطل النادي. الاختبار كان دقيق جداً.", rating: 5, sport: "السباحة", location: "القاهرة" },
  { name: "أبو سارة", text: "اختبار القدرات دقيق جداً. اقترح كرة السلة لابنتي وفعلاً أبدعت فيها. أنصح كل أب وأم بتجربته.", rating: 5, sport: "كرة السلة", location: "جدة" },
  { name: "أم خالد", text: "أحب متابعة تقدم أطفالي الأسبوعي. التطبيق سهل ومفيد جداً للعائلة. الرسوم البيانية رائعة.", rating: 5, sport: "الكاراتيه", location: "الرياض" },
  { name: "أبو عمر", text: "كنت محتار أسجل ابني في أي رياضة. التطبيق حلل قدراته واقترح التنس وفعلاً كان اختيار ممتاز!", rating: 5, sport: "التنس", location: "دبي" },
];

const benefits = [
  "اختبار علمي يحلل 8 قدرات بدنية وذهنية",
  "أسئلة تفضيلات تراعي ما يحبه ويكرهه طفلك",
  "توصيات مخصصة لـ 11 رياضة مع نسب التوافق",
  "متابعة أسبوعية مع رسوم بيانية تفاعلية",
  "دليل شامل لمراكز التدريب مع GPS",
  "نصائح تغذية ولياقة وصحة نفسية",
  "تسجيل دخول سريع عبر Google",
  "يعمل على كل الأجهزة (PWA)",
];

const faqs = [
  { q: "هل التطبيق مجاني بالكامل؟", a: "نعم، التطبيق مجاني 100% ولا يتطلب أي اشتراك أو دفع. جميع الميزات متاحة لجميع المستخدمين." },
  { q: "كم عمر الطفل المناسب للاختبار؟", a: "الاختبار مناسب للأطفال من عمر 3 إلى 18 سنة. الأسئلة مصممة لتناسب جميع الفئات العمرية." },
  { q: "كيف يتم تحليل قدرات الطفل؟", a: "نستخدم 27 سؤالاً لتحليل 8 قدرات أساسية (السرعة، التحمل، التركيز، ردة الفعل، العمل الجماعي، الدقة، المرونة، القوة) بالإضافة لأسئلة تفضيلات شخصية." },
  { q: "هل يمكنني إضافة أكثر من طفل؟", a: "نعم، يمكنك إضافة عدد غير محدود من الأطفال ومتابعة تقدم كل طفل بشكل مستقل." },
  { q: "هل بياناتي آمنة؟", a: "نعم، جميع البيانات مشفرة ومحمية بتقنية SSL/TLS ولا تتم مشاركتها مع أي طرف خارجي." },
];

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.12 });
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
      style={{ transitionDelay: `${delay}ms`, transitionDuration: '700ms' }}
    >
      {children}
    </div>
  );
}

function CountUp({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const numericTarget = parseInt(target.replace(/\D/g, ""));
  const hasPlus = target.includes("+");

  useEffect(() => {
    if (!isInView || !numericTarget) return;
    let current = 0;
    const increment = Math.max(1, Math.floor(numericTarget / 30));
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [isInView, numericTarget]);

  return <span ref={ref}>{count}{hasPlus ? "+" : ""}{suffix}</span>;
}

function FAQItem({ faq, isOpen, toggle }: { faq: { q: string; a: string }; isOpen: boolean; toggle: () => void }) {
  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all border",
      isOpen ? "border-primary/20 bg-card shadow-[var(--shadow-md)]" : "border-border/40 bg-card/60 hover:bg-card hover:border-border/60"
    )}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-right transition-colors group min-h-[52px]"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-foreground text-[13px] sm:text-sm leading-relaxed">{faq.q}</span>
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mr-3 transition-all",
          isOpen ? "bg-primary text-primary-foreground rotate-180" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <div className={cn(
        "overflow-hidden transition-all",
        isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
      )} style={{ transitionDuration: '300ms' }}>
        <div className="px-5 pb-5">
          <div className="h-px bg-border/50 mb-4" />
          <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navOpacity = Math.min(scrollY / 100, 1);

  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-auto">
      {/* Install prompt */}
      <InstallPrompt />
      {/* Navbar — Glassmorphism */}
      <nav
        className="fixed top-0 inset-x-0 z-50 safe-top transition-all duration-300"
        role="navigation"
        aria-label="التنقل الرئيسي"
        style={{
          background: navOpacity > 0.5
            ? `hsl(var(--card) / ${0.6 + navOpacity * 0.3})`
            : `rgba(0,0,0,${navOpacity * 0.4})`,
          backdropFilter: `blur(${8 + navOpacity * 16}px) saturate(${1 + navOpacity * 0.8})`,
          borderBottom: `1px solid ${navOpacity > 0.5 ? `hsl(var(--border) / ${navOpacity * 0.5})` : `rgba(255,255,255,${navOpacity * 0.08})`}`,
          boxShadow: navOpacity > 0.5 ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-soft">
              <img src={helmLogo} alt="Helm" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-lg sm:text-xl font-black leading-none transition-colors", navOpacity > 0.5 ? "text-foreground" : "text-white")}>Helm</span>
              <span className={cn("text-[9px] leading-none mt-0.5 hidden sm:block transition-colors", navOpacity > 0.5 ? "text-muted-foreground" : "text-white/50")}>اكتشف رياضة طفلك</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => navigate("/auth")}
              variant="ghost"
              size="sm"
              className={cn("rounded-xl hidden sm:flex", navOpacity > 0.5 ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white hover:bg-white/10")}
            >
              تسجيل الدخول
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="sm"
              className="gradient-primary text-primary-foreground rounded-xl press-effect shadow-soft shine-effect"
            >
              <Sparkles className="w-3.5 h-3.5 ml-1" />
              ابدأ الآن
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden" aria-labelledby="hero-heading" style={{ contain: 'paint' }}>
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(160,35%,8%)] via-[hsl(160,25%,12%)] to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(160,40%,6%,0.5)] via-transparent to-[hsl(215,50%,10%,0.3)]" />

        {/* 3D Scene for desktop / CSS floating elements for mobile */}
        {!isMobile ? (
          <div className="absolute inset-0 w-full h-full z-[1]">
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <HeroScene3D />
              </Suspense>
            </ErrorBoundary>
          </div>
        ) : (
          <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
            {/* كور كبيرة وواضحة */}
            <div className="absolute top-[6%] right-[4%] text-5xl animate-float opacity-80" style={{ animationDuration: '5s' }}>⚽</div>
            <div className="absolute top-[10%] left-[5%] text-4xl animate-float opacity-75" style={{ animationDuration: '7s', animationDelay: '1s' }}>🏀</div>
            <div className="absolute top-[28%] right-[2%] text-4xl animate-float opacity-65" style={{ animationDuration: '6s', animationDelay: '0.5s' }}>🏊</div>
            <div className="absolute top-[22%] left-[3%] text-3xl animate-float opacity-60" style={{ animationDuration: '8s', animationDelay: '2s' }}>🎾</div>
            <div className="absolute bottom-[30%] right-[5%] text-4xl animate-float opacity-70" style={{ animationDuration: '6.5s', animationDelay: '1.5s' }}>🏅</div>
            <div className="absolute bottom-[25%] left-[4%] text-3xl animate-float opacity-60" style={{ animationDuration: '7.5s', animationDelay: '3s' }}>🥋</div>
            <div className="absolute bottom-[42%] right-[12%] text-3xl animate-float opacity-55" style={{ animationDuration: '9s', animationDelay: '0.8s' }}>🏋️</div>
            <div className="absolute top-[48%] left-[8%] text-3xl animate-float opacity-50" style={{ animationDuration: '8.5s', animationDelay: '2.5s' }}>🎯</div>
            <div className="absolute bottom-[15%] left-[40%] text-4xl animate-float opacity-65" style={{ animationDuration: '6s', animationDelay: '1.2s' }}>🏐</div>
            <div className="absolute top-[40%] right-[35%] text-3xl animate-float opacity-45" style={{ animationDuration: '7s', animationDelay: '3.5s' }}>⛹️</div>
            {/* نقاط متوهجة أكبر */}
            <div className="absolute top-[15%] left-[50%] w-3 h-3 rounded-full bg-emerald-400/50 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute top-[60%] right-[20%] w-2.5 h-2.5 rounded-full bg-amber-400/40 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute bottom-[38%] left-[25%] w-3 h-3 rounded-full bg-blue-400/40 animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
            <div className="absolute top-[35%] right-[50%] w-2 h-2 rounded-full bg-emerald-300/35 animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
          </div>
        )}

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] z-[2]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 bg-gradient-to-t from-background to-transparent z-[3]" />

        <div className="relative container mx-auto px-5 sm:px-6 pt-20 sm:pt-32 pb-12 sm:pb-20 text-center z-[4]">
          {/* Hero Logo */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden mx-auto mb-6 sm:mb-8 animate-scale-in shadow-[0_0_60px_rgba(46,158,110,0.25)] border-2 border-white/10 bg-white/[0.06] backdrop-blur-md p-3 sm:p-4">
            <img src={helmLogo} alt="Helm" className="w-full h-full object-contain drop-shadow-lg" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 animate-fade-in border border-white/10 shadow-[0_0_30px_rgba(46,158,110,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span>اكتشف موهبة طفلك الرياضية — مجاناً</span>
          </div>

          {/* Heading */}
          <h1 id="hero-heading" className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[5rem] font-black text-white mb-3 sm:mb-6 animate-slide-up leading-[1.2] tracking-tight drop-shadow-[0_2px_30px_rgba(0,0,0,0.3)]">
            اكتشف الرياضة
            <br />
            <span className="bg-gradient-to-l from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              المناسبة لطفلك
            </span>
          </h1>

          {/* Accent line */}
          <div className="w-12 sm:w-16 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 mx-auto mb-4 sm:mb-6 animate-scale-in" style={{ animationDelay: '300ms' }} />

          <p className="text-sm sm:text-lg md:text-xl text-white/60 mb-8 sm:mb-12 max-w-xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: '150ms' }}>
            نحلل 8 قدرات بدنية وذهنية لطفلك ونقترح الرياضة الأنسب من 11 رياضة مع متابعة تطوره خطوة بخطوة
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center animate-slide-up" style={{ animationDelay: '250ms' }}>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="w-full sm:w-auto gradient-primary text-primary-foreground text-base sm:text-lg px-8 sm:px-12 shadow-[0_0_40px_rgba(46,158,110,0.3)] hover:shadow-[0_0_60px_rgba(46,158,110,0.5)] transition-all hover:scale-[1.03] rounded-2xl press-effect shine-effect group"
            >
              ابدأ الآن مجاناً
              <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
            <Button
              onClick={() => {
                document.getElementById("features-heading")?.scrollIntoView({ behavior: "smooth" });
              }}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg rounded-2xl border-white/15 bg-white/[0.06] backdrop-blur-sm hover:bg-white/10 text-white/80 hover:text-white press-effect"
            >
              <Play className="w-4 h-4 ml-2 text-emerald-400" />
              تعرّف على المزيد
            </Button>
          </div>

          {/* Stats — Glass Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 mt-10 sm:mt-20 animate-fade-in max-w-3xl mx-auto" style={{ animationDelay: '400ms' }} role="list" aria-label="إحصائيات">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center backdrop-blur-md bg-white/[0.06] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-white/[0.1] transition-all" role="listitem" style={{ animationDelay: `${400 + i * 80}ms` }}>
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <stat.icon className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
                </div>
                <p className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-none">
                  <CountUp target={stat.value} />
                </p>
                <p className="text-[10px] sm:text-xs text-white/50 font-medium mt-1 sm:mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-10 text-[10px] sm:text-xs text-white/40 animate-fade-in flex-wrap" style={{ animationDelay: '600ms' }}>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400/50" /> بيانات مشفرة</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400/50" /> 8 دقائق فقط</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400/50" /> مجاني 100%</span>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-float">
            <div className="w-7 sm:w-8 h-10 sm:h-12 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5 sm:p-2">
              <div className="w-1 h-2 sm:h-2.5 rounded-full bg-white/30 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24" aria-labelledby="features-heading">
        {/* Background Orb */}
        <div className="orb orb-primary w-96 h-96 -top-20 right-0 opacity-[0.06]" />

        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold mb-5 border border-primary/10">
            <Target className="w-3.5 h-3.5" /> المميزات
          </span>
          <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-[2.75rem] font-black text-foreground mb-4 text-balance leading-tight">
            كل ما يحتاجه طفلك في مكان واحد
          </h2>
          <div className="line-accent mx-auto mb-4" />
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            نظام متكامل لاكتشاف المواهب الرياضية وتطويرها بطريقة علمية ومدروسة
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {features.map((feature, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <Card className="card-premium border-border/30 group h-full bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5 sm:p-7">
                  <div className={cn(
                    "feature-icon w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm",
                    feature.color
                  )}>
                    <feature.icon className="w-6 sm:w-7 h-6 sm:h-7 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative overflow-hidden py-16 sm:py-24" aria-labelledby="steps-heading">
        <div className="absolute inset-0 gradient-surface" />
        <div className="orb orb-accent w-64 h-64 top-10 left-10 opacity-[0.05]" />

         <div className="relative container mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold mb-4 sm:mb-5 border border-primary/10">
              <Zap className="w-3.5 h-3.5" /> كيف يعمل
            </span>
            <h2 id="steps-heading" className="text-2xl sm:text-3xl md:text-[2.75rem] font-black text-foreground leading-tight">
              4 خطوات بسيطة لاكتشاف موهبة طفلك
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {steps.map((item, i) => (
              <AnimatedSection key={i} delay={i * 150} className="text-center group">
                <div className="relative mb-3 sm:mb-5">
                  <div className="w-14 sm:w-20 h-14 sm:h-20 rounded-2xl sm:rounded-3xl gradient-primary flex items-center justify-center mx-auto text-primary-foreground font-black text-xl sm:text-3xl group-hover:scale-110 transition-all duration-300 shadow-[var(--shadow-md)] group-hover:shadow-[var(--shadow-glow)] relative overflow-hidden shine-effect">
                    {item.step}
                  </div>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 -left-4 lg:-left-6 w-8 lg:w-12 h-[2px]">
                      <div className="w-full h-full bg-gradient-to-l from-primary/30 to-transparent rounded-full" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-[13px] sm:text-base leading-snug">{item.title}</h3>
                <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed px-1">{item.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24" aria-labelledby="benefits-heading">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold mb-5 border border-primary/10">
              <Heart className="w-3.5 h-3.5" /> لماذا Helm؟
            </span>
            <h2 id="benefits-heading" className="text-2xl sm:text-3xl md:text-[2.5rem] font-black text-foreground mb-6 sm:mb-8 text-balance leading-tight">
              كل ما تحتاجه لدعم رحلة طفلك الرياضية
            </h2>
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3.5 group hover:translate-x-[-4px] transition-transform duration-200">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium text-sm leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "27", label: "سؤال ذكي", sub: "في الاختبار", icon: Target },
                { val: "8", label: "قدرات", sub: "تحليلية", icon: Award },
                { val: "11", label: "رياضة", sub: "مقترحة", icon: Trophy },
                { val: "100%", label: "مجاني", sub: "بالكامل", icon: Heart },
              ].map((item, i) => (
                <div key={i} className="stat-card text-center group">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-black text-foreground leading-none mb-1">{item.val}</p>
                  <p className="text-sm font-bold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="relative overflow-hidden py-16 sm:py-24" aria-labelledby="testimonials-heading">
        <div className="absolute inset-0 gradient-surface" />
        <div className="orb orb-secondary w-80 h-80 bottom-0 right-0 opacity-[0.05]" />

        <div className="relative container mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold mb-4 sm:mb-5 border border-primary/10">
              <Star className="w-3.5 h-3.5" /> آراء المستخدمين
            </span>
            <h2 id="testimonials-heading" className="text-2xl sm:text-3xl md:text-[2.75rem] font-black text-foreground mb-2 sm:mb-3 leading-tight">
              ماذا يقول أولياء الأمور؟
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">أكثر من 500 عائلة استفادت من Helm</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="card-premium border-border/30 h-full bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={cn("w-4 h-4", j < t.rating ? "text-amber-500 fill-amber-500" : "text-muted")} />
                      ))}
                    </div>
                    {/* Quote icon */}
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center mb-3">
                      <Quote className="w-4 h-4 text-primary/50" />
                    </div>
                    <p className="text-foreground text-sm leading-[1.7] mb-5">{t.text}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div>
                        <p className="font-bold text-foreground text-sm">{t.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t.location}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-bold border border-primary/10">{t.sport}</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24" aria-labelledby="faq-heading">
        <AnimatedSection className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold mb-4 sm:mb-5 border border-primary/10">
            <MessageSquare className="w-3.5 h-3.5" /> أسئلة شائعة
          </span>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-[2.75rem] font-black text-foreground leading-tight">
            الأسئلة الأكثر شيوعاً
          </h2>
        </AnimatedSection>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <FAQItem faq={faq} isOpen={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══ DOWNLOAD APP ═══ */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <AnimatedSection className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-border/50 p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-accent/5 translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-[var(--shadow-lg)]">
              <ArrowDown className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">حمّل تطبيق Helm</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              أضف التطبيق لشاشتك الرئيسية للوصول السريع — يعمل بدون إنترنت ومثل أي تطبيق عادي!
            </p>
            <Button
              onClick={() => navigate("/install")}
              size="lg"
              className="gradient-primary text-primary-foreground rounded-2xl press-effect shine-effect shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)] transition-all"
            >
              <ArrowDown className="w-5 h-5 ml-2" />
              تعليمات التثبيت
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden py-20 sm:py-28" aria-labelledby="cta-heading">
        <div className="absolute inset-0 gradient-hero" />
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full border border-primary-foreground/5" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-primary-foreground/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary-foreground/[0.03]" />

        <AnimatedSection className="relative container mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-[var(--shadow-lg)]">
            <Shield className="w-7 sm:w-8 h-7 sm:h-8 text-primary-foreground" aria-hidden="true" />
          </div>
          <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-5xl font-black text-primary-foreground mb-4 sm:mb-5 text-balance leading-tight">
            جاهز تكتشف رياضة طفلك؟
          </h2>
          <p className="text-primary-foreground/75 mb-6 sm:mb-8 text-sm sm:text-lg max-w-md mx-auto leading-relaxed">
            سجّل الآن مجاناً وابدأ رحلة اكتشاف موهبة طفلك الرياضية
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-primary-foreground/50 text-[10px] sm:text-xs mb-8 sm:mb-12 flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> مجاني بالكامل</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> بدون بطاقة ائتمان</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> 8 دقائق فقط</span>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-card text-primary hover:bg-card/95 text-base sm:text-lg px-10 sm:px-14 shadow-[var(--shadow-2xl)] hover:scale-[1.03] transition-all rounded-2xl font-bold press-effect shine-effect group"
          >
            ابدأ مجاناً الآن
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
        </AnimatedSection>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-card border-t border-border/50 py-10 sm:py-14" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10 mb-8 sm:mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-soft">
                  <img src={helmLogo} alt="Helm" className="w-full h-full object-contain" loading="lazy" />
                </div>
                <span className="font-black text-foreground text-xl">Helm</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                تطبيق ذكي لاكتشاف المواهب الرياضية للأطفال ومتابعة تطورهم بطريقة علمية ومدروسة
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm">الخدمات</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-default">اختبار القدرات الرياضية (27 سؤال)</li>
                <li className="hover:text-foreground transition-colors cursor-default">متابعة التقدم الأسبوعي</li>
                <li className="hover:text-foreground transition-colors cursor-default">دليل مراكز التدريب (50+)</li>
                <li className="hover:text-foreground transition-colors cursor-default">نصائح وإرشادات متخصصة</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm">التطبيق</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-default">مجاني بالكامل — بدون إعلانات</li>
                <li className="hover:text-foreground transition-colors cursor-default">يعمل على جميع الأجهزة</li>
                <li className="hover:text-foreground transition-colors cursor-default">متاح كتطبيق PWA</li>
                <li className="hover:text-foreground transition-colors cursor-default">آمن وخاص — تشفير SSL/TLS</li>
              </ul>
            </div>
          </div>
          <div className="section-divider" />
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Helm. جميع الحقوق محفوظة
            </p>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary/50" /> بيانات مشفرة</span>
              <span>🇪🇬 صنع في حب مصر</span>
            </div>
          </div>
        </div>
      </footer>

      {/* JSON-LD for FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
};

export default Index;
