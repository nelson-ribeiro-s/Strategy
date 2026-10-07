# Prezensa Management System — V2

Protótipo funcional do sistema de gestão da Prezensa.

## Alterações da V2
- Objetivos estratégicos não possuem percentual de conclusão.
- No Dashboard, os indicadores aparecem dentro de cada objetivo estratégico.
- Referências numéricas aos objetivos foram substituídas pelos nomes completos.
- Alternância Dark / Light com persistência local.
- “Level 10” substituído por **L1 — Leadership One**.
- Área de integração Microsoft Teams na execução da L1.

## Estrutura
- Dashboard Executivo
- Scorecard por objetivo
- Company Rocks
- Issues / IDS
- L1 — Leadership One
- Integração planejada com Microsoft 365 / Microsoft Graph para reunião, gravação e transcrição.

## Teams — produção
A V2 contém a interface e o fluxo conceitual. A integração real exige uma aplicação web com backend, autenticação Microsoft Entra ID e consentimento das permissões do tenant.

Fluxo recomendado:
1. Usuário conecta Microsoft 365.
2. Sistema cria ou vincula o `onlineMeeting` da L1.
3. Ao terminar a reunião, o Microsoft Graph pode notificar quando gravação/transcrição estiver disponível.
4. Sistema busca a gravação/transcrição e associa ao registro da L1.
5. Em uma etapa posterior, a transcrição pode alimentar automaticamente decisões, Issues e To-dos.

Documentação Microsoft:
- https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/meeting-transcripts/overview-transcripts
- https://learn.microsoft.com/en-us/graph/api/onlinemeeting-list-recordings
- https://learn.microsoft.com/en-us/graph/api/onlinemeeting-list-transcripts

## Próxima etapa
Transformar o protótipo estático em aplicação multiusuário: Next.js/Vercel + PostgreSQL/Supabase + Microsoft Entra ID + Microsoft Graph.
