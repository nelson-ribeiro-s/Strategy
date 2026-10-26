"use client";
import { useCallback, useEffect, useState } from "react";

type HistoryEntry = { id: string; value: number; recordedAt: string; note: string | null };
type Metric = { id: string; name: string; unit: string; targetValue: number; currentValue: number; history: HistoryEntry[] };
type Objective = { id: string; name: string; description: string | null; metrics: Metric[] };

export function Scorecard({ role }: { role: string }) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const canEdit = role === "ADMIN" || role === "EXECUTIVE";
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/scorecard", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o Scorecard.");
      setObjectives(data.objectives);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Falha ao carregar dados."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function send(url: string, method: string, body?: unknown) {
    setBusy(url); setError(""); setNotice("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao salvar.");
      setNotice("Alterações salvas no banco de dados.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Falha ao salvar."); }
    finally { setBusy(""); }
  }

  if (loading) return <div className="panel">Carregando Scorecard...</div>;
  return <section id="scorecard" className="scorecard">
    <div className="notice-row">{error && <div className="alert error">{error}</div>}{notice && <div className="alert success">{notice}</div>}</div>
    {!objectives.length && <div className="panel empty"><h2>Scorecard ainda não configurado</h2><p>O banco está pronto para receber os objetivos e indicadores. Execute a carga inicial documentada no README.</p></div>}
    {objectives.map((objective) => <article className="objective panel" key={objective.id}>
      <div className="objective-heading">
        <div><div className="eyebrow">OBJETIVO ESTRATÉGICO</div>{canEdit ? <input className="objective-name" aria-label="Nome do objetivo" defaultValue={objective.name} onBlur={e => { if (e.target.value.trim() && e.target.value.trim() !== objective.name) void send(`/api/objectives/${objective.id}`, "PATCH", { name: e.target.value.trim() }); }} /> : <h2>{objective.name}</h2>}
          {objective.description && <p>{objective.description}</p>}</div>
        <span className="pill">{objective.metrics.length} indicadores</span>
      </div>
      {objective.metrics.length === 0 && <p className="muted">Nenhum indicador cadastrado.</p>}
      {objective.metrics.map(metric => <MetricCard key={metric.id} metric={metric} canEdit={canEdit} busy={busy} send={send} />)}
    </article>)}
    <div className="hint">Metas e valores atuais podem ser editados por administradores e executivos. Colaboradores têm acesso de leitura ao Scorecard.</div>
  </section>;
}

function MetricCard({ metric, canEdit, busy, send }: { metric: Metric; canEdit: boolean; busy: string; send: (url: string, method: string, body?: unknown) => Promise<void> }) {
  const [name, setName] = useState(metric.name);
  const [unit, setUnit] = useState(metric.unit);
  const [target, setTarget] = useState(String(metric.targetValue));
  const [current, setCurrent] = useState(String(metric.currentValue));
  const [historyValue, setHistoryValue] = useState("");
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().slice(0,10));
  const [historyNote, setHistoryNote] = useState("");
  const [historyEdit, setHistoryEdit] = useState<HistoryEntry | null>(null);
  useEffect(() => { setName(metric.name); setUnit(metric.unit); setTarget(String(metric.targetValue)); setCurrent(String(metric.currentValue)); }, [metric]);
  const pct = metric.targetValue === 0 ? 0 : Math.max(0, Math.min(100, metric.currentValue / metric.targetValue * 100));
  const historyUrl = `/api/metrics/${metric.id}/history`;
  return <div className="metric-block">
    <div className="metric-top">
      <div className="metric-name">{canEdit ? <input value={name} aria-label="Nome do indicador" onChange={e => setName(e.target.value)} /> : <b>{metric.name}</b>}
        {canEdit && <input className="unit-input" value={unit} aria-label="Unidade" placeholder="unidade" onChange={e => setUnit(e.target.value)} />}</div>
      <div className="metric-numbers">
        <label>Atual {canEdit && <input type="number" step="any" value={current} onChange={e => setCurrent(e.target.value)} />}{!canEdit && <strong>{metric.currentValue} {metric.unit}</strong>}</label>
        <label>Meta {canEdit && <input type="number" step="any" value={target} onChange={e => setTarget(e.target.value)} />}{!canEdit && <strong>{metric.targetValue} {metric.unit}</strong>}</label>
        {canEdit && <button className="button small" disabled={busy !== ""} onClick={() => {
          const currentValue = Number(current), targetValue = Number(target);
          if (!name.trim() || !Number.isFinite(currentValue) || !Number.isFinite(targetValue)) return;
          void send(`/api/metrics/${metric.id}`, "PATCH", { name: name.trim(), unit, targetValue, currentValue });
        }}>{busy.includes(metric.id) ? "Salvando..." : "Salvar"}</button>}
      </div>
    </div>
    <div className="progress"><span style={{ width: `${pct}%` }} /></div>
    <div className="progress-meta"><span>{pct.toFixed(0)}% da meta</span><span>Histórico persistido</span></div>
    <details className="history">
      <summary>Histórico ({metric.history.length})</summary>
      {canEdit && <form className="history-form" onSubmit={e => { e.preventDefault(); if (historyValue === "" || !Number.isFinite(Number(historyValue))) return; void send(historyUrl, "POST", { value: Number(historyValue), recordedAt: new Date(historyDate + "T12:00:00").toISOString(), note: historyNote }); setHistoryValue(""); setHistoryNote(""); }}>
        <input type="number" step="any" required placeholder="Valor" aria-label="Novo valor histórico" value={historyValue} onChange={e => setHistoryValue(e.target.value)} />
        <input type="date" required aria-label="Data do histórico" value={historyDate} onChange={e => setHistoryDate(e.target.value)} />
        <input placeholder="Observação (opcional)" aria-label="Observação" value={historyNote} onChange={e => setHistoryNote(e.target.value)} />
        <button className="button small primary" type="submit">Adicionar registro</button>
      </form>}
      {metric.history.length === 0 && <p className="muted">Nenhum registro histórico.</p>}
      {metric.history.map(entry => <div className="history-row" key={entry.id}>
        {historyEdit?.id === entry.id && canEdit ? <form className="history-form edit" onSubmit={e => { e.preventDefault(); void send(`/api/metric-history/${entry.id}`, "PATCH", { value: Number(historyEdit.value), recordedAt: historyEdit.recordedAt, note: historyEdit.note }); setHistoryEdit(null); }}>
          <input type="number" step="any" required value={historyEdit.value} onChange={e => setHistoryEdit({...historyEdit, value: Number(e.target.value)})} />
          <input type="date" required value={historyEdit.recordedAt.slice(0,10)} onChange={e => setHistoryEdit({...historyEdit, recordedAt: new Date(e.target.value + "T12:00:00").toISOString()})} />
          <input value={historyEdit.note || ""} onChange={e => setHistoryEdit({...historyEdit, note: e.target.value})} />
          <button className="button small primary">Salvar</button><button type="button" className="button small" onClick={() => setHistoryEdit(null)}>Cancelar</button>
        </form> : <><span className="history-date">{new Date(entry.recordedAt).toLocaleDateString("pt-BR")}</span><b>{entry.value} {metric.unit}</b><span className="muted">{entry.note || "—"}</span>{canEdit && <div className="history-actions"><button className="text-button" onClick={() => setHistoryEdit({...entry, recordedAt: new Date(entry.recordedAt).toISOString(), note: entry.note || ""})}>Editar</button><button className="text-button danger" onClick={() => { if (confirm("Excluir este registro histórico?")) void send(`/api/metric-history/${entry.id}`, "DELETE"); }}>Excluir</button></div>}</>}
      </div>)}
    </details>
  </div>;
}
