# 🚀 Guia de Deploy em Produção & Nuvem Multi-Tenant

Este documento descreve como colocar o **LeadEngine (Insurance Lead Engine)** em produção na nuvem com banco de dados **PostgreSQL** gerenciado e infraestrutura multi-tenant escalável.

---

## 1. Topologia de Produção

```
                        [ Cliente / Navegador do Corretor ]
                                        │
                                        ▼ HTTPS
                            [ Vercel Edge / Node.js ]
                        Next.js 16 App Router (Next Engine)
                                        │
                       ┌────────────────┴────────────────┐
                       ▼                                 ▼
             [ Supabase / Neon ]                 [ Gateway WhatsApp ]
           PostgreSQL Multi-Tenant                Evolution API / Z-API
             Pooler (Porta 6543)                  (Speed-to-Lead < 30s)
```

---

## 2. Passo 1: Criando o Banco de Dados PostgreSQL

Recomendamos utilizar **Supabase** ou **Neon** (ambos possuem planos gratuitos com alta performance).

1. Crie um novo projeto no [Supabase](https://supabase.com) ou [Neon](https://neon.tech).
2. Na aba **Database / Connection Pooling**, copie a URI de conexão Transaction Pooler:
   ```env
   DATABASE_URL="postgresql://postgres.xxxx:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.xxxx:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
   ```

3. No projeto local ou no CI/CD, aponte para o schema PostgreSQL:
   ```bash
   # Aplica o schema PostgreSQL no banco de produção
   npx prisma db push --schema=./prisma/schema.postgresql.prisma
   ```

---

## 3. Passo 2: Configurando Variáveis de Ambiente na Vercel

No painel do projeto na [Vercel](https://vercel.com): **Settings > Environment Variables**:

| Variável | Valor de Exemplo | Finalidade |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres...pooler.supabase.com:6543/postgres?pgbouncer=true` | Conexão com PostgreSQL |
| `SESSION_SECRET` | `chave-secreta-forte-com-mais-de-32-caracteres-aleatorios-aqui` | Criptografia dos cookies de sessão (iron-session) |
| `NODE_ENV` | `production` | Modo de execução otimizado |
| `NEXT_PUBLIC_APP_URL`| `https://app.leadengine.com.br` | URL canônica do SaaS |
| `WHATSAPP_API_URL` | `https://api.suaevolution.com.br/` | Endpoint do Gateway WhatsApp |
| `WHATSAPP_API_KEY` | `sua-api-key-secreta` | Autenticação do WhatsApp Gateway |
| `WHATSAPP_INSTANCE`| `leadengine-prod` | Nome da instância conectada |
| `VAPI_API_KEY` | `vapi-token-opcional` | Chamadas de voz ativas (se contratado) |
| `VAPI_ASSISTANT_ID`| `assistant-id-opcional` | ID do assistente de voz Vapi |

---

## 4. Passo 3: Build & Deploy na Vercel

O projeto está 100% pronto para a Vercel com Turbopack:
```bash
# Build Command (padrão)
npm run build

# Output Directory (padrão)
.next
```

Caso queira usar o schema PostgreSQL automaticamente no build da Vercel, adicione no `package.json`:
```json
"scripts": {
  "build:prod": "prisma generate --schema=./prisma/schema.postgresql.prisma && next build"
}
```

---

## 5. Blindagem Multi-Tenant & LGPD

Todas as consultas e mutations na camada `/api/*` impõem estritamente:
```typescript
where: {
  organizationId: session.organizationId
}
```
* Uma corretora **nunca** tem acesso a leads, apólices, clientes ou templates de outro tenant.
* A URL pública de webhook de cada corretora possui token criptográfico individual (`/api/webhook/leads?token=org_id`).
* O tráfego de dados é 100% criptografado em trânsito com TLS 1.3 / HTTPS.
