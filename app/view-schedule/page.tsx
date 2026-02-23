"use client";
import { useState } from "react";
import { Recipe } from "@/types/recipe";
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

  const ingredients = recipes.map((dayPlan) => {
    return (
      dayPlan.meals.dinner?.ingredients.map((i) => i.ingredient.name) || []
    );
  });
  {/* Gets the dinner ingredients list for 7 days. But duplicates need removing. */}

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
      <div className="grid grid-cols-4 gap-6 items-start justify-center">
        {recipes.map((dayPlan, index) => (
          <AccordionContent
            key={index}
            recipe={dayPlan.meals}
            dayOfWeek={dayPlan.day}
          />
        ))}
      </div>

      {/* Shopping List for the week */}
      <div className="text-center mb-6 mt-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Shopping List</h1>
        <p className="text-gray-600">
          Here's your shopping list for this week:
        </p>
      </div>

      <div className="border border-gray-300 rounded-sm overflow-hidden w-140 bg-white shadow-lg">
        <div className="flex flex-col px-10 py-2 text-left">
          {/* Map through the recipes, and get the ingredients for each recipe. */}
          <div className="border border-gray-300 rounded-md overflow-hidden mt-4 shadow-lg">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 px-2 pr-8 border border-gray-300">
                    Ingredient
                  </th>
                  <th className="text-left px-2 pr-8 border border-gray-300">
                    Estimated price
                  </th>
                  <th className="text-left px-2 pr-8 border border-gray-300">
                    Modify details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 px-2">
                    Chicken Thighs
                  </td>
                  <td className="border border-gray-300 px-2">£2.19</td>
                  <td className="border border-gray-300 px-2">
                    <button className="text-blue-500 hover:underline">
                      Edit
                    </button>
                    <button className="text-red-500 hover:underline ml-4">
                      Remove
                    </button>
                  </td>
                </tr>
                {ingredients[0].map((ingredient, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 px-2">
                      {ingredient}
                    </td>
                    <td className="border border-gray-300 px-2">£0.00</td>
                    <td className="border border-gray-300 px-2">
                      <button className="text-blue-500 hover:underline">
                        Edit
                      </button>
                      <button className="text-red-500 hover:underline ml-4">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
