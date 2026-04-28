"use client";
import { useCallback, useEffect, useState } from "react";
import Stars from "@/components/Stars";
import NavBar from "@/components/NavBar";
import { Modal } from "@/components/Modal";
import { RecipeFromDb } from "@/types/recipe";
import AddRecipe from "@/components/AddRecipe";
import { buildSessionHeaders } from "@/lib/session";

const categoryColors: Record<string, string> = {
  Breakfast: "bg-amber-100 text-amber-700",
  Lunch: "bg-sky-100 text-sky-700",
  Dinner: "bg-indigo-100 text-indigo-700",
  Snack: "bg-emerald-100 text-emerald-700",
};

const PAGE_SIZE = 24;

type PaginatedRecipeResponse = {
  recipes: RecipeFromDb[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function ViewRecipes() {
  const [recipeSearch, setRecipeSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [favoriteFilter, setFavoriteFilter] = useState<"all" | "favorites">(
    "all",
  );
  const [recipes, setRecipes] = useState<RecipeFromDb[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeFromDb | null>(
    null,
  );
  const [editRecipe, setEditRecipe] = useState<RecipeFromDb | null>(null);
  const [deleteRecipe, setDeleteRecipe] = useState<RecipeFromDb | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    mealType: "Breakfast",
    effort: "",
    healthiness: "",
    instructions: "",
    rating: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<number | null>(
    null,
  );

  const fetchRecipes = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });

      const trimmedSearch = recipeSearch.trim();
      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (filterCat !== "All") {
        params.set("mealType", filterCat);
      }

      if (favoriteFilter === "favorites") {
        params.set("favoriteOnly", "true");
      }

      const response = await fetch(`/api/recipe-list?${params.toString()}`, {
        headers: buildSessionHeaders(),
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setRecipes(data);
        setTotalRecipes(data.length);
        setTotalPages(1);
        return;
      }

      const payload = data as PaginatedRecipeResponse;
      setRecipes(payload.recipes ?? []);
      setTotalRecipes(payload.total ?? 0);
      setTotalPages(payload.totalPages ?? 1);

      if (
        payload.totalPages &&
        payload.totalPages > 0 &&
        currentPage > payload.totalPages
      ) {
        setCurrentPage(payload.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    }
  }, [currentPage, favoriteFilter, filterCat, recipeSearch]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [favoriteFilter, filterCat, recipeSearch]);

  const handleToggleFavorite = async (recipe: RecipeFromDb) => {
    setFavoriteLoadingId(recipe.id);
    setActionError("");

    try {
      const response = await fetch("/api/recipe-list", {
        method: "PATCH",
        headers: buildSessionHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          id: recipe.id,
          isFavorite: !recipe.isFavorite,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update favorite state.");
      }

      if (selectedRecipe?.id === recipe.id) {
        setSelectedRecipe((prev) =>
          prev ? { ...prev, isFavorite: !recipe.isFavorite } : prev,
        );
      }

      await fetchRecipes();
    } catch (error) {
      console.error(error);
      setActionError("Failed to update favorite. Please try again.");
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  const openEditModal = (recipe: RecipeFromDb) => {
    setActionError("");
    setEditRecipe(recipe);
    setEditForm({
      name: recipe.name,
      mealType: recipe.mealType,
      effort: recipe.effort ?? "",
      healthiness: recipe.healthiness ?? "",
      instructions: recipe.instructions,
      rating: recipe.rating != null ? String(recipe.rating) : "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editRecipe) return;

    setIsSaving(true);
    setActionError("");

    try {
      const response = await fetch("/api/recipe-list", {
        method: "PUT",
        headers: buildSessionHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          id: editRecipe.id,
          name: editForm.name,
          mealType: editForm.mealType,
          effort: editForm.effort,
          healthiness: editForm.healthiness,
          instructions: editForm.instructions,
          rating: editForm.rating === "" ? null : Number(editForm.rating),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save recipe changes.");
      }

      await fetchRecipes();
      setEditRecipe(null);
    } catch (error) {
      console.error(error);
      setActionError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!deleteRecipe) return;

    setIsDeleting(true);
    setActionError("");

    try {
      const response = await fetch("/api/recipe-list", {
        method: "DELETE",
        headers: buildSessionHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: deleteRecipe.id }),
      });

      if (!response.ok) {
        throw new Error("Unable to delete recipe.");
      }

      if (selectedRecipe?.id === deleteRecipe.id) {
        setSelectedRecipe(null);
      }

      await fetchRecipes();
      setDeleteRecipe(null);
    } catch (error) {
      console.error(error);
      setActionError("Failed to delete recipe. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <NavBar current="Recipes" onNewRecipe={() => setShowAddRecipe(true)} />
      <Modal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        title="Add Recipe"
      >
        <AddRecipe
          inModal
          onClose={() => {
            setShowAddRecipe(false);
            fetchRecipes();
          }}
        />
      </Modal>
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Recipes
                </h1>
                <p className="text-zinc-500 text-sm mt-0.5">
                  Showing {recipes.length} of {totalRecipes} recipes
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <input
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                placeholder="Search recipes..."
                className="border border-zinc-200 rounded-lg px-4 py-2 text-sm w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
              />
              <div className="flex gap-1 overflow-x-auto pb-1">
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
              <div className="flex gap-1 overflow-x-auto pb-1">
                <button
                  onClick={() => setFavoriteFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    favoriteFilter === "all"
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  All Recipes
                </button>
                <button
                  onClick={() => setFavoriteFilter("favorites")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    favoriteFilter === "favorites"
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  Favorites
                </button>
              </div>
            </div>

            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}

            {/* Recipe cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recipes.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-400 transition-colors cursor-pointer group"
                  onClick={() => setSelectedRecipe(r)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[r.mealType]}`}
                    >
                      {r.mealType}
                    </span>
                    <div className="relative flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(r);
                        }}
                        disabled={favoriteLoadingId === r.id}
                        className="text-lg leading-none text-amber-400 hover:text-amber-500 disabled:opacity-50"
                        aria-label={
                          r.isFavorite
                            ? `Remove ${r.name} from favorites`
                            : `Add ${r.name} to favorites`
                        }
                        title={
                          r.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {r.isFavorite ? "★" : "☆"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(open === r.id ? null : r.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-700 text-sm"
                      >
                        •••
                      </button>
                      {open === r.id && (
                        <div
                          className="absolute right-0 mt-1 w-32 bg-white border border-zinc-200 rounded-md shadow-lg z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpen(null);
                              openEditModal(r);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpen(null);
                              setDeleteRecipe(r);
                              setActionError("");
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-1 leading-snug">
                    {r.name}
                  </h3>
                  {r.isFavorite && (
                    <div className="text-xs text-amber-600 font-medium">
                      Favorite
                    </div>
                  )}
                  <Stars rating={r.rating ?? 0} />
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                    <span>⏱ 10</span>
                    <span>👤 1 servings</span>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {r.tags?.map((t: string | { id: number; name: string }) => (
                      <span
                        key={typeof t === "string" ? t : t.id}
                        className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full"
                      >
                        {typeof t === "string" ? t : t.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-100">
                    Added{" "}
                    {r.lastMade
                      ? new Date(r.lastMade).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              ))}
              {recipes.length === 0 && (
                <div className="sm:col-span-2 xl:col-span-3 text-center text-zinc-500">
                  No recipes found.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-zinc-200 bg-white rounded-lg px-4 py-3">
                <div className="text-sm text-zinc-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 text-zinc-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm rounded-md bg-zinc-900 text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <Modal
              isOpen={!!selectedRecipe}
              onClose={() => {
                setSelectedRecipe(null);
                setOpen(null);
              }}
              title={selectedRecipe?.name ?? "Recipe details"}
            >
              {selectedRecipe && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors[selectedRecipe.mealType]}`}
                    >
                      {selectedRecipe.mealType}
                    </span>
                    {selectedRecipe.isFavorite && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        Favorite
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-zinc-900 mb-1">
                      Rating
                    </div>
                    <Stars rating={selectedRecipe.rating ?? 0} />
                  </div>

                  <div>
                    <div className="text-sm font-medium text-zinc-900 mb-1">
                      Ingredients
                    </div>
                    {selectedRecipe.ingredients?.length ? (
                      <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                        {selectedRecipe.ingredients.map((item) => (
                          <li key={item.ingredient.id}>
                            {item.ingredient.name}
                          </li>
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
                      {selectedRecipe.instructions ||
                        "No instructions provided."}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-zinc-900 mb-1">
                      Tags
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {selectedRecipe.tags?.length ? (
                        selectedRecipe.tags.map((t) => (
                          <span
                            key={t.id}
                            className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full"
                          >
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500">No tags.</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 border-t border-zinc-100 pt-3">
                    Added{" "}
                    {selectedRecipe.lastMade
                      ? new Date(selectedRecipe.lastMade).toLocaleDateString()
                      : "N/A"}
                    {" · Included "}
                    {selectedRecipe.timesIncluded ?? 0} times
                  </div>
                </div>
              )}
            </Modal>

            <Modal
              isOpen={!!editRecipe}
              onClose={() => {
                setEditRecipe(null);
                setActionError("");
              }}
              title={editRecipe ? `Edit ${editRecipe.name}` : "Edit recipe"}
            >
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <label className="block text-sm text-zinc-700">
                  Name
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </label>

                <div className="grid col-span-3 gap-3">
                  <label className="block text-sm text-zinc-700">
                    Meal type
                    <select
                      value={editForm.mealType}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          mealType: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                    >
                      {Object.keys(categoryColors).map((meal) => (
                        <option key={meal} value={meal}>
                          {meal}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm text-zinc-700">
                  Rating
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={editForm.rating}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        rating: e.target.value,
                      }))
                    }
                    className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-sm text-zinc-700">
                  Instructions
                  <textarea
                    value={editForm.instructions}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm min-h-32"
                    required
                  />
                </label>

                {actionError && (
                  <p className="text-sm text-red-600">{actionError}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditRecipe(null);
                      setActionError("");
                    }}
                    className="px-3 py-2 text-sm rounded-md border border-zinc-300 text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-3 py-2 text-sm rounded-md bg-zinc-900 text-white disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </Modal>

            <Modal
              isOpen={!!deleteRecipe}
              onClose={() => {
                setDeleteRecipe(null);
                setActionError("");
              }}
              title="Delete recipe"
            >
              <div className="space-y-4">
                <p className="text-sm text-zinc-700">
                  Delete{" "}
                  <span className="font-medium">{deleteRecipe?.name}</span>?
                  This action cannot be undone.
                </p>

                {actionError && (
                  <p className="text-sm text-red-600">{actionError}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDeleteRecipe(null);
                      setActionError("");
                    }}
                    className="px-3 py-2 text-sm rounded-md border border-zinc-300 text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRecipe}
                    disabled={isDeleting}
                    className="px-3 py-2 text-sm rounded-md bg-red-600 text-white disabled:opacity-60"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
}
