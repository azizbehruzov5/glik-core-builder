import { NextResponse } from 'next/server';

interface PredictRequest {
    glucose: number; // mg/dL
    insulin: number; // units
    carbs: number; // grams
    activity: number; // 0-10
    stress: number; // 0-10
    mood: number; // 0-10
}

interface TrendPoint {
    t: number;
    value: number;
}

interface PredictResponse {
    riskLevel: 'Low' | 'Medium' | 'High';
    score: number;
    reasons: string[];
    projectedTrend: TrendPoint[];
}

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();

        // 1. Validation
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { glucose, insulin, carbs, activity, stress, mood } = body as PredictRequest;

        const errors: string[] = [];
        if (typeof glucose !== 'number' || glucose < 0) errors.push('Glucose must be a non-negative number');
        if (typeof insulin !== 'number' || insulin < 0) errors.push('Insulin must be a non-negative number');
        if (typeof carbs !== 'number' || carbs < 0) errors.push('Carbs must be a non-negative number');
        if (typeof activity !== 'number' || activity < 0 || activity > 10) errors.push('Activity must be 0-10');
        if (typeof stress !== 'number' || stress < 0 || stress > 10) errors.push('Stress must be 0-10');
        if (typeof mood !== 'number' || mood < 0 || mood > 10) errors.push('Mood must be 0-10');

        if (errors.length > 0) {
            return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
        }

        // 2. Risk scoring (deterministic & explainable)
        let score = 0;
        const reasons: string[] = [];

        // Glucose logic
        if (glucose < 80) {
            score += 20;
            reasons.push('Glucose is low (<80 mg/dL)');
        } else if (glucose >= 80 && glucose <= 140) {
            score += 5;
            // reasons.push('Glucose is in optimal range (80-140 mg/dL)'); // Usually we list negative risks or notable factors
        } else if (glucose >= 141 && glucose <= 180) {
            score += 20;
            reasons.push('Glucose is elevated (141-180 mg/dL)');
        } else { // > 180
            score += 35;
            reasons.push('Glucose is very high (>180 mg/dL)');
        }

        // Carbs logic
        if (carbs <= 20) {
            score += 5;
        } else if (carbs <= 60) {
            score += 20;
            reasons.push('Moderate carb intake (21-60g)');
        } else { // > 60
            score += 35;
            reasons.push('High carb intake (>60g)');
        }

        // Activity logic
        if (activity > 0) {
            const activityReduction = activity * 2;
            score -= activityReduction;
            if (activityReduction > 5) reasons.push(`Activity level ${activity} reduced risk`);
        }

        // Stress logic
        if (stress > 0) {
            const stressAddition = stress * 2;
            score += stressAddition;
            if (stressAddition > 5) reasons.push(`Stress level ${stress} increased risk`);
        }

        // Insulin logic
        if (insulin > 0) {
            const insulinReduction = insulin * 1.5;
            score -= insulinReduction;
            reasons.push(`Insulin dose (${insulin}u) mitigating risk`);
        }

        // Mood logic
        // mood: score += (5 - mood) * 1
        // High mood (good) reduces score (e.g. 10 -> 5-10 = -5)
        // Low mood (bad) increases score (e.g. 0 -> 5-0 = +5)
        const moodImpact = (5 - mood) * 1;
        score += moodImpact;
        if (moodImpact > 0) {
            reasons.push('Low mood contributing to risk');
        }

        // Clamp score
        if (score < 0) score = 0;
        if (score > 100) score = 100;

        // 3. Risk Level
        let riskLevel: 'Low' | 'Medium' | 'High';
        if (score <= 29) {
            riskLevel = 'Low';
        } else if (score <= 69) {
            riskLevel = 'Medium';
        } else {
            riskLevel = 'High';
        }

        // 4. Projected Trend
        // 7 points: t = 0,10,20,30,40,50,60
        // Base value = glucose
        // Trend logic alignment:
        // Carbs increase glucose over time
        // Insulin decreases glucose over time
        // Activity decreases glucose over time
        // Stress increases glucose slightly

        // Net per-minute change factor (simplified)
        // This is just a simulation for the trend line visuals
        const carbFactor = carbs * 0.5; // +0.5 mg/dL per gram per hour roughly distributed? Let's just say a factor.
        const insulinFactor = insulin * -3; // Strong downward pull
        const activityFactor = activity * -2;
        const stressFactor = stress * 1;

        // Total net change rate estimation
        // We want the trend to look somewhat realistic relative to the inputs.
        // Let's spread this change over the hour (60 mins).
        // The specific numbers here are heuristic to make the chart look reasonable based on the prompt's request for "Trend logic should align".
        const netTrendMagnitude = (carbFactor + insulinFactor + activityFactor + stressFactor);

        const projectedTrend: TrendPoint[] = [];

        for (let t = 0; t <= 60; t += 10) {
            // Simple linear projection + some small noise or curve could be nice, but linear to start with net trend
            // t/60 gives the fraction of the hour
            const change = netTrendMagnitude * (t / 10); // Arbitrary scaling for 10-min intervals
            let predictedValue = glucose + change;

            // Sanity clamp for physiological limits in projection
            if (predictedValue < 40) predictedValue = 40;
            if (predictedValue > 400) predictedValue = 400;

            projectedTrend.push({
                t,
                value: Math.round(predictedValue)
            });
        }

        const response: PredictResponse = {
            riskLevel,
            score: Math.round(score), // Ensure integer return if floats crept in
            reasons,
            projectedTrend
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
