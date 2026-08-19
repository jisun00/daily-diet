import { useState } from "react";
import { format } from "date-fns";
import { useStore } from "../store/useStore";
import type { Goal } from "../types";
import { calcDailyTargets, withResolvedWeight } from "../lib/calc";
import { Button, Card, Field, NumberField, Stat, inputClass, inputStyle } from "./Card";

const defaultGoal: Goal = {
  startDate: format(new Date(), "yyyy-MM-dd"),
  weeks: 8,
  targetLossKg: 4,
  proteinPerKg: 1.6,
  fatPercent: 25,
};

export function GoalTab() {
  const profile = useStore((s) => s.profile);
  const bodyLogs = useStore((s) => s.bodyLogs);
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

  const analysisProfile = withResolvedWeight(profile, bodyLogs);
  const targets = calcDailyTargets(analysisProfile, form);

  return (
    <div className="flex flex-col gap-4">
      <Card title="목표 입력">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              <NumberField
                value={form.weeks}
                min={1}
                onChange={(n) => setForm({ ...form, weeks: n })}
              />
            </Field>
            <Field label="감량 목표 (kg)">
              <NumberField
                value={form.targetLossKg}
                min={0}
                onChange={(n) => setForm({ ...form, targetLossKg: n })}
              />
            </Field>
          </div>

          <details className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
            <summary className="cursor-pointer select-none font-medium">
              고급 설정: 단백질/지방 기준 (선택)
            </summary>
            <p className="mt-2 mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
              단백질 기본값(체중 1kg당 1.6g)은 다이어트 중 근손실을 최소화하는 기준으로 널리
              쓰입니다(1.2~2.0g/kg 권장). 지방 기본값(칼로리의 25%)은 체중이 아니라 목표
              칼로리 대비 비율로 정하는 게 표준이며, 한국인 영양소 섭취기준(KDRI)의 권장 범위인
              15~30% 중간값입니다. 특별한 이유가 없다면 그대로 두셔도 됩니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="단백질 (g/체중kg)">
                <NumberField
                  value={form.proteinPerKg}
                  min={0}
                  onChange={(n) => setForm({ ...form, proteinPerKg: n })}
                />
              </Field>
              <Field label="지방 (% 칼로리)">
                <NumberField
                  value={form.fatPercent}
                  min={0}
                  max={100}
                  onChange={(n) => setForm({ ...form, fatPercent: n })}
                />
              </Field>
            </div>
          </details>

          <Button type="submit" className="self-start">
            목표 저장
          </Button>
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
        <div className="grid grid-cols-4 gap-2">
          <Stat
            label="목표 칼로리"
            value={targets.calories}
            unit="kcal"
            accent="var(--accent)"
            compact
          />
          <Stat label="탄수화물" value={targets.carbsG} unit="g" compact />
          <Stat label="단백질" value={targets.proteinG} unit="g" compact />
          <Stat label="지방" value={targets.fatG} unit="g" compact />
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          탄수화물은 별도로 입력하는 값이 아니라, 목표 칼로리에서 단백질·지방의 칼로리를 뺀
          나머지를 자동으로 환산한 값입니다.
        </p>
      </Card>
    </div>
  );
}
