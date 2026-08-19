import type { ActivityLevel, BodyLog, FoodEntry, Goal, Profile } from "../types";

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: "거의 활동 없음 (사무직/좌식 생활)",
  light: "가벼운 활동 (주 1-3회 운동)",
  moderate: "보통 활동 (주 3-5회 운동)",
  active: "활동적 (주 6-7회 운동)",
  very_active: "매우 활동적 (육체노동 + 매일 운동)",
};

const KCAL_PER_KG_FAT = 7700;
const MIN_SAFE_CALORIES = { male: 1500, female: 1200 };
export const DEFAULT_PROTEIN_PER_KG = 1.6;
export const DEFAULT_FAT_PER_KG = 0.8;

/** 체성분 기록이 있으면 가장 최근 몸무게를, 없으면 프로필의 몸무게를 사용 */
export function resolveWeightKg(profile: Profile, bodyLogs: BodyLog[]): number {
  if (bodyLogs.length === 0) return profile.weightKg;
  return bodyLogs[bodyLogs.length - 1].weightKg;
}

/** bodyLogs의 최신 몸무게를 반영한 프로필 (BMI/BMR/TDEE/목표 계산용) */
export function withResolvedWeight(profile: Profile, bodyLogs: BodyLog[]): Profile {
  const weightKg = resolveWeightKg(profile, bodyLogs);
  return weightKg === profile.weightKg ? profile : { ...profile, weightKg };
}

/** Mifflin-St Jeor 공식 기반 기초대사량(BMR, kcal/day) */
export function calcBMR(profile: Profile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return Math.round(profile.sex === "male" ? base + 5 : base - 161);
}

/** 활동대사량(TDEE, kcal/day) */
export function calcTDEE(profile: Profile): number {
  return Math.round(calcBMR(profile) * ACTIVITY_MULTIPLIER[profile.activityLevel]);
}

export function calcBMI(profile: Profile): number {
  const heightM = profile.heightCm / 100;
  return profile.weightKg / (heightM * heightM);
}

export interface BMICategory {
  label: string;
  colorVar: string;
}

/** 대한비만학회(아시아-태평양 기준) 체질량지수 분류 */
export function bmiCategory(bmi: number): BMICategory {
  if (bmi < 18.5) return { label: "저체중", colorVar: "#3b82f6" };
  if (bmi < 23) return { label: "정상", colorVar: "var(--accent)" };
  if (bmi < 25) return { label: "과체중", colorVar: "#f59e0b" };
  if (bmi < 30) return { label: "비만", colorVar: "#f97316" };
  return { label: "고도비만", colorVar: "var(--warn)" };
}

export interface MacroTargets {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  warning?: string;
}

/** 목표(감량 kg/기간)와 프로필로 하루 목표 칼로리 및 탄/단/지 목표(g)를 계산 */
export function calcDailyTargets(profile: Profile, goal: Goal): MacroTargets {
  const tdee = calcTDEE(profile);
  const totalDeficit = goal.targetLossKg * KCAL_PER_KG_FAT;
  const days = Math.max(goal.weeks * 7, 1);
  const dailyDeficit = totalDeficit / days;
  let calories = Math.round(tdee - dailyDeficit);

  const minSafe = MIN_SAFE_CALORIES[profile.sex];
  let warning: string | undefined;
  if (calories < minSafe) {
    calories = minSafe;
    warning = `계산된 목표 칼로리가 안전 최소치(${minSafe}kcal) 미만이라 ${minSafe}kcal로 조정했습니다. 감량 속도나 기간을 조정해 보세요.`;
  }

  const proteinPerKg = goal.proteinPerKg > 0 ? goal.proteinPerKg : DEFAULT_PROTEIN_PER_KG;
  const fatPerKg = goal.fatPerKg > 0 ? goal.fatPerKg : DEFAULT_FAT_PER_KG;
  const weightKg = profile.weightKg > 0 ? profile.weightKg : 0;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round(weightKg * fatPerKg);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbKcal = Math.max(calories - proteinKcal - fatKcal, 0);
  const carbsG = Math.round(carbKcal / 4);

  return { calories, carbsG, proteinG, fatG, warning };
}

export interface ComputedFoodEntry {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  sugarG: number;
  sodiumMg: number;
}

/** 칼로리 산정 기준 중량과 실제 섭취 중량 비율로 영양성분을 환산 */
export function computeFoodEntry(entry: FoodEntry): ComputedFoodEntry {
  const ratio = entry.baseWeightG > 0 ? entry.intakeWeightG / entry.baseWeightG : 0;
  return {
    calories: Math.round(entry.baseCalories * ratio),
    carbsG: Math.round(entry.baseCarbsG * ratio * 10) / 10,
    proteinG: Math.round(entry.baseProteinG * ratio * 10) / 10,
    fatG: Math.round(entry.baseFatG * ratio * 10) / 10,
    sugarG: Math.round(entry.baseSugarG * ratio * 10) / 10,
    sodiumMg: Math.round(entry.baseSodiumMg * ratio),
  };
}

export function sumFoodEntries(entries: FoodEntry[]): ComputedFoodEntry {
  return entries.reduce<ComputedFoodEntry>(
    (acc, e) => {
      const c = computeFoodEntry(e);
      return {
        calories: acc.calories + c.calories,
        carbsG: Math.round((acc.carbsG + c.carbsG) * 10) / 10,
        proteinG: Math.round((acc.proteinG + c.proteinG) * 10) / 10,
        fatG: Math.round((acc.fatG + c.fatG) * 10) / 10,
        sugarG: Math.round((acc.sugarG + c.sugarG) * 10) / 10,
        sodiumMg: acc.sodiumMg + c.sodiumMg,
      };
    },
    { calories: 0, carbsG: 0, proteinG: 0, fatG: 0, sugarG: 0, sodiumMg: 0 },
  );
}
