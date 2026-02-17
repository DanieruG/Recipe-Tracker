"use client";
import { useState } from "react";

type recipe = {
  id: number;
  name: string;
  mealType: string;
  effort: string;
  healthiness: string;
  instructions: string;
}[];

export default function MealCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isItem, setItemId] = useState<Record<string, boolean>>({});

  const schedule = localStorage.getItem("recipes");

  const recipes: recipe = schedule ? JSON.parse(schedule) : [];
  // If schedule; parse it, else, log empty string.

  return (
    <div className="flex flex-col gap-y-4 justify-center items-center min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Weekly Meal Plan
        </h1>
        <p className="text-gray-600">Plan your meals for the week ahead</p>
      </div>

      <div className="border border-gray-300 rounded-sm overflow-hidden w-96 bg-white shadow-lg">
        {/* Will need breakfast, lunch and dinner subsets. */}
        <div className="flex flex-col px-10 py-2 text-left">
          <span className="text-xl text-gray-400">Monday</span>
        </div>
        <button className="w-full text-left" onClick={() => setIsOpen(!isOpen)}>
          <div className="border-t border-gray-300 px-10 py-2">
            <div className="text-sm font-semibold">Breakfast</div>
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-gray-300 px-10 py-2">
            {recipes.map((c) => (
              <>
                <div className="text-sm font-semibold">Instructions</div>
                <p>{c.instructions}</p>
              </>
            ))}
          </div>
        )}

        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-sm font-semibold">Lunch</div>
        </div>
      </div>

      {/* Footer with quick stats */}
      <div className="flex gap-4 mt-8">
        <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-orange-500">7</div>
          <div className="text-xs text-gray-600">Days Planned</div>
        </div>
        <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-amber-500">21</div>
          <div className="text-xs text-gray-600">Meals This Week</div>
        </div>
        <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">45</div>
          <div className="text-xs text-gray-600">Ingredients</div>
        </div>
      </div>
    </div>
  );
}
