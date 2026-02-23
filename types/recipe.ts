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