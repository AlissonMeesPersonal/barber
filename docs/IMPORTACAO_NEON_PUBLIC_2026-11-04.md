# BarberFlow — Importação das tabelas públicas no Neon

Data de execução: 2026-11-04.

Destino: Neon `lingering-waterfall-93888162 / barberflow_db`. Origem: Supabase (ainda em produção).

## Copiado para `public` no Neon
- **18 tabelas físicas**, criadas a partir de `migration_preview` (snapshot anterior do Supabase), usando `LIKE ... INCLUDING ALL`.
- **32 / 32 linhas da cópia de preparação**, sem erros de lote.
- **38 índices** copiados.
- **30 chaves estrangeiras internas** adicionadas.
- **RLS habilitado em todas as 18 tabelas**.
- **0 políticas RLS de negócio** restauradas; acesso a todas as tabelas negado para papéis `anonymous` e `authenticated` (sem grants).
- **0 tabelas** legíveis por esses dois papéis na verificação pós-importação.
- **5 chaves estrangeiras para `auth.users` ainda não recriadas** em `public` (o Neon usa `neon_auth.user` e precisa de mapeamento dos 2 usuários). A ponte com identidades legadas está restrita à homologação.
- **2 objetos** do Supabase Storage inventariados anteriormente; *os arquivos binários ainda não foram transferidos*.

## Observação específica
A constraint `EXCLUDE` anti-sobreposição de agendamentos está presente em `public.appointments`; faltam bytes de 2 imagens do Storage e testar os fluxos CEO, gestor, cliente e agendamento.

## AVISO: NÃO É MIGRAÇÃO COMPLETA NEM AUTORIZAÇÃO PARA CUTOVER
O conteúdo importado foi extraído previamente da origem através do conector SQL, copiado ao schema privado `migration_staging`/`migration_preview` no Neon e agora restaurado no schema `public` do Neon. **Não é um `pg_dump/pg_restore` completo, consistente e testado**. O snapshot pode estar desatualizado mesmo se as contagens de linhas da origem não mudaram.

Ainda faltam:
- `pg_dump` completo/backup criptografado e teste de restore com cliente PostgreSQL e conexões diretas, fora deste fluxo SQL limitado.
- Sincronização final de dados na janela de corte.
- Auth real e recuperação de senha/MFA, redefinição segura de contas e migração das identidades.
- Recriação/revisão de policies, GRANTs, RPCs, funções, triggers, views e workflows.
- Arquivos do Storage com controles de acesso equivalentes e links ajustados.
- Testes E2E em Preview (login, leitura, escrita, segurança multi-tenant, integrações).
- Só após o funcionamento dos três sistemas no Neon e a remoção de todas as dependências do Supabase, desativar a integração cobrada no Vercel Marketplace.

**Não ligar esse banco à Vercel Production agora. O Supabase Pro NÃO foi cancelado.**