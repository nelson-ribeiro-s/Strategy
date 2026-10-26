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
    <small>Seu perfil e suas permissões são definidos pelo administrador do sistema.</small>
  </section></main>;
}
