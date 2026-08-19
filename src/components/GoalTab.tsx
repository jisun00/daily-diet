import { useState } from "react";
import { format } from "date-fns";
import { useStore } from "../store/useStore";
import type { Goal } from "../types";
import { calcDailyTargets } from "../lib/calc";
import { Button, Card, Field, inputClass, inputStyle, Stat } from "./Card";

const defaultGoal: Goal = {
  startDate: format(new Date(), "yyyy-MM-dd"),
  weeks: 8,
  targetLossKg: 4,
  proteinPerKg: 1.6,
  fatPerKg: 0.8,
};

export function GoalTab() {
  const profile = useStore((s) => s.profile);
  const goal = useStore((s) => s.goal);
  const setGoal = useStore((s) => s.setGoal);
  const [form, setForm] = useState<Goal>(goal ?? defaultGoal);

  if (!profile) {
    return (
      <Card>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          먼저 [기본정보] 탭에서 프로필을 저장해주세요.
        </p>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal(form);
  };

  const targets = calcDailyTargets(profile, form);

  return (
    <div className="flex flex-col gap-4">
      <Card title="목표 입력">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="시작일">
            <input
              type="date"
              className={inputClass}
              style={inputStyle}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>
          <Field label="기간 (주)">
            <input
              type="number"
              min={1}
              className={inputClass}
              style={inputStyle}
              value={form.weeks}
              onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })}
            />
          </Field>
          <Field label="감량 목표 (kg)">
            <input
              type="number"
              min={0}
              step={0.1}
              className={inputClass}
              style={inputStyle}
              value={form.targetLossKg}
              onChange={(e) => setForm({ ...form, targetLossKg: Number(e.target.value) })}
            />
          </Field>
          <Field label="단백질 (g/체중kg)">
            <input
              type="number"
              min={0}
              step={0.1}
              className={inputClass}
              style={inputStyle}
              value={form.proteinPerKg}
              onChange={(e) => setForm({ ...form, proteinPerKg: Number(e.target.value) })}
            />
          </Field>
          <Field label="지방 (g/체중kg)">
            <input
              type="number"
              min={0}
              step={0.1}
              className={inputClass}
              style={inputStyle}
              value={form.fatPerKg}
              onChange={(e) => setForm({ ...form, fatPerKg: Number(e.target.value) })}
            />
          </Field>
          <div className="col-span-2 flex items-end sm:col-span-4">
            <Button type="submit">목표 저장</Button>
          </div>
        </form>
      </Card>

      <Card title="하루 목표 섭취량">
        {targets.warning && (
          <p
            className="mb-3 rounded-lg px-3 py-2 text-xs"
            style={{ background: "var(--warn-soft)", color: "var(--warn)" }}
          >
            {targets.warning}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="목표 칼로리" value={targets.calories} unit="kcal" accent="var(--accent)" />
          <Stat label="탄수화물" value={targets.carbsG} unit="g" />
          <Stat label="단백질" value={targets.proteinG} unit="g" />
          <Stat label="지방" value={targets.fatG} unit="g" />
        </div>
      </Card>
    </div>
  );
}
