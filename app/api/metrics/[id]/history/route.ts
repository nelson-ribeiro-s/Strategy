import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  const { id: metricId } = await context.params;
  const body = await request.json() as { value?: unknown; recordedAt?: unknown; note?: unknown };
  if (typeof body.value !== "number" || !Number.isFinite(body.value)) return NextResponse.json({ error: "Valor precisa ser numérico" }, { status: 400 });
  const recordedAt = body.recordedAt ? new Date(String(body.recordedAt)) : new Date();
  if (Number.isNaN(recordedAt.getTime())) return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  try {
    const result = await prisma.$transaction(async tx => {
      const entry = await tx.metricHistory.create({ data: {
        metricId, value: body.value as number, recordedAt,
        note: typeof body.note === "string" ? body.note.trim() : null,
        createdById: null
      }});
      await tx.auditEvent.create({ data: { userId: null, action: "CREATE_HISTORY", entityType: "MetricHistory", entityId: entry.id, details: { metricId, value: entry.value, recordedAt } } });
      return entry;
    });
    return NextResponse.json({ entry: result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Indicador não encontrado ou falha ao salvar histórico" }, { status: 404 });
  }
}
