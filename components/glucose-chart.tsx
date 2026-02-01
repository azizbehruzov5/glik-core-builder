'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const defaultData = [
    { time: "08:00", value: 95 },
    { time: "09:00", value: 110 },
    { time: "10:00", value: 140 }, // Spike after breakfast
    { time: "11:00", value: 120 },
    { time: "12:00", value: 105 },
    { time: "13:00", value: 135 }, // Lunch
    { time: "14:00", value: 125 },
    { time: "15:00", value: 110 },
    { time: "16:00", value: 100 },
];

interface GlucoseChartProps {
    data?: { time: string | number; value: number }[];
    title?: string;
    description?: string;
}

export function GlucoseChart({ data = defaultData, title = "Glucose Trend (Today)", description = "Real-time sensor data simulation." }: GlucoseChartProps) {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="time"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value: number) => `${value} mg/dL`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    borderColor: "var(--border)",
                                    borderRadius: "8px",
                                    color: "var(--popover-foreground)",
                                }}
                                itemStyle={{ color: "var(--foreground)" }}
                                labelStyle={{ color: "var(--muted-foreground)" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: "var(--primary)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
