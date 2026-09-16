# TASK_BREAKDOWN.md — Primeiras tarefas para o agente de código (Fase 1)

> Modelo de como quebrar cada fase do roadmap em tarefas antes de mandar a IDE/CLI implementar. Peça para a LLM gerar este nível de detalhe a cada nova fase, sempre revisando antes de aprovar a execução.

## Épico: Fundação do projeto

### Tarefa 1.1 — Scaffold do projeto
- Criar projeto Next.js 16 (App Router) + Tailwind CSS
- Configurar Prisma apontando para SQLite (dev)
- Critério de aceite: `npm run dev` sobe uma página em branco sem erro

### Tarefa 1.2 — Schema Prisma inicial
- Implementar entidades do 03-DATA_MODEL.md: Broker, User, Lead, ContatoEvento, Apolice, Cotacao, Seguradora, Template, IntegracaoCanal
- Rodar primeira migration
- Critério de aceite: `prisma studio` mostra todas as tabelas com os relacionamentos corretos

### Tarefa 1.3 — Autenticação + multi-tenancy
- Configurar NextAuth (ou solução escolhida no ADR-004)
- Middleware que injeta `broker_id` em toda query de dados sensíveis
- Critério de aceite: usuário de uma corretora não consegue ver dado de outra (teste manual com 2 brokers de seed)

### Tarefa 1.4 — Seed de dados
- Popular Seguradora com as 8 seguradoras do PRD
- Criar 1-2 brokers e usuários de teste
- Critério de aceite: ambiente de dev utilizável sem precisar cadastrar tudo manualmente

### Tarefa 1.5 — CRUD manual de Lead e Apolice
- Telas simples (sem os "taste dials" de design ainda) para criar/editar/listar
- Critério de aceite: dá para cadastrar um lead e uma apólice manualmente, ponta a ponta

## Como usar este documento com a IDE/CLI
1. Cole uma tarefa por vez (não o épico inteiro) no Claude Code/Cursor
2. Peça: "antes de implementar, me dê um plano de arquivos que serão criados/alterados"
3. Revise o plano
4. Só então mande implementar
5. Peça teste automatizado junto (unitário para regra de negócio, e2e básico para o fluxo crítico)

## Épico adicional (Fase 3, sem n8n): Fila e cascata nativas

### Tarefa 3.0 — Escolher e configurar o mecanismo de fila
- Decidir entre BullMQ+Redis, pg-boss ou Upstash QStash (conforme ambiente de deploy definido)
- Critério de aceite: um job de teste roda, falha de propósito, e vai para dead-letter corretamente

### Tarefa 3.1 — Job de fallback voz → WhatsApp
- Job que escuta o webhook de resultado de contato; se `resultado = nao_atendeu` e `canal = voz`, enfileira disparo de WhatsApp contextualizado
- Critério de aceite: teste automatizado simula "não atendeu" e verifica que o job de WhatsApp foi enfileirado com o contexto certo

### Tarefa 3.2 — Job de fallback WhatsApp → SMS (timer de 2h)
- Job agendado (delay de 2h) que verifica se houve resposta; se não, enfileira SMS de nutrição
- Critério de aceite: teste com tempo mockado confirma o disparo após 2h sem resposta

### Tarefa 3.3 — Dead-letter e observabilidade
- Leads que falharam em todos os canais aparecem em `/dashboard/configuracoes` (ou tela própria)
- Critério de aceite: um lead que falha voz+WhatsApp+SMS aparece na fila morta com o motivo de cada falha

## Backlog das próximas fases
As tarefas de Fase 2 em diante (scoring, cascata de canais, cockpit) devem ser quebradas no mesmo formato **somente depois** que a Fase 1 estiver validada — não adiante o design de scoring/IA antes do schema e da autenticação estarem sólidos, senão retrabalho é praticamente garantido.
