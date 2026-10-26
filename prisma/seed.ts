import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const objectives = [
    { name: "Crescimento sustentável", description: "Expandir receita com rentabilidade.", metrics: [{ name: "Receita recorrente", unit: "R$", targetValue: 1000000, currentValue: 750000 }, { name: "Novos clientes estratégicos", unit: "clientes", targetValue: 8, currentValue: 5 }] },
    { name: "Excelência na entrega", description: "Entregar valor previsível aos clientes.", metrics: [{ name: "Satisfação do cliente", unit: "%", targetValue: 90, currentValue: 84 }, { name: "Entregas no prazo", unit: "%", targetValue: 95, currentValue: 88 }] },
    { name: "Inovação em PeopleTech e IA", description: "Acelerar soluções e produtividade com tecnologia.", metrics: [{ name: "Ofertas de IA validadas", unit: "ofertas", targetValue: 3, currentValue: 1 }] },
    { name: "Pessoas e cultura", description: "Desenvolver capacidades e fortalecer a cultura.", metrics: [{ name: "Engajamento", unit: "%", targetValue: 90, currentValue: 82 }] }
  ];
  for (let i = 0; i < objectives.length; i++) {
    const item = objectives[i];
    const existing = await prisma.objective.findFirst({ where: { name: item.name } });
    if (existing) continue;
    const objective = await prisma.objective.create({ data: { name: item.name, description: item.description, sortOrder: i } });
    for (let j = 0; j < item.metrics.length; j++) {
      const metricData = item.metrics[j];
      const metric = await prisma.metric.create({ data: { ...metricData, objectiveId: objective.id, sortOrder: j } });
      await prisma.metricHistory.create({ data: { metricId: metric.id, value: metric.currentValue, note: "Carga inicial de demonstração" } });
    }
  }
  console.log("Carga inicial concluída. Os valores inseridos são dados de demonstração e devem ser substituídos pelos números reais da Prezensa.");
}
main().finally(() => prisma.$disconnect());
