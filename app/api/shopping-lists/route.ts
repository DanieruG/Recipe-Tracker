import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Helper functions to extract and validate session ID, shopping list ID, and to determine visibility of shopping lists based on session ID.
function getSessionId(request: NextRequest) {
    return request.headers.get('x-session-id')?.trim();
}

// Normalizes the session ID by trimming whitespace and returning undefined if the resulting string is empty or if the input is not a string.
function normalizeSessionId(value?: unknown) {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
}

// Parses the shopping list ID from the input value, ensuring it's a positive integer. Returns null if the input is invalid.
function parseShoppingListId(value: unknown): number | null {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return Math.floor(parsed);
}

// Determines the visibility condition for querying shopping lists based on the presence of a session ID. 
// If a session ID is provided, it allows access to both public lists (userId: null) and the user's own lists (userId: sessionId). 
// If no session ID is provided, it only allows access to public lists.

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


        // If no shoppingListId and no ingredientName provided, create a new shopping list. Otherwise, ingredientName is required to add an item to the list.
        // Basically, creates empty shopping lists.
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

        // Both shoppingListId and ingredientName are required to add an item to an existing list.
        if (!parsedShoppingListId || !ingredientName?.trim()) {
            return NextResponse.json(
                { error: 'shoppingListId and ingredientName are required' },
                { status: 400 }
            );
        }

        // Selects the shopping list to ensure it exists and belongs to the user (or is public) before adding an item to it.
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

        // upsert - update or insert. So if ingredient already exists, it won't create a duplicate.
        const ingredient = await prisma.ingredient.upsert({
            where: { name: ingredientName.trim() },
            update: {},
            create: { name: ingredientName.trim() }
        });

        // Looks for the ingredient in the shopping list. If it already exists, it just updates the checked status to false. 
        // If it doesn't exist, it creates a new item in the list with checked status false.
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


        // Validating existing shopping list and ownership (or public visibility) before allowing deletion of the list or an item from it.
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

        // Validating the ingredientId before allowing deletion of an item from the list.
        if (ingredientId) {
            await prisma.shoppingListItem.delete({
                where: {
                    shoppingListId_ingredientId: {
                        shoppingListId: shoppingList.id,
                        ingredientId
                    }
                }
            });

            // Completion status of the shopping list might change after deleting an item, so we need to check the remaining items and update the status accordingly.
            const updatedItems = await prisma.shoppingListItem.findMany({
                where: { shoppingListId: shoppingList.id },
                select: { checked: true }
            });


            // Verifies the length is greater than 0 to avoid marking an empty list as completed... 
            // and then checks if every remaining item is checked to determine the completion status of the list.
            const isCompleted =
                updatedItems.length > 0 && updatedItems.every((item) => item.checked);

        
            // Updates the shopping list status based on the completion status of the remaining items after deletion.
            await prisma.shoppingList.update({
                where: { id: shoppingList.id },
                data: { status: isCompleted }
            });

            return NextResponse.json({ success: true, status: isCompleted });
        }

        // If no ingredientId provided, it means we want to delete the entire shopping list. So we proceed with deleting the shopping list and all its items.
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