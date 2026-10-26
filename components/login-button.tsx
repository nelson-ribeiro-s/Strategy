"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function LoginButton() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const result = await signIn("credentials", { username, password, redirect: false });
      if (result?.error) setError("Usuário ou senha inválidos.");
      else window.location.assign("/");
    } catch { setError("Não foi possível entrar. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <>
    <button type="button" className="button microsoft wide" onClick={() => signIn("azure-ad", { callbackUrl: "/" })}>Entrar com Microsoft 365</button>
    <form className="credentials-form" onSubmit={submit}>
      <label>Usuário<input name="username" autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Seu usuário" /></label>
      <label>Senha<input name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" /></label>
      {error && <div className="alert error" role="alert">{error}</div>}
      <button className="button primary wide" type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar com usuário e senha"}</button>
    </form>
  </>;
}
