# DATA_MODEL.md — Insurance Lead Engine

> Modelo conceitual para orientar o schema Prisma. Ajustar nomes de campo ao padrão de código que a IDE/IA for gerar, mas as entidades e relações abaixo devem ser preservadas.

## Entidades principais

### Broker (Corretora) — assumindo multi-tenant (ver ADR-003)
- id, nome, cnpj, plano (Pro/Scale/Enterprise), canais_ativos (json), criado_em

### User (Usuário do sistema)
- id, broker_id (FK), nome, email, papel (corretor/gestor/backoffice), criado_em

### Lead
- id, broker_id (FK), nome, telefone_e164, cpf (nullable, dado sensível), origem (meta_ads/google_ads/landing_page), ramo_interesse (auto/saude/vida/residencial/empresarial), score (0-100), status (novo/em_contato/qualificado/perdido/convertido), criado_em, hash_dedup (telefone+janela 24h)

### ContatoEvento (log de cada tentativa de contato — auditoria)
- id, lead_id (FK), canal (voz/whatsapp/sms), resultado (atendeu/nao_atendeu/sem_resposta/respondeu), payload_ia (json — o que a IA disse/coletou), timestamp

### Apolice (carteira existente, vinda de importação)
- id, broker_id (FK), lead_id (FK nullable — pode não ter vindo de lead), seguradora, ramo, numero_apolice, data_vigencia_inicio, data_vigencia_fim, valor_premio, status (ativa/renovada/cancelada/perdida)

### RenovacaoRadar (derivado, calculado a partir de Apolice)
- id, apolice_id (FK), dias_para_vencimento (calculado), janela_risco (segura/atencao/critica — baseado nos 15-30 dias do PRD), acao_recomendada, status_acao (pendente/em_andamento/concluida)

### Cotacao (do simulador/cockpit)
- id, lead_id (FK), seguradora, ramo, valor_premio_calculado, valor_comissao_calculado, perfil_segurado (json), criado_por (user_id — sempre humano, nunca "ia")

### Seguradora (catálogo fixo das 8 listadas)
- id, nome (Porto Seguro, Tokio Marine, Allianz, Bradesco, Azul, HDI, Zurich, Suhai), tabela_comissao (json)

### Template (réguas de comunicação)
- id, broker_id (FK), canal, gatilho (novo_lead/fallback_2h/renovacao_15d/renovacao_30d), conteudo, ativo (bool)

### IntegracaoCanal (credenciais/config)
- id, broker_id (FK), canal (whatsapp/vapi/sms/meta_ads/google_ads), config (json — tokens ficam em secret manager, não aqui), status (conectado/erro/desconectado)

## Relações-chave
- Broker 1—N User, Lead, Apolice, Template, IntegracaoCanal
- Lead 1—N ContatoEvento
- Apolice 1—1 RenovacaoRadar (calculado, pode ser view/job em vez de tabela persistida)
- Lead 1—N Cotacao

## Pontos de atenção para o schema Prisma
1. **`cpf` e dados de saúde são sensíveis (LGPD)** — considerar criptografia em nível de coluna ou ao menos hashing para dedup sem guardar o CPF em claro se não for estritamente necessário.
2. **`hash_dedup`** precisa de índice único com janela de tempo — na prática isso é lógica de aplicação (verificar antes de inserir), não uma constraint pura de banco.
3. **`RenovacaoRadar`** pode ser uma tabela materializada por um job diário, ou uma view calculada on-the-fly — decidir com base em volume esperado de apólices por corretora.
4. Todo campo monetário deve ser `Decimal`, nunca `Float` (evita erro de arredondamento em prêmio/comissão).
