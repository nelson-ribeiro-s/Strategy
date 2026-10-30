# Prezensa Management System

Aplicação de gestão executiva da Prezensa. A interface atual usa Next.js App Router e PostgreSQL com Prisma. O Scorecard abre diretamente, sem login: qualquer pessoa que consiga acessar a URL pode consultar e alterar objetivos, metas, valores atuais e histórico.

## Funcionalidades

- Scorecard de objetivos e indicadores.
- Edição persistida de objetivos, indicadores, unidades, metas e valores atuais.
- Inclusão, edição e exclusão de registros históricos.
- Auditoria das alterações e persistência no PostgreSQL.
- Acesso ao protótipo legado para Cockpit, Rocks, Issues e L1.

## Requisitos

- Node.js 20+
- PostgreSQL (ex.: Supabase)

## Configuração local

1. Copie `.env.example` para `.env.local` e informe `DATABASE_URL`.
2. Instale dependências: `npm install`.
3. Gere o Prisma Client e sincronize o schema: `npm run db:generate && npm run db:push`.
4. (Opcional) Carregue indicadores de demonstração: `npm run db:seed`. Esses valores não são dados reais da Prezensa.
5. Execute `npm run dev`.

## Implantação

Configure somente `DATABASE_URL` no ambiente de implantação. O build executa `prisma generate` e `next build`. Depois de preparar o PostgreSQL, aplique o schema com `npm run db:push` ou use o fluxo de schema adotado pela equipe.

**A aplicação não tem autenticação nem autorização.** Qualquer pessoa com acesso à URL pode visualizar e editar os dados. Restrinja a exposição da URL na infraestrutura caso isso não seja desejado. Esta alteração não faz deploy.

## Persistência de metas e histórico

- `Metric.targetValue` e `Metric.currentValue` são armazenados no PostgreSQL.
- Mudanças do valor atual geram uma linha em `MetricHistory` na mesma transação.
- Registros históricos podem ser adicionados, editados e excluídos sem login.
- Alterações são registradas em `AuditEvent`; sem identidade autenticada, novas entradas não identificam uma conta de usuário. IDs antigos de autoria permanecem como dados históricos sem relação com uma tabela de usuários.

## Nota sobre o protótipo

A interface antiga continua no repositório. A navegação `/legacy.html` mantém acesso aos fluxos de protótipo enquanto Rocks, Issues, L1 e Microsoft Teams são migrados para a arquitetura atual. A integração com Teams não está ativa nesta fase.
