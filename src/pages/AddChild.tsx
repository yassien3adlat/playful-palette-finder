import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus, Ruler, Weight, Calendar, Heart, Loader2, Sparkles, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const sports = ["كرة القدم", "السباحة", "الجمباز", "كرة السلة", "التنس", "الجودو", "الكاراتيه", "ألعاب القوى", "الفروسية", "التايكوندو", "المصارعة", "كرة اليد"];

const steps = [
  { label: "الأساسيات", fields: ["name", "gender", "age"] },
  { label: "القياسات", fields: ["height_cm", "weight_kg"] },
  { label: "التفضيلات", fields: ["favorite_sport", "notes"] },
];

function getBMICategory(bmi: number, _age: number): { label: string; color: string } {
  // Simplified pediatric BMI interpretation
  if (bmi < 14) return { label: "أقل من الطبيعي", color: "text-amber-500" };
  if (bmi < 18.5) return { label: "طبيعي", color: "text-primary" };
  if (bmi < 25) return { label: "فوق الطبيعي قليلاً", color: "text-amber-500" };
  return { label: "يحتاج متابعة", color: "text-destructive" };
}

const AddChildContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    name: "", age: "", height_cm: "", weight_kg: "",
    favorite_sport: "", notes: "", gender: "" as "" | "male" | "female",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("children").insert({
        user_id: user.id, name: form.name, age: parseInt(form.age),
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        favorite_sport: form.favorite_sport || null, notes: form.notes || null,
        gender: form.gender || null,
      } as any);
      if (error) throw error;
      toast.success("تمت إضافة الطفل بنجاح! 🎉");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    if (step === 0) {
      const age = parseInt(form.age);
      return form.name.trim().length >= 2 && form.name.trim().length <= 50 && form.gender && form.age && age >= 3 && age <= 18;
    }
    if (step === 1) {
      if (form.height_cm && (parseFloat(form.height_cm) < 50 || parseFloat(form.height_cm) > 220)) return false;
      if (form.weight_kg && (parseFloat(form.weight_kg) < 8 || parseFloat(form.weight_kg) > 150)) return false;
      return true;
    }
    return true;
  };

  const isValid = form.name.trim().length >= 2 && form.age && form.gender && parseInt(form.age) >= 3 && parseInt(form.age) <= 18;

  const bmi = form.height_cm && form.weight_kg
    ? parseFloat(form.weight_kg) / ((parseFloat(form.height_cm) / 100) ** 2)
    : null;
  const bmiInfo = bmi && form.age ? getBMICategory(bmi, parseInt(form.age)) : null;

  // Age-based sport suggestions
  const ageSuggestions = form.age ? (() => {
    const age = parseInt(form.age);
    if (age <= 5) return "في هذا العمر، ركّز على المرح والحركة الحرة. السباحة والجمباز خيارات ممتازة.";
    if (age <= 8) return "عمر مثالي لبدء رياضات مثل كرة القدم، السباحة، أو الجمباز.";
    if (age <= 12) return "يمكن البدء في رياضات تنافسية مثل التنس، كرة السلة، أو الفنون القتالية.";
    return "عمر ممتاز للتخصص في رياضة واحدة أو اثنتين وبناء المهارات المتقدمة.";
  })() : null;

  return (
    <Layout hideNav>
      <PageHeader title="إضافة طفل جديد" />
      <div className="container mx-auto p-4 max-w-lg">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-5">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <button
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  i === currentStep
                    ? "gradient-primary text-primary-foreground shadow-sm"
                    : i < currentStep
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < currentStep ? <CheckCircle2 className="w-3 h-3" /> : null}
                {s.label}
              </button>
              {i < steps.length - 1 && <div className={cn("w-6 h-0.5 rounded-full", i < currentStep ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        <Card className="shadow-elevated animate-slide-up border-border/50 overflow-hidden">
          <div className="gradient-hero p-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-2">
              <UserPlus className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-primary-foreground">بيانات الطفل</h2>
            <p className="text-primary-foreground/70 text-xs mt-1">{steps[currentStep].label} — الخطوة {currentStep + 1} من {steps.length}</p>
          </div>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 0: Basics */}
              {currentStep === 0 && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="childName" className="text-sm font-medium text-foreground">اسم الطفل <span className="text-destructive">*</span></label>
                    <Input id="childName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="أدخل اسم الطفل" className="rounded-xl" autoComplete="off" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">الجنس <span className="text-destructive">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "male" as const, emoji: "👦", label: "ولد" },
                        { value: "female" as const, emoji: "👧", label: "بنت" },
                      ].map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g.value })}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all press-effect flex flex-col items-center gap-1.5",
                            form.gender === g.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <span className="text-2xl">{g.emoji}</span>
                          <span className="text-sm font-bold text-foreground">{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="childAge" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> العمر <span className="text-destructive">*</span>
                    </label>
                    <Input id="childAge" type="number" min="3" max="18" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required placeholder="العمر بالسنوات (3-18)" className="rounded-xl" />
                  </div>

                  {ageSuggestions && (
                    <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3 border border-primary/10 animate-fade-in">
                      <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{ageSuggestions}</p>
                    </div>
                  )}
                </>
              )}

              {/* Step 1: Measurements */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="height" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-muted-foreground" /> الطول (سم)
                      </label>
                      <Input id="height" type="number" min="50" max="200" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} placeholder="120" className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="weight" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Weight className="w-3.5 h-3.5 text-muted-foreground" /> الوزن (كجم)
                      </label>
                      <Input id="weight" type="number" min="10" max="120" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} placeholder="30" className="rounded-xl" />
                    </div>
                  </div>

                  {bmi && bmiInfo && (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border/50 animate-fade-in">
                      <AlertCircle className={cn("w-4 h-4 flex-shrink-0", bmiInfo.color)} />
                      <div>
                        <p className="text-xs font-bold text-foreground">مؤشر كتلة الجسم: {bmi.toFixed(1)}</p>
                        <p className={cn("text-[10px] font-semibold", bmiInfo.color)}>{bmiInfo.label}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground text-center">هذه البيانات اختيارية لكنها تساعد في تحسين دقة التوصيات</p>
                </>
              )}

              {/* Step 2: Preferences */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="favSport" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-muted-foreground" /> الرياضة المفضلة
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sports.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, favorite_sport: form.favorite_sport === s ? "" : s })}
                          className={cn(
                            "px-3.5 py-2 rounded-full text-xs font-medium border transition-all press-effect min-h-[36px]",
                            form.favorite_sport === s
                              ? "gradient-primary text-primary-foreground border-transparent"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-sm font-medium text-foreground">ملاحظات</label>
                    <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="أي ملاحظات عن قدرات الطفل أو اهتماماته أو حالته الصحية..." rows={3} className="rounded-xl" />
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-2 pt-2">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 rounded-xl h-12">
                    السابق
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!isStepValid(currentStep)}
                    className="flex-1 gradient-primary text-primary-foreground rounded-xl press-effect h-12"
                  >
                    التالي
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1 gradient-primary text-primary-foreground rounded-xl h-12 font-bold press-effect" disabled={loading || !isValid}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الحفظ...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        حفظ بيانات الطفل
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

const AddChild = () => <AuthGuard><AddChildContent /></AuthGuard>;
export default AddChild;
