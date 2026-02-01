import { NextResponse } from "next/server";

type RiskLevel = "Low" | "Medium" | "High";

function classifyByFilename(filename: string) {
  const name = (filename || "").toLowerCase();

  if (name.includes("salad")) {
    return {
      itemName: "Salad",
      riskLevel: "Low" as RiskLevel,
      estimatedCarbs: 10,
      impactScore: 21,
      explanation: "Very low impact.",
      suggestions: [
        "Great choice for stable glucose.",
        "Add lean protein for satiety.",
        "Keep dressing sugar-free if possible.",
      ],
    };
  }

  if (name.includes("soda") || name.includes("cola")) {
    return {
      itemName: "Soda Can",
      riskLevel: "High" as RiskLevel,
      estimatedCarbs: 40,
      impactScore: 84,
      explanation: "High glycemic index, liquid sugar.",
      suggestions: [
        "Switch to water or zero-sugar options.",
        "Pair carbs with fiber/protein if you must.",
        "Take a short walk after drinking to reduce spikes.",
      ],
    };
  }

  return {
    itemName: "Unknown meal",
    riskLevel: "Medium" as RiskLevel,
    estimatedCarbs: 25,
    impactScore: 50,
    explanation: "Moderate carbs detected.",
    suggestions: [
      "Consider adding vegetables/fiber to reduce spikes.",
      "Watch portion size and added sugars.",
      "A 10–15 min walk after eating can help.",
    ],
  };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing file field "image" (multipart/form-data).' },
        { status: 400 }
      );
    }

    // MVP: classify by filename only (no external AI calls)
    const result = classifyByFilename(file.name);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
