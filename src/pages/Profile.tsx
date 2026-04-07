import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User, Save, Mail, Phone, Shield, LogOut, ClipboardCheck,
  Clock, UserCircle, Lock, Calendar, Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProfileContent = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ children: 0, assessments: 0, hours: 0 });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })
    : "";

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("user_id", user.id).single(),
      supabase.from("children").select("id", { count: "exact", head: true }),
      supabase.from("assessment_results").select("id", { count: "exact", head: true }),
      supabase.from("weekly_progress").select("hours_practiced"),
    ]).then(([profileRes, childrenRes, assessRes, progressRes]) => {
      if (profileRes.data) {
        setFullName(profileRes.data.full_name || "");
        setPhone(profileRes.data.phone || "");
      }
      const totalHours = (progressRes.data || []).reduce(
        (sum, r) => sum + (Number(r.hours_practiced) || 0), 0
      );
      setStats({
        children: childrenRes.count || 0,
        assessments: assessRes.count || 0,
        hours: Math.round(totalHours * 10) / 10,
      });
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("user_id", user.id);
      if (error) throw error;
      setSavedSuccess(true);
      toast.success("تم حفظ البيانات بنجاح! ✅");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("تم إرسال رابط تغيير كلمة المرور لبريدك الإلكتروني ✉️");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statCards = [
    { val: stats.children, label: "أطفال مسجلين", icon: UserCircle, color: "from-primary to-emerald-500" },
    { val: stats.assessments, label: "اختبارات", icon: ClipboardCheck, color: "from-secondary to-amber-400" },
    { val: stats.hours, label: "ساعات تمرين", icon: Clock, color: "from-accent to-blue-400" },
  ];

  const initial = fullName?.[0] || user?.email?.[0]?.toUpperCase() || "U";

  // Achievement badges
  const achievements = [
    { label: "أول طفل", unlocked: stats.children >= 1, emoji: "👶" },
    { label: "أول اختبار", unlocked: stats.assessments >= 1, emoji: "🏆" },
    { label: "5 اختبارات", unlocked: stats.assessments >= 5, emoji: "⭐" },
    { label: "10 ساعات", unlocked: stats.hours >= 10, emoji: "🔥" },
  ];

  return (
    <Layout>
      <PageHeader title="الملف الشخصي" />
      <div className="container mx-auto px-4 pb-8 max-w-lg space-y-5">
        {/* Profile Header */}
        <Card className="shadow-[var(--shadow-lg)] border-border/30 overflow-hidden animate-fade-in">
          <div className="gradient-hero p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-20 h-20 rounded-full bg-primary-foreground/[0.03]" />
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 text-3xl font-black text-primary-foreground border-2 border-primary-foreground/10 shadow-[var(--shadow-md)] relative">
              {initial}
            </div>
            <h2 className="text-xl font-black text-primary-foreground">{fullName || "مستخدم"}</h2>
            <p className="text-primary-foreground/70 text-sm mt-1">{user?.email}</p>
            {memberSince && (
              <div className="flex items-center justify-center gap-1.5 mt-2 text-primary-foreground/50 text-[10px]">
                <Calendar className="w-3 h-3" />
                <span>عضو منذ {memberSince}</span>
              </div>
            )}
          </div>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {statCards.map((s, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-muted/50">
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-black text-foreground">{s.val}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Achievement Badges */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2">الإنجازات</p>
              <div className="flex gap-2 flex-wrap">
                {achievements.map((a) => (
                  <div
                    key={a.label}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all",
                      a.unlocked
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground opacity-50"
                    )}
                  >
                    <span>{a.emoji}</span>
                    <span>{a.label}</span>
                    {a.unlocked && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-xl h-12">
            <TabsTrigger value="info" className="rounded-lg text-xs font-semibold min-h-[40px]">
              <User className="w-3.5 h-3.5 ml-1" /> البيانات
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg text-xs font-semibold min-h-[40px]">
              <Shield className="w-3.5 h-3.5 ml-1" /> الأمان
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <Card className="shadow-card border-border/50">
              <CardContent className="p-5">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="profileName" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" /> الاسم
                    </label>
                    <Input id="profileName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profileEmail" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> البريد الإلكتروني
                    </label>
                    <Input id="profileEmail" value={user?.email || ""} disabled className="bg-muted rounded-xl" dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profilePhone" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" /> رقم الهاتف
                    </label>
                    <Input id="profilePhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxxx" className="rounded-xl" dir="ltr" />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-xl h-12 font-bold press-effect" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin ml-1" /> جاري الحفظ...</>
                    ) : savedSuccess ? (
                      <><CheckCircle2 className="w-4 h-4 ml-1" /> تم الحفظ!</>
                    ) : (
                      <><Save className="w-4 h-4 ml-1" /> حفظ التعديلات</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-3">
            <Card className="shadow-card border-border/50">
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">تغيير كلمة المرور</h3>
                  <p className="text-xs text-muted-foreground mb-3">سنرسل رابط تغيير كلمة المرور إلى بريدك الإلكتروني</p>
                  <Button variant="outline" onClick={handlePasswordReset} className="w-full rounded-xl">
                    <Lock className="w-4 h-4 ml-1" /> إرسال رابط التغيير
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground text-sm mb-1">حماية الحساب</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      بياناتك محمية بتشفير SSL/TLS. جميع البيانات مخزنة بأمان ولا تتم مشاركتها مع أطراف خارجية.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4 ml-1" /> تسجيل الخروج
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const Profile = () => <AuthGuard><ProfileContent /></AuthGuard>;
export default Profile;
