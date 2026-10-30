"use client";
import { FormEvent, useEffect, useState } from "react";
import { initialObjectives, type HistoryEntry, type Metric, type Objective } from "@/lib/scorecard-data";

const storageKey = "prezensa-scorecard-v1";

export function Scorecard() {
  const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setObjectives(JSON.parse(saved) as Objective[]);
    } catch {
      setNotice("Não foi possível carregar os dados salvos neste navegador.");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(objectives));
    } catch {
      setNotice("O navegador não conseguiu salvar as alterações locais.");
    }
  }, [hydrated, objectives]);

  function updateObjective(objectiveId: string, patch: Partial<Pick<Objective, "name" | "description">>) {
    setObjectives(items => items.map(item => item.id === objectiveId ? { ...item, ...patch } : item));
    setNotice("Alterações salvas neste navegador.");
  }

  function updateMetric(metricId: string, patch: Partial<Pick<Metric, "name" | "unit" | "targetValue" | "currentValue">>) {
    setObjectives(items => items.map(objective => ({
      ...objective,
      metrics: objective.metrics.map(metric => metric.id === metricId ? { ...metric, ...patch } : metric)
    })));
    setNotice("Alterações salvas neste navegador.");
  }

  function addHistory(metricId: string, entry: HistoryEntry) {
    setObjectives(items => items.map(objective => ({
      ...objective,
      metrics: objective.metrics.map(metric => metric.id === metricId
        ? { ...metric, history: [entry, ...metric.history].sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt)) }
        : metric)
    })));
    setNotice("Histórico salvo neste navegador.");
  }

  function updateHistory(metricId: string, entryId: string, patch: Partial<HistoryEntry>) {
    setObjectives(items => items.map(objective => ({
      ...objective,
      metrics: objective.metrics.map(metric => metric.id === metricId
        ? { ...metric, history: metric.history.map(entry => entry.id === entryId ? { ...entry, ...patch } : entry) }
        : metric)
    })));
    setNotice("Histórico salvo neste navegador.");
  }

  function deleteHistory(metricId: string, entryId: string) {
    setObjectives(items => items.map(objective => ({
      ...objective,
      metrics: objective.metrics.map(metric => metric.id === metricId
        ? { ...metric, history: metric.history.filter(entry => entry.id !== entryId) }
        : metric)
    })));
    setNotice("Registro removido deste navegador.");
  }

  return <section id="scorecard" className="scorecard">
    <div className="notice-row">{notice && <div className="alert success" role="status">{notice}</div>}</div>
    {objectives.map(objective => <article className="objective panel" key={objective.id}>
      <div className="objective-heading">
        <div>
          <div className="eyebrow">OBJETIVO ESTRATÉGICO</div>
          <input className="objective-name" aria-label="Nome do objetivo" value={objective.name} onChange={e => updateObjective(objective.id, { name: e.target.value })} />
          {objective.description && <p>{objective.description}</p>}
        </div>
        <span className="pill">{objective.metrics.length} indicadores</span>
      </div>
      {objective.metrics.map(metric => <MetricCard
        key={metric.id}
        metric={metric}
        updateMetric={patch => updateMetric(metric.id, patch)}
        addHistory={entry => addHistory(metric.id, entry)}
        updateHistory={(entryId, patch) => updateHistory(metric.id, entryId, patch)}
        deleteHistory={entryId => deleteHistory(metric.id, entryId)}
      />)}
    </article>)}
    <div className="hint">Dados iniciais fixos. Alterações ficam salvas somente neste navegador e não são compartilhadas com outros visitantes.</div>
  </section>;
}

function MetricCard({
  metric, updateMetric, addHistory, updateHistory, deleteHistory
}: {
  metric: Metric;
  updateMetric: (patch: Partial<Pick<Metric, "name" | "unit" | "targetValue" | "currentValue">>) => void;
  addHistory: (entry: HistoryEntry) => void;
  updateHistory: (entryId: string, patch: Partial<HistoryEntry>) => void;
  deleteHistory: (entryId: string) => void;
}) {
  const [historyValue, setHistoryValue] = useState("");
  const [historyDate, setHistoryDate] = useState("2026-10-30");
  const [historyNote, setHistoryNote] = useState("");
  const [historyEdit, setHistoryEdit] = useState<HistoryEntry | null>(null);
  const pct = metric.targetValue === 0 ? 0 : Math.max(0, Math.min(100, metric.currentValue / metric.targetValue * 100));

  function submitHistory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (historyValue === "" || !Number.isFinite(Number(historyValue))) return;
    addHistory({
      id: crypto.randomUUID(), value: Number(historyValue),
      recordedAt: new Date(historyDate + "T12:00:00").toISOString(),
      note: historyNote.trim() || null
    });
    setHistoryValue("");
    setHistoryNote("");
  }

  return <div className="metric-block">
    <div className="metric-top">
      <div className="metric-name">
        <input aria-label="Nome do indicador" value={metric.name} onChange={e => updateMetric({ name: e.target.value })} />
        <input className="unit-input" aria-label="Unidade" placeholder="unidade" value={metric.unit} onChange={e => updateMetric({ unit: e.target.value })} />
      </div>
      <div className="metric-numbers">
        <label>Atual <input type="number" step="any" value={metric.currentValue} onChange={e => updateMetric({ currentValue: Number(e.target.value) })} /></label>
        <label>Meta <input type="number" step="any" value={metric.targetValue} onChange={e => updateMetric({ targetValue: Number(e.target.value) })} /></label>
      </div>
    </div>
    <div className="progress"><span style={{ width: `${pct}%` }} /></div>
    <div className="progress-meta"><span>{pct.toFixed(0)}% da meta</span><span>Histórico local</span></div>
    <details className="history">
      <summary>Histórico ({metric.history.length})</summary>
      <form className="history-form" onSubmit={submitHistory}>
        <input type="number" step="any" required placeholder="Valor" aria-label="Novo valor histórico" value={historyValue} onChange={e => setHistoryValue(e.target.value)} />
        <input type="date" required aria-label="Data do histórico" value={historyDate} onChange={e => setHistoryDate(e.target.value)} />
        <input placeholder="Observação (opcional)" aria-label="Observação" value={historyNote} onChange={e => setHistoryNote(e.target.value)} />
        <button className="button small primary" type="submit">Adicionar registro</button>
      </form>
      {metric.history.map(entry => <div className="history-row" key={entry.id}>
        {historyEdit?.id === entry.id ? <form className="history-form edit" onSubmit={event => {
          event.preventDefault();
          updateHistory(entry.id, { value: Number(historyEdit.value), recordedAt: historyEdit.recordedAt, note: historyEdit.note });
          setHistoryEdit(null);
        }}>
          <input type="number" step="any" required value={historyEdit.value} onChange={e => setHistoryEdit({ ...historyEdit, value: Number(e.target.value) })} />
          <input type="date" required value={historyEdit.recordedAt.slice(0, 10)} onChange={e => setHistoryEdit({ ...historyEdit, recordedAt: new Date(e.target.value + "T12:00:00").toISOString() })} />
          <input value={historyEdit.note || ""} onChange={e => setHistoryEdit({ ...historyEdit, note: e.target.value })} />
          <button className="button small primary">Salvar</button>
          <button type="button" className="button small" onClick={() => setHistoryEdit(null)}>Cancelar</button>
        </form> : <>
          <span className="history-date">{new Date(entry.recordedAt).toLocaleDateString("pt-BR")}</span>
          <b>{entry.value} {metric.unit}</b>
          <span className="muted">{entry.note || "—"}</span>
          <div className="history-actions">
            <button className="text-button" onClick={() => setHistoryEdit({ ...entry, note: entry.note || "" })}>Editar</button>
            <button className="text-button danger" onClick={() => { if (confirm("Excluir este registro histórico?")) deleteHistory(entry.id); }}>Excluir</button>
          </div>
        </>}
      </div>)}
      {metric.history.length === 0 && <p className="muted">Nenhum registro histórico.</p>}
    </details>
  </div>;
}
