export type HistoryEntry = { id: string; value: number; recordedAt: string; note: string | null };
export type Metric = { id: string; name: string; unit: string; targetValue: number; currentValue: number; history: HistoryEntry[] };
export type Objective = { id: string; name: string; description: string | null; metrics: Metric[] };

// Fixed demonstration values. Visitors can personalize these in their own browser.
export const initialObjectives: Objective[] = [
  {
    id: "growth",
    name: "Crescimento sustentável",
    description: "Expandir receita com rentabilidade.",
    metrics: [
      { id: "recurring-revenue", name: "Receita recorrente", unit: "R$", targetValue: 1000000, currentValue: 750000, history: [{ id: "rev-oct", value: 750000, recordedAt: "2026-10-07T12:00:00.000Z", note: "Carga inicial de demonstração" }] },
      { id: "strategic-clients", name: "Novos clientes estratégicos", unit: "clientes", targetValue: 8, currentValue: 5, history: [{ id: "clients-oct", value: 5, recordedAt: "2026-10-07T12:00:00.000Z", note: "Carga inicial de demonstração" }] }
    ]
  },
  {
    id: "delivery",
    name: "Excelência na entrega",
    description: "Entregar valor previsível aos clientes.",
    metrics: [
      { id: "customer-satisfaction", name: "Satisfação do cliente", unit: "%", targetValue: 90, currentValue: 84, history: [{ id: "satisfaction-oct", value: 84, recordedAt: "2026-10-07T12:00:00.000Z", note: "Carga inicial de demonstração" }] },
      { id: "on-time-delivery", name: "Entregas no prazo", unit: "%", targetValue: 95, currentValue: 88, history: [{ id: "delivery-oct", value: 88, recordedAt: "2026-10-07T12:00:00.000Z", note: "Carga inicial de demonstração" }] }
    ]
  },
  {
    id: "innovation",
    name: "Inovação em PeopleTech e IA",
    description: "Acelerar soluções e produtividade com tecnologia.",
    metrics: [
      { id: "ai-offers", name: "Ofertas de IA validadas", unit: "ofertas", targetValue: 3, currentValue: 1, history: [{ id: "ai-oct", value: 1, recordedAt: "2026-10-07T12:00:00.000Z", note: "Carga inicial de demonstração" }] }
    ]
  },
  {
    id: "people-culture",
    name: "Pessoas e cultura",
    description: "Desenvolver capacidades e fortalecer a cultura.",
    metrics: [
      { id: "engagement", name: "Engajamento", unit: "%", targetValue: 90, currentValue: 82, history: [{ id: "engagement-oct", value: 82, recordedAt: "2026-10-07T12:00:00.000Z", note: "Carga inicial de demonstração" }] }
    ]
  }
];
