import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Dumbbell, Brain, Heart, Shield, Moon, Droplets, Smile, ChevronDown, ChevronUp, Clock, Bookmark, BookmarkCheck, Flame, Eye, Footprints, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tipCategories = [
  { key: "all", label: "الكل", icon: Shield, count: 0 },
  { key: "nutrition", label: "تغذية", icon: Apple, count: 0 },
  { key: "fitness", label: "لياقة", icon: Dumbbell, count: 0 },
  { key: "mental", label: "ذهنية", icon: Brain, count: 0 },
  { key: "health", label: "صحة", icon: Heart, count: 0 },
];

const tips = [
  { category: "nutrition", title: "وجبات قبل التمرين", icon: Apple, color: "from-emerald-500 to-green-400", summary: "تناول وجبة خفيفة قبل التمرين بـ 30-60 دقيقة", details: "يُنصح بتقديم وجبة تحتوي على كربوهيدرات سهلة الهضم مثل الموز أو التمر مع كوب من الماء. تجنب الأطعمة الدسمة أو الثقيلة قبل التمرين مباشرة. الموز خيار مثالي لأنه غني بالبوتاسيوم الذي يمنع تشنج العضلات.", readTime: 2 },
  { category: "nutrition", title: "أهمية الترطيب", icon: Droplets, color: "from-blue-500 to-cyan-400", summary: "اجعل الماء رفيق طفلك الدائم أثناء التمرين", details: "يحتاج الطفل إلى شرب الماء قبل وأثناء وبعد التمرين. القاعدة العامة: كوب ماء كل 20 دقيقة أثناء النشاط البدني. تجنب المشروبات الغازية والعصائر المعلبة واستبدلها بالماء أو عصير الفواكه الطبيعي.", readTime: 2 },
  { category: "nutrition", title: "وجبات بعد التمرين", icon: Flame, color: "from-orange-500 to-red-400", summary: "التغذية بعد التمرين أساسية لبناء العضلات", details: "يجب تقديم وجبة تحتوي على بروتين وكربوهيدرات خلال 30-60 دقيقة بعد التمرين. أمثلة: ساندويتش جبنة مع خيار، زبادي مع فواكه، أو حليب مع تمر. هذا يساعد في تعويض الطاقة المفقودة وبناء العضلات.", readTime: 2 },
  { category: "fitness", title: "تمارين الإحماء", icon: Dumbbell, color: "from-orange-500 to-amber-400", summary: "5-10 دقائق إحماء ضرورية قبل أي نشاط", details: "الإحماء يقلل خطر الإصابة بنسبة 50%. ابدأ بالمشي السريع ثم تمارين التمدد الديناميكي. ركز على المفاصل الرئيسية: الركبتين، الكاحلين، الكتفين. التمدد الديناميكي (الحركي) أفضل من الثابت قبل التمرين.", readTime: 3 },
  { category: "fitness", title: "تطوير المرونة", icon: Footprints, color: "from-violet-500 to-purple-400", summary: "المرونة أساس كل رياضة ناجحة", details: "خصص 10 دقائق يومياً لتمارين التمدد. التمدد الثابت لمدة 15-30 ثانية لكل وضعية. ركز على: عضلات الفخذ الأمامية والخلفية، الظهر، الكتفين. المرونة تقلل الإصابات وتحسن الأداء في كل الرياضات.", readTime: 2 },
  { category: "fitness", title: "تمارين التوازن", icon: Zap, color: "from-teal-500 to-emerald-400", summary: "التوازن مهارة أساسية تحتاج تدريب مستمر", details: "تمارين بسيطة مثل الوقوف على قدم واحدة لمدة 30 ثانية، المشي على خط مستقيم، أو القفز والهبوط بتوازن. هذه التمارين تحسن التنسيق الحركي وتقلل خطر السقوط والإصابة.", readTime: 2 },
  { category: "mental", title: "بناء الثقة الرياضية", icon: Smile, color: "from-amber-500 to-yellow-400", summary: "شجّع طفلك على المحاولة وليس فقط الفوز", details: "ركز على الجهد المبذول وليس النتيجة. احتفل بالتحسينات الصغيرة. لا تقارن طفلك بالآخرين — قارنه بنفسه الأسبوع الماضي. استخدم عبارات مثل: 'أنا فخور بمجهودك' بدلاً من 'لازم تفوز'.", readTime: 3 },
  { category: "mental", title: "التعامل مع الخسارة", icon: Brain, color: "from-indigo-500 to-blue-400", summary: "علّم طفلك أن الخسارة جزء من التعلّم", details: "ساعد طفلك على تحليل الأداء بعد المباراة بشكل إيجابي. اسأله: 'ما الذي تعلمته اليوم؟' بدلاً من 'ليش خسرت؟'. الخسارة فرصة للتعلم والتطور — أعظم الرياضيين خسروا كثيراً قبل أن يفوزوا.", readTime: 2 },
  { category: "mental", title: "التركيز أثناء المنافسة", icon: Eye, color: "from-sky-500 to-blue-400", summary: "تقنيات بسيطة لتحسين تركيز طفلك", details: "علّم طفلك تقنية التنفس العميق (شهيق 4 ثوان، حبس 4 ثوان، زفير 4 ثوان) قبل المنافسة. اجعله يتخيل نفسه ينجح في الأداء. هذه التقنيات يستخدمها رياضيون محترفون حول العالم.", readTime: 2 },
  { category: "health", title: "أهمية النوم الكافي", icon: Moon, color: "from-indigo-600 to-purple-500", summary: "8-10 ساعات نوم لأداء رياضي أفضل", details: "النوم الجيد يساعد على نمو العضلات وتعافي الجسم وتحسين التركيز. حدد موعداً ثابتاً للنوم والاستيقاظ — حتى في العطلات. أوقف الشاشات قبل النوم بساعة واستبدلها بالقراءة.", readTime: 2 },
  { category: "health", title: "الوقاية من الإصابات", icon: Shield, color: "from-red-500 to-rose-400", summary: "الحماية أهم من الأداء", details: "تأكد من ارتداء المعدات الواقية المناسبة لكل رياضة (واقي للركبة، خوذة، واقي أسنان). لا تتجاهل أي ألم يشكو منه الطفل — توقف فوراً واستشر طبيباً إذا استمر الألم.", readTime: 2 },
  { category: "health", title: "حماية العظام والمفاصل", icon: Heart, color: "from-pink-500 to-rose-400", summary: "تقوية العظام مهمة خاصة في سن النمو", details: "تأكد من حصول طفلك على كمية كافية من الكالسيوم (حليب، جبن، زبادي) وفيتامين D (التعرض للشمس 15 دقيقة يومياً). تجنب التدريب المفرط الذي قد يؤذي مفاصل الطفل النامية.", readTime: 2 },
];

// Update counts
tipCategories.forEach((cat) => {
  cat.count = cat.key === "all" ? tips.length : tips.filter((t) => t.category === cat.key).length;
});

function TipsContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const filtered = activeCategory === "all" ? tips : tips.filter((t) => t.category === activeCategory);

  const toggleBookmark = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <Layout>
      <PageHeader title="نصائح وإرشادات" backTo="/dashboard" />
      <div className="container mx-auto px-4 pb-8 space-y-4">
        {/* Header Stats */}
        <Card className="shadow-[var(--shadow-lg)] border-border/30 overflow-hidden">
          <div className="gradient-hero p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-20 h-20 rounded-full bg-primary-foreground/[0.03]" />
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-primary-foreground/10 shadow-[var(--shadow-md)] relative">
              <Brain className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-black text-primary-foreground relative">نصائح الخبراء</h2>
            <p className="text-primary-foreground/70 text-xs mt-1 relative">{tips.length} نصيحة في 4 مجالات مختلفة</p>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
          {tipCategories.map((cat) => (
            <Badge key={cat.key} variant={activeCategory === cat.key ? "default" : "outline"}
              className={cn("cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all press-effect flex items-center gap-1.5 min-h-[36px]",
                activeCategory === cat.key ? "gradient-primary text-primary-foreground border-transparent" : "hover:bg-muted")}
              onClick={() => setActiveCategory(cat.key)}>
              <cat.icon className="w-3.5 h-3.5" />{cat.label} ({cat.count})
            </Badge>
          ))}
        </div>

        {bookmarks.size > 0 && (
          <p className="text-[11px] text-primary flex items-center gap-1 font-semibold bg-primary/5 rounded-lg px-3 py-1.5 w-fit border border-primary/10">
            <BookmarkCheck className="w-3.5 h-3.5" /> {bookmarks.size} نصيحة محفوظة
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((tip, i) => {
            const globalIndex = tips.indexOf(tip);
            const isExpanded = expandedTip === globalIndex;
            const isBookmarked = bookmarks.has(globalIndex);
            return (
              <Card key={globalIndex} className={cn("card-premium border-border/30 transition-all cursor-pointer bg-card/80", isExpanded && "shadow-[var(--shadow-lg)] border-primary/20")} onClick={() => setExpandedTip(isExpanded ? null : globalIndex)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setExpandedTip(isExpanded ? null : globalIndex)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center flex-shrink-0`}>
                      <tip.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-foreground text-sm mb-0.5">{tip.title}</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => toggleBookmark(globalIndex, e)}
                            className="p-1 rounded-lg hover:bg-muted transition-colors"
                            aria-label={isBookmarked ? "إزالة من المحفوظات" : "حفظ النصيحة"}
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-primary" />
                            ) : (
                              <Bookmark className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip.summary}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {tip.readTime} دقيقة قراءة
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 rounded-full">
                          {tipCategories.find(c => c.key === tip.category)?.label}
                        </Badge>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                          <p className="text-sm text-foreground/80 leading-relaxed">{tip.details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

const Tips = () => (<AuthGuard><TipsContent /></AuthGuard>);
export default Tips;
