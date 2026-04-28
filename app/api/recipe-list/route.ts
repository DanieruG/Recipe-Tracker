import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getRecipeVisibilityWhere(sessionId?: string | null) {
    const trimmed = sessionId?.trim();
    if (trimmed) {
        return {
            OR: [{ userId: null }, { userId: trimmed }],
        };
    }

    return { userId: null };
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const pageParam = searchParams.get("page");
        const limitParam = searchParams.get("limit");
        const search = searchParams.get("search")?.trim() ?? "";
        const mealType = searchParams.get("mealType")?.trim() ?? "";
        const favoriteOnly = searchParams.get("favoriteOnly") === "true";
        const sessionId = request.headers.get("x-session-id")?.trim();

        const parsedPage = Number(pageParam);
        const parsedLimit = Number(limitParam);

        const usePagination =
            Number.isFinite(parsedPage) &&
            parsedPage > 0 &&
            Number.isFinite(parsedLimit) &&
            parsedLimit > 0;

        const where = {
            ...getRecipeVisibilityWhere(sessionId),
            ...(search
                ? {
                    name: {
                        contains: search,
                    },
                }
                : {}),
            ...(mealType && mealType !== "All" ? { mealType } : {}),
            ...(favoriteOnly ? { isFavorite: true } : {}),
        };

        if (!usePagination) {
            const recipes = await prisma.recipe.findMany({
                where,
                orderBy: { id: "desc" },
                select: {
                    id: true,
                    name: true,
                    mealType: true,
                    isFavorite: true,
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
        }

        const page = Math.floor(parsedPage);
        const limit = Math.floor(parsedLimit);

        const [total, recipes] = await Promise.all([
            prisma.recipe.count({ where }),
            prisma.recipe.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { id: "desc" },
                select: {
                    id: true,
                    name: true,
                    mealType: true,
                    isFavorite: true,
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
            }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return NextResponse.json({
            recipes,
            total,
            page,
            pageSize: limit,
            totalPages,
        });
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
        const sessionId = request.headers.get("x-session-id")?.trim();

        if (!id) {
            return NextResponse.json({ error: "Recipe id is required" }, { status: 400 });
        }

        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                id,
                ...getRecipeVisibilityWhere(sessionId),
            },
            select: { id: true },
        });

        if (!existingRecipe) {
            return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { id },
            data: {
                name: body.name,
                mealType: body.mealType,
                instructions: body.instructions,
                rating: body.rating ?? null,
                ...(body.effort ? { effort: body.effort } : {}),
                ...(body.healthiness ? { healthiness: body.healthiness } : {}),
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
        const sessionId = request.headers.get("x-session-id")?.trim();

        if (!id) {
            return NextResponse.json({ error: "Recipe id is required" }, { status: 400 });
        }

        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                id,
                ...getRecipeVisibilityWhere(sessionId),
            },
            select: { id: true },
        });

        if (!existingRecipe) {
            return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
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

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const id = Number(body?.id);
        const isFavorite = body?.isFavorite;
        const sessionId = request.headers.get("x-session-id")?.trim();

        if (!id || typeof isFavorite !== "boolean") {
            return NextResponse.json(
                { error: "Recipe id and isFavorite are required" },
                { status: 400 }
            );
        }

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session id is required to update favorites" },
                { status: 401 }
            );
        }

        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                id,
                userId: sessionId,
            },
            select: { id: true },
        });

        if (!existingRecipe) {
            return NextResponse.json(
                { error: "Recipe not found for this user" },
                { status: 404 }
            );
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { id },
            data: { isFavorite },
        });

        return NextResponse.json(updatedRecipe);
    } catch (error) {
        console.error("Failed to update recipe favorite:", error);
        return NextResponse.json(
            { error: "Failed to update recipe favorite" },
            { status: 500 }
        );
    }
}