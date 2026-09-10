# 🏛️ Arquitetura Técnica do Insurance Lead Engine

Este documento define a arquitetura técnica, modelo de dados, contratos de API e a máquina de estados de fallback em cascata para o **Insurance Lead Engine**.

---

## 1. Visão Arquitetural de Componentes

```mermaid
flowchart TB
    subgraph Clients["1. Fontes de Aquisição"]
        FB[Meta Lead Ads Webhook]
        GA[Google Ads / Landing Page Webhook]
        WP[WordPress / Elementor Form]
        CSV[Importação de Lote CSV]
    end

    subgraph Core_Ingest["2. Ingestão & Higienização"]
        Gateway["/api/v1/leads/intake"]
        Sanitizer[Phone Normalizer E.164 + Name Case]
        Deduplicator[Redis / SQLite SHA-256 Hash Guard 24h]
    end

    subgraph AI_Brain["3. Cérebro de Scoring & Estratégia"]
        Scorer[OpenAI GPT-4o-mini / Gemini Flash Classifier]
        DecisionEngine[Rules & Strategy Matrix]
    end

    subgraph Channel_Orchestrator["4. Orquestrador Omnichannel com Fallback"]
        Queue[Fila de Tarefas Assíncrona]
        VoiceWorker[Vapi.ai Voice Outbound Worker]
        WhatsAppWorker[Meta Cloud API / Evolution Worker]
        SmsWorker[Twilio / Z-API SMS Worker]
        FallbackController[Máquina de Estados de Transição de Canal]
    end

    subgraph Storage_CRM["5. Persistência & Handover"]
        DB[(PostgreSQL / SQLite Multi-tenant)]
        CRM[HubSpot / Pipedrive / Sheets Sync]
        Alerts[Slack Block Kit / Teams Adaptive Card]
    end

    Clients --> Gateway
    Gateway --> Sanitizer --> Deduplicator --> Scorer --> DecisionEngine
    DecisionEngine --> Queue
    Queue --> FallbackController
    FallbackController <--> VoiceWorker
    FallbackController <--> WhatsAppWorker
    FallbackController <--> SmsWorker
    FallbackController --> DB
    FallbackController --> CRM
    FallbackController --> Alerts
```

---

## 2. Máquina de Estados: Cascading Fallback Engine

A grande inovação do produto é a **continuidade sem atrito**. O lead nunca é abandonado caso não atenda ou demore para responder.

```mermaid
stateDiagram-v2
    [*] --> LeadIngested: Webhook recebido
    LeadIngested --> LeadScored: Avaliação de Risco & Score
    
    state LeadScored {
        [*] --> HighUrgency: Score >= 80 (Hot / B2B)
        [*] --> StandardUrgency: Score 50-79 (Padrão)
        [*] --> LowUrgency: Score < 50 (Cold)
    }

    HighUrgency --> VoiceCallTriggered: Dispara Vapi em até 45s
    StandardUrgency --> WhatsAppTriggered: Envia template WhatsApp
    LowUrgency --> NurtureScheduled: Agenda SMS em 24h

    VoiceCallTriggered --> VoiceCompleted: Atendeu e concluiu
    VoiceCallTriggered --> WhatsAppTriggered: Não atendeu / Caixa postal (Fallback 1)
    
    WhatsAppTriggered --> WhatsAppEngaged: Cliente respondeu conversa
    WhatsAppTriggered --> SmsTriggered: Sem resposta após 2h (Fallback 2)

    VoiceCompleted --> HandoverReady: Blueprint extraído
    WhatsAppEngaged --> HandoverReady: Dados coletados por texto
    SmsTriggered --> WhatsAppEngaged: Cliente clicou no link do SMS

    HandoverReady --> BrokerNotified: Alerta no Slack/WhatsApp do Corretor
    BrokerNotified --> ClosedWon: Apólice Fechada
    BrokerNotified --> ClosedLost: Declinado / Sem interesse
```

---

## 3. Contrato de Ingestão de Leads (`/api/v1/leads/intake`)

### Request Payload (JSON)
```json
{
  "source": "facebook_lead_ads",
  "campaign": "seguro_auto_prime_sp",
  "name": "Marcelo Albuquerque de Castro",
  "phone": "(11) 98765-4321",
  "email": "marcelo.albuquerque@empresa.com",
  "city": "São Paulo",
  "state": "SP",
  "insuranceType": "auto",
  "notes": "Tenho uma BMW X3 2023, seguro atual vence em 10 dias na Porto.",
  "urgency": "alta",
  "preferredContact": "qualquer"
}
```

### Resposta Imediata do Webhook (HTTP 200 OK em < 200ms)
```json
{
  "success": true,
  "leadId": "lead_99812f8a",
  "status": "queued_for_processing",
  "estimatedActionTimeSeconds": 30
}
```

---

## 4. O Blueprint de Qualificação (Estrutura de Saída para o Corretor)

Ao final da interação (seja por voz ou WhatsApp), o sistema compila o seguinte objeto estruturado no banco e envia para o corretor:

```json
{
  "leadId": "lead_99812f8a",
  "score": 92,
  "priority": "HOT_LEAD",
  "qualificationSummary": {
    "segurado": "Marcelo Albuquerque de Castro",
    "telefone": "+5511987654321",
    "ramo": "Seguro Automóvel",
    "veiculo": "BMW X3 xDrive30e M Sport 2023",
    "placaOuChassi": "Informado que enviará pelo WhatsApp",
    "seguradoraAtual": "Porto Seguro (vence em 10 dias)",
    "uso": "Particular / Residência para Escritório",
    "garagem": "Sim (casa e trabalho)",
    "condutorPrincipal": "Marcelo (42 anos, casado)",
    "principaisDores": "Achou a renovação da seguradora atual muito cara; deseja coberturas adicionais para vidros blindados.",
    "melhorHorarioContato": "Disponível agora à tarde"
  },
  "recommendedAction": "Ligar imediatamente para apresentar comparativo Porto x Bradesco x Allianz com foco em vidros/franquia reduzida.",
  "links": {
    "directWhatsApp": "https://wa.me/5511987654321",
    "audioRecordingUrl": "https://api.vapi.ai/recordings/rec_98812.mp3",
    "fullTranscript": "https://app.leadengine.com.br/leads/lead_99812f8a/transcript"
  }
}
```

---

## 5. Modelo de Dados (Prisma / SQL)

```prisma
model Lead {
  id              String         @id @default(cuid())
  organizationId  String
  nome            String
  telefone        String
  email           String?
  origem          String         // meta_ads, google_ads, site, csv
  ramoDesejado    String         // auto, saude, vida, empresarial, etc.
  score           Int            @default(0)
  prioridade      String         @default("cold") // hot, warm, cold
  status          String         @default("recebido") // recebido, em_contato, qualificado, desqualificado, fechado
  canalAtual      String?        // vapi, whatsapp, sms, corretor
  resumoIa        String?
  dadosColetados  String?        // JSON estruturado do Blueprint
  tentativasVoz   Int            @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  interacoes      LeadInteracao[]
  
  @@index([organizationId, telefone])
  @@index([organizationId, score])
  @@index([organizationId, status])
}

model LeadInteracao {
  id          String   @id @default(cuid())
  leadId      String
  canal       String   // voz_vapi, whatsapp_aria, sms_twilio, humano_corretor
  direcao     String   // inbound, outbound
  conteudo    String?  // transcrição ou mensagem
  audioUrl    String?
  duracaoSeg  Int?
  createdAt   DateTime @default(now())

  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  @@index([leadId])
}
```
