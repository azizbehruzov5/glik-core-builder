import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:3rem_3rem]" />
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 animate-fade-in-up">
            <Zap className="mr-2 h-4 w-4 fill-primary" />
            AI-Powered Metabolism Tracking
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/50 to-white mb-6 max-w-4xl">
            Master Your Metabolism with <span className="text-primary">GLIK</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10">
            Real-time glycemic risk analysis and AI food scanning to optimize your health.
            Know what you eat before you eat it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/scan">
              <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                Start Scanning <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/50 hover:bg-primary/10 hover:text-primary">
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-background/50 border-t border-border/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-primary/20 backdrop-blur-sm hover:border-primary/50 transition-colors">
              <CardHeader>
                <Activity className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Monitor glucose trends with precision analytics and predictive modeling.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-secondary/20 backdrop-blur-sm hover:border-secondary/50 transition-colors">
              <CardHeader>
                <Zap className="h-10 w-10 text-secondary mb-4" />
                <CardTitle>AI Food Scanner</CardTitle>
                <CardDescription>
                  Instantly analyze nutritional content and glycemic impact by scanning food.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-primary/20 backdrop-blur-sm hover:border-primary/50 transition-colors">
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Health Insights</CardTitle>
                <CardDescription>
                  Get personalized recommendations tailored to your unique metabolic profile.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
