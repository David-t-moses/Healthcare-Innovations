"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector, Cell, Tooltip } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ChartConfig, ChartContainer, ChartStyle } from "@/components/ui/chart";

interface ExpenseItem {
  category: string;
  amount: number;
}

const COLORS = [
  "#2563eb", // blue-600
  "#334155", // slate-700
  "#f87171", // red-400
  "#4ade80", // green-400
  "#a78bfa", // purple-400
  "#fbbf24", // amber-400
  "#64748b", // slate-500
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
  "#94a3b8", // slate-400
  "#cbd5e1", // slate-300
];

const desktopData = [
  { month: "january", desktop: 186, fill: COLORS[0] },
  { month: "february", desktop: 305, fill: COLORS[1] },
  { month: "march", desktop: 237, fill: COLORS[2] },
  { month: "april", desktop: 173, fill: COLORS[3] },
  { month: "may", desktop: 209, fill: COLORS[4] },
];

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop" },
  mobile: { label: "Mobile" },
  january: { label: "January", color: COLORS[0] },
  february: { label: "February", color: COLORS[1] },
  march: { label: "March", color: COLORS[2] },
  april: { label: "April", color: COLORS[3] },
  may: { label: "May", color: COLORS[4] },
} satisfies ChartConfig;

const isDarkColor = (color: string) => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 < 128;
  }
  return false;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = data.payload.total;
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm text-xs">
        <p className="font-medium">{data.name}</p>
        <p className="text-gray-700">{`Amount: ${data.value.toLocaleString()}`}</p>
        <p className="text-blue-600 font-medium">{`${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  fill,
}: any) => {
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percentValue = (percent * 100).toFixed(0);
  const textColor = isDarkColor(fill) ? "white" : "#334155";

  return (
    <text
      x={x}
      y={y}
      fill={textColor}
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[9px] font-medium"
      style={{
        textShadow:
          textColor === "white"
            ? "0px 0px 2px rgba(0,0,0,0.8)"
            : "0px 0px 2px rgba(255,255,255,0.8)",
        fontWeight: 600,
      }}
    >
      {`${percentValue}%`}
    </text>
  );
};

export function PieChartInteractive({
  expenses = [],
}: {
  expenses?: ExpenseItem[];
}) {
  const id = "pie-interactive";

  const chartData =
    expenses.length > 0
      ? expenses.map((item, index) => ({
          name: item.category,
          value: item.amount,
          fill: COLORS[index % COLORS.length],
        }))
      : desktopData.map((item, index) => ({
          name: item.month,
          value: item.desktop,
          fill: COLORS[index % COLORS.length],
        }));

  const [activeIndex, setActiveIndex] = React.useState(0);

  const total = React.useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  const enhancedChartData = chartData.map((item) => ({
    ...item,
    total,
  }));

  return (
    <div data-chart={id} className="w-full h-full">
      <ChartStyle id={id} config={chartConfig} />
      <ChartContainer
        id={id}
        config={chartConfig}
        className="mx-auto aspect-square w-full h-full"
      >
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={enhancedChartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={80}
            strokeWidth={2}
            stroke="#ffffff"
            paddingAngle={3}
            activeIndex={activeIndex}
            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
              <g>
                <Sector {...props} outerRadius={outerRadius + 10} />
                <Sector
                  {...props}
                  outerRadius={outerRadius + 25}
                  innerRadius={outerRadius + 12}
                  stroke="#ffffff"
                />
              </g>
            )}
            onClick={(_, index) => {
              setActiveIndex(index);
            }}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {enhancedChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                const value =
                  activeIndex !== -1
                    ? chartData[activeIndex]?.value || 0
                    : total;
                const percentage =
                  activeIndex !== -1 && total > 0
                    ? ((value / total) * 100).toFixed(1)
                    : "100.0";

                return (
                  <g>
                    <circle
                      cx={viewBox.cx}
                      cy={viewBox.cy}
                      r={55}
                      fill="white"
                      opacity={0.9}
                    />
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 10}
                        className="fill-gray-900 text-xl font-bold"
                      >
                        {value.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 15}
                        className="fill-blue-600 text-sm font-semibold"
                      >
                        {percentage}%
                      </tspan>
                    </text>
                  </g>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
