# DESIGN_SYSTEM.md — Insurance Lead Engine

> **CONTRATO CANÔNICO CONSOLIDADO**: O contrato visual e a especificação de tokens agora vivem no arquivo canônico **[`DESIGN.md`](./DESIGN.md)** na raiz do repositório (**Coinbase Institutional Design System**), integrado à biblioteca em `design-system/`. O conteúdo abaixo é mantido integralmente para fins de rastreabilidade histórica e regras operacionais de cockpit.

> Traduz os "taste dials" e os clichês proibidos do `docs/00-product.md` (Brand Commitments) em tokens concretos. Este é o arquivo que qualquer agente de IA deve consultar antes de estilizar qualquer tela — nenhuma cor, fonte ou padrão de componente deve ser inventado fora daqui.

## Por que não usar os padrões default de IA
Como o produto é um cockpit financeiro para corretor de seguros — não uma landing page de startup — os padrões mais comuns de UI gerada por IA (fundo creme quente + serifada + acento terracota; SaaS-card-kit com cantos arredondados e sombra suave idêntica em tudo; eyebrow labels em caixa-alta; badges com "→" no final) soam genéricos e **contradizem diretamente** o brief: "rejeição expressa a clichês de IA" já está escrito no Product doc. Este documento existe para não deixar essa decisão à mercê do que o agente "acha bonito" na hora.

## 1. Paleta de cores (base — 6 tons nomeados)

| Token | Hex | Uso |
|---|---|---|
| `paper` | `#F5F6F4` | Fundo principal do conteúdo — off-white frio, não creme quente |
| `chrome` | `#1B2430` | Navegação lateral e cabeçalho — slate-navy profundo, não preto puro |
| `ink` | `#12181F` | Texto primário |
| `brand` | `#2F6F5E` | Acento único de marca/ação — verde-petróleo, não terracota nem azul genérico de SaaS |
| `signal-critical` | `#B3261E` | Risco iminente (renovação < 15 dias, SLA estourado) |
| `signal-warning` | `#C68A1E` | Atenção (renovação 15-30 dias) |

Regra: `signal-critical` e `signal-warning` são **exclusivos** para gravidade temporal — nunca usados como cor decorativa em outro contexto. `brand` é o único acento de ação (botões primários, links, foco).

## 2. Tipografia (2 famílias, papéis claramente distintos)

| Papel | Fonte | Onde |
|---|---|---|
| UI/copy | Inter ou IBM Plex Sans | Textos, labels, navegação |
| Dados numéricos | JetBrains Mono (`tabular-nums`) | Prêmios, comissões, scores, contadores de dias — já exigido no Product doc |

Sem fonte serifada, sem terceira família decorativa. Escala de tipo definida com pesos intencionais (não usar só `bold`/`normal` — usar 2-3 pesos com propósito claro: label, valor, título de seção).

## 3. Layout — conceito de cockpit, não de card kit

```
┌──────────┬────────────────────────────────────────────┐
│          │  [busca global]     [SLA ticker: 00:32]     │
│  CHROME  ├────────────────────────────────────────────┤
│  (nav)   │  Esteira de Leads                            │
│          │  ┌──────────────────────────────────────┐   │
│  Leads   │  │ nome | score | dias | canal | ação    │   │
│  Renov.  │  │ ──────────────────────────────────────│   │
│  Cockpit │  │ linha com barra de urgência embutida   │   │
│  Simul.  │  │ (não é badge separado — é parte da     │   │
│  Import. │  │  estrutura da própria linha)            │   │
│  Templ.  │  └──────────────────────────────────────┘   │
│  Config. │                                              │
└──────────┴────────────────────────────────────────────┘
```

Alinhamento: tabelas densas alinhadas à esquerda (texto) e à direita (números), nunca centralizado — é software de trabalho, não material de marketing. Sem cards com sombra repetidos; a hierarquia vem de peso tipográfico e da estrutura da tabela, não de decoração.

## 4. Princípios (o "porquê" por trás de cada escolha)

1. **Urgência é estrutura, não etiqueta**: dias até vencimento e SLA viram barra proporcional ou timeline dentro da própria linha da tabela — nunca só um badge colorido solto.
2. **Densidade com ritmo tipográfico**, não com espaço em branco vazio de preenchimento.
3. **Motion só em resposta a ação do usuário** (confirmar contato, expandir linha) — nunca animação decorativa de entrada de página ou hover em cada card.
4. **Um acento só** (`brand`) para ação; `signal-critical`/`signal-warning` reservados exclusivamente para gravidade temporal.
5. **Sem chrome genérico de IA**: nada de eyebrow label em caixa-alta, nada de "·" separando metadados, nada de seta "→" em botão.

## 5. Onde isso vira código
- `tailwind.config.ts` — cores e fonte mono já devem referenciar exatamente os tokens acima (ver arquivo atualizado)
- Antes de qualquer tela nova: o agente de IA deve citar qual token de cor/tipografia está usando e por quê, não inventar um hex novo

## 6. Validação antes de propagar
Construir **uma tela primeiro** (recomendado: `/dashboard/leads`, é a mais crítica) e revisar contra os 5 princípios acima antes de replicar o padrão nas outras 6 telas. Erro de direção detectado cedo custa 1 tela; detectado tarde custa reescrever 7.
