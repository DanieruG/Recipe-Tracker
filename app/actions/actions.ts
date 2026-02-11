"use server";

import { prisma } from "@/lib/prisma";
import z, { success } from "zod";
import { recipeSchema, scheduleSchema } from "@/types/form";

type recipe = z.infer<typeof recipeSchema>
type custom = z.infer<typeof scheduleSchema>

export async function createRecipe(formData: recipe){

    const ingredients = formData.coreIngredients

    {/* Returns boolean */}
    const result = recipeSchema.safeParse(formData) 

    if (!result.success){
        return {
            success: false,
            errors: z.flattenError(result.error)}
    }

    await prisma.recipe.create({
        data: {
            name: formData.recipeName as string,
            mealType: formData.mealType as string,
            effort: formData.effort as string,
            healthiness: formData.healthiness as string,
            instructions: formData.instructions as string,

            ingredients: {
                create: ingredients?.map((ingredient) => ({
                    ingredient: {
                        connectOrCreate: {
                            where: { name: ingredient as string },
                            create: { name: ingredient as string },
                    }
                }})),
            },
        },
    })

    return {success: true}
}

export async function createSchedule(formData: custom){
    // This is the function where we create the logic for creating a plan.
    // Look up things in the database, such as recipes, to create a schedule.
    const checkTrue = formData.dinnerEnable || formData.lunchEnable || formData.breakfastEnable

    const result = scheduleSchema.safeParse(formData) // Doesn't return data if parse fails. Only success and a ZodError object

    if (!result.success){
        return {
            success: false,
            checkValid: checkTrue,
            errors: z.flattenError(result.error)
        }
    } else {
        //   First; collect recipes   that are one of the  selected.
        // Prisma results return an array of objects.
        // Collect  which options are enabled
        const options = [formData.breakfastEnable &&  "Breakfast",
            formData.dinnerEnable && "Dinner" , 
            formData.lunchEnable && "Lunch"
        ].filter(Boolean) as string[]

        //  Factors: meal type, and ingredients.
        const recipes =  await prisma.recipe.findMany({
            where: {
                mealType: {in: options},

                ...((formData.requiredIngredients)?.length && {ingredients: {
                    some: {
                        ingredient: {
                            name: {in: formData.requiredIngredients}
                    }
                }

                
            }})

                
        }})

        return {
            success: true,
            validRecipes: recipes
        }
    }

    // If parsed successfully... then create a schedule.
    // All schedule consist of 7 days; lunch only appears on select days.
    // Must start from the shopping day.
    // But first, collect all recipes matching plan criteria.

}