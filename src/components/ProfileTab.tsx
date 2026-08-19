import { useState } from "react";
import { useStore } from "../store/useStore";
import type { ActivityLevel, Profile, Sex } from "../types";
import { ACTIVITY_LABEL, bmiCategory, calcBMI, calcBMR, calcTDEE, withResolvedWeight } from "../lib/calc";
import { Button, Card, Field, NumberField, Stat, inputClass, inputStyle } from "./Card";

const ACTIVITY_LEVELS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];

export function ProfileTab() {
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const bodyLogs = useStore((s) => s.bodyLogs);

  const [form, setForm] = useState<Profile>(
    profile ?? {
      age: 30,
      sex: "female",
      heightCm: 160,
      weightKg: 60,
      activityLevel: "light",
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(form);
  };

  const latestBodyLogWeight = bodyLogs.length > 0 ? bodyLogs[bodyLogs.length - 1].weightKg : null;
  const analysisProfile = withResolvedWeight(form, bodyLogs);
  const bmi = calcBMI(analysisProfile);
  const category = bmiCategory(bmi);
  const bmr = calcBMR(analysisProfile);
  const tdee = calcTDEE(analysisProfile);

  return (
    <div className="flex flex-col gap-4">
      <Card title="기본정보 입력">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="나이">
            <NumberField
              value={form.age}
              min={1}
              max={120}
              onChange={(n) => setForm({ ...form, age: n })}
            />
          </Field>
          <Field label="성별">
            <select
              className={inputClass}
              style={inputStyle}
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}
            >
              <option value="female">여성</option>
              <option value="male">남성</option>
            </select>
          </Field>
          <Field label="키 (cm)">
            <NumberField
              value={form.heightCm}
              min={100}
              max={250}
              onChange={(n) => setForm({ ...form, heightCm: n })}
            />
          </Field>
          <Field label="몸무게 (kg)">
            <NumberField
              value={form.weightKg}
              min={20}
              max={300}
              onChange={(n) => setForm({ ...form, weightKg: n })}
            />
          </Field>
          <div className="col-span-2 sm:col-span-3">
            <Field label="활동 수준">
              <select
                className={inputClass}
                style={inputStyle}
                value={form.activityLevel}
                onChange={(e) =>
                  setForm({ ...form, activityLevel: e.target.value as ActivityLevel })
                }
              >
                {ACTIVITY_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {ACTIVITY_LABEL[lvl]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <Button type="submit">저장</Button>
          </div>
        </form>
        {latestBodyLogWeight !== null && (
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            [체성분] 탭에 기록된 최신 몸무게({latestBodyLogWeight}kg)가 아래 분석에 자동으로
            반영됩니다. 여기 몸무게 값은 체성분 기록이 없을 때만 사용돼요.
          </p>
        )}
      </Card>

      <Card title="분석 결과">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="BMI" value={bmi.toFixed(1)} />
          <Stat label="비만도" value={category.label} accent={category.colorVar} />
          <Stat label="기초대사량 (BMR)" value={bmr} unit="kcal" />
          <Stat label="활동대사량 (TDEE)" value={tdee} unit="kcal" />
        </div>
        {!profile && (
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            아직 저장되지 않았습니다. 정보를 입력 후 저장 버튼을 눌러주세요.
          </p>
        )}
      </Card>
    </div>
  );
}
