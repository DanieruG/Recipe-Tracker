import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const tags = await prisma.tag.findMany();
        const opts = tags.map((t: { id: number; name: string }) => ({
            value: t.name,
            label: t.name,
        }));
        return NextResponse.json(opts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}
