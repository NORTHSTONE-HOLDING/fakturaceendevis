"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: { month: string; revenue: number; expenses: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(38,52%,50%)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(38,52%,50%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(220,14%,40%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(220,14%,40%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="hsl(220,9%,46%)"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="hsl(220,9%,46%)"
          width={64}
          tickFormatter={(v: number) =>
            new Intl.NumberFormat("cs-CZ", { notation: "compact" }).format(v)
          }
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid hsl(220,13%,91%)",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(38,52%,50%)"
          strokeWidth={2.5}
          fill="url(#rev)"
          name="Revenue"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="hsl(220,14%,40%)"
          strokeWidth={2}
          fill="url(#exp)"
          name="Expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
