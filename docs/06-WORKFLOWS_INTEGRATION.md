# WORKFLOWS_INTEGRATION.md — Insurance Lead Engine

> Objetivo: unificar os 4 sistemas legados citados no README sem duplicar lógica nem perder capacidade. Antes de escrever código, mapeie o que cada legado fazia e para onde essa responsabilidade vai no novo sistema.

## Mapeamento legado → novo módulo

| Sistema legado | O que fazia | Vira, no Insurance Lead Engine |
|---|---|---|
| `insurance-quote-ai-router` | Roteamento e scoring de lead | Agente de Scoring (05-PROMPTS_AND_AGENTS.md §1) + `/api/internal/leads/{id}/score` |
| `vapi-gpt4-airtable-...` | Atendimento de voz ativo em 45s, provavelmente com Airtable como banco | Agente de Voz (§2) + Postgres/Prisma no lugar do Airtable — **atenção: migrar dados históricos do Airtable, se existirem, antes de descomissionar** |
| `whatsapp-ai-insurance-...` | Assistente de WhatsApp com memória | Agente "Aria" (§3) |
| `aloware-insurance-...` | Régua de fallback e nutrição SMS | Agente de Nutrição SMS (§4) — decidir se mantém Aloware como provedor ou troca por Twilio/Zenvia |

## Perguntas a responder antes de migrar (não durante)
1. Os dados desses 4 sistemas legados (leads históricos, conversas, resultado de contato) precisam ser migrados para o novo Postgres, ou o novo sistema começa "zerado"?
2. Algum desses sistemas está em produção AGORA atendendo corretoras reais? Se sim, precisa de plano de corte (feature flag / rollout gradual), não um "big bang".
3. As credenciais/tokens de Vapi, WhatsApp Business API e Aloware já existem e serão reaproveitadas, ou serão recriadas do zero?

## Orquestração: sem n8n (ADR-001 fechado)
Toda a lógica de orquestração dos 4 sistemas legados — scoring, cascata de canais, réguas de nutrição, notificações — é portada para código nativo dentro do Next.js/fila própria (BullMQ, pg-boss ou QStash, conforme sub-decisão do ADR-001). Nenhuma parte do fluxo de produção depende de n8n.

## Fluxos legados a inventariar antes de portar (discovery, não implementação ainda)
Se algum dos 4 sistemas legados usa n8n internamente, isso vira trabalho de **migração de lógica**, não de "conectar o novo sistema ao n8n existente":
- Listar todos os workflows n8n existentes dos 4 projetos legados (se houver)
- Para cada um: trigger, ações, credenciais usadas, volume médio de execuções/mês
- Marcar quais têm lógica duplicada entre os 4 sistemas (ex: normalização de telefone provavelmente existe em mais de um) — são candidatos a virar uma função utilitária única no novo sistema
- Reescrever cada fluxo como função/job testável em código, seguindo os contratos do 04-API_CONTRACTS.md

## Ordem recomendada de unificação
1. Webhook Gateway único (evita quebrar ingestão de leads em produção)
2. Scoring (baixo risco de UI, alto valor)
3. Cascata de canais com fallback
4. Handover/alertas ao corretor
5. Descomissionar sistemas legados um a um, só depois de validar paridade de funcionalidade
