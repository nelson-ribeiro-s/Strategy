import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserAdmin } from "@/components/user-admin";
import Link from "next/link";

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return <main className="content standalone">
    <header className="topbar"><div><div className="eyebrow">ADMINISTRAÇÃO</div><h1>Usuários e permissões</h1><p>Perfis de acesso para contas corporativas que já entraram no sistema.</p></div><Link className="button ghost" href="/">Voltar ao Scorecard</Link></header>
    <UserAdmin />
  </main>;
}
