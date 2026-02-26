"use client";

import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";
import { RecipeFromDb } from "@/types/recipe";

type mealPlan = {
  breakfast?: RecipeFromDb | null;
  lunch?: RecipeFromDb | null;
  dinner?: RecipeFromDb | null;
};
type DayPlan = {
  day: string;
  meals: mealPlan;
};

type WeekPlan = DayPlan[];

export default function Schedules() {
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null);
  const [fetchedSchedules, setFetchedSchedules] = useState<WeekPlan>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("/api/schedules");
        const data = await response.json();
        // Handle fetched data as needed
        setFetchedSchedules(data);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Meal Schedules
                </h1>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {fetchedSchedules.length} past schedules
                </p>
              </div>
              <button className="bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors font-medium">
                + Plan This Week
              </button>
            </div>

            <div className="space-y-4">
              {fetchedSchedules.map((s, si) => {
                const mealCount = Object.values(s.meals).filter(
                  (m) => m !== null,
                ).length;
                return (
                  <div
                    key={si}
                    className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedSchedule(expandedSchedule === si ? null : si)
                      }
                      className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-sm">
                          📅
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 text-sm">
                            {s.day}
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {mealCount} meal{mealCount !== 1 ? "s" : ""} planned
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {si === 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Current Week
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 text-zinc-400 transition-transform ${expandedSchedule === si ? "rotate-180" : ""}`}
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
                    {expandedSchedule === si && (
                      <div className="px-5 pb-5 border-t border-zinc-100">
                        <div className="space-y-3 pt-4">
                          {s.meals.breakfast && (
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                              <div className="text-xs font-bold text-zinc-400 mb-2">
                                BREAKFAST
                              </div>
                              <div className="text-sm text-zinc-900 font-medium">
                                {s.meals.breakfast.name}
                              </div>
                            </div>
                          )}
                          {s.meals.lunch && (
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                              <div className="text-xs font-bold text-zinc-400 mb-2">
                                LUNCH
                              </div>
                              <div className="text-sm text-zinc-900 font-medium">
                                {s.meals.lunch.name}
                              </div>
                            </div>
                          )}
                          {s.meals.dinner && (
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                              <div className="text-xs font-bold text-zinc-400 mb-2">
                                DINNER
                              </div>
                              <div className="text-sm text-zinc-900 font-medium">
                                {s.meals.dinner.name}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {fetchedSchedules.length === 0 && (
                <div className="text-center text-zinc-500 py-10">
                  No meal schedules found. Start planning your meals for the
                  week!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
