import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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