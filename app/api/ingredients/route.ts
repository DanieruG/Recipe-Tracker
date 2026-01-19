import { prisma } from "@/lib/prisma";

{/* Function name MUST be GET */}

export async function GET() {
  const ingredientDB = await prisma.ingredient.findMany();

  const ingredientOptions = ingredientDB.map((ingredient) => ({
    value: ingredient.name,
    label: ingredient.name,
  }));

  return Response.json(ingredientOptions);
}
