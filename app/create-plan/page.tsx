"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import { createSchedule } from "../actions/actions";
import { useForm, Controller } from "react-hook-form";
import { check } from "zod";
import { useRouter } from "next/navigation";

type Options = {
  label: string;
  value: string;
};

const daysOfWeek = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

{
  /* Sample ingredients... need to be fetched from the database */
}
type formFields = {
  breakfastEnable: boolean;
  lunchEnable: boolean;
  dinnerEnable: boolean;
  shoppingDay: string;
  lunchDays: string[];
  requiredIngredients: string[];
  cheatMeals: number;
  quickMeals: number;
};

{
  /* The sum of cheatMeals and quickMeals should not be more than 7. It should also not allow decimals. */
}

export default function createPlan() {
  {
    /* Keeps track of state... such a handy thing!!! One below is for rendering the options... */
  }
  const [ingredientOptions, setIngredients] = useState<Options[]>([]);
  {
    /* Form inputs; this can be shortened, but for beginner code it will do fine. */
  }
  const [lunchTicked, setLunchTicked] = useState(false);
  const [dinnerTicked, setDinnerTicked] = useState(false);
  const [breakfastTicked, setBreakfastTicked] = useState(false);
  const [lunchDays, setLunchDays] = useState({});
  const [selectIngredient, setSelectIngredient] = useState({});

  type FieldErrors = Record<string, string[] | undefined>;

  const [errors, setErrors] = useState<FieldErrors>();
  const [checkState, setCheckState] = useState<boolean | undefined>();
  {
    /* Set the state thing to an array of options, ingredientOptions initial value = [] */
  }

  const { register, handleSubmit, control } = useForm<formFields>({
    defaultValues: {
      breakfastEnable: false,
      lunchEnable: false,
      dinnerEnable: false,
    },
  });

  const router = useRouter();

  useEffect(() => {
    fetch("/api/ingredients")
      .then((response) => response.json())
      .then((data) => setIngredients(data));
  }, []);

  const onSubmit = async (data: formFields) => {
    const res = await createSchedule(data);

    if (!res?.success) {
      setErrors(res?.errors?.fieldErrors);
      setCheckState(res?.checkValid);
      console.log(errors);
      return;
    } else {
      localStorage.setItem("recipes", JSON.stringify(res.validRecipes));
      router.push("/view-schedule");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="border border-gray-300 rounded-xl shadow-lg p-6">
        <div className="text-xl font-semibold mb-2">Create a schedule.</div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div id="eat_options">
              <div className="mb-2">Include:</div>
              <ul>
                <li>
                  <input
                    {...register("dinnerEnable")}
                    className="mr-2"
                    type="checkbox"
                  />
                  <label>Dinner</label>
                </li>
                <li>
                  {/* This one sets the checkbox value based on the state. */}
                  <input
                    {...register("lunchEnable")}
                    id="lunch"
                    className="mr-2"
                    type="checkbox"
                    onChange={(e) => setLunchTicked(e.target.checked)}
                  />
                  <label>Lunch</label>
                </li>

                {/* e.target.checked is a boolean which updates the state set above, depending on whether its ticked or not. */}
                {lunchTicked && (
                  <li>
                    <label
                      className="flex flex-col flex-wrap w-60"
                      id="lunch_prompt"
                    >
                      On which days?
                      <Controller
                        name="lunchDays"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={daysOfWeek}
                            value={daysOfWeek.filter((c) =>
                              field.value?.includes(c.value),
                            )}
                            onChange={(option) => field.onChange()}
                            menuPlacement="bottom"
                            isMulti
                          />
                        )}
                      />
                    </label>
                  </li>
                )}
                <li>
                  <input
                    {...register("breakfastEnable")}
                    className="mr-2"
                    type="checkbox"
                    onChange={(e) => setBreakfastTicked(e.target.checked)}
                  />
                  <label>Breakfast</label>
                </li>
              </ul>
              {checkState === false && (
                <div className="text-sm text-red-500">
                  You must check at least one of the boxes.
                </div>
              )}
            </div>

            <div>
              <div className="font-semibold mb-2">
                Select your shopping day:
              </div>
              <Controller
                name="shoppingDay"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={daysOfWeek}
                    value={daysOfWeek.find((c) => c.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                  />
                )}
              />
              {errors?.shoppingDay && (
                <div className="text-sm text-red-500">
                  {errors?.shoppingDay.map((c) => c)}
                </div>
              )}
            </div>

            <div>
              <label className="flex flex-col flex-wrap w-60">
                <span className="font-semibold mb-2">
                  Must-have ingredients (optional):
                </span>

                {/* Defining the type of choices here was key to getting it to function correctly. */}

                <Controller
                  name="requiredIngredients"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={ingredientOptions}
                      value={ingredientOptions.filter((c) =>
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
            </div>

            <div>
              <div className="font-semibold">Finer tweaks (optional):</div>
              <ul>
                <li>
                  <label className="flex flex-col gap-1 mb-6">
                    Cheat meals (min per week):
                    <input
                      {...register("cheatMeals")}
                      className="border border-zinc-300 rounded-sm px-2 h-10"
                      type="number"
                    />
                  </label>
                </li>

                <li>
                  <label className="flex flex-col gap-1">
                    Quick meals (min per week):
                    <input
                      {...register("quickMeals")}
                      className="border border-zinc-300 rounded-sm px-2 h-10"
                      type="number"
                    />
                    {errors?.quickMeals && (
                      <div className="text-sm text-red-500">
                        {errors?.quickMeals.map((c) => c)}
                      </div>
                    )}
                  </label>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button className="bg-black text-white rounded px-4 py-2 justify-self-center hover:cursor-pointer">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
