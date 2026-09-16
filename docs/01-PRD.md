# PRD — Insurance Lead Engine

## 1. Problema
Corretoras de seguros PJ perdem entre 60-90% dos leads de tráfego pago porque o tempo médio de primeiro contato do mercado é de 4 a 12 horas. O cliente já fechou com concorrente ou esfriou. Paralelamente, renovações de apólice são perdidas por falta de visibilidade temporal (a corretora só percebe o vencimento tarde demais).

## 2. Objetivo do produto
Unificar em uma única plataforma (a) triagem e resposta ultrarrápida de leads (Speed-to-Lead < 45s), (b) cotação multi-seguradora estruturada e (c) radar de renovação com prevenção ativa de churn — eliminando a fragmentação atual entre planilhas, WhatsApp manual e n8n solto.

## 3. Personas
| Persona | Contexto | Dor principal | O que "sucesso" parece pra ela |
|---|---|---|---|
| Corretor PJ operacional | Usa o sistema o dia todo, decide sob pressão de SLA | Não sabe qual lead atacar primeiro | Vê a fila já priorizada, sem precisar pensar |
| Gestor/dono da corretora | Acompanha métricas e ROI do tráfego pago | Não sabe quanto do investimento em ads vira apólice | Dashboard de conversão ponta a ponta |
| Operador de back-office | Faz ingestão de carteira e configura réguas | Perde tempo com planilhas manuais de renovação | Importa CSV/XLSX e o sistema monta o radar sozinho |

## 4. Escopo da v1 (MVP)
Dentro do escopo:
- `/dashboard/leads` — esteira de triagem, score 0-100, contato via WhatsApp/Voz IA
- `/dashboard/renovacoes` — régua de decaimento temporal (15-30 dias) e risco de churn
- `/dashboard/cotacao-cockpit` — matriz comparativa das 8 seguradoras listadas
- `/dashboard/simulador` — cálculo de prêmio/comissão (sem IA gerando valor final — regra de negócio explícita, ver §7)
- `/dashboard/importar` — ingestão CSV/XLSX de carteira
- `/dashboard/templates` — réguas de comunicação
- `/dashboard/configuracoes` — parâmetros e integrações de canal
- Cascata de contato: Voz IA (Vapi) → WhatsApp IA → SMS/nutrição, com fallback automático
- Webhook gateway único para Meta Ads/Google Ads/Landing Page com deduplicação de 24h

Fora do escopo da v1 (explicitamente adiado):
- Emissão de apólice dentro da plataforma (integração direta com seguradora)
- App mobile nativo
- Múltiplas filiais/multi-tenant hierárquico (fica para o plano Enterprise, fase 2+)
- Precificação automática de prêmio pela IA (proibido por design, não só por escopo — ver §7)

## 5. Métricas de sucesso (North Star + guardrails)
1. **Speed-to-Lead**: tempo entre entrada do lead e primeiro contato — meta < 45s (p50) e < 90s (p95).
2. **Taxa de conversão cotação → apólice emitida** — baseline a definir nas primeiras 4 semanas de uso real.
3. **Retenção de carteira**: % de renovações fechadas dentro da janela de 15-30 dias antes do vencimento.
4. Guardrail: taxa de erro/alucinação da IA em dados de cobertura = 0% tolerável (é bloqueante, não é "métrica para melhorar depois").

## 6. Requisitos não-funcionais
- **Compliance SUSEP**: a IA nunca gera ou informa valor final de prêmio/franquia — isso é sempre decisão humana do corretor.
- **LGPD**: dados de lead (CPF, telefone, dados de saúde/veículo) são dado pessoal e, em alguns casos, dado sensível (saúde) — exige base legal, retenção definida e criptografia em repouso.
- **Disponibilidade**: o webhook gateway de ingestão de leads precisa ter uptime alto — perder um lead de anúncio pago é o pior cenário possível para este produto.
- **Auditabilidade**: todo contato automatizado (voz/WhatsApp) precisa ficar registrado e rastreável a um lead_id.

## 7. Regras de negócio críticas (não negociáveis)
- IA qualifica interesse, perfil e coberturas desejadas — **nunca** inventa ou comunica preço/franquia.
- Deduplicação de lead: mesma pessoa (telefone/CPF) em janela de 24h não deve gerar dois disparos de cascata paralelos.
- Roteamento por score: ≥80 ou urgente/B2B → Voz IA; 50-79 → WhatsApp IA; <50 → nutrição SMS.
- Fallback: não atendeu voz → WhatsApp contextualizado; sem resposta em 2h no WhatsApp → nutrição.

## 8. Riscos conhecidos
| Risco | Impacto | Mitigação planejada |
|---|---|---|
| IA "alucinar" valor de prêmio | Alto (jurídico/SUSEP) | Trava de prompt + validação de output antes de enviar ao lead |
| Perda de webhook de ads (timeout/erro) | Alto (perde o lead) | Fila com retry + dead-letter queue |
| WhatsApp Oficial bloqueando número por volume | Médio | Rate limiting e templates aprovados pela Meta |
| Corretora não confia no score da IA | Médio (adoção) | Transparência: mostrar por que o score foi X |

## 9. Fora de discussão nesta fase
Preço final do SaaS, integrações de CRM específicas (HubSpot/Pipedrive) e definição de multi-filial ficam para depois do MVP validar Speed-to-Lead com pelo menos uma corretora piloto.
