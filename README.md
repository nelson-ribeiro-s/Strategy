# Prezensa Management System

Aplicação de gestão executiva da Prezensa. O Scorecard abre sem login e usa dados iniciais fixos no código.

## Funcionalidades

- Objetivos, indicadores, metas, valores atuais e histórico de demonstração.
- Edição de objetivos, indicadores e histórico no navegador.
- As alterações são salvas no `localStorage` do navegador atual. Elas não são enviadas a um servidor nem compartilhadas com outros visitantes ou dispositivos. Limpar os dados do navegador restaura os valores iniciais.
- Acesso ao protótipo legado para Cockpit, Rocks, Issues e L1.

## Desenvolvimento e deploy

- Node.js 20+
- `npm install`
- `npm run dev`
- `npm run build` para validar a versão de produção

Não é necessário configurar banco de dados ou variáveis de ambiente para o Scorecard. A aplicação continua pública e qualquer visitante pode visualizar os valores de demonstração e editar sua própria cópia local no navegador.

## Dados

Os valores fixos são demonstrativos e ficam em `lib/scorecard-data.ts`. Para trocar os valores iniciais, edite esse arquivo. Alterações feitas pelo usuário são locais ao navegador e não modificam os dados fixos do código.

## Nota sobre o protótipo

A interface antiga continua no repositório. A navegação `/legacy.html` mantém acesso aos fluxos de protótipo enquanto Rocks, Issues, L1 e Microsoft Teams são migrados para a arquitetura atual. A integração com Teams não está ativa nesta fase.
