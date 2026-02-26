import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const recipes = await prisma.recipe.findMany({
            select: {
                id: true,
                name: true,
                mealType: true,
                rating: true,
                tags: true,
                lastMade: true,
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