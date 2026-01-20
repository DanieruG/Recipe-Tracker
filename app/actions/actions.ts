"use server";

import { prisma } from "@/lib/prisma";
import z from "zod";

const recipeSchema = z.object({
    recipeName: z.string().min(1, "Field cannot be empty!"),
    coreIngredients: z.array(z.string()).optional(),
    mealType: z.string({error: "Must select a meal type!"}),
    effort: z.string({error: "Must select level of effort!"}),
    healthiness: z.string({error: "Must select healthiness!"}),
    instructions: z.string().min(1, "Must write some instructions!")

})

type recipe = z.infer<typeof recipeSchema>

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