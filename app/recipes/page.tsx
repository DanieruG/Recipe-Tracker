"use client";
import { useState, useEffect } from "react";
import Stars from "@/components/Stars";
import NavBar from "@/components/NavBar";
import { RecipeFromDb } from "@/types/recipe";

const categoryColors: Record<string, string> = {
  Breakfast: "bg-amber-100 text-amber-700",
  Lunch: "bg-sky-100 text-sky-700",
  Dinner: "bg-indigo-100 text-indigo-700",
  Snack: "bg-emerald-100 text-emerald-700",
};

export default function viewRecipes() {
  const [recipeSearch, setRecipeSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [recipes, setRecipes] = useState<RecipeFromDb[]>([]);

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

  const filteredRecipes = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(recipeSearch.toLowerCase()) &&
      (filterCat === "All" || r.mealType === filterCat),
  );

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Recipes
                </h1>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {recipes.length} recipes saved
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <input
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                placeholder="Search recipes..."
                className="border border-zinc-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
              />
              <div className="flex gap-1">
                {["All", "Breakfast", "Lunch", "Dinner", "Snack"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filterCat === cat
                        ? "bg-zinc-900 text-white"
                        : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe cards */}
            <div className="grid grid-cols-3 gap-4">
              {filteredRecipes.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-400 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[r.mealType]}`}
                    >
                      {r.mealType}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-700 text-sm">
                      •••
                    </button>
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-1 leading-snug">
                    {r.name}
                  </h3>
                  <Stars rating={r.rating ?? 0} />
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                    <span>⏱ 10</span>
                    <span>👤 1 servings</span>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {r.tags?.map((t: any) => (
                      <span
                        key={t.id ?? t}
                        className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full"
                      >
                        {typeof t === "string" ? t : t.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-100">
                    Last made {r.lastMade?.toDateString() ?? "never"}
                  </div>
                </div>
              ))}
              {filteredRecipes.length === 0 && (
                <div className="col-span-3 text-center text-zinc-500">
                  No recipes found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
