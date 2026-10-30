import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const body = await request.json() as { name?: unknown; description?: unknown };
  const data: { name?: string; description?: string | null } = {};
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    data.name = body.name.trim();
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") return NextResponse.json({ error: "Descrição inválida" }, { status: 400 });
    data.description = typeof body.description === "string" ? body.description.trim() : null;
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "Nenhuma alteração enviada" }, { status: 400 });
  try {
    const objective = await prisma.$transaction(async tx => {
      const updated = await tx.objective.update({ where: { id }, data });
      await tx.auditEvent.create({ data: { userId: null, action: "UPDATE", entityType: "Objective", entityId: id, details: data } });
      return updated;
    });
    return NextResponse.json({ objective });
  } catch { return NextResponse.json({ error: "Objetivo não encontrado" }, { status: 404 }); }
}
