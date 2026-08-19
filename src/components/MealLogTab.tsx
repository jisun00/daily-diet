import { useState } from "react";
import { format } from "date-fns";
import { useStore } from "../store/useStore";
import type { FoodEntry, MealType } from "../types";
import { calcDailyTargets, computeFoodEntry, sumFoodEntries } from "../lib/calc";
import { Button, Card, inputClass, inputStyle, Stat } from "./Card";
import { FoodEntryForm } from "./FoodEntryForm";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

export function MealLogTab() {
  const profile = useStore((s) => s.profile);
  const goal = useStore((s) => s.goal);
  const meals = useStore((s) => s.meals);
  const favorites = useStore((s) => s.favorites);
  const addFoodEntry = useStore((s) => s.addFoodEntry);
  const updateFoodEntry = useStore((s) => s.updateFoodEntry);
  const deleteFoodEntry = useStore((s) => s.deleteFoodEntry);
  const addFavorite = useStore((s) => s.addFavorite);
  const deleteFavorite = useStore((s) => s.deleteFavorite);

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [openForm, setOpenForm] = useState<{ type: MealType; entryId?: string } | null>(null);

  const allEntriesForDate = MEAL_TYPES.flatMap(
    (type) => meals.find((m) => m.date === date && m.type === type)?.items ?? [],
  );
  const dailyTotal = sumFoodEntries(allEntriesForDate);
  const targets = profile && goal ? calcDailyTargets(profile, goal) : null;
  const diff = targets ? dailyTotal.calories - targets.calories : 0;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            type="date"
            className={inputClass}
            style={inputStyle}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {targets && (
            <div className="flex items-center gap-4">
              <Stat label="오늘 섭취" value={dailyTotal.calories} unit="kcal" />
              <Stat label="목표" value={targets.calories} unit="kcal" />
              <Stat
                label={diff > 0 ? "초과" : "여유"}
                value={`${diff > 0 ? "+" : ""}${diff}`}
                unit="kcal"
                accent={diff > 0 ? "var(--warn)" : "var(--accent)"}
              />
            </div>
          )}
        </div>
        {!targets && (
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            [기본정보]와 [목표] 탭을 먼저 설정하면 목표 대비 비교가 표시됩니다.
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="탄수화물" value={dailyTotal.carbsG} unit="g" />
          <Stat label="단백질" value={dailyTotal.proteinG} unit="g" />
          <Stat label="지방" value={dailyTotal.fatG} unit="g" />
          <Stat label="나트륨" value={dailyTotal.sodiumMg} unit="mg" />
        </div>
      </Card>

      {MEAL_TYPES.map((type) => {
        const meal = meals.find((m) => m.date === date && m.type === type);
        const items = meal?.items ?? [];
        const mealTotal = sumFoodEntries(items);
        const isAdding = openForm?.type === type && !openForm.entryId;

        return (
          <Card key={type} title={`${MEAL_LABEL[type]} · ${mealTotal.calories}kcal`}>
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const editing = openForm?.type === type && openForm.entryId === item.id;
                if (editing) {
                  return (
                    <FoodEntryForm
                      key={item.id}
                      favorites={favorites}
                      initial={item}
                      onCancel={() => setOpenForm(null)}
                      onSubmit={(values) => {
                        updateFoodEntry(date, type, item.id, values);
                        setOpenForm(null);
                      }}
                    />
                  );
                }
                const c = computeFoodEntry(item);
                return (
                  <FoodItemRow
                    key={item.id}
                    item={item}
                    computed={c}
                    onEdit={() => setOpenForm({ type, entryId: item.id })}
                    onDelete={() => deleteFoodEntry(date, type, item.id)}
                  />
                );
              })}

              {isAdding ? (
                <FoodEntryForm
                  favorites={favorites}
                  onCancel={() => setOpenForm(null)}
                  onSubmit={(values) => {
                    addFoodEntry(date, type, values);
                    setOpenForm(null);
                  }}
                  onSaveFavorite={(values) =>
                    addFavorite({
                      name: values.name,
                      baseWeightG: values.baseWeightG,
                      calories: values.baseCalories,
                      carbsG: values.baseCarbsG,
                      proteinG: values.baseProteinG,
                      fatG: values.baseFatG,
                      sugarG: values.baseSugarG,
                      sodiumMg: values.baseSodiumMg,
                    })
                  }
                />
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setOpenForm({ type })}
                  className="self-start"
                >
                  + 음식 추가
                </Button>
              )}
            </div>
          </Card>
        );
      })}

      {favorites.length > 0 && (
        <Card title="즐겨찾기 음식">
          <div className="flex flex-col gap-2">
            {favorites.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)" }}
              >
                <span>
                  {f.name} · {f.baseWeightG}g / {f.calories}kcal
                </span>
                <button
                  onClick={() => deleteFavorite(f.id)}
                  className="text-xs"
                  style={{ color: "var(--warn)" }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function FoodItemRow({
  item,
  computed,
  onEdit,
  onDelete,
}: {
  item: FoodEntry;
  computed: ReturnType<typeof computeFoodEntry>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div>
        <div className="font-medium">{item.name}</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          {item.intakeWeightG}g 섭취 (기준 {item.baseWeightG}g) · {computed.calories}kcal · 탄{" "}
          {computed.carbsG} 단 {computed.proteinG} 지 {computed.fatG}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-xs" style={{ color: "var(--text-muted)" }}>
          수정
        </button>
        <button onClick={onDelete} className="text-xs" style={{ color: "var(--warn)" }}>
          삭제
        </button>
      </div>
    </div>
  );
}
