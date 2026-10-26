import "next-auth";
import "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "EXECUTIVE" | "COLLABORATOR";
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "EXECUTIVE" | "COLLABORATOR";
  }
}
