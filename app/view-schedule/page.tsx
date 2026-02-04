"use client";
import { useState } from "react";

export default function MealCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-y-4 justify-center items-center min-h-screen bg-gray-100">
      <div className="border border-gray-300 rounded-sm overflow-hidden w-96">
        <button
          className="w-full px-10 py-2 pr-12 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Monday</span>
            <span className="text-xl">Spaghetti with Meatballs</span>
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-gray-300 px-10 py-2">
            <div className="text-sm font-semibold">Ingredients</div>
            <ul className="text-sm text-gray-600">
              <li>Chicken</li>
              <li>Pasta</li>
            </ul>
            <div className="text-sm font-semibold">Instructions</div>
            <div className="text-sm font-semibold">Tags</div>
          </div>
        )}
      </div>
    </div>
  );
}
