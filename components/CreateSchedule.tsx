"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import { createSchedule } from "@/app/actions/actions";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { RecipeFromDb } from "@/types/recipe";
import Error from "@/components/Error";
import { buildSessionHeaders, getOrCreateSessionId } from "@/lib/session";

type Options = {
  label: string;
  value: string;
};

type formFields = {
  breakfastEnable: boolean;
  lunchEnable: boolean;
  dinnerEnable: boolean;
  selectedBreakfastRecipeIds: string[];
  selectedLunchRecipeIds: string[];
  selectedDinnerRecipeIds: string[];
};

interface CreateScheduleProps {
  inModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function CreateSchedule({
  inModal,
  onClose,
  onSuccess,
}: CreateScheduleProps) {
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeFromDb[]>([]);
  type FieldErrors = Record<string, string[] | undefined>;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");

  const { register, handleSubmit, control } = useForm<formFields>({
    defaultValues: {
      breakfastEnable: false,
      lunchEnable: false,
      dinnerEnable: false,
      selectedBreakfastRecipeIds: [],
      selectedLunchRecipeIds: [],
      selectedDinnerRecipeIds: [],
    },
  });

  const breakfastTicked = useWatch({ control, name: "breakfastEnable" });
  const lunchTicked = useWatch({ control, name: "lunchEnable" });
  const dinnerTicked = useWatch({ control, name: "dinnerEnable" });

  const router = useRouter();

  useEffect(() => {
    fetch("/api/recipe-list", {
      headers: buildSessionHeaders(),
    })
      .then((response) => response.json())
      .then((data) =>
        setFavoriteRecipes(Array.isArray(data) ? (data as RecipeFromDb[]) : []),
      );
  }, []);

  const breakfastOptions: Options[] = favoriteRecipes
    .filter((recipe) => recipe.mealType === "Breakfast")
    .map((recipe) => ({ value: String(recipe.id), label: recipe.name }));

  const lunchOptions: Options[] = favoriteRecipes
    .filter((recipe) => recipe.mealType === "Lunch")
    .map((recipe) => ({ value: String(recipe.id), label: recipe.name }));

  const dinnerOptions: Options[] = favoriteRecipes
    .filter((recipe) => recipe.mealType === "Dinner")
    .map((recipe) => ({ value: String(recipe.id), label: recipe.name }));

  const onSubmit = async (data: formFields) => {
    setSubmitError("");
    setErrors({});
    const res = await createSchedule({
      ...data,
      sessionId: getOrCreateSessionId(),
    });

    if (!res?.success) {
      const fieldErrors = (res?.errors?.fieldErrors as FieldErrors) ?? {};
      setErrors(fieldErrors);
      setSubmitError(
        Object.keys(fieldErrors).length === 0
          ? "Failed to create schedule."
          : "",
      );
      return;
    }

    localStorage.setItem("recipes", JSON.stringify(res.validRecipes));
    onSuccess?.();

    if (inModal) {
      onClose?.();
    } else {
      router.push("/view-schedule");
    }
  };

  return (
    <div
      className={`flex flex-col justify-center items-center ${inModal ? "" : "min-h-screen"}`}
    >
      <div
        className={`border border-zinc-300 rounded-xl shadow-lg p-6 ${inModal ? "w-full border-0 shadow-none p-0" : ""}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-zinc-700 mb-2">
                Include meal types
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <label className="flex items-center gap-2 border border-zinc-200 rounded-md px-3 py-2 bg-white">
                  <input {...register("breakfastEnable")} type="checkbox" />
                  Breakfast
                </label>
                <label className="flex items-center gap-2 border border-zinc-200 rounded-md px-3 py-2 bg-white">
                  <input {...register("lunchEnable")} type="checkbox" />
                  Lunch
                </label>
                <label className="flex items-center gap-2 border border-zinc-200 rounded-md px-3 py-2 bg-white">
                  <input {...register("dinnerEnable")} type="checkbox" />
                  Dinner
                </label>
              </div>
              {errors?.breakfastEnable?.map((msg, index) => (
                <Error key={`mealtype-${index}`} msg={msg} />
              ))}
            </div>

            {breakfastTicked && (
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">
                  Breakfast recipes (optional)
                </label>
                <Controller
                  name="selectedBreakfastRecipeIds"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={breakfastOptions}
                      value={breakfastOptions.filter((option) =>
                        field.value?.includes(option.value),
                      )}
                      onChange={(options) =>
                        field.onChange(
                          options ? options.map((c) => c.value) : [],
                        )
                      }
                      isMulti
                      placeholder="Leave blank to auto-pick favorites"
                    />
                  )}
                />
                {errors?.selectedBreakfastRecipeIds?.map((msg, index) => (
                  <Error key={`breakfast-${index}`} msg={msg} />
                ))}
              </div>
            )}

            {lunchTicked && (
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">
                  Lunch recipes (optional)
                </label>
                <Controller
                  name="selectedLunchRecipeIds"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={lunchOptions}
                      value={lunchOptions.filter((option) =>
                        field.value?.includes(option.value),
                      )}
                      onChange={(options) =>
                        field.onChange(
                          options ? options.map((c) => c.value) : [],
                        )
                      }
                      isMulti
                      placeholder="Leave blank to auto-pick favorites"
                    />
                  )}
                />
                {errors?.selectedLunchRecipeIds?.map((msg, index) => (
                  <Error key={`lunch-${index}`} msg={msg} />
                ))}
              </div>
            )}

            {dinnerTicked && (
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">
                  Dinner recipes (optional)
                </label>
                <Controller
                  name="selectedDinnerRecipeIds"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={dinnerOptions}
                      value={dinnerOptions.filter((option) =>
                        field.value?.includes(option.value),
                      )}
                      onChange={(options) =>
                        field.onChange(
                          options ? options.map((c) => c.value) : [],
                        )
                      }
                      isMulti
                      placeholder="Leave blank to auto-pick favorites"
                    />
                  )}
                />
                {errors?.selectedDinnerRecipeIds?.map((msg, index) => (
                  <Error key={`dinner-${index}`} msg={msg} />
                ))}
              </div>
            )}

            <p className="text-xs text-zinc-500">
              Recipe choices are optional. If left blank for an enabled meal
              type, favorites are selected at random.
            </p>
          </div>

          <div className="flex justify-end mt-2">
            <button className="bg-zinc-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-zinc-700">
              Create
            </button>
          </div>
          {submitError && (
            <div className="text-sm text-red-500 mt-3 text-center">
              {submitError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
