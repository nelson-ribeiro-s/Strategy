import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Scorecard } from "@/components/scorecard";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return <main className="shell">
    <aside className="sidebar">
      <div className="brand">PREZENSA<span> / MANAGEMENT</span></div>
      <nav><a className="selected" href="#scorecard">Scorecard</a><a href="/legacy.html">Cockpit · Rocks · Issues · L1 (protótipo)</a><a href="#account">Minha conta</a>{session.user.role === "ADMIN" && <a href="/admin/users">Usuários e permissões</a>}</nav>
      <div className="side-note">PeopleTech · Gestão executiva</div>
    </aside>
    <section className="content">
      <header className="topbar">
        <div><div className="eyebrow">PREZENSA · EXECUTIVE SYSTEM</div><h1>Scorecard estratégico</h1><p>Metas, valores atuais e histórico compartilhados com a equipe.</p></div>
        <div className="userbox" id="account"><span className="avatar">{(session.user.name || session.user.email || "P").slice(0,1).toUpperCase()}</span><div><b>{session.user.name || session.user.email}</b><small>{session.user.role}</small></div><a className="button ghost" href="/api/auth/signout">Sair</a></div>
      </header>
      <Scorecard role={session.user.role} />
      <footer>Os dados são salvos no PostgreSQL. Alterações de metas e valores ficam registradas no histórico e na auditoria.</footer>
    </section>
  </main>;
}
