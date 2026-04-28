import breakfastRecipes from "./recipes_breakfast.json";
import dinnerRecipes from "./recipes_dinner.json";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RawRecipe = {
    title?: string;
    difficulty?: string;
    rating?: string;
    tags?: string[];
    ingredients?: string[][];
    instructions?: string[];
};

const difficultyToEffort: Record<string, string> = {
    easy: "quick",
    medium: "moderate",
    hard: "slow",
};

function normaliseRating(rawRating?: string): number | null {
    if (!rawRating) return null;
    const match = rawRating.match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;
    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed)) return null;
    return Math.max(0, Math.min(5, Math.round(parsed)));
}

function normaliseInstructions(rawInstructions?: string[]): string {
    if (!Array.isArray(rawInstructions)) return "";
    return rawInstructions
        .map((step) => (step ?? "").trim())
        .filter(Boolean)
        .join("\n\n");
}

function normaliseIngredients(rawIngredients?: string[][]): string[] {
    if (!Array.isArray(rawIngredients)) return [];

    return Array.from(
        new Set(
            rawIngredients
                .map((entry) => {
                    if (!Array.isArray(entry)) return "";
                    const candidate = (entry[1] || entry[0] || "").trim();
                    return candidate;
                })
                .filter(Boolean),
        ),
    );
}

function normaliseTags(rawTags?: string[]): string[] {
    if (!Array.isArray(rawTags)) return [];
    return Array.from(new Set(rawTags.map((tag) => tag.trim()).filter(Boolean)));
}

export async function POST() {
    try {
        const recipeSources: Array<{ mealType: "Breakfast" | "Dinner"; data: RawRecipe[] }> = [
            { mealType: "Breakfast", data: breakfastRecipes as RawRecipe[] },
            { mealType: "Dinner", data: dinnerRecipes as RawRecipe[] },
        ];

        const existing = await prisma.recipe.findMany({
            where: { mealType: { in: ["Breakfast", "Dinner"] } },
            select: { name: true, mealType: true },
        });

        const existingKeys = new Set(
            existing.map((recipe) => `${recipe.mealType.toLowerCase()}::${recipe.name.toLowerCase()}`),
        );

        let createdCount = 0;
        let skippedCount = 0;

        for (const source of recipeSources) {
            for (const rawRecipe of source.data) {
                const name = (rawRecipe.title ?? "").trim();
                const instructions = normaliseInstructions(rawRecipe.instructions);

                if (!name || !instructions) {
                    skippedCount += 1;
                    continue;
                }

                const key = `${source.mealType.toLowerCase()}::${name.toLowerCase()}`;
                if (existingKeys.has(key)) {
                    skippedCount += 1;
                    continue;
                }

                const effort = rawRecipe.difficulty
                    ? difficultyToEffort[rawRecipe.difficulty.toLowerCase()] ?? null
                    : null;

                const ingredientNames = normaliseIngredients(rawRecipe.ingredients);
                const tags = normaliseTags(rawRecipe.tags);
                const rating = normaliseRating(rawRecipe.rating);

                await prisma.recipe.create({
                    data: {
                        name,
                        mealType: source.mealType,
                        instructions,
                        rating,
                        ...(effort ? { effort } : {}),
                        tags: {
                            connectOrCreate: tags.map((tag) => ({
                                where: { name: tag },
                                create: { name: tag },
                            })),
                        },
                        ingredients: {
                            create: ingredientNames.map((ingredient) => ({
                                ingredient: {
                                    connectOrCreate: {
                                        where: { name: ingredient },
                                        create: { name: ingredient },
                                    },
                                },
                            })),
                        },
                    },
                });

                createdCount += 1;
                existingKeys.add(key);
            }
        }

        return NextResponse.json({
            success: true,
            createdCount,
            skippedCount,
        });
    } catch (error) {
        console.error("Failed to import temp recipes:", error);
        return NextResponse.json(
            { success: false, error: "Failed to import temp recipes" },
            { status: 500 },
        );
    }
}
