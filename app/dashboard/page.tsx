"use client";
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Stars from "@/components/Stars";
import StatCard from "@/components/StatCard";
import { RecipeFromDb } from "@/types/recipe";
import { Modal } from "@/components/Modal";
import AddRecipe from "@/components/AddRecipe"; // component for recipe form

const categoryColors: Record<string, string> = {
  Breakfast: "bg-amber-100 text-amber-700",
  Lunch: "bg-sky-100 text-sky-700",
  Dinner: "bg-indigo-100 text-indigo-700",
  Snack: "bg-emerald-100 text-emerald-700",
};

// mirror shopping list types used elsewhere
export type ShoppingListItem = {
  shoppingListId: number;
  ingredientId: string;
  checked: boolean;
  ingredient: {
    id: string;
    name: string;
  };
};

export type ShoppingList = {
  id: number;
  createdAt: string;
  items: ShoppingListItem[];
  status: boolean;
};

type MealPlan = {
  breakfast?: RecipeFromDb | null;
  lunch?: RecipeFromDb | null;
  dinner?: RecipeFromDb | null;
};

type DayPlan = {
  day: string;
  meals: MealPlan;
};

type ScheduleFromDb = {
  id: number;
  createdAt: string;
  weekPlan: DayPlan[];
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

function isDateInCurrentWeek(dateInput: string | Date) {
  const date = new Date(dateInput);
  const now = new Date();

  const currentDay = now.getDay();
  const daysSinceMonday = (currentDay + 6) % 7;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

export default function Dashboard() {
  const [recipes, setRecipes] = useState<RecipeFromDb[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [schedules, setSchedules] = useState<ScheduleFromDb[]>([]);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedScheduleRecipe, setSelectedScheduleRecipe] =
    useState<RecipeFromDb | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>("");

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

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch("/api/shopping-lists");
        const data = await response.json();
        setShoppingLists(data);
      } catch (error) {
        console.error("Failed to fetch shopping lists:", error);
      }
    };

    fetchLists();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("/api/schedules");
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      }
    };

    fetchSchedules();
  }, []);

  const currentWeekSchedule = schedules.find((schedule) =>
    isDateInCurrentWeek(schedule.createdAt),
  );

  const currentWeekPlan = Array.isArray(currentWeekSchedule?.weekPlan)
    ? currentWeekSchedule.weekPlan
    : [];

  const dayPlanMap = Object.fromEntries(
    currentWeekPlan
      .filter((dayPlan) => dayPlan?.day)
      .map((dayPlan) => [dayPlan.day, dayPlan]),
  ) as Record<string, DayPlan>;

  const handleCheckboxChange = async (
    shoppingListId: number,
    ingredientId: string,
    checked: boolean,
  ) => {
    try {
      const response = await fetch("/api/shopping-lists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppingListId, ingredientId, checked }),
      });

      if (response.ok) {
        setShoppingLists(
          shoppingLists.map((list) =>
            list.id === shoppingListId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.ingredientId === ingredientId
                      ? { ...item, checked }
                      : item,
                  ),
                }
              : list,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      <NavBar current="Dashboard" onNewRecipe={() => setShowAddRecipe(true)} />
      <Modal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        title="Add Recipe"
      >
        <AddRecipe inModal onClose={() => setShowAddRecipe(false)} />
      </Modal>

      <main className="max-w-8xl mx-auto px-6 py-8">
        <section>
          <div className="font-semibold text-4xl flex items-center">
            <span>Good morning! 👋</span>
          </div>
          <p className="text-sm text-zinc-500">
            Here's what's on the menu today...
          </p>
          <div className="flex flex-row justify-between items-stretch gap-6">
            <div className="flex-1">
              <StatCard
                icon="📖"
                number={recipes.length}
                title="Recipes Saved"
                description="An additional 4 recipes added this week!"
              />
            </div>
            <div className="flex-1">
              <StatCard
                icon="🛒"
                number={shoppingLists.length}
                title="Shopping Lists"
                description="3 active lists for the week"
              />
            </div>
            <div className="flex-1">
              <StatCard
                icon="📅"
                number={schedules.length}
                title="Meal Plans"
                description="2 meal plans scheduled this month"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="border border-zinc-200 rounded-md mt-10 bg-white p-6">
            <div className="flex flex-row justify-between">
              <div className="font-semibold">
                This week's schedule at a glance:
              </div>
              <a className="text-zinc-500 underline hover:text-black">
                View more
              </a>
            </div>
            {currentWeekSchedule ? (
              <div className="grid grid-cols-7 gap-3 mt-4">
                {weekDays.map((day) => {
                  const dayPlan = dayPlanMap[day];

                  return (
                    <div
                      key={day}
                      className="flex flex-col bg-zinc-100 border border-zinc-300 rounded-md p-3"
                    >
                      <div className="font-semibold text-sm mb-2">{day}</div>

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

                        return (
                          <div key={meal.key} className="mb-2 last:mb-0">
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
                                <div className="truncate">{recipe.name}</div>
                                <div className="underline text-zinc-500">
                                  More
                                </div>
                              </button>
                            ) : (
                              <div className="text-xs text-zinc-400">
                                No meal
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 text-sm text-zinc-500">
                No schedule found for the current week. Create a weekly plan to
                see breakfast, lunch, and dinner at a glance.
              </div>
            )}
          </div>
        </section>

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
                  <p className="text-sm text-zinc-500">
                    No ingredients listed.
                  </p>
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

        <section>
          <div className="grid grid-cols-2 mt-10 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-zinc-900">Recently Added</h2>
                <button className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-2">
                  All recipes
                </button>
              </div>
              <div className="space-y-3">
                {recipes.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-800">
                        {r.name}
                      </div>
                      <div className="text-xs text-zinc-400">
                        Added on{" "}
                        {r.lastMade
                          ? new Date(r.lastMade).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                    <Stars rating={r.rating ?? 0} />
                  </div>
                ))}
                {recipes.length === 0 && (
                  <div className="text-center text-zinc-500 py-10">
                    No recipes made yet. Start cooking to see your history here!
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-zinc-900">
                  Latest Shopping List
                </h2>
                <button className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-2">
                  All lists
                </button>
              </div>
              {shoppingLists.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-zinc-700">
                      Shopping List
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      {shoppingLists[0].items.every((it) => it.checked)
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {shoppingLists[0].items.slice(0, 5).map((item) => (
                      <div
                        key={item.ingredientId}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) =>
                            handleCheckboxChange(
                              shoppingLists[0].id,
                              item.ingredientId,
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 rounded border-2 border-zinc-300 accent-zinc-900 cursor-pointer"
                        />
                        <span
                          className={`text-sm flex-1 ${
                            item.checked
                              ? "text-zinc-400 line-through"
                              : "text-zinc-700"
                          }`}
                        >
                          {item.ingredient.name}
                        </span>
                      </div>
                    ))}
                    {shoppingLists[0].items.length > 5 && (
                      <div className="text-xs text-zinc-400 pt-1">
                        +{shoppingLists[0].items.length - 5} more items
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-500 py-10">
                  No shopping lists yet. Not gonna eat?
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
