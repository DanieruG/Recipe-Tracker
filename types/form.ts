import z from "zod";
{/* Contains every field in this app */}

export const scheduleSchema = z.object({
  breakfastEnable: z.boolean(),
  lunchEnable: z.boolean(),
  dinnerEnable: z.boolean(),
  shoppingDay: z.string({ error: "Must select a shopping day!" }),
  lunchDays: z.array(z.string()).optional(),
  requiredIngredients: z.array(z.string()).optional(),
  cheatMeals: z.coerce.number().max(7),
  quickMeals: z.coerce.number().max(7),
}).refine(
    (data) => data.quickMeals + data.cheatMeals <= 7, {
        error: "Invalid sum",
        path: ["quickMeals"],
    }
)

export const recipeSchema = z.object({
    recipeName: z.string().min(1, "Field cannot be empty!"),
    coreIngredients: z.array(z.string()).optional(),
    mealType: z.string({error: "Must select a meal type!"}),
    effort: z.string({error: "Must select level of effort!"}),
    healthiness: z.string({error: "Must select healthiness!"}),
    instructions: z.string().min(1, "Must write some instructions!")

})