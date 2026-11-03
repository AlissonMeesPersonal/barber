# barber

Origem Supabase: `vfyydxrekgbwwybxkovh`.
Destino Neon: `lingering-waterfall-93888162` — base `barberflow_db`.

# Ambiente Neon criado — MIGRAÇÃO EM PREPARAÇÃO
Data: 2026-11-03. **NÃO ATIVAR EM PRODUÇÃO.**

- Região: `aws-sa-east-1` (São Paulo), PostgreSQL 17.11.
- Branch Neon: `main` **dentro do novo projeto de migração**; esta NÃO é a branch GitHub de produção.
- Neon Managed Better Auth: provisionado (em branco, sem importar usuários).
- Neon Data API: ativa, esquema exposto `public`, limite de 1000 linhas, `add_default_grants=false`; não conceder acesso a tabelas antes de revisar RLS.
- Compatibilidade de SQL verificada: existem `auth.uid()` e `auth.jwt()` neste Neon, **mas NÃO existe tabela `auth.users`**; o provedor de autenticação mantém tabelas em `neon_auth`. Corrigir FKs/funções e revalidar as políticas antes de inserir dados.
- Bancos de aplicação continuam vazios: nenhum dado de negócio ou objeto do Supabase foi ainda copiado.
- Plano Neon: organização `Alisson`, gratuito. Confirmar cotas e faturamento antes de cutover.
- Região não suporta Neon Object Storage nativo (verificado pela API); regiões disponíveis atualmente: aws-us-east-1, aws-us-east-2, aws-eu-central-1, aws-ap-southeast-1. Escolher provedor de objetos independente ou mudar a localização de destino em um novo projeto ANTES de copiar arquivos.
- Neon informa que senhas existentes de usuários Supabase não podem ser importadas diretamente no Managed Better Auth devido a formatos incompatíveis: implantar processo seguro de reativação/redefinição de senha, preservando autorização e mapeamento de IDs.
- Vercel Production, Supabase, chaves, bancos de origem e GitHub `main` permanecem inalterados.
- Antes de importar: gerar e verificar backups completos e seguros; revisar objetos `public`, `auth`, RLS, roles, triggers, cron, extensões; escolher storage e auth; preparar exportação/importação + validação.
- Antes do corte: testes em preview isolado e checklist de rollback, aprovação funcional e de segurança dos três sistemas.

Não versionar DATABASE_URL, chaves, senha, tokens, dumps ou informações pessoais.

## Requisitos próprios

Adaptar FKs de auth.users, políticas de isolamento por barbearia, login de 2 usuários, agendamentos e anexos.

**Arquivos:** 2 imagens públicas no bucket barber-branding; bucket barber-network-branding vazio. Neon Storage indisponível em São Paulo; escolher outro storage ou novo destino regional.
