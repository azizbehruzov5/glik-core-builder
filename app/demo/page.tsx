"use client";

import { useMemo, useState } from "react";
import { GlucoseChart } from "@/components/glucose-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, Info } from "lucide-react";

interface PredictionResult {
  riskLevel: "Low" | "Medium" | "High";
  score: number;
  reasons: string[];
  projectedTrend: { t: number; value: number }[];
}

type MoodMeta = {
  label: string;
  emoji: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getMoodMeta(mood0to10: number): MoodMeta {
  const m = clamp(Math.round(mood0to10), 0, 10);
  // 0-1, 2-3, 4-5, 6-7, 8-10
  if (m <= 1) return { label: "depressed", emoji: "😭" };
  if (m <= 3) return { label: "sad", emoji: "😔" };
  if (m <= 5) return { label: "neutral", emoji: "😐" };
  if (m <= 7) return { label: "happy", emoji: "🙂" };
  return { label: "blissful", emoji: "😄" };
}

export default function DemoPage() {
  // Form State
  const [formData, setFormData] = useState({
    glucose: 105,
    insulin: 0,
    carbs: 45,
    activity: 5,
    stress: 3,
    mood: 8,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch prediction");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Helper for risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "High":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const moodMeta = useMemo(() => getMoodMeta(formData.mood), [formData.mood]);

  // Bubble positioning: percent 0..100
  const moodPercent = useMemo(() => {
    const m = clamp(formData.mood, 0, 10);
    return (m / 10) * 100;
  }, [formData.mood]);

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Glycemic Risk Analysis
            </h1>
            <p className="text-muted-foreground">
              Monitor real-time glucose stability and predict future trends.
            </p>
          </div>
        </div>

        {/* Main Input & Results Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Column */}
          <Card className="lg:col-span-1 border-primary/10">
            <CardHeader>
              <CardTitle>Input Metrics</CardTitle>
              <CardDescription>Enter current health data</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  name="glucose"
                  value={formData.glucose}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Insulin (units)
                  </label>
                  <input
                    type="number"
                    name="insulin"
                    value={formData.insulin}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Activity (0-10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.activity}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Stress (0-10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  name="stress"
                  value={formData.stress}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.stress}
                </div>
              </div>

              {/* ✅ MOOD upgraded UI */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">
                    Mood (0-10)
                  </label>

                  {/* right side emoji + label */}
                  <div className="flex items-center gap-2">
                    <div className="text-xl leading-none">{moodMeta.emoji}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {moodMeta.label}
                    </div>
                  </div>
                </div>

                {/* slider wrapper so bubble can position */}
                <div className="relative pt-8">
                  {/* bubble */}
                  <div
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${moodPercent}%` }}
                  >
                    <div className="relative rounded-full bg-green-500/90 px-3 py-1 text-xs font-semibold text-black shadow">
                      {moodMeta.label}
                      {/* little pointer */}
                      <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-green-500/90" />
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    name="mood"
                    value={formData.mood}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div className="text-xs text-muted-foreground text-right">
                  {formData.mood}
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "Analyzing..." : "Calculate Risk"}
              </Button>

              {error && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results / Dashboard Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card/50 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Glucose
                  </CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {formData.glucose} mg/dL
                  </div>
                  <p className="text-xs text-muted-foreground">Input Value</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Daily Net Carbs
                  </CardTitle>
                  <Activity className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {formData.carbs}g
                  </div>
                  <p className="text-xs text-muted-foreground">Recent Meal</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      result ? getRiskColor(result.riskLevel) : ""
                    }`}
                  >
                    {result ? `${result.score}/100` : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result ? result.riskLevel : "Waiting for input"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            {result ? (
              <GlucoseChart
                data={result.projectedTrend}
                title="Projected Glucose Trend"
                description={`Projection based on ${result.riskLevel} risk factors.`}
              />
            ) : (
              <GlucoseChart
                title="Historical Data"
                description="Select 'Calculate Risk' to see projection."
              />
            )}

            {/* Reasons */}
            {result && result.reasons.length > 0 && (
              <Card className="border-muted bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg">Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.reasons.map((reason, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-500" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
