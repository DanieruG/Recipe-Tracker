import z from "zod";
{/* Contains every field in this app */ }

export const scheduleSchema = z.object({
    sessionId: z.string().optional(),
    breakfastEnable: z.boolean(),
    lunchEnable: z.boolean(),
    dinnerEnable: z.boolean(),
    selectedBreakfastRecipeIds: z.array(z.string()).default([]),
    selectedLunchRecipeIds: z.array(z.string()).default([]),
    selectedDinnerRecipeIds: z.array(z.string()).default([]),
}).refine(
    (data) => data.breakfastEnable || data.lunchEnable || data.dinnerEnable,
    {
        message: "Select at least one meal type.",
        path: ["breakfastEnable"],
    }
)

export const recipeSchema = z.object({
    sessionId: z.string().optional(),
    recipeName: z.string().min(1, "Field cannot be empty!"),
    coreIngredients: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    mealType: z.string({ error: "Must select a meal type!" }),
    effort: z.string().optional(),
    healthiness: z.string().optional(),
    instructions: z.string().min(1, "Must write some instructions!"),
    rating: z.number()
        .min(0, "Rating cannot be negative")
        .max(5, "Rating cannot be more than 5")
        .optional()

})