import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Star, Navigation, ExternalLink, Users, Banknote, Share2, MessageCircle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Center, sportIcons } from "@/data/centers";
import { cn } from "@/lib/utils";

interface CenterCardProps {
  center: Center & { distance?: number | null };
}

export function CenterCard({ center }: CenterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `🏟️ ${center.name}\n📍 ${center.address}\n⭐ ${center.rating}/5\n🏅 ${center.sports.join("، ")}\n📞 ${center.phone}\n${center.priceRange ? `💰 ${center.priceRange}\n` : ""}🗺️ https://maps.google.com/maps?q=${center.lat},${center.lng}`;
    if (navigator.share) {
      try { await navigator.share({ title: center.name, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const phone = center.phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`مرحباً، أريد الاستفسار عن التسجيل في ${center.name} 🏅`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <Card className="group card-premium border-border/30 overflow-hidden bg-card/80">
      <CardContent className="p-0">
        <div className="h-1 gradient-primary opacity-70 group-hover:opacity-100 transition-opacity" />
        
        <div className="p-4 sm:p-5 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="font-bold text-foreground text-[15px] leading-tight">{center.name}</h3>
                {center.hasTrial && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-bold whitespace-nowrap border border-primary/10">
                    🎯 تجربة مجانية
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/50" />
                <span className="line-clamp-1">{center.address}</span>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5 rounded-2xl flex-shrink-0 border border-amber-200/40 dark:border-amber-500/15 shadow-[var(--shadow-xs)]">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-black text-amber-700 dark:text-amber-400">{center.rating}</span>
            </div>
          </div>

          {/* Distance */}
          {center.distance != null && (
            <p className="text-xs text-primary font-bold flex items-center gap-1.5 bg-primary/5 rounded-xl px-3 py-1.5 w-fit border border-primary/8">
              <Navigation className="w-3.5 h-3.5" />
              {center.distance < 1
                ? `${Math.round(center.distance * 1000)} متر`
                : `${center.distance.toFixed(1)} كم`}
            </p>
          )}

          {/* Sports chips */}
          <div className="flex flex-wrap gap-1.5">
            {center.sports.map((sport) => (
              <span key={sport} className="px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-[11px] font-medium flex items-center gap-1 border border-border/30 hover:border-primary/20 transition-colors">
                <span className="text-sm">{sportIcons[sport] || "🏅"}</span> {sport}
              </span>
            ))}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {center.hours}
            </span>
            {center.ageRange && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {center.ageRange}
              </span>
            )}
            {center.priceRange && (
              <span className="flex items-center gap-1.5 text-primary font-bold">
                <Banknote className="w-3.5 h-3.5" /> {center.priceRange}
              </span>
            )}
          </div>

          {/* Expandable details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-primary font-bold flex items-center gap-1.5 hover:underline underline-offset-2 min-h-[44px] py-2"
          >
            {expanded ? "إخفاء التفاصيل" : "المزيد من التفاصيل"}
            <div className={cn("w-5 h-5 rounded-md bg-primary/8 flex items-center justify-center transition-transform", expanded && "rotate-180")}>
              <ChevronDown className="w-3 h-3" />
            </div>
          </button>

          {expanded && (
            <div className="space-y-2.5 animate-fade-in bg-muted/20 rounded-2xl p-4 border border-border/20">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <a href={`tel:${center.phone}`} className="text-foreground font-medium hover:text-primary transition-colors" dir="ltr">{center.phone}</a>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{center.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">📍 المنطقة:</span>
                <span className="text-foreground font-medium">{center.region}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1 flex-wrap">
            <Button
              size="sm"
              className="flex-1 min-w-[100px] gradient-primary text-primary-foreground rounded-xl text-xs h-11 press-effect shadow-soft shine-effect"
              onClick={() => window.open(`https://maps.google.com/maps?q=${center.lat},${center.lng}`)}
            >
              <Navigation className="w-3.5 h-3.5 ml-1.5" /> خريطة
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-11 w-11 border-border/40 hover:border-emerald-400 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all"
              onClick={handleWhatsApp}
              aria-label="تواصل عبر واتساب"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-11 w-11 border-border/40 hover:border-primary/30 transition-all"
              onClick={handleShare}
              aria-label="مشاركة"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
            </Button>
            {center.website && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-xs h-11 w-11 border-border/40 hover:border-primary/30 transition-all"
                onClick={() => window.open(center.website, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
