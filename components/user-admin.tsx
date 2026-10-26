"use client";
import { useCallback, useEffect, useState } from "react";
type UserRow = { id: string; name: string | null; email: string | null; username: string | null; role: "ADMIN" | "EXECUTIVE" | "COLLABORATOR"; active: boolean; hasPassword: boolean; createdAt?: string };
export function UserAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [credentials, setCredentials] = useState<Record<string, { username: string; password: string }>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao carregar usuários.");
    setUsers(data.users);
    setCredentials(current => Object.fromEntries(data.users.map((u: UserRow) => [u.id, current[u.id] || { username: u.username || "", password: "" }])));
  }, []);
  useEffect(() => { void load().catch(e => setError(e.message)); }, [load]);
  async function update(userId: string, patch: { role?: string; active?: boolean; username?: string | null; password?: string }) {
    setBusy(userId); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ...patch }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar.");
      setNotice(patch.password ? "Usuário e senha de acesso salvos." : "Permissões atualizadas."); 
      setCredentials(current => ({ ...current, [userId]: { ...current[userId], password: "" } }));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Falha ao atualizar."); }
    finally { setBusy(""); }
  }
  return <section className="panel">
    {error && <div className="alert error">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <p className="muted">Usuários aparecem nesta lista após o primeiro login com Microsoft 365. Para liberar login local, defina um nome de usuário e uma senha com pelo menos 10 caracteres.</p>
    <div className="admin-table"><div className="admin-row admin-head"><span>Usuário</span><span>Perfil</span><span>Status</span></div>
      {users.map(user => <div className="admin-row admin-user" key={user.id}>
        <div className="admin-identity"><b>{user.name || "Sem nome"}</b><small>{user.email}</small><div className="credential-fields">
          <input aria-label={`Login local de ${user.email}`} placeholder="Nome de usuário" autoComplete="off" value={credentials[user.id]?.username ?? user.username ?? ""} onChange={e => setCredentials(c => ({ ...c, [user.id]: { username: e.target.value, password: c[user.id]?.password ?? "" } }))} />
          <input aria-label={`Nova senha de ${user.email}`} placeholder={user.hasPassword ? "Nova senha (opcional)" : "Definir senha (mín. 10 caracteres)"} type="password" autoComplete="new-password" value={credentials[user.id]?.password ?? ""} onChange={e => setCredentials(c => ({ ...c, [user.id]: { username: c[user.id]?.username ?? user.username ?? "", password: e.target.value } }))} />
          <button className="button small" disabled={busy === user.id} onClick={() => {
            const cred = credentials[user.id] || { username: user.username || "", password: "" };
            if (!cred.username.trim()) { setError("Informe um nome de usuário."); return; }
            const patch: { username: string; password?: string } = { username: cred.username.trim() };
            if (cred.password) patch.password = cred.password;
            if (!user.hasPassword && !cred.password) { setError("Defina uma senha para habilitar o login local."); return; }
            void update(user.id, patch);
          }}>Salvar login local</button>
          <small>{user.hasPassword ? "Login local habilitado" : "Login local não configurado"}</small>
        </div></div>
        <select aria-label={`Perfil de ${user.email}`} value={user.role} disabled={busy === user.id} onChange={e => void update(user.id, { role: e.target.value })}>
          <option value="ADMIN">Administrador</option><option value="EXECUTIVE">Executivo</option><option value="COLLABORATOR">Colaborador</option>
        </select>
        <button className="button small" disabled={busy === user.id} onClick={() => void update(user.id, { active: !user.active })}>{user.active ? "Ativo · desativar" : "Inativo · ativar"}</button>
      </div>)}
      {!users.length && <p className="muted">Nenhum usuário cadastrado ainda.</p>}
    </div>
  </section>;
}
