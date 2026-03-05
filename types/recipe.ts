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
    userId?: string | null
    name: string
    mealType: string
    isFavorite?: boolean
    effort: string | null
    healthiness: string | null
    instructions: string
    rating?: number | undefined
    tags?: { id: number; name: string }[]
    lastMade?: Date | string | null
    timesIncluded?: number
    ingredients?: { ingredient: { id: string; name: string } }[]
}