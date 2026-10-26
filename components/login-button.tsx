"use client";
import { signIn } from "next-auth/react";

export function LoginButton() {
  return <button type="button" className="button microsoft wide" onClick={() => signIn("azure-ad", { callbackUrl: "/" })}>Entrar com Microsoft 365</button>;
}
