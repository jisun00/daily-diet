export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary" // 거의 활동 없음 (사무직, 좌식)
  | "light" // 가벼운 활동 (주 1-3회 운동)
  | "moderate" // 보통 활동 (주 3-5회 운동)
  | "active" // 활동적 (주 6-7회 운동)
  | "very_active"; // 매우 활동적 (육체노동 + 운동)

export interface Profile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  occupation?: string;
}

export interface BodyLog {
  id: string;
  date: string; // yyyy-MM-dd
  weightKg: number;
  skeletalMuscleKg?: number;
  bodyFatPercent?: number;
}

export interface Goal {
  startDate: string; // yyyy-MM-dd
  weeks: number;
  targetLossKg: number;
  // 매크로 비율 조정용 (g/kg), 기본값 사용 가능
  proteinPerKg: number;
  fatPerKg: number;
}

export interface FavoriteFood {
  id: string;
  name: string;
  baseWeightG: number;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  sugarG: number;
  sodiumMg: number;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodEntry {
  id: string;
  name: string;
  baseWeightG: number; // 칼로리 산정 기준 중량
  baseCalories: number;
  baseCarbsG: number;
  baseProteinG: number;
  baseFatG: number;
  baseSugarG: number;
  baseSodiumMg: number;
  intakeWeightG: number; // 실제 섭취 중량
  favoriteId?: string;
}

export interface Meal {
  id: string;
  date: string; // yyyy-MM-dd
  type: MealType;
  items: FoodEntry[];
}

export interface AppState {
  profile: Profile | null;
  bodyLogs: BodyLog[];
  goal: Goal | null;
  favorites: FavoriteFood[];
  meals: Meal[];
}
