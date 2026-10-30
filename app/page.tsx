import { Scorecard } from "@/components/scorecard";

export default function HomePage() {
  return <main className="shell">
    <aside className="sidebar">
      <div className="brand">PREZENSA<span> / MANAGEMENT</span></div>
      <nav><a className="selected" href="#scorecard">Scorecard</a><a href="/legacy.html">Cockpit · Rocks · Issues · L1 (protótipo)</a></nav>
      <div className="side-note">PeopleTech · Gestão executiva</div>
    </aside>
    <section className="content">
      <header className="topbar">
        <div><div className="eyebrow">PREZENSA · EXECUTIVE SYSTEM</div><h1>Scorecard estratégico</h1><p>Metas, valores atuais e histórico compartilhados com a equipe.</p></div>
      </header>
      <Scorecard />
      <footer>Os dados são salvos no PostgreSQL. Alterações de metas e valores ficam registradas no histórico e na auditoria.</footer>
    </section>
  </main>;
}
