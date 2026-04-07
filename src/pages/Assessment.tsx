import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight, Trophy, Zap, Heart, Brain,
  Timer, Users, Target, Sparkles, CheckCircle2, ArrowRight,
  Flame, Shield, Wind, Smile, ThumbsDown, Star,
  Share2, RotateCcw,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  age: number;
  height_cm: number | null;
  weight_kg: number | null;
  gender: string | null;
}

// 8 assessment dimensions
const categories = [
  { key: "speed", label: "السرعة", icon: Zap, color: "text-amber-500" },
  { key: "endurance", label: "التحمّل", icon: Heart, color: "text-rose-500" },
  { key: "focus", label: "التركيز", icon: Brain, color: "text-violet-500" },
  { key: "reaction", label: "ردة الفعل", icon: Timer, color: "text-blue-500" },
  { key: "teamwork", label: "العمل الجماعي", icon: Users, color: "text-emerald-500" },
  { key: "accuracy", label: "الدقة", icon: Target, color: "text-orange-500" },
  { key: "flexibility", label: "المرونة", icon: Wind, color: "text-cyan-500" },
  { key: "strength", label: "القوة", icon: Shield, color: "text-red-500" },
];

// 24 questions across 8 categories + preferences
const questions = [
  { category: "speed", text: "هل يتميز طفلك بسرعة في الجري مقارنة بأقرانه؟", options: ["سريع جداً ومتميز", "أسرع من المتوسط", "متوسط السرعة", "أبطأ من أقرانه"] },
  { category: "speed", text: "كيف أداء طفلك في سباقات الجري بالمدرسة؟", options: ["يفوز دائماً أو من الأوائل", "ينافس بقوة ويحقق مراكز جيدة", "يشارك ويستمتع", "لا يفضل السباقات"] },
  { category: "speed", text: "هل يستطيع طفلك تغيير اتجاهه بسرعة أثناء الجري؟", options: ["نعم، رشيق جداً", "جيد في ذلك", "متوسط", "يجد صعوبة"] },
  { category: "endurance", text: "كم مدة يستطيع طفلك اللعب دون أن يشعر بالتعب؟", options: ["أكثر من ساعة بنشاط كامل", "45-60 دقيقة", "20-30 دقيقة", "أقل من 15 دقيقة"] },
  { category: "endurance", text: "بعد الجري أو اللعب الطويل، كم يحتاج للراحة؟", options: ["يرتاح بسرعة ويكمل", "يرتاح قليلاً ثم يكمل", "يحتاج راحة طويلة", "يتعب جداً ويتوقف"] },
  { category: "endurance", text: "هل يستطيع طفلك ممارسة نشاط بدني يومياً؟", options: ["نعم، كل يوم بدون مشكلة", "غالباً نعم", "أحياناً يحتاج يوم راحة", "يتعب بسرعة ويحتاج فترات طويلة"] },
  { category: "focus", text: "هل يستطيع طفلك التركيز على نشاط واحد لفترة طويلة؟", options: ["ممتاز - يركز لأكثر من 30 دقيقة", "جيد - 15-20 دقيقة", "متوسط - 10 دقائق", "يتشتت بسهولة"] },
  { category: "focus", text: "كيف يتعامل طفلك مع التعليمات الجديدة في اللعب؟", options: ["يفهمها ويطبقها فوراً", "يحتاج تكرار بسيط", "يحتاج شرح مفصل ومتعدد", "يجد صعوبة كبيرة"] },
  { category: "focus", text: "هل يستطيع طفلك تذكر خطط اللعب أو التكتيكات؟", options: ["نعم، ذاكرته ممتازة", "يتذكر معظم التفاصيل", "يتذكر الأساسيات", "ينسى بسرعة"] },
  { category: "reaction", text: "كيف ردة فعل طفلك عند رمي كرة له فجأة؟", options: ["يمسكها بسرعة وسهولة", "يمسكها في أغلب المرات", "يحاول لكن يفلتها كثيراً", "لا يستجيب بسرعة"] },
  { category: "reaction", text: "أثناء اللعب الجماعي، هل يتفاعل بسرعة مع التغيرات؟", options: ["سريع الاستجابة جداً", "يتفاعل في معظم الأوقات", "يحتاج وقت للتفكير", "بطيء في الاستجابة"] },
  { category: "reaction", text: "هل يجيد طفلك ألعاب السرعة والانتباه (زي لعبة الكراسي)؟", options: ["من أفضل اللاعبين دائماً", "جيد ومنافس", "متوسط", "يخسر بسرعة"] },
  { category: "teamwork", text: "هل يفضل طفلك اللعب مع مجموعة أم بمفرده؟", options: ["يعشق اللعب الجماعي", "يفضل الفريق غالباً", "لا يمانع أي نوع", "يفضل اللعب بمفرده"] },
  { category: "teamwork", text: "كيف يتعامل طفلك مع زملائه أثناء اللعب الجماعي؟", options: ["قائد يوجه ويحفز الآخرين", "متعاون ومشارك فعال", "يتبع التعليمات بهدوء", "ينعزل ويلعب لوحده"] },
  { category: "teamwork", text: "هل يستطيع طفلك التنسيق مع شخص آخر لإنجاز مهمة؟", options: ["ممتاز في التنسيق", "جيد غالباً", "يحتاج توجيه", "يفضل يعمل لوحده"] },
  { category: "accuracy", text: "هل يستطيع طفلك إصابة هدف بالكرة من مسافة؟", options: ["دقيق جداً في التصويب", "يصيب الهدف غالباً", "أحياناً يصيب وأحياناً لا", "يحتاج تدريب كثير"] },
  { category: "accuracy", text: "كيف أداء طفلك في الأنشطة الدقيقة (رسم، بناء، تلوين)؟", options: ["ممتاز ودقيق جداً", "جيد في معظم الأوقات", "متوسط الدقة", "يحتاج تحسين كبير"] },
  { category: "accuracy", text: "هل يستطيع طفلك رمي كرة صغيرة في سلة من مسافة؟", options: ["يصيبها من أول مرة غالباً", "يصيبها بعد محاولتين", "يحتاج عدة محاولات", "نادراً ما يصيبها"] },
  { category: "flexibility", text: "هل يستطيع طفلك لمس أصابع قدميه وهو واقف؟", options: ["نعم بسهولة ويتجاوزها", "يلمسها بصعوبة بسيطة", "يقترب منها لكن لا يلمسها", "بعيد عنها"] },
  { category: "flexibility", text: "هل يستطيع طفلك عمل حركات جمباز بسيطة (شقلبة/جسر)؟", options: ["نعم بمهارة", "يحاول وينجح أحياناً", "يخاف أو يجد صعوبة", "لا يستطيع إطلاقاً"] },
  { category: "flexibility", text: "هل جسم طفلك مرن بشكل عام؟", options: ["مرن جداً", "مرونة جيدة", "متوسط المرونة", "جسمه صلب/قليل المرونة"] },
  { category: "strength", text: "هل يستطيع طفلك تعليق نفسه على بار لفترة؟", options: ["أكثر من 30 ثانية", "15-30 ثانية", "أقل من 10 ثوان", "لا يستطيع"] },
  { category: "strength", text: "كيف أداء طفلك في تمارين الضغط أو البطن؟", options: ["يعمل عدد كبير بسهولة", "يعمل عدد معقول", "يعمل القليل ويتعب", "لا يستطيع عمل أي تمرين"] },
  { category: "strength", text: "هل طفلك قوي البنية مقارنة بأقرانه؟", options: ["أقوى من معظمهم", "في نفس المستوى", "أقل قوة قليلاً", "أضعف بكثير"] },
];

// Preference questions (separate from skill scoring)
const preferenceQuestions = [
  {
    text: "ما الأنشطة التي يستمتع بها طفلك أكثر؟ (اختر الأقرب)",
    options: [
      { label: "الجري والسباقات", boosts: ["athletics", "football", "basketball"] },
      { label: "الماء والسباحة", boosts: ["swimming"] },
      { label: "الحركات البهلوانية والقفز", boosts: ["gymnastics"] },
      { label: "الألعاب الجماعية مع أصدقائه", boosts: ["football", "basketball", "handball"] },
      { label: "الضرب والركل (الكرة أو الألعاب)", boosts: ["karate", "taekwondo", "football"] },
      { label: "الألعاب التي تحتاج دقة وتركيز", boosts: ["tennis", "gymnastics", "archery"] },
    ],
  },
  {
    text: "ما الأنشطة التي لا يحبها طفلك؟ (اختر الأقرب)",
    options: [
      { label: "لا يحب الماء", penalizes: ["swimming"] },
      { label: "لا يحب الجري الطويل", penalizes: ["athletics", "football"] },
      { label: "لا يحب الاحتكاك الجسدي", penalizes: ["karate", "taekwondo", "handball", "wrestling"] },
      { label: "لا يحب الأنشطة الفردية", penalizes: ["swimming", "athletics", "gymnastics", "tennis"] },
      { label: "لا يحب الارتفاعات أو الشقلبات", penalizes: ["gymnastics"] },
      { label: "لا يوجد شيء محدد يكرهه", penalizes: [] },
    ],
  },
  {
    text: "ما شخصية طفلك الأقرب؟",
    options: [
      { label: "قيادي وجريء", boosts: ["football", "basketball", "handball"] },
      { label: "هادئ ومركز", boosts: ["swimming", "tennis", "gymnastics", "archery"] },
      { label: "حركي ولا يجلس أبداً", boosts: ["football", "athletics", "gymnastics", "karate"] },
      { label: "اجتماعي ويحب الفريق", boosts: ["football", "basketball", "handball"] },
      { label: "تنافسي ويحب الفوز", boosts: ["tennis", "karate", "taekwondo", "athletics"] },
      { label: "فني ويحب الإبداع", boosts: ["gymnastics", "swimming"] },
    ],
  },
];

// Sport recommendation engine
const sportProfiles: Record<string, { name: string; emoji: string; desc: string; weights: Record<string, number>; idealHeight?: "tall" | "short" | "any" }> = {
  football: { name: "كرة القدم", emoji: "⚽", desc: "رياضة جماعية ممتعة تبني اللياقة والعمل الجماعي والسرعة", weights: { speed: 0.2, endurance: 0.2, teamwork: 0.2, accuracy: 0.15, reaction: 0.1, flexibility: 0.05, strength: 0.05, focus: 0.05 } },
  basketball: { name: "كرة السلة", emoji: "🏀", desc: "رياضة تجمع بين القوة والسرعة والدقة والعمل الجماعي", weights: { speed: 0.15, accuracy: 0.2, reaction: 0.15, teamwork: 0.2, endurance: 0.1, strength: 0.1, focus: 0.05, flexibility: 0.05 }, idealHeight: "tall" },
  swimming: { name: "السباحة", emoji: "🏊", desc: "رياضة فردية ممتازة تبني التحمل والمرونة وتقوي الجسم بالكامل", weights: { endurance: 0.25, flexibility: 0.2, strength: 0.15, focus: 0.15, speed: 0.1, reaction: 0.05, accuracy: 0.05, teamwork: 0.05 } },
  tennis: { name: "التنس", emoji: "🎾", desc: "رياضة تتطلب سرعة رد فعل عالية ودقة وتركيز", weights: { reaction: 0.25, accuracy: 0.2, speed: 0.15, focus: 0.15, endurance: 0.1, flexibility: 0.05, strength: 0.05, teamwork: 0.05 } },
  gymnastics: { name: "الجمباز", emoji: "🤸", desc: "رياضة تجمع بين المرونة والقوة والتركيز والإبداع الحركي", weights: { flexibility: 0.25, focus: 0.2, accuracy: 0.15, strength: 0.15, reaction: 0.1, speed: 0.05, endurance: 0.05, teamwork: 0.05 }, idealHeight: "short" },
  karate: { name: "الكاراتيه", emoji: "🥋", desc: "فنون قتالية تبني الانضباط والثقة بالنفس والتركيز الذهني", weights: { reaction: 0.2, focus: 0.2, speed: 0.15, strength: 0.15, flexibility: 0.1, accuracy: 0.1, endurance: 0.05, teamwork: 0.05 } },
  taekwondo: { name: "التايكوندو", emoji: "🥋", desc: "فن قتالي يركز على ركلات القدم والسرعة والمرونة", weights: { flexibility: 0.2, speed: 0.2, reaction: 0.15, strength: 0.15, focus: 0.1, accuracy: 0.1, endurance: 0.05, teamwork: 0.05 } },
  athletics: { name: "ألعاب القوى", emoji: "🏃", desc: "رياضة تبني السرعة والقوة والتحمل - أساس كل الرياضات", weights: { speed: 0.25, endurance: 0.25, strength: 0.2, focus: 0.1, reaction: 0.1, flexibility: 0.05, accuracy: 0.025, teamwork: 0.025 } },
  handball: { name: "كرة اليد", emoji: "🤾", desc: "رياضة جماعية سريعة تتطلب قوة ودقة وعمل جماعي", weights: { teamwork: 0.2, strength: 0.2, speed: 0.15, accuracy: 0.15, reaction: 0.1, endurance: 0.1, focus: 0.05, flexibility: 0.05 } },
  archery: { name: "الرماية", emoji: "🎯", desc: "رياضة تركيز ودقة بامتياز - مثالية للأطفال الهادئين المركزين", weights: { focus: 0.3, accuracy: 0.3, reaction: 0.1, endurance: 0.1, strength: 0.1, speed: 0.05, flexibility: 0.025, teamwork: 0.025 } },
  wrestling: { name: "المصارعة", emoji: "🤼", desc: "رياضة قوة وتحمل وتكتيك - تبني الثقة والإصرار", weights: { strength: 0.25, endurance: 0.2, reaction: 0.15, flexibility: 0.15, speed: 0.1, focus: 0.1, accuracy: 0.025, teamwork: 0.025 } },
};

// Motivational messages between category transitions
const categoryMessages: Record<string, string> = {
  endurance: "🔥 أحسنت! خلّصنا أسئلة السرعة. الآن نشوف التحمّل...",
  focus: "💪 ممتاز! الآن نختبر قدرة التركيز والانتباه...",
  reaction: "🧠 رائع! هل طفلك سريع البديهة؟ نشوف...",
  teamwork: "⚡ تمام! الآن نشوف مهارات العمل الجماعي...",
  accuracy: "🤝 أحسنت! نختبر الآن الدقة والتصويب...",
  flexibility: "🎯 ممتاز! نشوف المرونة والليونة...",
  strength: "🤸 رائع! آخر قسم — القوة البدنية!",
};

function AssessmentContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [prefAnswers, setPrefAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<"select" | "quiz" | "preferences" | "result">("select");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [recommendations, setRecommendations] = useState<{ name: string; emoji: string; desc: string; pct: number }[]>([]);
  const [currentPrefQ, setCurrentPrefQ] = useState(0);
  const [showCategoryMsg, setShowCategoryMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("children").select("id, name, age, height_cm, weight_kg, gender").then(({ data }) => {
      setChildren((data as any) || []);
    });
  }, [user]);

  const totalQuestions = questions.length + preferenceQuestions.length;
  const currentTotal = phase === "quiz" ? currentQ + 1 : questions.length + currentPrefQ + 1;
  const progress = (currentTotal / totalQuestions) * 100;

  // Category progress dots
  // Track fully completed categories (all 3 questions answered)
  const completedCategories = new Set(
    categories
      .filter((c) => {
        const catQuestions = questions.filter((q) => q.category === c.key);
        const answeredCount = answers.filter((_, i) => questions[i]?.category === c.key).length;
        return answeredCount >= catQuestions.length;
      })
      .map((c) => c.key)
  );
  const currentCategory = questions[currentQ]?.category;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    // Check if next question is a new category
    if (currentQ + 1 < questions.length) {
      const nextCat = questions[currentQ + 1].category;
      const currCat = questions[currentQ].category;
      if (nextCat !== currCat && categoryMessages[nextCat]) {
        setShowCategoryMsg(categoryMessages[nextCat]);
        setTimeout(() => {
          setShowCategoryMsg(null);
          setCurrentQ(currentQ + 1);
        }, 1500);
        return;
      }
      setCurrentQ(currentQ + 1);
    } else {
      setPhase("preferences");
      setCurrentPrefQ(0);
    }
  };

  const handlePrefAnswer = (optionIndex: number) => {
    const newPrefAnswers = [...prefAnswers, optionIndex];
    setPrefAnswers(newPrefAnswers);
    if (currentPrefQ + 1 < preferenceQuestions.length) {
      setCurrentPrefQ(currentPrefQ + 1);
    } else {
      calculateResults(answers, newPrefAnswers);
    }
  };

  const calculateResults = async (allAnswers: number[], allPrefAnswers: number[]) => {
    // Step 1: Calculate raw category scores (0-100)
    const catScores: Record<string, number[]> = {};
    categories.forEach((c) => (catScores[c.key] = []));
    allAnswers.forEach((ans, i) => {
      // Score: 0=best(3pts), 1=good(2pts), 2=avg(1pt), 3=low(0pts)
      catScores[questions[i].category].push(3 - ans);
    });

    const finalScores: Record<string, number> = {};
    Object.entries(catScores).forEach(([key, vals]) => {
      finalScores[key] = Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 3)) * 100);
    });
    setScores(finalScores);

    // Step 2: Calculate weighted sport scores
    const sportScores: Record<string, number> = {};
    Object.entries(sportProfiles).forEach(([key, sport]) => {
      let score = 0;
      Object.entries(sport.weights).forEach(([dim, weight]) => {
        score += (finalScores[dim] || 0) * weight;
      });

      // Height factor — scaled by how far from average
      if (selectedChild?.height_cm && sport.idealHeight) {
        const age = selectedChild.age || 10;
        const avgHeight: Record<number, number> = { 3: 95, 4: 102, 5: 109, 6: 115, 7: 121, 8: 127, 9: 132, 10: 137, 11: 143, 12: 149, 13: 156, 14: 163, 15: 168, 16: 172, 17: 175, 18: 177 };
        const avg = avgHeight[age] || 137;
        const deviation = (selectedChild.height_cm - avg) / avg; // normalized deviation
        if (sport.idealHeight === "tall") {
          score += deviation * 30; // taller = more bonus, shorter = penalty
        } else if (sport.idealHeight === "short") {
          score -= deviation * 25; // shorter = bonus, taller = penalty
        }
      }

      // Age suitability adjustments
      if (selectedChild?.age) {
        const age = selectedChild.age;
        // Young children (3-6): favor gymnastics, swimming; less combat
        if (age <= 6) {
          if (key === "gymnastics" || key === "swimming") score += 6;
          if (key === "wrestling" || key === "karate" || key === "taekwondo") score -= 4;
          if (key === "archery") score -= 6;
        }
        // Teens (13+): all sports fair, slight boost for competitive ones
        if (age >= 13) {
          if (key === "athletics" || key === "tennis") score += 3;
        }
      }

      // Weight/BMI consideration
      if (selectedChild?.weight_kg && selectedChild?.height_cm) {
        const heightM = selectedChild.height_cm / 100;
        const bmi = selectedChild.weight_kg / (heightM * heightM);
        const age = selectedChild.age || 10;
        // Rough age-adjusted BMI check (above ~85th percentile)
        const highBMI = age <= 8 ? 18 : age <= 12 ? 21 : 24;
        const lowBMI = age <= 8 ? 14 : age <= 12 ? 15.5 : 17;
        if (bmi > highBMI) {
          // Heavier kids: swimming great, gymnastics harder
          if (key === "swimming") score += 5;
          if (key === "wrestling" || key === "handball") score += 3;
          if (key === "gymnastics") score -= 6;
          if (key === "athletics") score -= 3;
        }
        if (bmi < lowBMI) {
          // Leaner kids: gymnastics, athletics, swimming great
          if (key === "gymnastics" || key === "athletics") score += 4;
          if (key === "wrestling") score -= 3;
        }
      }

      sportScores[key] = score;
    });

    // Step 3: Apply preference boosts/penalties (proportional to base score)
    allPrefAnswers.forEach((ans, i) => {
      const pq = preferenceQuestions[i];
      const option = pq.options[ans] as any;
      if (option.boosts) {
        option.boosts.forEach((s: string) => {
          if (sportScores[s] != null) {
            // Proportional boost: 15% of current score, minimum +5
            sportScores[s] += Math.max(5, Math.abs(sportScores[s]) * 0.15);
          }
        });
      }
      if (option.penalizes) {
        option.penalizes.forEach((s: string) => {
          if (sportScores[s] != null) {
            // Proportional penalty: 18% of current score, minimum -5 (heavier than boost for meaningful dislikes)
            sportScores[s] -= Math.max(5, Math.abs(sportScores[s]) * 0.18);
          }
        });
      }
    });

    // Step 4: Normalize to meaningful percentages (30-98 range for discrimination)
    const maxScore = Math.max(...Object.values(sportScores));
    const minScore = Math.min(...Object.values(sportScores));
    const range = maxScore - minScore || 1;

    const recs = Object.entries(sportProfiles)
      .map(([key, sport]) => {
        const normalized = (sportScores[key] - minScore) / range; // 0..1
        // Map to 30-98 range with non-linear curve for better spread
        const pct = Math.round(30 + Math.pow(normalized, 0.85) * 68);
        return {
          name: sport.name,
          emoji: sport.emoji,
          desc: sport.desc,
          pct: Math.min(98, Math.max(30, pct)),
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);

    setRecommendations(recs);

    if (user && selectedChild) {
      await Promise.all([
        supabase.from("assessment_results").insert([{
          user_id: user.id, child_id: selectedChild.id,
          answers: { skillAnswers: allAnswers, prefAnswers: allPrefAnswers } as any,
          recommended_sports: recs as any,
          score: recs[0]?.pct || 0,
        }]),
        supabase.from("children").update({ recommended_sport: recs[0]?.name || "" }).eq("id", selectedChild.id),
      ]);
    }
    setPhase("result");
  };

  const q = questions[currentQ];
  const cat = categories.find((c) => c.key === q?.category);
  const prefQ = preferenceQuestions[currentPrefQ];

  const goBack = () => {
    if (phase === "quiz" && currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setAnswers(answers.slice(0, -1));
    } else if (phase === "preferences" && currentPrefQ > 0) {
      setCurrentPrefQ(currentPrefQ - 1);
      setPrefAnswers(prefAnswers.slice(0, -1));
    } else if (phase === "preferences" && currentPrefQ === 0) {
      setPhase("quiz");
      setCurrentQ(questions.length - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const radarData = categories.map((c) => ({ subject: c.label, value: scores[c.key] || 0, fullMark: 100 }));

  const handleShare = async () => {
    const text = `🏆 نتائج اختبار Helm لـ ${selectedChild?.name}\n\nالرياضة الأنسب: ${recommendations[0]?.emoji} ${recommendations[0]?.name} (${recommendations[0]?.pct}% توافق)\n\nاكتشف رياضة طفلك: ${window.location.origin}`;
    if (navigator.share) {
      try { await navigator.share({ title: "نتائج اختبار Helm", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      import("sonner").then(({ toast }) => toast.success("تم نسخ النتائج! 📋"));
    }
  };

  // Top 3 strengths
  const topStrengths = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => categories.find((c) => c.key === key)!);

  return (
    <Layout>
      <PageHeader title="اختبار القدرات" backTo="/dashboard" />
      <div className="container mx-auto px-4 pb-8 max-w-2xl">
        {/* ===== SELECT CHILD ===== */}
        {phase === "select" && (
          <div className="space-y-4 animate-fade-in">
            <Card className="shadow-card border-border/50 overflow-hidden">
              <div className="gradient-hero p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-black text-primary-foreground mb-1">اختبار القدرات الرياضية</h2>
                <p className="text-primary-foreground/80 text-sm">{totalQuestions} سؤال • 8 دقائق</p>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="bg-muted/30 rounded-2xl p-3 border border-border/40">
                  <p className="text-xs font-bold text-foreground mb-2">نقيس 8 قدرات أساسية + تفضيلات طفلك:</p>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
                    {categories.map((c) => (
                      <div key={c.key} className="text-center">
                        <c.icon className={cn("w-5 h-5 mx-auto mb-1", c.color)} />
                        <p className="text-[10px] text-muted-foreground font-medium leading-tight">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <div className="flex items-start gap-2">
                    <Smile className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-foreground">نسأل عن تفضيلاته أيضاً</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">بنسأل عن اللي بيحبه وبيكرهه عشان النتيجة تكون دقيقة ومناسبة</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">اختر الطفل</label>
                  {children.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground text-sm mb-3">أضف طفلاً أولاً لبدء الاختبار</p>
                      <Button onClick={() => navigate("/add-child")} className="gradient-primary text-primary-foreground rounded-xl">إضافة طفل</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {children.map((child) => (
                        <button key={child.id} onClick={() => setSelectedChild(child)}
                          className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all press-effect text-right",
                            selectedChild?.id === child.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                            {child.gender === "female" ? "👧" : child.gender === "male" ? "👦" : child.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{child.name}</p>
                            <p className="text-muted-foreground text-xs">{child.age} سنوات{child.height_cm ? ` • ${child.height_cm} سم` : ""}</p>
                          </div>
                          {selectedChild?.id === child.id && <CheckCircle2 className="w-5 h-5 text-primary mr-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedChild && (
                  <Button onClick={() => setPhase("quiz")} className="w-full gradient-primary text-primary-foreground rounded-xl py-6 text-base press-effect">
                    ابدأ الاختبار <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CATEGORY TRANSITION MESSAGE ===== */}
        {showCategoryMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="text-center p-8 animate-scale-in">
              <p className="text-xl font-black text-foreground">{showCategoryMsg}</p>
            </div>
          </div>
        )}

        {/* ===== SKILL QUIZ ===== */}
        {phase === "quiz" && q && !showCategoryMsg && (
          <div className="space-y-4 animate-fade-in" key={`q-${currentQ}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>السؤال {currentTotal} من {totalQuestions}</span>
                <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-full border border-border/30">
                  {cat && <cat.icon className={cn("w-3.5 h-3.5", cat.color)} />}
                  <span className="font-medium">{cat?.label}</span>
                </span>
              </div>
              <Progress value={progress} className="h-2.5 rounded-full" />
              {/* Category progress dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {categories.map((c) => (
                  <div
                    key={c.key}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      c.key === currentCategory ? "w-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]" :
                      completedCategories.has(c.key) ? "w-2 bg-primary/40" : "w-2 bg-border"
                    )}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <Card className="card-premium border-border/30 bg-card/90 backdrop-blur-sm">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-start gap-3">
                  {cat && (
                    <div className={cn("feature-icon w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
                      cat.key === "speed" ? "from-amber-500 to-yellow-400" :
                      cat.key === "endurance" ? "from-rose-500 to-pink-400" :
                      cat.key === "focus" ? "from-violet-500 to-purple-400" :
                      cat.key === "reaction" ? "from-blue-500 to-cyan-400" :
                      cat.key === "teamwork" ? "from-emerald-500 to-green-400" :
                      cat.key === "accuracy" ? "from-orange-500 to-amber-400" :
                      cat.key === "flexibility" ? "from-cyan-500 to-teal-400" :
                      "from-red-500 to-rose-400"
                    )}>
                      <cat.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-foreground leading-relaxed pt-1.5">{q.text}</h3>
                </div>
                <div className="space-y-2.5">
                  {q.options.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(i)}
                      className="w-full text-right p-4 min-h-[52px] rounded-2xl border-2 border-border/40 hover:border-primary/50 hover:bg-primary/[0.03] active:bg-primary/[0.06] transition-all press-effect text-sm font-medium text-foreground group/opt hover:shadow-[var(--shadow-sm)]">
                      <span className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl border-2 border-border/50 group-hover/opt:border-primary/40 group-hover/opt:bg-primary/8 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover/opt:text-primary flex-shrink-0 transition-all">
                          {["أ", "ب", "ج", "د"][i]}
                        </span>
                        <span className="group-hover/opt:translate-x-[-2px] transition-transform">{opt}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            {currentQ > 0 && (
              <Button variant="ghost" onClick={goBack} className="text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4 ml-1" /> السؤال السابق
              </Button>
            )}
          </div>
        )}

        {/* ===== PREFERENCES ===== */}
        {phase === "preferences" && prefQ && (
          <div className="space-y-4 animate-fade-in" key={`pq-${currentPrefQ}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>السؤال {currentTotal} من {totalQuestions}</span>
                <span className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full text-primary font-medium border border-primary/15">
                  {currentPrefQ === 0 && <><Smile className="w-3.5 h-3.5" /> بيحب إيه</>}
                  {currentPrefQ === 1 && <><ThumbsDown className="w-3.5 h-3.5" /> بيكره إيه</>}
                  {currentPrefQ === 2 && <><Star className="w-3.5 h-3.5" /> شخصيته</>}
                </span>
              </div>
              <Progress value={progress} className="h-2.5 rounded-full" />
            </div>
            <Card className="card-premium border-border/30 bg-card/90 backdrop-blur-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />
              <CardContent className="p-5 space-y-5">
                <div>
                  <p className="text-xs text-primary font-bold mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> أسئلة التفضيلات
                  </p>
                  <h3 className="text-lg font-bold text-foreground leading-relaxed">{prefQ.text}</h3>
                </div>
                <div className="space-y-2.5">
                  {prefQ.options.map((opt, i) => (
                    <button key={i} onClick={() => handlePrefAnswer(i)}
                      className="w-full text-right p-4 min-h-[52px] rounded-2xl border-2 border-border/40 hover:border-secondary/50 hover:bg-secondary/[0.03] active:bg-secondary/[0.06] transition-all press-effect text-sm font-medium text-foreground group/opt hover:shadow-[var(--shadow-sm)]">
                      <span className="group-hover/opt:translate-x-[-2px] transition-transform inline-block">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Button variant="ghost" onClick={goBack} className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4 ml-1" /> السؤال السابق
            </Button>
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {phase === "result" && (
          <div className="space-y-5 animate-fade-in">
            <Card className="shadow-card border-border/50 overflow-hidden">
              <div className="gradient-hero p-5 text-center">
                <Sparkles className="w-8 h-8 text-primary-foreground mx-auto mb-2" />
                <h2 className="text-xl font-black text-primary-foreground">نتائج التحليل الشامل</h2>
                <p className="text-primary-foreground/70 text-sm mt-1">{selectedChild?.name} • بناءً على {totalQuestions} سؤال</p>
              </div>
              <CardContent className="p-4">
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} tickLine={false} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  {categories.map((c) => (
                    <div key={c.key} className="text-center p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <c.icon className={cn("w-5 h-5 mx-auto mb-1", c.color)} />
                      <p className="text-[10px] text-muted-foreground">{c.label}</p>
                      <p className="text-base font-black text-foreground">{scores[c.key] || 0}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top strengths */}
            {topStrengths.length > 0 && (
              <Card className="shadow-card border-border/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-secondary" /> أبرز نقاط القوة
                  </h3>
                  <div className="flex gap-2">
                    {topStrengths.map((s, i) => (
                      <div key={s.key} className="flex-1 text-center p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                        <s.icon className={cn("w-5 h-5 mx-auto mb-1", s.color)} />
                        <p className="text-xs font-bold text-foreground">{s.label}</p>
                        <p className="text-lg font-black text-primary">{scores[s.key]}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">الرياضات المقترحة لـ {selectedChild?.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">مرتبة حسب التوافق مع قدرات وتفضيلات طفلك</p>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <Card key={i} className={cn(
                    "shadow-card border-border/50 transition-all overflow-hidden",
                    i === 0 && "border-primary/40 shadow-elevated"
                  )}>
                    {i === 0 && <div className="h-1.5 gradient-primary" />}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl",
                          i === 0 ? "gradient-primary" : i === 1 ? "bg-secondary/10" : "bg-muted"
                        )}>
                          {i === 0 ? <Trophy className="w-6 h-6 text-primary-foreground" /> : rec.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h4 className="font-bold text-foreground text-sm">{rec.emoji} {rec.name}</h4>
                            {i === 0 && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold animate-pulse">⭐ الأنسب</span>}
                            {i === 1 && <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">ممتاز</span>}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{rec.desc}</p>
                        </div>
                        <div className="text-left flex-shrink-0 min-w-[50px]">
                          <p className={cn("text-xl sm:text-2xl font-black", i === 0 ? "text-primary" : i === 1 ? "text-secondary" : "text-muted-foreground")}>{rec.pct}%</p>
                          <p className="text-[10px] text-muted-foreground">توافق</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-4 border border-border/40">
              <p className="text-xs text-muted-foreground leading-relaxed">
                💡 <strong className="text-foreground">ملاحظة:</strong> النتائج بناءً على تحليل القدرات البدنية والتفضيلات الشخصية لطفلك. ننصح بتجربة الرياضة الأولى والثانية ومراقبة استمتاع الطفل وتطوره.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button onClick={() => navigate("/dashboard")} className="flex-1 gradient-primary text-primary-foreground rounded-xl py-5 sm:py-6 press-effect text-sm">
                العودة للرئيسية
              </Button>
              <Button variant="outline" onClick={handleShare} className="rounded-xl py-5 sm:py-6 px-4 min-w-[48px]">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => {
                setPhase("select"); setCurrentQ(0); setAnswers([]);
                setPrefAnswers([]); setCurrentPrefQ(0);
                setScores({}); setRecommendations([]); setSelectedChild(null);
                setShowCategoryMsg(null);
              }} className="rounded-xl py-5 sm:py-6 px-4 min-w-[48px]">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const Assessment = () => (<AuthGuard><AssessmentContent /></AuthGuard>);
export default Assessment;
