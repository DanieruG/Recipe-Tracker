import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const shoppingLists = await prisma.shoppingList.findMany({
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
        const { shoppingListId, ingredientId, checked } = await request.json();

        await prisma.shoppingListItem.update({
            where: {
                shoppingListId_ingredientId: {
                    shoppingListId,
                    ingredientId
                }
            },
            data: { checked }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update shopping list item' },
            { status: 500 }
        );
    }
}