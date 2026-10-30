import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const body = await request.json() as { value?: unknown; recordedAt?: unknown; note?: unknown };
  const data: { value?: number; recordedAt?: Date; note?: string | null } = {};
  if (body.value !== undefined) {
    if (typeof body.value !== "number" || !Number.isFinite(body.value)) return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    data.value = body.value;
  }
  if (body.recordedAt !== undefined) {
    const d = new Date(String(body.recordedAt));
    if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    data.recordedAt = d;
  }
  if (body.note !== undefined) {
    if (body.note !== null && typeof body.note !== "string") return NextResponse.json({ error: "Observação inválida" }, { status: 400 });
    data.note = typeof body.note === "string" ? body.note.trim() : null;
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "Nenhuma alteração enviada" }, { status: 400 });
  try {
    const entry = await prisma.$transaction(async tx => {
      const updated = await tx.metricHistory.update({ where: { id }, data });
      await tx.auditEvent.create({ data: { userId: null, action: "UPDATE_HISTORY", entityType: "MetricHistory", entityId: id, details: data } });
      return updated;
    });
    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json({ error: "Registro de histórico não encontrado" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  try {
    await prisma.$transaction(async tx => {
      const entry = await tx.metricHistory.delete({ where: { id } });
      await tx.auditEvent.create({ data: { userId: null, action: "DELETE_HISTORY", entityType: "MetricHistory", entityId: id, details: { metricId: entry.metricId, value: entry.value } } });
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Registro de histórico não encontrado" }, { status: 404 });
  }
}
