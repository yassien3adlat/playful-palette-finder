import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("رابط غير صالح");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("تم تحديث كلمة المرور بنجاح");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

      {/* Floating orbs */}
      <div className="orb orb-primary w-72 h-72 -top-20 -right-20 animate-float-slow" />
      <div className="orb orb-accent w-48 h-48 bottom-20 -left-10 animate-float-delayed" />

      <div className="w-full max-w-md animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-lg)] border border-primary-foreground/10">
            {success ? <CheckCircle2 className="w-8 h-8 text-primary-foreground" /> : <Shield className="w-8 h-8 text-primary-foreground" />}
          </div>
          <h1 className="text-2xl font-black text-foreground">
            {success ? "تم بنجاح!" : "إعادة تعيين كلمة المرور"}
          </h1>
          {!success && <p className="text-sm text-muted-foreground mt-1.5">أدخل كلمة المرور الجديدة</p>}
        </div>

        <Card className="shadow-[var(--shadow-2xl)] border-border/30 backdrop-blur-sm bg-card/95">
          <CardContent className="p-6">
            {success ? (
              <div className="text-center py-8 animate-scale-in">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <p className="text-foreground font-bold text-lg">تم تحديث كلمة المرور</p>
                <p className="text-muted-foreground text-sm mt-1.5">جاري التحويل للوحة التحكم...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="كلمة المرور الجديدة"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 rounded-xl py-6 bg-muted/20 border-border/40 focus-visible:bg-background"
                    required
                    minLength={6}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 rounded-xl py-6 bg-muted/20 border-border/40 focus-visible:bg-background"
                    required
                    dir="ltr"
                  />
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-destructive font-medium animate-fade-in">كلمتا المرور غير متطابقتين</p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-primary text-primary-foreground rounded-xl py-6 press-effect shine-effect shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)] transition-shadow"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تحديث كلمة المرور"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
