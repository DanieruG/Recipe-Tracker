"use client";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { createRecipe } from "../app/actions/actions";
import { Form, useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import Error from "@/components/Error";
import NavBar from "@/components/NavBar";

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
  tags?: string[];
  rating?: number;
  mealType: string;
  effort: string;
  healthiness: string;
  instructions: string;
};

interface AddRecipeProps {
  inModal?: boolean;
  onClose?: () => void; // callback when modal should close
}

export default function AddRecipe({ inModal, onClose }: AddRecipeProps) {
  const { register, control, handleSubmit, reset } = useForm<formFields>();
  const [coreIngredients, setCoreIng] = useState<Options[]>([]);
  const [tagOptions, setTagOptions] = useState<Options[]>([]);
  const [success, setSuccess] = useState(false);

  {
    /* Either filled, or undefined. */
  }
  type FieldErrors = Record<string, string[] | undefined>;

  const [errors, setErrors] = useState<FieldErrors>();

  useEffect(() => {
    fetch("api/ingredients")
      .then((response) => response.json())
      .then((data) => setCoreIng(data));
  }, []);

  useEffect(() => {
    fetch("api/tags")
      .then((response) => response.json())
      .then((data) => {
        setTagOptions(data);
      })
      .catch(() => setTagOptions([]));
  }, []);

  const onSubmit = async (data: formFields) => {
    const res = await createRecipe(data);

    if (!res.success) {
      setErrors(res.errors?.fieldErrors);
      return;
    }

    setErrors(undefined);
    reset();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <>
      {!inModal && <NavBar />}
      <div
        className={`flex flex-col justify-center items-center ${inModal ? "" : "min-h-screen"}`}
      >
        <div
          className={`border border-zinc-300 bg-white overflow-hidden shadow-lg rounded-xl p-6 ${inModal ? "" : "mb-40"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-semibold">Add a recipe</div>
            {inModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="bg-black font-semibold text-white rounded-md py-2 px-3"
              >
                Close
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 auto-rows-min h-full gap-x-8 gap-y-4">
              <label className="flex flex-col">
                Recipe Name:
                <input
                  {...register("recipeName")}
                  name="recipeName"
                  type="text"
                  className={`border rounded-sm px-2 h-10 ${errors?.recipeName ? "border-red-700 focus:outline-red-700 focus:outline-1" : "border-zinc-300 focus:outline-1"}`}
                  defaultValue={""}
                />
                {errors?.recipeName && (
                  <div className="text-sm text-red-500">
                    {errors?.recipeName.map((c) => c)}
                  </div>
                )}
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
                      className={"w-60"}
                      options={coreIngredients}
                      value={coreIngredients.filter((c) =>
                        field.value?.includes(c.value),
                      )}
                      onChange={(option) => {
                        field.onChange(option.map((c) => c.value));
                      }}
                      onCreateOption={(inputValue) => {
                        const newOption = {
                          value: inputValue,
                          label: inputValue,
                        };
                        setCoreIng((prev) => [...prev, newOption]);
                        field.onChange([...(field.value || []), inputValue]);
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
                {errors?.mealType && <Error msg={errors?.mealType[0]}></Error>}
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
                      value={mealDifficulty.find(
                        (c) => c.value === field.value,
                      )}
                      onChange={(option) => field.onChange(option?.value)}
                    />
                  )}
                />
                {errors?.effort && (
                  <div className="text-sm text-red-500">
                    {errors?.effort.map((c) => c)}
                  </div>
                )}
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
                {errors?.healthiness && (
                  <div className="text-sm text-red-500">
                    {errors?.healthiness.map((c) => c)}
                  </div>
                )}
              </label>

              <label className="flex flex-col col-span-2">
                Tags (optional):
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      {...field}
                      name="tags"
                      className={"w-full"}
                      options={tagOptions}
                      value={tagOptions.filter((c) =>
                        field.value?.includes(c.value),
                      )}
                      onChange={(option) => {
                        field.onChange(option.map((c) => c.value));
                      }}
                      onCreateOption={(inputValue) => {
                        const newOption = {
                          value: inputValue,
                          label: inputValue,
                        };
                        setTagOptions((prev) => [...prev, newOption]);
                        field.onChange([...(field.value || []), inputValue]);
                      }}
                      isMulti
                    />
                  )}
                />
              </label>

              <label className="flex flex-col col-span-2">
                Rating (optional, max 5):
                <input
                  {...register("rating", {
                    valueAsNumber: true,
                    max: { value: 5, message: "Rating cannot be more than 5" },
                  })}
                  name="rating"
                  type="number"
                  min={0}
                  max={5}
                  className={`border rounded-sm px-2 h-10 ${errors?.rating ? "border-red-700 focus:outline-red-700 focus:outline-1" : "border-zinc-300 focus:outline-1"}`}
                />
                {errors?.rating && <Error msg={errors?.rating[0]} />}
                <div className="mt-2">Instructions:</div>
                <textarea
                  {...register("instructions")}
                  placeholder="Write your recipe here..."
                  className="border border-zinc-300 rounded-sm px-2 py-2 w-full field-sizing-content whitespace-pre-wrap"
                  name="instructions"
                ></textarea>
                {errors?.instructions && (
                  <div className="text-sm text-red-500">
                    {errors?.instructions.map((c) => c)}
                  </div>
                )}
              </label>

              <button
                type="submit"
                className="col-span-2 bg-black font-semibold text-white rounded-md px-4 py-2 justify-self-center hover:cursor-pointer hover:bg-zinc-600 transition duration-200"
              >
                Submit
              </button>
              {success && (
                <div className="col-span-2 text-center text-green-400">
                  Recipe added successfully!
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
