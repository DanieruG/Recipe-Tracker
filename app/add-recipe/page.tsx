"use client";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { createRecipe } from "../actions/actions";
import { Form, useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";

type Options = {
  label: string;
  value: string;
};

const mealTypes = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
];

const mealDifficulty = [
  { value: "quick", label: "Quick" },
  { value: "moderate", label: "Moderate" },
  { value: "slow", label: "Slow" },
];

const healthiness = [
  { value: "balanced", label: "Balanced" },
  { value: "cheat", label: "Cheat Meal" },
];

type formFields = {
  recipeName: string;
  coreIngredients: string[];
  mealType: string;
  effort: string;
  healthiness: string;
  instructions: string;
};

export default function addRecipe() {
  const { control, getValues } = useForm<formFields>();
  const [coreIngredients, setCoreIng] = useState<Options[]>([]);

  useEffect(() => {
    fetch("api/ingredients")
      .then((response) => response.json())
      .then((data) => setCoreIng(data));
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="border border-zinc-700 rounded-xl p-6">
        <div className="text-xl font-semibold mb-2">Add a recipe</div>
        <form action={createRecipe}>
          <div className="grid grid-cols-2 auto-rows-min h-full gap-x-8 gap-y-4">
            <label className="flex flex-col">
              Recipe Name:
              <Controller
                name="recipeName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="border border-zinc-700 rounded-sm px-2 h-10"
                  />
                )}
              />
            </label>

            <label className="flex flex-col">
              Core Ingredients (optional):
              <Controller
                name="coreIngredients"
                control={control}
                render={({ field }) => (
                  <CreatableSelect
                    {...field}
                    name="coreIngredients"
                    className="w-60"
                    options={coreIngredients}
                    value={coreIngredients.filter((c) =>
                      field.value?.includes(c.value),
                    )}
                    onChange={(option) => {
                      field.onChange(option.map((c) => c.value));
                    }}
                    isMulti
                  />
                )}
              />
            </label>

            <label className="flex flex-col">
              Meal Type:
              <Controller
                name="mealType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={mealTypes}
                    value={mealTypes.find((c) => c.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                  />
                )}
              />
            </label>

            <label className="flex flex-col">
              Effort:
              <Controller
                name="effort"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    name="effort"
                    options={mealDifficulty}
                    value={mealDifficulty.find((c) => c.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                  />
                )}
              />
            </label>

            <label className="flex flex-col col-span-2">
              Healthiness
              {/* control links the name to the appropriate form field. field has a property value. */}
              <Controller
                name="healthiness"
                control={control}
                render={({ field }) => (
                  <Select
                    name="healthiness"
                    options={healthiness}
                    value={healthiness.find((c) => c.value === field.value)}
                    onChange={(option) => {
                      field.onChange(option?.value);
                    }}
                  />
                )}
              />
            </label>

            <label className="flex flex-col col-span-2">
              Instructions:
              <textarea
                placeholder="Write your recipe here..."
                className="border border-zinc-700 rounded-sm px-2 py-2 w-full field-sizing-content"
                name="instructions"
              ></textarea>
            </label>

            <button
              type="button"
              onClick={() => console.log(getValues())}
              className="col-span-2 bg-black text-white rounded px-4 py-2 justify-self-center"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
