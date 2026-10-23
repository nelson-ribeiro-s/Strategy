# Prezensa Management System

Aplicação em evolução para gestão executiva da Prezensa. A interface anterior está preservada em `index.html`; a nova aplicação usa Next.js App Router, Microsoft Entra ID e PostgreSQL com Prisma.

## Implementado nesta branch

- Login Microsoft Entra ID configurado para tenant único.
- Perfis `ADMIN`, `EXECUTIVE` e `COLLABORATOR`; colaboradores começam com acesso de leitura ao Scorecard.
- API protegida para leitura de objetivos, indicadores e histórico.
- Edição persistida do nome do objetivo, nome/unidade do indicador, meta e valor atual.
- Inclusão, edição e exclusão de registros históricos, com auditoria de alterações.
- Interface responsiva de Scorecard e acesso ao protótipo legado para Cockpit, Rocks, Issues e L1.
- Dados de demonstração opcionais para validar o fluxo.

## Requisitos

- Node.js 20+
- PostgreSQL (ex.: Supabase)
- App registration Microsoft Entra ID no tenant Prezensa

## Configuração local

1. Copie `.env.example` para `.env.local` e preencha as variáveis.
2. No Entra ID, registre uma aplicação do tipo Web e configure a Redirect URI `http://localhost:3000/api/auth/callback/azure-ad`. Restrinja o tipo de conta a diretório organizacional único (tenant da Prezensa).
3. Defina `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` e `DATABASE_URL`.
4. Instale dependências: `npm install`.
5. Gere o cliente e crie/atualize as tabelas: `npm run db:generate && npm run db:push`.
6. (Opcional) Carregue indicadores de demonstração: `npm run db:seed`. Estes não são dados reais da Prezensa.
7. Execute `npm run dev`.

## Segurança e perfis

- Acesso restrito ao tenant configurado; o callback valida o claim `tid`.
- O primeiro administrador precisa ser configurado em `PREZENSA_ADMIN_EMAILS` antes do primeiro login. Depois, altere papéis diretamente no banco ou pela futura tela administrativa.
- Não comite segredos. Configure as variáveis no ambiente de deploy.
- A API valida permissões no servidor; esconder controles no navegador não é suficiente.
- Antes de produção, revisar consentimentos Entra, política de sessão, logs, backups, política de retenção e testes de segurança.

## Persistência de metas e histórico

- `Metric.targetValue` e `Metric.currentValue` são armazenados no PostgreSQL.
- Mudanças do valor atual geram uma linha em `MetricHistory` na mesma transação.
- Registros históricos podem ser adicionados, editados e excluídos por administradores/executivos.
- Alterações são registradas em `AuditEvent`.

## Nota sobre o protótipo existente

A interface antiga continua no repositório. A navegação `/legacy.html` mantém acesso aos fluxos do protótipo enquanto Rocks, Issues, L1 e Microsoft Teams são migrados para a nova arquitetura. Não considerar a integração com Teams ativa nesta fase.
