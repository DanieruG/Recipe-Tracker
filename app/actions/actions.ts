"use server";

import { prisma } from "@/lib/prisma";

export async function createRecipe(formData: {
  recipeName: string;
  coreIngredients: string[];
  mealType: string;
  effort: string;
  healthiness: string;
  instructions: string;
}){
    const ingredients = formData.coreIngredients

    await prisma.recipe.create({
        data: {
            name: formData.recipeName as string,
            mealType: formData.mealType as string,
            effort: formData.effort as string,
            healthiness: formData.healthiness as string,
            instructions: formData.instructions as string,

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