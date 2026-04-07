import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, LocateFixed, Filter, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CenterCard } from "@/components/CenterCard";
import { centers, regions, getDistanceKm } from "@/data/centers";

function CentersContent() {
  const [activeRegion, setActiveRegion] = useState("الكل");
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [activeSport, setActiveSport] = useState("الكل");
  const [trialOnly, setTrialOnly] = useState(false);

  const allSports = useMemo(() => ["الكل", ...Array.from(new Set(centers.flatMap(c => c.sports)))], []);
  const avgRating = useMemo(() => (centers.reduce((s, c) => s + c.rating, 0) / centers.length).toFixed(1), []);
  const trialCount = useMemo(() => centers.filter(c => c.hasTrial).length, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const filtered = useMemo(() => centers
    .filter((c) => {
      const matchRegion = activeRegion === "الكل" || c.region === activeRegion;
      const matchSport = activeSport === "الكل" || c.sports.includes(activeSport);
      const matchSearch =
        !search || c.name.includes(search) || c.sports.some((s) => s.includes(search)) || c.address.includes(search);
      const matchTrial = !trialOnly || c.hasTrial;
      return matchRegion && matchSearch && matchSport && matchTrial;
    })
    .map((c) => ({
      ...c,
      distance: userLocation ? getDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng) : null,
    }))
    .sort((a, b) => {
      if (sortByDistance && a.distance != null && b.distance != null) return a.distance - b.distance;
      return b.rating - a.rating;
    }), [activeRegion, activeSport, search, userLocation, sortByDistance, trialOnly]);

  return (
    <Layout>
      <PageHeader title="أماكن التدريب" backTo="/dashboard" />
      <div className="container mx-auto px-4 pb-8 space-y-4">
        {/* Hero Stats */}
        <Card className="shadow-[var(--shadow-lg)] border-border/30 overflow-hidden">
          <div className="gradient-hero p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-20 h-20 rounded-full bg-primary-foreground/[0.03]" />
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-primary-foreground/10 shadow-[var(--shadow-md)] relative">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-black text-primary-foreground relative">دليل الأكاديميات</h2>
            <p className="text-primary-foreground/70 text-xs mt-1 relative">أفضل مراكز التدريب في مصر</p>
          </div>
          <CardContent className="p-3">
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-lg font-black text-foreground">{centers.length}</p>
                <p className="text-[10px] text-muted-foreground">أكاديمية</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-lg font-black text-foreground">{new Set(centers.flatMap(c => c.sports)).size}</p>
                <p className="text-[10px] text-muted-foreground">رياضة</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-lg font-black text-foreground">{regions.length - 1}</p>
                <p className="text-[10px] text-muted-foreground">منطقة</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <p className="text-lg font-black text-foreground">{avgRating}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">متوسط</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search + Location */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن أكاديمية أو رياضة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 rounded-xl bg-muted/30 border-border/50 h-11"
            />
          </div>
          <Button
            size="icon"
            variant={sortByDistance ? "default" : "outline"}
            className={cn(
              "rounded-xl h-11 w-11 flex-shrink-0 transition-all",
              sortByDistance && "gradient-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => {
              if (!userLocation) requestLocation();
              else setSortByDistance(!sortByDistance);
            }}
            aria-label="ترتيب حسب الأقرب"
          >
            {locating ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
          </Button>
        </div>

        {sortByDistance && userLocation && (
          <p className="text-xs text-primary flex items-center gap-1.5 font-semibold bg-primary/5 rounded-lg px-3 py-1.5 w-fit border border-primary/10">
            <LocateFixed className="w-3.5 h-3.5" /> مرتبة حسب الأقرب إليك
          </p>
        )}

        {/* Sport Filter */}
        <div>
          <p className="text-[11px] text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" /> فلتر حسب الرياضة
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
            {allSports.map((s) => (
              <Badge
                key={s}
                variant={activeSport === s ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-[11px] font-semibold transition-all press-effect min-h-[36px]",
                  activeSport === s ? "gradient-primary text-primary-foreground border-transparent shadow-sm" : "hover:bg-muted"
                )}
                onClick={() => setActiveSport(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div>
          <p className="text-[11px] text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> فلتر حسب المنطقة
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
            {regions.map((r) => {
              const count = r === "الكل" ? centers.length : centers.filter(c => c.region === r).length;
              return (
                <Badge
                  key={r}
                  variant={activeRegion === r ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-[11px] font-semibold transition-all press-effect min-h-[36px]",
                    activeRegion === r ? "bg-foreground text-background border-transparent" : "hover:bg-muted"
                  )}
                  onClick={() => setActiveRegion(r)}
                >
                  {r} ({count})
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Trial only filter */}
        <Badge
          variant={trialOnly ? "default" : "outline"}
          className={cn(
            "cursor-pointer rounded-full px-3.5 py-2 text-[11px] font-semibold transition-all press-effect w-fit min-h-[36px]",
            trialOnly ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-muted"
          )}
          onClick={() => setTrialOnly(!trialOnly)}
        >
          🎯 تجربة مجانية فقط ({trialCount})
        </Badge>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          عرض <span className="text-foreground font-bold">{filtered.length}</span> أكاديمية
        </p>

        {/* Centers List */}
        <div className="space-y-3">
          {filtered.map((center, i) => (
            <CenterCard key={i} center={center} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-semibold">لا توجد نتائج</p>
            <p className="text-xs text-muted-foreground/60 mt-1">جرب تغيير المنطقة أو الرياضة أو كلمة البحث</p>
          </div>
        )}

        {/* Tip */}
        <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3 border border-primary/10">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">نصيحة:</strong> ابحث عن الأكاديميات التي تقدم تجربة مجانية وزُرها مع طفلك قبل التسجيل للتأكد من مناسبتها.
          </p>
        </div>
      </div>
    </Layout>
  );
}

const Centers = () => (
  <AuthGuard>
    <CentersContent />
  </AuthGuard>
);
export default Centers;
