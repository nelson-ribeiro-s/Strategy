import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const tenantId = process.env.AZURE_AD_TENANT_ID;
if (!tenantId) console.warn("AZURE_AD_TENANT_ID is not configured; Microsoft sign-in will not work.");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: tenantId ?? "common",
      authorization: { params: { scope: "openid profile email User.Read" } }
    })
  ],
  session: { strategy: "database" },
  callbacks: {
    async signIn({ user, profile }) {
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
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, active: true, id: true } });
        if (!dbUser?.active) throw new Error("USER_DISABLED");
        (session.user as typeof session.user & { id: string; role: string }).id = user.id;
        (session.user as typeof session.user & { id: string; role: string }).role = dbUser.role;
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
