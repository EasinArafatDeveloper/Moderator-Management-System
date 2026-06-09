"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, ShoppingCart, Award, PieChartIcon } from "lucide-react";

interface AnalyticsChartsProps {
  monthlyStats: Array<{ month: string; orders: number; revenue: number }>;
  topModerators: Array<{ name: string; points: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#ef4444"]; // Violet, Blue, Green, Red

export default function AnalyticsCharts({
  monthlyStats,
  topModerators,
  statusDistribution,
}: AnalyticsChartsProps) {
  // Format Tooltip for currency
  const formatTooltipValue = (value: any, name: any) => {
    if (name === "Revenue") return [`${Number(value).toLocaleString()} BDT`, name];
    return [value, name];
  };

  const hasStatusData = statusDistribution.some((item) => item.value > 0);
  const hasModData = topModerators.length > 0;
  const hasMonthlyData = monthlyStats.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Monthly Revenue & Orders Chart */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Monthly Orders & Revenue</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Overview of sales performance</p>
          </div>
        </div>
        
        <div className="h-72 w-full">
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                <XAxis dataKey="month" stroke="currentColor" className="text-[10px] text-muted-foreground" />
                <YAxis stroke="currentColor" className="text-[10px] text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "11px",
                  }}
                  formatter={formatTooltipValue}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-semibold">
              No sales history data found.
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Moderators Performance */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Top Moderator Points</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Moderator performance comparison</p>
          </div>
        </div>

        <div className="h-72 w-full">
          {hasModData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topModerators} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-muted-foreground truncate" />
                <YAxis stroke="currentColor" className="text-[10px] text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="points" name="Total Points" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {topModerators.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#8b5cf6" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-semibold">
              No moderators active yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. Order Status distribution (Pie Chart) */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm lg:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Order Status Distribution</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Proportions of pending, confirmed, delivered, cancelled</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Chart */}
          <div className="h-64 w-full md:col-span-2">
            {hasStatusData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution.filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution
                      .filter((item) => item.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-semibold">
                No orders submitted yet.
              </div>
            )}
          </div>

          {/* Legend Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground">Status Legend</h4>
            <div className="grid grid-cols-2 gap-4">
              {statusDistribution.map((item, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div>
                      <p className="text-[11px] font-bold text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {item.value} {item.value === 1 ? "order" : "orders"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
