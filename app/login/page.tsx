import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginButton } from "@/components/login-button";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/");
  return <main className="login-wrap"><section className="login-card">
    <div className="brand">PREZENSA<span> / MANAGEMENT</span></div>
    <div className="eyebrow">GESTÃO EXECUTIVA</div><h1>Entrar no sistema</h1>
    <p>Use sua conta corporativa Microsoft 365 ou entre com usuário e senha cadastrados.</p>
    <LoginButton />
    <div className="login-divider"><span>ou</span></div>
    <form className="credentials-form" action="/api/auth/callback/credentials" method="post">
      <label>Usuário<input name="username" autoComplete="username" required placeholder="Seu usuário" /></label>
      <label>Senha<input name="password" type="password" autoComplete="current-password" required placeholder="Sua senha" /></label>
      <input type="hidden" name="csrfToken" value="" />
      <button className="button primary wide" type="submit" formAction="/login/password">Entrar com usuário e senha</button>
    </form>
    <small>Seu perfil e suas permissões são definidos pelo administrador do sistema.</small>
  </section></main>;
}
