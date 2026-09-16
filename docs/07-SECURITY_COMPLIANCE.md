# SECURITY_COMPLIANCE.md — Insurance Lead Engine

## 1. LGPD (dado pessoal e sensível)
- [ ] Definir base legal para tratamento de dado de lead (provavelmente "execução de contrato/procedimento preliminar")
- [ ] CPF e dados de saúde (ramo Saúde) são dado pessoal sensível — exigem cuidado extra de armazenamento (criptografia em repouso, no mínimo)
- [ ] Definir política de retenção: por quanto tempo um lead "perdido" (nunca converteu) fica armazenado?
- [ ] Direito de exclusão: o lead pode pedir para apagar seus dados — precisa existir um fluxo (mesmo que manual no MVP) para isso
- [ ] Registrar consentimento de contato via WhatsApp/voz automatizada (opt-in do canal de anúncio já costuma cobrir isso, mas documentar a origem do consentimento)

## 2. SUSEP / regra de negócio crítica
- [ ] Nenhum agente de IA (voz, WhatsApp, scoring) pode gerar, mencionar ou confirmar valor de prêmio ou franquia
- [ ] Toda cotação final passa por confirmação de um `user_id` humano (corretor) — ver `Cotacao.criado_por` no data model
- [ ] Camada de validação determinística (não só prompt) bloqueando menção a valores monetários de cobertura antes de qualquer mensagem sair para o cliente
- [ ] Testes automatizados de "red team" tentando fazer o agente vazar preço

## 3. Segurança de aplicação
- [ ] Secrets (OpenAI, Vapi, WhatsApp Business API, provedor SMS, Meta/Google Ads) em secret manager do provedor de deploy — nunca em `.env` commitado
- [ ] Rate limiting no `/api/webhooks/lead-intake` (endpoint público, alvo de abuso/spam)
- [ ] Verificação de assinatura/secret em todos os webhooks de entrada (Meta, Google, Vapi, WhatsApp provider)
- [ ] Sanitização de payload antes de persistir (webhooks de terceiros podem mandar campos maliciosos ou inesperados)
- [ ] Isolamento multi-tenant: toda query que toca `Lead`, `Apolice`, etc. deve filtrar por `broker_id` — nunca confiar só no filtro de UI
- [ ] 2FA para papéis de gestor/admin (considerar exigência regulatória de corretoras)

## 4. Observabilidade e resposta a incidente
- [ ] Alertas automáticos se o Speed-to-Lead ultrapassar 90s (falha de SLA é o pior cenário de negócio deste produto)
- [ ] Dead-letter queue visível para leads que falharam em todos os canais de contato
- [ ] Plano de rollback documentado para deploys que tocam o webhook gateway ou o roteador de score
- [ ] Log de auditoria imutável (ou ao menos append-only) para `ContatoEvento`, já que pode ser usado como evidência em disputa com cliente/SUSEP

## 5. Antes de subir para produção (checklist mínimo)
- [ ] Todos os itens de "SUSEP" acima validados manualmente com casos de teste reais
- [ ] Pentest básico do webhook gateway (é a única superfície pública do sistema)
- [ ] Revisão de que nenhum log ou prompt de IA está vazando CPF/telefone em texto claro em ferramentas de terceiros (ex: logs do provedor de LLM)
