// types.ts
import { Prisma } from "@/generated/prisma/client/client";

export type Recipe = Prisma.RecipeGetPayload<{
    include: {
        ingredients: {
            include: {
                ingredient: true
            }
        }
    };
}>;

export type RecipeFromDb = {
    id: number
    name: string
    mealType: string
    effort: string
    healthiness: string
    instructions: string
    rating?: number | undefined
    tags?: string[]
    lastMade?: Date | null
    timesIncluded?: number
    ingredients?: { ingredient: { id: string; name: string } }[]
}