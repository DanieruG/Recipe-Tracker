"use server";

import { prisma } from "@/lib/prisma";
import z, { success } from "zod";
import { recipeSchema, scheduleSchema } from "@/types/form";

type recipe = z.infer<typeof recipeSchema>
type custom = z.infer<typeof scheduleSchema>

// Types for the weekly plan that will be stored as JSON in the DB
type RecipeFromDb = {
    id: number
    name: string
    mealType: string
    effort: string
    healthiness: string
    instructions: string
    rating?: number | null
    tags?: any[]
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
function shuffler(array: any[]) {
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
            name: formData.recipeName as string,
            mealType: formData.mealType as string,
            effort: formData.effort as string,
            healthiness: formData.healthiness as string,
            instructions: formData.instructions as string,
            rating: formData.rating as number,

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
    // This is the function where we create the logic for creating a plan.
    // Look up things in the database, such as recipes, to create a schedule.
    const checkTrue = formData.dinnerEnable || formData.lunchEnable || formData.breakfastEnable

    const result = scheduleSchema.safeParse(formData) // Doesn't return data if parse fails. Only success and a ZodError object

    if (!result.success) {
        return {
            success: false,
            checkValid: checkTrue,
            errors: z.flattenError(result.error)
        }
    }
    //   First; collect recipes   that are one of the  selected.
    // Prisma results return an array of objects.
    // Collect  which options are enabled
    const options = [formData.breakfastEnable && "Breakfast",
    formData.dinnerEnable && "Dinner",
    formData.lunchEnable && "Lunch"
    ].filter(Boolean) as string[]


    //  Factors: meal type, and ingredients.
    const recipes = await prisma.recipe.findMany({
        where: {
            mealType: { in: options },

            ...((formData.requiredIngredients)?.length && {
                ingredients: {
                    some: {
                        ingredient: {
                            name: { in: formData.requiredIngredients }
                        }
                    }



                }
            })


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

    const breakfast_options = shuffler(recipes.filter((c) => c.mealType == "Breakfast"))
    const lunch_options = shuffler(recipes.filter((c) => c.mealType == "Lunch"))
    const dinner_options = shuffler(recipes.filter((c) => c.mealType == "Dinner"))
    // First, filter the recipes. Then, distribute across 7 days.
    // Need a mealPlan type, which will be made up of  breakfast, lunch and dinner.


    // This will store the day, and the meals for that day.

    const weeklyPlan: WeekPlan = []
    // Now, construct the weekly plan based on the available recipes.

    for (let i = 0; i < 7; i++) {
        const newMealPlan: mealPlan = {
            breakfast: formData.breakfastEnable ? breakfast_options[
                i % breakfast_options.length
            ] : undefined,
            lunch: formData.lunchEnable ? lunch_options[
                i % lunch_options.length
            ] : undefined,
            dinner: formData.dinnerEnable ? dinner_options[
                i % dinner_options.length
            ] : undefined
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
            weekPlan: weeklyPlan
        }
    })

    // Create shopping list from all ingredients in the recipes
    const ingredientIds = new Set<string>();
    recipes.forEach((recipe) => {
        recipe.ingredients.forEach((recipeIngredient) => {
            ingredientIds.add(recipeIngredient.ingredient.id);
        });
    });

    await prisma.shoppingList.create({
        data: {
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