import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Star, TrendingUp, Calendar, Clock, X, BarChart3, Trash2,
  Trophy, Flame, Target, ArrowUp, ArrowDown, Minus, ChevronRight,
  Zap, AlertTriangle,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

interface Child { id: string; name: string; recommended_sport: string | null; }
interface ProgressEntry { id: string; week_start: string; sport: string; performance_rating: number; notes: string | null; hours_practiced: number | null; }

const ProgressContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ week_start: "", sport: "", rating: 3, notes: "", hours: "" });
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  useEffect(() => {
    supabase.from("children").select("id, name, recommended_sport").then(({ data }) => {
      setChildren(data || []);
      setLoading(false);
    });
  }, []);

  const fetchProgress = async (childId: string) => {
    const { data } = await supabase.from("weekly_progress").select("*").eq("child_id", childId).order("week_start", { ascending: false });
    setEntries(data || []);
  };

  const selectChild = (child: Child) => {
    setSelectedChild(child);
    fetchProgress(child.id);
    setForm({ ...form, sport: child.recommended_sport || "" });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChild) return;
    if (!form.week_start) { toast.error("يرجى اختيار تاريخ بداية الأسبوع"); return; }
    if (!form.sport.trim()) { toast.error("يرجى إدخال اسم الرياضة"); return; }
    try {
      const { error } = await supabase.from("weekly_progress").insert({
        child_id: selectedChild.id, user_id: user.id,
        week_start: form.week_start, sport: form.sport.trim(),
        performance_rating: form.rating,
        notes: form.notes.trim() || null,
        hours_practiced: form.hours ? parseFloat(form.hours) : null,
      });
      if (error) throw error;
      toast.success("تم تسجيل التقدم! 🎉");
      setShowAdd(false);
      setForm({ week_start: "", sport: selectedChild.recommended_sport || "", rating: 3, notes: "", hours: "" });
      fetchProgress(selectedChild.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("weekly_progress").delete().eq("id", id);
    toast.success("تم الحذف");
    setDeleteConfirm(null);
    if (selectedChild) fetchProgress(selectedChild.id);
  };

  const chartData = entries.slice(0, 12).reverse().map((e) => ({
    week: new Date(e.week_start).toLocaleDateString("ar-EG", { month: "short", day: "numeric" }),
    hours: e.hours_practiced || 0,
    rating: e.performance_rating || 0,
  }));

  const totalHours = entries.reduce((s, e) => s + (Number(e.hours_practiced) || 0), 0);
  const avgRating = entries.length ? (entries.reduce((s, e) => s + (e.performance_rating || 0), 0) / entries.length) : 0;
  const bestRating = entries.length ? Math.max(...entries.map(e => e.performance_rating || 0)) : 0;

  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    let streak = 1;
    const sorted = [...entries].sort((a, b) => new Date(b.week_start).getTime() - new Date(a.week_start).getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = (new Date(sorted[i].week_start).getTime() - new Date(sorted[i + 1].week_start).getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= 5 && diff <= 10) streak++; else break;
    }
    return streak;
  };
  const streak = calculateStreak();

  const getTrend = () => {
    if (entries.length < 2) return "neutral";
    const recent = entries.slice(0, 3).reduce((s, e) => s + (e.performance_rating || 0), 0) / Math.min(3, entries.length);
    const older = entries.slice(-3).reduce((s, e) => s + (e.performance_rating || 0), 0) / Math.min(3, entries.length);
    if (recent > older + 0.3) return "up";
    if (recent < older - 0.3) return "down";
    return "neutral";
  };
  const trend = getTrend();

  if (loading) return null;

  return (
    <Layout>
      <PageHeader title="متابعة التقدم" backTo="/dashboard" />
      <div className="px-4 pb-24 max-w-2xl mx-auto space-y-4">
        {!selectedChild ? (
          /* Child Selection */
          <div className="space-y-3 animate-fade-in">
            {/* Compact Hero */}
            <div className="gradient-hero rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-12 h-12 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 border border-primary-foreground/10">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-base font-black text-primary-foreground">اختر طفلك</h2>
              <p className="text-primary-foreground/70 text-[11px] mt-0.5">تابع تطور أداء طفلك الرياضي أسبوعياً</p>
            </div>

            {children.length === 0 ? (
              <EmptyState icon={TrendingUp} title="أضف طفلاً أولاً" actionLabel="إضافة طفل" onAction={() => navigate("/add-child")} />
            ) : (
              <div className="space-y-2">
                {children.map((c) => (
                  <button key={c.id} onClick={() => selectChild(c)}
                    className="w-full p-3.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 text-right transition-all flex items-center gap-3 press-effect bg-card">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm">{c.name}</p>
                      {c.recommended_sport && <p className="text-[11px] text-primary font-medium">🏅 {c.recommended_sport}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Child Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button onClick={() => { setSelectedChild(null); setEntries([]); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{selectedChild.name[0]}</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground leading-tight">{selectedChild.name}</h2>
                  {selectedChild.recommended_sport && <p className="text-[10px] text-primary font-medium">🏅 {selectedChild.recommended_sport}</p>}
                </div>
              </div>
              <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gradient-primary text-primary-foreground rounded-xl press-effect h-8 text-xs px-3">
                <Plus className="w-3.5 h-3.5 ml-1" /> تسجيل
              </Button>
            </div>

            {/* Quick Stats Row */}
            {entries.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: entries.length, label: "أسبوع", icon: Calendar, color: "text-primary" },
                    { value: totalHours.toFixed(0), label: "ساعة", icon: Clock, color: "text-secondary" },
                    { value: avgRating.toFixed(1), label: "متوسط", icon: Star, color: "text-amber-500" },
                    { value: `${streak}🔥`, label: "متتالي", icon: Zap, color: "text-orange-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border/30 p-2.5 text-center">
                      <p className={cn("text-base font-black", stat.color)}>{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Trend Badge */}
                <div className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                  trend === "up" ? "bg-emerald-500/10 text-emerald-600" : trend === "down" ? "bg-rose-500/10 text-rose-600" : "bg-muted/50 text-muted-foreground"
                )}>
                  {trend === "up" && <><ArrowUp className="w-3.5 h-3.5" /> أداء متحسّن 📈 — استمروا!</>}
                  {trend === "down" && <><ArrowDown className="w-3.5 h-3.5" /> تراجع بسيط 📉 — لا تقلق، واصلوا التدريب</>}
                  {trend === "neutral" && <><Minus className="w-3.5 h-3.5" /> أداء ثابت ➡️ — حافظوا على المستوى</>}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={cn("flex-1 py-2 rounded-lg text-xs font-semibold transition-all", activeTab === "overview" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
                  >
                    <BarChart3 className="w-3.5 h-3.5 inline ml-1" /> الإحصائيات
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={cn("flex-1 py-2 rounded-lg text-xs font-semibold transition-all", activeTab === "history" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
                  >
                    <Calendar className="w-3.5 h-3.5 inline ml-1" /> السجلات ({entries.length})
                  </button>
                </div>

                {activeTab === "overview" && (
                  <div className="space-y-3 animate-fade-in">
                    {/* Performance Chart */}
                    {chartData.length > 1 && (
                      <div className="bg-card rounded-xl border border-border/30 p-3">
                        <h3 className="font-bold text-foreground text-xs mb-2 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-primary" /> مسار الأداء
                        </h3>
                        <div className="h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} domain={[0, 5]} width={25} />
                              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }} />
                              <Area type="monotone" dataKey="rating" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#ratingGrad)" dot={{ r: 3, fill: "hsl(var(--primary))" }} name="التقييم" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Hours Chart */}
                    {chartData.length > 0 && (
                      <div className="bg-card rounded-xl border border-border/30 p-3">
                        <h3 className="font-bold text-foreground text-xs mb-2 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-secondary" /> ساعات التمرين
                        </h3>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={25} />
                              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }} />
                              <Bar dataKey="hours" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="ساعات" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Achievements Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-card rounded-xl border border-border/30 p-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{bestRating}⭐</p>
                          <p className="text-[9px] text-muted-foreground">أعلى تقييم</p>
                        </div>
                      </div>
                      <div className="bg-card rounded-xl border border-border/30 p-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{totalHours.toFixed(1)}</p>
                          <p className="text-[9px] text-muted-foreground">إجمالي الساعات</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-2 animate-fade-in">
                    {entries.map((entry, i) => {
                      const ratingLabel = entry.performance_rating >= 4.5 ? "🏆" : entry.performance_rating >= 3.5 ? "⭐" : entry.performance_rating >= 2.5 ? "👍" : "💪";
                      return (
                        <div key={entry.id} className={cn(
                          "bg-card rounded-xl border p-3 transition-all",
                          i === 0 ? "border-primary/20" : "border-border/30"
                        )}>
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="font-bold text-foreground text-xs">{entry.sport}</p>
                                {i === 0 && <span className="text-[9px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded-full">الأحدث</span>}
                                <span className="text-xs">{ratingLabel}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(entry.week_start).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                              </p>
                            </div>
                            <button onClick={() => setDeleteConfirm(entry.id)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((r) => (
                                <Star key={r} className={cn("w-3 h-3", r <= (entry.performance_rating || 0) ? "text-amber-500 fill-amber-500" : "text-muted")} />
                              ))}
                            </div>
                            {entry.hours_practiced != null && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 bg-muted/50 px-1.5 py-0.5 rounded-full">
                                <Clock className="w-2.5 h-2.5" /> {entry.hours_practiced} ساعة
                              </span>
                            )}
                          </div>
                          {entry.notes && <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed bg-muted/30 rounded-lg p-1.5">{entry.notes}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {entries.length === 0 && !showAdd && (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-foreground font-bold text-sm mb-1">لا توجد سجلات بعد</p>
                <p className="text-[11px] text-muted-foreground mb-3">سجّل أول أسبوع تدريب لتتبع التقدم</p>
                <Button onClick={() => setShowAdd(true)} size="sm" className="gradient-primary text-primary-foreground rounded-xl press-effect">
                  <Plus className="w-3.5 h-3.5 ml-1" /> أول تسجيل
                </Button>
              </div>
            )}

            {/* Add Form */}
            {showAdd && (
              <Card className="shadow-elevated animate-scale-in border-primary/20 overflow-hidden">
                <div className="h-1 gradient-primary" />
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground text-sm mb-3">تسجيل أسبوع جديد</h3>
                  <form onSubmit={handleAdd} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-1 block">بداية الأسبوع *</label>
                        <Input type="date" value={form.week_start} onChange={(e) => setForm({ ...form, week_start: e.target.value })} required className="rounded-lg h-9 text-xs" max={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-1 block">الرياضة *</label>
                        <Input value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} required className="rounded-lg h-9 text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block">التقييم</label>
                      <div className="flex gap-1.5 justify-center py-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })} className="transition-transform hover:scale-110 active:scale-95 p-0.5">
                            <Star className={cn("w-7 h-7", r <= form.rating ? "text-amber-500 fill-amber-500" : "text-muted")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-1 block">ساعات التدريب</label>
                        <Input type="number" step="0.5" min="0" max="40" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="rounded-lg h-9 text-xs" placeholder="2.5" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-1 block">ملاحظات</label>
                        <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-lg h-9 text-xs" placeholder="اختياري..." />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1 gradient-primary text-primary-foreground rounded-xl press-effect h-9 text-xs">حفظ التقدم</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl h-9 text-xs">إلغاء</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-4">
                <Card className="shadow-elevated border-destructive/20 max-w-xs w-full animate-scale-in">
                  <CardContent className="p-5 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">حذف السجل؟</h3>
                      <p className="text-xs text-muted-foreground mt-1">لا يمكن التراجع عن هذا الإجراء</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleDelete(deleteConfirm)} variant="destructive" size="sm" className="flex-1 rounded-xl">نعم، احذف</Button>
                      <Button onClick={() => setDeleteConfirm(null)} variant="outline" size="sm" className="flex-1 rounded-xl">إلغاء</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

const ProgressPage = () => <AuthGuard><ProgressContent /></AuthGuard>;
export default ProgressPage;
