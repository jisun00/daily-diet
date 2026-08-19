import { useState } from "react";
import type { FavoriteFood, FoodEntry } from "../types";
import { computeFoodEntry } from "../lib/calc";
import { Button, Field, NumberField, inputClass, inputStyle } from "./Card";

type FormValues = Omit<FoodEntry, "id">;

const blank: FormValues = {
  name: "",
  baseWeightG: 100,
  baseCalories: 0,
  baseCarbsG: 0,
  baseProteinG: 0,
  baseFatG: 0,
  baseSugarG: 0,
  baseSodiumMg: 0,
  intakeWeightG: 100,
  favoriteId: undefined,
};

export function FoodEntryForm({
  favorites,
  initial,
  onSubmit,
  onCancel,
  onSaveFavorite,
}: {
  favorites: FavoriteFood[];
  initial?: FormValues;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  onSaveFavorite?: (values: FormValues) => void;
}) {
  const [values, setValues] = useState<FormValues>(initial ?? blank);
  const [rememberFavorite, setRememberFavorite] = useState(false);

  const applyFavorite = (favId: string) => {
    const fav = favorites.find((f) => f.id === favId);
    if (!fav) {
      setValues({ ...values, favoriteId: undefined });
      return;
    }
    setValues({
      ...values,
      name: fav.name,
      baseWeightG: fav.baseWeightG,
      baseCalories: fav.calories,
      baseCarbsG: fav.carbsG,
      baseProteinG: fav.proteinG,
      baseFatG: fav.fatG,
      baseSugarG: fav.sugarG,
      baseSodiumMg: fav.sodiumMg,
      intakeWeightG: fav.baseWeightG,
      favoriteId: fav.id,
    });
  };

  const computed = computeFoodEntry({ ...values, id: "preview" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name || values.baseWeightG <= 0) return;
    onSubmit(values);
    if (rememberFavorite && onSaveFavorite) onSaveFavorite(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border p-3"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      {favorites.length > 0 && (
        <Field label="즐겨찾기에서 불러오기">
          <select
            className={inputClass}
            style={inputStyle}
            value={values.favoriteId ?? ""}
            onChange={(e) => applyFavorite(e.target.value)}
          >
            <option value="">직접 입력</option>
            {favorites.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.baseWeightG}g / {f.calories}kcal)
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-4">
          <Field label="음식명">
            <input
              className={inputClass}
              style={inputStyle}
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value, favoriteId: undefined })}
              required
            />
          </Field>
        </div>
        <Field label="칼로리 산정 기준 중량 (g)">
          <NumberField
            value={values.baseWeightG}
            min={0}
            onChange={(n) => setValues({ ...values, baseWeightG: n })}
          />
        </Field>
        <Field label="칼로리 (kcal)">
          <NumberField
            value={values.baseCalories}
            min={0}
            onChange={(n) => setValues({ ...values, baseCalories: n })}
          />
        </Field>
        <Field label="탄수화물 (g)">
          <NumberField
            value={values.baseCarbsG}
            min={0}
            onChange={(n) => setValues({ ...values, baseCarbsG: n })}
          />
        </Field>
        <Field label="단백질 (g)">
          <NumberField
            value={values.baseProteinG}
            min={0}
            onChange={(n) => setValues({ ...values, baseProteinG: n })}
          />
        </Field>
        <Field label="지방 (g)">
          <NumberField
            value={values.baseFatG}
            min={0}
            onChange={(n) => setValues({ ...values, baseFatG: n })}
          />
        </Field>
        <Field label="당류 (g)">
          <NumberField
            value={values.baseSugarG}
            min={0}
            onChange={(n) => setValues({ ...values, baseSugarG: n })}
          />
        </Field>
        <Field label="나트륨 (mg)">
          <NumberField
            value={values.baseSodiumMg}
            min={0}
            onChange={(n) => setValues({ ...values, baseSodiumMg: n })}
          />
        </Field>
        <Field label="실제 섭취 중량 (g)">
          <NumberField
            value={values.intakeWeightG}
            min={0}
            style={{ ...inputStyle, borderColor: "var(--accent)" }}
            onChange={(n) => setValues({ ...values, intakeWeightG: n })}
          />
        </Field>
      </div>

      <div
        className="rounded-lg px-3 py-2 text-sm"
        style={{ background: "var(--accent-soft)", color: "var(--text)" }}
      >
        섭취 중량 기준 환산: <b>{computed.calories}kcal</b> · 탄 {computed.carbsG}g · 단{" "}
        {computed.proteinG}g · 지 {computed.fatG}g · 당 {computed.sugarG}g · 나트륨{" "}
        {computed.sodiumMg}mg
      </div>

      {onSaveFavorite && !values.favoriteId && (
        <label className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <input
            type="checkbox"
            checked={rememberFavorite}
            onChange={(e) => setRememberFavorite(e.target.checked)}
          />
          이 음식을 즐겨찾기에 저장
        </label>
      )}

      <div className="flex gap-2">
        <Button type="submit">저장</Button>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}
