"use client";

import React, { useEffect, useMemo, useState } from "react";

type ScanResult = {
  itemName: string;
  riskLevel: "Low" | "Medium" | "High";
  estimatedCarbs: number;
  impactScore: number;
  explanation: string;
  suggestions: string[];
};

function badgeClasses(risk: ScanResult["riskLevel"]) {
  if (risk === "Low") return "border-green-500/40 bg-green-500/10 text-green-200";
  if (risk === "High") return "border-red-500/40 bg-red-500/10 text-red-200";
  return "border-yellow-500/40 bg-yellow-500/10 text-yellow-100";
}
function actionPlan(risk: ScanResult["riskLevel"], carbs: number) {
  if (risk === "High") {
    return [
      { title: "Do now", items: ["Drink water", "Avoid more sugar for 2–3 hours", "Walk 10–15 minutes if possible"] },
      { title: "Next meal", items: ["Add vegetables/fiber", "Choose whole grains", "Pair carbs with protein"] },
      { title: "Monitoring", items: [`Recheck glucose if you monitor it`, `High carbs estimate: ~${carbs}g`] },
    ];
  }
  if (risk === "Medium") {
    return [
      { title: "Do now", items: ["Watch portion size", "Add protein/fiber to slow absorption", "Avoid sugary drinks"] },
      { title: "Next meal", items: ["Prefer complex carbs", "Add salad/vegetables first", "Limit sauces/sweets"] },
      { title: "Monitoring", items: [`Estimated carbs: ~${carbs}g`, "Note how you feel after 60–90 minutes"] },
    ];
  }
  return [
    { title: "Do now", items: ["Great choice — keep balance", "Stay hydrated", "Keep meal timing consistent"] },
    { title: "Next meal", items: ["Maintain protein + fiber", "Avoid unnecessary sugar snacks"] },
    { title: "Monitoring", items: [`Low carb estimate: ~${carbs}g`, "Track consistency over the day"] },
  ];
}


export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const fileLabel = useMemo(() => (file ? file.name : "No file selected"), [file]);

  // cleanup preview object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    setResult(null);

    const f = e.target.files?.[0] || null;
    setFile(f);

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  async function onScan() {
    setErr(null);
    setResult(null);

    if (!file) {
      setErr("Please choose an image first.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Scan failed");
      }

      setResult(data);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-4xl font-semibold tracking-tight">AI Food Scanner</h1>
      <p className="mt-2 text-sm text-white/60">
        Upload a food photo to estimate glycemic impact (MVP demo mode).
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* LEFT: Upload + Preview */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-medium">Upload image</div>
          <p className="mt-1 text-xs text-white/60">
            Tip: rename file to <b>salad.jpg</b> or <b>cola.png</b> to see different demo outcomes.
          </p>

          <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-black/20 p-4">
            <input
              type="file"
              accept="image/*"
              onChange={onPickFile}
              className="block w-full text-sm"
            />
            <div className="mt-2 text-xs text-white/60">{fileLabel}</div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mt-5">
              <div className="mb-2 text-sm text-white/70">Preview</div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected food"
                  className="h-64 w-full object-cover"
                />

                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm">
                      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-white/70" />
                      Scanning...
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={onScan}
            disabled={loading || !file}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan Food"}
          </button>

          {err && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}
        </section>

        {/* RIGHT: Result */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-medium">Result</div>

          {!result ? (
            <div className="mt-4 text-sm text-white/60">
              Upload an image and press <b>Scan Food</b> to see the result.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold">{result.itemName}</div>
                  <div className="mt-1 text-sm text-white/60">{result.explanation}</div>
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${badgeClasses(
                    result.riskLevel
                  )}`}
                >
                  {result.riskLevel} Risk
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/60">EST. CARBS</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {result.estimatedCarbs}g
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/60">IMPACT SCORE</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {result.impactScore}/100
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-medium">Suggestions</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                  {(result.suggestions || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-white/50">
                Demo note: current scan uses MVP rules (no external AI) to stay reliable without API quota.
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
