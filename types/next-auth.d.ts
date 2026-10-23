import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: "ADMIN" | "EXECUTIVE" | "COLLABORATOR";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
