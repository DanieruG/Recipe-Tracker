"use client";
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Stars from "@/components/Stars";
import StatCard from "@/components/StatCard";
import { RecipeFromDb } from "@/types/recipe";
import { Modal } from "@/components/Modal";
import AddRecipe from "@/components/AddRecipe"; // component for recipe form

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

export default function Dashboard() {
  const [recipes, setRecipes] = useState<RecipeFromDb[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [showAddRecipe, setShowAddRecipe] = useState(false);

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
      <NavBar onNewRecipe={() => setShowAddRecipe(true)} />
      <Modal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        title="Add Recipe"
      >
        <AddRecipe inModal onClose={() => setShowAddRecipe(false)} />
      </Modal>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section>
          <div className="font-semibold text-4xl flex items-center">
            <span>Good morning! 👋</span>
          </div>
          <p className="text-sm text-zinc-500">
            Here's what's on the menu today...
          </p>
          <div className="flex flex-row justify-between items -stretch gap-6">
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
                number={8}
                title="Shopping Lists"
                description="3 active lists for the week"
              />
            </div>
            <div className="flex-1">
              <StatCard
                icon="📅"
                number={12}
                title="Meal Plans"
                description="2 meal plans scheduled this month"
              />
            </div>
            <div className="flex-1">
              <StatCard
                icon="⭐"
                number={18}
                title="Favorite Recipes"
                description="Your most loved recipes at a glance"
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
            <div className="flex flex-row justify-center gap-6 mt-4">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <div
                  key={day}
                  className="flex flex-col bg-zinc-100 border border-zinc-300 rounded-md p-4"
                >
                  <div className="font-semibold">{day}</div>
                  <div className="text-sm text-zinc-500">
                    Chicken stir fry, Salad
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                        Added on {r.lastMade?.toDateString() ?? "Never"}
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
