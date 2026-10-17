"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { compactCurrency } from "@/lib/format";

export function PipelineAreaChart({ data }: { data: { stage: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="pipelineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(25 95% 53%)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(25 95% 53%)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(270 22% 90%)" vertical={false} />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 12, fill: "hsl(271 14% 46%)" }}
          axisLine={{ stroke: "hsl(270 22% 90%)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => compactCurrency(v)}
          tick={{ fontSize: 12, fill: "hsl(271 14% 46%)" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip
          formatter={(value) => compactCurrency(Number(value))}
          contentStyle={{
            borderRadius: 8,
            borderColor: "hsl(270 22% 90%)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(25 95% 53%)"
          strokeWidth={2}
          fill="url(#pipelineFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
