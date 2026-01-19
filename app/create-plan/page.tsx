"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import { MultiValue } from "react-select";

type ingredientOption = {
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

export default function createPlan() {
  {
    /* Keeps track of state... such a handy thing!!! One below is for rendering the options... */
  }
  const [ingredientOptions, setIngredients] = useState([]);
  {
    /* Form inputs; this can be shortened, but for beginner code it will do fine. */
  }
  const [lunchTicked, setLunchTicked] = useState(false);
  const [dinnerTicked, setDinnerTicked] = useState(false);
  const [breakfastTicked, setBreakfastTicked] = useState(false);
  const [shoppingDay, setShoppingDay] = useState({});
  const [cheatMeals, setCheatMeals] = useState(null);
  const [quickMeals, setQuickMeals] = useState(null);
  const [lunchDays, setLunchDays] = useState({});
  const [selectIngredient, setSelectIngredient] = useState({});

  {
    /* Set the state thing to an array of options, ingredientOptions initial value = [] */
  }

  useEffect(() => {
    fetch("/api/ingredients")
      .then((response) => response.json())
      .then((data) => setIngredients(data));
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="border border-zinc-700 rounded-xl p-6">
        <div className="text-center text-xl font-bold mb-4">Make your day!</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div id="eat_options">
            <div className="font-semibold mb-2">Include:</div>
            <ul>
              <li>
                <input className="mr-2" type="checkbox" />
                <label>Dinner</label>
              </li>
              <li>
                {/* This one sets the checkbox value based on the state. */}
                <input
                  id="lunch"
                  className="mr-2"
                  type="checkbox"
                  checked={lunchTicked}
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
                    <Select
                      options={daysOfWeek}
                      isMulti
                      menuPlacement="bottom"
                      onChange={(choice) => setLunchDays(choice.values())}
                    />
                  </label>
                </li>
              )}
              <li>
                <input className="mr-2" type="checkbox" />
                <label>Breakfast</label>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2">Select your shopping day:</div>
            <Select
              options={daysOfWeek}
              onChange={(choice) => {
                if (choice) {
                  setShoppingDay(choice.value);
                  console.log(choice.value);
                }
              }}
              required
            />
          </div>

          <div>
            <label className="flex flex-col flex-wrap w-60">
              <span className="font-semibold mb-2">Must-have ingredients:</span>

              {/* Defining the type of choices here was key to getting it to function correctly. */}

              <Select
                options={ingredientOptions}
                onChange={(choices: MultiValue<ingredientOption>) => {
                  if (choices) {
                    const valuesOnly = choices.map((option) => option.value);
                    setSelectIngredient(valuesOnly);
                    console.log(valuesOnly);
                  }
                }}
                isMulti
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
                    className="border border-zinc-700 rounded-sm px-2"
                    type="number"
                  />
                </label>
              </li>

              <li>
                <label className="flex flex-col gap-1">
                  Quick meals (min per week):
                  <input
                    className="border border-zinc-700 rounded-sm px-2"
                    type="number"
                  />
                </label>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button className="bg-black text-white px-4 py-2 rounded">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
