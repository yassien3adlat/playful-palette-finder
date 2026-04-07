export interface Video {
  id: string;
  title: string;
  category: string;
  duration: string;
  youtubeId: string;
  channel: string;
  level: string;
}

export const categories = ["الكل", "كرة القدم", "سباحة", "جمباز", "كاراتيه", "لياقة بدنية"];

// All videos verified Arabic-language content from YouTube
export const videos: Video[] = [
  // ===== كرة قدم - عربي =====
  { id: "1", title: "تعليم أفضل مهارات كرة القدم للأطفال والناشئين ⚽🔥", category: "كرة القدم", duration: "5:13", youtubeId: "hDbo1pjzAmE", channel: "عمر شلتوت", level: "مبتدئ" },
  { id: "2", title: "أساسيات كرة القدم للمبتدئين والمحترفين بالتفصيل", category: "كرة القدم", duration: "13:14", youtubeId: "9vmd4ruoaJk", channel: "عمر شلتوت", level: "مبتدئ" },
  { id: "3", title: "تعلم تمرير الكرة بالوجه الداخلي بقوة وبدقة", category: "كرة القدم", duration: "13:07", youtubeId: "Wp38lwABgc0", channel: "عمر شلتوت", level: "متوسط" },
  { id: "4", title: "تعلم مهارة استعراضية لرفع الكرة ستبهر بها أصدقائك", category: "كرة القدم", duration: "0:57", youtubeId: "FN0kRsYg6lk", channel: "أحمد البيريني", level: "متوسط" },
  { id: "5", title: "تمارين دريبل والتحكم بالكرة للأطفال", category: "كرة القدم", duration: "4:13", youtubeId: "hXcgw7U6qCw", channel: "أكاديمية كرة القدم", level: "مبتدئ" },
  { id: "6", title: "5 تمارين أساسية لمهارات القدم للناشئين", category: "كرة القدم", duration: "9:02", youtubeId: "tBV9Ul1a7Pw", channel: "تدريبات الناشئين", level: "مبتدئ" },
  { id: "25", title: "تعلم التسديد القوي والدقيق بـ 3 خطوات بسيطة", category: "كرة القدم", duration: "8:45", youtubeId: "5UEMEDTKKDs", channel: "عمر شلتوت", level: "متوسط" },

  // ===== سباحة - عربي =====
  { id: "7", title: "تعليم السباحة (1) - الطفو وتنظيم النفس والتعود على الماء", category: "سباحة", duration: "10:32", youtubeId: "WCV19_VSEuQ", channel: "مصعب الشاعر", level: "مبتدئ" },
  { id: "8", title: "تعليم السباحة (2) - الانزلاق في الماء", category: "سباحة", duration: "7:01", youtubeId: "EHBOSY12hyo", channel: "مصعب الشاعر", level: "مبتدئ" },
  { id: "9", title: "السباحة للمبتدئين - الخوف من الماء والطفو والانزلاق", category: "سباحة", duration: "7:54", youtubeId: "KmOe1NEWgZQ", channel: "SWIM WELL", level: "مبتدئ" },
  { id: "10", title: "تعليم السباحة # تحدي القفز 🔥🏊‍♂️", category: "سباحة", duration: "8:41", youtubeId: "4jVK1htQfdM", channel: "مصعب الشاعر", level: "متوسط" },
  { id: "11", title: "تعليم السباحة للأطفال - مهارة الوقوف في المياه", category: "سباحة", duration: "0:26", youtubeId: "3sDTX7lnDGk", channel: "تدريب سباحة", level: "مبتدئ" },
  { id: "12", title: "كيف يسبح الطفل الرضيع لوحده؟ 👶🏊", category: "سباحة", duration: "8:14", youtubeId: "s9n3MbOiy2o", channel: "كريم السيد", level: "مبتدئ" },
  { id: "26", title: "تعليم السباحة (3) - سباحة الصدر خطوة بخطوة", category: "سباحة", duration: "9:15", youtubeId: "KP8M-_IVKHE", channel: "مصعب الشاعر", level: "متوسط" },

  // ===== جمباز - عربي =====
  { id: "13", title: "تدريب جمباز للمبتدئين 🤸‍♀️ خطوة بخطوة", category: "جمباز", duration: "7:10", youtubeId: "b7g1WNfrdOg", channel: "سلمى سليم", level: "مبتدئ" },
  { id: "14", title: "تعلم أساس الجمباز - الدحرجة الخلفية", category: "جمباز", duration: "6:38", youtubeId: "5AN0Xja82yQ", channel: "كابتن أحمد حسين", level: "مبتدئ" },
  { id: "15", title: "تعلم أساس الجمباز مع الكوتش مايا نعمة 🤸‍♀️", category: "جمباز", duration: "17:24", youtubeId: "k4EyNn32AGI", channel: "مايا نعمة", level: "مبتدئ" },
  { id: "16", title: "تعليم أسهل 5 حركات جمباز للمبتدئين في البيت", category: "جمباز", duration: "14:06", youtubeId: "kIAZ4jj4LAg", channel: "X-ONE TEAM", level: "مبتدئ" },
  { id: "17", title: "تعليم حركة القبة - جمباز للمبتدئين في المنزل", category: "جمباز", duration: "7:25", youtubeId: "AMkmt432D6c", channel: "حكايات جنى", level: "متوسط" },
  { id: "27", title: "تعلم الوقوف على اليدين بسهولة - جمباز أطفال", category: "جمباز", duration: "10:30", youtubeId: "QTJfuVRGNqA", channel: "سلمى سليم", level: "متوسط" },

  // ===== كاراتيه - عربي =====
  { id: "18", title: "حصة تدريبية كاملة للكاراتيه مع الأطفال", category: "كاراتيه", duration: "21:04", youtubeId: "zuILA_D6p0U", channel: "Sensei Elalaoui", level: "مبتدئ" },
  { id: "19", title: "كاراتيه أطفال - بونكاي وحركات الكاتا الأولى", category: "كاراتيه", duration: "0:20", youtubeId: "-5uxwSZuFTI", channel: "أبوبكر كاراتيه", level: "مبتدئ" },
  { id: "20", title: "هيا نتعلم الكاراتيه | جاد الصغير يتعلم الدفاع عن النفس", category: "كاراتيه", duration: "21:05", youtubeId: "2OtEx_AwTuU", channel: "الملاك الصغير", level: "مبتدئ" },
  { id: "21", title: "هيا نتعلم الكاراتيه | أغاني تعليمية للأطفال بالعربي 🥋", category: "كاراتيه", duration: "32:12", youtubeId: "0DC3FMGv__Y", channel: "الملاك الصغير", level: "مبتدئ" },
  { id: "28", title: "تعلم اللكمات والركلات الأساسية في الكاراتيه", category: "كاراتيه", duration: "15:30", youtubeId: "7VuKWpb7yPI", channel: "Sensei Elalaoui", level: "متوسط" },

  // ===== لياقة بدنية - عربي =====
  { id: "22", title: "تمارين رياضية ممتعة للأطفال في المنزل 🏠💪", category: "لياقة بدنية", duration: "15:00", youtubeId: "L_A_HjHZxfI", channel: "رياضة الأطفال", level: "مبتدئ" },
  { id: "23", title: "أغاني أطفال بالعربي - هيا نمارس الرياضة ⚽🎶", category: "لياقة بدنية", duration: "28:30", youtubeId: "rPIsLDKnMf8", channel: "HeyKids Arabic", level: "مبتدئ" },
  { id: "29", title: "تمارين إحماء وتمديد ممتعة للأطفال قبل الرياضة", category: "لياقة بدنية", duration: "8:00", youtubeId: "r4OJ2HoJv0c", channel: "رياضة صحية", level: "مبتدئ" },
  { id: "30", title: "تمارين القوة والتوازن للأطفال - 10 دقائق", category: "لياقة بدنية", duration: "10:15", youtubeId: "88gHBqWm7aM", channel: "Fitness Kids", level: "متوسط" },
];
