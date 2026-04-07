import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Trophy, Ruler, Weight, Star, Trash2, TrendingUp, ClipboardCheck,
  Calendar, BarChart3, Flame, Target, Activity, AlertTriangle,
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface ChildData { id: string; name: string; age: number; height_cm: number | null; weight_kg: number | null; favorite_sport: string | null; recommended_sport: string | null; skill_level: string | null; notes: string | null; gender: string | null; }
interface AssessmentResult { id: string; completed_at: string; score: number | null; recommended_sports: any; }
interface WeeklyProgress { week_start: string; sport: string; hours_practiced: number | null; performance_rating: number | null; }

function ChildProfileContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [child, setChild] = useState<ChildData | null>(null);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [progress, setProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      supabase.from("children").select("*").eq("id", id).single(),
      supabase.from("assessment_results").select("*").eq("child_id", id).order("completed_at", { ascending: false }).limit(5),
      supabase.from("weekly_progress").select("*").eq("child_id", id).order("week_start", { ascending: false }).limit(8),
    ]).then(([childRes, assessRes, progressRes]) => {
      setChild(childRes.data as ChildData | null);
      setAssessments(assessRes.data || []);
      setProgress(progressRes.data || []);
      setLoading(false);
    });
  }, [user, id]);

  const handleDelete = async () => {
    await supabase.from("children").delete().eq("id", id!);
    toast.success("تم حذف الملف بنجاح");
    navigate("/dashboard");
  };

  if (loading) return <Layout><div className="min-h-screen flex items-center justify-center"><div className="relative w-14 h-14"><div className="absolute inset-0 rounded-full border-4 border-primary/20" /><div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" /></div></div></Layout>;
  if (!child) return <Layout><div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">لم يتم العثور على بيانات الطفل</p></div></Layout>;

  const progressChartData = progress.slice().reverse().map((p) => ({
    week: new Date(p.week_start).toLocaleDateString("ar-EG", { month: "short", day: "numeric" }),
    hours: p.hours_practiced || 0,
    rating: p.performance_rating || 0,
  }));

  const lastAssessment = assessments[0];
  const radarData = lastAssessment?.recommended_sports && Array.isArray(lastAssessment.recommended_sports)
    ? lastAssessment.recommended_sports.slice(0, 6).map((s: any) => ({ subject: s.name || "رياضة", value: s.pct || 0, fullMark: 100 }))
    : [];

  const totalHours = progress.reduce((s, p) => s + (Number(p.hours_practiced) || 0), 0);
  const avgRating = progress.length
    ? (progress.reduce((s, p) => s + (p.performance_rating || 0), 0) / progress.length).toFixed(1)
    : "0";

  // BMI calculation
  const bmi = child.height_cm && child.weight_kg
    ? (child.weight_kg / ((child.height_cm / 100) ** 2)).toFixed(1)
    : null;

  const infoItems = [
    { icon: Calendar, label: "العمر", value: `${child.age} سنوات` },
    child.height_cm && { icon: Ruler, label: "الطول", value: `${child.height_cm} سم` },
    child.weight_kg && { icon: Weight, label: "الوزن", value: `${child.weight_kg} كجم` },
    bmi && { icon: Activity, label: "BMI", value: bmi },
    child.recommended_sport && { icon: Trophy, label: "الرياضة المقترحة", value: child.recommended_sport },
    child.skill_level && { icon: Star, label: "المستوى", value: child.skill_level },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  const avatar = child.gender === "female" ? "👧" : child.gender === "male" ? "👦" : child.name[0];

  return (
    <Layout>
      <PageHeader title="ملف الطفل" backTo="/dashboard" />
      <div className="container mx-auto px-4 pb-8 max-w-2xl space-y-5">
        {/* Header Card */}
        <Card className="shadow-card border-border/50 overflow-hidden animate-fade-in">
          <div className="gradient-hero p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 text-3xl font-black text-primary-foreground border-2 border-primary-foreground/10">
              {avatar}
            </div>
            <h2 className="text-xl font-black text-primary-foreground">{child.name}</h2>
            {child.recommended_sport && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-semibold">
                <Trophy className="w-3 h-3" />
                {child.recommended_sport}
              </span>
            )}
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {infoItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50">
                  <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-bold text-foreground truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-card border-border/50">
            <CardContent className="p-3 text-center">
              <ClipboardCheck className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{assessments.length}</p>
              <p className="text-[10px] text-muted-foreground">اختبارات</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-3 text-center">
              <Flame className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{totalHours.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">ساعات تمرين</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-3 text-center">
              <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{avgRating}</p>
              <p className="text-[10px] text-muted-foreground">متوسط التقييم</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-xl h-12">
            <TabsTrigger value="progress" className="rounded-lg text-[11px] sm:text-xs font-semibold min-h-[40px]"><TrendingUp className="w-3.5 h-3.5 ml-1" /> التقدم</TabsTrigger>
            <TabsTrigger value="assessments" className="rounded-lg text-[11px] sm:text-xs font-semibold min-h-[40px]"><ClipboardCheck className="w-3.5 h-3.5 ml-1" /> الاختبارات</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg text-[11px] sm:text-xs font-semibold min-h-[40px]"><BarChart3 className="w-3.5 h-3.5 ml-1" /> إحصائيات</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-4">
            {progressChartData.length > 0 ? (
              <Card className="shadow-card border-border/50"><CardContent className="p-4">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-primary" /> ساعات التمرين الأسبوعية
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="ساعات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent></Card>
            ) : (
              <Card className="shadow-card border-border/50">
                <CardContent className="py-10 text-center">
                  <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-1">لا توجد بيانات تقدم بعد</p>
                  <p className="text-[11px] text-muted-foreground mb-3">سجّل أول أسبوع تدريب لتتبع تطور {child.name}</p>
                  <Button onClick={() => navigate("/progress")} variant="outline" className="rounded-xl text-xs">إضافة تقدم</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assessments" className="mt-4 space-y-3">
            {radarData.length > 0 && (
              <Card className="shadow-card border-border/50"><CardContent className="p-4">
                <h3 className="font-bold text-foreground text-sm mb-2">آخر نتيجة اختبار</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent></Card>
            )}
            {assessments.length > 0 ? assessments.map((a) => (
              <Card key={a.id} className="shadow-card border-border/50 hover:shadow-elevated transition-all"><CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{new Date(a.completed_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", (a.score || 0) >= 80 ? "bg-primary/10 text-primary" : (a.score || 0) >= 60 ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground")}>
                      نتيجة: {a.score || 0}%
                    </span>
                  </div>
                </div>
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </CardContent></Card>
            )) : (
              <Card className="shadow-card border-border/50">
                <CardContent className="py-10 text-center">
                  <ClipboardCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-1">لا توجد اختبارات بعد</p>
                  <p className="text-[11px] text-muted-foreground mb-3">اكتشف الرياضة المناسبة لـ {child.name}</p>
                  <Button onClick={() => navigate("/assessment")} variant="outline" className="rounded-xl text-xs">بدء اختبار</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: assessments.length, label: "اختبارات مكتملة", icon: ClipboardCheck, color: "text-primary" },
                { val: totalHours.toFixed(1), label: "ساعات تمرين", icon: Flame, color: "text-secondary" },
                { val: progress.length, label: "أسابيع تتبع", icon: Calendar, color: "text-accent" },
                { val: `${lastAssessment?.score || 0}%`, label: "آخر نتيجة", icon: Target, color: "text-primary" },
              ].map((s, i) => (
                <Card key={i} className="shadow-card border-border/50"><CardContent className="p-4 text-center">
                  <s.icon className={cn("w-5 h-5 mx-auto mb-1", s.color)} />
                  <p className="text-2xl font-black text-foreground">{s.val}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </CardContent></Card>
              ))}
            </div>
            {child.notes && (
              <Card className="shadow-card border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground text-sm mb-1">ملاحظات</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{child.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3">
          {showDeleteConfirm ? (
            <div className="flex-1 space-y-2">
              <Card className="border-destructive/30 shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1">تأكيد الحذف</p>
                      <p className="text-xs text-muted-foreground mb-3">سيتم حذف جميع بيانات {child.name} بما في ذلك الاختبارات والتقدم. لا يمكن التراجع عن هذا الإجراء.</p>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={handleDelete} className="rounded-xl text-xs">
                          <Trash2 className="w-3.5 h-3.5 ml-1" /> نعم، احذف
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="rounded-xl text-xs">إلغاء</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5">
                <Trash2 className="w-4 h-4 ml-1" /> حذف
              </Button>
              <Button onClick={() => navigate("/assessment")} className="flex-1 gradient-primary text-primary-foreground rounded-xl press-effect">
                <ClipboardCheck className="w-4 h-4 ml-1" /> اختبار جديد
              </Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

const ChildProfile = () => (<AuthGuard><ChildProfileContent /></AuthGuard>);
export default ChildProfile;
