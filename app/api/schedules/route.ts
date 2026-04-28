import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client/client";
import { NextRequest, NextResponse } from "next/server";

type WeekPlanEntry = {
    day?: string;
    meals?: Record<string, unknown>;
    [key: string]: unknown;
};

type ReplacementRecipe = {
    id: number;
    userId: string | null;
    name: string;
    mealType: string;
    isFavorite: boolean;
    effort: string | null;
    healthiness: string | null;
    instructions: string;
    rating: number | null;
    tags: { id: number; name: string }[];
    lastMade: Date;
    timesIncluded: number;
    ingredients: { ingredient: { id: string; name: string } }[];
};

function getSessionId(request: NextRequest) {
    return request.headers.get("x-session-id")?.trim();
}

function getVisibilityWhere(sessionId?: string) {
    if (sessionId) {
        return {
            OR: [{ userId: null }, { userId: sessionId }],
        };
    }

    return { userId: null };
}

export async function GET(request: NextRequest) {
    try {
        const sessionId = getSessionId(request);
        const schedules = await prisma.schedule.findMany({
            where: getVisibilityWhere(sessionId),
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(schedules);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch schedules" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { scheduleId, day, mealType, recipeId } = await request.json();
        const sessionId = getSessionId(request);

        if (!scheduleId || !day || !mealType) {
            return NextResponse.json(
                { error: "scheduleId, day and mealType are required" },
                { status: 400 }
            );
        }

        if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
            return NextResponse.json(
                { error: "Invalid mealType" },
                { status: 400 }
            );
        }

        const schedule = await prisma.schedule.findFirst({
            where: {
                id: Number(scheduleId),
                ...getVisibilityWhere(sessionId),
            },
        });

        if (!schedule) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }

        const weekPlan: WeekPlanEntry[] = Array.isArray(schedule.weekPlan)
            ? (schedule.weekPlan as WeekPlanEntry[])
            : [];

        let replacementRecipe: ReplacementRecipe | null = null;
        if (recipeId !== null && recipeId !== undefined && recipeId !== "") {
            const replacement = await prisma.recipe.findUnique({
                where: { id: Number(recipeId) },
                select: {
                    id: true,
                    userId: true,
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

            if (!replacement) {
                return NextResponse.json(
                    { error: "Replacement recipe not found" },
                    { status: 404 }
                );
            }

            replacementRecipe = replacement;

            const canAccessRecipe =
                replacementRecipe.userId === null ||
                (sessionId ? replacementRecipe.userId === sessionId : false);

            if (!canAccessRecipe) {
                return NextResponse.json(
                    { error: "Replacement recipe not available" },
                    { status: 403 }
                );
            }

            if (!replacementRecipe.isFavorite) {
                return NextResponse.json(
                    { error: "Replacement recipe must be a favorite" },
                    { status: 400 }
                );
            }
        }

        const updatedWeekPlan = weekPlan.map((dayPlan) => {
            if (dayPlan?.day !== day) return dayPlan;

            const existingMeals =
                dayPlan?.meals && typeof dayPlan.meals === "object"
                    ? dayPlan.meals
                    : {};

            return {
                ...dayPlan,
                meals: {
                    ...existingMeals,
                    [mealType]: replacementRecipe,
                },
            };
        });

        const updatedSchedule = await prisma.schedule.update({
            where: { id: Number(scheduleId) },
            data: { weekPlan: updatedWeekPlan as Prisma.InputJsonValue },
        });

        return NextResponse.json(updatedSchedule);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update schedule" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { scheduleId } = await request.json();
        const sessionId = getSessionId(request);

        if (!scheduleId) {
            return NextResponse.json(
                { error: "scheduleId is required" },
                { status: 400 }
            );
        }

        const schedule = await prisma.schedule.findFirst({
            where: {
                id: Number(scheduleId),
                ...getVisibilityWhere(sessionId),
            },
            select: { id: true },
        });

        if (!schedule) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }

        await prisma.schedule.delete({
            where: { id: schedule.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete schedule" },
            { status: 500 }
        );
    }
}