# Prezensa Management System

Aplicação em evolução para gestão executiva da Prezensa. A interface anterior está preservada em `index.html`; a nova aplicação usa Next.js App Router, Microsoft Entra ID e PostgreSQL com Prisma.

## Implementado nesta branch

- Login Microsoft Entra ID configurado para tenant único.
- Login adicional por usuário e senha com hashes bcrypt; credenciais podem ser definidas por administrador.
- Atalho `admin` / `admin` disponível somente fora de produção para desenvolvimento local; é recusado quando `NODE_ENV=production`.
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

## Login por usuário e senha

- Administradores podem definir um nome de usuário e uma senha para cada usuário já cadastrado pela tela Usuários e permissões.
- Senhas são armazenadas como hashes bcrypt (nunca em texto puro).
- O acesso fixo `admin` / `admin` existe apenas em ambientes diferentes de produção para facilitar testes locais. Ele não funciona com `NODE_ENV=production` e não deve ser usado para demonstrar ou publicar o sistema em ambiente real.
- O login usa sessão JWT do NextAuth, necessária para o provider de credenciais. Papéis e status ativo são revalidados no banco durante a sessão.

## Segurança e perfis

- Acesso restrito ao tenant configurado; o callback valida o claim `tid`.
- Para criar o primeiro administrador em produção, configure `BOOTSTRAP_ADMIN_USERNAME` e `BOOTSTRAP_ADMIN_PASSWORD` no Vercel antes do primeiro login por usuário e senha. Na primeira autenticação correspondente, a aplicação cria um usuário `ADMIN` com hash bcrypt somente se ainda não existir nenhum `ADMIN`.
- O bootstrap é de uso único: não altera nem redefine usuário, senha ou papel de contas existentes. Depois que houver um administrador, as variáveis deixam de criar contas; mudanças de acesso devem ser feitas por um administrador.
- Não use `PREZENSA_ADMIN_EMAILS` para promover contas automaticamente. O login Microsoft cria contas como `COLLABORATOR`; a atribuição de papel é administrativa.
- Não comite segredos. Configure as variáveis no ambiente de deploy.
- No Vercel, configure também `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` e as três variáveis `AZURE_AD_*` necessárias ao login Microsoft. Cadastre as duas variáveis `BOOTSTRAP_ADMIN_*` como Production, faça redeploy e remova a senha de bootstrap do Vercel depois de confirmar o primeiro acesso.
- A API valida permissões no servidor; esconder controles no navegador não é suficiente.
- Antes de produção, revisar consentimentos Entra, política de sessão, logs, backups, política de retenção e testes de segurança.

## Persistência de metas e histórico

- `Metric.targetValue` e `Metric.currentValue` são armazenados no PostgreSQL.
- Mudanças do valor atual geram uma linha em `MetricHistory` na mesma transação.
- Registros históricos podem ser adicionados, editados e excluídos por administradores/executivos.
- Alterações são registradas em `AuditEvent`.

## Nota sobre o protótipo existente

A interface antiga continua no repositório. A navegação `/legacy.html` mantém acesso aos fluxos do protótipo enquanto Rocks, Issues, L1 e Microsoft Teams são migrados para a nova arquitetura. Não considerar a integração com Teams ativa nesta fase.
