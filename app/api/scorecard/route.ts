import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
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
