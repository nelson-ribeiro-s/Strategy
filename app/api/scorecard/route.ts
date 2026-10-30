import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const objectives = await prisma.objective.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: {
      metrics: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: { history: { orderBy: { recordedAt: "desc" }, take: 100 } }
      }
    }
  });
  return NextResponse.json({ objectives });
}
