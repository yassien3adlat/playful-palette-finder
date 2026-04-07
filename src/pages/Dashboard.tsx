import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, UserCircle, Trophy, TrendingUp, MapPin, BookOpen, LogOut, Video,
  ChevronLeft, ClipboardCheck, Clock, Activity, Flame, Sparkles, Star,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  age: number;
  recommended_sport: string | null;
  skill_level: string | null;
  gender: string | null;
}

interface Stats {
  totalChildren: number;
  totalAssessments: number;
  totalHours: number;
}

const menuItems = [
  { icon: Plus, label: "إضافة طفل", path: "/add-child", color: "from-primary to-emerald-500", desc: "سجّل طفلك" },
  { icon: Trophy, label: "اختبار القدرات", path: "/assessment", color: "from-secondary to-amber-400", desc: "27 سؤال ذكي" },
  { icon: TrendingUp, label: "متابعة التقدم", path: "/progress", color: "from-accent to-blue-400", desc: "تتبع أسبوعي" },
  { icon: Video, label: "فيديوهات", path: "/videos", color: "from-rose-500 to-pink-400", desc: "تعليم رياضي" },
  { icon: MapPin, label: "أماكن التدريب", path: "/centers", color: "from-primary to-teal-500", desc: "50+ مركز" },
  { icon: BookOpen, label: "نصائح", path: "/tips", color: "from-violet-500 to-purple-400", desc: "إرشادات الخبراء" },
];

const dailyTips = [
  "شجّع طفلك على ممارسة الرياضة 60 دقيقة يومياً. النشاط البدني يحسّن التركيز والنوم والمزاج.",
  "الإحماء لمدة 5-10 دقائق قبل التمرين يقلل خطر الإصابة بنسبة 50%.",
  "النوم 8-10 ساعات يومياً ضروري لنمو العضلات وتعافي الجسم بعد التمارين.",
  "تناول وجبة خفيفة تحتوي على كربوهيدرات قبل التمرين بـ 30 دقيقة.",
  "لا تقارن طفلك بالآخرين — ركّز على تحسّنه الشخصي واحتفل بإنجازاته الصغيرة.",
  "اجعل الماء رفيق طفلك الدائم — كوب كل 20 دقيقة أثناء النشاط البدني.",
  "المرونة أساس كل رياضة ناجحة — خصص 10 دقائق يومياً لتمارين التمدد.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير ☀️";
  if (hour < 17) return "مساء الخير 🌤️";
  return "مساء النور 🌙";
}

function DashboardContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [stats, setStats] = useState<Stats>({ totalChildren: 0, totalAssessments: 0, totalHours: 0 });
  const [lastActivity, setLastActivity] = useState<string | null>(null);

  const todayTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyTips[dayOfYear % dailyTips.length];
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("children").select("id, name, age, recommended_sport, skill_level, gender").order("created_at"),
      supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
      supabase.from("assessment_results").select("id, completed_at", { count: "exact" }).order("completed_at", { ascending: false }).limit(1),
      supabase.from("weekly_progress").select("hours_practiced, created_at").order("created_at", { ascending: false }),
    ]).then(([childrenRes, profileRes, assessRes, progressRes]) => {
      const childrenData = (childrenRes.data || []) as Child[];
      setChildren(childrenData);
      setProfileName(profileRes.data?.full_name || "");
      const progressData = progressRes.data || [];
      const totalHours = progressData.reduce(
        (sum, r) => sum + (Number(r.hours_practiced) || 0), 0
      );
      setStats({
        totalChildren: childrenData.length,
        totalAssessments: assessRes.count || 0,
        totalHours: Math.round(totalHours * 10) / 10,
      });

      const lastAssess = assessRes.data?.[0]?.completed_at;
      const lastProgress = progressData[0]?.created_at;
      const latest = [lastAssess, lastProgress].filter(Boolean).sort().reverse()[0];
      if (latest) {
        const diff = Date.now() - new Date(latest).getTime();
        const days = Math.floor(diff / 86400000);
        setLastActivity(days === 0 ? "اليوم" : days === 1 ? "أمس" : `منذ ${days} أيام`);
      }
      setLoading(false);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = profileName.split(" ")[0] || "مستخدم";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Header with gradient */}
      <header className="bg-card border-b border-border/30 overflow-hidden">
        <div className="gradient-hero px-5 pt-7 pb-6 relative overflow-hidden">
          {/* Decorative Orbs */}
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary-foreground/5 translate-x-1/3 translate-y-1/3" />

          <div className="container mx-auto relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary-foreground/15 backdrop-blur-md flex items-center justify-center shadow-[var(--shadow-md)] border border-primary-foreground/10">
                  <span className="text-xl font-black text-primary-foreground">
                    {firstName[0]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/60 font-medium">{getGreeting()}</p>
                  <h1 className="text-xl font-black text-primary-foreground leading-tight">{firstName}</h1>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/profile"
                  className="p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-colors"
                  aria-label="الملف الشخصي"
                >
                  <UserCircle className="w-5 h-5 text-primary-foreground/70" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-colors"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4 text-primary-foreground/70" />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: UserCircle, value: stats.totalChildren, label: "أطفال" },
                { icon: ClipboardCheck, value: stats.totalAssessments, label: "اختبار" },
                { icon: Clock, value: stats.totalHours, label: "ساعة تدريب" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 bg-primary-foreground/10 backdrop-blur-md rounded-2xl px-2 py-2.5 border border-primary-foreground/5">
                  <div className="w-8 h-8 rounded-xl bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-4 h-4 text-primary-foreground/80" />
                  </div>
                  <p className="text-lg font-black text-primary-foreground leading-none">{s.value}</p>
                  <p className="text-[10px] text-primary-foreground/50 font-medium leading-none">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Last activity ribbon */}
        {lastActivity && (
          <div className="bg-card/80 backdrop-blur-sm px-5 py-2.5 flex items-center justify-between border-b border-border/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>آخر نشاط: <strong className="text-foreground">{lastActivity}</strong></span>
            </div>
            {stats.totalAssessments > 0 && (
              <div className="flex items-center gap-1 text-xs text-primary font-bold">
                <ArrowUp className="w-3 h-3" />
                نشط
              </div>
            )}
          </div>
        )}
      </header>

      <div className="container mx-auto px-5 py-6 space-y-6">
        {/* Children Section */}
        <section aria-labelledby="children-heading">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="children-heading" className="text-base font-bold text-foreground">أطفالي</h2>
              {children.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{children.length} {children.length === 1 ? "طفل مسجل" : "أطفال مسجلين"}</p>
              )}
            </div>
            <Button
              onClick={() => navigate("/add-child")}
              size="sm"
              className="gradient-primary text-primary-foreground rounded-xl h-9 text-xs px-4 shadow-soft press-effect shine-effect"
            >
              <Plus className="w-3.5 h-3.5 ml-1" /> إضافة
            </Button>
          </div>

          {children.length === 0 ? (
            <Card className="shadow-[var(--shadow-md)] border-dashed border-2 border-border/50 bg-card/60">
              <EmptyState
                icon={UserCircle}
                title="لم تقم بإضافة أطفال بعد"
                description="أضف بيانات طفلك لتبدأ رحلة اكتشاف موهبته الرياضية"
                actionLabel="أضف طفلك الأول"
                onAction={() => navigate("/add-child")}
              />
            </Card>
          ) : (
            <div className="space-y-2.5">
              {children.map((child, i) => (
                <Card
                  key={child.id}
                  className={cn(
                    "card-premium border-border/30 cursor-pointer group bg-card/80",
                    `animate-fade-in stagger-${i + 1}`
                  )}
                  onClick={() => navigate(`/child/${child.id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`عرض ملف ${child.name}`}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/child/${child.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-soft flex-shrink-0">
                        {child.gender === "female" ? "👧" : child.gender === "male" ? "👦" : child.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm truncate">{child.name}</h3>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="text-muted-foreground text-xs">{child.age} سنوات</span>
                          {child.skill_level && (
                            <span className="flex items-center gap-0.5 text-[10px] text-secondary font-bold">
                              <Star className="w-3 h-3 fill-secondary" />
                              {child.skill_level}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {child.recommended_sport && (
                          <span className="px-3 py-1.5 rounded-full bg-primary/8 text-primary text-[10px] font-bold border border-primary/10">
                            {child.recommended_sport}
                          </span>
                        )}
                        <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Services Grid */}
        <section aria-labelledby="services-heading">
          <h2 id="services-heading" className="text-base font-bold text-foreground mb-4">الخدمات</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {menuItems.map((item, i) => (
              <Card
                key={item.path}
                className={cn(
                  "card-premium border-border/30 cursor-pointer group overflow-hidden bg-card/80",
                  `animate-fade-in stagger-${i + 1}`
                )}
                onClick={() => navigate(item.path)}
                role="button"
                tabIndex={0}
                aria-label={item.label}
                onKeyDown={(e) => e.key === "Enter" && navigate(item.path)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2.5">
                  <div className={cn("feature-icon w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm", item.color)}>
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs leading-tight">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Action CTA */}
        {stats.totalAssessments === 0 && children.length > 0 && (
          <Card className="shadow-[var(--shadow-lg)] border-primary/15 overflow-hidden animate-fade-in bg-card/90">
            <div className="h-1 gradient-primary" />
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="feature-icon w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm mb-1">ابدأ أول اختبار!</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    اكتشف الرياضة المناسبة لطفلك من خلال اختبار يحلل 8 قدرات أساسية
                  </p>
                  <Button
                    onClick={() => navigate("/assessment")}
                    size="sm"
                    className="gradient-primary text-primary-foreground rounded-xl h-9 text-xs px-5 press-effect shine-effect shadow-soft"
                  >
                    <Trophy className="w-3.5 h-3.5 ml-1" /> ابدأ الاختبار
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Tip Card */}
        <Card className="shadow-[var(--shadow-sm)] border-border/30 overflow-hidden bg-card/80">
          <CardContent className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="feature-icon w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="font-bold text-foreground text-xs">نصيحة اليوم</h3>
                  <span className="text-[9px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                    {new Date().toLocaleDateString("ar-EG", { weekday: "long" })}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {todayTip}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

const Dashboard = () => (
  <AuthGuard>
    <DashboardContent />
  </AuthGuard>
);

export default Dashboard;
