"use client";
import { useState } from "react";
import { Recipe } from "@/generated/prisma/client/client";
import AccordionContent from "@/components/AccordionContent";

export default function MealCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isItem, setItemId] = useState<Record<string, boolean>>({});

  type mealPlan = {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
  };

  // This will store the day, and the meals for that day.
  type dayPlan = {
    day: string;
    meals: mealPlan;
  };

  const schedule = localStorage.getItem("recipes");

  const recipes: dayPlan[] = schedule ? JSON.parse(schedule) : [];
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

      {/* Accordion for each day */}
      <div className="grid grid-cols-4 grid-rows-2 gap-6 items-start justify-center">
        {recipes.map((dayPlan, index) => (
          <AccordionContent
            key={index}
            recipe={dayPlan.meals}
            dayOfWeek={dayPlan.day}
          />
        ))}
      </div>

      {/* Footer with quick stats */}
      <div className="flex gap-4 mt-8">
        <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-orange-500">7</div>
          <div className="text-xs text-gray-600">Days Planned</div>
        </div>
        <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-amber-500">21</div>
          <div className="text-xs text-gray-600">Unique Meals This Week</div>
        </div>
        <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">45</div>
          <div className="text-xs text-gray-600">Ingredients</div>
        </div>
      </div>
    </div>
  );
}
