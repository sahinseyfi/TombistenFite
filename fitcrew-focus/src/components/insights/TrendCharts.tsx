"use client";

import type { ProgressInsights } from "@/server/insights/progress";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type TrendChartsProps = {
  weeklySeries: ProgressInsights["weeklySeries"];
  monthlySeries: ProgressInsights["monthlySeries"];
};

function formatWeight(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  return Number.parseFloat(value.toFixed(1));
}

function formatWaist(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  return Number.parseFloat(value.toFixed(1));
}

const axisFont = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };

function formatWeekLabel(period: string) {
  const [year, week] = period.split("-W");
  if (!week) {
    return period;
  }
  return `W${week}`;
}

function formatMonthLabel(period: string) {
  const [year, month] = period.split("-");
  if (!month) {
    return period;
  }
  return `${month}.${year.slice(2)}`;
}

export default function TrendCharts({ weeklySeries, monthlySeries }: TrendChartsProps) {
  const weeklyData = weeklySeries.map((item) => ({
    period: formatWeekLabel(item.period),
    weight: formatWeight(item.averageWeightKg),
    waist: formatWaist(item.averageWaistCm),
  }));

  const monthlyData = monthlySeries.map((item) => ({
    period: formatMonthLabel(item.period),
    treatSpins: item.treatSpinCount,
    bonusMinutes: item.treatBonusMinutes,
  }));

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Haftal\u0131k trend</p>
            <p className="text-base font-semibold text-foreground">Kilo & bele giden yol</p>
          </div>
        </header>

        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData} margin={{ left: -12, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" style={axisFont} tickLine={false} />
              <YAxis
                yAxisId="weight"
                stroke="transparent"
                style={axisFont}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)} kg`}
                width={40}
              />
              <YAxis
                yAxisId="waist"
                orientation="right"
                stroke="transparent"
                style={axisFont}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)} cm`}
                width={40}
              />
              <Tooltip
                cursor={{ strokeDasharray: "2 4" }}
                formatter={(value, name) => {
                  if (name === "weight") {
                    return [`${value} kg`, "Kilo"];
                  }
                  if (name === "waist") {
                    return [`${value} cm`, "Bel"];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderRadius: "16px",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                name="weight"
                yAxisId="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="waist"
                name="waist"
                yAxisId="waist"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                strokeDasharray="6 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ayl\u0131k \u00F6zet</p>
            <p className="text-base font-semibold text-foreground">Treat Wheel aktivitesi</p>
          </div>
        </header>

        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ left: -18, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" style={axisFont} tickLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={axisFont}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.35)" }}
                formatter={(value, name) => {
                  if (name === "treatSpins") {
                    return [`${value}`, "Spin say\u0131s\u0131"];
                  }
                  if (name === "bonusMinutes") {
                    return [`${value} dk`, "Bonus y\u00FCr\u00FCy\u00FC\u015F"];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderRadius: "16px",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Bar dataKey="treatSpins" name="treatSpins" fill="hsl(var(--primary))" radius={[12, 12, 6, 6]} />
              <Bar dataKey="bonusMinutes" name="bonusMinutes" fill="hsl(var(--secondary))" radius={[12, 12, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
