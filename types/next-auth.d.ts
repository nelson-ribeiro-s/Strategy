import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "EXECUTIVE" | "COLLABORATOR";
    } & DefaultSession["user"];
  }
}
