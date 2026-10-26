import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const isAdmin = (role?: string) => role === "ADMIN";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Apenas administradores podem gerenciar usuários" }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }], select: { id: true, name: true, email: true, username: true, role: true, active: true, createdAt: true, passwordHash: true } });
  return NextResponse.json({ users: users.map(({ passwordHash, ...user }) => ({ ...user, hasPassword: Boolean(passwordHash) })) });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Apenas administradores podem gerenciar usuários" }, { status: 403 });
  const body = await request.json() as { userId?: unknown; role?: unknown; active?: unknown; username?: unknown; password?: unknown };
  if (typeof body.userId !== "string") return NextResponse.json({ error: "Informe um usuário válido" }, { status: 400 });
  if (body.userId === session.user.id && (body.active === false || (body.role && body.role !== "ADMIN"))) {
    return NextResponse.json({ error: "Não é permitido remover o próprio acesso de administrador" }, { status: 400 });
  }
  const data: { role?: "ADMIN" | "EXECUTIVE" | "COLLABORATOR"; active?: boolean; username?: string | null; passwordHash?: string } = {};
  if (body.role !== undefined) {
    if (!["ADMIN", "EXECUTIVE", "COLLABORATOR"].includes(String(body.role))) return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
    data.role = body.role as "ADMIN" | "EXECUTIVE" | "COLLABORATOR";
  }
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    data.active = body.active;
  }
  if (body.username !== undefined) {
    if (body.username !== null && (typeof body.username !== "string" || !/^[a-zA-Z0-9._-]{3,50}$/.test(body.username.trim()))) return NextResponse.json({ error: "Usuário deve ter 3–50 caracteres: letras, números, ponto, hífen ou sublinhado" }, { status: 400 });
    data.username = typeof body.username === "string" && body.username.trim() ? body.username.trim().toLowerCase() : null;
  }
  if (body.password !== undefined) {
    if (typeof body.password !== "string" || body.password.length < 10 || body.password.length > 72) return NextResponse.json({ error: "A senha deve ter entre 10 e 72 caracteres" }, { status: 400 });
    data.passwordHash = await hash(body.password, 12);
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "Nenhuma alteração enviada" }, { status: 400 });
  try {
    const updated = await prisma.$transaction(async tx => {
      const user = await tx.user.update({ where: { id: body.userId as string }, data, select: { id: true, name: true, email: true, username: true, role: true, active: true } });
      const details = { ...data, ...(data.passwordHash ? { passwordHash: "[redacted]" } : {}) };
      await tx.auditEvent.create({ data: { userId: session.user!.id, action: "UPDATE_ACCESS", entityType: "User", entityId: user.id, details } });
      return user;
    });
    return NextResponse.json({ user: updated });
  } catch { return NextResponse.json({ error: "Usuário não encontrado, nome de usuário duplicado ou falha ao atualizar" }, { status: 404 }); }
}
