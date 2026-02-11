"use client";
import { useState } from "react";

export default function MealCard() {
  const [isOpen, setIsOpen] = useState(false);

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
        <button
          className="w-full px-10 py-2 pr-12 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Will need breakfast, lunch and dinner subsets. */}
          <div className="flex flex-col">
            <span className="text-xl text-gray-400">Monday</span>
          </div>
        </button>
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-sm font-semibold">Breakfast</div>
        </div>
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-sm font-semibold">Lunch</div>
        </div>

        {isOpen && (
          <div className="border-t border-gray-300 px-10 py-2">
            <div className="text-sm font-semibold">Ingredients</div>
            {/* Need some sort of API to call and fetch all of these. Needs */}
            <ul className="text-sm text-gray-600">
              <li>Chicken</li>
              <li>Pasta</li>
            </ul>
            <div className="text-sm font-semibold">Instructions</div>
            <div className="text-sm font-semibold">Tags</div>
          </div>
        )}
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
