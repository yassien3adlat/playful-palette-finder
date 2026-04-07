import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Search, Heart, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoCard } from "@/components/VideoCard";
import { videos, categories } from "@/data/videos";

function VideosContent() {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState("الكل");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const levels = ["الكل", "مبتدئ", "متوسط"];

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = videos.filter((v) => {
    const matchCat = activeCategory === "الكل" || v.category === activeCategory;
    const matchLevel = activeLevel === "الكل" || v.level === activeLevel;
    const matchSearch = !search || v.title.includes(search) || v.category.includes(search) || v.channel.includes(search);
    const matchFav = !showFavoritesOnly || favorites.has(v.id);
    return matchCat && matchSearch && matchLevel && matchFav;
  });

  const activeFiltersCount = (activeCategory !== "الكل" ? 1 : 0) + (activeLevel !== "الكل" ? 1 : 0) + (showFavoritesOnly ? 1 : 0);

  return (
    <Layout>
      <PageHeader title="فيديوهات تدريبية" backTo="/dashboard" />
      <div className="px-4 pb-24 space-y-3 max-w-2xl mx-auto">
        {/* Search + Filter Toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن فيديو..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 rounded-xl bg-muted/30 border-border/50 h-10 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-10 w-10 rounded-xl border flex items-center justify-center transition-all relative flex-shrink-0",
              showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 border-border/50 text-muted-foreground"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="space-y-2.5 animate-fade-in bg-muted/20 rounded-2xl p-3 border border-border/30">
            {/* Categories */}
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold mb-1.5 px-1">التصنيف</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant={activeCategory === c ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all press-effect",
                      activeCategory === c ? "gradient-primary text-primary-foreground border-transparent shadow-sm" : "hover:bg-muted bg-background"
                    )}
                    onClick={() => setActiveCategory(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold mb-1.5 px-1">المستوى</p>
              <div className="flex gap-1.5">
                {levels.map((l) => (
                  <Badge
                    key={l}
                    variant={activeLevel === l ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all press-effect",
                      activeLevel === l ? "bg-foreground text-background border-transparent" : "hover:bg-muted bg-background"
                    )}
                    onClick={() => setActiveLevel(l)}
                  >
                    {l === "الكل" ? "كل المستويات" : l}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Favorites */}
            {favorites.size > 0 && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all",
                  showFavoritesOnly ? "bg-rose-500 text-white" : "bg-background border border-border/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <Heart className="w-3 h-3" /> المفضلة ({favorites.size})
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length} فيديو
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setActiveCategory("الكل"); setActiveLevel("الكل"); setShowFavoritesOnly(false); }}
              className="text-[10px] text-primary font-semibold"
            >
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Video Grid - single column mobile, 2 cols tablet+ */}
        <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
          {filtered.map((video) => (
            <div key={video.id} className="relative">
              <VideoCard video={video} />
              <button
                onClick={() => toggleFavorite(video.id)}
                className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                aria-label={favorites.has(video.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              >
                <Heart className={cn("w-4 h-4", favorites.has(video.id) ? "text-rose-500 fill-rose-500" : "text-white")} />
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Play className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-semibold text-sm">لا توجد فيديوهات</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">جرب تغيير الفئة أو المستوى</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

const Videos = () => (<AuthGuard><VideosContent /></AuthGuard>);
export default Videos;
