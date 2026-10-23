import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const canEdit = (role?: string) => role === "ADMIN" || role === "EXECUTIVE";

export async function PATCH(request: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!canEdit(session.user.role)) return NextResponse.json({ error: "Sem permissão para alterar metas e valores" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json() as { targetValue?: unknown; currentValue?: unknown; name?: unknown; unit?: unknown };
  const data: { targetValue?: number; currentValue?: number; name?: string; unit?: string } = {};
  for (const field of ["targetValue", "currentValue"] as const) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "number" || !Number.isFinite(body[field])) return NextResponse.json({ error: `${field} precisa ser numérico` }, { status: 400 });
      data[field] = body[field] as number;
    }
  }
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    data.name = body.name.trim();
  }
  if (body.unit !== undefined) {
    if (typeof body.unit !== "string") return NextResponse.json({ error: "Unidade inválida" }, { status: 400 });
    data.unit = body.unit.trim();
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "Nenhuma alteração enviada" }, { status: 400 });
  try {
    const metric = await prisma.$transaction(async tx => {
      const updated = await tx.metric.update({ where: { id }, data });
      if (data.currentValue !== undefined) {
        await tx.metricHistory.create({
          data: { metricId: id, value: data.currentValue, note: "Atualização do valor atual", createdById: session.user!.id }
        });
      }
      await tx.auditEvent.create({
        data: { userId: session.user!.id, action: "UPDATE", entityType: "Metric", entityId: id, details: data }
      });
      return updated;
    });
    return NextResponse.json({ metric });
  } catch {
    return NextResponse.json({ error: "Indicador não encontrado ou falha ao salvar" }, { status: 404 });
  }
}
