"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AssessmentBenchmarkChart({
  data,
}: {
  data: { handle: string; score: number; benchmark: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(270 22% 90%)" vertical={false} />
        <XAxis
          dataKey="handle"
          tick={{ fontSize: 11, fill: "hsl(271 14% 46%)" }}
          axisLine={{ stroke: "hsl(270 22% 90%)" }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "hsl(271 14% 46%)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(270 22% 90%)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="score" name="Score" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="benchmark" name="Archetype-benchmark" fill="hsl(271 50% 55%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
