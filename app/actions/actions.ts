"use server";

import { prisma } from "@/lib/prisma";
import z from "zod";
import { recipeSchema, scheduleSchema } from "@/types/form";

type recipe = z.infer<typeof recipeSchema>
type custom = z.infer<typeof scheduleSchema>

// Types for the weekly plan that will be stored as JSON in the DB
type RecipeFromDb = {
    id: number
    userId?: string | null
    name: string
    mealType: string
    isFavorite?: boolean
    effort: string | null
    healthiness: string | null
    instructions: string
    rating?: number | null
    tags?: { id: number; name: string }[]
    lastMade?: Date | null
    timesIncluded?: number
    ingredients?: { ingredient: { id: string; name: string } }[]
}
type mealPlan = {
    breakfast?: RecipeFromDb | null,
    lunch?: RecipeFromDb | null,
    dinner?: RecipeFromDb | null

}
type DayPlan = {
    day: string
    meals: mealPlan
}

type WeekPlan = DayPlan[]

// This is a Fisher-Yates shuffle.
function shuffler<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function getDayName(index: number): string {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return daysOfWeek[index % 7];
}

export async function createRecipe(formData: recipe) {

    const ingredients = formData.coreIngredients

    {/* Returns boolean */ }
    const result = recipeSchema.safeParse(formData)

    if (!result.success) {
        return {
            success: false,
            errors: z.flattenError(result.error)
        }
    }

    await prisma.recipe.create({
        data: {
            userId: formData.sessionId?.trim() || null,
            name: formData.recipeName as string,
            mealType: formData.mealType as string,
            instructions: formData.instructions as string,
            rating: formData.rating as number,
            ...(formData.effort ? { effort: formData.effort } : {}),
            ...(formData.healthiness ? { healthiness: formData.healthiness } : {}),

            tags: {
                connectOrCreate: formData.tags?.map((t) => ({
                    where: { name: t },
                    create: { name: t }
                }))
            },

            ingredients: {
                create: ingredients?.map((ingredient) => ({
                    ingredient: {
                        connectOrCreate: {
                            where: { name: ingredient as string },
                            create: { name: ingredient as string },
                        }
                    }
                })),
            },
        },
    })

    return { success: true }
}

export async function createSchedule(formData: custom) {
    const result = scheduleSchema.safeParse(formData)

    if (!result.success) {
        return {
            success: false,
            errors: z.flattenError(result.error)
        }
    }

    const sessionId = formData.sessionId?.trim();

    // Collect which options are enabled
    const options = [formData.breakfastEnable && "Breakfast",
    formData.dinnerEnable && "Dinner",
    formData.lunchEnable && "Lunch"
    ].filter(Boolean) as string[]

    // Pull all recipes for enabled meal types.
    const recipes = await prisma.recipe.findMany({
        where: {
            ...(sessionId
                ? {
                    OR: [{ userId: null }, { userId: sessionId }],
                }
                : { userId: null }),
            mealType: { in: options },
        },

        include: {
            ingredients: {
                include: {
                    ingredient: true
                }
            }
        }
    }

    )

    const missingMealTypes = options.filter((mealType) => {
        const hasRecipe = recipes.some((recipe) => recipe.mealType === mealType);
        return !hasRecipe;
    });

    const fieldErrors: Record<string, string[]> = {};
    const appendFieldError = (field: string, message: string) => {
        if (!fieldErrors[field]) {
            fieldErrors[field] = [];
        }
        fieldErrors[field].push(message);
    };

    if (missingMealTypes.length > 0) {
        if (missingMealTypes.includes("Breakfast")) {
            appendFieldError("selectedBreakfastRecipeIds", "Add at least one breakfast recipe before creating a schedule.");
        }

        if (missingMealTypes.includes("Lunch")) {
            appendFieldError("selectedLunchRecipeIds", "Add at least one lunch recipe before creating a schedule.");
        }

        if (missingMealTypes.includes("Dinner")) {
            appendFieldError("selectedDinnerRecipeIds", "Add at least one dinner recipe before creating a schedule.");
        }

        return {
            success: false,
            errors: { fieldErrors },
        };
    }

    const selectedByMealType: Record<"Breakfast" | "Lunch" | "Dinner", string[] | undefined> = {
        Breakfast: formData.selectedBreakfastRecipeIds,
        Lunch: formData.selectedLunchRecipeIds,
        Dinner: formData.selectedDinnerRecipeIds,
    };

    const buildMealPool = (mealType: "Breakfast" | "Lunch" | "Dinner") => {
        const mealTypeRecipes = recipes.filter((recipe) => recipe.mealType === mealType);
        const selectedIds = selectedByMealType[mealType] ?? [];

        if (!selectedIds.length) {
            const mealTypeFavorites = mealTypeRecipes.filter((recipe) => recipe.isFavorite);
            if (mealTypeFavorites.length > 0) {
                return shuffler([...mealTypeFavorites]);
            }

            return shuffler([...mealTypeRecipes]);
        }

        const selectedIdSet = new Set(
            selectedIds
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id)),
        );

        const selectedRecipes = mealTypeRecipes.filter((recipe) =>
            selectedIdSet.has(recipe.id),
        );

        if (!selectedRecipes.length) {
            return null;
        }

        return shuffler([...selectedRecipes]);
    };

    const breakfast_options = buildMealPool("Breakfast")
    const lunch_options = buildMealPool("Lunch")
    const dinner_options = buildMealPool("Dinner")

    if (formData.breakfastEnable && !breakfast_options?.length) {
        appendFieldError(
            "selectedBreakfastRecipeIds",
            "Selected breakfast recipes are invalid. Choose breakfast recipes.",
        );
    }

    if (formData.lunchEnable && !lunch_options?.length) {
        appendFieldError(
            "selectedLunchRecipeIds",
            "Selected lunch recipes are invalid. Choose lunch recipes.",
        );
    }

    if (formData.dinnerEnable && !dinner_options?.length) {
        appendFieldError(
            "selectedDinnerRecipeIds",
            "Selected dinner recipes are invalid. Choose dinner recipes.",
        );
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            success: false,
            errors: { fieldErrors },
        };
    }
    // First, filter the recipes. Then, distribute across 7 days.
    // Need a mealPlan type, which will be made up of  breakfast, lunch and dinner.


    // This will store the day, and the meals for that day.

    const weeklyPlan: WeekPlan = []
    // Now, construct the weekly plan based on the available recipes.

    for (let i = 0; i < 7; i++) {
        const newMealPlan: mealPlan = {};

        if (formData.breakfastEnable && breakfast_options) {
            newMealPlan.breakfast = breakfast_options[i % breakfast_options.length];
        }

        if (formData.lunchEnable && lunch_options) {
            newMealPlan.lunch = lunch_options[i % lunch_options.length];
        }

        if (formData.dinnerEnable && dinner_options) {
            newMealPlan.dinner = dinner_options[i % dinner_options.length];
        }
        // This builds an object, with mod being used to prevent index out of bounds.

        weeklyPlan.push({
            day: getDayName(i),
            meals: newMealPlan
        })
    }

    // Persist the constructed weekly plan to the database as JSON
    const created = await prisma.schedule.create({
        data: {
            userId: sessionId || null,
            weekPlan: weeklyPlan
        }
    })

    // Create shopping list from all ingredients actually used in the weekly plan
    const ingredientIds = new Set<string>();
    weeklyPlan.forEach((dayPlan) => {
        const meals = [dayPlan.meals.breakfast, dayPlan.meals.lunch, dayPlan.meals.dinner].filter(
            Boolean,
        ) as RecipeFromDb[];

        meals.forEach((recipe) => {
            recipe.ingredients?.forEach((recipeIngredient) => {
                ingredientIds.add(recipeIngredient.ingredient.id);
            });
        });
    });

    await prisma.shoppingList.create({
        data: {
            userId: sessionId || null,
            items: {
                create: Array.from(ingredientIds).map((ingredientId) => ({
                    ingredientId
                }))
            }
        }
    });

    return {
        success: true,
        validRecipes: weeklyPlan,
        scheduleId: created.id
    }
}

// If parsed successfully... then create a schedule.
// All schedule consist of 7 days; lunch only appears on select days.
// Must start from the shopping day.
// But first, collect all recipes matching plan criteria.