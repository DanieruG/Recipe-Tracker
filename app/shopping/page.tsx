"use client";
import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import AddRecipe from "@/components/AddRecipe";
import ConfirmModal from "@/components/ConfirmModal";

type ShoppingListItem = {
  shoppingListId: number;
  ingredientId: string;
  checked: boolean;
  ingredient: {
    id: string;
    name: string;
  };
  status: boolean;
};

type ShoppingList = {
  id: number;
  createdAt: string;
  items: ShoppingListItem[];
  status: boolean;
};

export default function Shopping() {
  const [expandedList, setExpandedList] = useState<number | null>(null);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newItemByList, setNewItemByList] = useState<Record<number, string>>(
    {},
  );
  const [actionLoading, setActionLoading] = useState("");
  const [pendingDeleteListId, setPendingDeleteListId] = useState<number | null>(
    null,
  );

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/shopping-lists");
      const data = await response.json();
      setShoppingLists(data);
    } catch (error) {
      console.error("Failed to fetch shopping lists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        const result = await response.json();
        setShoppingLists(
          shoppingLists.map((list) =>
            list.id === shoppingListId
              ? (() => {
                  const updatedItems = list.items.map((item) =>
                    item.ingredientId === ingredientId
                      ? { ...item, checked }
                      : item,
                  );

                  return {
                    ...list,
                    items: updatedItems,
                    status:
                      typeof result?.status === "boolean"
                        ? result.status
                        : updatedItems.length > 0 &&
                          updatedItems.every((item) => item.checked),
                  };
                })()
              : list,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddItem = async (shoppingListId: number) => {
    const ingredientName = (newItemByList[shoppingListId] ?? "").trim();
    if (!ingredientName) return;

    setActionLoading(`add-${shoppingListId}`);
    try {
      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppingListId, ingredientName }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      setNewItemByList((prev) => ({ ...prev, [shoppingListId]: "" }));
      await fetchLists();
    } catch (error) {
      console.error("Failed to add shopping list item:", error);
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteItem = async (
    shoppingListId: number,
    ingredientId: string,
  ) => {
    setActionLoading(`delete-item-${shoppingListId}-${ingredientId}`);
    try {
      const response = await fetch("/api/shopping-lists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppingListId, ingredientId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      await fetchLists();
    } catch (error) {
      console.error("Failed to delete shopping list item:", error);
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteList = async (shoppingListId: number) => {
    setActionLoading(`delete-list-${shoppingListId}`);
    try {
      const response = await fetch("/api/shopping-lists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppingListId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete list");
      }

      if (expandedList === shoppingListId) {
        setExpandedList(null);
      }

      await fetchLists();
    } catch (error) {
      console.error("Failed to delete shopping list:", error);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <>
      <NavBar
        current="Shopping List"
        onNewRecipe={() => setShowAddRecipe(true)}
      />
      <Modal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        title="Add Recipe"
      >
        <AddRecipe inModal onClose={() => setShowAddRecipe(false)} />
      </Modal>
      <ConfirmModal
        isOpen={pendingDeleteListId !== null}
        onClose={() => setPendingDeleteListId(null)}
        onConfirm={async () => {
          if (pendingDeleteListId === null) return;
          await handleDeleteList(pendingDeleteListId);
          setPendingDeleteListId(null);
        }}
        title="Delete shopping list"
        message="Delete this entire shopping list? This action cannot be undone."
        confirmLabel="Delete list"
        isLoading={
          pendingDeleteListId !== null &&
          actionLoading === `delete-list-${pendingDeleteListId}`
        }
      />
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Shopping Lists
                </h1>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {shoppingLists.length} past lists
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {shoppingLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedList(expandedList === list.id ? null : list.id)
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-sm">
                        🛒
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 text-sm">
                          Shopping List
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {formatDate(list.createdAt)} · {list.items.length}{" "}
                          items
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs ${list.status ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"} px-2 py-0.5 rounded-full font-medium capitalize`}
                      >
                        {list.status ? "completed" : "active"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteListId(list.id);
                        }}
                        disabled={actionLoading === `delete-list-${list.id}`}
                        className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium disabled:opacity-60"
                      >
                        Delete
                      </button>
                      <svg
                        className={`w-4 h-4 text-zinc-400 transition-transform ${expandedList === list.id ? "rotate-180" : ""}`}
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

                  {expandedList === list.id && (
                    <div className="px-5 pb-5 border-t border-zinc-100">
                      <div className="pt-4 space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            value={newItemByList[list.id] ?? ""}
                            onChange={(e) =>
                              setNewItemByList((prev) => ({
                                ...prev,
                                [list.id]: e.target.value,
                              }))
                            }
                            placeholder="Add ingredient..."
                            className="flex-1 border border-zinc-300 rounded-md px-3 py-2 text-sm"
                          />
                          <button
                            onClick={() => handleAddItem(list.id)}
                            disabled={actionLoading === `add-${list.id}`}
                            className="text-sm bg-zinc-900 text-white px-3 py-2 rounded-md disabled:opacity-60"
                          >
                            {actionLoading === `add-${list.id}`
                              ? "Adding..."
                              : "Add"}
                          </button>
                        </div>

                        {list.items.map((item) => (
                          <div
                            key={item.ingredientId}
                            className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  list.id,
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
                            <button
                              onClick={() =>
                                handleDeleteItem(list.id, item.ingredientId)
                              }
                              disabled={
                                actionLoading ===
                                `delete-item-${list.id}-${item.ingredientId}`
                              }
                              className="text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {shoppingLists.length === 0 && !loading && (
                <div className="text-center text-zinc-500 py-10">
                  No shopping lists found. Start adding items to your lists to
                  see them here!
                </div>
              )}
            </div>

            {/* Quick generate */}
            <div className="bg-zinc-900 text-white rounded-xl p-6 flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">
                  Generate from meal plan
                </div>
                <div className="text-zinc-400 text-sm">
                  Automatically build a shopping list from this week's schedule.
                </div>
              </div>
              <button className="bg-white text-zinc-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors shrink-0">
                Generate List →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
