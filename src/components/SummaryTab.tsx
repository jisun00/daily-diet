import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useStore } from "../store/useStore";
import { calcDailyTargets, sumFoodEntries, withResolvedWeight } from "../lib/calc";
import { Button, Card, Stat } from "./Card";

type Period = "day" | "week" | "month";

const MEAL_LABEL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_LABEL: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

export function SummaryTab() {
  const profile = useStore((s) => s.profile);
  const bodyLogs = useStore((s) => s.bodyLogs);
  const goal = useStore((s) => s.goal);
  const meals = useStore((s) => s.meals);

  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState(new Date());

  const targets =
    profile && goal ? calcDailyTargets(withResolvedWeight(profile, bodyLogs), goal) : null;

  const range = useMemo(() => {
    if (period === "day") return { start: anchor, end: anchor };
    if (period === "week")
      return { start: startOfWeek(anchor, { weekStartsOn: 1 }), end: endOfWeek(anchor, { weekStartsOn: 1 }) };
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }, [period, anchor]);

  const days = useMemo(
    () => eachDayOfInterval({ start: range.start, end: range.end }),
    [range],
  );

  const dailyData = useMemo(
    () =>
      days.map((d) => {
        const dateStr = format(d, "yyyy-MM-dd");
        const items = meals.filter((m) => m.date === dateStr).flatMap((m) => m.items);
        const totals = sumFoodEntries(items);
        return {
          date: dateStr,
          label: format(d, period === "month" ? "d" : "EEE"),
          ...totals,
        };
      }),
    [days, meals, period],
  );

  const periodTotal = dailyData.reduce((acc, d) => acc + d.calories, 0);
  const daysWithData = dailyData.filter((d) => d.calories > 0).length;
  const avgCalories = daysWithData > 0 ? Math.round(periodTotal / daysWithData) : 0;

  const shift = (dir: 1 | -1) => {
    if (period === "day") setAnchor((a) => addDays(a, dir));
    else if (period === "week") setAnchor((a) => addWeeks(a, dir));
    else setAnchor((a) => addMonths(a, dir));
  };

  const dayMeals = useMemo(() => {
    const dateStr = format(anchor, "yyyy-MM-dd");
    return MEAL_LABEL_ORDER.map((type) => {
      const meal = meals.find((m) => m.date === dateStr && m.type === type);
      return { type, totals: sumFoodEntries(meal?.items ?? []) };
    });
  }, [anchor, meals]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            {(["day", "week", "month"] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "primary" : "secondary"}
                onClick={() => setPeriod(p)}
              >
                {p === "day" ? "일" : p === "week" ? "주" : "월"}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => shift(-1)}>
              ◀
            </Button>
            <span className="text-sm font-medium">
              {period === "day"
                ? format(anchor, "yyyy-MM-dd (EEE)")
                : `${format(range.start, "MM/dd")} ~ ${format(range.end, "MM/dd")}`}
            </span>
            <Button variant="secondary" onClick={() => shift(1)}>
              ▶
            </Button>
          </div>
        </div>
      </Card>

      {period === "day" ? (
        <Card title="일일 섭취 요약">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="섭취 칼로리" value={dailyData[0]?.calories ?? 0} unit="kcal" accent="var(--accent)" />
            {targets && <Stat label="목표 칼로리" value={targets.calories} unit="kcal" />}
            <Stat label="탄수화물" value={dailyData[0]?.carbsG ?? 0} unit="g" />
            <Stat label="단백질" value={dailyData[0]?.proteinG ?? 0} unit="g" />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {dayMeals.map(({ type, totals }) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)" }}
              >
                <span>{MEAL_LABEL[type]}</span>
                <span>{totals.calories}kcal</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card title={`${period === "week" ? "주간" : "월간"} 섭취 칼로리`}>
          <div className="mb-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="합계" value={periodTotal} unit="kcal" />
            <Stat label="기록된 날짜 평균" value={avgCalories} unit="kcal" accent="var(--accent)" />
            {targets && <Stat label="목표(1일)" value={targets.calories} unit="kcal" />}
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={12} stroke="var(--text-muted)" />
                <YAxis fontSize={12} stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
                />
                <Legend />
                {targets && (
                  <ReferenceLine
                    y={targets.calories}
                    stroke="var(--warn)"
                    strokeDasharray="4 4"
                    label={{ value: "목표", fill: "var(--warn)", fontSize: 11 }}
                  />
                )}
                <Bar dataKey="calories" name="섭취 칼로리" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function addDays(d: Date, amount: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + amount);
  return r;
}
