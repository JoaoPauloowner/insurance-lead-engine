# API_CONTRACTS.md — Insurance Lead Engine

> Peça para a LLM/IDE gerar o OpenAPI/Swagger completo a partir destes contratos-base. Aqui está a fonte de verdade dos payloads e regras — não deixe a IA "inventar" campos além destes sem te perguntar.

## 1. Webhook Gateway (entrada de leads)

`POST /api/webhooks/lead-intake`

Payload esperado (normalizado, independente da origem):
```json
{
  "origem": "meta_ads | google_ads | landing_page",
  "nome": "string",
  "telefone": "string (será normalizado para E.164)",
  "email": "string | null",
  "ramo_interesse": "auto | saude | vida | residencial | empresarial",
  "raw_payload": { "...": "payload original da origem, guardado para auditoria" }
}
```

Regras do endpoint:
- Normalizar telefone para E.164 antes de qualquer processamento
- Checar `hash_dedup` (telefone + janela de 24h) — se já existe, **não** disparar nova cascata, apenas logar
- Resposta deve ser rápida (< 500ms) — processamento de score/roteamento é assíncrono (fila), não bloqueia a resposta do webhook
- Retornar 200 mesmo em caso de erro de negócio (dedup) para a origem (Meta/Google) não reenviar em loop — erros de negócio são logados internamente, não retornados como HTTP error

## 2. Scoring de lead (interno)

`POST /api/internal/leads/{lead_id}/score`
- Roda após a ingestão, calcula score 0-100
- Response: `{ "lead_id": "...", "score": 82, "estrategia": "voz_ia | whatsapp_ia | sms_nutricao" }`
- **Regra crítica**: este endpoint nunca deve retornar ou persistir valor de prêmio/franquia — é score de propensão, não de preço.

## 3. Disparo de canal

`POST /api/internal/canais/voz/disparar`
`POST /api/internal/canais/whatsapp/disparar`
`POST /api/internal/canais/sms/disparar`

Payload comum:
```json
{ "lead_id": "...", "template_id": "... | null", "contexto": { "motivo_fallback": "nao_atendeu_voz | sem_resposta_2h | null" } }
```

## 4. Webhook de resultado de contato (vindo do Vapi / WhatsApp provider)

`POST /api/webhooks/contato-resultado`
```json
{
  "lead_id": "...",
  "canal": "voz | whatsapp | sms",
  "resultado": "atendeu | nao_atendeu | sem_resposta | respondeu",
  "transcript_ou_payload": "string | json"
}
```
- Se `resultado = nao_atendeu` e `canal = voz` → dispara fallback automático para WhatsApp (ver regra de cascata no PRD §7)
- Se `resultado = sem_resposta` após 2h e `canal = whatsapp` → dispara fallback para SMS

## 5. Importação de carteira

`POST /api/importar/apolices` (multipart, CSV/XLSX)
- Validar schema antes de persistir: linhas inválidas devem ser reportadas ao usuário, não silenciosamente descartadas
- Response deve trazer: total de linhas, linhas importadas com sucesso, linhas com erro + motivo

## 6. Radar de renovação

`GET /api/renovacoes?janela=15-30dias&status=critica`
- Retorna lista de apólices na janela de risco configurada

## 7. Simulador/Cotação

`POST /api/cotacoes/calcular`
```json
{ "lead_id": "...", "seguradora_id": "...", "ramo": "...", "perfil_segurado": { "...": "..." } }
```
- **Cálculo determinístico de negócio (tabela de comissão), nunca gerado por LLM.**
- Sempre associado a um `user_id` humano que confirmou o cálculo (auditoria de compliance)

## 8. Convenções gerais
- Todas as respostas de erro seguem `{ "error": { "code": "...", "message": "..." } }`
- Autenticação via sessão (NextAuth) para rotas `/dashboard/*` e `/api/internal/*`; webhooks públicos (`/api/webhooks/*`) usam verificação de assinatura/secret do provedor de origem
- Todo endpoint que lida com dado de lead/apólice deve logar `broker_id` para isolamento multi-tenant
