import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const schedules = await prisma.schedule.findMany({
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

        const schedule = await prisma.schedule.findUnique({
            where: { id: Number(scheduleId) },
        });

        if (!schedule) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }

        const weekPlan = Array.isArray(schedule.weekPlan)
            ? (schedule.weekPlan as any[])
            : [];

        let replacementRecipe: any = null;
        if (recipeId !== null && recipeId !== undefined && recipeId !== "") {
            replacementRecipe = await prisma.recipe.findUnique({
                where: { id: Number(recipeId) },
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

            if (!replacementRecipe) {
                return NextResponse.json(
                    { error: "Replacement recipe not found" },
                    { status: 404 }
                );
            }
        }

        const updatedWeekPlan = weekPlan.map((dayPlan: any) => {
            if (dayPlan?.day !== day) return dayPlan;

            return {
                ...dayPlan,
                meals: {
                    ...(dayPlan?.meals ?? {}),
                    [mealType]: replacementRecipe,
                },
            };
        });

        const updatedSchedule = await prisma.schedule.update({
            where: { id: Number(scheduleId) },
            data: { weekPlan: updatedWeekPlan },
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

        if (!scheduleId) {
            return NextResponse.json(
                { error: "scheduleId is required" },
                { status: 400 }
            );
        }

        await prisma.schedule.delete({
            where: { id: Number(scheduleId) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete schedule" },
            { status: 500 }
        );
    }
}