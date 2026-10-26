import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const tenantId = process.env.AZURE_AD_TENANT_ID;
if (!tenantId) console.warn("AZURE_AD_TENANT_ID is not configured; Microsoft sign-in will not work.");

type AppUser = NextAuthUser & { role?: "ADMIN" | "EXECUTIVE" | "COLLABORATOR" };

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: tenantId ?? "common",
      authorization: { params: { scope: "openid profile email User.Read" } }
    }),
    CredentialsProvider({
      name: "Usuário e senha",
      credentials: {
        username: { label: "Usuário", type: "text", placeholder: "seu.usuario" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!username || !password) return null;

        // Convenience account for local development only. Never enable this bypass in production.
        if (process.env.NODE_ENV !== "production" && username === "admin" && password === "admin") {
          const passwordHash = await hash("admin", 12);
          const devAdmin = await prisma.user.upsert({
            where: { username: "admin" },
            update: { role: "ADMIN", active: true },
            create: { username: "admin", email: "admin@localhost", name: "Admin de desenvolvimento", passwordHash, role: "ADMIN", active: true }
          });
          return { id: devAdmin.id, name: devAdmin.name, email: devAdmin.email, role: devAdmin.role } as AppUser;
        }

        const dbUser = await prisma.user.findUnique({ where: { username } });
        if (!dbUser || !dbUser.active || !dbUser.passwordHash) return null;
        const valid = await compare(password, dbUser.passwordHash);
        if (!valid) return null;
        return { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role } as AppUser;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true;
      if (!tenantId) return false;
      const claims = profile as { tid?: string; oid?: string; preferred_username?: string; email?: string } | undefined;
      // Fail closed: the tenant claim must exist and match the configured Prezensa tenant.
      if (!claims?.tid || claims.tid !== tenantId) return false;
      const email = (user.email || claims.preferred_username || claims.email || "").toLowerCase();
      if (!email) return false;
      const adminEmails = (process.env.PREZENSA_ADMIN_EMAILS ?? "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && !existing.active) return false;
      if (existing && adminEmails.includes(email) && existing.role !== "ADMIN") {
        await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN", ...(claims.oid ? { entraObjectId: claims.oid } : {}) } });
      } else if (existing && claims.oid && existing.entraObjectId !== claims.oid) {
        await prisma.user.update({ where: { id: existing.id }, data: { entraObjectId: claims.oid } });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, role: true, active: true } });
        if (!dbUser?.active) throw new Error("USER_DISABLED");
        token.sub = dbUser.id;
        token.role = dbUser.role;
      } else if (token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub }, select: { role: true, active: true } });
        if (!dbUser?.active) throw new Error("USER_DISABLED");
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as "ADMIN" | "EXECUTIVE" | "COLLABORATOR") ?? "COLLABORATOR";
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      const email = (user.email ?? "").toLowerCase();
      const adminEmails = (process.env.PREZENSA_ADMIN_EMAILS ?? "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
      if (email && adminEmails.includes(email)) {
        await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      }
    }
  },
  pages: { signIn: "/login" }
};
