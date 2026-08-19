import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  AppState,
  BodyLog,
  FavoriteFood,
  FoodEntry,
  Goal,
  Meal,
  MealType,
  Profile,
} from "../types";

interface Actions {
  setProfile: (profile: Profile) => void;
  addBodyLog: (log: Omit<BodyLog, "id">) => void;
  updateBodyLog: (id: string, log: Omit<BodyLog, "id">) => void;
  deleteBodyLog: (id: string) => void;
  setGoal: (goal: Goal) => void;
  addFavorite: (fav: Omit<FavoriteFood, "id">) => void;
  deleteFavorite: (id: string) => void;
  getOrCreateMeal: (date: string, type: MealType) => Meal;
  addFoodEntry: (date: string, type: MealType, entry: Omit<FoodEntry, "id">) => void;
  updateFoodEntry: (
    date: string,
    type: MealType,
    entryId: string,
    entry: Omit<FoodEntry, "id">,
  ) => void;
  deleteFoodEntry: (date: string, type: MealType, entryId: string) => void;
}

export type Store = AppState & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      profile: null,
      bodyLogs: [],
      goal: null,
      favorites: [],
      meals: [],

      setProfile: (profile) => set({ profile }),

      addBodyLog: (log) =>
        set((s) => ({
          bodyLogs: [...s.bodyLogs, { ...log, id: uuid() }].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        })),

      updateBodyLog: (id, log) =>
        set((s) => ({
          bodyLogs: s.bodyLogs
            .map((b) => (b.id === id ? { ...log, id } : b))
            .sort((a, b) => a.date.localeCompare(b.date)),
        })),

      deleteBodyLog: (id) =>
        set((s) => ({ bodyLogs: s.bodyLogs.filter((b) => b.id !== id) })),

      setGoal: (goal) => set({ goal }),

      addFavorite: (fav) =>
        set((s) => ({ favorites: [...s.favorites, { ...fav, id: uuid() }] })),

      deleteFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),

      getOrCreateMeal: (date, type) => {
        const existing = get().meals.find((m) => m.date === date && m.type === type);
        if (existing) return existing;
        const meal: Meal = { id: uuid(), date, type, items: [] };
        set((s) => ({ meals: [...s.meals, meal] }));
        return meal;
      },

      addFoodEntry: (date, type, entry) => {
        get().getOrCreateMeal(date, type);
        set((s) => ({
          meals: s.meals.map((m) =>
            m.date === date && m.type === type
              ? { ...m, items: [...m.items, { ...entry, id: uuid() }] }
              : m,
          ),
        }));
      },

      updateFoodEntry: (date, type, entryId, entry) =>
        set((s) => ({
          meals: s.meals.map((m) =>
            m.date === date && m.type === type
              ? {
                  ...m,
                  items: m.items.map((it) => (it.id === entryId ? { ...entry, id: entryId } : it)),
                }
              : m,
          ),
        })),

      deleteFoodEntry: (date, type, entryId) =>
        set((s) => ({
          meals: s.meals.map((m) =>
            m.date === date && m.type === type
              ? { ...m, items: m.items.filter((it) => it.id !== entryId) }
              : m,
          ),
        })),
    }),
    { name: "diet-tracker-storage" },
  ),
);
