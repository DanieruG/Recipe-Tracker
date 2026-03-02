import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const recipes = await prisma.recipe.findMany({
            select: {
                id: true,
                name: true,
                mealType: true,
                effort: true,
                healthiness: true,
                instructions: true,
                rating: true,
                tags: true,
                lastMade: true,
                timesIncluded: true,
                ingredients: {
                    select: {
                        ingredient: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(recipes);
    } catch (error) {
        console.error("Failed to fetch recipes:", error);
        return NextResponse.json(
            { error: "Failed to fetch recipes" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const id = Number(body?.id);

        if (!id) {
            return NextResponse.json({ error: "Recipe id is required" }, { status: 400 });
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { id },
            data: {
                name: body.name,
                mealType: body.mealType,
                effort: body.effort,
                healthiness: body.healthiness,
                instructions: body.instructions,
                rating: body.rating ?? null,
            },
        });

        return NextResponse.json(updatedRecipe);
    } catch (error) {
        console.error("Failed to update recipe:", error);
        return NextResponse.json(
            { error: "Failed to update recipe" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const id = Number(body?.id);

        if (!id) {
            return NextResponse.json({ error: "Recipe id is required" }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.recipeIngredient.deleteMany({ where: { recipeId: id } }),
            prisma.recipe.delete({ where: { id } }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete recipe:", error);
        return NextResponse.json(
            { error: "Failed to delete recipe" },
            { status: 500 }
        );
    }
}