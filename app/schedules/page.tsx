"use client";

import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";
import { RecipeFromDb } from "@/types/recipe";
import { Modal } from "@/components/Modal";
import CreateSchedule from "@/components/CreateSchedule";
import Stars from "@/components/Stars";
import AddRecipe from "@/components/AddRecipe";
import ConfirmModal from "@/components/ConfirmModal";

const categoryColors: Record<string, string> = {
  Breakfast: "bg-amber-100 text-amber-700",
  Lunch: "bg-sky-100 text-sky-700",
  Dinner: "bg-indigo-100 text-indigo-700",
  Snack: "bg-emerald-100 text-emerald-700",
};

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type mealPlan = {
  breakfast?: RecipeFromDb | null;
  lunch?: RecipeFromDb | null;
  dinner?: RecipeFromDb | null;
};
type DayPlan = {
  day: string;
  meals: mealPlan;
};

type WeekPlan = DayPlan[];

type ScheduleFromDb = {
  id: number;
  createdAt: string;
  weekPlan: WeekPlan;
};

export default function Schedules() {
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null);
  const [fetchedSchedules, setFetchedSchedules] = useState<ScheduleFromDb[]>(
    [],
  );
  const [recipes, setRecipes] = useState<RecipeFromDb[]>([]);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [selectedScheduleRecipe, setSelectedScheduleRecipe] =
    useState<RecipeFromDb | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [scheduleActionLoading, setScheduleActionLoading] =
    useState<string>("");
  const [pendingDeleteScheduleId, setPendingDeleteScheduleId] = useState<
    number | null
  >(null);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      const data = await response.json();
      const normalizedSchedules = Array.isArray(data)
        ? data.filter((schedule) => Array.isArray(schedule?.weekPlan))
        : [];
      setFetchedSchedules(normalizedSchedules);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/recipe-list");
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  const handleDeleteSchedule = async (scheduleId: number) => {
    setScheduleActionLoading(`delete-${scheduleId}`);
    try {
      const response = await fetch("/api/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      if (expandedSchedule !== null) {
        const expandedId = fetchedSchedules[expandedSchedule]?.id;
        if (expandedId === scheduleId) {
          setExpandedSchedule(null);
        }
      }

      await fetchSchedules();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    } finally {
      setScheduleActionLoading("");
    }
  };

  const handleReplaceMeal = async (
    scheduleId: number,
    day: string,
    mealType: "breakfast" | "lunch" | "dinner",
    recipeId: string,
  ) => {
    const loadingKey = `replace-${scheduleId}-${day}-${mealType}`;
    setScheduleActionLoading(loadingKey);

    try {
      const response = await fetch("/api/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId,
          day,
          mealType,
          recipeId: recipeId === "" ? null : Number(recipeId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update meal");
      }

      await fetchSchedules();
    } catch (error) {
      console.error("Failed to update meal:", error);
    } finally {
      setScheduleActionLoading("");
    }
  };

  return (
    <>
      <NavBar current="Schedules" onNewRecipe={() => setShowAddRecipe(true)} />
      <Modal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        title="Add Recipe"
      >
        <AddRecipe inModal onClose={() => setShowAddRecipe(false)} />
      </Modal>
      <Modal
        isOpen={showCreateSchedule}
        onClose={() => setShowCreateSchedule(false)}
        title="Create Schedule"
      >
        <CreateSchedule
          inModal
          onClose={() => setShowCreateSchedule(false)}
          onSuccess={fetchSchedules}
        />
      </Modal>
      <ConfirmModal
        isOpen={pendingDeleteScheduleId !== null}
        onClose={() => setPendingDeleteScheduleId(null)}
        onConfirm={async () => {
          if (pendingDeleteScheduleId === null) return;
          await handleDeleteSchedule(pendingDeleteScheduleId);
          setPendingDeleteScheduleId(null);
        }}
        title="Delete schedule"
        message="Delete this entire weekly schedule? This action cannot be undone."
        confirmLabel="Delete week"
        isLoading={
          pendingDeleteScheduleId !== null &&
          scheduleActionLoading === `delete-${pendingDeleteScheduleId}`
        }
      />
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Meal Schedules
                </h1>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {fetchedSchedules.length} weekly schedules
                </p>
              </div>
              <button
                onClick={() => setShowCreateSchedule(true)}
                className="bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors font-medium"
              >
                + Plan This Week
              </button>
            </div>

            <div className="space-y-4">
              {fetchedSchedules.map((s, si) => {
                const mealCount = s.weekPlan.reduce((count, dayPlan) => {
                  const dayMeals = [
                    dayPlan.meals.breakfast,
                    dayPlan.meals.lunch,
                    dayPlan.meals.dinner,
                  ].filter(Boolean).length;
                  return count + dayMeals;
                }, 0);

                const createdLabel = new Date(s.createdAt).toLocaleDateString();
                const currentDay = new Date().getDay();
                const startIndex = (currentDay + 6) % 7;
                const orderedWeekDays = weekDays.map(
                  (_, i) => weekDays[(startIndex + i) % weekDays.length],
                );
                const dayPlanMap = Object.fromEntries(
                  s.weekPlan
                    .filter((dayPlan) => dayPlan?.day)
                    .map((dayPlan) => [dayPlan.day, dayPlan]),
                ) as Record<string, DayPlan>;

                return (
                  <div
                    key={s.id}
                    className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
                  >
                    <div className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors">
                      <button
                        onClick={() => {
                          const next = expandedSchedule === si ? null : si;
                          setExpandedSchedule(next);
                        }}
                        className="flex-1 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-sm">
                            📅
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 text-sm">
                              Week beginning {createdLabel}
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5">
                              {mealCount} meal{mealCount !== 1 ? "s" : ""}{" "}
                              planned
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {si === 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              Current Week
                            </span>
                          )}
                          <svg
                            className={`w-4 h-4 text-zinc-400 transition-transform ${expandedSchedule === si ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      <button
                        onClick={() => setPendingDeleteScheduleId(s.id)}
                        disabled={scheduleActionLoading === `delete-${s.id}`}
                        className="ml-4 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-medium disabled:opacity-60"
                      >
                        Delete week
                      </button>
                    </div>
                    {expandedSchedule === si && (
                      <div className="px-5 pb-5 border-t border-zinc-100">
                        <div className="grid grid-cols-7 gap-3 pt-4">
                          {orderedWeekDays.map((day) => {
                            const dayPlan = dayPlanMap[day];

                            return (
                              <div
                                key={`${s.id}-${day}`}
                                className="flex flex-col bg-zinc-100 border border-zinc-300 rounded-md p-3"
                              >
                                <div className="font-semibold text-sm mb-2">
                                  {day}
                                </div>

                                {[
                                  { key: "breakfast", label: "Breakfast" },
                                  { key: "lunch", label: "Lunch" },
                                  { key: "dinner", label: "Dinner" },
                                ].map((meal) => {
                                  const recipe =
                                    meal.key === "breakfast"
                                      ? dayPlan?.meals?.breakfast
                                      : meal.key === "lunch"
                                        ? dayPlan?.meals?.lunch
                                        : dayPlan?.meals?.dinner;
                                  const mealRecipes = recipes.filter(
                                    (item) => item.mealType === meal.label,
                                  );
                                  const replaceKey = `replace-${s.id}-${day}-${meal.key}`;

                                  return (
                                    <div
                                      key={meal.key}
                                      className="mb-2 last:mb-0"
                                    >
                                      <div className="text-[11px] text-zinc-500 uppercase tracking-wide">
                                        {meal.label}
                                      </div>
                                      {recipe ? (
                                        <button
                                          onClick={() => {
                                            setSelectedScheduleRecipe(recipe);
                                            setSelectedMealType(meal.label);
                                          }}
                                          className="w-full text-left text-xs text-zinc-700 hover:text-zinc-900"
                                        >
                                          <div className="truncate">
                                            {recipe.name}
                                          </div>
                                          <div className="underline text-zinc-500">
                                            More
                                          </div>
                                        </button>
                                      ) : (
                                        <div className="text-xs text-zinc-400">
                                          No meal
                                        </div>
                                      )}

                                      <select
                                        value={
                                          recipe?.id ? String(recipe.id) : ""
                                        }
                                        onChange={(e) =>
                                          handleReplaceMeal(
                                            s.id,
                                            day,
                                            meal.key as
                                              | "breakfast"
                                              | "lunch"
                                              | "dinner",
                                            e.target.value,
                                          )
                                        }
                                        disabled={
                                          scheduleActionLoading === replaceKey
                                        }
                                        className="mt-1 w-full border border-zinc-300 rounded-md px-2 py-1 text-xs bg-white"
                                      >
                                        <option value="">No meal</option>
                                        {mealRecipes.map((item) => (
                                          <option key={item.id} value={item.id}>
                                            {item.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {fetchedSchedules.length === 0 && (
                <div className="text-center text-zinc-500 py-10">
                  No meal schedules found. Start planning your meals for the
                  week!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedScheduleRecipe}
        onClose={() => {
          setSelectedScheduleRecipe(null);
          setSelectedMealType("");
        }}
        title={selectedScheduleRecipe?.name ?? "Recipe details"}
      >
        {selectedScheduleRecipe && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedMealType && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors[selectedMealType]}`}
                >
                  {selectedMealType}
                </span>
              )}
              <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded-full">
                Effort: {selectedScheduleRecipe.effort}
              </span>
              <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded-full">
                Healthiness: {selectedScheduleRecipe.healthiness}
              </span>
            </div>

            <div>
              <div className="text-sm font-medium text-zinc-900 mb-1">
                Rating
              </div>
              <Stars rating={selectedScheduleRecipe.rating ?? 0} />
            </div>

            <div>
              <div className="text-sm font-medium text-zinc-900 mb-1">
                Ingredients
              </div>
              {selectedScheduleRecipe.ingredients?.length ? (
                <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                  {selectedScheduleRecipe.ingredients.map((item) => (
                    <li key={item.ingredient.id}>{item.ingredient.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No ingredients listed.</p>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-zinc-900 mb-1">
                Instructions
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                {selectedScheduleRecipe.instructions ||
                  "No instructions provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
