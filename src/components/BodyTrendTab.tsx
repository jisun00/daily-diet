import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "../store/useStore";
import { Button, Card, Field, NumberField, inputClass, inputStyle } from "./Card";
import { format, subMonths } from "date-fns";

const emptyForm = {
  date: format(new Date(), "yyyy-MM-dd"),
  weightKg: 0,
  skeletalMuscleKg: 0,
  bodyFatPercent: 0,
};

type ChartRange = "1m" | "3m" | "6m" | "all";
const RANGE_LABEL: Record<ChartRange, string> = {
  "1m": "1개월",
  "3m": "3개월",
  "6m": "6개월",
  all: "전체",
};
const RANGE_MONTHS: Record<ChartRange, number | null> = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  all: null,
};

export function BodyTrendTab() {
  const bodyLogs = useStore((s) => s.bodyLogs);
  const addBodyLog = useStore((s) => s.addBodyLog);
  const deleteBodyLog = useStore((s) => s.deleteBodyLog);
  const [form, setForm] = useState(emptyForm);
  const [range, setRange] = useState<ChartRange>("3m");

  const chartData = useMemo(() => {
    const months = RANGE_MONTHS[range];
    const cutoff = months !== null ? format(subMonths(new Date(), months), "yyyy-MM-dd") : null;
    return bodyLogs
      .filter((l) => cutoff === null || l.date >= cutoff)
      .map((l) => ({
        date: l.date.slice(5),
        몸무게: l.weightKg,
        골격근량: l.skeletalMuscleKg,
        체지방률: l.bodyFatPercent,
      }));
  }, [bodyLogs, range]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weightKg) return;
    addBodyLog({
      date: form.date,
      weightKg: form.weightKg,
      skeletalMuscleKg: form.skeletalMuscleKg || undefined,
      bodyFatPercent: form.bodyFatPercent || undefined,
    });
    setForm({ ...emptyForm, date: form.date });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card title="체성분 기록 추가">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="날짜">
            <input
              type="date"
              className={inputClass}
              style={inputStyle}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="몸무게 (kg)">
            <NumberField
              value={form.weightKg}
              min={0}
              onChange={(n) => setForm({ ...form, weightKg: n })}
            />
          </Field>
          <Field label="골격근량 (kg)">
            <NumberField
              value={form.skeletalMuscleKg}
              min={0}
              onChange={(n) => setForm({ ...form, skeletalMuscleKg: n })}
            />
          </Field>
          <Field label="체지방률 (%)">
            <NumberField
              value={form.bodyFatPercent}
              min={0}
              onChange={(n) => setForm({ ...form, bodyFatPercent: n })}
            />
          </Field>
          <div className="col-span-2 sm:col-span-4">
            <Button type="submit">추가</Button>
          </div>
        </form>
      </Card>

      <Card title="추이 그래프">
        <div className="mb-3 flex gap-1">
          {(Object.keys(RANGE_LABEL) as ChartRange[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? "primary" : "secondary"}
              onClick={() => setRange(r)}
            >
              {RANGE_LABEL[r]}
            </Button>
          ))}
        </div>
        {bodyLogs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            아직 기록이 없습니다.
          </p>
        ) : chartData.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            선택한 기간({RANGE_LABEL[range]})에는 기록이 없습니다.
          </p>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={12} stroke="var(--text-muted)" />
                <YAxis fontSize={12} stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", borderColor: "var(--border)" }}
                />
                <Line type="monotone" dataKey="몸무게" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="골격근량" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="체지방률" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card title="기록 목록">
        <div className="flex flex-col gap-2">
          {[...bodyLogs]
            .reverse()
            .map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="font-medium">{log.date}</span>
                <span>
                  {log.weightKg}kg
                  {log.skeletalMuscleKg ? ` · 골격근 ${log.skeletalMuscleKg}kg` : ""}
                  {log.bodyFatPercent ? ` · 체지방 ${log.bodyFatPercent}%` : ""}
                </span>
                <button
                  onClick={() => deleteBodyLog(log.id)}
                  className="text-xs"
                  style={{ color: "var(--warn)" }}
                >
                  삭제
                </button>
              </div>
            ))}
          {bodyLogs.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              아직 기록이 없습니다.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
