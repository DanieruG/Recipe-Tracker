"use client";
import { useState } from "react";
import { Recipe } from "@/generated/prisma/client/client";

// It will be id boolean pairs.
// So when a particular accordion, such as this one, is clicked, it will set to true
// {id: 1, state: false}. rather, it should be ids for breakfast, lunch, and dinner? so setIsOpen is an array of these objects.
type mealPlan = {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
};

export default function AccordionContent({
  recipe,
  dayOfWeek,
}: {
  recipe: mealPlan;
  dayOfWeek: string;
}) {
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  return (
    <div className="border border-gray-300 rounded-sm overflow-hidden w-96 bg-white shadow-lg">
      {/* Will need breakfast, lunch and dinner subsets. */}
      <div className="flex flex-col px-10 py-2 text-left">
        <span className="text-xl text-gray-400">{dayOfWeek}</span>
      </div>
      <button
        className="w-full text-left hover:bg-gray-100 hover:cursor-pointer"
        onClick={() =>
          setIsOpen((prev) => ({ ...prev, breakfast: !prev.breakfast }))
        }
      >
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-md font-semibold">
            Breakfast - <span>{recipe.breakfast?.name}</span>
          </div>
        </div>
      </button>

      {/* Transitions by hiding overflow and height */}
      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen.breakfast ? "max-h-96" : "max-h-0"}`}
      >
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-sm font-semibold">Instructions</div>
          {recipe.breakfast?.instructions}
        </div>
      </div>

      <button
        className="w-full text-left hover:bg-gray-100 hover:cursor-pointer"
        onClick={() => setIsOpen((prev) => ({ ...prev, lunch: !prev.lunch }))}
      >
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-md font-semibold">
            Lunch - {recipe.lunch?.name}
          </div>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen.lunch ? "max-h-96" : "max-h-0"}`}
      >
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-sm font-semibold">Instructions</div>
          {recipe.lunch?.instructions}
        </div>
      </div>

      <button
        className="w-full text-left hover:bg-gray-100 hover:cursor-pointer"
        onClick={() => setIsOpen((prev) => ({ ...prev, dinner: !prev.dinner }))}
      >
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-md font-semibold">
            Dinner - {recipe.dinner?.name}
          </div>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen.dinner ? "max-h-96" : "max-h-0"}`}
      >
        <div className="border-t border-gray-300 px-10 py-2">
          <div className="text-sm font-semibold">Instructions</div>
          {recipe.dinner?.instructions}
        </div>
      </div>
    </div>
  );
}
