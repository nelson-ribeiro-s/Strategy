"use client";
import { useCallback, useEffect, useState } from "react";
type UserRow = { id: string; name: string | null; email: string | null; role: "ADMIN" | "EXECUTIVE" | "COLLABORATOR"; active: boolean; createdAt?: string };
export function UserAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao carregar usuários.");
    setUsers(data.users);
  }, []);
  useEffect(() => { void load().catch(e => setError(e.message)); }, [load]);
  async function update(userId: string, patch: { role?: string; active?: boolean }) {
    setBusy(userId); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ...patch }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar.");
      setNotice("Permissões atualizadas."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Falha ao atualizar."); }
    finally { setBusy(""); }
  }
  return <section className="panel">
    {error && <div className="alert error">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <p className="muted">Usuários aparecem nesta lista após o primeiro login com Microsoft 365. Novas contas do tenant podem autenticar e recebem o perfil Colaborador por padrão.</p>
    <div className="admin-table"><div className="admin-row admin-head"><span>Usuário</span><span>Perfil</span><span>Status</span></div>
      {users.map(user => <div className="admin-row" key={user.id}>
        <div><b>{user.name || "Sem nome"}</b><small>{user.email}</small></div>
        <select aria-label={`Perfil de ${user.email}`} value={user.role} disabled={busy === user.id} onChange={e => void update(user.id, { role: e.target.value })}>
          <option value="ADMIN">Administrador</option><option value="EXECUTIVE">Executivo</option><option value="COLLABORATOR">Colaborador</option>
        </select>
        <button className="button small" disabled={busy === user.id} onClick={() => void update(user.id, { active: !user.active })}>{user.active ? "Ativo · desativar" : "Inativo · ativar"}</button>
      </div>)}
      {!users.length && <p className="muted">Nenhum usuário cadastrado ainda.</p>}
    </div>
  </section>;
}
