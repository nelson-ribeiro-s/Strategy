import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginButton } from "@/components/login-button";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/");
  return <main className="login-wrap"><section className="login-card">
    <div className="brand">PREZENSA<span> / MANAGEMENT</span></div>
    <div className="eyebrow">GESTÃO EXECUTIVA</div><h1>Entre com sua conta corporativa</h1>
    <p>Use seu usuário Microsoft 365 da Prezensa. Somente contas do tenant configurado podem acessar o sistema.</p>
    <LoginButton />
    <small>Seu perfil de acesso é definido pelo administrador do sistema.</small>
  </section></main>;
}
