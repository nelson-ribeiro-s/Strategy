import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const isAdmin = (role?: string) => role === "ADMIN";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Apenas administradores podem gerenciar usuários" }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }], select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } });
  return NextResponse.json({ users });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Apenas administradores podem gerenciar usuários" }, { status: 403 });
  const body = await request.json() as { userId?: unknown; role?: unknown; active?: unknown };
  if (typeof body.userId !== "string" || (!["ADMIN", "EXECUTIVE", "COLLABORATOR"].includes(String(body.role)) && typeof body.active !== "boolean")) {
    return NextResponse.json({ error: "Informe um usuário e um perfil ou status válidos" }, { status: 400 });
  }
  if (body.userId === session.user.id && (body.active === false || (body.role && body.role !== "ADMIN"))) {
    return NextResponse.json({ error: "Não é permitido remover o próprio acesso de administrador" }, { status: 400 });
  }
  const data: { role?: "ADMIN" | "EXECUTIVE" | "COLLABORATOR"; active?: boolean } = {};
  if (body.role !== undefined) {
    if (!["ADMIN", "EXECUTIVE", "COLLABORATOR"].includes(String(body.role))) return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
    data.role = body.role as "ADMIN" | "EXECUTIVE" | "COLLABORATOR";
  }
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    data.active = body.active;
  }
  try {
    const updated = await prisma.$transaction(async tx => {
      const user = await tx.user.update({ where: { id: body.userId as string }, data, select: { id: true, name: true, email: true, role: true, active: true } });
      await tx.auditEvent.create({ data: { userId: session.user!.id, action: "UPDATE_ACCESS", entityType: "User", entityId: user.id, details: data } });
      return user;
    });
    return NextResponse.json({ user: updated });
  } catch { return NextResponse.json({ error: "Usuário não encontrado ou falha ao atualizar" }, { status: 404 }); }
}
