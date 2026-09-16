# CLAUDE.md — Instruções persistentes para o agente de código

> Este arquivo deve ficar na raiz do repositório. Claude Code (ou outro agente) lê isso automaticamente. Mantenha atualizado conforme o projeto evolui.

## Stack
- Next.js 16 (App Router), Tailwind CSS, Prisma, Postgres (produção) / SQLite (dev local)
- Orquestração de cascata/fallback é 100% nativa (BullMQ+Redis, pg-boss ou Upstash QStash — ver ADR-001 em docs/02-ARCHITECTURE.md). **Não usar n8n ou qualquer ferramenta low-code para lógica de produção.**
- Não introduzir outro ORM ou framework de UI sem discutir antes

## Estrutura de pastas esperada
```
/app/dashboard/leads
/app/dashboard/renovacoes
/app/dashboard/cotacao-cockpit
/app/dashboard/simulador
/app/dashboard/importar
/app/dashboard/templates
/app/dashboard/configuracoes
/app/api/webhooks/*      -> endpoints públicos, sempre com verificação de assinatura
/app/api/internal/*      -> endpoints autenticados
/prisma/schema.prisma
/docs/*                  -> esta pasta de documentação (PRD, arquitetura, etc.)
```

## Regras de negócio NÃO NEGOCIÁVEIS (violar isso é bug crítico, não "melhoria futura")
1. Nenhum código, prompt ou agente de IA pode gerar, mencionar ou confirmar valor de prêmio/franquia de seguro. Isso é sempre decisão humana do corretor.
2. Toda query de dados de Lead/Apolice/Cotacao deve filtrar por `broker_id`. Nunca confiar em filtro só na UI.
3. Deduplicação de lead: mesmo telefone em janela de 24h não pode disparar duas cascatas de contato paralelas.
4. Campos monetários são sempre `Decimal` no Prisma, nunca `Float`.

## Convenções de código & Design System (Coinbase Institutional)
- TypeScript estrito, sem `any` sem justificativa em comentário
- **Fonte da Verdade dos Tokens**: O arquivo **[`DESIGN.md`](./DESIGN.md)** na raiz do projeto é o contrato visual (Coinbase Institutional).
- **Biblioteca Canônica**: Todos os componentes visuais são construídos ou importados de `design-system/components/ui/` (55 componentes canônicos).
- **Paleta Canônica**: Base canvas branco puro (`#ffffff`), brand voltage Coinbase Blue (`#0052ff`), superfícies dark `#0a0b0d` (sidebar), e bordas hairline `#dee1e6`.
- **Botões Pílula**: Botões adotam o formato pílula (`rounded-full`) característico com `font-semibold`.
- **Proibido valores hardcoded**: Nenhuma cor, fonte, espaçamento ou raio deve ser hardcoded no código; use tokens semânticos (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.).
- **Limpeza Operacional**: Nenhuma aba, botão ou menção interna a "Design System" deve aparecer na interface do cliente. O produto é 100% voltado à operação da corretora.
- Dados numéricos e financeiros sempre monoespaçados (`JetBrains Mono`, `tabular-nums`).

## Antes de implementar qualquer tarefa
1. Ler o PRD (`docs/01-PRD.md`) e a arquitetura (`docs/02-ARCHITECTURE.md`) relevante à tarefa
2. Apresentar um plano de arquivos a serem criados/alterados **antes** de escrever código
3. Aguardar aprovação humana do plano
4. Implementar com testes (unitário para regra de negócio, e2e para fluxo crítico como webhook de ingestão)

## Comandos
- `npm run dev` — sobe o app local
- `npx prisma migrate dev` — aplica migration em dev
- `npx prisma studio` — inspeciona dados
- (definir e documentar aqui os comandos de teste/lint assim que configurados)

## O que NUNCA fazer
- Commitar `.env` ou qualquer secret (OpenAI, Vapi, WhatsApp Business API, provedor SMS, Meta/Google Ads)
- Alterar `docs/*` sem sinalizar explicitamente que é uma mudança de requisito, não só de implementação
- Implementar cálculo de prêmio/franquia via LLM — isso é sempre regra determinística revisada por humano
- Fazer deploy de mudança no webhook gateway ou no roteador de score sem plano de rollback

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
