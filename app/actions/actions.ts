"use server";

import { prisma } from "@/lib/prisma";

export async function createRecipe(formData: FormData){
    console.log(formData)

    const ingredients = formData.getAll("coreIngredients")

    await prisma.recipe.create({
        data: {
            name: formData.get("recipeName") as string,
            mealType: formData.get("mealType") as string,
            effort: formData.get("effort") as string,
            healthiness: formData.get("healthiness") as string,
            instructions: formData.get("instructions") as string,

            ingredients: {
                create: ingredients.map((ingredient) => ({
                    ingredient: {
                        connectOrCreate: {
                            where: { name: ingredient as string },
                            create: { name: ingredient as string },
                    }
                }})),
            },
        },
    })
}