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

        const updatedItems = await prisma.shoppingListItem.findMany({
            where: { shoppingListId },
            select: { checked: true }
        });

        const isCompleted =
            updatedItems.length > 0 && updatedItems.every((item) => item.checked);

        await prisma.shoppingList.update({
            where: { id: shoppingListId },
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
        const { shoppingListId, ingredientName } = await request.json();

        if (!shoppingListId || !ingredientName?.trim()) {
            return NextResponse.json(
                { error: 'shoppingListId and ingredientName are required' },
                { status: 400 }
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
                    shoppingListId: Number(shoppingListId),
                    ingredientId: ingredient.id
                }
            },
            update: {
                checked: false
            },
            create: {
                shoppingListId: Number(shoppingListId),
                ingredientId: ingredient.id,
                checked: false
            }
        });

        await prisma.shoppingList.update({
            where: { id: Number(shoppingListId) },
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
        const { shoppingListId, ingredientId } = await request.json();

        if (!shoppingListId) {
            return NextResponse.json(
                { error: 'shoppingListId is required' },
                { status: 400 }
            );
        }

        if (ingredientId) {
            await prisma.shoppingListItem.delete({
                where: {
                    shoppingListId_ingredientId: {
                        shoppingListId: Number(shoppingListId),
                        ingredientId
                    }
                }
            });

            const updatedItems = await prisma.shoppingListItem.findMany({
                where: { shoppingListId: Number(shoppingListId) },
                select: { checked: true }
            });

            const isCompleted =
                updatedItems.length > 0 && updatedItems.every((item) => item.checked);

            await prisma.shoppingList.update({
                where: { id: Number(shoppingListId) },
                data: { status: isCompleted }
            });

            return NextResponse.json({ success: true, status: isCompleted });
        }

        await prisma.shoppingList.delete({
            where: { id: Number(shoppingListId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete shopping list or item' },
            { status: 500 }
        );
    }
}