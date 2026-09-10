# 🔄 Mapeamento e Integração dos Workflows no Produto Unificado

Este documento detalha exatamente como os **4 fluxos isolados** que você possui na pasta `n8n_fluxos` são combinados sem sobreposição para compor o **Insurance Lead Engine**.

---

## 1. Mapeamento de Papéis dos Workflows Existentes

```
[PASTAS ATUAIS]                                                 [MOTOR UNIFICADO]
─────────────────────────────────────────────────────────────────────────────────────────────
1. insurance-quote-ai-router                  ───►   Módulo 1: Receptor, Limpeza & Lead Scorer
2. vapi-gpt4-airtable-insurance-qualification ───►   Módulo 2: Agente de Ligação Ativa (Voz)
3. whatsapp-ai-insurance-lead-qualifier       ───►   Módulo 3: Agente de WhatsApp (Aria)
4. aloware-insurance-lead-qualification       ───►   Módulo 4: Régua de Fallback e Alerta SMS
```

---

## 2. Passo a Passo da Fusão dos Fluxos

### MÓDULO 1: Intake & Classificador (Derivado de `insurance-quote-ai-router`)
* **Nós reaproveitados:**
  - `Webhook /webhook/insurance-quote`: Recebe o payload do anúncio/site.
  - `Respond to Webhook 200 OK`: Responde imediatamente à landing page.
  - `Normalize Data`: Formata nomes em Title Case e telefones em E.164 (`+55...`).
  - `Deduplication Check (SHA-256)`: Impede que o mesmo cliente disparando o form duas vezes gere custos duplicados de IA.
  - `OpenAI GPT-4o-mini Evaluation`: Avalia urgência, ramo e intenção de compra (Score 0 a 100).
* **Nova Regra de Roteamento Unificado:**
  - Em vez de apenas mandar pro Slack/Teams, o nó condicional passa a acionar o **Módulo 2 (Voz)** ou o **Módulo 3 (WhatsApp)**:
    ```javascript
    // Nó Switch / Router no n8n
    if ($json.score >= 80 || $json.urgency === 'alta') {
      return { canal: 'DISPARAR_VOZ_VAPI', lead: $json };
    } else {
      return { canal: 'DISPARAR_WHATSAPP_ARIA', lead: $json };
    }
    ```

---

### MÓDULO 2: Voz Ativa de Resposta Imediata (Derivado de `vapi-gpt4-...`)
* **Nós reaproveitados:**
  - `Vapi.ai Outbound Call`: Dispara a chamada telefônica via API para o número normalizado.
  - `Post Call Webhook (end-of-call-report)`: Recebe a gravação, transcrição e análise da conversa assim que a ligação termina.
* **Lógica de Fallback Adicionada:**
  - Se a ligação der status `no-answer`, `busy` ou duração < 10 segundos:
    ```javascript
    // Fallback Inteligente para WhatsApp
    return {
      action: 'FALLBACK_TO_WHATSAPP',
      reason: 'CALL_UNANSWERED',
      phone: $json.phone,
      customGreeting: `Olá ${$json.name}! Tentei te ligar há instantes para falar sobre o seu seguro, mas não consegui contato. Vamos conversar por aqui?`
    };
    ```

---

### MÓDULO 3: Atendente Conversacional WhatsApp (Derivado de `whatsapp-ai-...`)
* **Nós reaproveitados:**
  - `WhatsApp Cloud API Trigger`: Ouve respostas do lead no WhatsApp.
  - `Buffer Memory by Phone`: Mantém o histórico da conversa vivo para que o agente saiba o que o cliente já disse.
  - `OpenAI Agent (Aria)`: Conduz o diálogo com empatia, tira dúvidas sobre franquia/cobertura e extrai os dados do veículo/imóvel/empresa.
  - `Output Parser`: Extrai o JSON limpo do perfil do segurado para o relatório final.

---

### MÓDULO 4: Fallback SMS & Régua de Nutrição (Derivado de `aloware-...`)
* **Nós reaproveitados:**
  - `Twilio / Z-API SMS Action`: Dispara SMS curto quando o WhatsApp não for aberto em 2 horas.
  - Mensagem modelo com link direto:
    `"Marcelo, sua cotação de seguro auto está pronta. Clique para falar com a equipe: https://wa.me/5511999998888?text=Ola_quero_minha_cotacao"`
  - Régua espaçada (Dia 1, Dia 3, Dia 7) para leads que ficaram frios.

---

## 3. Consolidação Final: O Handover para o Corretor

Quando o lead é qualificado (seja pelo Módulo 2 ou Módulo 3):
1. O workflow aciona o nó **Slack / Microsoft Teams / WhatsApp Interno**:
   - Dispara um **Card Comercial** com o Score, Resumo, Veículo/Ramo e botão direto:
     - 📞 `Ligar para o Cliente`
     - 💬 `Abrir WhatsApp Web`
     - 📋 `Ver Transcrição Completa`
2. Cria ou atualiza o negócio no CRM (HubSpot, Pipedrive ou planilha do Google Sheets).
