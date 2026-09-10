# 🚀 Roadmap de Implementação — Insurance Lead Engine

Este guia estabelece o plano prático passo a passo para transformar a especificação em um produto executável e testado de ponta a ponta.

---

## 📅 Visão Geral das Fases

```
[Fase 0: Gateway & Ingestão] ──► [Fase 1: Motor de Decisão & Scorer] ──► [Fase 2: Voz Ativa & Fallback]
                                                                                │
[Fase 5: Go-to-Market]      ◄── [Fase 4: Handover & CRM Alerts]     ◄── [Fase 3: WhatsApp Conversacional]
```

---

## Fase 0: Gateway & Ingestão Universal
* [ ] Criar endpoint HTTP no n8n (ou microserviço Node.js) `/webhook/insurance-leads`.
* [ ] Adicionar nó `Respond to Webhook` (HTTP 200 em < 200ms para o Facebook/Google não darem timeout).
* [ ] Implementar sanitização E.164 brasileira (+55 + DDD + 8/9 dígitos) com detecção de DDD válido.
* [ ] Implementar deduplicação por hash SHA-256 (`origem + telefone + data`) com janela de 24h.

## Fase 1: Motor de Decisão & Scorer com IA
* [ ] Conectar nó de chamada de IA (OpenAI GPT-4o-mini ou Gemini Flash).
* [ ] Aplicar o prompt de pontuação e classificação estruturada (JSON Output).
* [ ] Configurar nó Switch condicional baseado no `score`:
  - Rota A (`score >= 80`): Voz Ativa Vapi.
  - Rota B (`score 50 a 79`): WhatsApp Oficial.
  - Rota C (`score < 50`): Fila de SMS.

## Fase 2: Agente de Voz Ativo (Vapi.ai) & Fallback em Cascata
* [ ] Configurar assistente de voz no Vapi.ai com voz humanizada em português brasileiro.
* [ ] Plugar o nó de disparo de chamada outbound no n8n.
* [ ] Criar endpoint de webhook de retorno (`/webhook/vapi-end-of-call`).
* [ ] Implementar gatilho de **Fallback para WhatsApp**: se status for `no-answer`, `busy`, ou se o lead recusar a chamada, aciona o template de WhatsApp imediatamente.

## Fase 3: Agente de WhatsApp Conversacional (Aria)
* [ ] Configurar conexão com provedor de WhatsApp (Meta Cloud API Oficial ou Evolution API).
* [ ] Configurar memória buffer por número de telefone (Redis ou nó de memória do n8n).
* [ ] Implementar o extrator de dados para gerar o **Blueprint de Qualificação** (JSON com veículo/imóvel, seguradora atual, coberturas).

## Fase 4: Handover & Central de Alertas Comerciais
* [ ] Criar template de card rico para o **Slack** e **Microsoft Teams** com botões interativos (`📞 Ligar para o Lead`, `💬 Abrir Conversa`).
* [ ] Sincronizar os dados estruturados no CRM (HubSpot, Pipedrive ou Google Sheets compartilhado com os corretores).
* [ ] Disparar SMS de confirmação para o lead caso ele tenha solicitado retorno posterior.

## Fase 5: Validação E2E e Lançamento de Mercado
* [ ] Simular um lead quente (Auto Premium vencendo em 5 dias) -> verificar ligação da IA em < 45s.
* [ ] Simular cliente recusando a chamada -> verificar se o WhatsApp apita com mensagem contextualizada em < 10 segundos.
* [ ] Validar gravação da ligação e preenchimento correto do Blueprint no CRM.
* [ ] Apresentar demonstração para as primeiras 3 corretoras parceiras para validar taxa de conversão real.
