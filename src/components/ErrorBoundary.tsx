import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-background p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-sm animate-scale-in">
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-2 text-balance">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleRetry}
                className="gradient-primary text-primary-foreground rounded-xl"
              >
                <RefreshCw className="w-4 h-4 ml-1" />
                إعادة المحاولة
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="rounded-xl"
              >
                العودة للرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
