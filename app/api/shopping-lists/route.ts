import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

function getSessionId(request: NextRequest) {
    return request.headers.get('x-session-id')?.trim();
}

function normalizeSessionId(value?: unknown) {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
}

function parseShoppingListId(value: unknown): number | null {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return Math.floor(parsed);
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
        const shoppingLists = await prisma.shoppingList.findMany({
            where: getVisibilityWhere(sessionId),
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        return NextResponse.json(shoppingLists);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch shopping lists' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { shoppingListId, ingredientId, checked } = body;
        const sessionId = getSessionId(request) ?? normalizeSessionId(body?.sessionId);
        const parsedShoppingListId = parseShoppingListId(shoppingListId);

        if (!parsedShoppingListId || typeof ingredientId !== 'string' || typeof checked !== 'boolean') {
            return NextResponse.json(
                { error: 'shoppingListId, ingredientId and checked are required' },
                { status: 400 }
            );
        }

        const shoppingList = await prisma.shoppingList.findFirst({
            where: {
                id: parsedShoppingListId,
                ...getVisibilityWhere(sessionId),
            },
            select: { id: true },
        });

        if (!shoppingList) {
            return NextResponse.json(
                { error: 'Shopping list not found' },
                { status: 404 }
            );
        }

        await prisma.shoppingListItem.update({
            where: {
                shoppingListId_ingredientId: {
                    shoppingListId: shoppingList.id,
                    ingredientId
                }
            },
            data: { checked }
        });

        const updatedItems = await prisma.shoppingListItem.findMany({
            where: { shoppingListId: shoppingList.id },
            select: { checked: true }
        });

        const isCompleted =
            updatedItems.length > 0 && updatedItems.every((item) => item.checked);

        await prisma.shoppingList.update({
            where: { id: shoppingList.id },
            data: { status: isCompleted }
        });

        return NextResponse.json({ success: true, status: isCompleted });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update shopping list item' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { shoppingListId, ingredientName } = body ?? {};
        const sessionId = getSessionId(request) ?? normalizeSessionId(body?.sessionId);
        const parsedShoppingListId = parseShoppingListId(shoppingListId);

        if (!parsedShoppingListId && !ingredientName) {
            const createdList = await prisma.shoppingList.create({
                data: {
                    userId: sessionId || null,
                },
                include: {
                    items: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            });

            return NextResponse.json({ success: true, shoppingList: createdList });
        }

        if (!parsedShoppingListId || !ingredientName?.trim()) {
            return NextResponse.json(
                { error: 'shoppingListId and ingredientName are required' },
                { status: 400 }
            );
        }

        const shoppingList = await prisma.shoppingList.findFirst({
            where: {
                id: parsedShoppingListId,
                ...getVisibilityWhere(sessionId),
            },
            select: { id: true },
        });

        if (!shoppingList) {
            return NextResponse.json(
                { error: 'Shopping list not found' },
                { status: 404 }
            );
        }

        const ingredient = await prisma.ingredient.upsert({
            where: { name: ingredientName.trim() },
            update: {},
            create: { name: ingredientName.trim() }
        });

        await prisma.shoppingListItem.upsert({
            where: {
                shoppingListId_ingredientId: {
                    shoppingListId: shoppingList.id,
                    ingredientId: ingredient.id
                }
            },
            update: {
                checked: false
            },
            create: {
                shoppingListId: shoppingList.id,
                ingredientId: ingredient.id,
                checked: false
            }
        });

        await prisma.shoppingList.update({
            where: { id: shoppingList.id },
            data: { status: false }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to add shopping list item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { shoppingListId, ingredientId } = body;
        const sessionId = getSessionId(request) ?? normalizeSessionId(body?.sessionId);
        const parsedShoppingListId = parseShoppingListId(shoppingListId);

        if (!parsedShoppingListId) {
            return NextResponse.json(
                { error: 'shoppingListId is required' },
                { status: 400 }
            );
        }

        const shoppingList = await prisma.shoppingList.findFirst({
            where: {
                id: parsedShoppingListId,
                ...getVisibilityWhere(sessionId),
            },
            select: { id: true },
        });

        if (!shoppingList) {
            return NextResponse.json(
                { error: 'Shopping list not found' },
                { status: 404 }
            );
        }

        if (ingredientId) {
            await prisma.shoppingListItem.delete({
                where: {
                    shoppingListId_ingredientId: {
                        shoppingListId: shoppingList.id,
                        ingredientId
                    }
                }
            });

            const updatedItems = await prisma.shoppingListItem.findMany({
                where: { shoppingListId: shoppingList.id },
                select: { checked: true }
            });

            const isCompleted =
                updatedItems.length > 0 && updatedItems.every((item) => item.checked);

            await prisma.shoppingList.update({
                where: { id: shoppingList.id },
                data: { status: isCompleted }
            });

            return NextResponse.json({ success: true, status: isCompleted });
        }

        await prisma.shoppingList.delete({
            where: { id: shoppingList.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete shopping list or item' },
            { status: 500 }
        );
    }
}